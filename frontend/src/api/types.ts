import { z } from "zod";

export type UUID = string;
export type ISODateTimeString = string;

export type ResponseCode =
  | "Created"
  | "Deleted"
  | "Updated"
  | "Fetched"
  | "Acknowledged";

export type UserRole = "student" | "teacher" | "admin";
export type AuthServiceProvider = "google" | "app" | "admin" | "teacher";
export type AttendanceStatus = "present" | "absent" | "late" | "excused";
export type McqAnswer = "A" | "B" | "C" | "D";
export type AssignmentStatus =
  | "no_actions"
  | "pending"
  | "excused"
  | "incomplete"
  | "completed"
  | "rejected";
export type TestMode = "offline" | "online";
export type CourseMode = "offline" | "online";
export type TestType = "chapter_wise" | "full_syllabus";
export type BlogPostStatus = "draft" | "publish";
export type TestStatus = "draft" | "published";
export type LearningHubVideoType =
  | "educational_explanation"
  | "short_concept"
  | "exam_preparation_guidance";
export type AnnouncementStatus = "active" | "inactive";
export type AnnouncementType = "public" | "private";
export type MediaType =
  | "media_library"
  | "assignment"
  | "study_resource"
  | "learning_hub"
  | "announcement"
  | "blog"
  | "student"
  | "event"
  | "user"
  | "course"
  | "test"
  | "testimonial"
  | "enquiry";

export interface ResponseModel {
  code: ResponseCode;
  message: string;
  details?: Record<string, unknown> | null;
}

export interface PaginationResponse<T> {
  data: T[];
  record: number;
  totalRecord: number;
  page: number;
  totalPages: number;
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
  subject_id?: string;
}

export interface UserRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

export interface UserResponse {
  id: UUID;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar: string;
  role: UserRole;
  authServiceProvider: AuthServiceProvider;
}

export interface UserProfileUpdateRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar?: string;
}

export interface UserModifyRequest {
  id: UUID;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar: string;
  role: UserRole;
}

export type PaginationUserResponse = PaginationResponse<UserResponse>;

export interface TeacherResponse extends UserResponse {
  createdAt: ISODateTimeString;
  lastLoginAt: ISODateTimeString | null;
  deletedAt: ISODateTimeString | null;
  courses: CourseResponse[];
  subjects: SubjectResponse[];
}

export type PaginationTeacherResponse = PaginationResponse<TeacherResponse>;

export interface StudentMini {
  id: UUID;
  firstName: string;
  lastName: string;
  rollNo: string;
  courseName: string;
  avatar: string;
}

export interface LectureMini {
  id: UUID;
  lectureTitle?: string;
  subjectName: string;
  courseName: string;
  startDate: ISODateTimeString;
  endDate: ISODateTimeString;
}

export interface TeacherDashboardResponse {
  students: StudentMini[];
  lectures: LectureMini[];
}

const authServiceProviderSchema = z.enum(["google", "app", "admin", "teacher"]);
const isoDateTimeSchema = z.string().datetime();
const courseResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  standards: z.array(z.string()),
  image: z.string(),
  highlights: z.array(z.string()),
  isActive: z.boolean(),
  isPaid: z.boolean(),
  mode: z.enum(["offline", "online"]),
  amount: z.number().nullable(),
  currency: z.string(),
});

export const studentResponseSchema = z.object({
  id: z.string(),
  courses: z.array(courseResponseSchema),
  firstName: z.string(),
  lastName: z.string(),
  email: z.email(),
  authServiceProvider: authServiceProviderSchema,
  studentNumber: z.string(),
  parentNumber: z.string().nullable(),
  parentName: z.string().nullable(),
  board: z.string().nullable(),
  schoolName: z.string().nullable(),
  avatar: z.string(),
  createdAt: isoDateTimeSchema,
  lastLoginAt: isoDateTimeSchema.nullable(),
  deletedAt: isoDateTimeSchema.nullable(),
  rollNo: z.string().nullable(),
  standard: z.string().nullable(),
});

export type StudentResponse = z.infer<typeof studentResponseSchema>;

