#![deny(warnings)]
use axum::{
    extract::{Path, Query}, http::{HeaderMap, StatusCode}, response::IntoResponse, routing::get, routing::post, Router
};


use dotenv::dotenv;

// use ngrok::config::ForwarderBuilder;
use reqwest::Client;
use std::collections::HashMap;
use std::net::SocketAddr;
// use url::Url;
use tower_http::cors::{Any, CorsLayer};
mod feldera;
mod pulse;
mod feed;

use crate::pulse::PulseError;
use tokio::sync::broadcast::Sender;

#[derive(Clone)]
struct AppState {
    http_client: Client,
    graph_node_subscription: Sender<Result<String, PulseError>>,
    graph_relationships_subscription: Sender<Result<String, PulseError>>,
    source_stats_subscription: Sender<Result<String, PulseError>>,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    dotenv().ok(); // This line loads the environment variables from the ".env" file.

    let client = Client::new();

    let cors = CorsLayer::new()
        .allow_origin(
            "http://localhost:3000"
                .parse::<hyper::http::HeaderValue>()
                .unwrap(),
        )
        .allow_methods([hyper::Method::POST])
        .allow_headers(Any);

    let graph_node_subscription =
        feldera::subscribe_change_stream(client.clone(), "graph_nodes", 4096);
    let graph_relationships_subscription =
        feldera::subscribe_change_stream(client.clone(), "graph_relationships", 4096);
    let source_stats_subscription =
        feldera::subscribe_change_stream(client.clone(), "source_summary", 4096);

    let state = AppState {
        http_client: client,
        graph_node_subscription,
        graph_relationships_subscription,
        source_stats_subscription,
    };

    // Create Axum app
    let app = Router::new()
        .route(
            "/api/{source_shortcode}/callback",
            post(feed::callback_post).get(callback_get),
        )
        .route("/api/nodes", get(pulse::node_updates))
        .route("/api/relationships", get(pulse::relationship_updates))
        .route("/api/graph", get(pulse::node_rel_updates))
        .route("/api/sourcestats", get(pulse::source_stats))
        .layer(cors)
        .with_state(state);

    // let ngrok_auth_token = std::env::var("NGROK_AUTHTOKEN").expect("NGROK_AUTHTOKEN must be set.");

    // Spawn Axum server
    let addr = SocketAddr::from(([127, 0, 0, 1], 4000));
    tokio::spawn(async move {
        axum::serve(tokio::net::TcpListener::bind(addr).await.unwrap(), app)
            .await
            .unwrap();
    });

    // Set up ngrok tunnel
    // let sess1 = ngrok::Session::builder()
    //     .authtoken(ngrok_auth_token)
    //     .connect()
    //     .await?;

    // let _listener = sess1
    //     .http_endpoint()
    //     .domain(STATIC_DOMAIN)
    //     .pooling_enabled(true)
    //     .listen_and_forward(Url::parse("http://localhost:3000").unwrap())
    //     .await?;

    // Wait indefinitely
    tokio::signal::ctrl_c().await?;
    Ok(())
}

async fn callback_get(
    Path(source_shortcode): Path<String>,
    headers: HeaderMap,
    Query(params): Query<HashMap<String, String>>,
) -> impl IntoResponse {
    println!("Callback received for source: {}", source_shortcode);
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
