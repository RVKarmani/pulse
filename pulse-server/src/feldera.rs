//! Helper functions for the Feldera API

use std::io;
use std::time::Duration;

use crate::pulse::PulseError;
use once_cell::sync::Lazy;
use futures::{StreamExt, TryStreamExt};
use log::{error, warn};
use reqwest::Client;
use serde_json::Value;
use tokio::sync::broadcast::Sender;
use dotenv::dotenv;

// Load .env only once globally at runtime
pub static PIPELINE_NAME: Lazy<String> = Lazy::new(|| {
    dotenv().ok(); // Loads .env into std::env
    std::env::var("FELDERA_PIPELINE_NAME").expect("FELDERA_PIPELINE_NAME must be set.")
});

pub static FELDERA_HOST: Lazy<String> = Lazy::new(|| {
    dotenv().ok();
    std::env::var("FELDERA_HOST").expect("FELDERA_HOST must be set.")
});


pub(crate) async fn adhoc_query(client: Client, sql: &str) -> Result<String, PulseError> {
    let url = format!("{}/v0/pipelines/{}/query", &*FELDERA_HOST, &*PIPELINE_NAME);
    print!("{url}");
    let response = client
        .get(url)
        .query(&[("sql", sql), ("format", "json")])
        .send()
        .await
        .map_err(PulseError::from)?;

    if !response.status().is_success() {
        return Err(PulseError::from(format!(
            "Failed to fetch data: HTTP {}: {:?}",
            response.status(),
            response.text().await.unwrap_or_else(|e| e.to_string())
        )));
    }

    let body = response.text().await.map_err(PulseError::from)?;

    Ok(body)
}

// Parses feldera change format inside of json_data
// `{"sequence_number": ...,"json_data":[{"delete": {...} },{"insert": {...} }]}`
#[derive(serde::Deserialize)]
#[allow(dead_code)]
enum Change {
    #[serde(rename = "insert")]
    Insert(Value),
    #[serde(rename = "delete")]
    Delete(Value),
}

/// Parses a record from the feldera change stream.
#[derive(serde::Deserialize)]
#[allow(dead_code)]
struct Record {
    sequence_number: i64,
    json_data: Option<Vec<Change>>,
}

pub(crate) fn subscribe_change_stream(
    client: Client,
    view_name: &str,
    capacity: usize,
) -> Sender<Result<String, PulseError>> {
    let (tx, _) = tokio::sync::broadcast::channel(capacity);
    let subscribe = tx.clone();
    let url = format!(
        "{}/v0/pipelines/{}/egress/{view_name}",&*FELDERA_HOST, &*PIPELINE_NAME);
    let view = String::from(view_name);

    tokio::spawn(async move {
        loop {
            let response = client
                .post(url.clone())
                .header("Content-Type", "application/json")
                .query(&[
                    ("format", "json"),
                    ("backpressure", "false"),
                    ("array", "false"),
                ])
                .send()
                .await;

            match response {
                Ok(resp) if resp.status().is_success() => {
                    let stream = resp
                        .bytes_stream()
                        .map_err(|e| io::Error::new(io::ErrorKind::Other, e));
                    let reader = tokio_util::io::StreamReader::new(stream);
                    let mut decoder = tokio_util::codec::FramedRead::new(
                        reader,
                        tokio_util::codec::LinesCodec::new(),
                    );

                    while let Some(line) = decoder.next().await {
                        match line {
                            Ok(line) => {
                                //log::debug!("Received change: {line}");
                                match serde_json::from_str::<Record>(&line) {
                                    Ok(record) => {
                                        // walk record.json_data in reverse and return first `insert`
                                        'inner: for change in
                                            record.json_data.unwrap_or_else(|| vec![]).iter().rev()
                                        {
                                            if let Change::Insert(value) = change {
                                                let mut value_str = value.to_string();
                                                value_str.push('\n');
                                                //log::debug!("broadcasting change: {value_str}");
                                                if tx.send(Ok(value_str)).is_err() {
                                                    // A send operation can only fail if there are no active receivers,
                                                    // implying that the message could never be received.
                                                    // The error contains the message being sent as a payload so it can be recovered.
                                                    break 'inner;
                                                }
                                            }
                                        }
                                    }
                                    Err(e) => {
                                        error!("Failed to parse change record from {view}: {}", e);
                                        break;
                                    }
                                }
                            }
                            Err(e) => {
                                error!("Failed to decode line from {view}: {:?}", e);
                                let _ = tx.send(Err(PulseError::from(e)));
                                break;
                            }
                        }
                    }
                }
                _ => {
                    error!("Failed to fetch change stream at {url}: {:?}", response);
                    let _ = tx.send(Err(PulseError::from("Failed to fetch change stream")));
                }
            }

            warn!("Lost connection to change stream at {url}, wait 10 seconds before retrying to get changes again");
            tokio::time::sleep(Duration::from_secs(10)).await;
        }
    });

    subscribe
}
