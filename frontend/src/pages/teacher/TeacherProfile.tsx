import * as React from "react";
import TeacherSidebar from "@/pages/teacher/TeacherSidebar.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  useCurrentUserQuery,
  useUpdateProfileMutation,
  useVerifyPasswordForChangeMutation,
  useChangePasswordMutation
} from "@/api/authHooks";
import { toast } from "sonner";
import { Loader2, Save, User, Lock, ShieldCheck } from "lucide-react";
import { Field, FieldDescription, FieldGroup } from "@/components/ui/field.tsx";
import DashboardLayoutProvider from "../DashboardLayoutProvider";

export default function TeacherProfilePage() {
  const { data: user, isLoading } = useCurrentUserQuery();
  const updateProfile = useUpdateProfileMutation();
  const verifyPassword = useVerifyPasswordForChangeMutation();
  const changePassword = useChangePasswordMutation();

  const [profileData, setProfileData] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const [passwordStep, setPasswordStep] = React.useState<'verify' | 'change'>('verify');
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [passwordData, setPasswordData] = React.useState({
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  React.useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: (user as any).phone || "",
      });
    }
  }, [user]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate(profileData, {
      onSuccess: () => {
        toast.success("Profile updated successfully");
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to update profile");
      }
    });
  };

  const handleVerifyPassword = (e: React.FormEvent) => {
    e.preventDefault();
    verifyPassword.mutate(currentPassword, {
      onSuccess: () => {
        toast.success("OTP sent to your email");
        setPasswordStep('change');
      },
      onError: (error: any) => {
        toast.error(error.message || "Invalid current password");
      }
    });
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    changePassword.mutate({
      otp: passwordData.otp,
      newPassword: passwordData.newPassword,
    }, {
      onSuccess: () => {
        toast.success("Password changed successfully");
        setPasswordStep('verify');
        setCurrentPassword("");
        setPasswordData({
          otp: "",
          newPassword: "",
          confirmPassword: "",
        });
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to change password (check OTP)");
      }
    });
  };

  if (isLoading) {
    return (
      <DashboardLayoutProvider
        pageTitle="Profile"
        sidebar={<TeacherSidebar />}
        bodyTitle="Profile"
        description="Manage your personal information and security settings."
        icon={<User className="size-6" />}
      >
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayoutProvider>
    );
  }

  return (
    <DashboardLayoutProvider
      pageTitle="Profile"
      sidebar={<TeacherSidebar />}
      bodyTitle="Profile"
      description="Manage your personal information and security settings."
      icon={<User className="size-6" />}
    >
      <div className="w-full">
        <div className="grid gap-8">
          {/* Profile Information */}
          <Card>
            <CardHeader className="dark:bg-primary/10 border-b">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your personal details and contact info.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSubmit} className="space-y-5">
                <FieldGroup className="grid gap-4 sm:grid-cols-2">
                  <Field>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={profileData.firstName}
                      onChange={handleProfileChange}
                      required
                      aria-label="firstName"
                      className="p-3 h-10"
                    />
                  </Field>
                  <Field>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={profileData.lastName}
                      onChange={handleProfileChange}
                      required
                      className="p-3 h-10"
                      aria-label="lastName"
                    />
                  </Field>
                  <Field className="sm:col-span-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      required
                      aria-label="email"
                      className="p-3 h-10"
                    />
                  </Field>
                  <Field className="sm:col-span-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleProfileChange}
                      required
                      placeholder="+91 XXXXX XXXXX"
                      aria-label="phone"
                      className="p-3 h-10"
                    />
                  </Field>
                </FieldGroup>
                <div className="flex justify-end pt-2">
                  <Button
                    size="lg"
                    type="submit"
                    disabled={updateProfile.isPending}
                  >
                    {updateProfile.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Password Management */}
          <Card>
            <CardHeader className="dark:bg-primary/10 border-b">
              <div className="flex items-center gap-3">
                <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-lg">
                  <Lock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <CardTitle>Security & Password</CardTitle>
                  <CardDescription>Change your password to keep your account secure.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>

              {passwordStep === 'verify' ? (
                <form onSubmit={handleVerifyPassword} className="space-y-4">
                  <FieldGroup className="grid gap-2">
                    <Field>
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                        aria-label="currentPassword"
                        placeholder="Enter your current password to receive OTP"
                        className="p-3 h-10"
                      />
                    </Field>
                  </FieldGroup>
                  <div className="flex justify-end">
                    <Button
                      size="lg"
                      type="submit"
                      disabled={verifyPassword.isPending}
                    >
                      {verifyPassword.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : null}
                      Send OTP to Email
                    </Button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handlePasswordSubmit} className="space-y-5 animate-in slide-in-from-right-4 duration-300">
                  <FieldDescription className="mb-7 bg-amber-50 border border-amber-100 p-3 rounded-md dark:bg-amber-900/10 dark:border-amber-900/20">
                    <p className="text-amber-800 dark:text-amber-300">
                      We've sent an OTP to your registered email. Please enter it below along with your new password.
                    </p>
                  </FieldDescription>
                  <Field className="grid gap-2">
                    <Label htmlFor="otp">Verification OTP</Label>
                    <Input
                      id="otp"
                      name="otp"
                      value={passwordData.otp}
                      onChange={handlePasswordDataChange}
                      required
                      aria-label="otp"
                      placeholder="Enter 6-digit OTP"
                      className="p-3 h-10"
                    />
                  </Field>
                  <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Field>
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={handlePasswordDataChange}
                        required
                        placeholder="Enter New Password"
                        aria-label="newPassword"
                        className="p-3 h-10"
                      />
                    </Field>
                    <Field>
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordDataChange}
                        placeholder="Re-Enter Password"
                        required
                        aria-label="confirm password"
                        className="p-3 h-10"
                      />
                    </Field>
                  </FieldGroup>
                  <div className="flex justify-between items-center pt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setPasswordStep('verify')}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={changePassword.isPending}
                      size="lg"
                      className="bg-amber-600 hover:bg-amber-700"
                    >
                      {changePassword.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ShieldCheck className="h-4 w-4" />
                      )}
                      Change Password
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayoutProvider>
  );
}
