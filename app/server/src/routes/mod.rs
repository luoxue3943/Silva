use actix_web::web;

pub mod health;

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api/v1")
            .configure(health::configure)
            .configure(crate::modules::post::route::configure)
            .configure(crate::modules::comment::route::configure)
            .configure(crate::modules::stats::route::configure),
    );
}
