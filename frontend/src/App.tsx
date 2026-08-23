import { Navigate, Route, Routes } from "react-router-dom";
import WelcomePage from "./pages/Welcome.tsx";
import CoursePage from "@/pages/Courses.tsx";
import SignupPage from "@/pages/auth/Signup.tsx";
import SignupOtpPage from "@/pages/auth/SignupOtp.tsx";
import LoginPage from "@/pages/auth/Login.tsx";
import ForgotPasswordPage from "@/pages/auth/ForgotPassword.tsx";
import ForgotPasswordOtpPage from "@/pages/auth/ForgotPasswordOtp.tsx";
import ResetPasswordPage from "@/pages/auth/ResetPassword.tsx";
import OAuthCallbackPage from "@/pages/auth/OAuthCallback.tsx";
import PickAvatarPage from "@/pages/auth/PickAvatar.tsx";
import DashboardPage from "@/pages/Dashboard.tsx";
import ProtectedRoute from "@/pages/ProtectedRoute.tsx";
import AdminDashboardPage from "@/pages/admin/AdminDashboard.tsx";
import TeacherDashboardPage from "@/pages/teacher/TeacherDashboard.tsx";
import StudentDashboardPage from "@/pages/student/StudentDashboard.tsx";
import AdminSettingsPage from "@/pages/admin/AdminSettings.tsx";
import TeacherProfilePage from "@/pages/teacher/TeacherProfile.tsx";
import TeacherStudentsPage from "@/pages/teacher/students/TeacherStudents.tsx";
import TeacherLecturesPage from "@/pages/teacher/lecture/Lectures.tsx";
import TeacherAssignmentsPage from "@/pages/teacher/assignments/TeacherAssignments.tsx";
import TeacherSubjectsPage from "@/pages/teacher/subjects/TeacherSubjects.tsx";
import TeacherTestsPage from "@/pages/teacher/tests/TeacherTests.tsx";
import StudentTeachersPage from "@/pages/student/StudentTeachers.tsx";
import StudentCourseDetailPage from "@/pages/student/StudentCourseDetail.tsx";
import StudentCourseAttendancePage from "@/pages/student/StudentCourseAttendance.tsx";
import StudentCoursePerformancePage from "@/pages/student/StudentCoursePerformance.tsx";
import StudentLecturesPage from "@/pages/student/StudentLectures.tsx";
import StudentTestPage from "@/pages/student/StudentTest.tsx";
import StudentProfilePage from "@/pages/student/StudentProfile.tsx";
import StudentLearningHubPage from "@/pages/student/LearningHub.tsx";
import StudentStudyResourcesPage from "@/pages/student/StudyResources.tsx";
import TeacherLearningHubPage from "@/pages/teacher/LearningHub.tsx";
import TeacherStudyResourcesPage from "@/pages/teacher/StudyResources.tsx";
import AdminDashboardStudentPage from "@/pages/admin/student/Students.tsx";
import AdminDashboardTeacherPage from "@/pages/admin/teacher/Teachers.tsx";
import AdminDashboardCoursePage from "@/pages/admin/course/Courses.tsx";
import AdminDashboardBlogPage from "@/pages/admin/blog/Blogs.tsx";
import AddBlogPage from "@/pages/admin/blog/AddBlogPage.tsx";
import EditBlogPage from "@/pages/admin/blog/EditBlogPage.tsx";
import AdminLearningHubPage from "@/pages/admin/learning-hub/LearningHub.tsx";
import AdminStudyResourcesPage from "@/pages/admin/study-resources/StudyResources.tsx";
import AdminMediaLibraryPage from "@/pages/admin/media-library/MediaLibrary.tsx";
import AdminAnnouncementsPage from "@/pages/admin/announcements/Announcements.tsx";
import AdminTestimonialsPage from "@/pages/admin/testimonials/Testimonials.tsx";
import AdminLecturesPage from "@/pages/admin/lecture/Lectures.tsx";
import AdminEnquiriesPage from "@/pages/admin/enquiries/Enquiries.tsx";
import AdminProfilePage from "./pages/admin/AdminProfile.tsx";
import AdminAssignmentsPage from "./pages/admin/assignments/AdminAssignments.tsx";
import AdminTestsPage from "./pages/admin/tests/AdminTests.tsx";
import BlogsPage from "./pages/Blogs.tsx";
import BlogDetailPage from "./pages/BlogDetail.tsx";
import AboutPage from "./pages/About.tsx";
import ContactPage from "./pages/Contact.tsx";
import CourseDetailPage from "./pages/CourseDetail.tsx";
import SubscriptionPage from "./pages/Subscription.tsx";
import NotFoundPage from "@/pages/NotFound.tsx";

