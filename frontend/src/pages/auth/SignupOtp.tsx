import { useState, useEffect, type FormEvent } from "react";
import { RefreshCwIcon } from "lucide-react"
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp.tsx";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field.tsx";
import { Button } from "@/components/ui/button.tsx";
import { signupTokenLogin, useVerifySignupOtpMutation, useRequestSignupOtpMutation } from "@/api/auth/register-user";
import { useNavigate } from "react-router-dom";
import { Spinner } from "@/components/ui/spinner.tsx";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";


function SignupOtpPage() {
    const email = sessionStorage.getItem("email");
    const navigate = useNavigate();
    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const [timer, setTimer] = useState(0);

    const verifyOtpMutation = useVerifySignupOtpMutation();
    const resendOtpMutation = useRequestSignupOtpMutation();

    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [timer]);

    const tokenMutation = useMutation({
        mutationFn: async (token: string) => signupTokenLogin(token),
        onSuccess: (data) => {
            localStorage.setItem("access_token", data.access_token);
            navigate(`/pick_avatar?email=${email}&type=app`)
        },
        onError: (err: any) => {
            console.error("Token login failed", err);
            setError(err.message || "Failed to finalize login.");
        }
    })

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError("");

        if (!email || otp.length !== 6 || verifyOtpMutation.isPending) {
            return;
        }

        verifyOtpMutation.mutate(
            { email, otp },
            {
                onSuccess: (data) => {
                    sessionStorage.removeItem("email");
                    tokenMutation.mutate(data.loginToken)
                },
                onError: (err: any) => {
                    console.error("OTP Verification failed", err);
                    setError(err.message || "Invalid or expired verification code.");
                }
            },
        );
    };

    const handleOtpChange = (value: string) => {
        setOtp(value);
        if (error) setError("");
    }

    const handleResend = async () => {
        if (!email || timer > 0 || resendOtpMutation.isPending) return;

        resendOtpMutation.mutate(email, {
            onSuccess: () => {
                setTimer(60);
                toast.success("Verification code resent successfully.");
                setError("");
            },
            onError: (err: any) => {
                console.error("Resend OTP failed", err);
                toast.error(err.message || "Failed to resend code.");
            }
        });
    };

    return (
        <div className="flex items-center justify-center h-screen">
            <Card className="mx-auto max-w-md">
                <CardHeader>
                    <CardTitle>Verify your Signup</CardTitle>
                    <CardDescription>
                        Enter the verification code we sent to your email address:{" "}
                        <span className="font-medium">{email}</span>.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        {error && (
                            <div role="alert" className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
                                {error}
                            </div>
                        )}
                        <Field data-invalid={!!error}>
                            <div className="flex items-center justify-between">
                                <FieldLabel htmlFor="otp-verification">
                                    Verification code
                                </FieldLabel>
                                <Button
                                    variant="outline"
                                    size="xs"
                                    type="button"
                                    onClick={handleResend}
                                    disabled={timer > 0 || resendOtpMutation.isPending}
                                >
                                    {resendOtpMutation.isPending ? <Spinner className="size-3" /> : <RefreshCwIcon />}
                                    {timer > 0 ? `Resend in ${timer}s` : "Resend Code"}
                                </Button>
                            </div>
                            <InputOTP
                                maxLength={6}
                                id="otp-verification"
                                required
                                value={otp}
                                onChange={handleOtpChange}
                            >
                                <InputOTPGroup className="*:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-11 *:data-[slot=input-otp-slot]:text-xl">
                                    <InputOTPSlot index={0} />
                                    <InputOTPSlot index={1} />
                                    <InputOTPSlot index={2} />
                                </InputOTPGroup>
                                <InputOTPSeparator className="mx-2" />
                                <InputOTPGroup className="*:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-11 *:data-[slot=input-otp-slot]:text-xl">
                                    <InputOTPSlot index={3} />
                                    <InputOTPSlot index={4} />
                                    <InputOTPSlot index={5} />
                                </InputOTPGroup>
                            </InputOTP>
                            <FieldDescription>
                                <a href="#">I no longer have access to this email address.</a>
                            </FieldDescription>
                        </Field>
                    </CardContent>
                    <CardFooter>
                        <Field>
                            <Button
                                type="submit"
                                disabled={!email || otp.length !== 6 || verifyOtpMutation.isPending}
                            >
                                {verifyOtpMutation.isPending ? (<div className="flex items-center gap-2"><Spinner /> Verifying</div>) : "Verify"}
                            </Button>
                        </Field>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}

export default SignupOtpPage;
