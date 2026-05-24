use crate::config::Config;
use actix_cors::Cors;
use actix_web::http::header;

pub fn build_cors(config: &Config) -> Cors {
    let cors = Cors::default()
        .allowed_methods(["GET", "POST", "OPTIONS"])
        .allowed_headers([header::ACCEPT, header::CONTENT_TYPE])
        .max_age(3600);

    if config
        .cors_allowed_origins
        .iter()
        .any(|origin| origin == "*")
    {
        return cors.allow_any_origin();
    }

    config
        .cors_allowed_origins
        .iter()
        .fold(cors, |cors, origin| cors.allowed_origin(origin))
}
