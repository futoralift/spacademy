import {useState, useEffect, type SubmitEventHandler} from "react";
import {RefreshCwIcon} from "lucide-react";
import {InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot} from "@/components/ui/input-otp";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Field, FieldDescription, FieldLabel} from "@/components/ui/field";
import {Button} from "@/components/ui/button";
import {useVerifyPasswordRecoveryOtpMutation, useRequestPasswordRecoveryOtpMutation} from "@/api/authHooks";
import {useNavigate} from "react-router-dom";
import {Spinner} from "@/components/ui/spinner";
import {toast} from "sonner";

export default function ForgotPasswordOtpPage() {
    const email = sessionStorage.getItem("recovery_email");
    const navigate = useNavigate();
    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const [timer, setTimer] = useState(0);

    const verifyOtpMutation = useVerifyPasswordRecoveryOtpMutation();
    const resendOtpMutation = useRequestPasswordRecoveryOtpMutation();

    useEffect(() => {
        if (!email) {
            navigate("/forgot-password");
            return;
        }

        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [timer, email, navigate]);

    const handleOtpChange = (value: string) => {
        setOtp(value);
        if (error) setError("");
    }

    const handleResend = async () => {
        if (!email || timer > 0 || resendOtpMutation.isPending) return;

        resendOtpMutation.mutate(email, {
            onSuccess: () => {
                setTimer(60);
                toast.success("New verification code sent successfully.");
                setError("");
            },
            onError: (err: any) => {
                console.error("Resend OTP failed", err);
                toast.error(err.message || "Failed to resend code.");
            }
        });
    };

    const handleSubmit: SubmitEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault();
        setError("");

        if (!email || otp.length !== 6 || verifyOtpMutation.isPending) {
            return;
        }

        verifyOtpMutation.mutate(
            { email, otp },
            {
                onSuccess: (data) => {
                    sessionStorage.setItem("recovery_token", data.recoveryToken);
                    toast.success("OTP verified. You can now reset your password.");
                    navigate("/forgot-password/reset");
                },
                onError: (err: any) => {
                    console.error("OTP Verification failed", err);
                    setError(err.message || "Invalid or expired verification code.");
                }
            },
        );
    };

    return (
        <div className="flex items-center justify-center h-screen">
            <Card className="mx-auto max-w-md">
                <CardHeader>
                    <CardTitle>Verify your account</CardTitle>
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
                                <Button variant="link" type="button" onClick={() => navigate("/forgot-password")} className="h-auto p-0">
                                    I want to use a different email address.
                                </Button>
                            </FieldDescription>
                        </Field>
                    </CardContent>
                    <CardFooter>
                        <Field>
                            <Button
                                type="submit"
                                disabled={!email || otp.length !== 6 || verifyOtpMutation.isPending}
                            >
                                {verifyOtpMutation.isPending ? (<div className="flex items-center gap-2"><Spinner/> Verifying</div>) : "Verify"}
                            </Button>
                        </Field>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
