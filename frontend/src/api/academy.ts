import { apiRequest, createFormData } from "./http";

import type {
  AssignmentRequest,
  AssignmentResponse,
  AssignmentUpdateRequest,
  AttendanceRequest,
  AttendanceResponse,
  CourseUploadRequest,
  CourseUpdateUploadRequest,
  CourseResponse,
  LectureRequest,
  LectureResponse,
  BatchLectureRequest,
  PaginationAssignmentResponse,
  PaginationAttendanceResponse,
  PaginationLectureResponse,
  PaginationParams,
  PaginationQuestionResponse,
  PaginationStudentAnswerResponse,
  PaginationStudyResourceResponse,
  PaginationTestAttemptResponse,
  PaginationTestResponse,
  QuestionResponse,
  QuestionUploadRequest,
  QuestionUpdateUploadRequest,
  StudentAnswerRequest,
  StudentAnswerResponse,
  StudentAssignmentsQueryResponse,
  StudentAssignmentResponse,
  StudentAssignmentUpdateByTeacherRequest,
  StudentAssignmentUpdateUploadRequest,
  StudentAssignmentUploadRequest,
  StudentAttendanceInfo,
  StudyResourceResponse,
  StudyResourceUpdateUploadRequest,
  StudyResourceUploadRequest,
  SubjectRequest,
  SubjectResponse,
  TestAttemptRequest,
  TestAttemptResponse,
  TestAttemptUpdateRequest,
  TestRequest,
  TestResponse,
  TestUpdateRequest,
  LearningHubVideoResponse,
  PaginationLearningHubVideoResponse,
  LearningHubVideoUploadRequest,
  LearningHubVideoUpdateUploadRequest,
  MediaAssetResponse,
  MediaAssetUploadRequest,
  MediaAssetUpdateUploadRequest,
  PaginationMediaAssetResponse,
  MediaType,
  AnnouncementResponse,
  AnnouncementUploadRequest,
  AnnouncementUpdateUploadRequest,
  PaginationAnnouncementResponse,
  SiteSettingsResponse,
  SiteSettingsUpdateRequest,
  PostResponse,
  PaginationPostResponse,
  TestimonialResponse,
  TestimonialCreateRequest,
  TestimonialUpdateRequest,
  PaginationTestimonialResponse,
  EnquiryRequest,
  EnquiryResponse,
  EnquiryUpdateStatusRequest,
  PaginationEnquiryResponse,
  CreateOrderRequest,
  RazorpayOrderResponse,
  VerifyPaymentRequest,
  PaymentResponse,
  PaymentInfoResponse,
} from "./types";

interface RequestOptions {
  signal?: AbortSignal;
}

export async function getCourses(options?: RequestOptions): Promise<CourseResponse[]> {
  return apiRequest<CourseResponse[]>("/courses/", {
    signal: options?.signal,
  });
}

export async function getCourse(courseId: string, options?: RequestOptions): Promise<CourseResponse> {
  return apiRequest<CourseResponse>(`/courses/${courseId}`, {
    signal: options?.signal,
  });
}

export async function createCourse(
  payload: CourseUploadRequest,
  options?: RequestOptions,
): Promise<CourseResponse> {
  return apiRequest<CourseResponse>("/courses/", {
    method: "POST",
    body: createFormData({
      name: payload.name,
      description: payload.description,
      mode: payload.mode,
      image: payload.image,
      amount: payload.amount,
      currency: payload.currency,
      standards: payload.standards,
      highlights: payload.highlights,
      is_paid: payload.isPaid,
      is_active: payload.isActive,
    }),
    signal: options?.signal,
  }, true);
}

export async function updateCourse(
  payload: CourseUpdateUploadRequest,
  options?: RequestOptions,
): Promise<CourseResponse> {
  return apiRequest<CourseResponse>("/courses/", {
    method: "PUT",
    body: createFormData({
      id: payload.id,
      name: payload.name,
      description: payload.description,
      mode: payload.mode,
      image: payload.image,
      amount: payload.amount,
      currency: payload.currency,
      standards: payload.standards,
      highlights: payload.highlights,
      is_paid: payload.isPaid,
      is_active: payload.isActive,
    }),
    signal: options?.signal,
  }, true);
}

