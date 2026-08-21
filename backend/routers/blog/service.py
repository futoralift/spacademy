import math
import uuid
from datetime import datetime

from fastapi import UploadFile
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from data.schemas import Post, BlogPostStatus, Tag, Category, MediaType
from routers.blog.models import PaginationPostResponse, PostOut, PostCreate, PostUpdateModel, CategoryOut, TagOut
from routers.blog.repo import set_post, fetch_post, fetch_post_by_id, insert_post, remove_post, fetch_active_posts
from routers.media_library.asset_manager import register_media_asset, replace_media_asset, \
    delete_registered_media_asset_by_path
from utils.const import StoragePath
from utils.errors import NotFoundError, ValidationError
from utils.files.file_handler import store_file, delete_file
from utils.slug_generator import generate_slug


def _parse_uuid_list(raw_ids: list[str], field_name: str) -> list[uuid.UUID]:
    try:
        return [uuid.UUID(raw_id) for raw_id in raw_ids]
    except ValueError as exc:
        raise ValidationError(f"Invalid {field_name}", details={field_name: raw_ids}) from exc


async def _resolve_post_relations(post_req: PostCreate | PostUpdateModel, db: AsyncSession) -> tuple[list[Tag], list[Category]]:
    tags: list[Tag] = []
    categories: list[Category] = []

    if post_req.tagIds:
        tag_ids = _parse_uuid_list(post_req.tagIds, "tagIds")
        tag_result = await db.execute(select(Tag).where(Tag.id.in_(tag_ids)))
        tags = tag_result.scalars().all()
        found_tag_ids = {str(tag.id) for tag in tags}
        missing_tag_ids = [tag_id for tag_id in post_req.tagIds if tag_id not in found_tag_ids]
        if missing_tag_ids:
            raise NotFoundError("Tag not found", details={"tagIds": missing_tag_ids})

    if post_req.categoryIds:
        category_ids = _parse_uuid_list(post_req.categoryIds, "categoryIds")
        category_result = await db.execute(select(Category).where(Category.id.in_(category_ids)))
        categories = category_result.scalars().all()
        found_category_ids = {str(category.id) for category in categories}
        missing_category_ids = [category_id for category_id in post_req.categoryIds if category_id not in found_category_ids]
        if missing_category_ids:
            raise NotFoundError("Category not found", details={"categoryIds": missing_category_ids})

    return tags, categories

def _to_post_out(post: Post) -> PostOut:
    return PostOut(
        id=str(post.id),
        status=post.status,
        slug=post.slug,
        title=post.title,
        excerpt=post.excerpt,
        content=post.content,
        featuredImage=post.featuredImage,
        tagIds=[str(tag.id) for tag in post.tags],
        categoryIds=[str(category.id) for category in post.categories],
        tags=[TagOut(id=str(tag.id), name=tag.name) for tag in post.tags],
        categories=[CategoryOut(id=str(category.id), name=category.name) for category in post.categories],
        metaTitle=post.metaTitle,
        metaDescription=post.metaDescription,
        createdAt=post.createdAt,
        updatedAt=post.updatedAt,
        publishedAt=post.publishedAt,
    )


