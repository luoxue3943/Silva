use crate::error::AppResult;
use crate::modules::murmur::model::MurmurRecord;
use sqlx::PgPool;

pub async fn list_murmurs(
    db: &PgPool,
    page: u32,
    page_size: u32,
) -> AppResult<(Vec<MurmurRecord>, i64)> {
    let offset = i64::from(page.saturating_sub(1)) * i64::from(page_size);

    let rows = sqlx::query_as::<_, MurmurRecord>(
        r#"
        SELECT
            id,
            content,
            created_at,
            updated_at,
            deleted_at
        FROM murmurs
        WHERE deleted_at IS NULL
        ORDER BY created_at DESC, id DESC
        LIMIT $1 OFFSET $2
        "#,
    )
    .bind(i64::from(page_size))
    .bind(offset)
    .fetch_all(db)
    .await?;

    let (total,) = sqlx::query_as::<_, (i64,)>(
        r#"
        SELECT COUNT(*)
        FROM murmurs
        WHERE deleted_at IS NULL
        "#,
    )
    .fetch_one(db)
    .await?;

    Ok((rows, total))
}
