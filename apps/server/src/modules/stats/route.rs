use crate::modules::stats::handler;
use actix_web::web;

/// 注册统计模块路由 / Registers stats module routes.
pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.route("/stats", web::get().to(handler::get_stats))
        .route("/stats/visit", web::post().to(handler::record_visit));
}