export async function deleteCourse(
  courseId: string,
  options?: RequestOptions,
): Promise<number> {
  return apiRequest<number>("/courses/", {
    method: "DELETE",
    query: { course_id: courseId },
    signal: options?.signal,
  }, true);
}

export async function getSubjects(options?: RequestOptions): Promise<SubjectResponse[]> {
  return apiRequest<SubjectResponse[]>("/courses/subject", {
    signal: options?.signal,
  }, true);
}

export async function createSubject(
  payload: SubjectRequest,
  options?: RequestOptions,
): Promise<SubjectResponse> {
  return apiRequest<SubjectResponse>("/courses/subject", {
    method: "POST",
    body: payload,
    signal: options?.signal,
  }, true);
}

export async function updateSubject(
  payload: SubjectResponse,
  options?: RequestOptions,
): Promise<SubjectResponse> {
  return apiRequest<SubjectResponse>("/courses/subject", {
    method: "PUT",
    body: payload,
    signal: options?.signal,
  }, true);
}

export async function deleteSubject(
  subjectId: string,
  options?: RequestOptions,
): Promise<number> {
  return apiRequest<number>("/courses/subject", {
    method: "DELETE",
    query: { subject_id: subjectId },
    signal: options?.signal,
  }, true);
}

export async function getLectures(
  params: PaginationParams = {},
  options?: RequestOptions,
): Promise<PaginationLectureResponse> {
  return apiRequest<PaginationLectureResponse>("/courses/lecture", {
    query: params,
    signal: options?.signal,
  }, true);
}

export async function createLecture(
  payload: LectureRequest,
  options?: RequestOptions,
): Promise<LectureResponse> {
  return apiRequest<LectureResponse>("/courses/lecture", {
    method: "POST",
    body: payload,
    signal: options?.signal,
  }, true);
}

export async function createBatchLectures(
  payload: BatchLectureRequest,
  options?: RequestOptions,
): Promise<LectureResponse[]> {
  return apiRequest<LectureResponse[]>("/courses/lecture/batch", {
    method: "POST",
    body: payload,
    signal: options?.signal,
  }, true);
}

export async function updateLecture(
  payload: LectureResponse,
  options?: RequestOptions,
): Promise<LectureResponse> {
  return apiRequest<LectureResponse>("/courses/lecture", {
    method: "PUT",
    body: payload,
    signal: options?.signal,
  }, true);
}

export async function deleteLecture(
  lectureId: string,
  options?: RequestOptions,
): Promise<number> {
  return apiRequest<number>("/courses/lecture", {
    method: "DELETE",
    query: { lecture_id: lectureId },
    signal: options?.signal,
  }, true);
}

export async function getMyLectures(
  options?: RequestOptions,
): Promise<LectureResponse[]> {
  return apiRequest<LectureResponse[]>("/courses/lecture/me", {
    signal: options?.signal,
  }, true);
}

export async function getMySubjects(
  options?: RequestOptions,
): Promise<SubjectResponse[]> {
  return apiRequest<SubjectResponse[]>("/courses/subjects/me", {
    signal: options?.signal,
  }, true);
}

export async function getAttendance(
  params: PaginationParams = {},
  options?: RequestOptions,
): Promise<PaginationAttendanceResponse> {
  return apiRequest<PaginationAttendanceResponse>("/attendance/", {
    query: params,
    signal: options?.signal,
  }, true);
}

export async function getMyAttendanceHistory(
  options?: RequestOptions,
): Promise<AttendanceResponse[]> {
  return apiRequest<AttendanceResponse[]>("/attendance/me", {
    signal: options?.signal,
  }, true);
}

export async function createAttendance(
  payload: AttendanceRequest,
  options?: RequestOptions,
): Promise<AttendanceResponse> {
  return apiRequest<AttendanceResponse>("/attendance/", {
    method: "POST",
    body: payload,
    signal: options?.signal,
  }, true);
}

export async function updateAttendance(
  payload: AttendanceResponse,
  options?: RequestOptions,
): Promise<AttendanceResponse> {
  return apiRequest<AttendanceResponse>("/attendance/", {
    method: "PUT",
    body: payload,
    signal: options?.signal,
  }, true);
}

export async function deleteAttendance(
  attendanceId: string,
  options?: RequestOptions,
): Promise<number> {
  return apiRequest<number>("/attendance/", {
    method: "DELETE",
    query: { attendance_id: attendanceId },
    signal: options?.signal,
  }, true);
}

