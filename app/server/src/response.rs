use serde::Serialize;

#[derive(Serialize)]
pub struct ApiResponse<T>
where
    T: Serialize,
{
    pub code: u16,
    pub data: T,
    pub message: String,
}

impl<T> ApiResponse<T>
where
    T: Serialize,
{
    pub fn success(data: T) -> Self {
        Self {
            code: 0,
            data,
            message: "ok".to_owned(),
        }
    }

    pub fn error(code: u16, message: impl Into<String>, data: T) -> Self {
        Self {
            code,
            data,
            message: message.into(),
        }
    }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Page<T>
where
    T: Serialize,
{
    pub data: Vec<T>,
    pub page: u32,
    pub page_size: u32,
    pub total: i64,
    pub has_more: bool,
}

impl<T> Page<T>
where
    T: Serialize,
{
    pub fn new(data: Vec<T>, page: u32, page_size: u32, total: i64) -> Self {
        let loaded = i64::from(page.saturating_sub(1)) * i64::from(page_size) + data.len() as i64;

        Self {
            data,
            page,
            page_size,
            total,
            has_more: loaded < total,
        }
    }
}
