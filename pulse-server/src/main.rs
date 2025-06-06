#![deny(warnings)]
use axum::{
    Json, Router, extract::Query, http::HeaderMap, http::StatusCode, response::IntoResponse,
    routing::get, routing::post,
};
use dotenv::dotenv;

use ngrok::config::ForwarderBuilder;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::net::SocketAddr;
use url::Url;
use tower_http::cors::{CorsLayer, Any};
mod feldera;
mod stats;
use tokio::sync::broadcast::Sender;
use crate::stats::PulseError;

const HUB_URL: &str = "https://pubsubhubbub.appspot.com/subscribe";
const STATIC_DOMAIN: &str = "terminally-uncommon-quail.ngrok-free.app";

#[derive(Clone)]
struct AppState {
    http_client: Client,
    graph_node_subscription: Sender<Result<String, PulseError>>,
    graph_relationships_subscription: Sender<Result<String, PulseError>>,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    dotenv().ok(); // This line loads the environment variables from the ".env" file.

    let client = Client::new();

    let cors = CorsLayer::new()
        .allow_origin("http://localhost:3000".parse::<hyper::http::HeaderValue>().unwrap())
        .allow_methods([hyper::Method::POST])
        .allow_headers(Any);

    let graph_node_subscription = feldera::subscribe_change_stream(client.clone(), "graph_nodes", 4096);
    let graph_relationships_subscription = feldera::subscribe_change_stream(client.clone(), "graph_relationships", 4096);

    let state = AppState {
        http_client: client,
        graph_node_subscription,
        graph_relationships_subscription
    };

    // Create Axum app
    let app = Router::new()
        .route("/callback", get(callback_get).post(callback_post))
        .route("/setup", post(setup_handler))
        .route("/api/nodes", get(stats::node_updates))
        .route("/api/relationships", get(stats::relationship_updates))
        .route("/api/graph", get(stats::node_rel_updates))
        .layer(cors)
        .with_state(state);

    let ngrok_auth_token = std::env::var("NGROK_AUTHTOKEN").expect("NGROK_AUTHTOKEN must be set.");

    // Spawn Axum server
    let addr = SocketAddr::from(([127, 0, 0, 1], 4000));
    tokio::spawn(async move {
        axum::serve(tokio::net::TcpListener::bind(addr).await.unwrap(), app)
            .await
            .unwrap();
    });

    // Set up ngrok tunnel
    let sess1 = ngrok::Session::builder()
        .authtoken(ngrok_auth_token)
        .connect()
        .await?;

    let _listener = sess1
        .http_endpoint()
        .domain(STATIC_DOMAIN)
        .pooling_enabled(true)
        .listen_and_forward(Url::parse("http://localhost:3000").unwrap())
        .await?;

    // Wait indefinitely
    tokio::signal::ctrl_c().await?;
    Ok(())
}

async fn callback_get(
    headers: HeaderMap,
    Query(params): Query<HashMap<String, String>>,
) -> impl IntoResponse {
    println!("Get request");
    // Print headers
    for (key, value) in headers.iter() {
        println!("Header: {}: {:?}", key, value);
    }
    // Print query parameters
    for (key, value) in params.iter() {
        println!("Query param: {} = {}", key, value);
    }

    if let Some(challenge) = params.get("hub.challenge") {
        (StatusCode::OK, challenge.clone())
    } else {
        (
            StatusCode::BAD_REQUEST,
            "Missing hub.challenge parameter".to_string(),
        )
    }
}

async fn callback_post(headers: HeaderMap, body: String) -> impl IntoResponse {
    println!("POST request");
    // Print headers
    for (key, value) in headers.iter() {
        println!("Header: {}: {:?}", key, value);
    }
    // Print body
    println!("Body: {}", body);

    "OK"
}

#[derive(Deserialize)]
struct SetupYoutubeFeed {
    channel_handle: String,
    mode: String,
}

