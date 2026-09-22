/**
 * mockStore.ts
 * -----------
 * In-memory store with demo seed data for all modules.
 * Used as placeholder data when the backend is not reachable.
 * Mutations (create / delete / update) update the store in-place
 * so changes are reflected immediately in the UI.
 */

import type {
  CourseResponse,
  SubjectResponse,
  LectureResponse,
  AssignmentResponse,
  TestResponse,
  StudyResourceResponse,
  LearningHubVideoResponse,
  MediaAssetResponse,
  AnnouncementResponse,
  TestimonialResponse,
  EnquiryResponse,
  PaginationResponse,
  TeacherResponse,
  StudentResponse,
} from "./types";

// ─── helpers ────────────────────────────────────────────────────────────────

export function uuid(): string {
  return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
}

export function now(): string {
  return new Date().toISOString();
}

export function paginate<T>(items: T[]): PaginationResponse<T> {
  return {
    data: items,
    record: items.length,
    totalRecord: items.length,
    page: 1,
    totalPages: 1,
  };
}

// ─── seed data ───────────────────────────────────────────────────────────────

export const mockCourses: CourseResponse[] = [
  {
    id: "c1",
    name: "Science Excellence Batch",
    description: "Comprehensive science preparation for Class 11 & 12 students.",
    standards: ["11", "12"],
    image: "https://images.unsplash.com/photo-1532094349884-543559a8f7c7?w=400&auto=format&fit=crop",
    highlights: ["Expert Faculty", "Recorded Lectures", "Weekly Tests"],
    isActive: true,
    isPaid: true,
    mode: "offline",
    amount: 12000,
    currency: "INR",
  },
  {
    id: "c2",
    name: "Mathematics Foundation",
    description: "Build a strong foundation in mathematics for competitive exams.",
    standards: ["9", "10"],
    image: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&auto=format&fit=crop",
    highlights: ["Problem Solving", "Formula Sheets", "Mock Tests"],
    isActive: true,
    isPaid: true,
    mode: "online",
    amount: 8000,
    currency: "INR",
  },
  {
    id: "c3",
    name: "English Communication",
    description: "Improve spoken and written English for school and beyond.",
    standards: ["8", "9", "10"],
    image: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=400&auto=format&fit=crop",
    highlights: ["Live Sessions", "Grammar Workshops", "Essay Practice"],
    isActive: true,
    isPaid: false,
    mode: "online",
    amount: 0,
    currency: "INR",
  },
];

export const mockSubjects: SubjectResponse[] = [
  { id: "s1", name: "Physics", teacherId: "t1", courseId: "c1" },
  { id: "s2", name: "Chemistry", teacherId: "t2", courseId: "c1" },
  { id: "s3", name: "Algebra", teacherId: "t1", courseId: "c2" },
  { id: "s4", name: "English Grammar", teacherId: "t3", courseId: "c3" },
];

export const mockLectures: LectureResponse[] = [
  {
    id: "l1",
    lectureTitle: "Newton's Laws of Motion",
    startDate: new Date(Date.now() - 86400000).toISOString(),
    endDate: new Date(Date.now() - 82800000).toISOString(),
    subjectId: "s1",
  },
  {
    id: "l2",
    lectureTitle: "Periodic Table & Trends",
    startDate: new Date(Date.now() - 172800000).toISOString(),
    endDate: new Date(Date.now() - 169200000).toISOString(),
    subjectId: "s2",
  },
  {
    id: "l3",
    lectureTitle: "Quadratic Equations",
    startDate: new Date(Date.now() + 86400000).toISOString(),
    endDate: new Date(Date.now() + 90000000).toISOString(),
    subjectId: "s3",
  },
];

export const mockTeachers: TeacherResponse[] = [
  {
    id: "t1",
    firstName: "Rajesh",
    lastName: "Kumar",
    email: "rajesh.kumar@academy.com",
    phone: "9876543210",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh",
    role: "teacher",
    authServiceProvider: "app",
    createdAt: now(),
    lastLoginAt: now(),
    deletedAt: null,
    courses: [],
    subjects: [],
  },
  {
    id: "t2",
    firstName: "Priya",
    lastName: "Sharma",
    email: "priya.sharma@academy.com",
    phone: "9876543211",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
    role: "teacher",
    authServiceProvider: "app",
    createdAt: now(),
    lastLoginAt: now(),
    deletedAt: null,
    courses: [],
    subjects: [],
  },
  {
    id: "t3",
    firstName: "Anita",
    lastName: "Verma",
    email: "anita.verma@academy.com",
    phone: "9876543212",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Anita",
    role: "teacher",
    authServiceProvider: "app",
    createdAt: now(),
    lastLoginAt: null,
    deletedAt: null,
    courses: [],
    subjects: [],
  },
];