export async function getLectureStudentsInfo(
  lectureId: string,
  options?: RequestOptions,
): Promise<StudentAttendanceInfo[]> {
  return apiRequest<StudentAttendanceInfo[]>(`/attendance/lecture/${lectureId}/students`, {
    signal: options?.signal,
  }, true);
}

export async function getStudyResources(
  params: PaginationParams = {},
  options?: RequestOptions,
): Promise<PaginationStudyResourceResponse> {
  return apiRequest<PaginationStudyResourceResponse>("/study_resource/", {
    query: params,
    signal: options?.signal,
  }, true);
}

export async function createStudyResource(
  payload: StudyResourceUploadRequest,
  options?: RequestOptions,
): Promise<StudyResourceResponse> {
  return apiRequest<StudyResourceResponse>("/study_resource/", {
    method: "POST",
    body: createFormData({
      title: payload.title,
      description: payload.description,
      lecture_id: payload.lectureId,
      subject_id: payload.subjectId,
      file: payload.file,
    }),
    signal: options?.signal,
  }, true);
}

export async function updateStudyResource(
  payload: StudyResourceUpdateUploadRequest,
  options?: RequestOptions,
): Promise<StudyResourceResponse> {
  return apiRequest<StudyResourceResponse>("/study_resource/", {
    method: "PUT",
    body: createFormData({
      sr_id: payload.id,
      title: payload.title,
      description: payload.description,
      lecture_id: payload.lectureId,
      subject_id: payload.subjectId,
      file: payload.file,
    }),
    signal: options?.signal,
  }, true);
}

export async function deleteStudyResource(
  studyResourceId: string,
  options?: RequestOptions,
): Promise<number> {
  return apiRequest<number>("/study_resource/", {
    method: "DELETE",
    query: { study_resource_id: studyResourceId },
    signal: options?.signal,
  }, true);
}

export async function getAssignments(
  params: PaginationParams = {},
  options?: RequestOptions,
): Promise<PaginationAssignmentResponse> {
  return apiRequest<PaginationAssignmentResponse>("/assignments/", {
    query: params,
    signal: options?.signal,
  }, true);
}

export async function createAssignment(
  payload: AssignmentRequest,
  options?: RequestOptions,
): Promise<AssignmentResponse> {
  return apiRequest<AssignmentResponse>("/assignments/", {
    method: "POST",
    body: payload,
    signal: options?.signal,
  }, true);
}

export async function updateAssignment(
  payload: AssignmentUpdateRequest,
  options?: RequestOptions,
): Promise<AssignmentResponse> {
  return apiRequest<AssignmentResponse>("/assignments/", {
    method: "PUT",
    body: payload,
    signal: options?.signal,
  }, true);
}

export async function deleteAssignment(
  assignmentId: string,
  options?: RequestOptions,
): Promise<number> {
  return apiRequest<number>("/assignments/", {
    method: "DELETE",
    query: { assignment_id: assignmentId },
    signal: options?.signal,
  }, true);
}

export async function getAssignmentSubmissions(
  params: PaginationParams & { studentId?: string; assignmentId?: string } = {},
  options?: RequestOptions,
): Promise<StudentAssignmentsQueryResponse> {
  return apiRequest<StudentAssignmentsQueryResponse>("/assignments/submissions", {
    query: {
      limit: params.limit,
      offset: params.offset,
      student_id: params.studentId,
      assignment_id: params.assignmentId,
    },
    signal: options?.signal,
  }, true);
}

export async function createAssignmentSubmission(
  payload: StudentAssignmentUploadRequest,
  options?: RequestOptions,
): Promise<StudentAssignmentResponse> {
  return apiRequest<StudentAssignmentResponse>("/assignments/submissions", {
    method: "POST",
    body: createFormData({
      assignment_id: payload.assignmentId,
      file: payload.file,
    }),
    signal: options?.signal,
  }, true);
}

export async function updateAssignmentSubmission(
  payload: StudentAssignmentUpdateUploadRequest,
  options?: RequestOptions,
): Promise<StudentAssignmentResponse> {
  return apiRequest<StudentAssignmentResponse>("/assignments/submissions", {
    method: "PUT",
    body: createFormData({
      submission_id: payload.submissionId,
      assignment_id: payload.assignmentId,
      file: payload.file,
    }),
    signal: options?.signal,
  }, true);
}

