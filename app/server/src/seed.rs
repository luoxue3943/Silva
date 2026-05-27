use chrono::{DateTime, Duration, Utc};
use sqlx::PgPool;

/// 种子数据写入结果 / Seed data write result.
type SeedResult<T> = Result<T, sqlx::Error>;

/// 文章种子数据 / Post seed data.
struct PostSeed {
    title: &'static str,
    category: &'static str,
    views: i64,
    created_at: &'static str,
    updated_at: Option<&'static str>,
}

/// 评论种子数据 / Comment seed data.
struct CommentSeed {
    id: i64,
    post_id: Option<i64>,
    parent_id: Option<i64>,
    author: &'static str,
    floor: f64,
    email: String,
    content: String,
    location: &'static str,
    created_at: DateTime<Utc>,
}

/// 文章种子列表 / Post seed list.
const POST_SEEDS: &[PostSeed] = &[
    PostSeed {
        title: "Building a Mock API Layer with alova",
        category: "tech",
        views: 1248,
        created_at: "2026-05-18T09:30:00+08:00",
        updated_at: Some("2026-05-19T14:20:00+08:00"),
    },
    PostSeed {
        title: "Infinite Scroll without Duplicate Requests",
        category: "advanced",
        views: 1182,
        created_at: "2026-05-14T16:15:00+08:00",
        updated_at: None,
    },
    PostSeed {
        title: "Markdown Compatibility Checklist",
        category: "tech",
        views: 936,
        created_at: "2026-05-09T11:00:00+08:00",
        updated_at: None,
    },
    PostSeed {
        title: "Designing Comment Pagination",
        category: "advanced",
        views: 862,
        created_at: "2026-05-04T20:10:00+08:00",
        updated_at: None,
    },
    PostSeed {
        title: "International Routes in Next.js",
        category: "i18n",
        views: 754,
        created_at: "2026-04-28T08:45:00+08:00",
        updated_at: None,
    },
    PostSeed {
        title: "Server-rendered Article Content",
        category: "tech",
        views: 690,
        created_at: "2026-04-20T18:30:00+08:00",
        updated_at: None,
    },
    PostSeed {
        title: "Testing Tables and Task Lists",
        category: "advanced",
        views: 646,
        created_at: "2026-04-12T10:25:00+08:00",
        updated_at: None,
    },
    PostSeed {
        title: "Sanitizing User Markdown",
        category: "tech",
        views: 588,
        created_at: "2026-04-02T22:05:00+08:00",
        updated_at: None,
    },
    PostSeed {
        title: "Timeline Grouping by Year",
        category: "advanced",
        views: 533,
        created_at: "2026-03-24T15:50:00+08:00",
        updated_at: None,
    },
    PostSeed {
        title: "Locale-aware Date Labels",
        category: "i18n",
        views: 488,
        created_at: "2026-03-10T12:40:00+08:00",
        updated_at: None,
    },
    PostSeed {
        title: "Client Hooks for Mocked Data",
        category: "tech",
        views: 447,
        created_at: "2026-02-22T09:15:00+08:00",
        updated_at: None,
    },
    PostSeed {
        title: "Reply Threads That Stay Fast",
        category: "advanced",
        views: 420,
        created_at: "2026-02-06T17:05:00+08:00",
        updated_at: None,
    },
    PostSeed {
        title: "Fallback States for Empty Lists",
        category: "tech",
        views: 396,
        created_at: "2026-01-21T13:30:00+08:00",
        updated_at: None,
    },
    PostSeed {
        title: "Code Blocks, Copy Buttons, and Prism",
        category: "advanced",
        views: 371,
        created_at: "2026-01-04T19:55:00+08:00",
        updated_at: None,
    },
    PostSeed {
        title: "Translation Keys for Categories",
        category: "i18n",
        views: 342,
        created_at: "2025-12-18T21:45:00+08:00",
        updated_at: None,
    },
    PostSeed {
        title: "Request Guards for Scroll Sentinels",
        category: "advanced",
        views: 319,
        created_at: "2025-12-02T07:30:00+08:00",
        updated_at: None,
    },
    PostSeed {
        title: "Rendering Safe HTML from Markdown",
        category: "tech",
        views: 287,
        created_at: "2025-11-17T10:10:00+08:00",
        updated_at: None,
    },
    PostSeed {
        title: "Long-form Content Layout Notes",
        category: "advanced",
        views: 251,
        created_at: "2025-10-29T16:35:00+08:00",
        updated_at: None,
    },
    PostSeed {
        title: "Multilingual Article Metadata",
        category: "i18n",
        views: 238,
        created_at: "2025-09-11T14:00:00+08:00",
        updated_at: None,
    },
    PostSeed {
        title: "Final Mock Dataset Verification",
        category: "tech",
        views: 220,
        created_at: "2025-08-26T23:20:00+08:00",
        updated_at: None,
    },
];

