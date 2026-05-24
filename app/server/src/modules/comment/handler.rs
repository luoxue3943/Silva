use crate::error::AppResult;
use crate::modules::comment::dto::{
    CommentListQuery, CreateArticleCommentRequest, CreateSiteCommentRequest,
};
use crate::modules::comment::location;
use crate::modules::comment::service;
use crate::response::ApiResponse;
use crate::state::AppState;
use actix_web::{web, HttpRequest, HttpResponse};

/// 处理站点留言列表请求 / Handles site comment list requests.
pub async fn list_site_comments(
    state: web::Data<AppState>,
    query: web::Query<CommentListQuery>,
) -> AppResult<HttpResponse> {
    let page = service::list_site_comments(&state.db, query.into_inner()).await?;

    Ok(HttpResponse::Ok().json(ApiResponse::success(page)))
}

/// 处理文章评论列表请求 / Handles article comment list requests.
pub async fn list_article_comments(
    state: web::Data<AppState>,
    query: web::Query<CommentListQuery>,
) -> AppResult<HttpResponse> {
    let page = service::list_article_comments(&state.db, query.into_inner()).await?;

    Ok(HttpResponse::Ok().json(ApiResponse::success(page)))
}

/// 处理站点留言创建请求 / Handles site comment creation requests.
pub async fn create_site_comment(
    state: web::Data<AppState>,
    http_request: HttpRequest,
    request: web::Json<CreateSiteCommentRequest>,
) -> AppResult<HttpResponse> {
    let location = location::resolve_comment_location(&http_request, &state.config).await;
    let comment = service::create_site_comment(&state.db, request.into_inner(), location).await?;

    Ok(HttpResponse::Ok().json(ApiResponse::success(comment)))
}

/// 处理文章评论创建请求 / Handles article comment creation requests.
pub async fn create_article_comment(
    state: web::Data<AppState>,
    http_request: HttpRequest,
    request: web::Json<CreateArticleCommentRequest>,
) -> AppResult<HttpResponse> {
    let location = location::resolve_comment_location(&http_request, &state.config).await;
    let comment =
        service::create_article_comment(&state.db, request.into_inner(), location).await?;

    Ok(HttpResponse::Ok().json(ApiResponse::success(comment)))
}
