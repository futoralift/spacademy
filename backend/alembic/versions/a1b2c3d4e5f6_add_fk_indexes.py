"""Add indexes on foreign key columns for query performance

Revision ID: a1b2c3d4e5f6
Revises: 676586e77f47
Create Date: 2026-08-24 17:00:00.000000

"""
from typing import Sequence, Union

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "a1b2c3d4e5f6"
down_revision: Union[str, Sequence[str], None] = "676586e77f47"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add indexes on frequently queried foreign key columns.

    Foreign key columns used in JOIN conditions and WHERE clauses are
    not automatically indexed by PostgreSQL. These indexes significantly
    improve query performance on larger datasets.
    """
    # subjects
    op.create_index("ix_subjects_teacherId", "subjects", ["teacherId"])
    op.create_index("ix_subjects_courseId", "subjects", ["courseId"])

    # lectures
    op.create_index("ix_lectures_subjectId", "lectures", ["subjectId"])

    # lecture_attendance
    op.create_index("ix_lecture_attendance_studentId", "lecture_attendance", ["studentId"])
    op.create_index("ix_lecture_attendance_lectureId", "lecture_attendance", ["lectureId"])

    # assignments
    op.create_index("ix_assignments_lectureId", "assignments", ["lectureId"])

    # student_assignments
    op.create_index("ix_student_assignments_assignmentId", "student_assignments", ["assignmentId"])
    op.create_index("ix_student_assignments_studentId", "student_assignments", ["studentId"])

    # study_resources
    op.create_index("ix_study_resources_lectureId", "study_resources", ["lectureId"])
    op.create_index("ix_study_resources_subjectId", "study_resources", ["subjectId"])

    # tests
    op.create_index("ix_tests_subjectId", "tests", ["subjectId"])
    op.create_index("ix_tests_teacherId", "tests", ["teacherId"])
    op.create_index("ix_tests_status", "tests", ["status"])

    # questions
    op.create_index("ix_questions_testId", "questions", ["testId"])

    # test_attempts
    op.create_index("ix_test_attempts_testId", "test_attempts", ["testId"])
    op.create_index("ix_test_attempts_studentId", "test_attempts", ["studentId"])

    # student_answers
    op.create_index("ix_student_answers_testId", "student_answers", ["testId"])
    op.create_index("ix_student_answers_studentId", "student_answers", ["studentId"])

    # payments
    op.create_index("ix_payments_studentId", "payments", ["studentId"])
    op.create_index("ix_payments_courseId", "payments", ["courseId"])
    op.create_index("ix_payments_status", "payments", ["status"])

    # learning_hub_videos
    op.create_index("ix_learning_hub_videos_subjectId", "learning_hub_videos", ["subjectId"])
    op.create_index("ix_learning_hub_videos_videoType", "learning_hub_videos", ["videoType"])

    # announcements
    op.create_index("ix_announcements_status", "announcements", ["status"])
    op.create_index("ix_announcements_type", "announcements", ["type"])

    # students
    op.create_index("ix_students_userId", "students", ["userId"])

    # posts
    op.create_index("ix_posts_status", "posts", ["status"])
    op.create_index("ix_posts_publishedAt", "posts", ["publishedAt"])


def downgrade() -> None:
    """Remove all indexes added in this migration."""
    op.drop_index("ix_subjects_teacherId", table_name="subjects")
    op.drop_index("ix_subjects_courseId", table_name="subjects")
    op.drop_index("ix_lectures_subjectId", table_name="lectures")
    op.drop_index("ix_lecture_attendance_studentId", table_name="lecture_attendance")
    op.drop_index("ix_lecture_attendance_lectureId", table_name="lecture_attendance")
    op.drop_index("ix_assignments_lectureId", table_name="assignments")
    op.drop_index("ix_student_assignments_assignmentId", table_name="student_assignments")
    op.drop_index("ix_student_assignments_studentId", table_name="student_assignments")
    op.drop_index("ix_study_resources_lectureId", table_name="study_resources")
    op.drop_index("ix_study_resources_subjectId", table_name="study_resources")
    op.drop_index("ix_tests_subjectId", table_name="tests")
    op.drop_index("ix_tests_teacherId", table_name="tests")
    op.drop_index("ix_tests_status", table_name="tests")
    op.drop_index("ix_questions_testId", table_name="questions")
    op.drop_index("ix_test_attempts_testId", table_name="test_attempts")
    op.drop_index("ix_test_attempts_studentId", table_name="test_attempts")
    op.drop_index("ix_student_answers_testId", table_name="student_answers")
    op.drop_index("ix_student_answers_studentId", table_name="student_answers")
    op.drop_index("ix_payments_studentId", table_name="payments")
    op.drop_index("ix_payments_courseId", table_name="payments")
    op.drop_index("ix_payments_status", table_name="payments")
    op.drop_index("ix_learning_hub_videos_subjectId", table_name="learning_hub_videos")
    op.drop_index("ix_learning_hub_videos_videoType", table_name="learning_hub_videos")
    op.drop_index("ix_announcements_status", table_name="announcements")
    op.drop_index("ix_announcements_type", table_name="announcements")
    op.drop_index("ix_students_userId", table_name="students")
    op.drop_index("ix_posts_status", table_name="posts")
    op.drop_index("ix_posts_publishedAt", table_name="posts")
