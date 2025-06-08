use axum::{body::Bytes};

use feed_rs::parser;
use hyper::StatusCode;
use std::io::Cursor;


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