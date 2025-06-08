use axum::{body::Bytes, extract::{Path, Query}, response::IntoResponse};

use feed_rs::parser;
use hyper::{HeaderMap, StatusCode};
use std::{collections::HashMap, io::Cursor};

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
pub(crate) async fn callback_post(body: Bytes) -> Result<String, (StatusCode, String)> {
    let cursor = Cursor::new(body);
    let feed = parser::parse(cursor)
        .map_err(|e| (StatusCode::BAD_REQUEST, format!("Invalid feed: {}", e)))?;
    let results: Result<Vec<String>, _> = feed.entries.iter().map(|entry| {
        let title = entry.title
            .as_ref()
            .map(|t| &t.content)
            .ok_or((StatusCode::BAD_REQUEST, "Missing <title>".to_string()))?;

        let summary = entry.summary
            .as_ref()
            .map(|s| &s.content)
            .ok_or((StatusCode::BAD_REQUEST, "Missing <summary>".to_string()))?;

        let formatted = format!("Title: {}\nSummary: {}\n", title, summary);
        println!("{}", formatted);

        Ok(formatted)
    }).collect();

    Ok(results?.join("\n"))
}