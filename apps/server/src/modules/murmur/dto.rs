use crate::modules::murmur::model::MurmurRecord;
use crate::utils::time::{optional_timestamp_millis, timestamp_millis};
use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MurmurListQuery {
    pub page: Option<String>,
    pub page_size: Option<String>,
}

#[derive(Serialize)]
pub struct MurmurDto {
    pub id: i64,
    pub content: String,
    pub created_at: i64,
    pub updated_at: Option<i64>,
    pub deleted_at: Option<i64>,
}

impl From<MurmurRecord> for MurmurDto {
    fn from(murmur: MurmurRecord) -> Self {
        Self {
            id: murmur.id,
            content: murmur.content,
            created_at: timestamp_millis(murmur.created_at),
            updated_at: optional_timestamp_millis(murmur.updated_at),
            deleted_at: optional_timestamp_millis(murmur.deleted_at),
        }
    }
}
