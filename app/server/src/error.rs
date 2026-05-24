use crate::response::ApiResponse;
use actix_web::http::StatusCode;
use actix_web::{HttpResponse, ResponseError};
use serde_json::Value;

/// 应用统一 Result 类型 / Unified application Result type.
pub type AppResult<T> = Result<T, AppError>;

/// 应用错误类型 / Application error type.
#[derive(Debug, thiserror::Error)]
pub enum AppError {
    #[error("{0}")]
    BadRequest(String),
    #[error("{0}")]
    NotFound(String),
    #[error("database error: {0}")]
    Database(#[from] sqlx::Error),
    #[error("redis error: {0}")]
    Redis(#[from] redis::RedisError),
    #[error("{0}")]
    Internal(String),
}

impl AppError {
    /// 返回可暴露给客户端的错误消息 / Returns the error message that can be exposed to clients.
    fn public_message(&self) -> String {
        match self {
            Self::BadRequest(message) | Self::NotFound(message) | Self::Internal(message) => {
                message.clone()
            }
            Self::Database(_) => "Database request failed".to_owned(),
            Self::Redis(_) => "Redis request failed".to_owned(),
        }
    }
}

impl ResponseError for AppError {
    /// 将应用错误映射为 HTTP 状态码 / Maps application errors to HTTP status codes.
    fn status_code(&self) -> StatusCode {
        match self {
            Self::BadRequest(_) => StatusCode::BAD_REQUEST,
            Self::NotFound(_) => StatusCode::NOT_FOUND,
            Self::Database(_) | Self::Redis(_) | Self::Internal(_) => {
                StatusCode::INTERNAL_SERVER_ERROR
            }
        }
    }

    /// 构建统一 JSON 错误响应 / Builds the unified JSON error response.
    fn error_response(&self) -> HttpResponse {
        let status = self.status_code();

        HttpResponse::build(status).json(ApiResponse::error(
            status.as_u16(),
            self.public_message(),
            Value::Null,
        ))
    }
}
