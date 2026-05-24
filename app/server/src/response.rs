use serde::Serialize;

/// API 统一响应包裹结构 / Unified API response envelope.
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
    /// 构建成功响应 / Builds a success response.
    pub fn success(data: T) -> Self {
        Self {
            code: 0,
            data,
            message: "ok".to_owned(),
        }
    }

    /// 构建错误响应 / Builds an error response.
    pub fn error(code: u16, message: impl Into<String>, data: T) -> Self {
        Self {
            code,
            data,
            message: message.into(),
        }
    }
}

/// 分页响应数据结构 / Paginated response shape.
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
    /// 根据数据和总数计算分页元信息 / Calculates pagination metadata from page data and total count.
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
