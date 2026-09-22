# Database Schema

## Overview

SF Academy uses a PostgreSQL database managed via SQLAlchemy (async ORM) and Alembic migrations.

**Migration files:** `backend/alembic/versions/`  
**ORM models:** `backend/data/schemas.py`

---

## Entity Relationship Summary

```
User (1) ─────────────── (1) Student
User (1) ──────────────── (*) Subject [as teacher]

Course (*) ────────────── (*) Student    [via student_courses]
Course (*) ────────────── (*) Category   [via course_categories]
Course (1) ────────────── (*) Subject

Subject (1) ───────────── (*) Lecture
Subject (1) ───────────── (*) LearningHubVideo
Subject (1) ───────────── (*) StudyResource
Subject (1) ───────────── (*) Tests

Lecture (1) ───────────── (*) LectureAttendance
Lecture (1) ───────────── (*) Assignments
Lecture (1) ───────────── (*) StudyResource

Student (1) ───────────── (*) LectureAttendance
Student (1) ───────────── (*) StudentAssignments
Student (1) ───────────── (*) TestAttempts
Student (1) ───────────── (*) StudentAnswers
Student (1) ───────────── (*) Payment

Tests (1) ─────────────── (*) Questions
Tests (1) ─────────────── (*) TestAttempts

Post (*) ──────────────── (*) Tag         [via post_tags]
Post (*) ──────────────── (*) Category    [via post_categories]

StudyResource (*) ──────── (*) Category   [via study_resource_categories]
```

---

## Tables

### `users`
Core identity table for all roles (admin, teacher, student).

| Column | Type | Description |
|---|---|---|
| `id` | UUID PK | |
| `firstName` | VARCHAR | |
| `lastName` | VARCHAR | |
| `email` | VARCHAR UNIQUE | Login identifier |
| `phone` | VARCHAR UNIQUE | E.164 format (e.g. +919876543210) |
| `passwordHash` | VARCHAR nullable | bcrypt hash; null for Google-only accounts |
| `authServiceProvider` | ENUM | `google`, `app`, `admin`, `teacher` |
| `role` | ENUM | `student`, `teacher`, `admin` |
| `avatar` | VARCHAR | URL or local path |
| `refreshToken` | VARCHAR nullable | Current valid refresh token |
| `createdAt` | TIMESTAMPTZ | |
| `deletedAt` | TIMESTAMPTZ nullable | Soft delete |
| `lastLogIn` | TIMESTAMPTZ nullable | |

**Indexes:** `email` (unique, used for login lookup)

---

### `pending_users`
Temporary storage during email OTP registration. Row is deleted after OTP verification.

| Column | Type | Description |
|---|---|---|
| `id` | UUID PK | |
| `firstName` | VARCHAR | |
| `lastName` | VARCHAR | |
| `email` | VARCHAR UNIQUE | |
| `phone` | VARCHAR UNIQUE nullable | |
| `passwordHash` | VARCHAR nullable | |
| `authServiceProvider` | ENUM | |
| `role` | ENUM | Always `student` on self-registration |

---

### `students`
Extended profile for users with the `student` role. One-to-one with `users`.

| Column | Type | Description |
|---|---|---|
| `id` | UUID PK | |
| `userId` | UUID FK → users UNIQUE | |
| `rollNo` | VARCHAR nullable | Academy roll number |
| `standard` | VARCHAR nullable | Grade/class (e.g. "10th") |
| `schoolName` | VARCHAR nullable | |
| `board` | VARCHAR nullable | CBSE / SSC / ICSE etc. |
| `parentName` | VARCHAR nullable | |
| `parentMobileNumber` | VARCHAR nullable | |

**Relationships:** `courses` (M2M), `attendance` (1-M), `assignments` (1-M), `testAttempts` (1-M)

---

### `courses`

