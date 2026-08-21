import { useState, type SubmitEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoverPasswordMutation } from "@/api/authHooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { z } from "zod";
import { toast } from "sonner";

const resetPasswordSchema = z.object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

export default function ResetPasswordPage() {
    const recoveryToken = sessionStorage.getItem("recovery_token");
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [globalError, setGlobalError] = useState("");

    const recoverMutation = useRecoverPasswordMutation();

    if (!recoveryToken) {
        navigate("/forgot-password");
        return null;
    }

    const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        setFieldErrors({});
        setGlobalError("");

        const result = resetPasswordSchema.safeParse({
            password,
            confirmPassword,
        });

        if (!result.success) {
            const errors: Record<string, string> = {};
            result.error.issues.forEach((issue) => {
                const path = issue.path[0];
                if (typeof path === "string") {
                    errors[path] = issue.message;
                }
            });
            setFieldErrors(errors);
            return;
        }

        recoverMutation.mutate(
            {
                recoveryToken,
                newPassword: password,
            },
            {
                onSuccess: () => {
                    sessionStorage.removeItem("recovery_email");
                    sessionStorage.removeItem("recovery_token");
                    toast.success("Password reset successful. You can now login.");
                    navigate("/login");
                },
                onError: (err: any) => {
                    console.error("Password recovery failed", err);
                    setGlobalError(err.message || "Failed to reset password. Please try again.");
                }
            },
        );
    };

    return (
        <div className="flex items-center justify-center h-screen">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle>Reset password</CardTitle>
                    <CardDescription>
                        Enter your new password below.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 p-0">
                    <form onSubmit={handleSubmit}>
                        {globalError && (
                            <div role="alert" className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
                                {globalError}
                            </div>
                        )}
                        <div className="px-4 pb-4">
                            <FieldGroup>
                                <Field data-invalid={!!fieldErrors.password}>
                                    <FieldLabel htmlFor="password">New password</FieldLabel>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="Minimum 8 characters"
                                        autoComplete="new-password"
                                        aria-label="Password"
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: "" }));
                                        }}
                                        required
                                    />
                                    <FieldError>{fieldErrors.password}</FieldError>
                                </Field>
                                <Field data-invalid={!!fieldErrors.confirmPassword}>
                                    <FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        placeholder="Repeat new password"
                                        autoComplete="new-password"
                                        aria-label="confirm password"
                                        value={confirmPassword}
                                        onChange={(e) => {
                                            setConfirmPassword(e.target.value);
                                            if (fieldErrors.confirmPassword) setFieldErrors(prev => ({ ...prev, confirmPassword: "" }));
                                        }}
                                        required
                                    />
                                    <FieldError>{fieldErrors.confirmPassword}</FieldError>
                                </Field>
                            </FieldGroup>
                        </div>
                        <CardFooter>
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={recoverMutation.isPending}
                            >
                                {recoverMutation.isPending ? (
                                    <div className="flex items-center gap-2">
                                        <Spinner className="size-4" />
                                        Resetting password
                                    </div>
                                ) : "Reset Password"}
                            </Button>
                        </CardFooter>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
