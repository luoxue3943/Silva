use crate::error::AppResult;
use crate::modules::project::dto::ProjectDto;
use crate::modules::project::repo;
use sqlx::PgPool;

pub async fn list_projects(db: &PgPool) -> AppResult<Vec<ProjectDto>> {
    let projects = repo::list_projects(db).await?;

    Ok(projects.into_iter().map(ProjectDto::from).collect())
}