export async function updateAssignmentSubmissionStatus(
  payload: StudentAssignmentUpdateByTeacherRequest,
  options?: RequestOptions,
): Promise<StudentAssignmentResponse> {
  return apiRequest<StudentAssignmentResponse>("/assignments/submissions/status", {
    method: "PUT",
    body: payload,
    signal: options?.signal,
  }, true);
}

export async function deleteAssignmentSubmission(
  submissionId: string,
  options?: RequestOptions,
): Promise<number> {
  return apiRequest<number>("/assignments/submissions", {
    method: "DELETE",
    query: { submission_id: submissionId },
    signal: options?.signal,
  }, true);
}

export async function getTests(
  params: PaginationParams = {},
  options?: RequestOptions,
): Promise<PaginationTestResponse> {
  return apiRequest<PaginationTestResponse>("/tests/", {
    query: params,
    signal: options?.signal,
  }, true);
}

export async function createTest(
  payload: TestRequest,
  options?: RequestOptions,
): Promise<TestResponse> {
  return apiRequest<TestResponse>("/tests/", {
    method: "POST",
    body: payload,
    signal: options?.signal,
  }, true);
}

export async function updateTest(
  payload: TestUpdateRequest,
  options?: RequestOptions,
): Promise<TestResponse> {
  return apiRequest<TestResponse>("/tests/", {
    method: "PUT",
    body: payload,
    signal: options?.signal,
  }, true);
}

export async function deleteTest(
  testId: string,
  options?: RequestOptions,
): Promise<number> {
  return apiRequest<number>("/tests/", {
    method: "DELETE",
    query: { test_id: testId },
    signal: options?.signal,
  }, true);
}

export async function getQuestions(
  params: PaginationParams & { testId?: string } = {},
  options?: RequestOptions,
): Promise<PaginationQuestionResponse> {
  return apiRequest<PaginationQuestionResponse>("/tests/questions", {
    query: {
      ...params,
      test_id: params.testId,
    },
    signal: options?.signal,
  }, true);
}

export async function createQuestion(
  payload: QuestionUploadRequest,
  options?: RequestOptions,
): Promise<QuestionResponse> {
  return apiRequest<QuestionResponse>("/tests/questions", {
    method: "POST",
    body: createFormData({
      test_id: payload.testId,
      question_text: payload.questionText,
      correct_answer: payload.correctAnswer,
      mark: payload.mark,
      option_a: payload.optionA,
      option_b: payload.optionB,
      option_c: payload.optionC,
      option_d: payload.optionD,
      explanation: payload.explanation,
      question_img: payload.questionImg,
      correct_answer_img: payload.correctAnswerImg,
      option_a_img: payload.optionAImg,
      option_b_img: payload.optionBImg,
      option_c_img: payload.optionCImg,
      option_d_img: payload.optionDImg,
      explanation_img: payload.explanationImg,
    }),
    signal: options?.signal,
  }, true);
}

export async function updateQuestion(
  payload: QuestionUpdateUploadRequest,
  options?: RequestOptions,
): Promise<QuestionResponse> {
  return apiRequest<QuestionResponse>("/tests/questions", {
    method: "PUT",
    body: createFormData({
      id: payload.id,
      test_id: payload.testId,
      question_text: payload.questionText,
      correct_answer: payload.correctAnswer,
      mark: payload.mark,
      option_a: payload.optionA,
      option_b: payload.optionB,
      option_c: payload.optionC,
      option_d: payload.optionD,
      explanation: payload.explanation,
      question_img: payload.questionImg,
      correct_answer_img: payload.correctAnswerImg,
      option_a_img: payload.optionAImg,
      option_b_img: payload.optionBImg,
      option_c_img: payload.optionCImg,
      option_d_img: payload.optionDImg,
      explanation_img: payload.explanationImg,
    }),
    signal: options?.signal,
  }, true);
}

export async function deleteQuestion(
  questionId: string,
  options?: RequestOptions,
): Promise<number> {
  return apiRequest<number>("/tests/questions", {
    method: "DELETE",
    query: { question_id: questionId },
    signal: options?.signal,
  }, true);
}

export async function getTestAttempts(
  params: PaginationParams = {},
  options?: RequestOptions,
): Promise<PaginationTestAttemptResponse> {
  return apiRequest<PaginationTestAttemptResponse>("/tests/attempts", {
    query: params,
    signal: options?.signal,
  }, true);
}

