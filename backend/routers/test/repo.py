import uuid
from sqlalchemy import select, func, update, delete
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from data.schemas import Tests, Questions, TestAttempts, StudentAnswers, Student
from routers.test.models import (
    QuestionUpdateModel,
    TestAttemptUpdateModel,
    TestUpdateModel, StudentAnswerResponseModel,
)
from utils.errors import DatabaseError
from utils.sv_logger import sv_logger


async def fetch_tests(limit: int, offset: int, db: AsyncSession) -> tuple[list[Tests], int]:
    try:
        tests = await db.execute(select(Tests).limit(limit).offset(offset))

        count_query = select(func.count()).select_from(Tests)
        count_result = await db.execute(count_query)
        total_record = count_result.scalar()

        return tests.scalars().all(), total_record
    except SQLAlchemyError as se:
        sv_logger.error(
            "failed to fetch test data",
        )

        raise DatabaseError(message="failed to fetch test data") from se

async def fetch_tests_by_subjects(
    subject_ids: list[str],
    limit: int,
    offset: int,
    db: AsyncSession,
    published_only: bool = False
) -> tuple[list[Tests], int]:
    try:

        test_debug = await db.execute(select(Tests.subjectId))
        if not subject_ids:
            return [], 0

        try:
            ids = [uuid.UUID(sid) if isinstance(sid, str) else sid for sid in subject_ids]
        except ValueError:
            raise DatabaseError(message="Invalid subject_id format")

        query = (
            select(Tests)
            .where(Tests.subjectId.in_(ids))
        )
        if published_only:
            from data.schemas import TestStatus
            query = query.where(Tests.status == TestStatus.PUBLISHED)
        
        query = query.limit(limit).offset(offset)
        result = await db.execute(query)
        tests = result.scalars().all()

        count_query = (
            select(func.count())
            .select_from(Tests)
            .where(Tests.subjectId.in_(ids))
        )
        if published_only:
            from data.schemas import TestStatus
            count_query = count_query.where(Tests.status == TestStatus.PUBLISHED)
        count_result = await db.execute(count_query)
        total_record = count_result.scalar()

        return tests, total_record

    except SQLAlchemyError as se:
        sv_logger.error(
            "failed to fetch tests by subjects",
            extra={"subject_ids": subject_ids},
            exc_info=True
        )
        raise DatabaseError(message="failed to fetch tests by subjects") from se


async def insert_test(test: Tests, db: AsyncSession) -> Tests:
    try:
        db.add(test)
        await db.commit()
        await db.refresh(test)
        return test
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            f"failed to insert test data",
            exc_info=True
        )
        raise DatabaseError(message=f"failed to insert test data") from se

async def set_test(updated_test: TestUpdateModel, db: AsyncSession) -> Tests:
    try:
        result = await db.execute(
            update(Tests).where(Tests.id == updated_test.id).
            values(
                title=updated_test.title,
                totalMarks = updated_test.totalMarks,
                expiresAt = updated_test.expiresAt,
                subjectId = updated_test.subjectId,
                teacherId = updated_test.teacherId,
                maxAttempts = updated_test.maxAttempts,
                durationMinutes=updated_test.durationMin,
                startTime = updated_test.startTime,
                description= updated_test.description,
                mode = updated_test.mode,
                type = updated_test.type,
                status = updated_test.status,
            ).returning(Tests)
        )

        await db.commit()
        return result.scalar_one_or_none()
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "failed to update test",
            extra={"test_id": updated_test.id},
            exc_info=True,
        )
        raise DatabaseError(message=f"failed to update test {updated_test.id}") from se

async def remove_test(test_id: str, db: AsyncSession) -> int:
    try:
        result = await db.execute(
            delete(Tests).where(Tests.id == test_id)
        )

        await db.commit()
        return result.rowcount
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "failed to delete test",
            extra={"test_id": test_id},
            exc_info=True,
        )
        raise DatabaseError(message=f"failed to delete test {test_id}") from se


async def fetch_questions(limit: int, offset: int, db: AsyncSession) -> tuple[list[Questions], int]:
    try:
        questions = await db.execute(select(Questions).limit(limit).offset(offset))

        count_query = select(func.count()).select_from(Questions)
        count_result = await db.execute(count_query)
        total_record = count_result.scalar()

        return questions.scalars().all(), total_record
    except SQLAlchemyError as se:
        sv_logger.error(
            "failed to fetch question data",
        )

        raise DatabaseError(message="failed to fetch question data") from se


async def fetch_questions_by_test_id(test_id: str, limit: int, offset: int, db: AsyncSession) -> tuple[list[Questions], int]:
    try:
        questions = await db.execute(select(Questions).where(Questions.testId == test_id).limit(limit).offset(offset))

        count_query = select(func.count()).select_from(Questions).where(Questions.testId == test_id)
        count_result = await db.execute(count_query)
        total_record = count_result.scalar()

        return questions.scalars().all(), total_record
    except SQLAlchemyError as se:
        sv_logger.error(
            "failed to fetch question data by test id",
            extra={"test_id": test_id},
        )
        raise DatabaseError(message=f"failed to fetch question data for test {test_id}") from se