export const paginationStudentResponseSchema = z.object({
  data: z.array(studentResponseSchema),
  record: z.number(),
  totalRecord: z.number(),
  page: z.number(),
  totalPages: z.number(),
});

export type PaginationStudentResponse = z.infer<typeof paginationStudentResponseSchema>;

export interface SignUpRequest {
  firstName: string;
  lastName: string;
  email: string;
  password?: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface LoginOtpRequest {
  email: string;
  otp: string;
  avatar: string;
}

export interface LoginOtpResponse {
  loginToken: string;
  tokenType: string;
}

export interface AuthUser {
  id: UUID;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar: string;
  role: UserRole;
}

export interface UserRoleUpdateRequest {
  email: string;
  role: UserRole;
}

export interface PasswordRecoveryOtpVerifyRequest {
  email: string;
  otp: string;
}

export interface PasswordRecoveryRequest {
  newPassword: string;
  recoveryToken: string;
}

export interface PasswordRecoveryTokenResponse {
  recoveryToken: string;
}

export interface PasswordChangeRequest {
  newPassword: string;
  otp: string;
}

export interface UserEmailResponse {
  email: string;
}

export interface UserAuthProviderResponse {
  authProvider: AuthServiceProvider;
  isPasswordSet: boolean;
}

export interface SubjectRequest {
  name: string;
  teacherId: UUID | null;
  courseId: UUID;
}

export interface SubjectResponse {
  id: UUID;
  name: string;
  teacherId: UUID | null;
  courseId: UUID;
}

export interface CourseRequest {
  name: string;
  description: string;
  standards: string[];
  image: string;
  highlights: string[];
  isActive: boolean;
  isPaid: boolean;
  mode: CourseMode;
  amount: number;
  currency: string;
}

export interface CourseResponse extends CourseRequest {
  id: UUID;
}

export interface CourseUploadRequest extends Omit<CourseRequest, "image"> {
  image: File;
}

export interface CourseUpdateUploadRequest extends Omit<CourseResponse, "image"> {
  image?: File | null;
}

export interface LectureRequest {
  lectureTitle?: string;
  startDate: ISODateTimeString;
  endDate: ISODateTimeString;
  subjectId: UUID;
}

export interface BatchLectureRequest {
  lectures: LectureRequest[];
}

export interface LectureResponse extends LectureRequest {
  id: UUID;
}

export type PaginationLectureResponse = PaginationResponse<LectureResponse>;

export const studentRequestSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  avatar: z.string(),
  email: z.string(),
  phone: z.string(),
  password: z.string().optional().nullable(),
  rollNo: z.string(),
  courseIds: z.array(z.string()),
  standard: z.string(),
  board: z.string(),
  schoolName: z.string(),
  parentName: z.string(),
  parentMobileNumber: z.string(),
});

export type StudentRequest = z.infer<typeof studentRequestSchema>;

export const studentUpdateRequestSchema = studentRequestSchema.extend({
  id: z.string(),
});

export type StudentUpdateRequest = z.infer<typeof studentUpdateRequestSchema>;

export const entireStudentsInsightSchema = z.object({
  totalStudents: z.number(),
  proStudents: z.number(),
});

export type EntireStudentsInsight = z.infer<typeof entireStudentsInsightSchema>;

export const studentInsightSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  studentNumber: z.string(),
  parentNumber: z.string(),
  parentName: z.string(),
  board: z.string(),
  schoolName: z.string(),
  avatar: z.string(),
  createdAt: z.string(),
  lastLoginAt: z.string().nullable().optional(),
  deletedAt: z.string().nullable().optional(),
  authServiceProvider: authServiceProviderSchema,
  rollNo: z.string(),
  standard: z.string(),
  courses: z.array(z.tuple([z.string(), z.string()])),
  attendance: z.object({
    lectureAttendance: z.record(z.string(), z.number()),
    courseWiseAttendance: z.record(z.string(), z.any()),
  }),
});

export type StudentInsight = z.infer<typeof studentInsightSchema>;

export const studentInsightsResponseSchema = z.union([
  entireStudentsInsightSchema,
  studentInsightSchema,
]);

export type StudentInsightsResponse = z.infer<typeof studentInsightsResponseSchema>;

