use crate::error::AppResult;
use crate::modules::comment::dto::NewComment;
use crate::modules::comment::model::CommentRecord;
use sqlx::PgPool;

pub async fn list_site_comments(
    db: &PgPool,
    parent_id: Option<i64>,
    page: u32,
    page_size: u32,
) -> AppResult<(Vec<CommentRecord>, i64)> {
    list_comments(db, None, parent_id, page, page_size).await
}

pub async fn list_article_comments(
    db: &PgPool,
    post_id: i64,
    parent_id: Option<i64>,
    page: u32,
    page_size: u32,
) -> AppResult<(Vec<CommentRecord>, i64)> {
    list_comments(db, Some(post_id), parent_id, page, page_size).await
}

async fn list_comments(
    db: &PgPool,
    post_id: Option<i64>,
    parent_id: Option<i64>,
    page: u32,
    page_size: u32,
) -> AppResult<(Vec<CommentRecord>, i64)> {
    let offset = i64::from(page.saturating_sub(1)) * i64::from(page_size);

    let rows = sqlx::query_as::<_, CommentRecord>(
        r#"
        SELECT id, post_id, parent_id, author, floor, email, content, location,
               created_at, updated_at, deleted_at
        FROM comments
        WHERE deleted_at IS NULL
          AND post_id IS NOT DISTINCT FROM $1
          AND parent_id IS NOT DISTINCT FROM $2
        ORDER BY floor ASC, id ASC
        LIMIT $3 OFFSET $4
        "#,
    )
    .bind(post_id)
    .bind(parent_id)
    .bind(i64::from(page_size))
    .bind(offset)
    .fetch_all(db)
    .await?;

    let (total,) = sqlx::query_as::<_, (i64,)>(
        r#"
        SELECT COUNT(*)
        FROM comments
        WHERE deleted_at IS NULL
          AND post_id IS NOT DISTINCT FROM $1
          AND parent_id IS NOT DISTINCT FROM $2
        "#,
    )
    .bind(post_id)
    .bind(parent_id)
    .fetch_one(db)
    .await?;

    Ok((rows, total))
}

pub async fn find_comment_in_scope(
    db: &PgPool,
    comment_id: i64,
    post_id: Option<i64>,
) -> AppResult<Option<CommentRecord>> {
    let comment = sqlx::query_as::<_, CommentRecord>(
        r#"
        SELECT id, post_id, parent_id, author, floor, email, content, location,
               created_at, updated_at, deleted_at
        FROM comments
        WHERE id = $1
          AND post_id IS NOT DISTINCT FROM $2
          AND deleted_at IS NULL
        "#,
    )
    .bind(comment_id)
    .bind(post_id)
    .fetch_optional(db)
    .await?;

    Ok(comment)
}

pub async fn next_root_floor(db: &PgPool, post_id: Option<i64>) -> AppResult<f64> {
    let (floor,) = sqlx::query_as::<_, (f64,)>(
        r#"
        SELECT COALESCE(MAX(floor), 0) + 1
        FROM comments
        WHERE deleted_at IS NULL
          AND post_id IS NOT DISTINCT FROM $1
          AND parent_id IS NULL
        "#,
    )
    .bind(post_id)
    .fetch_one(db)
    .await?;

    Ok(floor)
}

pub async fn next_reply_floor(
    db: &PgPool,
    parent: &CommentRecord,
    post_id: Option<i64>,
) -> AppResult<f64> {
    let (reply_count,) = sqlx::query_as::<_, (i64,)>(
        r#"
        SELECT COUNT(*)
        FROM comments
        WHERE deleted_at IS NULL
          AND post_id IS NOT DISTINCT FROM $1
          AND parent_id = $2
        "#,
    )
    .bind(post_id)
    .bind(parent.id)
    .fetch_one(db)
    .await?;

    Ok(parent.floor + ((reply_count + 1) as f64 / 10.0))
}

pub async fn insert_comment(
    db: &PgPool,
    new_comment: NewComment,
    floor: f64,
) -> AppResult<CommentRecord> {
    let comment = sqlx::query_as::<_, CommentRecord>(
        r#"
        INSERT INTO comments (post_id, parent_id, author, floor, email, content, location)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, post_id, parent_id, author, floor, email, content, location,
                  created_at, updated_at, deleted_at
        "#,
    )
    .bind(new_comment.post_id)
    .bind(new_comment.parent_id)
    .bind(new_comment.author)
    .bind(floor)
    .bind(new_comment.email)
    .bind(new_comment.content)
    .bind(new_comment.location)
    .fetch_one(db)
    .await?;

    Ok(comment)
}
