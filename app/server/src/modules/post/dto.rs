use crate::modules::post::model::PostRecord;
use crate::utils::time::{optional_timestamp_millis, timestamp_millis};
use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PostListQuery {
    pub page: Option<String>,
    pub page_size: Option<String>,
    pub category: Option<String>,
}

#[derive(Serialize)]
pub struct PostDto {
    pub id: i64,
    pub title: String,
    pub category: Option<String>,
    pub storage_path: String,
    pub views: i64,
    pub created_at: i64,
    pub updated_at: Option<i64>,
    pub deleted_at: Option<i64>,
}

impl From<PostRecord> for PostDto {
    fn from(post: PostRecord) -> Self {
        Self {
            id: post.id,
            title: post.title,
            category: post.category,
            storage_path: post.storage_path,
            views: post.views,
            created_at: timestamp_millis(post.created_at),
            updated_at: optional_timestamp_millis(post.updated_at),
            deleted_at: optional_timestamp_millis(post.deleted_at),
        }
    }
}
