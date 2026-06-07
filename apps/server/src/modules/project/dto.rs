use crate::modules::project::model::ProjectRecord;
use crate::utils::time::{optional_timestamp_millis, timestamp_millis};
use serde::Serialize;

#[derive(Serialize)]
pub struct ProjectDto {
    pub id: i64,
    pub name: String,
    pub summary: String,
    pub link: String,
    pub sort_order: i32,
    pub created_at: i64,
    pub updated_at: Option<i64>,
    pub deleted_at: Option<i64>,
}

impl From<ProjectRecord> for ProjectDto {
    fn from(project: ProjectRecord) -> Self {
        Self {
            id: project.id,
            name: project.name,
            summary: project.summary,
            link: project.link,
            sort_order: project.sort_order,
            created_at: timestamp_millis(project.created_at),
            updated_at: optional_timestamp_millis(project.updated_at),
            deleted_at: optional_timestamp_millis(project.deleted_at),
        }
    }
}
