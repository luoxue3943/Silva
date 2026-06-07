use crate::error::AppResult;
use crate::modules::stats::dto::VisitRequest;
use crate::modules::stats::service;
use crate::response::ApiResponse;
use crate::state::AppState;
use actix_web::{web, HttpResponse};

/// 处理站点统计读取请求 / Handles site stats read requests.
pub async fn get_stats(state: web::Data<AppState>) -> AppResult<HttpResponse> {
    let stats = service::get_stats(&state.db, &state.redis, &state.config).await?;

    Ok(HttpResponse::Ok().json(ApiResponse::success(stats)))
}

/// 处理访问记录请求 / Handles visit recording requests.
pub async fn record_visit(
    state: web::Data<AppState>,
    request: web::Json<VisitRequest>,
) -> AppResult<HttpResponse> {
    let stats =
        service::record_visit(&state.db, &state.redis, &state.config, request.into_inner()).await?;

    Ok(HttpResponse::Ok().json(ApiResponse::success(stats)))
}
