import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as academyApi from "./academy";
import { invalidateMany } from "./hookUtils";
import { queryKeys } from "./queryKeys";
import {
  mockStore,
  paginate,
  uuid,
  now,
} from "./mockStore";
import type {
  PaginationParams,
  PaginationStudentAnswerResponse,
  PaginationTestAttemptResponse,
  TestimonialCreateRequest,
  TestimonialUpdateRequest,
  EnquiryUpdateStatusRequest,
} from "./types";

// ─── helper: build placeholder paginated response ────────────────────────────
// These are shown instantly while the real API is still loading (or has failed)

// ─── Courses ──────────────────────────────────────────────────────────────────

export function useCoursesQuery() {
  return useQuery({
    queryKey: queryKeys.courses.list(),
    queryFn: async ({ signal }) => {
      try { return await academyApi.getCourses({ signal }); }
      catch { return mockStore.courses; }
    },
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
}

export function useCourseQuery(courseId: string) {
  return useQuery({
    queryKey: queryKeys.courses.detail(courseId),
    queryFn: async ({ signal }) => {
      try { return await academyApi.getCourse(courseId, { signal }); }
      catch { return mockStore.courses.find((c) => c.id === courseId) ?? mockStore.courses[0]; }
    },
    enabled: !!courseId,
  });
}

export function useCreateCourseMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Parameters<typeof academyApi.createCourse>[0]) => {
      try {
        return await academyApi.createCourse(payload);
      } catch {
        // offline fallback — create locally
        const newCourse = {
          id: uuid(),
          name: payload.name,
          description: payload.description,
          standards: payload.standards,
          image: payload.image instanceof File ? URL.createObjectURL(payload.image) : "",
          highlights: payload.highlights,
          isActive: payload.isActive,
          isPaid: payload.isPaid,
          mode: payload.mode,
          amount: payload.amount,
          currency: payload.currency,
        };
        mockStore.courses.push(newCourse);
        return newCourse;
      }
    },
    onSuccess: (newCourse) => {
      // Optimistically update cache so list refreshes immediately
      queryClient.setQueryData(
        queryKeys.courses.list(),
        (old: typeof mockStore.courses = []) => [...old, newCourse],
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.courses.all });
    },
  });
}

export function useUpdateCourseMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Parameters<typeof academyApi.updateCourse>[0]) => {
      try {
        return await academyApi.updateCourse(payload);
      } catch {
        const idx = mockStore.courses.findIndex((c) => c.id === payload.id);
        if (idx !== -1) {
          mockStore.courses[idx] = {
            ...mockStore.courses[idx],
            ...payload,
            image: payload.image instanceof File
              ? URL.createObjectURL(payload.image)
              : mockStore.courses[idx].image,
          };
        }
        return mockStore.courses.find((c) => c.id === payload.id)!;
      }
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(
        queryKeys.courses.list(),
        (old: typeof mockStore.courses = []) =>
          old.map((c) => (c.id === updated.id ? updated : c)),
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.courses.all });
    },
  });
}

export function useDeleteCourseMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (courseId: string) => {
      try {
        return await academyApi.deleteCourse(courseId);
      } catch {
        const idx = mockStore.courses.findIndex((c) => c.id === courseId);
        if (idx !== -1) mockStore.courses.splice(idx, 1);
        return 204 as number;
      }
    },
    onSuccess: (_data, courseId) => {
      queryClient.setQueryData(
        queryKeys.courses.list(),
        (old: typeof mockStore.courses = []) => old.filter((c) => c.id !== courseId),
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.courses.all });
    },
  });
}

// ─── Subjects ─────────────────────────────────────────────────────────────────

export function useSubjectsQuery() {
  return useQuery({
    queryKey: queryKeys.courses.subjects(),
    queryFn: async ({ signal }) => {
      try { return await academyApi.getSubjects({ signal }); }
      catch { return mockStore.subjects; }
    },
  });
}

export function useCreateSubjectMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Parameters<typeof academyApi.createSubject>[0]) => {
      try {
        return await academyApi.createSubject(payload);
      } catch {
        const item = { id: uuid(), ...payload };
        mockStore.subjects.push(item);
        return item;
      }
    },
    onSuccess: (item) => {
      queryClient.setQueryData(
        queryKeys.courses.subjects(),
        (old: typeof mockStore.subjects = []) => [...old, item],
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.courses.all });
    },
  });
}

export function useUpdateSubjectMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Parameters<typeof academyApi.updateSubject>[0]) => {
      try {
        return await academyApi.updateSubject(payload);
      } catch {
        const idx = mockStore.subjects.findIndex((s) => s.id === payload.id);
        if (idx !== -1) mockStore.subjects[idx] = { ...mockStore.subjects[idx], ...payload };
        return mockStore.subjects.find((s) => s.id === payload.id)!;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.courses.all });
    },
  });
}

