from enum import Enum

RATE_LIMIT = 40
ACCESS_TOKEN_EXPIRE_MINUTES = 15
REFRESH_TOKEN_EXPIRATION_DAYS = 7
PLACEHOLDER_IMAGE_PATH = "storage/placeholder-image.png"
PLACEHOLDER_PROFILE_PATH = "storage/profile-placeholder.png"


class StoragePath(str, Enum):
    SRES_DIR = "storage/sr"
    ASSIGNMENT_DIR = "storage/assignment"
    LEARNING_HUB_DIR = "storage/learning_hub"
    ANNOUNCEMENT_DIR = "storage/announcement"
    MEDIA_LIBRARY_DIR = "storage/media_library"
    BLOG_DIR = "storage/blog"
    STUDENT_DIR = "storage/student"
    EVENT_DIR = "storage/event"
    COURSE_DIR = "storage/course"
    TEST_DIR = "storage/test"
    TESTIMONIAL_DIR = "storage/testimonial"
