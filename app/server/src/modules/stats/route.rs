use crate::modules::stats::handler;
use actix_web::web;

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.route("/stats", web::get().to(handler::get_stats))
        .route("/stats/visit", web::post().to(handler::record_visit));
}
