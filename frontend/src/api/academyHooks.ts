import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as academyApi from "./academy";
import { invalidateMany } from "./hookUtils";
import { queryKeys } from "./queryKeys";
import type { 
  PaginationParams, 
  PaginationStudentAnswerResponse, 
  PaginationTestAttemptResponse,
  TestimonialCreateRequest,
  TestimonialUpdateRequest,
  EnquiryUpdateStatusRequest,
} from "./types";

export function useCoursesQuery() {
  return useQuery({
    queryKey: queryKeys.courses.list(),
    queryFn: ({ signal }) => academyApi.getCourses({ signal }),
    staleTime: Infinity,
    refetchOnWindowFocus: false
  });
}

export function useCourseQuery(courseId: string) {
  return useQuery({
    queryKey: queryKeys.courses.detail(courseId),
    queryFn: ({ signal }) => academyApi.getCourse(courseId, { signal }),
    enabled: !!courseId,
  });
}

export function useCreateCourseMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof academyApi.createCourse>[0]) =>
      academyApi.createCourse(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.courses.all });
    },
  });
}

export function useUpdateCourseMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof academyApi.updateCourse>[0]) =>
      academyApi.updateCourse(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.courses.all });
    },
  });
}

export function useDeleteCourseMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (courseId: string) => academyApi.deleteCourse(courseId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.courses.all });
    },
  });
}

export function useSubjectsQuery() {
  return useQuery({
    queryKey: queryKeys.courses.subjects(),
    queryFn: ({ signal }) => academyApi.getSubjects({ signal }),
  });
}

export function useCreateSubjectMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof academyApi.createSubject>[0]) =>
      academyApi.createSubject(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.courses.all });
    },
  });
}

export function useUpdateSubjectMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof academyApi.updateSubject>[0]) =>
      academyApi.updateSubject(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.courses.all });
    },
  });
}

export function useDeleteSubjectMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (subjectId: string) => academyApi.deleteSubject(subjectId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.courses.all });
    },
  });
}

export function useLecturesQuery(params: PaginationParams = {}) {
  return useQuery({
    queryKey: queryKeys.courses.lectures(params),
    queryFn: ({ signal }) => academyApi.getLectures(params, { signal }),
  });
}

export function useCreateLectureMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof academyApi.createLecture>[0]) =>
      academyApi.createLecture(payload),
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
    mutationFn: (payload: Parameters<typeof academyApi.createBatchLectures>[0]) =>
      academyApi.createBatchLectures(payload),
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
    mutationFn: (payload: Parameters<typeof academyApi.updateLecture>[0]) =>
      academyApi.updateLecture(payload),
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
    mutationFn: (lectureId: string) => academyApi.deleteLecture(lectureId),
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
    queryFn: ({ signal }) => academyApi.getMyLectures({ signal }),
  });
}

export function useMySubjectsQuery() {
  return useQuery({
    queryKey: queryKeys.courses.mySubjects(),
    queryFn: ({ signal }) => academyApi.getMySubjects({ signal }),
  });
}

export function useLectureStudentsInfoQuery(lectureId: string) {
  return useQuery({
    queryKey: queryKeys.attendance.lectureStudents(lectureId),
    queryFn: ({ signal }) => academyApi.getLectureStudentsInfo(lectureId, { signal }),
    enabled: !!lectureId,
  });
}

export function useAttendanceQuery(params: PaginationParams = {}) {
  return useQuery({
    queryKey: queryKeys.attendance.list(params),
    queryFn: ({ signal }) => academyApi.getAttendance(params, { signal }),
  });
}

export function useMyAttendanceHistoryQuery() {
  return useQuery({
    queryKey: ["attendance", "me"],
    queryFn: ({ signal }) => academyApi.getMyAttendanceHistory({ signal }),
  });
}

export function useCreateAttendanceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof academyApi.createAttendance>[0]) =>
      academyApi.createAttendance(payload),
    onSuccess: async () => {
      await invalidateMany(queryClient, [
        queryKeys.attendance.all,
        queryKeys.students.all,
        ["attendance", "lecture-students"]
      ]);
    },
  });
}

