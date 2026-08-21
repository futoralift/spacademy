import { useState, useEffect, type SubmitEvent } from "react";
import { useLocation, Navigate, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { useGoogleFinalizeMutation, useCurrentUserQuery, useUpdateProfileMutation } from "@/api/authHooks";
import { cn } from "@/lib/utils";

const AVATARS = [
    { id: "1", url: "https://api.dicebear.com/9.x/adventurer/svg?seed=Kimberly" },
    { id: "2", url: "https://api.dicebear.com/9.x/adventurer/svg?seed=Jocelyn" },
    { id: "3", url: "https://api.dicebear.com/9.x/adventurer/svg?seed=Maria" },
    { id: "4", url: "https://api.dicebear.com/9.x/adventurer/svg?seed=Jameson" },
    { id: "5", url: "https://api.dicebear.com/9.x/adventurer/svg?seed=Ryan" },
    { id: "6", url: "https://api.dicebear.com/9.x/adventurer/svg?seed=Leah" },
    { id: "7", url: "https://api.dicebear.com/9.x/adventurer/svg?seed=Avery" },
    { id: "8", url: "https://api.dicebear.com/9.x/adventurer/svg?seed=Mackenzie" },
    { id: "9", url: "https://api.dicebear.com/9.x/adventurer/svg?seed=Chase" },
    { id: "10", url: "https://api.dicebear.com/9.x/adventurer/svg?seed=Christopher" },
    { id: "11", url: "https://api.dicebear.com/9.x/adventurer/svg?seed=Easton" },
    { id: "12", url: "https://api.dicebear.com/9.x/adventurer/svg?seed=Vivian" },
    { id: "13", url: "https://api.dicebear.com/9.x/adventurer/svg?seed=Katherine" },
    { id: "14", url: "https://api.dicebear.com/9.x/adventurer/svg?seed=Jade" },
];

export default function PickAvatarPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const email = queryParams.get("email");
    const type = queryParams.get("type"); // "app" or "google" (default to google if not present)

    const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0].url);
    const [phone, setPhone] = useState("");
    const [error, setError] = useState("");

    const isAppUser = type === "app";
    
    // Hooks for Google Flow
    const finalizeMutation = useGoogleFinalizeMutation();
    
    // Hooks for App Flow
    const { data: userData, isLoading: isUserLoading } = useCurrentUserQuery();
    const updateProfileMutation = useUpdateProfileMutation();

    useEffect(() => {
        if (isAppUser && userData) {
            setPhone(userData.phone);
        }
    }, [isAppUser, userData]);

    if (!email) {
        return <Navigate to="/login" replace />;
    }

    const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");

        if (!isAppUser && (!phone || phone.length < 10)) {
            setError("Please enter a valid phone number.");
            return;
        }

        if (isAppUser) {
            if (!userData) return;
            updateProfileMutation.mutate(
                {
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    email: userData.email,
                    phone: userData.phone,
                    avatar: selectedAvatar,
                },
                {
                    onSuccess: () => {
                        navigate("/dashboard");
                    },
                    onError: (err: any) => {
                        setError(err.message || "Failed to update profile. Please try again.");
                    }
                }
            );
        } else {
            finalizeMutation.mutate(
                { email, phone, avatar: selectedAvatar },
                {
                    onError: (err: any) => {
                        setError(err.message || "Failed to complete setup. Please try again.");
                    }
                }
            );
        }
    };

    const isPending = isAppUser ? updateProfileMutation.isPending : finalizeMutation.isPending;

    if (isAppUser && isUserLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Spinner className="size-8" />
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center h-screen p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-xl font-bold">Complete Your Profile</CardTitle>
                    <CardDescription className="text-muted-foreground mt-2">
                        {isAppUser
                            ? "Customize your profile with a cool adventurer avatar!"
                            : "Welcome! Just a few more details to get your account ready."
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <FieldGroup>
                            <div className="space-y-4">
                                <FieldLabel className="text-center block text-sm text-muted-foreground">
                                    Choose your adventurer
                                </FieldLabel>
                                <div className="grid grid-cols-[repeat(auto-fit,minmax(80px,1fr))] gap-3 p-2 rounded-xl">
                                    {AVATARS.map((avatar) => (
                                        <button
                                            key={avatar.id}
                                            type="button"
                                            onClick={() => setSelectedAvatar(avatar.url)}
                                            className={cn(
                                                "size-20 relative rounded-full transition-all group flex items-center justify-center",
                                                selectedAvatar === avatar.url
                                                    ? "ring-2 ring-primary scale-105 shadow-md"
                                                    : "opacity-60 hover:opacity-100 hover:scale-110"
                                            )}
                                        >
                                            <img
                                                src={avatar.url}
                                                alt="Avatar"
                                                className="size-20"
                                            />
                                            {selectedAvatar === avatar.url && (
                                                <div className="absolute -bottom-1 -right-1 bg-primary text-white rounded-full size-8 flex items-center justify-center shadow-lg border">
                                                    <svg className="size-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {!isAppUser && (
                                <Field data-invalid={!!error} className="mt-6">
                                    <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        placeholder="+91 XXXXXXXXXX"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        required
                                        className="h-11"
                                        aria-label="phone"
                                    />
                                    <FieldError>{error}</FieldError>
                                </Field>
                            )}

                            {isAppUser && error && (
                                <div role="alert" className="mt-4 p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={isPending}
                            >
                                {isPending ? (
                                    <div className="flex items-center gap-2">
                                        <Spinner className="size-4" />
                                        Finalizing setup...
                                    </div>
                                ) : (
                                    isAppUser ? "Save & Continue" : "Complete Setup"
                                )}
                            </Button>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
