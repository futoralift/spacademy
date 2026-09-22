import { type ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  role?: string;
}

/**
 * Clean pass-through route wrapper allowing direct access to all dashboard portals.
 */
function ProtectedRoute({ children }: ProtectedRouteProps) {
  return <>{children}</>;
}

export default ProtectedRoute;
