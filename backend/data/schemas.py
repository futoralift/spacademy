import uuid
from datetime import datetime
from enum import Enum
from typing import Optional

from sqlalchemy import ForeignKey, DateTime, String, UniqueConstraint, Integer, Boolean, Table, Column, Text, Float
from sqlalchemy.dialects.postgresql import ARRAY, DOUBLE_PRECISION
from sqlalchemy.dialects.postgresql.base import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Enum as SqlEnum

from data.core import Base


class AuthServiceProvider(str, Enum):
    GOOGLE = "google"
    APP = "app"
    ADMIN = "admin"
    TEACHER = "teacher"

class UserRole(str, Enum):
    STUDENT = "student"
    TEACHER = "teacher"
    ADMIN = "admin"

class AttendanceStatus(str, Enum):
    PRESENT = "present"
    ABSENT = "absent"
    LATE = "late"
    EXCUSED = "excused"

class MCQAnswer(str, Enum):
    A = "A"
    B = "B"
    C = "C"
    D = "D"

class AssignmentStatus(str, Enum):
    NO_ACTIONS = "no_actions"
    PENDING = "pending"
    EXCUSED = "excused"
    INCOMPLETE = "incomplete"
    COMPLETE = "completed"
    REJECTED = "rejected"

class TestMode(str, Enum):
    OFFLINE = "offline"
    ONLINE = "online"

class CourseMode(str, Enum):
    OFFLINE = "offline"
    ONLINE = "online"

class TestType(str, Enum):
    ChapterWise = "chapter_wise"
    FullSyllabus = "full_syllabus"

class BlogPostStatus(str, Enum):
    DRAFT = "draft"
    PUBLISH = "publish"


class TestStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"


class LearningHubVideoType(str, Enum):
    EDUCATIONAL_EXPLANATION = "educational_explanation"
    SHORT_CONCEPT = "short_concept"
    EXAM_PREPARATION_GUIDANCE = "exam_preparation_guidance"


class AnnouncementStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"


class AnnouncementType(str, Enum):
    PUBLIC = "public"
    PRIVATE = "private"


class EnquiryStatus(str, Enum):
    NEW = "pending"
    SPOKEN = "contacted"
    CLOSED = "closed"
    CONVERTED = "converted"


class MediaType(str, Enum):
    MEDIA_LIBRARY = "media_library"
    ASSIGNMENT = "assignment"
    STUDY_RESOURCE = "study_resource"
    LEARNING_HUB = "learning_hub"
    ANNOUNCEMENT = "announcement"
    BLOG = "blog"
    STUDENT = "student"
    EVENT = "event"
    USER = "user"
    COURSE = "course"
    TEST = "test"
    TESTIMONIAL = "testimonial"
    ENQUIRY = "enquiry"


course_categories = Table(
    "course_categories",
    Base.metadata,
    Column("course_id", UUID(as_uuid=True), ForeignKey("courses.id", ondelete="CASCADE"), primary_key=True),
    Column("category_id", UUID(as_uuid=True), ForeignKey("categories.id", ondelete="CASCADE"), primary_key=True),
)

study_resource_categories = Table(
    "study_resource_categories",
    Base.metadata,
    Column("study_resource_id", UUID(as_uuid=True), ForeignKey("study_resources.id", ondelete="CASCADE"), primary_key=True),
    Column("category_id", UUID(as_uuid=True), ForeignKey("categories.id", ondelete="CASCADE"), primary_key=True),
)

