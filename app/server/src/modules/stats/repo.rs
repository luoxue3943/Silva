use crate::error::AppResult;
use crate::modules::stats::dto::StatsRecord;
use sqlx::PgPool;

/// 读取站点统计总览 / Reads the site stats summary.
pub async fn get_stats(db: &PgPool) -> AppResult<StatsRecord> {
    let stats = sqlx::query_as::<_, StatsRecord>(
        r#"
        SELECT total_visits, total_guests
        FROM site_stats
        WHERE id = 1
        "#,
    )
    .fetch_one(db)
    .await?;

    Ok(stats)
}

/// 记录一次访问并更新访客总数 / Records one visit and updates the guest total.
pub async fn record_visit(db: &PgPool, guest_id: &str) -> AppResult<StatsRecord> {
    sqlx::query(
        r#"
        UPDATE site_stats
        SET total_visits = total_visits + 1,
            updated_at = now()
        WHERE id = 1
        "#,
    )
    .execute(db)
    .await?;

    let inserted = sqlx::query_as::<_, (String,)>(
        r#"
        INSERT INTO site_guests (guest_id)
        VALUES ($1)
        ON CONFLICT (guest_id) DO NOTHING
        RETURNING guest_id
        "#,
    )
    .bind(guest_id)
    .fetch_optional(db)
    .await?;

    if inserted.is_some() {
        sqlx::query(
            r#"
            UPDATE site_stats
            SET total_guests = total_guests + 1,
                updated_at = now()
            WHERE id = 1
            "#,
        )
        .execute(db)
        .await?;
    } else {
        sqlx::query(
            r#"
            UPDATE site_guests
            SET last_seen_at = now()
            WHERE guest_id = $1
            "#,
        )
        .bind(guest_id)
        .execute(db)
        .await?;
    }

    get_stats(db).await
}