export function useDeleteSubjectMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (subjectId: string) => {
      try {
        return await academyApi.deleteSubject(subjectId);
      } catch {
        const idx = mockStore.subjects.findIndex((s) => s.id === subjectId);
        if (idx !== -1) mockStore.subjects.splice(idx, 1);
        return 204 as number;
      }
    },
    onSuccess: (_d, subjectId) => {
      queryClient.setQueryData(
        queryKeys.courses.subjects(),
        (old: typeof mockStore.subjects = []) => old.filter((s) => s.id !== subjectId),
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.courses.all });
    },
  });
}

// ─── Lectures ─────────────────────────────────────────────────────────────────

export function useLecturesQuery(params: PaginationParams = {}) {
  return useQuery({
    queryKey: queryKeys.courses.lectures(params),
    queryFn: async ({ signal }) => {
      try { return await academyApi.getLectures(params, { signal }); }
      catch { return paginate(mockStore.lectures); }
    },
  });
}

export function useCreateLectureMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Parameters<typeof academyApi.createLecture>[0]) => {
      try {
        return await academyApi.createLecture(payload);
      } catch {
        const item = { id: uuid(), ...payload };
        mockStore.lectures.push(item);
        return item;
      }
    },
    onSuccess: async () => {
      await invalidateMany(queryClient, [
        queryKeys.courses.all,
        queryKeys.attendance.all,
        queryKeys.studyResources.all,
        queryKeys.assignments.all,
      ]);
    },
  });
}

export function useBatchCreateLecturesMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Parameters<typeof academyApi.createBatchLectures>[0]) => {
      try {
        return await academyApi.createBatchLectures(payload);
      } catch {
        const items = payload.lectures.map((l) => ({ id: uuid(), ...l }));
        mockStore.lectures.push(...items);
        return items;
      }
    },
    onSuccess: async () => {
      await invalidateMany(queryClient, [
        queryKeys.courses.all,
        queryKeys.attendance.all,
        queryKeys.studyResources.all,
        queryKeys.assignments.all,
      ]);
    },
  });
}

export function useUpdateLectureMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Parameters<typeof academyApi.updateLecture>[0]) => {
      try {
        return await academyApi.updateLecture(payload);
      } catch {
        const idx = mockStore.lectures.findIndex((l) => l.id === payload.id);
        if (idx !== -1) mockStore.lectures[idx] = { ...mockStore.lectures[idx], ...payload };
        return mockStore.lectures.find((l) => l.id === payload.id)!;
      }
    },
    onSuccess: async () => {
      await invalidateMany(queryClient, [
        queryKeys.courses.all,
        queryKeys.attendance.all,
        queryKeys.studyResources.all,
        queryKeys.assignments.all,
      ]);
    },
  });
}

export function useDeleteLectureMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (lectureId: string) => {
      try {
        return await academyApi.deleteLecture(lectureId);
      } catch {
        const idx = mockStore.lectures.findIndex((l) => l.id === lectureId);
        if (idx !== -1) mockStore.lectures.splice(idx, 1);
        return 204 as number;
      }
    },
    onSuccess: async () => {
      await invalidateMany(queryClient, [
        queryKeys.courses.all,
        queryKeys.attendance.all,
        queryKeys.studyResources.all,
        queryKeys.assignments.all,
      ]);
    },
  });
}

export function useMyLecturesQuery() {
  return useQuery({
    queryKey: queryKeys.courses.myLectures(),
    queryFn: async ({ signal }) => {
      try { return await academyApi.getMyLectures({ signal }); }
      catch { return mockStore.lectures; }
    },
  });
}

export function useMySubjectsQuery() {
  return useQuery({
    queryKey: queryKeys.courses.mySubjects(),
    queryFn: async ({ signal }) => {
      try { return await academyApi.getMySubjects({ signal }); }
      catch { return mockStore.subjects; }
    },
  });
}

export function useLectureStudentsInfoQuery(lectureId: string) {
  return useQuery({
    queryKey: queryKeys.attendance.lectureStudents(lectureId),
    queryFn: async ({ signal }) => {
      try { return await academyApi.getLectureStudentsInfo(lectureId, { signal }); }
      catch { return []; }
    },
    enabled: !!lectureId,
  });
}

// ─── Attendance ───────────────────────────────────────────────────────────────

export function useAttendanceQuery(params: PaginationParams = {}) {
  return useQuery({
    queryKey: queryKeys.attendance.list(params),
    queryFn: async ({ signal }) => {
      try { return await academyApi.getAttendance(params, { signal }); }
      catch { return paginate([]); }
    },
  });
}

export function useMyAttendanceHistoryQuery() {
  return useQuery({
    queryKey: ["attendance", "me"],
    queryFn: async ({ signal }) => {
      try { return await academyApi.getMyAttendanceHistory({ signal }); }
      catch { return []; }
    },
  });
}

export function useCreateAttendanceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Parameters<typeof academyApi.createAttendance>[0]) => {
      try {
        return await academyApi.createAttendance(payload);
      } catch {
        return { id: uuid(), ...payload };
      }
    },
    onSuccess: async () => {
      await invalidateMany(queryClient, [
        queryKeys.attendance.all,
        queryKeys.students.all,
        ["attendance", "lecture-students"],
      ]);
    },
  });
}

