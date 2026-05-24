use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, FromRow)]
pub struct StatsRecord {
    pub total_visits: i64,
    pub total_guests: i64,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VisitRequest {
    pub guest_id: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct StatsDto {
    pub total_visits: i64,
    pub total_guests: i64,
    pub online_users: i64,
}

impl StatsDto {
    pub fn from_record(record: StatsRecord, online_users: i64) -> Self {
        Self {
            total_visits: record.total_visits,
            total_guests: record.total_guests,
            online_users,
        }
    }
}