post_tags = Table(
    "post_tags",
    Base.metadata,
    Column("post_id", UUID(as_uuid=True), ForeignKey("posts.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", UUID(as_uuid=True), ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
)

post_categories = Table(
    "post_categories",
    Base.metadata,
    Column("post_id", UUID(as_uuid=True), ForeignKey("posts.id", ondelete="CASCADE"), primary_key=True),
    Column("category_id", UUID(as_uuid=True), ForeignKey("categories.id", ondelete="CASCADE"), primary_key=True),
)

student_courses = Table(
    "student_courses",
    Base.metadata,
    Column("student_id", UUID(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"), primary_key=True),
    Column("course_id", UUID(as_uuid=True), ForeignKey("courses.id", ondelete="CASCADE"), primary_key=True),
)


class User(Base):
    __tablename__ = "users"

    id:                 Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    firstName:          Mapped[str] = mapped_column(String, nullable=False)
    lastName:           Mapped[str] = mapped_column(String, nullable=False)
    email:              Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    phone:              Mapped[str] = mapped_column(String, unique=True, nullable=False)
    passwordHash:       Mapped[str] = mapped_column(String, nullable=True)
    authServiceProvider:Mapped[AuthServiceProvider] = mapped_column(SqlEnum(AuthServiceProvider), nullable=False)
    role:               Mapped[UserRole] = mapped_column(SqlEnum(UserRole, native_enum=False), nullable=False, default=UserRole.STUDENT, server_default=UserRole.STUDENT.name,)
    avatar:             Mapped[str] = mapped_column(String, nullable=False)
    refreshToken:       Mapped[Optional[str]] = mapped_column(String, nullable=True)
    createdAt:          Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    deletedAt:          Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    lastLogIn:          Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    student: Mapped["Student"] = relationship(
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    subjectsTeaching: Mapped[list["Subject"]] = relationship()


class PendingUser(Base):
    __tablename__ = "pending_users"

    id:                 Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    firstName:          Mapped[str] = mapped_column(String, nullable=False)
    lastName:           Mapped[str] = mapped_column(String, nullable=False)
    email:              Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    phone:              Mapped[Optional[str]] = mapped_column(String, unique=True, nullable=True)
    passwordHash:       Mapped[str] = mapped_column(String, nullable=True)
    authServiceProvider:Mapped[AuthServiceProvider] = mapped_column(SqlEnum(AuthServiceProvider), nullable=False)

    role: Mapped[UserRole] = mapped_column(
        SqlEnum(UserRole, native_enum=False),
        nullable=False,
        default=UserRole.STUDENT,
        server_default=UserRole.STUDENT.name,
    )


class Course(Base):
    __tablename__ = "courses"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(String, nullable=False)
    standards: Mapped[list[str]] = mapped_column(ARRAY(String), nullable=False)
    image: Mapped[str] = mapped_column(String, nullable=False)
    highlights: Mapped[list[str]] = mapped_column(ARRAY(String), nullable=False)
    isActive: Mapped[bool] = mapped_column(Boolean, nullable=False)
    isPaid: Mapped[bool] = mapped_column(Boolean, nullable=False)
    mode: Mapped[CourseMode] = mapped_column(SqlEnum(CourseMode, native_enum=False), nullable=False)

    subjects: Mapped[list["Subject"]] = relationship(back_populates="course")
    students: Mapped[list["Student"]] = relationship(
        secondary=student_courses,
        back_populates="courses",
    )
    categories: Mapped[list["Category"]] = relationship(
        secondary=course_categories,
        back_populates="courses",
    )

    amount: Mapped[float] = mapped_column(Float, nullable=True)
    currency: Mapped[str] = mapped_column(String(10), default="INR")


class Payment(Base):
    __tablename__ = "payments"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    razorpayOrderId: Mapped[str] = mapped_column(String, nullable=False, unique=True)
    razorpayPaymentId: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    razorpaySignature: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    currency: Mapped[str] = mapped_column(String(10), default="INR")
    status: Mapped[str] = mapped_column(String, default="pending")  # pending, success, failed

    studentId: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"))
    courseId: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("courses.id", ondelete="CASCADE"))

    createdAt: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.now)
    updatedAt: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.now, onupdate=datetime.now)

    student: Mapped["Student"] = relationship()
    course: Mapped["Course"] = relationship()


class Subject(Base):
    __tablename__ = "subjects"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String, nullable=False)

    teacherId: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    courseId: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("courses.id"))

    teacher: Mapped["User"] = relationship(back_populates="subjectsTeaching")
    course: Mapped["Course"] = relationship(back_populates="subjects")

    lectures: Mapped[list["Lecture"]] = relationship(back_populates="subject")