function App() {

  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route path="/course" element={<CoursePage />} />
      <Route path="/course/:id" element={<CourseDetailPage />} />
      <Route path="/blog" element={<BlogsPage />} />
      <Route path="/blog/:id" element={<BlogDetailPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/subscription" element={<SubscriptionPage />} />
      <Route path="/subscriptions" element={<SubscriptionPage />} />
      <Route path="/pricing" element={<SubscriptionPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/signup/otp" element={<SignupOtpPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/forgot-password/otp" element={<ForgotPasswordOtpPage />} />
      <Route path="/forgot-password/reset" element={<ResetPasswordPage />} />
      <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
      <Route path="/pick_avatar" element={<PickAvatarPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/dashboard/admin">
        <Route index element={<Navigate to="overview" replace />} />
        <Route
          path="overview"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="announcements"
          element={
            <ProtectedRoute role="admin">
              <AdminAnnouncementsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="students"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboardStudentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="teachers"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboardTeacherPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="courses"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboardCoursePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="lectures"
          element={
            <ProtectedRoute role="admin">
              <AdminLecturesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="assignments"
          element={
            <ProtectedRoute role="admin">
              <AdminAssignmentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="tests"
          element={
            <ProtectedRoute role="admin">
              <AdminTestsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="testimonials"
          element={
            <ProtectedRoute role="admin">
              <AdminTestimonialsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="enquiries"
          element={
            <ProtectedRoute role="admin">
              <AdminEnquiriesPage />
            </ProtectedRoute>
          }
        />
        <Route path="blogs">
          <Route
            index
            element={
              <ProtectedRoute role="admin">
                <AdminDashboardBlogPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="new"
            element={
              <ProtectedRoute role="admin">
                <AddBlogPage />
              </ProtectedRoute>
            }
          />
          <Route
            path=":id"
            element={
              <ProtectedRoute role="admin">
                <EditBlogPage />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route
          path="learning-hub"
          element={
            <ProtectedRoute role="admin">
              <AdminLearningHubPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="study-resources"
          element={
            <ProtectedRoute role="admin">
              <AdminStudyResourcesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="media-library"
          element={
            <ProtectedRoute role="admin">
              <AdminMediaLibraryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="settings"
          element={
            <ProtectedRoute role="admin">
              <AdminSettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute role="admin">
              <AdminProfilePage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="/dashboard/teacher">
        <Route index element={<Navigate to="overview" replace />} />
        <Route
          path="overview"
          element={
            <ProtectedRoute role="teacher">
              <TeacherDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="students"
          element={
            <ProtectedRoute role="teacher">
              <TeacherStudentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="lectures"
          element={
            <ProtectedRoute role="teacher">
              <TeacherLecturesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="assignments"
          element={
            <ProtectedRoute role="teacher">
              <TeacherAssignmentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="subjects"
          element={
            <ProtectedRoute role="teacher">
              <TeacherSubjectsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="tests"
          element={
            <ProtectedRoute role="teacher">
              <TeacherTestsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute role="teacher">
              <TeacherProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="learning-hub"
          element={
            <ProtectedRoute role="teacher">
              <TeacherLearningHubPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="study-resources"
          element={
            <ProtectedRoute role="teacher">
              <TeacherStudyResourcesPage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="/dashboard/student">
        <Route index element={<Navigate to="overview" replace />} />
        <Route
          path="overview"
          element={
            <ProtectedRoute role="student">
              <StudentDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="teachers"
          element={
            <ProtectedRoute role="student">
              <StudentTeachersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="lectures"
          element={
            <ProtectedRoute role="student">
              <StudentLecturesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="courses/:id"
          element={
            <ProtectedRoute role="student">
              <StudentCourseDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="courses/:id/performance"
          element={
            <ProtectedRoute role="student">
              <StudentCoursePerformancePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="courses/:id/attendance"
          element={
            <ProtectedRoute role="student">
              <StudentCourseAttendancePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute role="student">
              <StudentProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="tests/:testId"
          element={
            <ProtectedRoute role="student">
              <StudentTestPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="learning-hub"
          element={
            <ProtectedRoute role="student">
              <StudentLearningHubPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="study-resources"
          element={
            <ProtectedRoute role="student">
              <StudentStudyResourcesPage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
