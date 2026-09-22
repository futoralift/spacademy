import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as authApi from "./auth";
import { invalidateMany } from "./hookUtils";
import { queryKeys } from "./queryKeys";
import {useNavigate} from "react-router-dom";

const defaultAuthUser = {
  id: "mock-admin-id",
  firstName: "Admin",
  lastName: "User",
  email: "admin@sfacademy.com",
  avatar: "/images/logo.png",
  role: "admin" as const,
  phone: "+91 98818 07560",
  isActive: true,
  isVerified: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export function useCurrentUserQuery() {
  return useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: async ({ signal }) => {
      try {
        return await authApi.getCurrentUser({ signal });
      } catch {
        return defaultAuthUser;
      }
    },
    initialData: defaultAuthUser,
  });
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Parameters<typeof authApi.updateCurrentUser>[0]) =>
      authApi.updateCurrentUser(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
    },
  });
}

export function useUserEmailQuery() {
  return useQuery({
    queryKey: queryKeys.user.email(),
    queryFn: async ({ signal }) => {
      try {
        return await authApi.getUserEmail({ signal });
      } catch {
        return { email: "admin@sfacademy.com" };
      }
    },
  });
}

export function useUserAuthProviderQuery() {
  return useQuery({
    queryKey: queryKeys.user.authProvider(),
    queryFn: async ({ signal }) => {
      try {
        return await authApi.getUserAuthProvider({ signal });
      } catch {
        return { provider: "local" };
      }
    },
  });
}

export function useLoginMutation() {
  const queryClient = useQueryClient();
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (payload: Parameters<typeof authApi.login>[0]) => authApi.login(payload),
    onSuccess: async (data) => {
      localStorage.setItem("access_token", data.access_token)
      navigate("/dashboard")
      await invalidateMany(queryClient, [queryKeys.auth.all, queryKeys.user.all]);
    },
    onError: (error) => {
      console.error("Registration failed", error)
    },
  });
}

export function useRefreshTokenMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.refreshToken(),
    onSuccess: async () => {
      await invalidateMany(queryClient, [queryKeys.auth.all, queryKeys.user.all]);
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: async () => {
      await invalidateMany(queryClient, [queryKeys.auth.all, queryKeys.user.all]);
      localStorage.removeItem("access_token");
      queryClient.removeQueries({queryKey: ["me"]});
      navigate("/login", { replace: true });
    },
  });
}

export function useRegisterMutation() {
  return useMutation({
    mutationFn: (payload: Parameters<typeof authApi.register>[0]) => authApi.register(payload),
  });
}

export function useRequestLoginOtpMutation() {
  return useMutation({
    mutationFn: (email: string) => authApi.requestLoginOtp(email),
  });
}

export function useVerifyLoginOtpMutation() {
  return useMutation({
    mutationFn: (payload: Parameters<typeof authApi.verifyLoginOtp>[0]) =>
      authApi.verifyLoginOtp(payload),
  });
}

export function useTokenLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.tokenLogin(),
    onSuccess: async () => {
      await invalidateMany(queryClient, [queryKeys.auth.all, queryKeys.user.all]);
    },
  });
}

export function useUpdateUserRoleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Parameters<typeof authApi.updateUserRole>[0]) =>
      authApi.updateUserRole(payload),
    onSuccess: async () => {
      await invalidateMany(queryClient, [
        queryKeys.auth.all,
        queryKeys.teachers.all,
        queryKeys.students.all,
      ]);
    },
  });
}

export function useRequestPasswordRecoveryOtpMutation() {
  return useMutation({
    mutationFn: (email: string) => authApi.requestPasswordRecoveryOtp(email),
  });
}

export function useVerifyPasswordRecoveryOtpMutation() {
  return useMutation({
    mutationFn: (payload: Parameters<typeof authApi.verifyPasswordRecoveryOtp>[0]) =>
      authApi.verifyPasswordRecoveryOtp(payload),
  });
}

export function useRecoverPasswordMutation() {
  return useMutation({
    mutationFn: (payload: Parameters<typeof authApi.recoverPassword>[0]) =>
      authApi.recoverPassword(payload),
  });
}

export function useVerifyPasswordForChangeMutation() {
  return useMutation({
    mutationFn: (password: string) => authApi.verifyPasswordForChange(password),
  });
}

export function useChangePasswordMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Parameters<typeof authApi.changePassword>[0]) =>
      authApi.changePassword(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.user.authProvider() });
    },
  });
}

export function useVerifyPasswordForDeleteAccountMutation() {
  return useMutation({
    mutationFn: (password: string) => authApi.verifyPasswordForDeleteAccount(password),
  });
}

export function useDeleteAccountMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (otp: string) => authApi.deleteAccount(otp),
    onSuccess: async () => {
      await invalidateMany(queryClient, [queryKeys.auth.all, queryKeys.user.all]);
    },
  });
}

export function useGoogleFinalizeMutation() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: { email: string; phone: string; avatar: string }) =>
      authApi.googleFinalize(payload),
    onSuccess: async (data) => {
      localStorage.setItem("access_token", data.access_token);
      await invalidateMany(queryClient, [queryKeys.auth.all, queryKeys.user.all]);
      navigate("/dashboard");
    },
  });
}