export interface AttendanceRequest {
  status: AttendanceStatus;
  studentId: UUID;
  lectureId: UUID;
}

export interface AttendanceResponse extends AttendanceRequest {
  id: UUID;
}

export type PaginationAttendanceResponse = PaginationResponse<AttendanceResponse>;

export interface StudentAttendanceInfo {
  studentId: UUID;
  rollNo: string;
  firstName: string;
  lastName: string;
  status: AttendanceStatus | null;
  attendanceId: UUID | null;
}

export interface StudyResourceRequest {
  title: string;
  description: string;
  lectureId?: UUID | null;
  subjectId: UUID | null;
}

export interface StudyResourceResponse extends StudyResourceRequest {
  id: UUID;
  filePath: string;
  uploadAt: ISODateTimeString;
}

export interface StudyResourceUpdateRequest extends StudyResourceRequest {
  id: UUID;
}

export interface StudyResourceUploadRequest extends StudyResourceRequest {
  file: File;
}

export interface StudyResourceUpdateUploadRequest
  extends StudyResourceUpdateRequest {
  file: File;
}

export type PaginationStudyResourceResponse =
  PaginationResponse<StudyResourceResponse>;

export interface AssignmentRequest {
  title: string;
  description?: string | null;
  lectureId?: UUID | null;
  deadline: ISODateTimeString;
  mark?: number | null;
}

export interface AssignmentResponse extends AssignmentRequest {
  id: UUID;
}

export interface AssignmentUpdateRequest extends AssignmentRequest {
  id: UUID;
}

export type PaginationAssignmentResponse = PaginationResponse<AssignmentResponse>;

export interface StudentAssignmentRequest {
  assignmentId: UUID;
  studentId: UUID;
  status: AssignmentStatus;
}

export interface StudentAssignmentResponse {
  id: UUID;
  assignmentId: UUID;
  studentId: UUID;
  status: AssignmentStatus;
  filePath: string;
  uploadAt: ISODateTimeString;
}

export interface StudentAssignmentUpdateByStudentRequest {
  id: UUID;
  assignmentId: UUID;
  studentId: UUID;
  status: AssignmentStatus;
}

export interface StudentAssignmentUpdateByTeacherRequest {
  studentAssignmentId: UUID;
  status: AssignmentStatus;
}

export interface StudentAssignmentUploadRequest {
  assignmentId: UUID;
  file: File;
}

export interface StudentAssignmentUpdateUploadRequest {
  submissionId: UUID;
  assignmentId: UUID;
  file: File;
}

export type PaginationStudentAssignmentResponse =
  PaginationResponse<StudentAssignmentResponse>;

export type StudentAssignmentsQueryResponse =
  | PaginationStudentAssignmentResponse
  | StudentAssignmentResponse;

export interface TestRequest {
  title: string;
  durationMin: number;
  totalMarks: number;
  description: string;
  mode: TestMode;
  type: TestType;
  startTime: ISODateTimeString;
  createdAt: ISODateTimeString;
  expiresAt: ISODateTimeString;
  maxAttempts: number;
  subjectId: UUID;
  teacherId: UUID;
  status: TestStatus;
}

export interface TestResponse extends TestRequest {
  id: UUID;
}

export interface TestUpdateRequest extends Omit<TestRequest, "createdAt"> {
  id: UUID;
}

export type PaginationTestResponse = PaginationResponse<TestResponse>;

export interface QuestionRequest {
  testId: UUID;
  questionText: string;
  questionImg: string;
  correctAnswer: McqAnswer;
  correctAnswerImg: string;
  mark: number;
  optionA: string;
  optionAImg: string;
  optionB: string;
  optionBImg: string;
  optionC: string;
  optionCImg: string;
  optionD: string;
  optionDImg: string;
  explanation: string;
  explanationImg: string;
}

export interface QuestionResponse extends QuestionRequest {
  id: UUID;
}

export interface QuestionUpdateRequest extends QuestionRequest {
  id: UUID;
}

export type PaginationQuestionResponse = PaginationResponse<QuestionResponse>;

