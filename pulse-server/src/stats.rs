use std::fmt::Display;
use std::io;

use axum::extract::State;
use axum::{body::Body, response::IntoResponse, response::Response};
use futures::StreamExt;
use log::debug;
use serde::de::StdError;
use tokio::sync::broadcast::error::SendError;
use tokio_util::codec::LinesCodecError;

use crate::feldera::adhoc_query;
use crate::AppState;

#[derive(Clone, Debug)]
pub(crate) struct PulseError {
    message: String,
}

impl Display for PulseError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.message)
    }
}

impl From<io::Error> for PulseError {
    fn from(e: io::Error) -> Self {
        PulseError {
            message: e.to_string(),
        }
    }
}

impl From<SendError<Result<String, Self>>> for PulseError {
    fn from(e: SendError<Result<String, Self>>) -> Self {
        PulseError {
            message: e.to_string(),
        }
    }
}

impl From<LinesCodecError> for PulseError {
    fn from(e: LinesCodecError) -> Self {
        PulseError {
            message: e.to_string(),
        }
    }
}

impl From<&str> for PulseError {
    fn from(e: &str) -> Self {
        PulseError {
            message: e.to_string(),
        }
    }
}

impl From<String> for PulseError {
    fn from(e: String) -> Self {
        PulseError { message: e }
    }
}

impl From<reqwest::Error> for PulseError {
    fn from(e: reqwest::Error) -> Self {
        PulseError {
            message: e.to_string(),
        }
    }
}

impl StdError for PulseError {
    fn source(&self) -> Option<&(dyn StdError + 'static)> {
        None
    }
}

pub(crate) async fn node_updates(State(state): State<AppState>) -> impl IntoResponse {
    let initial_data = adhoc_query(state.http_client, "SELECT * FROM graph_nodes").await;

    if let Err(e) = initial_data {
        return Response::builder()
            .status(500)
            .body(Body::from(format!(
                "{{\"error\": \"{}\"}}",
                e.to_string().trim()
            )))
            .unwrap();
    }

    let initial_stream = futures::stream::once(async move { initial_data });

    let change_stream_rx = state.graph_node_subscription.subscribe();
    let change_stream = tokio_stream::wrappers::BroadcastStream::new(change_stream_rx);
    let stream = initial_stream.chain(change_stream.filter_map(|result| async move {
        match result {
            Ok(value) => Some(value),
            Err(e) => {
                debug!("BroadcastStream error: {:?}", e);
                None // Discard errors
            }
        }
    }));

    Response::builder()
        .status(200)
        .header("Content-Type", "application/json")
        .header("Transfer-Encoding", "chunked")
        .body(Body::from_stream(stream))
        .unwrap()
}



pub(crate) async fn relationship_updates(State(state): State<AppState>) -> impl IntoResponse {
    let initial_data = adhoc_query(state.http_client, "SELECT * FROM graph_relationships").await;

    if let Err(e) = initial_data {
        return Response::builder()
            .status(500)
            .body(Body::from(format!(
                "{{\"error\": \"{}\"}}",
                e.to_string().trim()
            )))
            .unwrap();
    }

    let initial_stream = futures::stream::once(async move { initial_data });

    let change_stream_rx = state.graph_relationships_subscription.subscribe();
    let change_stream = tokio_stream::wrappers::BroadcastStream::new(change_stream_rx);
    let stream = initial_stream.chain(change_stream.filter_map(|result| async move {
        match result {
            Ok(value) => Some(value),
            Err(e) => {
                debug!("BroadcastStream error: {:?}", e);
                None // Discard errors
            }
        }
    }));

    Response::builder()
        .status(200)
        .header("Content-Type", "application/json")
        .header("Transfer-Encoding", "chunked")
        .body(Body::from_stream(stream))
        .unwrap()
}


pub(crate) async fn node_rel_updates(State(state): State<AppState>) -> impl IntoResponse {
    let initial_node_data = adhoc_query(state.http_client.clone(), "SELECT * FROM graph_nodes").await;

    if let Err(e) = initial_node_data {
        return Response::builder()
            .status(500)
            .body(Body::from(format!(
                "{{\"error\": \"{}\"}}",
                e.to_string().trim()
            )))
            .unwrap();
    }

    let initial_rel_data = adhoc_query(state.http_client.clone(), "SELECT * FROM graph_relationships").await;

    if let Err(e) = initial_rel_data {
        return Response::builder()
            .status(500)
            .body(Body::from(format!(
                "{{\"error\": \"{}\"}}",
                e.to_string().trim()
            )))
            .unwrap();
    }

    let initial_node_stream = futures::stream::once(async move { initial_node_data });
    let initial_rel_stream = futures::stream::once(async move { initial_rel_data });
    
    let initial_stream = initial_node_stream.chain(initial_rel_stream);


    // Change streams
    let node_change_stream_rx = state.graph_node_subscription.subscribe();
    let node_change_stream = tokio_stream::wrappers::BroadcastStream::new(node_change_stream_rx).filter_map(|result| async move {
        match result {
            Ok(value) => Some(value),
            Err(e) => {
                debug!("BroadcastStream error: {:?}", e);
                None // Discard errors
            }
        }
    });

    let rel_change_stream_rx = state.graph_relationships_subscription.subscribe();
    let rel_change_stream = tokio_stream::wrappers::BroadcastStream::new(rel_change_stream_rx).filter_map(|result| async move {
        match result {
            Ok(value) => Some(value),
            Err(e) => {
                debug!("BroadcastStream error: {:?}", e);
                None // Discard errors
            }
        }
    });

    let combined_filtered_stream = tokio_stream::StreamExt::merge(node_change_stream, rel_change_stream);

    let final_stream = initial_stream.chain(combined_filtered_stream);

    Response::builder()
        .status(200)
        .header("Content-Type", "application/json")
        .header("Transfer-Encoding", "chunked")
        .body(Body::from_stream(final_stream))
        .unwrap()
}

