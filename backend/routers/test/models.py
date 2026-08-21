from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from data.schemas import MCQAnswer, TestMode, TestType, TestStatus


class TestRequestModel(BaseModel):
    title: str
    durationMin: int
    totalMarks: int
    description: str
    mode: TestMode
    type: TestType
    startTime: datetime
    createdAt: datetime
    expiresAt: datetime
    maxAttempts: int
    subjectId: str
    teacherId: str
    status: TestStatus

class TestResponseModel(BaseModel):
    id: str
    title: str
    durationMin: int
    totalMarks: int
    description: str
    mode: TestMode
    type: TestType
    startTime: datetime
    createdAt: datetime
    expiresAt: datetime
    maxAttempts: int
    subjectId: str
    teacherId: str
    status: TestStatus

class TestUpdateModel(BaseModel):
    id: str
    title: str
    durationMin: int
    totalMarks: int
    description: str
    mode: TestMode
    type: TestType
    startTime: datetime
    expiresAt: datetime
    maxAttempts: int
    subjectId: str
    teacherId: str
    status: TestStatus

class PaginationTestResponse(BaseModel):
    data: list[TestResponseModel]
    record: int
    totalRecord: int
    page: int
    totalPages: int

class QuestionRequestModel(BaseModel):
    testId: str
    questionText: str
    questionImg: Optional[str]
    correctAnswer: Optional[MCQAnswer] = None
    correctAnswerImg: Optional[str] = None
    mark: int

    optionA: str
    optionAImg: Optional[str]
    optionB: str
    optionBImg: Optional[str]
    optionC: str
    optionCImg: Optional[str]
    optionD: str
    optionDImg: Optional[str]

    explanation: Optional[str] = None
    explanationImg: Optional[str] = None

class QuestionResponseModel(BaseModel):
    id: str
    testId: str
    questionText: str
    questionImg: Optional[str]
    correctAnswer: Optional[MCQAnswer] = None
    correctAnswerImg: Optional[str] = None
    mark: int

    optionA: str
    optionAImg: Optional[str]
    optionB: str
    optionBImg: Optional[str]
    optionC: str
    optionCImg: Optional[str]
    optionD: str
    optionDImg: Optional[str]

    explanation: Optional[str] = None
    explanationImg: Optional[str] = None

class QuestionUpdateModel(BaseModel):
    id: str
    testId: str
    questionText: str
    questionImg: Optional[str]
    correctAnswer: Optional[MCQAnswer] = None
    correctAnswerImg: Optional[str] = None
    mark: int

    optionA: str
    optionAImg: Optional[str]
    optionB: str
    optionBImg: Optional[str]
    optionC: str
    optionCImg: Optional[str]
    optionD: str
    optionDImg: Optional[str]

    explanation: Optional[str] = None
    explanationImg: Optional[str] = None

class PaginationQuestionResponse(BaseModel):
    data: list[QuestionResponseModel]
    record: int
    totalRecord: int
    page: int
    totalPages: int


class TestAttemptRequestModel(BaseModel):
    testId: str
    studentId: str
    attempts: int
    obtainedMarks: Optional[int] = None


class TestAttemptResponseModel(BaseModel):
    id: str
    testId: str
    studentId: str
    attempts: int
    obtainedMarks: Optional[int] = None


class TestAttemptUpdateModel(BaseModel):
    id: str
    testId: str
    studentId: str
    attempts: int
    obtainedMarks: Optional[int] = None


class PaginationTestAttemptResponse(BaseModel):
    data: list[TestAttemptResponseModel]
    record: int
    totalRecord: int
    page: int
    totalPages: int


class StudentAnswerRequestModel(BaseModel):
    answer: MCQAnswer
    testId: str
    questionId: str
    userId: str


class StudentAnswerResponseModel(BaseModel):
    id: str
    answer: MCQAnswer
    testId: str
    questionId: str
    studentId: str


class StudentAnswerDetailResponseModel(BaseModel):
    id: str
    answer: MCQAnswer
    correctAnswer: Optional[MCQAnswer] = None
    mark: Optional[int] = 0
    testId: str
    questionId: str
    studentId: str
    studentName: Optional[str] = None
    questionText: Optional[str] = None
    questionImg: Optional[str] = None
    optionA: Optional[str] = None
    optionAImg: Optional[str] = None
    optionB: Optional[str] = None
    optionBImg: Optional[str] = None
    optionC: Optional[str] = None
    optionCImg: Optional[str] = None
    optionD: Optional[str] = None
    optionDImg: Optional[str] = None
    explanation: Optional[str] = None
    explanationImg: Optional[str] = None
    correctImg: Optional[str] = None


class PaginationStudentAnswerResponse(BaseModel):
    data: list[StudentAnswerDetailResponseModel]
    record: int
    totalRecord: int
    page: int
    totalPages: int
