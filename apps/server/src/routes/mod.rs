use actix_web::web;

pub mod health;

/// 挂载 API v1 路由作用域 / Mounts the API v1 route scope.
pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api/v1")
            .configure(health::configure)
            .configure(crate::modules::post::route::configure)
            .configure(crate::modules::murmur::route::configure)
            .configure(crate::modules::project::route::configure)
            .configure(crate::modules::comment::route::configure)
            .configure(crate::modules::stats::route::configure),
    );
}