async def insert_question(question: Questions, db: AsyncSession) -> Questions:
    try:
        db.add(question)
        await db.commit()
        await db.refresh(question)
        return question
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            f"failed to insert question data",
            exc_info=True
        )
        raise DatabaseError(message=f"failed to insert question data") from se

async def set_question(updated_question: QuestionUpdateModel, db: AsyncSession) -> Questions:
    try:
        result = await db.execute(
            update(Questions).where(Questions.id == updated_question.id).values(
                testId=updated_question.testId,
                questionText=updated_question.questionText,
                questionImage=updated_question.questionImg,
                correctAnswer=updated_question.correctAnswer,
                correctImg=updated_question.correctAnswerImg,
                mark=updated_question.mark,
                optionA=updated_question.optionA,
                optionAImg=updated_question.optionAImg,
                optionB=updated_question.optionB,
                optionBImg=updated_question.optionBImg,
                optionC=updated_question.optionC,
                optionCImg=updated_question.optionCImg,
                optionD=updated_question.optionD,
                optionDImg=updated_question.optionDImg,
                explanation=updated_question.explanation,
                explanationImg=updated_question.explanationImg,
            ).returning(Questions)
        )

        await db.commit()
        return result.scalar_one_or_none()
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "failed to update question",
            extra={"question_id": updated_question.id},
            exc_info=True,
        )
        raise DatabaseError(message=f"failed to update question {updated_question.id}") from se

async def remove_question(question_id: str, db: AsyncSession) -> int:
    try:
        result = await db.execute(
            delete(Questions).where(Questions.id == question_id)
        )

        await db.commit()
        return result.rowcount
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "failed to delete question",
            extra={"question_id": question_id},
            exc_info=True,
        )
        raise DatabaseError(message=f"failed to delete question {question_id}") from se


async def fetch_test_attempts(limit: int, offset: int, db: AsyncSession) -> tuple[list[TestAttempts], int]:
    try:
        test_attempts = await db.execute(select(TestAttempts).limit(limit).offset(offset))

        count_query = select(func.count()).select_from(TestAttempts)
        count_result = await db.execute(count_query)
        total_record = count_result.scalar()

        return test_attempts.scalars().all(), total_record
    except SQLAlchemyError as se:
        sv_logger.error("failed to fetch test attempt data")
        raise DatabaseError(message="failed to fetch test attempt data") from se

async def fetch_test_attempts_by_test_id(test_id: str, limit: int, offset: int, db: AsyncSession) -> tuple[list[TestAttempts], int]:
    try:
        test_attempts = await db.execute(
            select(TestAttempts)
            .where(TestAttempts.testId == test_id)
            .limit(limit)
            .offset(offset)
        )

        count_query = select(func.count()).select_from(TestAttempts).where(TestAttempts.testId == test_id)
        count_result = await db.execute(count_query)
        total_record = count_result.scalar()

        return test_attempts.scalars().all(), total_record
    except SQLAlchemyError as se:
        sv_logger.error(f"failed to fetch test attempt data for test {test_id}")
        raise DatabaseError(message="failed to fetch test attempt data") from se


async def fetch_test_attempts_by_student_id(student_id: str, limit: int, offset: int, db: AsyncSession) -> tuple[list[TestAttempts], int]:
    try:
        test_attempts = await db.execute(
            select(TestAttempts)
            .where(TestAttempts.studentId == student_id)
            .options(selectinload(TestAttempts.test))
            .limit(limit)
            .offset(offset)
        )

        count_query = select(func.count()).select_from(TestAttempts).where(TestAttempts.studentId == student_id)
        count_result = await db.execute(count_query)
        total_record = count_result.scalar()

        return test_attempts.scalars().all(), total_record
    except SQLAlchemyError as se:
        sv_logger.error(f"failed to fetch test attempt data for student {student_id}")
        raise DatabaseError(message="failed to fetch test attempt data") from se


async def insert_test_attempt(test_attempt: TestAttempts, db: AsyncSession) -> TestAttempts:
    try:
        db.add(test_attempt)
        await db.commit()
        await db.refresh(test_attempt)
        return test_attempt
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error("failed to insert test attempt data", exc_info=True)
        raise DatabaseError(message="failed to insert test attempt data") from se


async def set_test_attempt(updated_test_attempt: TestAttemptUpdateModel, db: AsyncSession) -> TestAttempts:
    try:
        result = await db.execute(
            update(TestAttempts)
            .where(TestAttempts.id == updated_test_attempt.id)
            .where(TestAttempts.studentId == updated_test_attempt.studentId)
            .values(
                attempts=updated_test_attempt.attempts,
                obtainedMarks=updated_test_attempt.obtainedMarks
            )
            .returning(TestAttempts)
        )

        await db.commit()
        return result.scalar_one_or_none()
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "failed to update test attempt",
            extra={"test_id": updated_test_attempt.testId, "student_id": updated_test_attempt.studentId},
            exc_info=True,
        )
        raise DatabaseError(
            message=f"failed to update test attempt {updated_test_attempt.testId}/{updated_test_attempt.studentId}"
        ) from se


