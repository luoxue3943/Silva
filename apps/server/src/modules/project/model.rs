use chrono::{DateTime, Utc};
use sqlx::FromRow;

#[derive(Debug, FromRow)]
pub struct ProjectRecord {
    pub id: i64,
    pub name: String,
    pub summary: String,
    pub link: String,
    pub sort_order: i32,
    pub created_at: DateTime<Utc>,
    pub updated_at: Option<DateTime<Utc>>,
    pub deleted_at: Option<DateTime<Utc>>,
}
