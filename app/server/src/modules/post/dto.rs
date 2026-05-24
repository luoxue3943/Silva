use crate::modules::post::model::PostRecord;
use crate::utils::time::{optional_timestamp_millis, timestamp_millis};
use serde::{Deserialize, Serialize};

/// 文章列表查询参数 / Post list query parameters.
#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PostListQuery {
    pub page: Option<String>,
    pub page_size: Option<String>,
    pub category: Option<String>,
}

/// 对外返回的文章数据 / Post data returned to clients.
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
    /// 将数据库文章记录转换为接口 DTO / Converts a database post record into an API DTO.
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
