use crate::config::Config;
use actix_web::HttpRequest;
use log::warn;
use serde::Deserialize;
use std::net::{IpAddr, SocketAddr};
use std::time::Duration;

const IPINFO_LITE_ENDPOINT: &str = "https://api.ipinfo.io/lite";
const IPINFO_TIMEOUT_SECONDS: u64 = 2;

#[derive(Debug, Deserialize)]
struct IpinfoLiteResponse {
    country: Option<String>,
    country_code: Option<String>,
    continent: Option<String>,
}

/// Resolves the best display location for a comment without blocking comment creation on failures.
pub async fn resolve_comment_location(request: &HttpRequest, config: &Config) -> String {
    let default_location = normalized_default_location(config);
    let Some(token) = config.ipinfo_token.as_deref() else {
        warn!("comment location fallback: ipinfo token is not configured");
        return default_location;
    };

    let Some(ip) = client_ip(request) else {
        warn!("comment location fallback: client IP could not be resolved from request");
        return default_location;
    };

    if !is_public_lookup_candidate(&ip) {
        warn!("comment location fallback: client IP {ip} is not a public lookup candidate");
        return default_location;
    }

    match lookup_ipinfo_location(&ip, token).await {
        Ok(location) => location,
        Err(error) => {
            warn!("comment location fallback: ipinfo lookup failed for {ip}: {error}");
            default_location
        }
    }
}

async fn lookup_ipinfo_location(ip: &IpAddr, token: &str) -> Result<String, String> {
    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(IPINFO_TIMEOUT_SECONDS))
        .build()
        .map_err(|error| format!("failed to build HTTP client: {error}"))?;
    let response = client
        .get(format!("{IPINFO_LITE_ENDPOINT}/{ip}"))
        .query(&[("token", token)])
        .send()
        .await
        .map_err(|error| format!("request failed: {error}"))?
        .error_for_status()
        .map_err(|error| format!("unexpected response status: {error}"))?
        .json::<IpinfoLiteResponse>()
        .await
        .map_err(|error| format!("failed to decode response: {error}"))?;

    format_location(response).ok_or_else(|| "response did not contain a usable location".to_owned())
}

fn format_location(response: IpinfoLiteResponse) -> Option<String> {
    response
        .country
        .or(response.country_code)
        .or(response.continent)
        .map(|value| value.trim().to_owned())
        .filter(|value| !value.is_empty())
}

fn normalized_default_location(config: &Config) -> String {
    let location = config.default_comment_location.trim();

    if location.is_empty() {
        "Unknown".to_owned()
    } else {
        location.to_owned()
    }
}

fn client_ip(request: &HttpRequest) -> Option<IpAddr> {
    ["cf-connecting-ip", "x-real-ip", "x-forwarded-for"]
        .iter()
        .filter_map(|name| request.headers().get(*name))
        .filter_map(|value| value.to_str().ok())
        .find_map(parse_ip_candidate)
        .or_else(|| {
            request
                .connection_info()
                .realip_remote_addr()
                .and_then(parse_ip_candidate)
        })
}

fn parse_ip_candidate(value: &str) -> Option<IpAddr> {
    let candidate = value
        .split(',')
        .next()
        .unwrap_or(value)
        .trim()
        .trim_matches('"');

    candidate
        .parse::<IpAddr>()
        .ok()
        .or_else(|| candidate.parse::<SocketAddr>().ok().map(|addr| addr.ip()))
        .or_else(|| parse_bracketed_ip(candidate))
        .or_else(|| parse_ipv4_with_port(candidate))
}

fn parse_bracketed_ip(candidate: &str) -> Option<IpAddr> {
    let closing_bracket = candidate.strip_prefix('[')?.find(']')?;
    candidate
        .get(1..=closing_bracket)
        .and_then(|value| value.parse::<IpAddr>().ok())
}

fn parse_ipv4_with_port(candidate: &str) -> Option<IpAddr> {
    let (ip, _) = candidate.rsplit_once(':')?;

    if ip.contains(':') {
        return None;
    }

    ip.parse::<IpAddr>().ok()
}

fn is_public_lookup_candidate(ip: &IpAddr) -> bool {
    match ip {
        IpAddr::V4(ip) => {
            !ip.is_loopback()
                && !ip.is_private()
                && !ip.is_link_local()
                && !ip.is_unspecified()
                && !ip.is_multicast()
                && !ip.is_broadcast()
        }
        IpAddr::V6(ip) => !ip.is_loopback() && !ip.is_unspecified() && !ip.is_multicast(),
    }
}

#[cfg(test)]
mod tests {
    use super::{
        format_location, is_public_lookup_candidate, parse_ip_candidate, IpinfoLiteResponse,
    };
    use std::net::IpAddr;

    #[test]
    fn parses_forwarded_ip_candidates() {
        assert_eq!(
            parse_ip_candidate("203.0.113.7, 10.0.0.1"),
            Some("203.0.113.7".parse::<IpAddr>().unwrap())
        );
        assert_eq!(
            parse_ip_candidate("203.0.113.7:443"),
            Some("203.0.113.7".parse::<IpAddr>().unwrap())
        );
        assert_eq!(
            parse_ip_candidate("[2001:db8::1]:443"),
            Some("2001:db8::1".parse::<IpAddr>().unwrap())
        );
    }

    #[test]
    fn skips_local_lookup_candidates() {
        assert!(!is_public_lookup_candidate(&"127.0.0.1".parse().unwrap()));
        assert!(!is_public_lookup_candidate(&"10.0.0.1".parse().unwrap()));
        assert!(is_public_lookup_candidate(&"8.8.8.8".parse().unwrap()));
    }

    #[test]
    fn formats_location_with_fallback_fields() {
        assert_eq!(
            format_location(IpinfoLiteResponse {
                country: Some(" United States ".to_owned()),
                country_code: Some("US".to_owned()),
                continent: Some("North America".to_owned()),
            }),
            Some("United States".to_owned())
        );
        assert_eq!(
            format_location(IpinfoLiteResponse {
                country: None,
                country_code: Some("US".to_owned()),
                continent: None,
            }),
            Some("US".to_owned())
        );
    }
}
