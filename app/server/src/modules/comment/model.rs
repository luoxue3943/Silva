use chrono::{DateTime, Utc};
use sqlx::FromRow;

#[derive(Debug, FromRow)]
pub struct CommentRecord {
    pub id: i64,
    pub post_id: Option<i64>,
    pub parent_id: Option<i64>,
    pub author: String,
    pub floor: f64,
    pub email: String,
    pub content: String,
    pub location: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: Option<DateTime<Utc>>,
    pub deleted_at: Option<DateTime<Utc>>,
}