class Lecture(Base):
    __tablename__ = "lectures"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    lectureTitle: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    startDate: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    endDate: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    subjectId: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("subjects.id"))

    attendance: Mapped[list["LectureAttendance"]] = relationship(back_populates="lecture", cascade="all, delete-orphan")
    subject: Mapped["Subject"] = relationship(back_populates="lectures")
    assignments: Mapped[list["Assignments"]] = relationship(back_populates="lecture")

class LectureAttendance(Base):
    __tablename__ = "lecture_attendance"
    __table_args__ = (
        UniqueConstraint("studentId", "lectureId", name="uq_student_lecture"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    status: Mapped[AttendanceStatus] = mapped_column(SqlEnum(AttendanceStatus, native_enum=False), nullable=False)

    studentId: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"))
    lectureId: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("lectures.id"))

    student: Mapped["Student"] = relationship(back_populates="attendance")
    lecture : Mapped["Lecture"] = relationship(back_populates="attendance")


class Student(Base):
    __tablename__ = "students"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    rollNo: Mapped[str] = mapped_column(String, nullable=True)
    standard: Mapped[str] = mapped_column(String, nullable=True)
    schoolName: Mapped[str] = mapped_column(String, nullable=True)
    board: Mapped[str] = mapped_column(String, nullable=True)
    parentName: Mapped[str] = mapped_column(String, nullable=True)
    parentMobileNumber: Mapped[str] = mapped_column(String, nullable=True)

    userId: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True)

    courses: Mapped[list["Course"]] = relationship(
        secondary=student_courses,
        back_populates="students",
    )
    user: Mapped["User"] = relationship(back_populates="student", uselist=False, passive_deletes=True)
    attendance: Mapped[list["LectureAttendance"]] = relationship(back_populates="student", cascade="all, delete-orphan")

class StudyResource(Base):
    __tablename__ = "study_resources"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(String, nullable=False)

    lectureId: Mapped[uuid.UUID] = mapped_column(ForeignKey("lectures.id"), nullable=True)
    subjectId: Mapped[uuid.UUID] = mapped_column(ForeignKey("subjects.id"), nullable=True)

    filePath: Mapped[str] = mapped_column(String, nullable=False)

    uploadAt: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    categories: Mapped[list["Category"]] = relationship(
        secondary=study_resource_categories,
        back_populates="studyResources",
    )

class Tests(Base):
    __tablename__ = "tests"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(String, nullable=False)
    totalMarks: Mapped[int] = mapped_column(Integer, nullable=False)
    durationMinutes: Mapped[int] = mapped_column(Integer, nullable=False)
    startTime: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    expiresAt: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    createdAt: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    mode: Mapped[TestMode] = mapped_column(SqlEnum(TestMode, native_enum=False), nullable=False, default=TestMode.ONLINE)
    type: Mapped[TestType] = mapped_column(SqlEnum(TestType, native_enum=False), nullable=False)

    subjectId: Mapped[uuid.UUID] = mapped_column(ForeignKey("subjects.id"))
    teacherId: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"))
    maxAttempts: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[TestStatus] = mapped_column(SqlEnum(TestStatus, native_enum=False), nullable=False, default=TestStatus.DRAFT, server_default="draft")

    questions: Mapped[list["Questions"]] = relationship(back_populates="test")

class Questions(Base):
    __tablename__ = "questions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    questionText: Mapped[str] = mapped_column(String, nullable=True)
    questionImage: Mapped[str] = mapped_column(String, nullable=True)

    optionA: Mapped[str] = mapped_column(String, nullable=True)
    optionAImg: Mapped[str] = mapped_column(String, nullable=True)
    optionB: Mapped[str] = mapped_column(String, nullable=True)
    optionBImg: Mapped[str] = mapped_column(String, nullable=True)
    optionC: Mapped[str] = mapped_column(String, nullable=True)
    optionCImg: Mapped[str] = mapped_column(String, nullable=True)
    optionD: Mapped[str] = mapped_column(String, nullable=True)
    optionDImg: Mapped[str] = mapped_column(String, nullable=True)

    explanation: Mapped[str] = mapped_column(String, nullable=True)
    explanationImg: Mapped[str] = mapped_column(String, nullable=True)

    correctAnswer: Mapped[MCQAnswer] = mapped_column(SqlEnum(MCQAnswer, native_enum=False), nullable=True)
    correctImg: Mapped[str] = mapped_column(String, nullable=True)
    mark: Mapped[int] = mapped_column(Integer, nullable=True)

    testId: Mapped[uuid.UUID] = mapped_column(ForeignKey("tests.id"))
    test: Mapped["Tests"] = relationship(back_populates="questions")