/// 评论作者池 / Comment author pool.
const AUTHORS: &[&str] = &[
    "Ada", "Linus", "Grace", "Ken", "Mira", "Nolan", "Rhea", "Tao", "Vera", "Yuki",
];

/// 评论位置池 / Comment location pool.
const LOCATIONS: &[&str] = &[
    "Shanghai",
    "Beijing",
    "Shenzhen",
    "Hangzhou",
    "Chengdu",
    "Nanjing",
    "Guangzhou",
    "Suzhou",
];

/// 写入所有种子数据并刷新自增序列 / Writes all seed data and refreshes serial sequences.
pub async fn run(db: &PgPool) -> SeedResult<()> {
    seed_posts(db).await?;
    seed_comments(db).await?;
    refresh_sequences(db).await?;

    Ok(())
}

/// 写入文章种子数据 / Writes post seed data.
async fn seed_posts(db: &PgPool) -> SeedResult<()> {
    for (index, post) in POST_SEEDS.iter().enumerate() {
        let id = index as i64 + 1;
        let created_at = parse_seed_time(post.created_at);
        let updated_at = post.updated_at.map(parse_seed_time);
        let storage_path = format!("article/{id}.md");
        let slug = slugify_title(post.title);
        let keywords = vec![post.category.to_owned()];

        sqlx::query(
            r#"
            INSERT INTO posts (
                id, title, slug, summary, cover_image, keywords, category, storage_path, views, created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            ON CONFLICT (id) DO UPDATE
            SET title = EXCLUDED.title,
                slug = EXCLUDED.slug,
                summary = EXCLUDED.summary,
                cover_image = EXCLUDED.cover_image,
                keywords = EXCLUDED.keywords,
                category = EXCLUDED.category,
                storage_path = EXCLUDED.storage_path,
                views = EXCLUDED.views,
                created_at = EXCLUDED.created_at,
                updated_at = EXCLUDED.updated_at
            "#,
        )
        .bind(id)
        .bind(post.title)
        .bind(slug)
        .bind(Option::<String>::None)
        .bind(Option::<String>::None)
        .bind(keywords)
        .bind(post.category)
        .bind(storage_path)
        .bind(post.views)
        .bind(created_at)
        .bind(updated_at)
        .execute(db)
        .await?;
    }

    Ok(())
}

/// 写入评论种子数据 / Writes comment seed data.
async fn seed_comments(db: &PgPool) -> SeedResult<()> {
    for comment in build_comments() {
        sqlx::query(
            r#"
            INSERT INTO comments (
                id, post_id, parent_id, author, floor, email, content, location, created_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            ON CONFLICT (id) DO UPDATE
            SET post_id = EXCLUDED.post_id,
                parent_id = EXCLUDED.parent_id,
                author = EXCLUDED.author,
                floor = EXCLUDED.floor,
                email = EXCLUDED.email,
                content = EXCLUDED.content,
                location = EXCLUDED.location,
                created_at = EXCLUDED.created_at
            "#,
        )
        .bind(comment.id)
        .bind(comment.post_id)
        .bind(comment.parent_id)
        .bind(comment.author)
        .bind(comment.floor)
        .bind(comment.email)
        .bind(comment.content)
        .bind(comment.location)
        .bind(comment.created_at)
        .execute(db)
        .await?;
    }

    Ok(())
}

/// 构建站点和文章评论线程 / Builds site and article comment threads.
fn build_comments() -> Vec<CommentSeed> {
    let mut comments = Vec::new();
    let mut next_id = 1;

    for floor in 1..=16 {
        append_thread(
            &mut comments,
            &mut next_id,
            None,
            floor,
            if floor <= 4 { 7 } else { floor % 3 },
            "Site",
        );
    }

    for floor in 1..=18 {
        append_thread(
            &mut comments,
            &mut next_id,
            Some(1),
            floor,
            if floor <= 5 { 8 } else { floor % 4 },
            "Article 1",
        );
    }

    for post_id in 2..=20 {
        for floor in 1..=6 {
            append_thread(
                &mut comments,
                &mut next_id,
                Some(post_id),
                floor,
                if floor <= 2 { 6 } else { floor % 2 },
                &format!("Article {post_id}"),
            );
        }
    }

    comments
}

/// 追加一个顶级评论及其回复线程 / Appends one root comment and its reply thread.
fn append_thread(
    target: &mut Vec<CommentSeed>,
    next_id: &mut i64,
    post_id: Option<i64>,
    floor: i64,
    reply_count: i64,
    source_label: &str,
) {
    let root = make_comment(
        *next_id,
        post_id,
        None,
        floor as f64,
        format!(
            "{source_label} comment {floor}: this entry is part of the pagination dataset and should remain stable across reloads."
        ),
        floor * 7,
    );
    let root_id = root.id;

    // 先写入根评论，再基于根评论 ID 追加回复 / Insert the root comment first, then append replies with its ID.
    *next_id += 1;
    target.push(root);

    for index in 1..=reply_count {
        let floor_value = format!("{floor}.{index}")
            .parse::<f64>()
            .unwrap_or(floor as f64);

        target.push(make_comment(
            *next_id,
            post_id,
            Some(root_id),
            floor_value,
            format!(
                "Reply {index} for comment {floor}: loaded in groups of five to exercise the child pagination button."
            ),
            floor * 7 + index,
        ));

        *next_id += 1;
    }
}

/// 创建单条评论种子记录 / Creates one comment seed record.
fn make_comment(
    id: i64,
    post_id: Option<i64>,
    parent_id: Option<i64>,
    floor: f64,
    content: String,
    offset_hours: i64,
) -> CommentSeed {
    let author = AUTHORS[id as usize % AUTHORS.len()];
    let location = LOCATIONS[id as usize % LOCATIONS.len()];
    let created_at = parse_seed_time("2026-05-23T12:00:00+08:00") - Duration::hours(offset_hours);

    CommentSeed {
        id,
        post_id,
        parent_id,
        author,
        floor,
        email: format!("{}{}@example.com", author.to_lowercase(), id),
        content,
        location,
        created_at,
    }
}

/// Builds a stable URL slug from an ASCII title.
fn slugify_title(title: &str) -> String {
    let mut slug = String::new();
    let mut previous_dash = false;

    for character in title.chars().flat_map(char::to_lowercase) {
        if character.is_ascii_alphanumeric() {
            slug.push(character);
            previous_dash = false;
            continue;
        }

        if !previous_dash && !slug.is_empty() {
            slug.push('-');
            previous_dash = true;
        }
    }

    if slug.ends_with('-') {
        slug.pop();
    }

    slug
}

/// 刷新 posts 和 comments 的自增序列 / Refreshes serial sequences for posts and comments.
async fn refresh_sequences(db: &PgPool) -> SeedResult<()> {
    sqlx::query(
        r#"
        SELECT setval(
            pg_get_serial_sequence('posts', 'id')::regclass,
            (SELECT GREATEST(COALESCE(MAX(id), 1), 1) FROM posts),
            true
        )
        "#,
    )
    .execute(db)
    .await?;

    sqlx::query(
        r#"
        SELECT setval(
            pg_get_serial_sequence('comments', 'id')::regclass,
            (SELECT GREATEST(COALESCE(MAX(id), 1), 1) FROM comments),
            true
        )
        "#,
    )
    .execute(db)
    .await?;

    Ok(())
}

/// 解析 RFC3339 种子时间 / Parses an RFC3339 seed timestamp.
fn parse_seed_time(value: &str) -> DateTime<Utc> {
    DateTime::parse_from_rfc3339(value)
        .expect("seed timestamps must be RFC3339")
        .with_timezone(&Utc)
}
