use crate::error::AppResult;
use crate::modules::post::model::PostRecord;
use sqlx::PgPool;

/// 查询未删除文章列表及总数 / Queries non-deleted posts and their total count.
pub async fn list_posts(
    db: &PgPool,
    category: Option<&str>,
    page: u32,
    page_size: u32,
) -> AppResult<(Vec<PostRecord>, i64)> {
    let offset = i64::from(page.saturating_sub(1)) * i64::from(page_size);

    let rows = sqlx::query_as::<_, PostRecord>(
        r#"
        SELECT
            id,
            title,
            COALESCE(slug, id::TEXT) AS slug,
            summary,
            cover_image,
            COALESCE(keywords, '{}'::TEXT[]) AS keywords,
            category,
            storage_path,
            views,
            created_at,
            updated_at,
            deleted_at
        FROM posts
        WHERE deleted_at IS NULL
          AND ($1::TEXT IS NULL OR category = $1)
        ORDER BY created_at DESC, id DESC
        LIMIT $2 OFFSET $3
        "#,
    )
    .bind(category)
    .bind(i64::from(page_size))
    .bind(offset)
    .fetch_all(db)
    .await?;

    let (total,) = sqlx::query_as::<_, (i64,)>(
        r#"
        SELECT COUNT(*)
        FROM posts
        WHERE deleted_at IS NULL
          AND ($1::TEXT IS NULL OR category = $1)
        "#,
    )
    .bind(category)
    .fetch_one(db)
    .await?;

    Ok((rows, total))
}

/// 按 ID 查询未删除文章 / Finds a non-deleted post by ID.
pub async fn find_post_by_id(db: &PgPool, id: i64) -> AppResult<Option<PostRecord>> {
    let post = sqlx::query_as::<_, PostRecord>(
        r#"
        SELECT
            id,
            title,
            COALESCE(slug, id::TEXT) AS slug,
            summary,
            cover_image,
            COALESCE(keywords, '{}'::TEXT[]) AS keywords,
            category,
            storage_path,
            views,
            created_at,
            updated_at,
            deleted_at
        FROM posts
        WHERE id = $1 AND deleted_at IS NULL
        "#,
    )
    .bind(id)
    .fetch_optional(db)
    .await?;

    Ok(post)
}

/// 检查文章是否存在且未删除 / Checks whether a post exists and is not deleted.
pub async fn post_exists(db: &PgPool, id: i64) -> AppResult<bool> {
    let (exists,) = sqlx::query_as::<_, (bool,)>(
        "SELECT EXISTS(SELECT 1 FROM posts WHERE id = $1 AND deleted_at IS NULL)",
    )
    .bind(id)
    .fetch_one(db)
    .await?;

    Ok(exists)
}
