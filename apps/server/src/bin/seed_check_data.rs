use server::config::Config;
use server::db::pool::create_pg_pool;
use server::seed;
use sqlx::Row;

#[actix_web::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let config = Config::from_file()?;
    let db = create_pg_pool(&config.database_url).await?;

    seed::run(&db).await?;

    let projects = scalar_count(
        &db,
        "SELECT COUNT(*) FROM projects WHERE deleted_at IS NULL",
    )
    .await?;
    let posts = scalar_count(&db, "SELECT COUNT(*) FROM posts WHERE deleted_at IS NULL").await?;
    let site_comments = scalar_count(
        &db,
        "SELECT COUNT(*) FROM comments WHERE post_id IS NULL AND deleted_at IS NULL AND is_visible = TRUE",
    )
    .await?;
    let article_comments = scalar_count(
        &db,
        "SELECT COUNT(*) FROM comments WHERE post_id IS NOT NULL AND deleted_at IS NULL AND is_visible = TRUE",
    )
    .await?;
    let site_guests = scalar_count(&db, "SELECT COUNT(*) FROM site_guests").await?;
    let stats = sqlx::query("SELECT total_visits, total_guests FROM site_stats WHERE id = 1")
        .fetch_one(&db)
        .await?;

    println!("seeded projects: {projects}");
    println!("seeded posts: {posts}");
    println!("seeded site comments: {site_comments}");
    println!("seeded article comments: {article_comments}");
    println!("seeded site guests: {site_guests}");
    println!(
        "seeded site stats: total_visits={}, total_guests={}",
        stats.get::<i64, _>("total_visits"),
        stats.get::<i64, _>("total_guests")
    );

    Ok(())
}

async fn scalar_count(db: &sqlx::PgPool, sql: &str) -> Result<i64, sqlx::Error> {
    let row = sqlx::query(sql).fetch_one(db).await?;

    Ok(row.get::<i64, _>(0))
}
