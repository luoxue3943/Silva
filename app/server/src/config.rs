use serde::Deserialize;
use std::fs;
use std::path::{Path, PathBuf};

const CONFIG_FILE_NAME: &str = "server.toml";

/// 运行时配置 / Runtime configuration.
#[derive(Clone, Debug)]
pub struct Config {
    pub server_host: String,
    pub server_port: u16,
    pub database_url: String,
    pub redis_url: String,
    pub cors_allowed_origins: Vec<String>,
    pub default_comment_location: String,
    pub online_user_ttl_seconds: u64,
    pub online_users_key: String,
}

/// TOML 原始配置结构 / Raw TOML configuration shape.
#[derive(Debug, Deserialize)]
struct RawConfig {
    #[serde(default)]
    server: RawServerConfig,
    database: RawDatabaseConfig,
    #[serde(default)]
    redis: RawRedisConfig,
    #[serde(default)]
    cors: RawCorsConfig,
    #[serde(default)]
    comments: RawCommentsConfig,
    #[serde(default)]
    stats: RawStatsConfig,
}

/// 服务监听配置 / Server listen configuration.
#[derive(Debug, Deserialize)]
struct RawServerConfig {
    #[serde(default = "default_server_host")]
    host: String,
    #[serde(default = "default_server_port")]
    port: u16,
}

impl Default for RawServerConfig {
    fn default() -> Self {
        Self {
            host: default_server_host(),
            port: default_server_port(),
        }
    }
}

/// 数据库连接配置 / Database connection configuration.
#[derive(Debug, Deserialize)]
struct RawDatabaseConfig {
    url: String,
}

/// Redis 连接与在线用户配置 / Redis connection and online-user configuration.
#[derive(Debug, Deserialize)]
struct RawRedisConfig {
    #[serde(default = "default_redis_url")]
    url: String,
    #[serde(default = "default_online_users_key")]
    online_users_key: String,
}

impl Default for RawRedisConfig {
    fn default() -> Self {
        Self {
            url: default_redis_url(),
            online_users_key: default_online_users_key(),
        }
    }
}

/// CORS 来源配置 / CORS origin configuration.
#[derive(Debug, Deserialize)]
struct RawCorsConfig {
    #[serde(default = "default_cors_allowed_origins")]
    allowed_origins: Vec<String>,
}

impl Default for RawCorsConfig {
    fn default() -> Self {
        Self {
            allowed_origins: default_cors_allowed_origins(),
        }
    }
}

/// 评论模块配置 / Comment module configuration.
#[derive(Debug, Deserialize)]
struct RawCommentsConfig {
    #[serde(default = "default_comment_location")]
    default_location: String,
}

impl Default for RawCommentsConfig {
    fn default() -> Self {
        Self {
            default_location: default_comment_location(),
        }
    }
}

/// 统计模块配置 / Stats module configuration.
#[derive(Debug, Deserialize)]
struct RawStatsConfig {
    #[serde(default = "default_online_user_ttl_seconds")]
    online_user_ttl_seconds: u64,
}

impl Default for RawStatsConfig {
    fn default() -> Self {
        Self {
            online_user_ttl_seconds: default_online_user_ttl_seconds(),
        }
    }
}

impl Config {
    /// 从仓库 config 目录读取服务配置 / Reads service configuration from the repository config directory.
    pub fn from_file() -> Result<Self, String> {
        let config_path = resolve_config_path()?;
        let raw_config = fs::read_to_string(&config_path)
            .map_err(|error| format!("failed to read {}: {error}", config_path.display()))?;
        let raw: RawConfig = toml::from_str(&raw_config)
            .map_err(|error| format!("failed to parse {}: {error}", config_path.display()))?;

        Ok(Self {
            server_host: raw.server.host,
            server_port: raw.server.port,
            database_url: raw.database.url,
            redis_url: raw.redis.url,
            cors_allowed_origins: raw
                .cors
                .allowed_origins
                .into_iter()
                .map(|origin| origin.trim().to_owned())
                .filter(|origin| !origin.is_empty())
                .collect(),
            default_comment_location: raw.comments.default_location,
            online_user_ttl_seconds: raw.stats.online_user_ttl_seconds,
            online_users_key: raw.redis.online_users_key,
        })
    }

    /// 生成 HTTP 服务绑定地址 / Builds the HTTP server bind address.
    pub fn bind_addr(&self) -> String {
        format!("{}:{}", self.server_host, self.server_port)
    }
}

/// 定位可用的 server.toml 文件 / Locates the available server.toml file.
fn resolve_config_path() -> Result<PathBuf, String> {
    candidate_config_dirs()
        .into_iter()
        .map(|dir| dir.join(CONFIG_FILE_NAME))
        .find(|candidate| candidate.exists())
        .ok_or_else(|| {
            "server.toml not found. Expected it under the repository config directory".to_owned()
        })
}

/// 收集当前目录和 Cargo 清单目录向上的 config 候选路径 / Collects config path candidates from cwd and Cargo manifest ancestors.
fn candidate_config_dirs() -> Vec<PathBuf> {
    let mut dirs = Vec::new();

    if let Ok(current_dir) = std::env::current_dir() {
        push_config_candidates(&mut dirs, &current_dir);
    }

    push_config_candidates(&mut dirs, Path::new(env!("CARGO_MANIFEST_DIR")));

    dirs
}

/// 将指定基准目录的祖先 config 目录加入候选列表 / Adds ancestor config directories for the given base path.
fn push_config_candidates(dirs: &mut Vec<PathBuf>, base: &Path) {
    let mut current = Some(base);

    while let Some(dir) = current {
        let candidate = dir.join("config");

        if !dirs.contains(&candidate) {
            dirs.push(candidate);
        }

        current = dir.parent();
    }
}

fn default_server_host() -> String {
    "127.0.0.1".to_owned()
}

fn default_server_port() -> u16 {
    8080
}

fn default_redis_url() -> String {
    "redis://127.0.0.1:6379/".to_owned()
}

fn default_online_users_key() -> String {
    "silva:online_users".to_owned()
}

fn default_cors_allowed_origins() -> Vec<String> {
    vec![
        "http://localhost:3000".to_owned(),
        "http://127.0.0.1:3000".to_owned(),
    ]
}

fn default_comment_location() -> String {
    "Unknown".to_owned()
}

fn default_online_user_ttl_seconds() -> u64 {
    120
}