#[derive(Serialize)]
struct ResponseMessage {
    status: String,
    message: String,
}
async fn setup_handler(Json(payload): Json<SetupYoutubeFeed>) -> Json<ResponseMessage> {
    let client = Client::new();

    let youtube_api_token = std::env::var("GOOGLE_API_KEY")
        .expect("GOOGLE_API_KEY must be set.");

    // Step 1: Resolve YouTube Channel ID from handle
    let search_url = format!(
        "https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q={}&key={}",
        payload.channel_handle, youtube_api_token
    );

    let search_response = match client.get(&search_url).send().await {
        Ok(res) => res,
        Err(err) => {
            return Json(ResponseMessage {
                status: "error".to_string(),
                message: format!("YouTube API request failed: {}", err),
            });
        }
    };

    let json_result = search_response.json::<serde_json::Value>().await;
    let channel_id = match json_result {
        Ok(json) => {
            println!("{}", serde_json::to_string(&json).unwrap());
            
            json["items"]
            .get(0)
            .and_then(|item| item["id"]["channelId"].as_str())
            .map(|s| s.to_string())
        },
        Err(err) => {
            return Json(ResponseMessage {
                status: "error".to_string(),
                message: format!("Failed to parse YouTube API response: {}", err),
            });
        }
    };

    let channel_id = match channel_id {
        Some(id) => id,
        None => {
            return Json(ResponseMessage {
                status: "error".to_string(),
                message: format!(
                    "Could not find a channel ID for handle '{}'",
                    payload.channel_handle
                ),
            });
        }
    };

    // Step 2: Construct topic URL for PubSubHubbub
    let topic_url = format!(
        "https://www.youtube.com/feeds/videos.xml?channel_id={}",
        channel_id
    );

    let subscribe_request_body = HashMap::from([
        (
            "hub.callback".to_string(),
            format!("https://{}/callback", STATIC_DOMAIN),
        ),
        ("hub.topic".to_string(), topic_url.clone()),
        ("hub.mode".to_string(), payload.mode.clone()),
    ]);

    // Step 3: Send subscription request to the hub
    let result = client
        .post(HUB_URL)
        .form(&subscribe_request_body)
        .send()
        .await;

    match result {
        Ok(response) => Json(ResponseMessage {
            status: "success".to_string(),
            message: format!(
                "Sent {} request for {}. Hub responded with {}",
                payload.mode,
                topic_url,
                response.status()
            ),
        }),
        Err(err) => Json(ResponseMessage {
            status: "error".to_string(),
            message: format!("Failed to subscribe: {}", err),
        }),
    }
}


// async fn setup_handler(Json(payload): Json<SetupYoutubeFeed>) -> Json<ResponseMessage> {
//     let client = Client::new();

//     let youtube_api_token = std::env::var("GOOGLE_API_KEY").expect("GOOGLE_API_KEY must be set.");

//     // Lookup channel ID using YouTube Data API
//     let search_url = format!(
//         "https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q={}&key={}",
//         payload.channel_handle, youtube_api_token
//     );

//     let search_response = client
//         .get(&search_url)
//         .send()
//         .await;

//     let channel_id_result = match search_response {
//         Ok(res) => {
//             let json = res.json::<serde_json::Value>().await;
//             match json {
//                 Ok(val) => val["items"]
//                     .get(0)
//                     .and_then(|item| item["id"]["channelId"].as_str())
//                     .map(|s| s.to_string()),
//                 Err(_) => None,
//             }
//         }
//         Err(_) => None,
//     };

//     let channel_id_msg = if let Some(channel_id) = &channel_id_result {
//         format!("Resolved channel ID: {}", channel_id)
//     } else {
//         "Failed to resolve channel ID".to_string()
//     };



//     // https://developers.google.com/youtube/v3/guides/push_notifications
//     let topic_url = format!("https://www.youtube.com/feeds/videos.xml?channel_id={}", channel_id);


//     let subscribe_request_body = HashMap::from([
//         (
//             "hub.callback",
//             format!("https://{}/callback", STATIC_DOMAIN),
//         ),
//         ("hub.topic", topic_url.to_string()),
//         ("hub.mode", payload.mode.to_string()),
//     ]);

//     let result = client
//         .post(HUB_URL)
//         .form(&subscribe_request_body)
//         .send()
//         .await;

//     match result {
//         Ok(response) => Json(ResponseMessage {
//             status: "success".to_string(),
//             message: format!(
//                 "Sent {} request for {}. Hub responded with {}",
//                 payload.mode,
//                 topic_url,
//                 response.status()
//             ),
//         }),
//         Err(err) => Json(ResponseMessage {
//             status: "error".to_string(),
//             message: format!("Failed to subscribe: {}", err),
//         }),
//     }
// }