export const mockStudents: StudentResponse[] = [
  {
    id: "st1",
    firstName: "Aarav",
    lastName: "Singh",
    email: "aarav.singh@student.com",
    authServiceProvider: "app",
    studentNumber: "9812345678",
    parentNumber: "9812345679",
    parentName: "Ramesh Singh",
    board: "CBSE",
    schoolName: "Delhi Public School",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav",
    createdAt: now(),
    lastLoginAt: now(),
    deletedAt: null,
    rollNo: "R001",
    standard: "11",
    courses: mockCourses.slice(0, 2),
  },
  {
    id: "st2",
    firstName: "Diya",
    lastName: "Patel",
    email: "diya.patel@student.com",
    authServiceProvider: "google",
    studentNumber: "9823456789",
    parentNumber: "9823456790",
    parentName: "Suresh Patel",
    board: "ICSE",
    schoolName: "St. Xavier's High School",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Diya",
    createdAt: now(),
    lastLoginAt: now(),
    deletedAt: null,
    rollNo: "R002",
    standard: "12",
    courses: [mockCourses[0]],
  },
  {
    id: "st3",
    firstName: "Karan",
    lastName: "Mehta",
    email: "karan.mehta@student.com",
    authServiceProvider: "app",
    studentNumber: "9834567890",
    parentNumber: null,
    parentName: null,
    board: "CBSE",
    schoolName: "Kendriya Vidyalaya",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Karan",
    createdAt: now(),
    lastLoginAt: null,
    deletedAt: null,
    rollNo: "R003",
    standard: "10",
    courses: [mockCourses[2]],
  },
];

export const mockAssignments: AssignmentResponse[] = [
  {
    id: "a1",
    title: "Laws of Motion — Problem Set",
    description: "Solve the given 20 problems on Newton's laws.",
    lectureId: "l1",
    deadline: new Date(Date.now() + 7 * 86400000).toISOString(),
    mark: 20,
  },
  {
    id: "a2",
    title: "Chemical Bonding Essay",
    description: "Write a 500-word essay on ionic vs. covalent bonds.",
    lectureId: "l2",
    deadline: new Date(Date.now() + 5 * 86400000).toISOString(),
    mark: 10,
  },
  {
    id: "a3",
    title: "Quadratic Equations Practice",
    description: "Complete exercises 3.1 to 3.5 from the textbook.",
    lectureId: "l3",
    deadline: new Date(Date.now() + 3 * 86400000).toISOString(),
    mark: 15,
  },
];

export const mockTests: TestResponse[] = [
  {
    id: "tst1",
    title: "Physics Unit Test 1",
    durationMin: 60,
    totalMarks: 50,
    description: "Chapters: Motion, Force, Work & Energy",
    mode: "online",
    type: "chapter_wise",
    startTime: new Date(Date.now() + 86400000).toISOString(),
    createdAt: now(),
    expiresAt: new Date(Date.now() + 2 * 86400000).toISOString(),
    maxAttempts: 2,
    subjectId: "s1",
    teacherId: "t1",
    status: "published",
  },
  {
    id: "tst2",
    title: "Chemistry Full Syllabus Mock",
    durationMin: 90,
    totalMarks: 100,
    description: "Complete Chemistry syllabus for Class 12",
    mode: "offline",
    type: "full_syllabus",
    startTime: new Date(Date.now() + 3 * 86400000).toISOString(),
    createdAt: now(),
    expiresAt: new Date(Date.now() + 4 * 86400000).toISOString(),
    maxAttempts: 1,
    subjectId: "s2",
    teacherId: "t2",
    status: "draft",
  },
];

export const mockStudyResources: StudyResourceResponse[] = [
  {
    id: "sr1",
    title: "Newton's Laws PDF Notes",
    description: "Comprehensive notes on all three laws of motion.",
    lectureId: "l1",
    subjectId: "s1",
    filePath: "/demo/newton_laws.pdf",
    uploadAt: now(),
  },
  {
    id: "sr2",
    title: "Periodic Table Cheat Sheet",
    description: "Quick reference periodic table with trends.",
    lectureId: "l2",
    subjectId: "s2",
    filePath: "/demo/periodic_table.pdf",
    uploadAt: now(),
  },
  {
    id: "sr3",
    title: "Algebra Formula Sheet",
    description: "All important algebra formulas for Class 9 & 10.",
    lectureId: null,
    subjectId: "s3",
    filePath: "/demo/algebra_formulas.pdf",
    uploadAt: now(),
  },
];

