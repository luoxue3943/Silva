use crate::error::AppResult;
use crate::modules::comment::dto::{
    CommentListQuery, CreateArticleCommentRequest, CreateSiteCommentRequest,
};
use crate::modules::comment::service;
use crate::response::ApiResponse;
use crate::state::AppState;
use actix_web::{web, HttpResponse};

pub async fn list_site_comments(
    state: web::Data<AppState>,
    query: web::Query<CommentListQuery>,
) -> AppResult<HttpResponse> {
    let page = service::list_site_comments(&state.db, query.into_inner()).await?;

    Ok(HttpResponse::Ok().json(ApiResponse::success(page)))
}

pub async fn list_article_comments(
    state: web::Data<AppState>,
    query: web::Query<CommentListQuery>,
) -> AppResult<HttpResponse> {
    let page = service::list_article_comments(&state.db, query.into_inner()).await?;

    Ok(HttpResponse::Ok().json(ApiResponse::success(page)))
}

pub async fn create_site_comment(
    state: web::Data<AppState>,
    request: web::Json<CreateSiteCommentRequest>,
) -> AppResult<HttpResponse> {
    let comment = service::create_site_comment(
        &state.db,
        request.into_inner(),
        state.config.default_comment_location.clone(),
    )
    .await?;

    Ok(HttpResponse::Ok().json(ApiResponse::success(comment)))
}

pub async fn create_article_comment(
    state: web::Data<AppState>,
    request: web::Json<CreateArticleCommentRequest>,
) -> AppResult<HttpResponse> {
    let comment = service::create_article_comment(
        &state.db,
        request.into_inner(),
        state.config.default_comment_location.clone(),
    )
    .await?;

    Ok(HttpResponse::Ok().json(ApiResponse::success(comment)))
}
