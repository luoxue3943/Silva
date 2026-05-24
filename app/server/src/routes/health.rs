use crate::response::ApiResponse;
use actix_web::{web, HttpResponse};
use serde::Serialize;

/// 健康检查响应 / Health-check response.
#[derive(Serialize)]
struct HealthResponse {
    status: &'static str,
}

/// 返回服务健康状态 / Returns service health status.
async fn health() -> HttpResponse {
    HttpResponse::Ok().json(ApiResponse::success(HealthResponse { status: "ok" }))
}

/// 注册健康检查路由 / Registers health-check routes.
pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.route("/health", web::get().to(health));
}