export async function createTestAttempt(
  payload: TestAttemptRequest,
  options?: RequestOptions,
): Promise<TestAttemptResponse> {
  return apiRequest<TestAttemptResponse>("/tests/attempts", {
    method: "POST",
    body: payload,
    signal: options?.signal,
  }, true);
}

export async function updateTestAttempt(
  payload: TestAttemptUpdateRequest,
  options?: RequestOptions,
): Promise<TestAttemptResponse> {
  return apiRequest<TestAttemptResponse>("/tests/attempts", {
    method: "PUT",
    body: payload,
    signal: options?.signal,
  }, true);
}

export async function deleteTestAttempt(
  attemptId: string,
  options?: RequestOptions,
): Promise<number> {
  return apiRequest<number>("/tests/attempts", {
    method: "DELETE",
    query: { attempt_id: attemptId },
    signal: options?.signal,
  }, true);
}

export async function getStudentAnswers(
  params: PaginationParams & { studentId?: string; testId?: string } = {},
  options?: RequestOptions,
): Promise<PaginationStudentAnswerResponse> {
  return apiRequest<PaginationStudentAnswerResponse>("/tests/answers", {
    query: {
      limit: params.limit,
      offset: params.offset,
      student_id: params.studentId,
      test_id: params.testId,
    },
    signal: options?.signal,
  }, true);
}

export async function createStudentAnswer(
  payload: StudentAnswerRequest,
  options?: RequestOptions,
): Promise<StudentAnswerResponse> {
  return apiRequest<StudentAnswerResponse>("/tests/answers", {
    method: "POST",
    body: payload,
    signal: options?.signal,
  }, true);
}

export async function updateStudentAnswer(
  payload: StudentAnswerResponse,
  options?: RequestOptions,
): Promise<StudentAnswerResponse> {
  return apiRequest<StudentAnswerResponse>("/tests/answers", {
    method: "PUT",
    body: payload,
    signal: options?.signal,
  }, true);
}

export async function deleteStudentAnswer(
  studentAnswerId: string,
  options?: RequestOptions,
): Promise<number> {
  return apiRequest<number>("/tests/answers", {
    method: "DELETE",
    query: { student_answer_id: studentAnswerId },
    signal: options?.signal,
  }, true);
}




export async function getLearningHubVideos(
  params: PaginationParams = {},
  options?: RequestOptions,
): Promise<PaginationLearningHubVideoResponse> {
  return apiRequest<PaginationLearningHubVideoResponse>("/learning_hub/videos/", {
    query: params,
    signal: options?.signal,
  }, true);
}

export async function getPublicLearningHubVideos(
  params: PaginationParams = {},
  options?: RequestOptions,
): Promise<PaginationLearningHubVideoResponse> {
  return apiRequest<PaginationLearningHubVideoResponse>("/learning_hub/videos/public", {
    query: params,
    signal: options?.signal,
  }, true);
}

export async function createLearningHubVideo(
  payload: LearningHubVideoUploadRequest,
  options?: RequestOptions,
): Promise<LearningHubVideoResponse> {
  return apiRequest<LearningHubVideoResponse>("/learning_hub/videos/", {
    method: "POST",
    body: createFormData({
      title: payload.title,
      youtube_link: payload.youtubeLink,
      video_type: payload.videoType,
      publish_date: payload.publishDate,
      subject_id: payload.subjectId,
      thumbnail: payload.thumbnail,
    }),
    signal: options?.signal,
  }, true);
}

export async function updateLearningHubVideo(
  payload: LearningHubVideoUpdateUploadRequest,
  options?: RequestOptions,
): Promise<LearningHubVideoResponse> {
  return apiRequest<LearningHubVideoResponse>("/learning_hub/videos/", {
    method: "PUT",
    body: createFormData({
      video_id: payload.id,
      title: payload.title,
      youtube_link: payload.youtubeLink,
      video_type: payload.videoType,
      publish_date: payload.publishDate,
      subject_id: payload.subjectId,
      thumbnail: payload.thumbnail,
    }),
    signal: options?.signal,
  }, true);
}