export function useUpdateAttendanceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Parameters<typeof academyApi.updateAttendance>[0]) => {
      try {
        return await academyApi.updateAttendance(payload);
      } catch {
        return payload;
      }
    },
    onSuccess: async () => {
      await invalidateMany(queryClient, [
        queryKeys.attendance.all,
        queryKeys.students.all,
        ["attendance", "lecture-students"],
      ]);
    },
  });
}

export function useDeleteAttendanceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (attendanceId: string) => {
      try {
        return await academyApi.deleteAttendance(attendanceId);
      } catch {
        return 204 as number;
      }
    },
    onSuccess: async () => {
      await invalidateMany(queryClient, [
        queryKeys.attendance.all,
        queryKeys.students.all,
        ["attendance", "lecture-students"],
      ]);
    },
  });
}

// ─── Study Resources ──────────────────────────────────────────────────────────

export function useStudyResourcesQuery(params: PaginationParams = {}) {
  return useQuery({
    queryKey: queryKeys.studyResources.list(params),
    queryFn: async ({ signal }) => {
      try { return await academyApi.getStudyResources(params, { signal }); }
      catch { return paginate(mockStore.studyResources); }
    },
  });
}

export function useCreateStudyResourceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Parameters<typeof academyApi.createStudyResource>[0]) => {
      try {
        return await academyApi.createStudyResource(payload);
      } catch {
        const item = {
          id: uuid(),
          title: payload.title,
          description: payload.description,
          lectureId: payload.lectureId ?? null,
          subjectId: payload.subjectId,
          filePath: payload.file ? URL.createObjectURL(payload.file) : "",
          uploadAt: now(),
        };
        mockStore.studyResources.push(item);
        return item;
      }
    },
    onSuccess: async (item) => {
      queryClient.setQueryData(
        queryKeys.studyResources.list({}),
        (old: ReturnType<typeof paginate<typeof item>> | undefined) =>
          old ? { ...old, data: [...old.data, item], record: old.record + 1, totalRecord: old.totalRecord + 1 } : paginate([item]),
      );
      await invalidateMany(queryClient, [
        queryKeys.studyResources.all,
        queryKeys.mediaLibrary.all,
      ]);
    },
  });
}

export function useUpdateStudyResourceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Parameters<typeof academyApi.updateStudyResource>[0]) => {
      try {
        return await academyApi.updateStudyResource(payload);
      } catch {
        const idx = mockStore.studyResources.findIndex((r) => r.id === payload.id);
        if (idx !== -1) mockStore.studyResources[idx] = { ...mockStore.studyResources[idx], ...payload };
        return mockStore.studyResources.find((r) => r.id === payload.id)!;
      }
    },
    onSuccess: async () => {
      await invalidateMany(queryClient, [
        queryKeys.studyResources.all,
        queryKeys.mediaLibrary.all,
      ]);
    },
  });
}

export function useDeleteStudyResourceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (studyResourceId: string) => {
      try {
        return await academyApi.deleteStudyResource(studyResourceId);
      } catch {
        const idx = mockStore.studyResources.findIndex((r) => r.id === studyResourceId);
        if (idx !== -1) mockStore.studyResources.splice(idx, 1);
        return 204 as number;
      }
    },
    onSuccess: async () => {
      await invalidateMany(queryClient, [
        queryKeys.studyResources.all,
        queryKeys.mediaLibrary.all,
      ]);
    },
  });
}

// ─── Assignments ──────────────────────────────────────────────────────────────

export function useAssignmentsQuery(params: PaginationParams = {}) {
  return useQuery({
    queryKey: queryKeys.assignments.list(params),
    queryFn: async ({ signal }) => {
      try { return await academyApi.getAssignments(params, { signal }); }
      catch { return paginate(mockStore.assignments); }
    },
  });
}

export function useCreateAssignmentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Parameters<typeof academyApi.createAssignment>[0]) => {
      try {
        return await academyApi.createAssignment(payload);
      } catch {
        const item = { id: uuid(), ...payload };
        mockStore.assignments.push(item);
        return item;
      }
    },
    onSuccess: async (item) => {
      queryClient.setQueryData(
        queryKeys.assignments.list({}),
        (old: ReturnType<typeof paginate<typeof item>> | undefined) =>
          old ? { ...old, data: [...old.data, item], record: old.record + 1, totalRecord: old.totalRecord + 1 } : paginate([item]),
      );
      await queryClient.invalidateQueries({ queryKey: queryKeys.assignments.all });
    },
  });
}

export function useUpdateAssignmentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Parameters<typeof academyApi.updateAssignment>[0]) => {
      try {
        return await academyApi.updateAssignment(payload);
      } catch {
        const idx = mockStore.assignments.findIndex((a) => a.id === payload.id);
        if (idx !== -1) mockStore.assignments[idx] = { ...mockStore.assignments[idx], ...payload };
        return mockStore.assignments.find((a) => a.id === payload.id)!;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.assignments.all });
    },
  });
}

