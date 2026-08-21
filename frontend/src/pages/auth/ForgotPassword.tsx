import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useRequestPasswordRecoveryOtpMutation } from "@/api/authHooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const requestOtpMutation = useRequestPasswordRecoveryOtpMutation();

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");

        if (!email || requestOtpMutation.isPending) return;

        requestOtpMutation.mutate(email, {
            onSuccess: () => {
                sessionStorage.setItem("recovery_email", email);
                toast.success("Verification code sent to your email.");
                navigate("/forgot-password/otp");
            },
            onError: (err: any) => {
                console.error("Failed to request recovery OTP", err);
                setError(err.message || "Something went wrong. Please try again later.");
            }
        });
    };

    return (
        <div className="flex items-center justify-center h-screen">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle>Forgot password</CardTitle>
                    <CardDescription>
                        Enter your email and we&apos;ll send you a verification code.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <FieldGroup>
                            {error && (
                                <div role="alert" className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
                                    {error}
                                </div>
                            )}
                            <Field data-invalid={!!error}>
                                <FieldLabel htmlFor="email">Email</FieldLabel>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="student@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                <FieldError>{error && "Please check your email address"}</FieldError>
                            </Field>
                            <Button type="submit" className="w-full" disabled={requestOtpMutation.isPending}>
                                {requestOtpMutation.isPending ? (
                                    <div className="flex items-center gap-2">
                                        <Spinner className="size-4" />
                                        Sending code
                                    </div>
                                ) : "Send code"}
                            </Button>
                            <p className="text-center text-sm text-muted-foreground">
                                <Link to="/login">Back to login</Link>
                            </p>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
