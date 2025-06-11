use axum::{
    body::Bytes,
    extract::{Path, Query},
    response::IntoResponse,
};

use feed_rs::parser;
use hyper::{HeaderMap, StatusCode};
use reqwest::Client;
use std::{collections::HashMap, io::Cursor};

use crate::feldera::{FELDERA_HOST, PIPELINE_NAME};


pub(crate) async fn callback_get(
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

#[axum::debug_handler]
pub(crate) async fn callback_post(
    Path(source_shortcode): Path<String>,
    body: Bytes,
) -> Result<String, (StatusCode, String)> {
    let cursor = Cursor::new(body);
    let feed = parser::parse(cursor)
        .map_err(|e| (StatusCode::BAD_REQUEST, format!("Invalid feed: {}", e)))?;

    // Convert entries into NDJSON format for Feldera
    let mut ndjson_lines = Vec::new();
    for entry in &feed.entries {
        let title = entry
            .title
            .as_ref()
            .map(|t| &t.content)
            .ok_or((StatusCode::BAD_REQUEST, "Missing <title>".to_string()))?;

        let summary = entry
            .summary
            .as_ref()
            .map(|s| &s.content)
            .ok_or((StatusCode::BAD_REQUEST, "Missing <summary>".to_string()))?;

        let json_line = serde_json::json!({
            "insert": {
                "item_title": title,
                "item_description": summary,
                "source_shortcode": source_shortcode,
            }
        });
        println!("Json line: {json_line}");

        ndjson_lines.push(json_line.to_string());
    }

    let payload_body = ndjson_lines.join("\n");
    let client = Client::new();

    let post_url = format!(
        "{}/v0/pipelines/{}/ingress/source_data?format=json",
        &*FELDERA_HOST, &*PIPELINE_NAME
    );

    let resp = client
        .post(post_url)
        .header("Content-Type", "application/json")
        .body(payload_body)
        .send()
        .await
        .map_err(|e| (StatusCode::BAD_REQUEST, format!("Error sending data: {}", e)))?;

    if !resp.status().is_success() {
        return Err((
            StatusCode::BAD_REQUEST,
            format!("Downstream API error: {}", resp.status()),
        ));
    }
    
    Ok("Callback handled and data ingested successfully.".to_string())
}