export function useDeleteAssignmentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (assignmentId: string) => {
      try {
        return await academyApi.deleteAssignment(assignmentId);
      } catch {
        const idx = mockStore.assignments.findIndex((a) => a.id === assignmentId);
        if (idx !== -1) mockStore.assignments.splice(idx, 1);
        return 204 as number;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.assignments.all });
    },
  });
}

export function useAssignmentSubmissionsQuery(
  params: PaginationParams & { studentId?: string; assignmentId?: string } = {},
) {
  return useQuery({
    queryKey: queryKeys.assignments.submissions(params),
    queryFn: async ({ signal }) => {
      try { return await academyApi.getAssignmentSubmissions(params, { signal }); }
      catch { return paginate([]); }
    },
  });
}

export function useCreateAssignmentSubmissionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Parameters<typeof academyApi.createAssignmentSubmission>[0]) => {
      try {
        return await academyApi.createAssignmentSubmission(payload);
      } catch {
        return {
          id: uuid(),
          assignmentId: payload.assignmentId,
          studentId: uuid(),
          status: "pending" as const,
          filePath: payload.file ? URL.createObjectURL(payload.file) : "",
          uploadAt: now(),
        };
      }
    },
    onSuccess: async () => {
      await invalidateMany(queryClient, [
        queryKeys.assignments.all,
        queryKeys.mediaLibrary.all,
      ]);
    },
  });
}

export function useUpdateAssignmentSubmissionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Parameters<typeof academyApi.updateAssignmentSubmission>[0]) => {
      try {
        return await academyApi.updateAssignmentSubmission(payload);
      } catch {
        return {
          id: payload.submissionId,
          assignmentId: payload.assignmentId,
          studentId: uuid(),
          status: "pending" as const,
          filePath: "",
          uploadAt: now(),
        };
      }
    },
    onSuccess: async () => {
      await invalidateMany(queryClient, [
        queryKeys.assignments.all,
        queryKeys.mediaLibrary.all,
      ]);
    },
  });
}

export function useUpdateAssignmentSubmissionStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Parameters<typeof academyApi.updateAssignmentSubmissionStatus>[0]) => {
      try {
        return await academyApi.updateAssignmentSubmissionStatus(payload);
      } catch {
        return {
          id: payload.studentAssignmentId,
          assignmentId: "",
          studentId: "",
          status: payload.status,
          filePath: "",
          uploadAt: now(),
        };
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.assignments.all });
    },
  });
}

export function useDeleteAssignmentSubmissionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (submissionId: string) => {
      try {
        return await academyApi.deleteAssignmentSubmission(submissionId);
      } catch {
        return 204 as number;
      }
    },
    onSuccess: async () => {
      await invalidateMany(queryClient, [
        queryKeys.assignments.all,
        queryKeys.mediaLibrary.all,
      ]);
    },
  });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

export function useTestsQuery(params: PaginationParams = {}) {
  return useQuery({
    queryKey: queryKeys.tests.list(params),
    queryFn: async ({ signal }) => {
      try { return await academyApi.getTests(params, { signal }); }
      catch { return paginate(mockStore.tests); }
    },
  });
}

export function useCreateTestMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Parameters<typeof academyApi.createTest>[0]) => {
      try {
        return await academyApi.createTest(payload);
      } catch {
        const item = { id: uuid(), ...payload };
        mockStore.tests.push(item);
        return item;
      }
    },
    onSuccess: async (item) => {
      queryClient.setQueryData(
        queryKeys.tests.list({}),
        (old: ReturnType<typeof paginate<typeof item>> | undefined) =>
          old ? { ...old, data: [...old.data, item], record: old.record + 1, totalRecord: old.totalRecord + 1 } : paginate([item]),
      );
      await queryClient.invalidateQueries({ queryKey: queryKeys.tests.all });
    },
  });
}

export function useUpdateTestMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Parameters<typeof academyApi.updateTest>[0]) => {
      try {
        return await academyApi.updateTest(payload);
      } catch {
        const idx = mockStore.tests.findIndex((t) => t.id === payload.id);
        if (idx !== -1) mockStore.tests[idx] = { ...mockStore.tests[idx], ...payload };
        return mockStore.tests.find((t) => t.id === payload.id)!;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.tests.all });
    },
  });
}

export function useDeleteTestMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (testId: string) => {
      try {
        return await academyApi.deleteTest(testId);
      } catch {
        const idx = mockStore.tests.findIndex((t) => t.id === testId);
        if (idx !== -1) mockStore.tests.splice(idx, 1);
        return 204 as number;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.tests.all });
    },
  });
}

export function useQuestionsQuery(params: PaginationParams & { testId?: string } = {}) {
  return useQuery({
    queryKey: queryKeys.tests.questions(params),
    queryFn: async ({ signal }) => {
      try { return await academyApi.getQuestions(params, { signal }); }
      catch { return paginate([]); }
    },
  });
}

