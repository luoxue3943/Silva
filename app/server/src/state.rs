use crate::config::Config;
use sqlx::PgPool;

#[derive(Clone)]
pub struct AppState {
    pub config: Config,
    pub db: PgPool,
    pub redis: redis::Client,
}

impl AppState {
    pub fn new(config: Config, db: PgPool, redis: redis::Client) -> Self {
        Self { config, db, redis }
    }
}