export async function deleteLearningHubVideo(
  videoId: string,
  options?: RequestOptions,
): Promise<number> {
  return apiRequest<number>("/learning_hub/videos/", {
    method: "DELETE",
    query: { video_id: videoId },
    signal: options?.signal,
  }, true);
}
export async function getMediaAssets(
  params: PaginationParams & { media_type?: MediaType } = {},
  options?: RequestOptions,
): Promise<PaginationMediaAssetResponse> {
  return apiRequest<PaginationMediaAssetResponse>("/media_library/", {
    query: {
      limit: params.limit,
      offset: params.offset,
      media_type: params.media_type,
    },
    signal: options?.signal,
  }, true);
}

export async function createMediaAsset(
  payload: MediaAssetUploadRequest,
  options?: RequestOptions,
): Promise<MediaAssetResponse> {
  return apiRequest<MediaAssetResponse>("/media_library/", {
    method: "POST",
    body: createFormData({
      title: payload.title,
      media_type: payload.mediaType,
      file: payload.file,
    }),
    signal: options?.signal,
  }, true);
}

export async function updateMediaAsset(
  payload: MediaAssetUpdateUploadRequest,
  options?: RequestOptions,
): Promise<MediaAssetResponse> {
  return apiRequest<MediaAssetResponse>("/media_library/", {
    method: "PUT",
    body: createFormData({
      asset_id: payload.id,
      title: payload.title,
      media_type: payload.mediaType,
      file: payload.file,
    }),
    signal: options?.signal,
  }, true);
}

export async function deleteMediaAsset(
  mediaAssetId: string,
  options?: RequestOptions,
): Promise<number> {
  return apiRequest<number>("/media_library/", {
    method: "DELETE",
    query: { asset_id: mediaAssetId },
    signal: options?.signal,
  }, true);
}

export async function getEnquiries(
  params: PaginationParams = {},
  options?: RequestOptions,
): Promise<PaginationEnquiryResponse> {
  return apiRequest<PaginationEnquiryResponse>("/enquiries/", {
    query: params,
    signal: options?.signal,
  }, true);
}

export async function createEnquiry(
  payload: EnquiryRequest,
  options?: RequestOptions,
): Promise<EnquiryResponse> {
  return apiRequest<EnquiryResponse>("/enquiries/", {
    method: "POST",
    body: payload,
    signal: options?.signal,
  });
}

export async function updateEnquiryStatus(
  enquiryId: string,
  payload: EnquiryUpdateStatusRequest,
  options?: RequestOptions,
): Promise<EnquiryResponse> {
  return apiRequest<EnquiryResponse>(`/enquiries/${enquiryId}`, {
    method: "PATCH",
    body: payload,
    signal: options?.signal,
  }, true);
}

export async function deleteEnquiry(
  enquiryId: string,
  options?: RequestOptions,
): Promise<number> {
  return apiRequest<number>(`/enquiries/${enquiryId}`, {
    method: "DELETE",
    signal: options?.signal,
  }, true);
}

export async function syncMediaAssets(
  options?: RequestOptions,
): Promise<number> {
  return apiRequest<number>("/media_library/sync", {
    method: "POST",
    signal: options?.signal,
  }, true);
}

export async function getPublicAnnouncements(
  params: PaginationParams = {},
  options?: RequestOptions,
): Promise<PaginationAnnouncementResponse> {
  return apiRequest<PaginationAnnouncementResponse>("/announcements/public", {
    query: params,
    signal: options?.signal,
  });
}

export async function getAnnouncements(
  params: PaginationParams = {},
  options?: RequestOptions,
): Promise<PaginationAnnouncementResponse> {
  return apiRequest<PaginationAnnouncementResponse>("/announcements/", {
    query: params,
    signal: options?.signal,
  }, true);
}

export async function createAnnouncement(
  payload: AnnouncementUploadRequest,
  options?: RequestOptions,
): Promise<AnnouncementResponse> {
  return apiRequest<AnnouncementResponse>("/announcements/", {
    method: "POST",
    body: createFormData({
      title: payload.title,
      description: payload.description,
      start_date: payload.startDate,
      end_date: payload.endDate,
      status: payload.status,
      type: payload.type,
      banner_image: payload.bannerImage,
    }),
    signal: options?.signal,
  }, true);
}

