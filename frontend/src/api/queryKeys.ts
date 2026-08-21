import type { MediaType, PaginationParams } from "./types";

const withFallback = <T>(value: T | undefined): T | Record<string, never> =>
  value ?? {};

export const queryKeys = {
  auth: {
    all: ["auth"] as const,
    me: () => ["auth", "me"] as const,
  },
  user: {
    all: ["user"] as const,
    email: () => ["user", "email"] as const,
    authProvider: () => ["user", "auth-provider"] as const,
  },
  teachers: {
    all: ["teachers"] as const,
    list: (params?: PaginationParams) =>
      ["teachers", "list", withFallback(params)] as const,
    dashboard: () => ["teachers", "dashboard"] as const,
    myTeachers: () => ["teachers", "my"] as const,
  },
  students: {
    all: ["students"] as const,
    list: (params?: PaginationParams) =>
      ["students", "list", withFallback(params)] as const,
    teacherList: (params?: PaginationParams) =>
      ["students", "teacher-list", withFallback(params)] as const,
    insights: (studentUserId?: string, role: string = "admin") =>
      ["students", "insights", role, studentUserId ?? "all"] as const,
  },
  courses: {
    all: ["courses"] as const,
    list: () => ["courses", "list"] as const,
    subjects: () => ["courses", "subjects"] as const,
    lectures: (params?: PaginationParams) =>
      ["courses", "lectures", withFallback(params)] as const,
    myLectures: () => ["courses", "my-lectures"] as const,
    mySubjects: () => ["courses", "my-subjects"] as const,
    detail: (courseId: string) => ["courses", "detail", courseId] as const,
  },
  attendance: {
    all: ["attendance"] as const,
    list: (params?: PaginationParams) =>
      ["attendance", "list", withFallback(params)] as const,
    lectureStudents: (lectureId: string) =>
      ["attendance", "lecture-students", lectureId] as const,
  },
  studyResources: {
    all: ["study-resources"] as const,
    list: (params?: PaginationParams) =>
      ["study-resources", "list", withFallback(params)] as const,
  },
  assignments: {
    all: ["assignments"] as const,
    list: (params?: PaginationParams) =>
      ["assignments", "list", withFallback(params)] as const,
    submissions: (params?: PaginationParams & { studentId?: string; assignmentId?: string }) =>
      [
        "assignments",
        "submissions",
        withFallback(params),
        params?.studentId ?? "all",
        params?.assignmentId ?? "all",
      ] as const,
  },
  tests: {
    all: ["tests"] as const,
    list: (params?: PaginationParams) =>
      ["tests", "list", withFallback(params)] as const,
    questions: (params?: PaginationParams & { testId?: string }) =>
      ["tests", "questions", withFallback(params), params?.testId ?? "all"] as const,
    attempts: (params?: PaginationParams) =>
      ["tests", "attempts", withFallback(params)] as const,
    answers: (params?: PaginationParams & { studentId?: string; testId?: string }) =>
      ["tests", "answers", withFallback(params), params?.studentId ?? "all", params?.testId ?? "all"] as const,
  },
  posts: {
    all: ["posts"] as const,
    list: (params?: PaginationParams) =>
      ["posts", "list", withFallback(params)] as const,
  },
  blogTaxonomy: {
    all: ["blog-taxonomy"] as const,
    detail: () => ["blog-taxonomy", "detail"] as const,
  },
  learningHub: {
    all: ["learning-hub"] as const,
    adminList: (params?: PaginationParams) =>
      ["learning-hub", "admin", withFallback(params)] as const,
    publicList: (params?: PaginationParams) =>
      ["learning-hub", "public", withFallback(params)] as const,
  },
  announcements: {
    all: ["announcements"] as const,
    adminList: (params?: PaginationParams) =>
      ["announcements", "admin", withFallback(params)] as const,
    publicList: (params?: PaginationParams) =>
      ["announcements", "public", withFallback(params)] as const,
  },
  mediaLibrary: {
    all: ["media-library"] as const,
    list: (params?: PaginationParams & { mediaType?: MediaType }) =>
      ["media-library", "list", withFallback(params)] as const,
  },
  settings: {
    all: ["settings"] as const,
    detail: () => ["settings", "detail"] as const,
  },
  enquiries: {
    all: ["enquiries"] as const,
    list: (params?: PaginationParams) =>
      ["enquiries", "list", withFallback(params)] as const,
  },
} as const;