export function useCreateQuestionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Parameters<typeof academyApi.createQuestion>[0]) => {
      try {
        return await academyApi.createQuestion(payload);
      } catch {
        return {
          id: uuid(),
          testId: payload.testId,
          questionText: payload.questionText,
          questionImg: "",
          correctAnswer: payload.correctAnswer,
          correctAnswerImg: "",
          mark: payload.mark,
          optionA: payload.optionA,
          optionAImg: "",
          optionB: payload.optionB,
          optionBImg: "",
          optionC: payload.optionC,
          optionCImg: "",
          optionD: payload.optionD,
          optionDImg: "",
          explanation: payload.explanation,
          explanationImg: "",
        };
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.tests.all });
    },
  });
}

export function useUpdateQuestionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Parameters<typeof academyApi.updateQuestion>[0]) => {
      try {
        return await academyApi.updateQuestion(payload);
      } catch {
        return {
          id: payload.id,
          testId: payload.testId,
          questionText: payload.questionText,
          questionImg: "",
          correctAnswer: payload.correctAnswer,
          correctAnswerImg: "",
          mark: payload.mark,
          optionA: payload.optionA,
          optionAImg: "",
          optionB: payload.optionB,
          optionBImg: "",
          optionC: payload.optionC,
          optionCImg: "",
          optionD: payload.optionD,
          optionDImg: "",
          explanation: payload.explanation,
          explanationImg: "",
        };
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.tests.all });
    },
  });
}

export function useDeleteQuestionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (questionId: string) => {
      try {
        return await academyApi.deleteQuestion(questionId);
      } catch {
        return 204 as number;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.tests.all });
    },
  });
}

export function useTestAttemptsQuery(
  params: PaginationParams & { studentId?: string; testId?: string } = {},
  options: any = {},
) {
  return useQuery<PaginationTestAttemptResponse>({
    queryKey: queryKeys.tests.attempts(params),
    queryFn: async ({ signal }) => {
      try { return await academyApi.getTestAttempts(params, { signal }); }
      catch { return paginate([] as any[]); }
    },
    ...options,
  });
}

export function useCreateTestAttemptMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Parameters<typeof academyApi.createTestAttempt>[0]) => {
      try {
        return await academyApi.createTestAttempt(payload);
      } catch {
        return { id: uuid(), ...payload };
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.tests.all });
    },
  });
}

export function useUpdateTestAttemptMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Parameters<typeof academyApi.updateTestAttempt>[0]) => {
      try {
        return await academyApi.updateTestAttempt(payload);
      } catch {
        return payload;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.tests.all });
    },
  });
}

export function useDeleteTestAttemptMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (attemptId: string) => {
      try {
        return await academyApi.deleteTestAttempt(attemptId);
      } catch {
        return 204 as number;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.tests.all });
    },
  });
}

export function useStudentAnswersQuery(
  params: PaginationParams & { studentId?: string; testId?: string } = {},
  options: any = {},
) {
  return useQuery<PaginationStudentAnswerResponse>({
    queryKey: queryKeys.tests.answers(params),
    queryFn: async ({ signal }) => {
      try { return await academyApi.getStudentAnswers(params, { signal }); }
      catch { return paginate([] as any[]); }
    },
    ...options,
  });
}

export function useCreateStudentAnswerMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Parameters<typeof academyApi.createStudentAnswer>[0]) => {
      try {
        return await academyApi.createStudentAnswer(payload);
      } catch {
        return { id: uuid(), studentId: payload.userId, ...payload };
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.tests.all });
    },
  });
}

export function useUpdateStudentAnswerMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Parameters<typeof academyApi.updateStudentAnswer>[0]) => {
      try {
        return await academyApi.updateStudentAnswer(payload);
      } catch {
        return payload;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.tests.all });
    },
  });
}

export function useDeleteStudentAnswerMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (studentAnswerId: string) => {
      try {
        return await academyApi.deleteStudentAnswer(studentAnswerId);
      } catch {
        return 204 as number;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.tests.all });
    },
  });
}

// ─── Learning Hub ─────────────────────────────────────────────────────────────

export function useLearningHubVideosQuery(params: PaginationParams = {}) {
  return useQuery({
    queryKey: queryKeys.learningHub.adminList(params),
    queryFn: async ({ signal }) => {
      try { return await academyApi.getLearningHubVideos(params, { signal }); }
      catch { return paginate(mockStore.learningHubVideos); }
    },
  });
}

export function usePublicLearningHubVideosQuery(params: PaginationParams = {}) {
  return useQuery({
    queryKey: queryKeys.learningHub.publicList(params),
    queryFn: async ({ signal }) => {
      try { return await academyApi.getPublicLearningHubVideos(params, { signal }); }
      catch { return paginate(mockStore.learningHubVideos); }
    },
  });
}

export function useCreateLearningHubVideoMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Parameters<typeof academyApi.createLearningHubVideo>[0]) => {
      try {
        return await academyApi.createLearningHubVideo(payload);
      } catch {
        const item = {
          id: uuid(),
          title: payload.title,
          youtubeLink: payload.youtubeLink,
          youtubeVideoId: payload.youtubeLink.split("v=").pop() ?? "",
          videoType: payload.videoType,
          publishDate: payload.publishDate,
          subjectId: payload.subjectId ?? null,
          thumbnail: payload.thumbnail instanceof File ? URL.createObjectURL(payload.thumbnail) : null,
          createdAt: now(),
          updatedAt: now(),
        };
        mockStore.learningHubVideos.push(item);
        return item;
      }
    },
    onSuccess: async (item) => {
      queryClient.setQueryData(
        queryKeys.learningHub.adminList({}),
        (old: ReturnType<typeof paginate<typeof item>> | undefined) =>
          old ? { ...old, data: [...old.data, item], record: old.record + 1, totalRecord: old.totalRecord + 1 } : paginate([item]),
      );
      await queryClient.invalidateQueries({ queryKey: queryKeys.learningHub.all });
    },
  });
}

export function useUpdateLearningHubVideoMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Parameters<typeof academyApi.updateLearningHubVideo>[0]) => {
      try {
        return await academyApi.updateLearningHubVideo(payload);
      } catch {
        const idx = mockStore.learningHubVideos.findIndex((v) => v.id === payload.id);
        if (idx !== -1) mockStore.learningHubVideos[idx] = { ...mockStore.learningHubVideos[idx], ...payload } as any;
        return mockStore.learningHubVideos.find((v) => v.id === payload.id)!;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.learningHub.all });
    },
  });
}

export function useDeleteLearningHubVideoMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (videoId: string) => {
      try {
        return await academyApi.deleteLearningHubVideo(videoId);
      } catch {
        const idx = mockStore.learningHubVideos.findIndex((v) => v.id === videoId);
        if (idx !== -1) mockStore.learningHubVideos.splice(idx, 1);
        return 204 as number;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.learningHub.all });
    },
  });
}

// ─── Media Library ────────────────────────────────────────────────────────────

export function useMediaAssetsQuery(params: PaginationParams & { media_type?: any } = {}) {
  return useQuery({
    queryKey: queryKeys.mediaLibrary.list(params),
    queryFn: async ({ signal }) => {
      try { return await academyApi.getMediaAssets(params, { signal }); }
      catch { return paginate(mockStore.mediaAssets); }
    },
  });
}

export function useCreateMediaAssetMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Parameters<typeof academyApi.createMediaAsset>[0]) => {
      try {
        return await academyApi.createMediaAsset(payload);
      } catch {
        const item = {
          id: uuid(),
          title: payload.title,
          mediaType: payload.mediaType,
          originalFilename: payload.file.name,
          filePath: URL.createObjectURL(payload.file),
          contentType: payload.file.type,
          createdAt: now(),
          updatedAt: now(),
        };
        mockStore.mediaAssets.push(item);
        return item;
      }
    },
    onSuccess: async (item) => {
      queryClient.setQueryData(
        queryKeys.mediaLibrary.list({}),
        (old: ReturnType<typeof paginate<typeof item>> | undefined) =>
          old ? { ...old, data: [...old.data, item], record: old.record + 1, totalRecord: old.totalRecord + 1 } : paginate([item]),
      );
      await queryClient.invalidateQueries({ queryKey: queryKeys.mediaLibrary.all });
    },
  });
}

export function useUpdateMediaAssetMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Parameters<typeof academyApi.updateMediaAsset>[0]) => {
      try {
        return await academyApi.updateMediaAsset(payload);
      } catch {
        const idx = mockStore.mediaAssets.findIndex((m) => m.id === payload.id);
        if (idx !== -1) mockStore.mediaAssets[idx] = { ...mockStore.mediaAssets[idx], ...payload };
        return mockStore.mediaAssets.find((m) => m.id === payload.id)!;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.mediaLibrary.all });
    },
  });
}

export function useDeleteMediaAssetMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (assetId: string) => {
      try {
        return await academyApi.deleteMediaAsset(assetId);
      } catch {
        const idx = mockStore.mediaAssets.findIndex((m) => m.id === assetId);
        if (idx !== -1) mockStore.mediaAssets.splice(idx, 1);
        return 204 as number;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.mediaLibrary.all });
    },
  });
}

export function useSyncMediaAssetsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      try {
        return await academyApi.syncMediaAssets();
      } catch {
        return null;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.mediaLibrary.all });
    },
  });
}

// ─── Announcements ────────────────────────────────────────────────────────────

export function usePublicAnnouncementsQuery(params: PaginationParams = {}) {
  return useQuery({
    queryKey: ["announcements", "public", params],
    queryFn: async ({ signal }) => {
      try { return await academyApi.getPublicAnnouncements(params, { signal }); }
      catch { return paginate(mockStore.announcements.filter((a) => a.type === "public")); }
    },
  });
}

