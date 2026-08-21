from fastapi import APIRouter, Request, Query
from fastapi.params import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import UploadFile, File, Form
from typing import Optional

from data.core import get_db
from data.schemas import UserRole, MCQAnswer, MediaType
from routers.students.repo import fetch_student_profile_by_user_id
from routers.test.models import (
    PaginationQuestionResponse,
    PaginationStudentAnswerResponse,
    PaginationTestResponse,
    PaginationTestAttemptResponse,
    QuestionRequestModel,
    QuestionUpdateModel,
    StudentAnswerRequestModel,
    StudentAnswerResponseModel,
    TestAttemptRequestModel,
    TestAttemptResponseModel,
    TestAttemptUpdateModel,
    TestRequestModel,
    TestResponseModel,
    TestUpdateModel,
)
from routers.test.service import (
    create_question,
    create_student_answer,
    create_test,
    create_test_attempt,
    delete_question,
    delete_student_answer,
    delete_test,
    delete_test_attempt,
    modify_question,
    modify_student_answer,
    modify_test,
    modify_test_attempt,
    retrieve_all_question,
    retrieve_questions_by_test_id,
    retrieve_all_student_answer,
    retrieve_all_test,
    retrieve_all_test_attempt, 
    retrieve_test_attempts_by_test_id,
    retrieve_test_attempts_by_student_id,
    retrieve_student_answer,
    retrieve_student_answers_by_test_id,
    retrieve_student_tests,
)
from utils.const import RATE_LIMIT, StoragePath
from utils.files.store_n_register import store_n_register_media
from utils.models.pydantic_cm import UserModel
from utils.security.rate_limiting import limiter
from utils.security.tokens import get_current_staff, get_current_user

router = APIRouter(prefix="/tests", tags=["tests"])


@router.get("/")
@limiter.limit(f"{RATE_LIMIT}/minute")
async def get_tests(request: Request, limit: int = Query(15, ge=1, le=100), offset: int = Query(0, ge=0), db: AsyncSession = Depends(get_db), user: UserModel = Depends(get_current_user)) -> PaginationTestResponse:
    if user.role not in [UserRole.ADMIN, UserRole.TEACHER]:
        student = await fetch_student_profile_by_user_id(student_user_id=user.id, db=db)
        if not student:
            return PaginationTestResponse(data=[], record=0, totalRecord=0, page=1, totalPages=0)

        subject_ids = []
        for course in student.courses:
            subject_ids.extend([str(s.id) for s in course.subjects])
             
        if not subject_ids:
            return PaginationTestResponse(data=[], record=0, totalRecord=0, page=1, totalPages=0)

        return await retrieve_student_tests(subject_ids=subject_ids, limit=limit, offset=offset, db=db)

    return await retrieve_all_test(limit=limit, offset=offset, db=db)

@router.post("/")
@limiter.limit(f"{RATE_LIMIT}/minute")
async def add_test(request: Request, test_req: TestRequestModel, db: AsyncSession = Depends(get_db), staff: UserModel = Depends(get_current_staff)) -> TestResponseModel:
    test_req.teacherId = staff.id
    return await create_test(test_req=test_req, db=db)

@router.put("/")
@limiter.limit(f"{RATE_LIMIT}/minute")
async def mutate_test(request: Request, updated_test_req: TestUpdateModel, db: AsyncSession = Depends(get_db), _: UserModel = Depends(get_current_staff)) -> TestResponseModel:
    return await modify_test(updated_test=updated_test_req, db=db)

@router.delete("/")
@limiter.limit(f"{RATE_LIMIT}/minute")
async def wipe_test(request: Request, test_id: str, db: AsyncSession = Depends(get_db), _: UserModel = Depends(get_current_staff)) -> int:
    return await delete_test(test_id, db)


