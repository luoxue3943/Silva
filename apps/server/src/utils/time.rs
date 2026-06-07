use chrono::{DateTime, Utc};

/// 将 UTC 时间转换为毫秒时间戳 / Converts a UTC datetime to a millisecond timestamp.
pub fn timestamp_millis(value: DateTime<Utc>) -> i64 {
    value.timestamp_millis()
}

/// 将可选 UTC 时间转换为可选毫秒时间戳 / Converts an optional UTC datetime to an optional millisecond timestamp.
pub fn optional_timestamp_millis(value: Option<DateTime<Utc>>) -> Option<i64> {
    value.map(timestamp_millis)
}
