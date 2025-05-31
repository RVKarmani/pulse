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

// const HUB_URL: &str = "https://pubsubhubbub.appspot.com/subscribe";
const STATIC_DOMAIN: &str = "terminally-uncommon-quail.ngrok-free.app";

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    dotenv().ok(); // This line loads the environment variables from the ".env" file.
    // Create Axum app
    let app = Router::new()
        .route("/callback", get(callback_get).post(callback_post))
        .route("/setup", post(setup_handler));

    let ngrok_auth_token = std::env::var("NGROK_AUTHTOKEN").expect("NGROK_AUTHTOKEN must be set.");

    // Spawn Axum server
    let addr = SocketAddr::from(([127, 0, 0, 1], 3000));
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
struct SetupFeed {
    topic_url: String,
    hub_url: String,
    mode: String,
}

#[derive(Serialize)]
struct ResponseMessage {
    status: String,
    message: String,
}

async fn setup_handler(Json(payload): Json<SetupFeed>) -> Json<ResponseMessage> {
    let client = Client::new();

    let subscribe_request_body = HashMap::from([
        (
            "hub.callback",
            format!("https://{}/callback", STATIC_DOMAIN),
        ),
        ("hub.topic", payload.topic_url.to_string()),
        ("hub.mode", payload.mode.to_string()),
    ]);

    let result = client
        .post(payload.hub_url)
        .form(&subscribe_request_body)
        .send()
        .await;

    match result {
        Ok(response) => Json(ResponseMessage {
            status: "success".to_string(),
            message: format!(
                "Sent {} request for {}. Hub responded with {}",
                payload.mode,
                payload.topic_url,
                response.status()
            ),
        }),
        Err(err) => Json(ResponseMessage {
            status: "error".to_string(),
            message: format!("Failed to subscribe: {}", err),
        }),
    }
}
