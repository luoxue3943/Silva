use crate::modules::comment::model::CommentRecord;
use crate::utils::time::{optional_timestamp_millis, timestamp_millis};
use serde::{Deserialize, Serialize};

/// 评论列表查询参数 / Comment list query parameters.
#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CommentListQuery {
    pub page: Option<String>,
    pub page_size: Option<String>,
    pub post_id: Option<String>,
    pub parent_id: Option<String>,
}

/// 站点留言创建请求 / Site comment creation request.
#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateSiteCommentRequest {
    pub author: String,
    pub email: String,
    pub content: String,
    pub parent_id: Option<i64>,
}

/// 文章评论创建请求 / Article comment creation request.
#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateArticleCommentRequest {
    pub post_id: i64,
    pub author: String,
    pub email: String,
    pub content: String,
    pub parent_id: Option<i64>,
}

/// 对外返回的评论数据 / Comment data returned to clients.
#[derive(Serialize)]
pub struct CommentDto {
    pub id: i64,
    pub post_id: i64,
    pub parent_id: Option<i64>,
    pub author: String,
    pub floor: f64,
    pub email: String,
    pub content: String,
    pub location: String,
    pub is_visible: bool,
    pub created_at: i64,
    pub updated_at: Option<i64>,
    pub deleted_at: Option<i64>,
}

impl From<CommentRecord> for CommentDto {
    /// 将数据库评论记录转换为接口 DTO / Converts a database comment record into an API DTO.
    fn from(comment: CommentRecord) -> Self {
        Self {
            id: comment.id,
            post_id: comment.post_id.unwrap_or(0),
            parent_id: comment.parent_id,
            author: comment.author,
            floor: comment.floor,
            email: comment.email,
            content: comment.content,
            location: comment.location,
            is_visible: comment.is_visible,
            created_at: timestamp_millis(comment.created_at),
            updated_at: optional_timestamp_millis(comment.updated_at),
            deleted_at: optional_timestamp_millis(comment.deleted_at),
        }
    }
}

/// 待写入数据库的新评论 / New comment to insert into the database.
#[derive(Debug)]
pub struct NewComment {
    pub post_id: Option<i64>,
    pub parent_id: Option<i64>,
    pub author: String,
    pub email: String,
    pub content: String,
    pub location: String,
}