async def remove_test_attempt(attempt_id: str, db: AsyncSession) -> int:
    try:
        result = await db.execute(
            delete(TestAttempts)
            .where(TestAttempts.id == attempt_id)
        )

        await db.commit()
        return result.rowcount
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "failed to delete test attempt",
            extra={"attempt_id": attempt_id},
            exc_info=True,
        )
        raise DatabaseError(message=f"failed to delete test attempt {attempt_id}") from se


async def fetch_student_answers(limit: int, offset: int, db: AsyncSession) -> tuple[list[StudentAnswers], int]:
    try:
        student_answers = await db.execute(
            select(StudentAnswers)
            .options(
                selectinload(StudentAnswers.question),
                selectinload(StudentAnswers.test),
                selectinload(StudentAnswers.student).selectinload(Student.user)
            )
            .limit(limit)
            .offset(offset)
        )

        count_query = select(func.count()).select_from(StudentAnswers)
        count_result = await db.execute(count_query)
        total_record = count_result.scalar()

        return student_answers.scalars().all(), total_record
    except SQLAlchemyError as se:
        sv_logger.error("failed to fetch student answer data")
        raise DatabaseError(message="failed to fetch student answer data") from se


async def fetch_student_answers_by_student_id(student_id: str, limit: int, offset: int, db: AsyncSession) -> tuple[list[StudentAnswers], int]:
    try:
        student_answers = await db.execute(
            select(StudentAnswers)
            .where(StudentAnswers.studentId == student_id)
            .options(
                selectinload(StudentAnswers.question),
                selectinload(StudentAnswers.test),
                selectinload(StudentAnswers.student).selectinload(Student.user)
            )
            .limit(limit)
            .offset(offset)
        )

        count_query = select(func.count()).select_from(StudentAnswers).where(StudentAnswers.studentId == student_id)
        count_result = await db.execute(count_query)
        total_record = count_result.scalar()

        return student_answers.scalars().all(), total_record
    except SQLAlchemyError as se:
        sv_logger.error("failed to fetch student answer data")
        raise DatabaseError(message="failed to fetch student answer data") from se


async def fetch_student_answers_by_test_id(test_id: str, limit: int, offset: int, db: AsyncSession) -> tuple[list[StudentAnswers], int]:
    try:
        student_answers = await db.execute(
            select(StudentAnswers)
            .where(StudentAnswers.testId == test_id)
            .options(
                selectinload(StudentAnswers.question),
                selectinload(StudentAnswers.student).selectinload(Student.user),
                selectinload(StudentAnswers.test)
            )
            .limit(limit)
            .offset(offset)
        )

        count_query = select(func.count()).select_from(StudentAnswers).where(StudentAnswers.testId == test_id)
        count_result = await db.execute(count_query)
        total_record = count_result.scalar()

        return student_answers.scalars().all(), total_record
    except SQLAlchemyError as se:
        sv_logger.error("failed to fetch student answer data by test id")
        raise DatabaseError(message="failed to fetch student answer data") from se


async def insert_student_answer(student_answer: StudentAnswers, db: AsyncSession) -> StudentAnswers:
    try:
        db.add(student_answer)
        await db.commit()
        await db.refresh(student_answer)
        return student_answer
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error("failed to insert student answer data", exc_info=True)
        raise DatabaseError(message="failed to insert student answer data") from se


async def set_student_answer(updated_student_answer: StudentAnswerResponseModel, db: AsyncSession) -> StudentAnswers:
    try:
        result = await db.execute(
            update(StudentAnswers)
            .where(StudentAnswers.id == updated_student_answer.id)
            .where(StudentAnswers.questionId == updated_student_answer.questionId)
            .where(StudentAnswers.studentId == updated_student_answer.studentId)
            .values(answer=updated_student_answer.answer)
            .returning(StudentAnswers)
        )

        await db.commit()
        return result.scalar_one_or_none()
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "failed to update student answer",
            extra={
                "test_id": updated_student_answer.testId,
                "question_id": updated_student_answer.questionId,
                "student_id": updated_student_answer.studentId,
            },
            exc_info=True,
        )
        raise DatabaseError(
            message=(
                f"failed to update student answer "
                f"{updated_student_answer.testId}/{updated_student_answer.questionId}/{updated_student_answer.studentId}"
            )
        ) from se


async def remove_student_answer(student_answer_id: str, db: AsyncSession) -> int:
    try:
        result = await db.execute(
            delete(StudentAnswers)
            .where(StudentAnswers.id == student_answer_id)
        )

        await db.commit()
        return result.rowcount
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "failed to delete student answer",
            extra={"student_answer_id": student_answer_id},
            exc_info=True,
        )
        raise DatabaseError(message=f"failed to delete student answer {student_answer_id}") from se