export function useUpdateAttendanceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof academyApi.updateAttendance>[0]) =>
      academyApi.updateAttendance(payload),
    onSuccess: async () => {
      await invalidateMany(queryClient, [
        queryKeys.attendance.all,
        queryKeys.students.all,
        ["attendance", "lecture-students"]
      ]);
    },
  });
}

export function useDeleteAttendanceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (attendanceId: string) => academyApi.deleteAttendance(attendanceId),
    onSuccess: async () => {
      await invalidateMany(queryClient, [
        queryKeys.attendance.all,
        queryKeys.students.all,
        ["attendance", "lecture-students"]
      ]);
    },
  });
}

export function useStudyResourcesQuery(params: PaginationParams = {}) {
  return useQuery({
    queryKey: queryKeys.studyResources.list(params),
    queryFn: ({ signal }) => academyApi.getStudyResources(params, { signal }),
  });
}

export function useCreateStudyResourceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof academyApi.createStudyResource>[0]) =>
      academyApi.createStudyResource(payload),
    onSuccess: async () => {
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
    mutationFn: (payload: Parameters<typeof academyApi.updateStudyResource>[0]) =>
      academyApi.updateStudyResource(payload),
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
    mutationFn: (studyResourceId: string) => academyApi.deleteStudyResource(studyResourceId),
    onSuccess: async () => {
      await invalidateMany(queryClient, [
        queryKeys.studyResources.all,
        queryKeys.mediaLibrary.all,
      ]);
    },
  });
}

export function useAssignmentsQuery(params: PaginationParams = {}) {
  return useQuery({
    queryKey: queryKeys.assignments.list(params),
    queryFn: ({ signal }) => academyApi.getAssignments(params, { signal }),
  });
}

export function useCreateAssignmentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof academyApi.createAssignment>[0]) =>
      academyApi.createAssignment(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.assignments.all });
    },
  });
}

export function useUpdateAssignmentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof academyApi.updateAssignment>[0]) =>
      academyApi.updateAssignment(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.assignments.all });
    },
  });
}

export function useDeleteAssignmentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (assignmentId: string) => academyApi.deleteAssignment(assignmentId),
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
    queryFn: ({ signal }) => academyApi.getAssignmentSubmissions(params, { signal }),
  });
}

export function useCreateAssignmentSubmissionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof academyApi.createAssignmentSubmission>[0]) =>
      academyApi.createAssignmentSubmission(payload),
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
    mutationFn: (payload: Parameters<typeof academyApi.updateAssignmentSubmission>[0]) =>
      academyApi.updateAssignmentSubmission(payload),
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
    mutationFn: (payload: Parameters<typeof academyApi.updateAssignmentSubmissionStatus>[0]) =>
      academyApi.updateAssignmentSubmissionStatus(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.assignments.all });
    },
  });
}

export function useDeleteAssignmentSubmissionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (submissionId: string) => academyApi.deleteAssignmentSubmission(submissionId),
    onSuccess: async () => {
      await invalidateMany(queryClient, [
        queryKeys.assignments.all,
        queryKeys.mediaLibrary.all,
      ]);
    },
  });
}

export function useTestsQuery(params: PaginationParams = {}) {
  return useQuery({
    queryKey: queryKeys.tests.list(params),
    queryFn: ({ signal }) => academyApi.getTests(params, { signal }),
  });
}

export function useCreateTestMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof academyApi.createTest>[0]) =>
      academyApi.createTest(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.tests.all });
    },
  });
}

export function useUpdateTestMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof academyApi.updateTest>[0]) =>
      academyApi.updateTest(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.tests.all });
    },
  });
}

export function useDeleteTestMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (testId: string) => academyApi.deleteTest(testId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.tests.all });
    },
  });
}

export function useQuestionsQuery(params: PaginationParams & { testId?: string } = {}) {
  return useQuery({
    queryKey: queryKeys.tests.questions(params),
    queryFn: ({ signal }) => academyApi.getQuestions(params, { signal }),
  });
}

