use actix_web::middleware::{Compress, Logger, NormalizePath, TrailingSlash};
use actix_web::{web, App, HttpServer};
use server::config::Config;
use server::db::pool::create_pg_pool;
use server::middlewares::cors::build_cors;
use server::routes;
use server::state::AppState;
use std::io;

/// 启动 Actix Web 服务并挂载共享应用状态 / Starts the Actix Web server and mounts shared app state.
#[actix_web::main]
async fn main() -> io::Result<()> {
    env_logger::init_from_env(env_logger::Env::default().default_filter_or("info"));

    let config = Config::from_file().map_err(io::Error::other)?;
    let db = create_pg_pool(&config.database_url)
        .await
        .map_err(io::Error::other)?;

    let redis = redis::Client::open(config.redis_url.as_str()).map_err(io::Error::other)?;
    let bind_addr = config.bind_addr();
    let state = web::Data::new(AppState::new(config.clone(), db, redis));

    HttpServer::new(move || {
        App::new()
            .app_data(state.clone())
            .wrap(Logger::default())
            .wrap(Compress::default())
            .wrap(NormalizePath::new(TrailingSlash::Trim))
            .wrap(build_cors(&config))
            .configure(routes::configure)
    })
    .bind(bind_addr)?
    .run()
    .await
}
