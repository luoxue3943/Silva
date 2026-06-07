use crate::error::AppResult;
use crate::modules::project::service;
use crate::response::ApiResponse;
use crate::state::AppState;
use actix_web::{web, HttpResponse};

pub async fn list_projects(state: web::Data<AppState>) -> AppResult<HttpResponse> {
    let projects = service::list_projects(&state.db).await?;

    Ok(HttpResponse::Ok().json(ApiResponse::success(projects)))
}
