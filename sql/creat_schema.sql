CREATE TABLE IF NOT EXISTS posts (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT,
    summary TEXT,
    cover_image TEXT,
    keywords TEXT[] NOT NULL DEFAULT '{}',
    category TEXT,
    storage_path TEXT NOT NULL UNIQUE,
    views BIGINT NOT NULL DEFAULT 0 CHECK (views >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ
);

ALTER TABLE posts ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS summary TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS cover_image TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS keywords TEXT[] NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts (category) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_posts_slug ON posts (slug) WHERE slug IS NOT NULL;

CREATE TABLE IF NOT EXISTS projects (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    summary TEXT NOT NULL DEFAULT '',
    link TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ
);

ALTER TABLE projects ADD COLUMN IF NOT EXISTS summary TEXT NOT NULL DEFAULT '';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS link TEXT NOT NULL DEFAULT '';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_projects_sort_order
    ON projects (sort_order ASC, id ASC)
    WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS murmurs (
    id BIGSERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ
);

ALTER TABLE murmurs ADD COLUMN IF NOT EXISTS content TEXT NOT NULL DEFAULT '';
ALTER TABLE murmurs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;
ALTER TABLE murmurs ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_murmurs_created_at
    ON murmurs (created_at DESC, id DESC)
    WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS comments (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT REFERENCES posts (id) ON DELETE CASCADE,
    parent_id BIGINT REFERENCES comments (id) ON DELETE CASCADE,
    author TEXT NOT NULL,
    floor DOUBLE PRECISION NOT NULL,
    email TEXT NOT NULL,
    content TEXT NOT NULL,
    location TEXT NOT NULL,
    is_visible BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ
);

ALTER TABLE comments ADD COLUMN IF NOT EXISTS is_visible BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_comments_site_scope
    ON comments (parent_id, floor, id)
    WHERE post_id IS NULL AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_comments_article_scope
    ON comments (post_id, parent_id, floor, id)
    WHERE post_id IS NOT NULL AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_comments_visible_site_scope
    ON comments (parent_id, floor, id)
    WHERE post_id IS NULL AND deleted_at IS NULL AND is_visible = TRUE;

CREATE INDEX IF NOT EXISTS idx_comments_visible_article_scope
    ON comments (post_id, parent_id, floor, id)
    WHERE post_id IS NOT NULL AND deleted_at IS NULL AND is_visible = TRUE;

CREATE TABLE IF NOT EXISTS site_stats (
    id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    total_visits BIGINT NOT NULL DEFAULT 0 CHECK (total_visits >= 0),
    total_guests BIGINT NOT NULL DEFAULT 0 CHECK (total_guests >= 0),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS site_guests (
    guest_id TEXT PRIMARY KEY,
    first_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

TRUNCATE TABLE comments, posts, projects, murmurs, site_guests, site_stats RESTART IDENTITY CASCADE;

INSERT INTO site_stats (id, total_visits, total_guests)
VALUES (1, 0, 0);
