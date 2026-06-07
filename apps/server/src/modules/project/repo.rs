use crate::error::AppResult;
use crate::modules::project::model::ProjectRecord;
use sqlx::PgPool;

pub async fn list_projects(db: &PgPool) -> AppResult<Vec<ProjectRecord>> {
    let rows = sqlx::query_as::<_, ProjectRecord>(
        r#"
        SELECT
            id,
            name,
            summary,
            link,
            sort_order,
            created_at,
            updated_at,
            deleted_at
        FROM projects
        WHERE deleted_at IS NULL
        ORDER BY sort_order ASC, id ASC
        "#,
    )
    .fetch_all(db)
    .await?;

    Ok(rows)
}