export async function updateAnnouncement(
  payload: AnnouncementUpdateUploadRequest,
  options?: RequestOptions,
): Promise<AnnouncementResponse> {
  return apiRequest<AnnouncementResponse>("/announcements/", {
    method: "PUT",
    body: createFormData({
      announcement_id: payload.id,
      title: payload.title,
      description: payload.description,
      start_date: payload.startDate,
      end_date: payload.endDate,
      status: payload.status,
      type: payload.type,
      banner_image: payload.bannerImage,
    }),
    signal: options?.signal,
  }, true);
}

export async function deleteAnnouncement(
  announcementId: string,
  options?: RequestOptions,
): Promise<number> {
  return apiRequest<number>("/announcements/", {
    method: "DELETE",
    query: { announcement_id: announcementId },
    signal: options?.signal,
  }, true);
}

export async function getSiteSettings(options?: RequestOptions): Promise<SiteSettingsResponse> {
  return apiRequest<SiteSettingsResponse>("/settings/", {
    signal: options?.signal,
  });
}

export async function updateSiteSettings(
  payload: SiteSettingsUpdateRequest,
  options?: RequestOptions,
): Promise<SiteSettingsResponse> {
  return apiRequest<SiteSettingsResponse>("/settings/", {
    method: "PUT",
    body: payload,
    signal: options?.signal,
  }, true);
}
export async function getPublicPosts(
  params: PaginationParams = {},
  options?: RequestOptions,
): Promise<PaginationPostResponse> {
  return apiRequest<PaginationPostResponse>("/post/public", {
    query: params,
    signal: options?.signal,
  });
}

export async function getPublicPost(
  postId: string,
  options?: RequestOptions,
): Promise<PostResponse> {
  return apiRequest<PostResponse>(`/post/public/${postId}`, {
    signal: options?.signal,
  });
}

export async function getTestimonials(
  params: PaginationParams = {},
  options?: RequestOptions,
): Promise<PaginationTestimonialResponse> {
  return apiRequest<PaginationTestimonialResponse>("/testimonials/", {
    query: params,
    signal: options?.signal,
  });
}

export async function createTestimonial(
  payload: TestimonialCreateRequest & { file?: File | null },
  options?: RequestOptions,
): Promise<TestimonialResponse> {
  const formData = new FormData();
  formData.append("student_name", payload.studentName);
  formData.append("content", payload.content);
  if (payload.courseName) formData.append("course_name", payload.courseName);
  formData.append("rating", String(payload.rating));
  formData.append("is_active", String(payload.isActive));
  if (payload.file) formData.append("file", payload.file);

  return apiRequest<TestimonialResponse>("/testimonials/", {
    method: "POST",
    body: formData,
    signal: options?.signal,
  }, true);
}

export async function updateTestimonial(
  payload: TestimonialUpdateRequest & { file?: File | null },
  options?: RequestOptions,
): Promise<TestimonialResponse> {
  const formData = new FormData();
  formData.append("id", payload.id);
  formData.append("student_name", payload.studentName);
  formData.append("content", payload.content);
  if (payload.courseName) formData.append("course_name", payload.courseName);
  formData.append("rating", String(payload.rating));
  formData.append("is_active", String(payload.isActive));
  if (payload.file) formData.append("file", payload.file);

  return apiRequest<TestimonialResponse>("/testimonials/", {
    method: "PUT",
    body: formData,
    signal: options?.signal,
  }, true);
}

export async function deleteTestimonial(
  testimonialId: string,
  options?: RequestOptions,
): Promise<number> {
  return apiRequest<number>(`/testimonials/${testimonialId}`, {
    method: "DELETE",
    signal: options?.signal,
  }, true);
}

export async function createOrder(
  payload: CreateOrderRequest,
  options?: RequestOptions,
): Promise<RazorpayOrderResponse> {
  return apiRequest<RazorpayOrderResponse>("/payment/order", {
    method: "POST",
    body: payload,
    signal: options?.signal,
  }, true);
}

export async function verifyPayment(
  payload: VerifyPaymentRequest,
  options?: RequestOptions,
): Promise<PaymentResponse> {
  return apiRequest<PaymentResponse>("/payment/verify", {
    method: "POST",
    body: payload,
    signal: options?.signal,
  }, true);
}

export async function getPayments(options?: RequestOptions): Promise<PaymentInfoResponse[]> {
  return apiRequest<PaymentInfoResponse[]>("/payment/", {
    signal: options?.signal,
  }, true);
}
