use crate::error::AppResult;
use crate::modules::post::dto::PostListQuery;
use crate::modules::post::service;
use crate::response::ApiResponse;
use crate::state::AppState;
use actix_web::{web, HttpResponse};

/// 处理文章列表请求 / Handles post list requests.
pub async fn list_posts(
    state: web::Data<AppState>,
    query: web::Query<PostListQuery>,
) -> AppResult<HttpResponse> {
    let page = service::list_posts(&state.db, query.into_inner()).await?;

    Ok(HttpResponse::Ok().json(ApiResponse::success(page)))
}

/// 处理时间线文章列表请求 / Handles timeline post list requests.
pub async fn list_timeline_posts(
    state: web::Data<AppState>,
    query: web::Query<PostListQuery>,
) -> AppResult<HttpResponse> {
    let mut query = query.into_inner();
    query.category = None;
    let page = service::list_posts(&state.db, query).await?;

    Ok(HttpResponse::Ok().json(ApiResponse::success(page)))
}

/// 处理文章详情请求 / Handles post detail requests.
pub async fn get_post(state: web::Data<AppState>, path: web::Path<i64>) -> AppResult<HttpResponse> {
    let post = service::get_post(&state.db, path.into_inner()).await?;

    Ok(HttpResponse::Ok().json(ApiResponse::success(post)))
}
