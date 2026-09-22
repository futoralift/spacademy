import { Navigate } from "react-router-dom";

function DashboardPage() {
  return <Navigate to="/dashboard/admin/overview" replace />;
}

export default DashboardPage;
