use crate::modules::comment::handler;
use actix_web::web;

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.route("/comments/site", web::get().to(handler::list_site_comments))
        .route(
            "/comments/site",
            web::post().to(handler::create_site_comment),
        )
        .route(
            "/comments/article",
            web::get().to(handler::list_article_comments),
        )
        .route(
            "/comments/article",
            web::post().to(handler::create_article_comment),
        );
}
