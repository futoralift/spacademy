import math
import uuid
from sqlalchemy.ext.asyncio import AsyncSession

from data.schemas import Tests, Questions, TestAttempts, StudentAnswers
from routers.students.repo import fetch_student_profile_by_user_id, fetch_student_by_id
from routers.test.models import (
    PaginationQuestionResponse,
    PaginationStudentAnswerResponse,
    PaginationTestResponse,
    PaginationTestAttemptResponse,
    QuestionRequestModel,
    QuestionResponseModel,
    QuestionUpdateModel,
    StudentAnswerRequestModel,
    StudentAnswerResponseModel,
    TestAttemptRequestModel,
    TestAttemptResponseModel,
    TestAttemptUpdateModel,
    TestRequestModel,
    TestResponseModel,
    TestUpdateModel, StudentAnswerDetailResponseModel,
)
from routers.test.repo import (
    fetch_questions,
    fetch_questions_by_test_id,
    fetch_student_answers,
    fetch_student_answers_by_test_id,
    fetch_test_attempts,
    fetch_tests,
    fetch_tests_by_subjects,
    insert_question,
    insert_student_answer,
    insert_test,
    insert_test_attempt,
    remove_question,
    remove_student_answer,
    remove_test,
    remove_test_attempt,
    set_question,
    set_student_answer,
    set_test,
    set_test_attempt, 
    fetch_student_answers_by_student_id,
    fetch_test_attempts_by_test_id,
    fetch_test_attempts_by_student_id
)
from utils.errors import DatabaseError


