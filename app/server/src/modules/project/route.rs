use crate::modules::project::handler;
use actix_web::web;

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.route("/projects", web::get().to(handler::list_projects));
}
