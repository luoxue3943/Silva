use crate::error::AppResult;
use crate::modules::murmur::dto::{MurmurDto, MurmurListQuery};
use crate::modules::murmur::repo;
use crate::response::Page;
use crate::utils::pagination::normalize_paging;
use sqlx::PgPool;

const MURMURS_PAGE_SIZE: u32 = 15;

pub async fn list_murmurs(db: &PgPool, query: MurmurListQuery) -> AppResult<Page<MurmurDto>> {
    let (page, page_size) = normalize_paging(
        query.page.as_deref(),
        query.page_size.as_deref(),
        MURMURS_PAGE_SIZE,
    );
    let (murmurs, total) = repo::list_murmurs(db, page, page_size).await?;
    let data = murmurs.into_iter().map(MurmurDto::from).collect();

    Ok(Page::new(data, page, page_size, total))
}