| Column | Type | Description |
|---|---|---|
| `id` | UUID PK | |
| `name` | VARCHAR | |
| `description` | VARCHAR | |
| `standards` | TEXT[] | Target grade levels |
| `image` | VARCHAR | Course thumbnail URL |
| `highlights` | TEXT[] | Bullet-point features |
| `isActive` | BOOLEAN | |
| `isPaid` | BOOLEAN | If true, `amount` must be set |
| `mode` | ENUM | `offline` / `online` |
| `amount` | FLOAT nullable | Price in `currency` units |
| `currency` | VARCHAR(10) | Default `INR` |

**Relationships:** `subjects` (1-M), `students` (M2M), `categories` (M2M)

---

### `subjects`

| Column | Type | Description |
|---|---|---|
| `id` | UUID PK | |
| `name` | VARCHAR | Subject name |
| `teacherId` | UUID FK → users nullable | Assigned teacher (SET NULL on delete) |
| `courseId` | UUID FK → courses | |

**Indexes:** `teacherId`, `courseId` (added in migration `a1b2c3d4e5f6`)

---

### `lectures`

| Column | Type | Description |
|---|---|---|
| `id` | UUID PK | |
| `lectureTitle` | VARCHAR nullable | |
| `startDate` | TIMESTAMPTZ | |
| `endDate` | TIMESTAMPTZ | |
| `subjectId` | UUID FK → subjects | |

---

### `lecture_attendance`

| Column | Type | Description |
|---|---|---|
| `id` | UUID PK | |
| `status` | ENUM | `present`, `absent`, `late`, `excused` |
| `studentId` | UUID FK → students CASCADE | |
| `lectureId` | UUID FK → lectures | |

**Constraints:** UNIQUE(`studentId`, `lectureId`)

---

### `tests`

| Column | Type | Description |
|---|---|---|
| `id` | UUID PK | |
| `title` | VARCHAR | |
| `description` | VARCHAR | |
| `totalMarks` | INTEGER | |
| `durationMinutes` | INTEGER | |
| `startTime` | TIMESTAMPTZ | When test becomes accessible |
| `expiresAt` | TIMESTAMPTZ | When test closes |
| `createdAt` | TIMESTAMPTZ | |
| `mode` | ENUM | `offline` / `online` |
| `type` | ENUM | `chapter_wise` / `full_syllabus` |
| `subjectId` | UUID FK → subjects | |
| `teacherId` | UUID FK → users | |
| `maxAttempts` | INTEGER | |
| `status` | ENUM | `draft` / `published` |

---

### `questions`

| Column | Type | Description |
|---|---|---|
| `id` | UUID PK | |
| `questionText` | VARCHAR nullable | Text version of question |
| `questionImage` | VARCHAR nullable | Image version of question |
| `optionA–D` | VARCHAR nullable | Option text |
| `optionAImg–DImg` | VARCHAR nullable | Option images |
| `explanation` | VARCHAR nullable | Explanation text |
| `explanationImg` | VARCHAR nullable | |
| `correctAnswer` | ENUM nullable | `A`, `B`, `C`, `D` |
| `correctImg` | VARCHAR nullable | |
| `mark` | INTEGER nullable | Marks for this question |
| `testId` | UUID FK → tests | |

---

### `test_attempts`

| Column | Type | Description |
|---|---|---|
| `id` | UUID PK | |
| `testId` | UUID FK → tests | |
| `studentId` | UUID FK → students CASCADE | |
| `attempts` | INTEGER nullable | Number of attempts made |
| `obtainedMarks` | INTEGER nullable | Final score |

---

### `student_answers`

| Column | Type | Description |
|---|---|---|
| `id` | UUID PK | |
| `answer` | ENUM nullable | `A`, `B`, `C`, `D` |
| `testId` | UUID FK → tests | |
| `questionId` | UUID FK → questions | |
| `studentId` | UUID FK → students CASCADE | |

**Constraints:** UNIQUE(`studentId`, `questionId`, `testId`)

---