async def retrieve_all_test(limit: int, offset: int, db: AsyncSession) -> PaginationTestResponse:
    test_list, total_records = await fetch_tests(limit=limit, offset=offset, db=db)

    data = [
        TestResponseModel(
            id=str(test.id),
            title=test.title,
            durationMin=test.durationMinutes,
            totalMarks=test.totalMarks,
            startTime=test.startTime,
            createdAt=test.createdAt,
            expiresAt=test.expiresAt,
            maxAttempts=test.maxAttempts,
            description=test.description,
            mode=test.mode,
            type=test.type,
            subjectId=str(test.subjectId),
            teacherId=str(test.teacherId),
            status=test.status
        )
        for test in test_list
    ]

    return PaginationTestResponse(
        data=data,
        record=len(data),
        totalRecord=total_records,
        page=(offset // limit) + 1,
        totalPages=math.ceil(total_records / limit),
    )

async def retrieve_student_tests(subject_ids: list[str], limit: int, offset: int, db: AsyncSession) -> PaginationTestResponse:
    test_list, total_records = await fetch_tests_by_subjects(subject_ids=subject_ids, limit=limit, offset=offset, db=db, published_only=True)
    data = [
        TestResponseModel(
            id=str(test.id),
            title=test.title,
            durationMin=test.durationMinutes,
            totalMarks=test.totalMarks,
            startTime=test.startTime,
            createdAt=test.createdAt,
            expiresAt=test.expiresAt,
            maxAttempts=test.maxAttempts,
            description=test.description,
            mode=test.mode,
            type=test.type,
            subjectId=str(test.subjectId),
            teacherId=str(test.teacherId),
            status=test.status
        )
        for test in test_list
    ]

    return PaginationTestResponse(
        data=data,
        record=len(data),
        totalRecord=total_records,
        page=(offset // limit) + 1,
        totalPages=math.ceil(total_records / limit),
    )

async def create_test(test_req: TestRequestModel, db: AsyncSession) -> TestResponseModel:
    test = Tests(
        id=uuid.uuid4(),
        title=test_req.title,
        durationMinutes=test_req.durationMin,
        totalMarks=test_req.totalMarks,
        startTime=test_req.startTime,
        createdAt=test_req.createdAt,
        expiresAt=test_req.expiresAt,
        maxAttempts=test_req.maxAttempts,
        subjectId=test_req.subjectId,
        teacherId=test_req.teacherId,
        description=test_req.description,
        mode=test_req.mode,
        type=test_req.type,
        status=test_req.status,
    )

    new_test = await insert_test(test, db)

    return TestResponseModel(
        id=str(new_test.id),
        title=new_test.title,
        subjectId=str(new_test.subjectId),
        teacherId=str(new_test.teacherId),
        createdAt=new_test.createdAt,
        expiresAt=new_test.expiresAt,
        maxAttempts=new_test.maxAttempts,
        durationMin=new_test.durationMinutes,
        startTime=new_test.startTime,
        totalMarks=new_test.totalMarks,
        description=new_test.description,
        mode=new_test.mode,
        type=new_test.type,
        status=new_test.status,
    )

async def modify_test(updated_test: TestUpdateModel, db: AsyncSession) -> TestResponseModel:
    modified_test = await set_test(updated_test=updated_test, db=db)

    return TestResponseModel(
        id=str(modified_test.id),
        title=modified_test.title,
        subjectId=str(modified_test.subjectId),
        teacherId=str(modified_test.teacherId),
        createdAt=modified_test.createdAt,
        expiresAt=modified_test.expiresAt,
        maxAttempts=modified_test.maxAttempts,
        totalMarks=modified_test.totalMarks,
        durationMin=modified_test.durationMinutes,
        startTime=modified_test.startTime,
        description=modified_test.description,
        mode=modified_test.mode,
        type=modified_test.type,
        status=modified_test.status,
    )

async def delete_test(test_id: str, db: AsyncSession) -> int:
    return await remove_test(test_id, db)


async def retrieve_all_question(limit: int, offset: int, db: AsyncSession) -> PaginationQuestionResponse:
    question_list, total_records = await fetch_questions(limit=limit, offset=offset, db=db)

    data = [
        QuestionResponseModel(
            id=str(question.id),
            testId=str(question.testId),
            questionText=question.questionText,
            questionImg=question.questionImage,
            correctAnswer=question.correctAnswer,
            correctAnswerImg=question.correctImg,
            mark=question.mark,
            optionA=question.optionA,
            optionAImg=question.optionAImg,
            optionB=question.optionB,
            optionBImg=question.optionBImg,
            optionC=question.optionC,
            optionCImg=question.optionCImg,
            optionD=question.optionD,
            optionDImg=question.optionDImg,
            explanation=question.explanation,
            explanationImg=question.explanationImg,
        )
        for question in question_list
    ]

    return PaginationQuestionResponse(
        data=data,
        record=len(data),
        totalRecord=total_records,
        page=(offset // limit) + 1,
        totalPages=math.ceil(total_records / limit) if total_records else 0,
    )


async def retrieve_questions_by_test_id(test_id: str, limit: int, offset: int, db: AsyncSession, is_staff: bool = False) -> PaginationQuestionResponse:
    question_list, total_records = await fetch_questions_by_test_id(test_id=test_id, limit=limit, offset=offset, db=db)

    # If it's a student, check if they are allowed to see the answers yet
    can_see_answers = is_staff
    if not is_staff:
        from sqlalchemy import select
        from data.schemas import Tests
        from datetime import datetime
        res = await db.execute(select(Tests).where(Tests.id == test_id))
        test = res.scalar_one_or_none()
        if test:
            now = datetime.now(test.expiresAt.tzinfo)
            can_see_answers = test.expiresAt < now

    data = [
        QuestionResponseModel(
            id=str(q.id),
            testId=str(q.testId),
            questionText=q.questionText,
            questionImg=q.questionImage,
            correctAnswer=q.correctAnswer if can_see_answers else None,
            correctAnswerImg=q.correctImg if can_see_answers else None,
            mark=q.mark,
            optionA=q.optionA,
            optionAImg=q.optionAImg,
            optionB=q.optionB,
            optionBImg=q.optionBImg,
            optionC=q.optionC,
            optionCImg=q.optionCImg,
            optionD=q.optionD,
            optionDImg=q.optionDImg,
            explanation=q.explanation if can_see_answers else None,
            explanationImg=q.explanationImg if can_see_answers else None,
        )
        for q in question_list
    ]

    return PaginationQuestionResponse(
        data=data,
        record=len(data),
        totalRecord=total_records,
        page=(offset // limit) + 1,
        totalPages=math.ceil(total_records / limit) if total_records else 0,
    )

async def create_question(question_req: QuestionRequestModel, db: AsyncSession) -> QuestionResponseModel:
    question = Questions(
        id=uuid.uuid4(),
        testId=question_req.testId,
        questionText=question_req.questionText,
        questionImage=question_req.questionImg,
        correctAnswer=question_req.correctAnswer,
        correctImg=question_req.correctAnswerImg,
        mark=question_req.mark,
        optionA=question_req.optionA,
        optionAImg=question_req.optionAImg,
        optionB=question_req.optionB,
        optionBImg=question_req.optionBImg,
        optionC=question_req.optionC,
        optionCImg=question_req.optionCImg,
        optionD=question_req.optionD,
        optionDImg=question_req.optionDImg,
        explanation=question_req.explanation,
        explanationImg=question_req.explanationImg,
    )

    new_question = await insert_question(question, db)

    return QuestionResponseModel(
        id=str(new_question.id),
        testId=str(new_question.testId),
        questionText=new_question.questionText,
        questionImg=new_question.questionImage,
        correctAnswer=new_question.correctAnswer,
        correctAnswerImg=new_question.correctImg,
        mark=new_question.mark,
        optionA=new_question.optionA,
        optionAImg=new_question.optionAImg,
        optionB=new_question.optionB,
        optionBImg=new_question.optionBImg,
        optionC=new_question.optionC,
        optionCImg=new_question.optionCImg,
        optionD=new_question.optionD,
        optionDImg=new_question.optionDImg,
        explanation=new_question.explanation,
        explanationImg=new_question.explanationImg,
    )

async def modify_question(updated_question: QuestionUpdateModel, db: AsyncSession) -> QuestionResponseModel:
    modified_question = await set_question(updated_question=updated_question, db=db)

    return QuestionResponseModel(
        id=str(modified_question.id),
        testId=str(modified_question.testId),
        questionText=modified_question.questionText,
        questionImg=modified_question.questionImage,
        correctAnswer=modified_question.correctAnswer,
        correctAnswerImg=modified_question.correctImg,
        mark=modified_question.mark,
        optionA=modified_question.optionA,
        optionAImg=modified_question.optionAImg,
        optionB=modified_question.optionB,
        optionBImg=modified_question.optionBImg,
        optionC=modified_question.optionC,
        optionCImg=modified_question.optionCImg,
        optionD=modified_question.optionD,
        optionDImg=modified_question.optionDImg,
        explanation=modified_question.explanation,
        explanationImg=modified_question.explanationImg,
    )

async def delete_question(question_id: str, db: AsyncSession) -> int:
    return await remove_question(question_id, db)


async def retrieve_all_test_attempt(limit: int, offset: int, db: AsyncSession) -> PaginationTestAttemptResponse:
    test_attempt_list, total_records = await fetch_test_attempts(limit=limit, offset=offset, db=db)
 
    data = []
    for test_attempt in test_attempt_list:
        student_profile = await fetch_student_by_id(str(test_attempt.studentId), db)
        data.append(
            TestAttemptResponseModel(
                id=str(test_attempt.id),
                testId=str(test_attempt.testId),
                studentId=str(student_profile.userId) if student_profile else str(test_attempt.studentId),
                attempts=test_attempt.attempts,
                obtainedMarks=test_attempt.obtainedMarks,
            )
        )
 
    return PaginationTestAttemptResponse(
        data=data,
        record=len(data),
        totalRecord=total_records,
        page=(offset // limit) + 1,
        totalPages=math.ceil(total_records / limit),
    )

async def retrieve_test_attempts_by_test_id(test_id: str, limit: int, offset: int, db: AsyncSession) -> PaginationTestAttemptResponse:
    test_attempt_list, total_records = await fetch_test_attempts_by_test_id(test_id=test_id, limit=limit, offset=offset, db=db)
 
    data = []
    for test_attempt in test_attempt_list:
        student_profile = await fetch_student_by_id(str(test_attempt.studentId), db)
        data.append(
            TestAttemptResponseModel(
                id=str(test_attempt.id),
                testId=str(test_attempt.testId),
                studentId=str(student_profile.userId) if student_profile else str(test_attempt.studentId),
                attempts=test_attempt.attempts,
                obtainedMarks=test_attempt.obtainedMarks,
            )
        )
 
    return PaginationTestAttemptResponse(
        data=data,
        record=len(data),
        totalRecord=total_records,
        page=(offset // limit) + 1,
        totalPages=math.ceil(total_records / limit),
    )


async def retrieve_test_attempts_by_student_id(student_id: str, limit: int, offset: int, is_staff: bool, db: AsyncSession) -> PaginationTestAttemptResponse:
    # student_id here is actually the userId based on our mapping
    student_profile = await fetch_student_profile_by_user_id(student_id, db)
    if not student_profile:
        return PaginationTestAttemptResponse(data=[], record=0, totalRecord=0, page=1, totalPages=0)

    test_attempt_list, total_records = await fetch_test_attempts_by_student_id(student_id=str(student_profile.id), limit=limit, offset=offset, db=db)

    data = []
    for test_attempt in test_attempt_list:
        # Only show marks if the test deadline has passed or if requester is staff
        from datetime import datetime
        now = datetime.now(test_attempt.test.expiresAt.tzinfo)
        can_see_results = is_staff or test_attempt.test.expiresAt < now

        data.append(
            TestAttemptResponseModel(
                id=str(test_attempt.id),
                testId=str(test_attempt.testId),
                studentId=student_id,
                attempts=test_attempt.attempts,
                obtainedMarks=test_attempt.obtainedMarks if can_see_results else None,
            )
        )

    return PaginationTestAttemptResponse(
        data=data,
        record=len(data),
        totalRecord=total_records,
        page=(offset // limit) + 1,
        totalPages=math.ceil(total_records / limit),
    )


async def create_test_attempt(test_attempt_req: TestAttemptRequestModel, db: AsyncSession) -> TestAttemptResponseModel:
    student_profile = await fetch_student_profile_by_user_id(test_attempt_req.studentId, db)
    if not student_profile:
        raise DatabaseError(message=f"Student profile not found for user {test_attempt_req.studentId}")
    
    test_attempt = TestAttempts(
        id=uuid.uuid4(),
        testId=test_attempt_req.testId,
        studentId=student_profile.id,
        attempts=test_attempt_req.attempts,
        obtainedMarks=test_attempt_req.obtainedMarks,
    )

    new_test_attempt = await insert_test_attempt(test_attempt, db)

    return TestAttemptResponseModel(
        id=str(new_test_attempt.id),
        testId=str(new_test_attempt.testId),
        studentId=test_attempt_req.studentId,
        attempts=new_test_attempt.attempts,
        obtainedMarks=new_test_attempt.obtainedMarks,
    )


async def modify_test_attempt(
    updated_test_attempt: TestAttemptUpdateModel, db: AsyncSession
) -> TestAttemptResponseModel:
    student_profile = await fetch_student_profile_by_user_id(updated_test_attempt.studentId, db)
    if not student_profile:
        raise DatabaseError(message=f"Student profile not found for user {updated_test_attempt.studentId}")

    # Create a copy with the actual student.id for the repo
    repo_update = updated_test_attempt.model_copy(update={"studentId": str(student_profile.id)})
    modified_test_attempt = await set_test_attempt(updated_test_attempt=repo_update, db=db)

    return TestAttemptResponseModel(
        id=str(modified_test_attempt.id),
        testId=str(modified_test_attempt.testId),
        studentId=updated_test_attempt.studentId,
        attempts=modified_test_attempt.attempts,
        obtainedMarks=modified_test_attempt.obtainedMarks,
    )


async def delete_test_attempt(attempt_id: str, db: AsyncSession) -> int:
    return await remove_test_attempt(attempt_id=attempt_id, db=db)


def _map_student_answer_to_detail(sa: StudentAnswers, is_staff: bool) -> StudentAnswerDetailResponseModel:
    from datetime import datetime
    # Use test deadline for masking unless it's a staff member
    now = datetime.now(sa.test.expiresAt.tzinfo)
    can_see_results = is_staff or sa.test.expiresAt < now

    return StudentAnswerDetailResponseModel(
        id=str(sa.id),
        answer=sa.answer,
        testId=str(sa.testId),
        questionId=str(sa.questionId),
        studentId=str(sa.studentId),
        studentName=f"{sa.student.user.firstName} {sa.student.user.lastName}" if sa.student and sa.student.user else "Unknown Student",
        correctAnswer=sa.question.correctAnswer if (sa.question and can_see_results) else None,
        mark=sa.question.mark if (sa.question and can_see_results) else 0,
        questionText=sa.question.questionText if sa.question else None,
        questionImg=sa.question.questionImage if sa.question else None,
        optionA=sa.question.optionA if sa.question else None,
        optionAImg=sa.question.optionAImg if sa.question else None,
        optionB=sa.question.optionB if sa.question else None,
        optionBImg=sa.question.optionBImg if sa.question else None,
        optionC=sa.question.optionC if sa.question else None,
        optionCImg=sa.question.optionCImg if sa.question else None,
        optionD=sa.question.optionD if sa.question else None,
        optionDImg=sa.question.optionDImg if sa.question else None,
        explanation=sa.question.explanation if (sa.question and can_see_results) else None,
        explanationImg=sa.question.explanationImg if (sa.question and can_see_results) else None,
        correctImg=sa.question.correctImg if (sa.question and can_see_results) else None,
    )


async def retrieve_all_student_answer(limit: int, offset: int, is_staff: bool, db: AsyncSession) -> PaginationStudentAnswerResponse:
    student_answer_list, total_records = await fetch_student_answers(limit=limit, offset=offset, db=db)

    data = [_map_student_answer_to_detail(sa, is_staff) for sa in student_answer_list]

    return PaginationStudentAnswerResponse(
        data=data,
        record=len(data),
        totalRecord=total_records,
        page=(offset // limit) + 1,
        totalPages=math.ceil(total_records / limit) if total_records else 0,
    )

async def retrieve_student_answer(student_id: str, limit: int, offset: int, is_staff: bool, db: AsyncSession) -> PaginationStudentAnswerResponse:
    student_answer_list, total_records = await fetch_student_answers_by_student_id(student_id=student_id, limit=limit, offset=offset, db=db)

    data = [_map_student_answer_to_detail(sa, is_staff) for sa in student_answer_list]

    return PaginationStudentAnswerResponse(
        data=data,
        record=len(data),
        totalRecord=total_records,
        page=(offset // limit) + 1,
        totalPages=math.ceil(total_records / limit) if total_records else 0,
    )


async def retrieve_student_answers_by_test_id(test_id: str, is_staff: bool, limit: int, offset: int, db: AsyncSession) -> PaginationStudentAnswerResponse:
    student_answer_list, total_records = await fetch_student_answers_by_test_id(test_id=test_id, limit=limit, offset=offset, db=db)

    data = [_map_student_answer_to_detail(sa, is_staff) for sa in student_answer_list]

    return PaginationStudentAnswerResponse(
        data=data,
        record=len(data),
        totalRecord=total_records,
        page=(offset // limit) + 1,
        totalPages=math.ceil(total_records / limit) if total_records else 0,
    )


async def create_student_answer(
    student_answer_req: StudentAnswerRequestModel, db: AsyncSession
) -> StudentAnswerResponseModel:
    student = await fetch_student_profile_by_user_id(student_answer_req.userId, db=db)

    student_answer = StudentAnswers(
        answer=student_answer_req.answer,
        testId=student_answer_req.testId,
        questionId=student_answer_req.questionId,
        studentId=student.id,
    )

    new_student_answer = await insert_student_answer(student_answer, db)

    return StudentAnswerResponseModel(
        id=str(new_student_answer.id),
        answer=new_student_answer.answer,
        testId=str(new_student_answer.testId),
        questionId=str(new_student_answer.questionId),
        studentId=str(new_student_answer.studentId),
    )


async def modify_student_answer(
    updated_student_answer: StudentAnswerResponseModel, db: AsyncSession
) -> StudentAnswerResponseModel:
    modified_student_answer = await set_student_answer(updated_student_answer=updated_student_answer, db=db)

    return StudentAnswerResponseModel(
        id=str(modified_student_answer.id),
        answer=modified_student_answer.answer,
        testId=str(modified_student_answer.testId),
        questionId=str(modified_student_answer.questionId),
        studentId=str(modified_student_answer.studentId),
    )


async def delete_student_answer(student_answer_id: str, db: AsyncSession) -> int:
    return await remove_student_answer(student_answer_id=student_answer_id, db=db)
