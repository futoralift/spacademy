import {
  createContext,
  useContext,
  useCallback,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import type { UserRole } from "@/api/types";
import type { userModel } from "@/entities/user";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface AuthContextValue {
  /** The currently authenticated user, or null if unauthenticated. */
  user: userModel | null;
  /** True while the initial auth check is running. */
  isLoading: boolean;
  /** True if a user is currently authenticated with a real backend token. */
  isAuthenticated: boolean;
  /** Store the access token and invalidate the user query to re-fetch. */
  login: (accessToken: string) => void;
  /** Clear auth state, remove the token, and invalidate the user query. */
  logout: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  // Delegate all data-fetching to the existing useCurrentUser hook.
  // This ensures the entire app uses a single, shared auth data source.
  const { data: user, isLoading } = useCurrentUser();

  // A user is "authenticated" only when we have a real token in localStorage
  // and the backend confirmed the identity. The mock user from useCurrentUser
  // is treated as unauthenticated for route-guarding purposes.
  const hasToken = typeof localStorage !== "undefined" &&
    Boolean(localStorage.getItem("access_token"));

  const isAuthenticated = Boolean(user) && hasToken;

  const login = useCallback((accessToken: string) => {
    localStorage.setItem("access_token", accessToken);
    // Invalidate the "me" query so useCurrentUser re-fetches with the new token
    void queryClient.invalidateQueries({ queryKey: ["me"] });
  }, [queryClient]);

  const logout = useCallback(() => {
    localStorage.removeItem("access_token");
    // Reset to undefined so the mock fallback kicks in
    void queryClient.resetQueries({ queryKey: ["me"] });
    // Fire-and-forget backend logout to clear httpOnly cookie
    void fetch("/auth/logout", { credentials: "include" }).catch(() => {});
  }, [queryClient]);

  return (
    <AuthContext.Provider
      value={{
        user: isAuthenticated ? (user ?? null) : null,
        isLoading,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}

/** Returns the role-based dashboard path for the given role. */
export function getDashboardPath(role: UserRole | string): string {
  switch (role) {
    case "admin":
      return "/dashboard/admin/overview";
    case "teacher":
      return "/dashboard/teacher/overview";
    case "student":
      return "/dashboard/student/overview";
    default:
      return "/login";
  }
}
