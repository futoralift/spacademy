import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from data.schemas import Tag, Category
from routers.blog_taxonomy.models import (
    BlogTaxonomyResponseModel,
    CategoryCreateModel,
    CategoryResponseModel,
    TagCreateModel,
    TagResponseModel,
)
from routers.blog_taxonomy.repo import (
    fetch_categories,
    fetch_category_by_id,
    fetch_category_by_name_or_slug,
    fetch_tags,
    fetch_tag_by_id,
    fetch_tag_by_name_or_slug,
    insert_category,
    insert_tag,
    remove_category,
    remove_tag,
)
from utils.errors import ConflictError, NotFoundError, ValidationError
from utils.slug_generator import generate_slug


def _normalize_name(name: str) -> str:
    normalized = name.strip()
    if not normalized:
        raise ValidationError("Name is required")
    return normalized


def _parse_uuid(raw_id: str, field_name: str) -> uuid.UUID:
    try:
        return uuid.UUID(raw_id)
    except ValueError as exc:
        raise ValidationError(f"Invalid {field_name}", details={field_name: raw_id}) from exc


def _to_tag_response(tag: Tag) -> TagResponseModel:
    return TagResponseModel(
        id=str(tag.id),
        name=tag.name,
        slug=tag.slug,
    )


def _to_category_response(category: Category) -> CategoryResponseModel:
    return CategoryResponseModel(
        id=str(category.id),
        name=category.name,
        slug=category.slug,
    )


async def retrieve_blog_taxonomies(db: AsyncSession) -> BlogTaxonomyResponseModel:
    tags = await fetch_tags(db)
    categories = await fetch_categories(db)
    return BlogTaxonomyResponseModel(
        tags=[_to_tag_response(tag) for tag in tags],
        categories=[_to_category_response(category) for category in categories],
    )


async def create_tag(tag_req: TagCreateModel, db: AsyncSession) -> TagResponseModel:
    name = _normalize_name(tag_req.name)
    slug = generate_slug(name)

    existing_tag = await fetch_tag_by_name_or_slug(name, slug, db)
    if existing_tag is not None:
        raise ConflictError(
            "Tag already exists",
            details={"name": name, "slug": slug},
        )

    tag = Tag(
        id=uuid.uuid4(),
        name=name,
        slug=slug,
    )
    return _to_tag_response(await insert_tag(tag, db))


async def create_category(category_req: CategoryCreateModel, db: AsyncSession) -> CategoryResponseModel:
    name = _normalize_name(category_req.name)
    slug = generate_slug(name)

    existing_category = await fetch_category_by_name_or_slug(name, slug, db)
    if existing_category is not None:
        raise ConflictError(
            "Category already exists",
            details={"name": name, "slug": slug},
        )

    category = Category(
        id=uuid.uuid4(),
        name=name,
        slug=slug,
    )
    return _to_category_response(await insert_category(category, db))


async def delete_tag(tag_id: str, db: AsyncSession) -> int:
    parsed_tag_id = _parse_uuid(tag_id, "tagId")
    tag = await fetch_tag_by_id(parsed_tag_id, db)
    if tag is None:
        raise NotFoundError("Tag not found", details={"tagId": tag_id})
    return await remove_tag(parsed_tag_id, db)


async def delete_category(category_id: str, db: AsyncSession) -> int:
    parsed_category_id = _parse_uuid(category_id, "categoryId")
    category = await fetch_category_by_id(parsed_category_id, db)
    if category is None:
        raise NotFoundError("Category not found", details={"categoryId": category_id})
    return await remove_category(parsed_category_id, db)
