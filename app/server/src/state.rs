use crate::config::Config;
use sqlx::PgPool;

/// 应用共享状态 / Shared application state.
#[derive(Clone)]
pub struct AppState {
    pub config: Config,
    pub db: PgPool,
    pub redis: redis::Client,
}

impl AppState {
    /// 创建包含配置、数据库连接池和 Redis 客户端的状态 / Creates state with config, database pool, and Redis client.
    pub fn new(config: Config, db: PgPool, redis: redis::Client) -> Self {
        Self { config, db, redis }
    }
}