export interface QuestionUploadRequest extends Omit<QuestionRequest,
  "questionImg" | "correctAnswerImg" | "optionAImg" | "optionBImg" | "optionCImg" | "optionDImg" | "explanationImg"
> {
  questionImg?: File | null;
  correctAnswerImg?: File | null;
  optionAImg?: File | null;
  optionBImg?: File | null;
  optionCImg?: File | null;
  optionDImg?: File | null;
  explanationImg?: File | null;
}

export interface QuestionUpdateUploadRequest extends Omit<QuestionUpdateRequest,
  "questionImg" | "correctAnswerImg" | "optionAImg" | "optionBImg" | "optionCImg" | "optionDImg" | "explanationImg"
> {
  questionImg?: File | null;
  correctAnswerImg?: File | null;
  optionAImg?: File | null;
  optionBImg?: File | null;
  optionCImg?: File | null;
  optionDImg?: File | null;
  explanationImg?: File | null;
}

export interface TestAttemptRequest {
  testId: UUID;
  studentId: UUID;
  attempts: number;
  obtainedMarks?: number | null;
}

export interface TestAttemptResponse extends TestAttemptRequest {
  id: UUID;
}

export interface TestAttemptUpdateRequest extends TestAttemptRequest {
  id: UUID;
}

export type PaginationTestAttemptResponse =
  PaginationResponse<TestAttemptResponse>;

export interface StudentAnswerRequest {
  answer: McqAnswer;
  testId: UUID;
  questionId: UUID;
  userId: UUID;
}

export interface StudentAnswerResponse {
  id: UUID;
  answer: McqAnswer;
  testId: UUID;
  questionId: UUID;
  studentId: UUID;
}

export interface StudentAnswerDetailResponse extends StudentAnswerResponse {
  correctAnswer: McqAnswer;
  mark: number;
  studentName?: string | null;
  questionText?: string | null;
  questionImg?: string | null;
  optionA?: string | null;
  optionAImg?: string | null;
  optionB?: string | null;
  optionBImg?: string | null;
  optionC?: string | null;
  optionCImg?: string | null;
  optionD?: string | null;
  optionDImg?: string | null;
  explanation?: string | null;
  explanationImg?: string | null;
  correctImg?: string | null;
}

export type PaginationStudentAnswerResponse =
  PaginationResponse<StudentAnswerDetailResponse>;

export interface PostCreateRequest {
  title: string;
  content: string;
  excerpt?: string | null;
  featuredImage?: string | null;
  tagIds: UUID[];
  categoryIds: UUID[];
  metaTitle?: string | null;
  metaDescription?: string | null;
}

export interface PostCreateUploadRequest extends Omit<PostCreateRequest, 'featuredImage'> {
  featuredImage?: File | null;
}

export interface PostResponse {
  id: UUID;
  title: string;
  content: string;
  excerpt?: string | null;
  featuredImage?: string | null;
  tagIds: UUID[];
  categoryIds: UUID[];
  metaTitle?: string | null;
  metaDescription?: string | null;
  slug: string;
  status: BlogPostStatus;
  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
  publishedAt: ISODateTimeString | null;
  tags: { id: string; name: string }[];
  categories: { id: string; name: string }[];
}

export interface PostUpdateRequest extends PostCreateRequest {
  id: UUID;
  slug: string;
  status: BlogPostStatus;
}

export interface PostUpdateUploadRequest extends Omit<PostUpdateRequest, 'featuredImage'> {
  featuredImage?: File | null;
}

export type PaginationPostResponse = PaginationResponse<PostResponse>;

export interface TagCreateRequest {
  name: string;
}

export interface TagResponse {
  id: UUID;
  name: string;
  slug: string;
}

export interface CategoryCreateRequest {
  name: string;
}

export interface CategoryResponse {
  id: UUID;
  name: string;
  slug: string;
}

export interface BlogTaxonomyResponse {
  tags: TagResponse[];
  categories: CategoryResponse[];
}

export interface LearningHubVideoCreateRequest {
  title: string;
  youtubeLink: string;
  videoType: LearningHubVideoType;
  publishDate: ISODateTimeString;
  subjectId?: UUID | null;
}

