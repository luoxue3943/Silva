use crate::response::ApiResponse;
use actix_web::{web, HttpResponse};
use serde::Serialize;

#[derive(Serialize)]
struct HealthResponse {
    status: &'static str,
}

async fn health() -> HttpResponse {
    HttpResponse::Ok().json(ApiResponse::success(HealthResponse { status: "ok" }))
}

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.route("/health", web::get().to(health));
}
