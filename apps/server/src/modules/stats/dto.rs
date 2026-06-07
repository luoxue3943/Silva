use serde::{Deserialize, Serialize};
use sqlx::FromRow;

/// 站点统计数据库记录 / Database record for site stats.
#[derive(Debug, FromRow)]
pub struct StatsRecord {
    pub total_visits: i64,
    pub total_guests: i64,
}

/// 访客访问记录请求 / Visit recording request.
#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VisitRequest {
    pub guest_id: String,
}

/// 对外返回的站点统计数据 / Site stats data returned to clients.
#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct StatsDto {
    pub total_visits: i64,
    pub total_guests: i64,
    pub online_users: i64,
}

impl StatsDto {
    /// 合并持久化统计和在线人数 / Combines persisted stats with online user count.
    pub fn from_record(record: StatsRecord, online_users: i64) -> Self {
        Self {
            total_visits: record.total_visits,
            total_guests: record.total_guests,
            online_users,
        }
    }
}