export function useCreateQuestionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof academyApi.createQuestion>[0]) =>
      academyApi.createQuestion(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.tests.all });
    },
  });
}

export function useUpdateQuestionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof academyApi.updateQuestion>[0]) =>
      academyApi.updateQuestion(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.tests.all });
    },
  });
}

export function useDeleteQuestionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (questionId: string) => academyApi.deleteQuestion(questionId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.tests.all });
    },
  });
}

export function useTestAttemptsQuery(params: PaginationParams & { studentId?: string; testId?: string } = {}, options: any = {}) {
  return useQuery<PaginationTestAttemptResponse>({
    queryKey: queryKeys.tests.attempts(params),
    queryFn: ({ signal }) => academyApi.getTestAttempts(params, { signal }),
    ...options
  });
}

export function useCreateTestAttemptMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof academyApi.createTestAttempt>[0]) =>
      academyApi.createTestAttempt(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.tests.all });
    },
  });
}

export function useUpdateTestAttemptMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof academyApi.updateTestAttempt>[0]) =>
      academyApi.updateTestAttempt(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.tests.all });
    },
  });
}

export function useDeleteTestAttemptMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (attemptId: string) => academyApi.deleteTestAttempt(attemptId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.tests.all });
    },
  });
}

export function useStudentAnswersQuery(
  params: PaginationParams & { studentId?: string; testId?: string } = {},
  options: any = {}
) {
  return useQuery<PaginationStudentAnswerResponse>({
    queryKey: queryKeys.tests.answers(params),
    queryFn: ({ signal }) => academyApi.getStudentAnswers(params, { signal }),
    ...options
  });
}

export function useCreateStudentAnswerMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof academyApi.createStudentAnswer>[0]) =>
      academyApi.createStudentAnswer(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.tests.all });
    },
  });
}

export function useUpdateStudentAnswerMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof academyApi.updateStudentAnswer>[0]) =>
      academyApi.updateStudentAnswer(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.tests.all });
    },
  });
}

export function useDeleteStudentAnswerMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (studentAnswerId: string) => academyApi.deleteStudentAnswer(studentAnswerId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.tests.all });
    },
  });
}


export function useLearningHubVideosQuery(params: PaginationParams = {}) {
  return useQuery({
    queryKey: queryKeys.learningHub.adminList(params),
    queryFn: ({ signal }) => academyApi.getLearningHubVideos(params, { signal }),
  });
}

export function usePublicLearningHubVideosQuery(params: PaginationParams = {}) {
  return useQuery({
    queryKey: queryKeys.learningHub.publicList(params),
    queryFn: ({ signal }) => academyApi.getPublicLearningHubVideos(params, { signal }),
  });
}

export function useCreateLearningHubVideoMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof academyApi.createLearningHubVideo>[0]) =>
      academyApi.createLearningHubVideo(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.learningHub.all });
    },
  });
}

export function useUpdateLearningHubVideoMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof academyApi.updateLearningHubVideo>[0]) =>
      academyApi.updateLearningHubVideo(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.learningHub.all });
    },
  });
}

export function useDeleteLearningHubVideoMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (videoId: string) => academyApi.deleteLearningHubVideo(videoId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.learningHub.all });
    },
  });
}
export function useMediaAssetsQuery(params: PaginationParams & { media_type?: any } = {}) {
  return useQuery({
    queryKey: queryKeys.mediaLibrary.list(params),
    queryFn: ({ signal }) => academyApi.getMediaAssets(params, { signal }),
  });
}

export function useCreateMediaAssetMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof academyApi.createMediaAsset>[0]) =>
      academyApi.createMediaAsset(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.mediaLibrary.all });
    },
  });
}

export function useUpdateMediaAssetMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof academyApi.updateMediaAsset>[0]) =>
      academyApi.updateMediaAsset(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.mediaLibrary.all });
    },
  });
}

export function useDeleteMediaAssetMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (assetId: string) => academyApi.deleteMediaAsset(assetId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.mediaLibrary.all });
    },
  });
}

export function useSyncMediaAssetsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => academyApi.syncMediaAssets(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.mediaLibrary.all });
    },
  });
}