class TestAttempts(Base):
    __tablename__ = "test_attempts"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    testId: Mapped[uuid.UUID] = mapped_column(ForeignKey("tests.id"))
    studentId: Mapped[uuid.UUID] = mapped_column(ForeignKey("students.id", ondelete="CASCADE"))
    attempts: Mapped[int] = mapped_column(Integer, nullable=True)
    obtainedMarks: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    test: Mapped["Tests"] = relationship()

class StudentAnswers(Base):
    __tablename__ = "student_answers"
    __table_args__ = (
        UniqueConstraint("studentId", "questionId", "testId", name="uq_student_tests"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    answer: Mapped[MCQAnswer] = mapped_column(SqlEnum(MCQAnswer, native_enum=False), nullable=True)
    testId: Mapped[uuid.UUID] = mapped_column(ForeignKey("tests.id"))
    questionId: Mapped[uuid.UUID] = mapped_column(ForeignKey("questions.id"))
    studentId: Mapped[uuid.UUID] = mapped_column(ForeignKey("students.id", ondelete="CASCADE"))

    student: Mapped["Student"] = relationship(uselist=False)
    question: Mapped["Questions"] = relationship(uselist=False)
    test: Mapped["Tests"] = relationship(uselist=False)

class Assignments(Base):
    __tablename__ = "assignments"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(String, nullable=True)

    lectureId: Mapped[uuid.UUID] = mapped_column(ForeignKey("lectures.id"), nullable=True)

    deadline: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    mark: Mapped[int] = mapped_column(Integer, nullable=True)

    lecture: Mapped["Lecture"] = relationship(back_populates="assignments")
    studentsAssignment: Mapped[list["StudentAssignments"]] = relationship(back_populates="assignment")

class StudentAssignments(Base):
    __tablename__ = "student_assignments"
    __table_args__ = (
        UniqueConstraint("studentId", "assignmentId", name="uq_student_assignment"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    assignmentId: Mapped[uuid.UUID] = mapped_column(ForeignKey("assignments.id"))
    studentId: Mapped[uuid.UUID] = mapped_column(ForeignKey("students.id", ondelete="CASCADE"))
    status: Mapped[AssignmentStatus] = mapped_column(SqlEnum(AssignmentStatus, native_enum=False), nullable=False, default=AssignmentStatus.NO_ACTIONS)
    filePath: Mapped[str] = mapped_column(String, nullable=False)
    uploadAt: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    assignment: Mapped["Assignments"] = relationship(back_populates="studentsAssignment")

class Category(Base):
    __tablename__ = "categories"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String, nullable=False)
    slug: Mapped[str] = mapped_column(String, unique=True, index=True)

    courses: Mapped[list["Course"]] = relationship(
        secondary=course_categories,
        back_populates="categories",
    )

    studyResources: Mapped[list["StudyResource"]] = relationship(
        secondary=study_resource_categories,
        back_populates="categories",
    )

    posts: Mapped[list["Post"]] = relationship(
        secondary=post_categories,
        back_populates="categories",
    )

class Post(Base):
    __tablename__ = "posts"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    title: Mapped[str] = mapped_column(String, nullable=False)
    slug: Mapped[str] = mapped_column(String, unique=True, index=True)

    content: Mapped[str] = mapped_column(Text)
    excerpt: Mapped[str] = mapped_column(String, nullable=True)

    featuredImage: Mapped[str] = mapped_column(String, nullable=True)

    status: Mapped[BlogPostStatus] = mapped_column(SqlEnum(BlogPostStatus, native_enum=False), default=BlogPostStatus.DRAFT)

    metaTitle: Mapped[str] = mapped_column(String, nullable=True)
    metaDescription: Mapped[str] = mapped_column(String, nullable=True)

    createdAt: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    publishedAt: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    updatedAt: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.now, onupdate=datetime.now)

    tags: Mapped[list["Tag"]] = relationship(
        secondary=post_tags,
        back_populates="posts",
    )
    categories: Mapped[list["Category"]] = relationship(
        secondary=post_categories,
        back_populates="posts",
    )

class Tag(Base):
    __tablename__ = "tags"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String, unique=True)
    slug: Mapped[str] = mapped_column(String, unique=True)

    posts: Mapped[list["Post"]] = relationship(
        secondary=post_tags,
        back_populates="tags",
    )


class LearningHubVideo(Base):
    __tablename__ = "learning_hub_videos"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String, nullable=False)
    youtubeLink: Mapped[str] = mapped_column(String, nullable=False)
    youtubeVideoId: Mapped[str] = mapped_column(String, nullable=False, index=True)
    videoType: Mapped[LearningHubVideoType] = mapped_column(SqlEnum(LearningHubVideoType, native_enum=False), nullable=False)
    thumbnail: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    publishDate: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    createdAt: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updatedAt: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.now, onupdate=datetime.now)

    subjectId: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("subjects.id", ondelete="CASCADE"), nullable=True)
    subject: Mapped[Optional["Subject"]] = relationship()


