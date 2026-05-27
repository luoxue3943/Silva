use chrono::{DateTime, Utc};
use sqlx::FromRow;

/// posts 表数据库记录 / Database record for the posts table.
#[derive(Debug, FromRow)]
pub struct PostRecord {
    pub id: i64,
    pub title: String,
    pub slug: String,
    pub summary: Option<String>,
    pub cover_image: Option<String>,
    pub keywords: Vec<String>,
    pub category: Option<String>,
    pub storage_path: String,
    pub views: i64,
    pub created_at: DateTime<Utc>,
    pub updated_at: Option<DateTime<Utc>>,
    pub deleted_at: Option<DateTime<Utc>>,
}