export function usePublicAnnouncementsQuery(params: PaginationParams = {}) {
  return useQuery({
    queryKey: ["announcements", "public", params],
    queryFn: ({ signal }) => academyApi.getPublicAnnouncements(params, { signal }),
  });
}

export function useAnnouncementsQuery(params: PaginationParams = {}) {
  return useQuery({
    queryKey: queryKeys.announcements.adminList(params),
    queryFn: ({ signal }) => academyApi.getAnnouncements(params, { signal }),
  });
}

export function useCreateAnnouncementMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof academyApi.createAnnouncement>[0]) =>
      academyApi.createAnnouncement(payload),
    onSuccess: async () => {
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
    mutationFn: (payload: Parameters<typeof academyApi.updateAnnouncement>[0]) =>
      academyApi.updateAnnouncement(payload),
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
    mutationFn: (announcementId: string) => academyApi.deleteAnnouncement(announcementId),
    onSuccess: async () => {
      await invalidateMany(queryClient, [
        queryKeys.announcements.all,
        queryKeys.mediaLibrary.all,
      ]);
    },
  });
}

export function useSiteSettingsQuery() {
  return useQuery({
    queryKey: queryKeys.settings.detail(),
    queryFn: ({ signal }) => academyApi.getSiteSettings({ signal }),
  });
}

export function useUpdateSiteSettingsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof academyApi.updateSiteSettings>[0]) =>
      academyApi.updateSiteSettings(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.settings.all });
    },
  });
}
export function usePublicBlogsQuery(params: PaginationParams = {}) {
  return useQuery({
    queryKey: ["blogs", "public", params],
    queryFn: ({ signal }) => academyApi.getPublicPosts(params, { signal }),
  });
}

export function usePublicBlogQuery(postId: string) {
  return useQuery({
    queryKey: ["blogs", "public", postId],
    queryFn: ({ signal }) => academyApi.getPublicPost(postId, { signal }),
    enabled: !!postId,
  });
}

export function useTestimonialsQuery(params: PaginationParams = {}) {
  return useQuery({
    queryKey: ["testimonials", params],
    queryFn: ({ signal }) => academyApi.getTestimonials(params, { signal }),
  });
}

export function useCreateTestimonialMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: TestimonialCreateRequest & { file?: File | null }) =>
      academyApi.createTestimonial(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
    },
  });
}

export function useUpdateTestimonialMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: TestimonialUpdateRequest & { file?: File | null }) =>
      academyApi.updateTestimonial(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
    },
  });
}

export function useDeleteTestimonialMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (testimonialId: string) =>
      academyApi.deleteTestimonial(testimonialId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
    },
  });
}

export function useEnquiriesQuery(params: PaginationParams = {}) {
  return useQuery({
    queryKey: queryKeys.enquiries.list(params),
    queryFn: ({ signal }) => academyApi.getEnquiries(params, { signal }),
  });
}

export function useCreateEnquiryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof academyApi.createEnquiry>[0]) =>
      academyApi.createEnquiry(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.enquiries.all });
    },
  });
}

export function useUpdateEnquiryStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ enquiryId, payload }: { enquiryId: string; payload: EnquiryUpdateStatusRequest }) =>
      academyApi.updateEnquiryStatus(enquiryId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.enquiries.all });
    },
  });
}

export function useDeleteEnquiryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (enquiryId: string) => academyApi.deleteEnquiry(enquiryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.enquiries.all });
    },
  });
}

export function useCreateOrderMutation() {
  return useMutation({
    mutationFn: (payload: Parameters<typeof academyApi.createOrder>[0]) =>
      academyApi.createOrder(payload),
  });
}

export function useVerifyPaymentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof academyApi.verifyPayment>[0]) =>
      academyApi.verifyPayment(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
      await queryClient.invalidateQueries({ queryKey: queryKeys.courses.all });
    },
  });
}

export function usePaymentsQuery() {
  return useQuery({
    queryKey: ["payments", "all"],
    queryFn: ({ signal }) => academyApi.getPayments({ signal }),
  });
}