export const mockLearningHubVideos: LearningHubVideoResponse[] = [
  {
    id: "lhv1",
    title: "Understanding Newton's 3rd Law",
    youtubeLink: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    youtubeVideoId: "dQw4w9WgXcQ",
    videoType: "educational_explanation",
    publishDate: now(),
    subjectId: "s1",
    thumbnail: null,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "lhv2",
    title: "Periodic Trends Explained",
    youtubeLink: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    youtubeVideoId: "dQw4w9WgXcQ",
    videoType: "short_concept",
    publishDate: now(),
    subjectId: "s2",
    thumbnail: null,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "lhv3",
    title: "JEE Exam Preparation Tips",
    youtubeLink: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    youtubeVideoId: "dQw4w9WgXcQ",
    videoType: "exam_preparation_guidance",
    publishDate: now(),
    subjectId: null,
    thumbnail: null,
    createdAt: now(),
    updatedAt: now(),
  },
];

export const mockAnnouncements: AnnouncementResponse[] = [
  {
    id: "ann1",
    title: "Diwali Holiday Notice",
    description: "The academy will remain closed from Oct 31 to Nov 3 for Diwali holidays.",
    startDate: new Date(Date.now() + 10 * 86400000).toISOString(),
    endDate: new Date(Date.now() + 14 * 86400000).toISOString(),
    status: "active",
    type: "public",
    bannerImage: "",
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "ann2",
    title: "Parent-Teacher Meeting",
    description: "PTM scheduled for this Saturday 10 AM to 1 PM. All parents requested to attend.",
    startDate: new Date(Date.now() + 5 * 86400000).toISOString(),
    endDate: new Date(Date.now() + 6 * 86400000).toISOString(),
    status: "active",
    type: "private",
    bannerImage: "",
    createdAt: now(),
    updatedAt: now(),
  },
];

export const mockTestimonials: TestimonialResponse[] = [
  {
    id: "tes1",
    studentName: "Aarav Singh",
    content: "The faculty is excellent and the study material is top-notch. I cleared JEE Mains thanks to this academy!",
    courseName: "Science Excellence Batch",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav",
    rating: 5,
    isActive: true,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "tes2",
    studentName: "Diya Patel",
    content: "Online classes are very well-structured. The doubt-clearing sessions are a game changer.",
    courseName: "Mathematics Foundation",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Diya",
    rating: 4,
    isActive: true,
    createdAt: now(),
    updatedAt: now(),
  },
];

export const mockEnquiries: EnquiryResponse[] = [
  {
    id: "enq1",
    fullName: "Meera Nair",
    email: "meera.nair@gmail.com",
    phone: "9845678901",
    title: "Admission query for Class 11",
    message: "I would like to know more about the Science batch for Class 11 and the fee structure.",
    status: "pending",
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "enq2",
    fullName: "Vikram Joshi",
    email: "vikram.joshi@gmail.com",
    phone: "9867890123",
    title: "Online batch availability",
    message: "Is there an online batch available for Mathematics for Class 10?",
    status: "contacted",
    createdAt: now(),
    updatedAt: now(),
  },
];

export const mockMediaAssets: MediaAssetResponse[] = [
  {
    id: "ma1",
    title: "Academy Logo",
    mediaType: "media_library",
    originalFilename: "logo.png",
    filePath: "/demo/logo.png",
    contentType: "image/png",
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "ma2",
    title: "Science Batch Banner",
    mediaType: "course",
    originalFilename: "science_banner.jpg",
    filePath: "https://images.unsplash.com/photo-1532094349884-543559a8f7c7?w=400",
    contentType: "image/jpeg",
    createdAt: now(),
    updatedAt: now(),
  },
];

// ─── store object (mutable) ───────────────────────────────────────────────────

export const mockStore = {
  courses: [...mockCourses],
  subjects: [...mockSubjects],
  lectures: [...mockLectures],
  teachers: [...mockTeachers],
  students: [...mockStudents],
  assignments: [...mockAssignments],
  tests: [...mockTests],
  studyResources: [...mockStudyResources],
  learningHubVideos: [...mockLearningHubVideos],
  announcements: [...mockAnnouncements],
  testimonials: [...mockTestimonials],
  enquiries: [...mockEnquiries],
  mediaAssets: [...mockMediaAssets],
};