async def retrieve_all_post(limit: int, offset: int, db: AsyncSession) -> PaginationPostResponse:
    post_list, total_records = await fetch_post(limit=limit, offset=offset, db=db)
    data = [_to_post_out(post) for post in post_list]

    return PaginationPostResponse(
        data=data,
        record=len(data),
        totalRecord=total_records,
        page=(offset // limit) + 1,
        totalPages=math.ceil(total_records / limit),
    )

async def retrieve_public_posts(limit: int, offset: int, db: AsyncSession) -> PaginationPostResponse:
    post_list, total_records = await fetch_active_posts(limit=limit, offset=offset, db=db)
    data = [_to_post_out(post) for post in post_list]

    return PaginationPostResponse(
        data=data,
        record=len(data),
        totalRecord=total_records,
        page=(offset // limit) + 1,
        totalPages=math.ceil(total_records / limit if limit > 0 else 1),
    )

async def create_post(post_req: PostCreate, thumbnail: UploadFile | None, db: AsyncSession) -> PostOut:
    tags, categories = await _resolve_post_relations(post_req, db)
    post_id = uuid.uuid4()
    
    featured_image_path = None
    if thumbnail is not None and thumbnail.filename:
        featured_image_path = await store_file(dir_path=StoragePath.BLOG_DIR, uid=post_id, file=thumbnail)

    post = Post(
        id=post_id,
        status=BlogPostStatus.DRAFT,
        title=post_req.title,
        excerpt=post_req.excerpt,
        slug=generate_slug(post_req.title),
        content=post_req.content,
        featuredImage=featured_image_path,
        metaTitle=post_req.metaTitle,
        metaDescription=post_req.metaDescription,
        createdAt=datetime.now(),
        updatedAt=datetime.now(),
        publishedAt=None,
        tags=tags,
        categories=categories,
    )

    new_post = await insert_post(post, db)
    
    if featured_image_path:
        await register_media_asset(
            file_path=featured_image_path,
            title=post_req.title,
            media_type=MediaType.BLOG,
            original_filename=thumbnail.filename if thumbnail else "featured_image",
            content_type=thumbnail.content_type if thumbnail else "image/jpeg",
            db=db,
        )
        
    new_post = await fetch_post_by_id(new_post.id, db) or new_post

    return _to_post_out(new_post)

async def modify_post(updated_post: PostUpdateModel, thumbnail: UploadFile | None, db: AsyncSession) -> PostOut:
    try:
        post_id = uuid.UUID(updated_post.id)
    except ValueError as exc:
        raise ValidationError("Invalid postId", details={"postId": updated_post.id}) from exc

    post = await fetch_post_by_id(post_id, db)
    if post is None:
        raise NotFoundError("Post not found", details={"postId": updated_post.id})

    tags, categories = await _resolve_post_relations(updated_post, db)
    post.tags = tags
    post.categories = categories

    if thumbnail is not None and thumbnail.filename:
        old_image_path = post.featuredImage
        post.featuredImage = await store_file(dir_path=StoragePath.BLOG_DIR, uid=post.id, file=thumbnail)
        
        if old_image_path:
            await replace_media_asset(
                old_path=old_image_path,
                new_path=post.featuredImage,
                title=updated_post.title,
                media_type=MediaType.BLOG,
                original_filename=thumbnail.filename,
                content_type=thumbnail.content_type,
                db=db
            )
            delete_file(old_image_path)
        else:
             await register_media_asset(
                file_path=post.featuredImage,
                title=updated_post.title,
                media_type=MediaType.BLOG,
                original_filename=thumbnail.filename,
                content_type=thumbnail.content_type,
                db=db,
            )

    # Carry over the featured image path to the update model to prevent overwriting with None
    updated_post.featuredImage = post.featuredImage
    modified_post = await set_post(post=post, updated_post=updated_post, db=db)
    modified_post = await fetch_post_by_id(modified_post.id, db) or modified_post
    return _to_post_out(modified_post)

async def delete_post(post_id: str, db: AsyncSession) -> int:
    try:
        pid = uuid.UUID(post_id)
    except ValueError as exc:
        raise ValidationError("Invalid postId", details={"postId": post_id}) from exc

    post = await fetch_post_by_id(pid, db)
    if post is None:
        raise NotFoundError("Post not found", details={"postId": post_id})

    if post.featuredImage:
        await delete_registered_media_asset_by_path(file_path=post.featuredImage, db=db)
        delete_file(post.featuredImage)

    return await remove_post(pid, db)

async def retrieve_post_by_id(post_id: str, db: AsyncSession) -> PostOut:
    try:
        pid = uuid.UUID(post_id)
    except ValueError as exc:
        raise ValidationError("Invalid postId", details={"postId": post_id}) from exc
        
    post = await fetch_post_by_id(pid, db)
    if post is None:
        raise NotFoundError("Post not found", details={"postId": post_id})
    return _to_post_out(post)
