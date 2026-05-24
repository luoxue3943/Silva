use crate::config::Config;
use crate::error::{AppError, AppResult};
use crate::modules::stats::dto::{StatsDto, VisitRequest};
use crate::modules::stats::repo;
use chrono::Utc;
use redis::aio::MultiplexedConnection;
use sqlx::PgPool;

pub async fn get_stats(db: &PgPool, redis: &redis::Client, config: &Config) -> AppResult<StatsDto> {
    let stats = repo::get_stats(db).await?;
    let online_users = online_user_count(redis, config).await?;

    Ok(StatsDto::from_record(stats, online_users))
}

pub async fn record_visit(
    db: &PgPool,
    redis: &redis::Client,
    config: &Config,
    request: VisitRequest,
) -> AppResult<StatsDto> {
    let guest_id = sanitize_guest_id(request.guest_id)?;
    let stats = repo::record_visit(db, &guest_id).await?;
    let online_users = touch_online_user(redis, config, &guest_id).await?;

    Ok(StatsDto::from_record(stats, online_users))
}

async fn online_user_count(redis: &redis::Client, config: &Config) -> AppResult<i64> {
    let mut connection = redis.get_multiplexed_async_connection().await?;

    prune_online_users(&mut connection, config).await?;

    let count = redis::cmd("ZCARD")
        .arg(&config.online_users_key)
        .query_async(&mut connection)
        .await?;

    Ok(count)
}

async fn touch_online_user(
    redis: &redis::Client,
    config: &Config,
    guest_id: &str,
) -> AppResult<i64> {
    let mut connection = redis.get_multiplexed_async_connection().await?;
    let expires_at = Utc::now().timestamp() + config.online_user_ttl_seconds as i64;

    prune_online_users(&mut connection, config).await?;

    let _: () = redis::cmd("ZADD")
        .arg(&config.online_users_key)
        .arg(expires_at)
        .arg(guest_id)
        .query_async(&mut connection)
        .await?;

    let count = redis::cmd("ZCARD")
        .arg(&config.online_users_key)
        .query_async(&mut connection)
        .await?;

    Ok(count)
}

async fn prune_online_users(
    connection: &mut MultiplexedConnection,
    config: &Config,
) -> AppResult<()> {
    let now = Utc::now().timestamp();

    let _: () = redis::cmd("ZREMRANGEBYSCORE")
        .arg(&config.online_users_key)
        .arg("-inf")
        .arg(now)
        .query_async(connection)
        .await?;

    Ok(())
}

fn sanitize_guest_id(guest_id: String) -> AppResult<String> {
    let guest_id = guest_id.trim().to_owned();

    if guest_id.len() < 8 || guest_id.len() > 128 {
        return Err(AppError::BadRequest(
            "guestId must be between 8 and 128 characters".to_owned(),
        ));
    }

    Ok(guest_id)
}

#[cfg(test)]
mod tests {
    use super::sanitize_guest_id;

    #[test]
    fn rejects_short_guest_ids() {
        assert!(sanitize_guest_id("short".to_owned()).is_err());
    }
}