export interface LearningHubVideoUpdateRequest
  extends LearningHubVideoCreateRequest {
  id: UUID;
}

export interface LearningHubVideoResponse
  extends LearningHubVideoCreateRequest {
  id: UUID;
  youtubeVideoId: string;
  thumbnail?: string | null;
  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}

export interface LearningHubVideoUploadRequest
  extends LearningHubVideoCreateRequest {
  thumbnail?: File | null;
}

export interface LearningHubVideoUpdateUploadRequest
  extends LearningHubVideoUpdateRequest {
  thumbnail?: File | null;
}

export type PaginationLearningHubVideoResponse =
  PaginationResponse<LearningHubVideoResponse>;

export interface AnnouncementCreateRequest {
  title: string;
  description?: string | null;
  startDate: ISODateTimeString;
  endDate: ISODateTimeString;
  status: AnnouncementStatus;
  type: AnnouncementType;
}

export interface AnnouncementUpdateRequest extends AnnouncementCreateRequest {
  id: UUID;
}

export interface AnnouncementResponse extends AnnouncementCreateRequest {
  id: UUID;
  bannerImage: string;
  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}

export interface AnnouncementUploadRequest extends AnnouncementCreateRequest {
  bannerImage: File;
}

export interface AnnouncementUpdateUploadRequest
  extends AnnouncementUpdateRequest {
  bannerImage?: File | null;
}

export type PaginationAnnouncementResponse =
  PaginationResponse<AnnouncementResponse>;

export interface MediaAssetCreateRequest {
  title: string;
  mediaType: MediaType;
}

export interface MediaAssetUpdateRequest extends MediaAssetCreateRequest {
  id: UUID;
}

export interface MediaAssetResponse extends MediaAssetCreateRequest {
  id: UUID;
  originalFilename: string;
  filePath: string;
  contentType?: string | null;
  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}

export interface MediaAssetUploadRequest extends MediaAssetCreateRequest {
  file: File;
}

export interface MediaAssetUpdateUploadRequest extends MediaAssetUpdateRequest {
  file?: File | null;
}

export type PaginationMediaAssetResponse = PaginationResponse<MediaAssetResponse>;

export interface TestimonialResponse {
  id: UUID;
  studentName: string;
  content: string;
  courseName?: string | null;
  avatar?: string | null;
  rating: number;
  isActive: boolean;
  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}

export interface TestimonialCreateRequest {
  studentName: string;
  content: string;
  courseName?: string | null;
  avatar?: string | null;
  rating: number;
  isActive: boolean;
}

export interface TestimonialUpdateRequest extends TestimonialCreateRequest {
  id: UUID;
}

export type PaginationTestimonialResponse = PaginationResponse<TestimonialResponse>;

export interface SiteSettingsUpdateRequest {
  academyName: string;
  tagline: string;
  contactDetails?: string | null;
  phoneNumbers: string[];
  email: string;
  address: string;
  workingHours: string;
  instagram?: string | null;
  facebook?: string | null;
  twitter?: string | null;
  youtube?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface SiteSettingsResponse extends SiteSettingsUpdateRequest {
  id: UUID;
  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}

export type EnquiryStatus = "pending" | "contacted" | "closed" | "converted";

export interface EnquiryRequest {
  fullName: string;
  email: string;
  phone: string;
  title?: string | null;
  message: string;
}

export interface EnquiryResponse extends EnquiryRequest {
  id: UUID;
  status: EnquiryStatus;
  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}

export interface EnquiryUpdateStatusRequest {
  status: EnquiryStatus;
}

export type PaginationEnquiryResponse = PaginationResponse<EnquiryResponse>;


export interface CreateOrderRequest {
  courseId: string;
}

export interface RazorpayOrderResponse {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
}

export interface VerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  courseId: string;
}

export interface PaymentResponse {
  id: string;
  status: string;
  message?: string | null;
}

export interface PaymentInfoResponse {
  id: UUID;
  studentId: UUID;
  studentName: string;
  studentEmail: string;
  studentAvatar?: string | null;
  courseName: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: ISODateTimeString;
  razorpayOrderId: string;
  razorpayPaymentId?: string | null;
  student: StudentResponse;
}
