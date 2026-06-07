use crate::error::AppResult;
use crate::modules::post::dto::{PostDto, PostListQuery};
use crate::modules::post::repo;
use crate::response::Page;
use crate::utils::pagination::normalize_paging;
use sqlx::PgPool;

const POSTS_PAGE_SIZE: u32 = 15;

/// 获取分页文章列表 / Gets a paginated post list.
pub async fn list_posts(db: &PgPool, query: PostListQuery) -> AppResult<Page<PostDto>> {
    let (page, page_size) = normalize_paging(
        query.page.as_deref(),
        query.page_size.as_deref(),
        POSTS_PAGE_SIZE,
    );
    let category = query
        .category
        .as_deref()
        .map(str::trim)
        .filter(|value| !value.is_empty());
    let (posts, total) = repo::list_posts(db, category, page, page_size).await?;
    let data = posts.into_iter().map(PostDto::from).collect();

    Ok(Page::new(data, page, page_size, total))
}

/// 获取单篇文章详情 / Gets one post by ID.
pub async fn get_post(db: &PgPool, id: i64) -> AppResult<Option<PostDto>> {
    Ok(repo::find_post_by_id(db, id).await?.map(PostDto::from))
}