### `assignments`

| Column | Type | Description |
|---|---|---|
| `id` | UUID PK | |
| `title` | VARCHAR | |
| `description` | VARCHAR nullable | |
| `lectureId` | UUID FK → lectures nullable | |
| `deadline` | TIMESTAMPTZ | |
| `mark` | INTEGER nullable | |

---

### `student_assignments`

| Column | Type | Description |
|---|---|---|
| `id` | UUID PK | |
| `assignmentId` | UUID FK → assignments | |
| `studentId` | UUID FK → students CASCADE | |
| `status` | ENUM | `no_actions`, `pending`, `excused`, `incomplete`, `completed`, `rejected` |
| `filePath` | VARCHAR | Uploaded file path |
| `uploadAt` | TIMESTAMPTZ | |

**Constraints:** UNIQUE(`studentId`, `assignmentId`)

---

### `payments`

| Column | Type | Description |
|---|---|---|
| `id` | UUID PK | |
| `razorpayOrderId` | VARCHAR UNIQUE | |
| `razorpayPaymentId` | VARCHAR nullable | Set after payment capture |
| `razorpaySignature` | VARCHAR nullable | For signature verification |
| `amount` | FLOAT | In `currency` units |
| `currency` | VARCHAR(10) | Default `INR` |
| `status` | VARCHAR | `pending`, `success`, `failed` |
| `studentId` | UUID FK → students CASCADE | |
| `courseId` | UUID FK → courses CASCADE | |
| `createdAt` | TIMESTAMPTZ | |
| `updatedAt` | TIMESTAMPTZ | |

---

### `posts` (Blog)

| Column | Type | Description |
|---|---|---|
| `id` | UUID PK | |
| `title` | VARCHAR | |
| `slug` | VARCHAR UNIQUE | URL-friendly identifier |
| `content` | TEXT | Editor.js JSON string |
| `excerpt` | VARCHAR nullable | Short description |
| `featuredImage` | VARCHAR nullable | |
| `status` | ENUM | `draft` / `publish` |
| `metaTitle` | VARCHAR nullable | SEO title |
| `metaDescription` | VARCHAR nullable | SEO description |
| `createdAt` | TIMESTAMPTZ | |
| `publishedAt` | TIMESTAMPTZ nullable | |
| `updatedAt` | TIMESTAMPTZ | |

---

### `site_settings`

| Column | Type | Description |
|---|---|---|
| `id` | UUID PK | |
| `academyName` | VARCHAR | |
| `tagline` | VARCHAR | |
| `contactDetails` | TEXT nullable | Rich text contact info |
| `phoneNumbers` | TEXT[] | Multiple phone numbers |
| `email` | VARCHAR | |
| `address` | TEXT | |
| `workingHours` | TEXT | |
| `instagram` | VARCHAR nullable | |
| `facebook` | VARCHAR nullable | |
| `twitter` | VARCHAR nullable | |
| `youtube` | VARCHAR nullable | |
| `latitude` | DOUBLE nullable | |
| `longitude` | DOUBLE nullable | |
| `createdAt` | TIMESTAMPTZ | |
| `updatedAt` | TIMESTAMPTZ | |

---

## Junction Tables

| Table | Columns | Description |
|---|---|---|
| `student_courses` | `student_id`, `course_id` | Course enrollment |
| `course_categories` | `course_id`, `category_id` | Course taxonomy |
| `post_tags` | `post_id`, `tag_id` | Blog post tags |
| `post_categories` | `post_id`, `category_id` | Blog categories |
| `study_resource_categories` | `study_resource_id`, `category_id` | Resource taxonomy |

---

## Running Migrations

```bash
# Apply all pending migrations
uv run alembic upgrade head

# Check current migration state
uv run alembic current

# Create a new migration (after changing schemas.py)
uv run alembic revision --autogenerate -m "describe your change"

# Roll back one migration
uv run alembic downgrade -1
```
