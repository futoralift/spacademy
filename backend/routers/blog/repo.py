import uuid
from datetime import datetime
from typing import List

from sqlalchemy import select, func, delete
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from data.schemas import Post, BlogPostStatus, post_tags, post_categories
from routers.blog.models import PostUpdateModel
from utils.errors import DatabaseError
from utils.sv_logger import sv_logger


async def fetch_post(limit: int, offset: int, db: AsyncSession) -> tuple[List[Post], int]:
    try:
        post_query = (
            select(Post)
            .options(selectinload(Post.tags), selectinload(Post.categories))
            .limit(limit)
            .offset(offset)
        )
        result = await db.execute(post_query)
        post = result.scalars().all()

        count_query = select(func.count()).select_from(Post)
        count_result = await db.execute(count_query)
        total_record = count_result.scalar()
        return post, total_record
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "failed to fetch post",
            exc_info=True,
        )
        raise DatabaseError(message=f"failed to fetch post") from se

async def fetch_active_posts(limit: int, offset: int, db: AsyncSession) -> tuple[List[Post], int]:
    try:
        post_query = (
            select(Post)
            .options(selectinload(Post.tags), selectinload(Post.categories))
            .where(Post.status == BlogPostStatus.PUBLISH)
            .order_by(Post.publishedAt.desc())
            .limit(limit)
            .offset(offset)
        )
        result = await db.execute(post_query)
        posts = result.scalars().all()

        count_query = select(func.count()).select_from(Post).where(Post.status == BlogPostStatus.PUBLISH)
        count_result = await db.execute(count_query)
        total_record = count_result.scalar() or 0
        return list(posts), total_record
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "failed to fetch active posts",
            exc_info=True,
        )
        raise DatabaseError(message=f"failed to fetch active posts") from se

async def fetch_post_by_id(post_id: str | uuid.UUID, db: AsyncSession) -> Post | None:
    try:
        result = await db.execute(
            select(Post)
            .options(selectinload(Post.tags), selectinload(Post.categories))
            .where(Post.id == post_id)
        )
        return result.scalar_one_or_none()
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "failed to fetch post by id",
            extra={"post_id": post_id},
            exc_info=True,
        )
        raise DatabaseError(message=f"failed to fetch post {post_id}") from se

async def insert_post(post: Post, db: AsyncSession) -> Post:
    try:
        db.add(post)
        await db.commit()
        await db.refresh(post)
        return post
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            f"failed to insert post data",
            exc_info=True
        )
        raise DatabaseError(message=f"failed to insert post data") from se

async def set_post(post: Post, updated_post: PostUpdateModel, db: AsyncSession) -> Post:
    try:
        post.status = updated_post.status
        post.title = updated_post.title
        post.excerpt = updated_post.excerpt
        post.content = updated_post.content
        post.featuredImage = updated_post.featuredImage
        post.metaTitle = updated_post.metaTitle
        post.metaDescription = updated_post.metaDescription
        post.slug = updated_post.slug
        post.publishedAt = datetime.now() if (updated_post.status == BlogPostStatus.PUBLISH and post.publishedAt == None) else None
        await db.commit()
        await db.refresh(post)
        return post
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "failed to update post",
            extra={"post_id": updated_post.id},
            exc_info=True,
        )
        raise DatabaseError(message=f"failed to update post {updated_post.id}") from se

async def remove_post(post_id: str | uuid.UUID, db: AsyncSession) -> int:
    try:
        # 1. Delete associations first
        await db.execute(delete(post_tags).where(post_tags.c.post_id == post_id))
        await db.execute(delete(post_categories).where(post_categories.c.post_id == post_id))

        # 2. Delete the post
        result = await db.execute(
            delete(Post).where(Post.id == post_id)
        )

        await db.commit()
        return result.rowcount
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "failed to delete post",
            extra={"post_id": post_id},
            exc_info=True,
        )
        raise DatabaseError(message=f"failed to delete post {post_id}") from se
