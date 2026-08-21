from typing import List

import uuid

from sqlalchemy import select, delete
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from data.schemas import Tag, Category
from utils.errors import DatabaseError
from utils.sv_logger import sv_logger


async def fetch_tags(db: AsyncSession) -> List[Tag]:
    try:
        result = await db.execute(select(Tag).order_by(Tag.name.asc()))
        return result.scalars().all()
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "failed to fetch tags",
            exc_info=True,
        )
        raise DatabaseError(message="failed to fetch tags") from se


async def fetch_categories(db: AsyncSession) -> List[Category]:
    try:
        result = await db.execute(select(Category).order_by(Category.name.asc()))
        return result.scalars().all()
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "failed to fetch categories",
            exc_info=True,
        )
        raise DatabaseError(message="failed to fetch categories") from se


async def fetch_tag_by_name_or_slug(name: str, slug: str, db: AsyncSession) -> Tag | None:
    try:
        result = await db.execute(
            select(Tag).where((Tag.name == name) | (Tag.slug == slug))
        )
        return result.scalar_one_or_none()
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "failed to fetch tag by name or slug",
            extra={"name": name, "slug": slug},
            exc_info=True,
        )
        raise DatabaseError(message="failed to fetch tag") from se


async def fetch_category_by_name_or_slug(name: str, slug: str, db: AsyncSession) -> Category | None:
    try:
        result = await db.execute(
            select(Category).where((Category.name == name) | (Category.slug == slug))
        )
        return result.scalar_one_or_none()
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "failed to fetch category by name or slug",
            extra={"name": name, "slug": slug},
            exc_info=True,
        )
        raise DatabaseError(message="failed to fetch category") from se


async def insert_tag(tag: Tag, db: AsyncSession) -> Tag:
    try:
        db.add(tag)
        await db.commit()
        await db.refresh(tag)
        return tag
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "failed to insert tag",
            extra={"tag_id": str(tag.id)},
            exc_info=True,
        )
        raise DatabaseError(message="failed to insert tag", details={"tagId": tag.id}) from se


async def insert_category(category: Category, db: AsyncSession) -> Category:
    try:
        db.add(category)
        await db.commit()
        await db.refresh(category)
        return category
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "failed to insert category",
            extra={"category_id": str(category.id)},
            exc_info=True,
        )
        raise DatabaseError(message="failed to insert category", details={"categoryId": category.id}) from se


async def fetch_tag_by_id(tag_id: str | uuid.UUID, db: AsyncSession) -> Tag | None:
    try:
        result = await db.execute(select(Tag).where(Tag.id == tag_id))
        return result.scalar_one_or_none()
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "failed to fetch tag by id",
            extra={"tag_id": str(tag_id)},
            exc_info=True,
        )
        raise DatabaseError(message=f"failed to fetch tag {tag_id}") from se


async def fetch_category_by_id(category_id: str | uuid.UUID, db: AsyncSession) -> Category | None:
    try:
        result = await db.execute(select(Category).where(Category.id == category_id))
        return result.scalar_one_or_none()
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "failed to fetch category by id",
            extra={"category_id": str(category_id)},
            exc_info=True,
        )
        raise DatabaseError(message=f"failed to fetch category {category_id}") from se


async def remove_tag(tag_id: str | uuid.UUID, db: AsyncSession) -> int:
    try:
        result = await db.execute(delete(Tag).where(Tag.id == tag_id))
        await db.commit()
        return result.rowcount
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "failed to delete tag",
            extra={"tag_id": str(tag_id)},
            exc_info=True,
        )
        raise DatabaseError(message=f"failed to delete tag {tag_id}") from se


async def remove_category(category_id: str | uuid.UUID, db: AsyncSession) -> int:
    try:
        result = await db.execute(delete(Category).where(Category.id == category_id))
        await db.commit()
        return result.rowcount
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "failed to delete category",
            extra={"category_id": str(category_id)},
            exc_info=True,
        )
        raise DatabaseError(message=f"failed to delete category {category_id}") from se
