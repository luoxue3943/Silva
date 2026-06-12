use crate::modules::murmur::handler;
use actix_web::web;

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.route("/murmurs", web::get().to(handler::list_murmurs));
}
