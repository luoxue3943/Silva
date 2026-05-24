use crate::modules::post::handler;
use actix_web::web;

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.route("/posts", web::get().to(handler::list_posts))
        .route(
            "/posts/timeline",
            web::get().to(handler::list_timeline_posts),
        )
        .route("/posts/{id}", web::get().to(handler::get_post));
}
