use crate::error::{AppError, AppResult};
use crate::modules::comment::dto::{
    CommentDto, CommentListQuery, CreateArticleCommentRequest, CreateSiteCommentRequest, NewComment,
};
use crate::modules::comment::repo;
use crate::modules::post;
use crate::response::Page;
use crate::utils::pagination::{normalize_paging, parse_positive};
use sqlx::PgPool;

const ROOT_COMMENT_PAGE_SIZE: u32 = 10;

pub async fn list_site_comments(
    db: &PgPool,
    query: CommentListQuery,
) -> AppResult<Page<CommentDto>> {
    let (page, page_size) = normalize_paging(
        query.page.as_deref(),
        query.page_size.as_deref(),
        ROOT_COMMENT_PAGE_SIZE,
    );
    let parent_id = parse_optional_i64(query.parent_id.as_deref(), "parentId")?;
    let (comments, total) = repo::list_site_comments(db, parent_id, page, page_size).await?;
    let data = comments.into_iter().map(CommentDto::from).collect();

    Ok(Page::new(data, page, page_size, total))
}

pub async fn list_article_comments(
    db: &PgPool,
    query: CommentListQuery,
) -> AppResult<Page<CommentDto>> {
    let (page, page_size) = normalize_paging(
        query.page.as_deref(),
        query.page_size.as_deref(),
        ROOT_COMMENT_PAGE_SIZE,
    );
    let post_id = parse_required_positive_i64(query.post_id.as_deref(), "postId")?;
    let parent_id = parse_optional_i64(query.parent_id.as_deref(), "parentId")?;
    let (comments, total) =
        repo::list_article_comments(db, post_id, parent_id, page, page_size).await?;
    let data = comments.into_iter().map(CommentDto::from).collect();

    Ok(Page::new(data, page, page_size, total))
}

pub async fn create_site_comment(
    db: &PgPool,
    request: CreateSiteCommentRequest,
    location: String,
) -> AppResult<CommentDto> {
    create_comment(
        db,
        NewComment {
            post_id: None,
            parent_id: request.parent_id,
            author: request.author,
            email: request.email,
            content: request.content,
            location,
        },
    )
    .await
}

pub async fn create_article_comment(
    db: &PgPool,
    request: CreateArticleCommentRequest,
    location: String,
) -> AppResult<CommentDto> {
    if !post::repo::post_exists(db, request.post_id).await? {
        return Err(AppError::BadRequest("postId does not exist".to_owned()));
    }

    create_comment(
        db,
        NewComment {
            post_id: Some(request.post_id),
            parent_id: request.parent_id,
            author: request.author,
            email: request.email,
            content: request.content,
            location,
        },
    )
    .await
}

async fn create_comment(db: &PgPool, mut new_comment: NewComment) -> AppResult<CommentDto> {
    sanitize_comment(&mut new_comment)?;

    let floor = if let Some(parent_id) = new_comment.parent_id {
        let parent = repo::find_comment_in_scope(db, parent_id, new_comment.post_id)
            .await?
            .ok_or_else(|| AppError::BadRequest("parentId does not exist".to_owned()))?;

        repo::next_reply_floor(db, &parent, new_comment.post_id).await?
    } else {
        repo::next_root_floor(db, new_comment.post_id).await?
    };

    let comment = repo::insert_comment(db, new_comment, floor).await?;

    Ok(CommentDto::from(comment))
}

fn sanitize_comment(comment: &mut NewComment) -> AppResult<()> {
    comment.author = comment.author.trim().to_owned();
    comment.email = comment.email.trim().to_owned();
    comment.content = comment.content.trim().to_owned();
    comment.location = comment.location.trim().to_owned();

    if comment.author.is_empty() || comment.author.len() > 80 {
        return Err(AppError::BadRequest(
            "author must be between 1 and 80 characters".to_owned(),
        ));
    }

    if comment.email.is_empty() || comment.email.len() > 255 || !comment.email.contains('@') {
        return Err(AppError::BadRequest("email is invalid".to_owned()));
    }

    if comment.content.is_empty() || comment.content.len() > 5000 {
        return Err(AppError::BadRequest(
            "content must be between 1 and 5000 characters".to_owned(),
        ));
    }

    if comment.location.is_empty() {
        comment.location = "Unknown".to_owned();
    }

    Ok(())
}

fn parse_optional_i64(value: Option<&str>, field: &str) -> AppResult<Option<i64>> {
    match value {
        Some(value) if value.trim().is_empty() => Ok(None),
        Some(value) => value
            .parse::<i64>()
            .ok()
            .filter(|value| *value > 0)
            .map(Some)
            .ok_or_else(|| AppError::BadRequest(format!("{field} must be a positive integer"))),
        None => Ok(None),
    }
}

fn parse_required_positive_i64(value: Option<&str>, field: &str) -> AppResult<i64> {
    let parsed = parse_positive(value)
        .map(i64::from)
        .ok_or_else(|| AppError::BadRequest(format!("{field} must be a positive integer")))?;

    Ok(parsed)
}

#[cfg(test)]
mod tests {
    use super::{sanitize_comment, NewComment};

    #[test]
    fn trims_comment_fields() {
        let mut comment = NewComment {
            post_id: None,
            parent_id: None,
            author: " Ada ".to_owned(),
            email: " ada@example.com ".to_owned(),
            content: " hello ".to_owned(),
            location: " Shanghai ".to_owned(),
        };

        sanitize_comment(&mut comment).unwrap();

        assert_eq!(comment.author, "Ada");
        assert_eq!(comment.email, "ada@example.com");
        assert_eq!(comment.content, "hello");
        assert_eq!(comment.location, "Shanghai");
    }
}
