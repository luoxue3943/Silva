const MAX_PAGE_SIZE: u32 = 100;

/// 规范化分页参数 / Normalizes pagination parameters.
pub fn normalize_paging(
    page: Option<&str>,
    page_size: Option<&str>,
    default_page_size: u32,
) -> (u32, u32) {
    let page = parse_positive(page).unwrap_or(1);
    let page_size = parse_positive(page_size)
        .unwrap_or(default_page_size)
        .clamp(1, MAX_PAGE_SIZE);

    (page, page_size)
}

/// 解析正整数查询参数 / Parses a positive integer query parameter.
pub fn parse_positive(value: Option<&str>) -> Option<u32> {
    value
        .and_then(|value| value.parse::<u32>().ok())
        .filter(|value| *value > 0)
}

#[cfg(test)]
mod tests {
    use super::normalize_paging;

    #[test]
    fn normalizes_invalid_values_to_defaults() {
        assert_eq!(normalize_paging(Some("0"), Some("bad"), 15), (1, 15));
    }

    #[test]
    fn clamps_large_page_sizes() {
        assert_eq!(normalize_paging(Some("2"), Some("500"), 15), (2, 100));
    }
}