class Announcement(Base):
    __tablename__ = "announcements"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    bannerImage: Mapped[str] = mapped_column(String, nullable=False)
    type: Mapped[AnnouncementType] = mapped_column(SqlEnum(AnnouncementType, native_enum=False), nullable=False, default=AnnouncementType.PUBLIC, server_default=AnnouncementType.PUBLIC.name)
    startDate: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    endDate: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    status: Mapped[AnnouncementStatus] = mapped_column(SqlEnum(AnnouncementStatus, native_enum=False), nullable=False)
    createdAt: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updatedAt: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.now, onupdate=datetime.now)


class MediaAsset(Base):
    __tablename__ = "media_assets"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String, nullable=False)
    mediaType: Mapped[MediaType] = mapped_column(SqlEnum(MediaType, native_enum=False), nullable=False)
    originalFilename: Mapped[str] = mapped_column(String, nullable=False)
    filePath: Mapped[str] = mapped_column(String, nullable=False)
    contentType: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    createdAt: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updatedAt: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.now, onupdate=datetime.now)


class SiteSettings(Base):
    __tablename__ = "site_settings"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    academyName: Mapped[str] = mapped_column(String, nullable=False)
    tagline: Mapped[str] = mapped_column(String, nullable=False)
    contactDetails: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    phoneNumbers: Mapped[list[str]] = mapped_column(ARRAY(String), nullable=False)
    email: Mapped[str] = mapped_column(String, nullable=False)
    address: Mapped[str] = mapped_column(Text, nullable=False)
    workingHours: Mapped[str] = mapped_column(Text, nullable=False)
    instagram: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    facebook: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    twitter: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    youtube: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    latitude: Mapped[Optional[float]] = mapped_column(DOUBLE_PRECISION, nullable=True)
    longitude: Mapped[Optional[float]] = mapped_column(DOUBLE_PRECISION, nullable=True)
    createdAt: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updatedAt: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.now, onupdate=datetime.now)


class Testimonial(Base):
    __tablename__ = "testimonials"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    studentName: Mapped[str] = mapped_column(String, nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    courseName: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    avatar: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    rating: Mapped[int] = mapped_column(Integer, nullable=False, default=5)
    isActive: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    createdAt: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updatedAt: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.now, onupdate=datetime.now)


class Enquiry(Base):
    __tablename__ = "enquiries"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    fullName: Mapped[str] = mapped_column(String, nullable=False)
    email: Mapped[str] = mapped_column(String, nullable=False)
    phone: Mapped[str] = mapped_column(String, nullable=False)
    title: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[EnquiryStatus] = mapped_column(SqlEnum(EnquiryStatus, native_enum=False), nullable=False, default=EnquiryStatus.NEW)
    createdAt: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updatedAt: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.now, onupdate=datetime.now)