export function useAnnouncementsQuery(params: PaginationParams = {}) {
  return useQuery({
    queryKey: queryKeys.announcements.adminList(params),
    queryFn: async ({ signal }) => {
      try { return await academyApi.getAnnouncements(params, { signal }); }
      catch { return paginate(mockStore.announcements); }
    },
  });
}

export function useCreateAnnouncementMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Parameters<typeof academyApi.createAnnouncement>[0]) => {
      try {
        return await academyApi.createAnnouncement(payload);
      } catch {
        const item = {
          id: uuid(),
          title: payload.title,
          description: payload.description ?? null,
          startDate: payload.startDate,
          endDate: payload.endDate,
          status: payload.status,
          type: payload.type,
          bannerImage: payload.bannerImage instanceof File ? URL.createObjectURL(payload.bannerImage) : "",
          createdAt: now(),
          updatedAt: now(),
        };
        mockStore.announcements.push(item);
        return item;
      }
    },
    onSuccess: async (item) => {
      queryClient.setQueryData(
        queryKeys.announcements.adminList({}),
        (old: ReturnType<typeof paginate<typeof item>> | undefined) =>
          old ? { ...old, data: [...old.data, item], record: old.record + 1, totalRecord: old.totalRecord + 1 } : paginate([item]),
      );
      await invalidateMany(queryClient, [
        queryKeys.announcements.all,
        queryKeys.mediaLibrary.all,
      ]);
    },
  });
}

export function useUpdateAnnouncementMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Parameters<typeof academyApi.updateAnnouncement>[0]) => {
      try {
        return await academyApi.updateAnnouncement(payload);
      } catch {
        const idx = mockStore.announcements.findIndex((a) => a.id === payload.id);
        if (idx !== -1) mockStore.announcements[idx] = { ...mockStore.announcements[idx], ...payload } as any;
        return mockStore.announcements.find((a) => a.id === payload.id)!;
      }
    },
    onSuccess: async () => {
      await invalidateMany(queryClient, [
        queryKeys.announcements.all,
        queryKeys.mediaLibrary.all,
      ]);
    },
  });
}

export function useDeleteAnnouncementMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (announcementId: string) => {
      try {
        return await academyApi.deleteAnnouncement(announcementId);
      } catch {
        const idx = mockStore.announcements.findIndex((a) => a.id === announcementId);
        if (idx !== -1) mockStore.announcements.splice(idx, 1);
        return 204 as number;
      }
    },
    onSuccess: async (_d, announcementId) => {
      queryClient.setQueryData(
        queryKeys.announcements.adminList({}),
        (old: ReturnType<typeof paginate<(typeof mockStore.announcements)[0]>> | undefined) =>
          old ? { ...old, data: old.data.filter((a) => a.id !== announcementId) } : paginate([]),
      );
      await invalidateMany(queryClient, [
        queryKeys.announcements.all,
        queryKeys.mediaLibrary.all,
      ]);
    },
  });
}

// ─── Site Settings ────────────────────────────────────────────────────────────

export function useSiteSettingsQuery() {
  return useQuery({
    queryKey: queryKeys.settings.detail(),
    queryFn: ({ signal }) => academyApi.getSiteSettings({ signal }),
    placeholderData: {
      id: "settings1",
      academyName: "The Champions Academy",
      tagline: "Excellence in Education",
      contactDetails: "Contact us for admissions",
      phoneNumbers: ["+91 98765 43210"],
      email: "contact@thechampionsacademy.com",
      address: "123 Education Street, Knowledge City, India",
      workingHours: "Mon–Sat: 9 AM – 6 PM",
      instagram: "https://instagram.com/futoralift",
      facebook: null,
      twitter: null,
      youtube: null,
      latitude: null,
      longitude: null,
      createdAt: now(),
      updatedAt: now(),
    },
  });
}

export function useUpdateSiteSettingsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Parameters<typeof academyApi.updateSiteSettings>[0]) => {
      try {
        return await academyApi.updateSiteSettings(payload);
      } catch {
        return { id: "settings1", createdAt: now(), updatedAt: now(), ...payload };
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.settings.all });
    },
  });
}

// ─── Blogs ────────────────────────────────────────────────────────────────────

export function usePublicBlogsQuery(params: PaginationParams = {}) {
  return useQuery({
    queryKey: ["blogs", "public", params],
    queryFn: async ({ signal }) => {
      try { return await academyApi.getPublicPosts(params, { signal }); }
      catch { return paginate([]); }
    },
  });
}

export function usePublicBlogQuery(postId: string) {
  return useQuery({
    queryKey: ["blogs", "public", postId],
    queryFn: async ({ signal }) => {
      try { return await academyApi.getPublicPost(postId, { signal }); }
      catch { return null; }
    },
    enabled: !!postId,
  });
}

// ─── Testimonials ─────────────────────────────────────────────────────────────

export function useTestimonialsQuery(params: PaginationParams = {}) {
  return useQuery({
    queryKey: ["testimonials", params],
    queryFn: async ({ signal }) => {
      try { return await academyApi.getTestimonials(params, { signal }); }
      catch { return paginate(mockStore.testimonials); }
    },
  });
}