@router.get("/questions")
@limiter.limit(f"{RATE_LIMIT}/minute")
async def get_questions(
    request: Request,
    test_id: Optional[str] = None,
    limit: int = Query(15, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
    user: UserModel = Depends(get_current_user)
) -> PaginationQuestionResponse:
    if test_id:
        return await retrieve_questions_by_test_id(
            test_id=test_id,
            limit=limit,
            offset=offset,
            db=db,
            is_staff=user.role in [UserRole.ADMIN, UserRole.TEACHER]
        )

    if user.role not in [UserRole.ADMIN, UserRole.TEACHER]:
         return PaginationQuestionResponse(data=[], record=0, totalRecord=0, page=1, totalPages=0)

    return await retrieve_all_question(limit=limit, offset=offset, db=db)

@router.post("/questions")
@limiter.limit(f"{RATE_LIMIT}/minute")
async def add_question(
    request: Request,
    db: AsyncSession = Depends(get_db),
    _: UserModel = Depends(get_current_staff),

    test_id: str = Form(...),
    question_text: Optional[str] = Form(None),
    correct_answer: MCQAnswer = Form(...),
    mark: int = Form(...),

    option_a: Optional[str] = Form(None),
    option_b: Optional[str] = Form(None),
    option_c: Optional[str] = Form(None),
    option_d: Optional[str] = Form(None),

    explanation: Optional[str] = Form(None),

    question_img: Optional[UploadFile] = File(None),
    correct_answer_img: Optional[UploadFile] = File(None),

    option_a_img: Optional[UploadFile] = File(None),
    option_b_img: Optional[UploadFile] = File(None),
    option_c_img: Optional[UploadFile] = File(None),
    option_d_img: Optional[UploadFile] = File(None),

    explanation_img: Optional[UploadFile] = File(None),
):
    question_req = QuestionRequestModel(
        testId=test_id,
        questionText=question_text,
        questionImg=await store_n_register_media(uid=test_id, media_type=MediaType.TEST, dir_path=StoragePath.TEST_DIR, file=question_img, db=db) if question_img else None,
        correctAnswer=correct_answer,
        correctAnswerImg=await store_n_register_media(uid=test_id, media_type=MediaType.TEST, dir_path=StoragePath.TEST_DIR, file=correct_answer_img, db=db) if correct_answer_img else None,
        mark=mark,

        optionA=option_a,
        optionAImg=await store_n_register_media(uid=test_id, media_type=MediaType.TEST, dir_path=StoragePath.TEST_DIR, file=option_a_img, db=db) if option_a_img else None,
        optionB=option_b,
        optionBImg=await store_n_register_media(uid=test_id, media_type=MediaType.TEST, dir_path=StoragePath.TEST_DIR, file=option_b_img, db=db) if option_b_img else None,
        optionC=option_c,
        optionCImg=await store_n_register_media(uid=test_id, media_type=MediaType.TEST, dir_path=StoragePath.TEST_DIR, file=option_c_img, db=db) if option_c_img else None,
        optionD=option_d,
        optionDImg=await store_n_register_media(uid=test_id, media_type=MediaType.TEST, dir_path=StoragePath.TEST_DIR, file=option_d_img, db=db) if option_d_img else None,

        explanation=explanation,
        explanationImg=await store_n_register_media(uid=test_id, media_type=MediaType.TEST, dir_path=StoragePath.TEST_DIR, file=explanation_img, db=db) if explanation_img else None,
    )
    return await create_question(
        question_req=question_req,
        db=db
    )

@router.put("/questions")
@limiter.limit(f"{RATE_LIMIT}/minute")
async def mutate_question(
    request: Request,
    db: AsyncSession = Depends(get_db),
    _: UserModel = Depends(get_current_staff),

    id: str = Form(...),
    test_id: str = Form(...),
    question_text: Optional[str] = Form(None),
    correct_answer: MCQAnswer = Form(...),
    mark: int = Form(...),

    option_a: Optional[str] = Form(None),
    option_b: Optional[str] = Form(None),
    option_c: Optional[str] = Form(None),
    option_d: Optional[str] = Form(None),

    explanation: Optional[str] = Form(None),

    question_img: Optional[UploadFile] = File(None),
    correct_answer_img: Optional[UploadFile] = File(None),

    option_a_img: Optional[UploadFile] = File(None),
    option_b_img: Optional[UploadFile] = File(None),
    option_c_img: Optional[UploadFile] = File(None),
    option_d_img: Optional[UploadFile] = File(None),

    explanation_img: Optional[UploadFile] = File(None),
):
    question_req = QuestionUpdateModel(
        id=id,
        testId=test_id,
        questionText=question_text,
        questionImg=await store_n_register_media(uid=test_id, media_type=MediaType.TEST, dir_path=StoragePath.TEST_DIR, file=question_img, db=db) if question_img else None,
        correctAnswer=correct_answer,
        correctAnswerImg=await store_n_register_media(uid=test_id, media_type=MediaType.TEST, dir_path=StoragePath.TEST_DIR, file=correct_answer_img, db=db) if correct_answer_img else None,
        mark=mark,

        optionA=option_a,
        optionAImg=await store_n_register_media(uid=test_id, media_type=MediaType.TEST, dir_path=StoragePath.TEST_DIR, file=option_a_img, db=db) if option_a_img else None,
        optionB=option_b,
        optionBImg=await store_n_register_media(uid=test_id, media_type=MediaType.TEST, dir_path=StoragePath.TEST_DIR, file=option_b_img, db=db) if option_b_img else None,
        optionC=option_c,
        optionCImg=await store_n_register_media(uid=test_id, media_type=MediaType.TEST, dir_path=StoragePath.TEST_DIR, file=option_c_img, db=db) if option_c_img else None,
        optionD=option_d,
        optionDImg=await store_n_register_media(uid=test_id, media_type=MediaType.TEST, dir_path=StoragePath.TEST_DIR, file=option_d_img, db=db) if option_d_img else None,

        explanation=explanation,
        explanationImg=await store_n_register_media(uid=test_id, media_type=MediaType.TEST, dir_path=StoragePath.TEST_DIR, file=explanation_img, db=db) if explanation_img else None,
    )
    return await modify_question(
        updated_question=question_req,
        db=db
    )

@router.delete("/questions")
@limiter.limit(f"{RATE_LIMIT}/minute")
async def wipe_question(request: Request, question_id: str, db: AsyncSession = Depends(get_db), _: UserModel = Depends(get_current_staff)) -> int:
    return await delete_question(question_id, db)


@router.get("/attempts")
@limiter.limit(f"{RATE_LIMIT}/minute")
async def get_test_attempts(
    request: Request, 
    test_id: Optional[str] = None, 
    student_id: Optional[str] = None,
    limit: int = Query(15, ge=1, le=100), 
    offset: int = Query(0, ge=0), 
    db: AsyncSession = Depends(get_db), 
    user: UserModel = Depends(get_current_user)
) -> PaginationTestAttemptResponse:
    if user.role == UserRole.STUDENT:
        # Students can only see their own attempts
        return await retrieve_test_attempts_by_student_id(str(user.id), limit, offset, False, db)
    
    is_staff = user.role in [UserRole.ADMIN, UserRole.TEACHER]
    if test_id:
        return await retrieve_test_attempts_by_test_id(test_id, limit, offset, db)
    
    if student_id:
        return await retrieve_test_attempts_by_student_id(student_id, limit, offset, is_staff, db)
        
    return await retrieve_all_test_attempt(limit=limit, offset=offset, db=db)


@router.post("/attempts")
@limiter.limit(f"{RATE_LIMIT}/minute")
async def add_test_attempt(request: Request, test_attempt_req: TestAttemptRequestModel, db: AsyncSession = Depends(get_db), _: UserModel = Depends(get_current_staff)) -> TestAttemptResponseModel:
    return await create_test_attempt(test_attempt_req=test_attempt_req, db=db)


@router.put("/attempts")
@limiter.limit(f"{RATE_LIMIT}/minute")
async def mutate_test_attempt(request: Request, updated_test_attempt_req: TestAttemptUpdateModel, db: AsyncSession = Depends(get_db), _: UserModel = Depends(get_current_staff)) -> TestAttemptResponseModel:
    return await modify_test_attempt(updated_test_attempt=updated_test_attempt_req, db=db)


@router.delete("/attempts")
@limiter.limit(f"{RATE_LIMIT}/minute")
async def wipe_test_attempt(request: Request, attempt_id: str, db: AsyncSession = Depends(get_db), _: UserModel = Depends(get_current_staff)) -> int:
    return await delete_test_attempt(attempt_id=attempt_id, db=db)

@router.get("/answers")
@limiter.limit(f"{RATE_LIMIT}/minute")
async def get_student_answers(
    request: Request,
    student_id: Optional[str] = None,
    test_id: Optional[str] = None,
    limit: int = Query(15, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
    user: UserModel = Depends(get_current_user)
) -> PaginationStudentAnswerResponse:
    is_staff = user.role in [UserRole.ADMIN, UserRole.TEACHER]
    if test_id:
        return await retrieve_student_answers_by_test_id(test_id=test_id, is_staff=is_staff, limit=limit, offset=offset, db=db)

    is_staff = user.role in [UserRole.ADMIN, UserRole.TEACHER]
    if user.role == UserRole.STUDENT:
        student = await fetch_student_profile_by_user_id(student_user_id=user.id, db=db)
        return await retrieve_student_answer(student_id=student.id, limit=limit, offset=offset, is_staff=False, db=db)
    else:
        if student_id is None:
            return await retrieve_all_student_answer(limit=limit, offset=offset, is_staff=is_staff, db=db)
        return await retrieve_student_answer(student_id=student_id, limit=limit, offset=offset, is_staff=is_staff, db=db)

@router.post("/answers")
@limiter.limit(f"{RATE_LIMIT}/minute")
async def add_student_answer(
    request: Request, 
    student_answer_req: StudentAnswerRequestModel, 
    db: AsyncSession = Depends(get_db), 
    user: UserModel = Depends(get_current_user)
) -> StudentAnswerResponseModel:
    if user.role == UserRole.STUDENT:
        student_answer_req.userId = str(user.id)
    return await create_student_answer(student_answer_req=student_answer_req, db=db)


@router.put("/answers")
@limiter.limit(f"{RATE_LIMIT}/minute")
async def mutate_student_answer(request: Request, updated_student_answer_req: StudentAnswerResponseModel, db: AsyncSession = Depends(get_db), _: UserModel = Depends(get_current_staff)) -> StudentAnswerResponseModel:
    return await modify_student_answer(updated_student_answer=updated_student_answer_req, db=db)


@router.delete("/answers")
@limiter.limit(f"{RATE_LIMIT}/minute")
async def wipe_student_answer(request: Request, student_answer_id: str, db: AsyncSession = Depends(get_db), _: UserModel = Depends(get_current_staff)) -> int:
    return await delete_student_answer(student_answer_id=student_answer_id, db=db)
