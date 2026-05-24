use chrono::{DateTime, Utc};

pub fn timestamp_millis(value: DateTime<Utc>) -> i64 {
    value.timestamp_millis()
}

pub fn optional_timestamp_millis(value: Option<DateTime<Utc>>) -> Option<i64> {
    value.map(timestamp_millis)
}