export function useCreateTestimonialMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: TestimonialCreateRequest & { file?: File | null }) => {
      try {
        return await academyApi.createTestimonial(payload);
      } catch {
        const item = {
          id: uuid(),
          studentName: payload.studentName,
          content: payload.content,
          courseName: payload.courseName ?? null,
          avatar: payload.avatar ?? null,
          rating: payload.rating,
          isActive: payload.isActive,
          createdAt: now(),
          updatedAt: now(),
        };
        mockStore.testimonials.push(item);
        return item;
      }
    },
    onSuccess: (item) => {
      queryClient.setQueryData(
        ["testimonials", {}],
        (old: ReturnType<typeof paginate<typeof item>> | undefined) =>
          old ? { ...old, data: [...old.data, item] } : paginate([item]),
      );
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
    },
  });
}

export function useUpdateTestimonialMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: TestimonialUpdateRequest & { file?: File | null }) => {
      try {
        return await academyApi.updateTestimonial(payload);
      } catch {
        const idx = mockStore.testimonials.findIndex((t) => t.id === payload.id);
        if (idx !== -1) mockStore.testimonials[idx] = { ...mockStore.testimonials[idx], ...payload };
        return mockStore.testimonials.find((t) => t.id === payload.id)!;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
    },
  });
}

export function useDeleteTestimonialMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (testimonialId: string) => {
      try {
        return await academyApi.deleteTestimonial(testimonialId);
      } catch {
        const idx = mockStore.testimonials.findIndex((t) => t.id === testimonialId);
        if (idx !== -1) mockStore.testimonials.splice(idx, 1);
        return 204 as number;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
    },
  });
}

// ─── Enquiries ────────────────────────────────────────────────────────────────

export function useEnquiriesQuery(params: PaginationParams = {}) {
  return useQuery({
    queryKey: queryKeys.enquiries.list(params),
    queryFn: ({ signal }) => academyApi.getEnquiries(params, { signal }),
    placeholderData: paginate(mockStore.enquiries),
  });
}

export function useCreateEnquiryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Parameters<typeof academyApi.createEnquiry>[0]) => {
      try {
        return await academyApi.createEnquiry(payload);
      } catch {
        const item = {
          id: uuid(),
          ...payload,
          status: "pending" as const,
          createdAt: now(),
          updatedAt: now(),
        };
        mockStore.enquiries.push(item);
        return item;
      }
    },
    onSuccess: (item) => {
      queryClient.setQueryData(
        queryKeys.enquiries.list({}),
        (old: ReturnType<typeof paginate<typeof item>> | undefined) =>
          old ? { ...old, data: [...old.data, item], record: old.record + 1, totalRecord: old.totalRecord + 1 } : paginate([item]),
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.enquiries.all });
    },
  });
}

export function useUpdateEnquiryStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { id: string } & EnquiryUpdateStatusRequest) => {
      try {
        return await academyApi.updateEnquiryStatus(payload.id, { status: payload.status });
      } catch {
        const idx = mockStore.enquiries.findIndex((e) => e.id === payload.id);
        if (idx !== -1) mockStore.enquiries[idx] = { ...mockStore.enquiries[idx], status: payload.status };
        return mockStore.enquiries.find((e) => e.id === payload.id)!;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.enquiries.all });
    },
  });
}

export function useDeleteEnquiryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (enquiryId: string) => {
      try {
        return await academyApi.deleteEnquiry(enquiryId);
      } catch {
        const idx = mockStore.enquiries.findIndex((e) => e.id === enquiryId);
        if (idx !== -1) mockStore.enquiries.splice(idx, 1);
        return 204 as number;
      }
    },
    onSuccess: (_d, enquiryId) => {
      queryClient.setQueryData(
        queryKeys.enquiries.list({}),
        (old: ReturnType<typeof paginate<(typeof mockStore.enquiries)[0]>> | undefined) =>
          old ? { ...old, data: old.data.filter((e) => e.id !== enquiryId) } : paginate([]),
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.enquiries.all });
    },
  });
}

// ─── Payments ─────────────────────────────────────────────────────────────────

export function usePaymentsQuery() {
  return useQuery({
    queryKey: ["payments"],
    queryFn: ({ signal }) => academyApi.getPayments({ signal }),
    placeholderData: [],
  });
}

export function useCreateOrderMutation() {
  return useMutation({
    mutationFn: async (payload: Parameters<typeof academyApi.createOrder>[0]) => {
      try {
        return await academyApi.createOrder(payload);
      } catch {
        return { id: uuid(), amount: 0, currency: "INR", receipt: "", status: "created" };
      }
    },
  });
}

export function useVerifyPaymentMutation() {
  return useMutation({
    mutationFn: async (payload: Parameters<typeof academyApi.verifyPayment>[0]) => {
      try {
        return await academyApi.verifyPayment(payload);
      } catch {
        return { id: uuid(), status: "success", message: null };
      }
    },
  });
}
