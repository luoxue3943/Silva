use crate::error::AppResult;
use crate::modules::murmur::dto::MurmurListQuery;
use crate::modules::murmur::service;
use crate::response::ApiResponse;
use crate::state::AppState;
use actix_web::{web, HttpResponse};

pub async fn list_murmurs(
    state: web::Data<AppState>,
    query: web::Query<MurmurListQuery>,
) -> AppResult<HttpResponse> {
    let page = service::list_murmurs(&state.db, query.into_inner()).await?;

    Ok(HttpResponse::Ok().json(ApiResponse::success(page)))
}
