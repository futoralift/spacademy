import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

export default function OAuthCallbackPage() {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Extract token from hash: #token=...
        const hash = location.hash;
        if (hash && hash.startsWith("#token=")) {
            const token = hash.substring(7);
            if (token) {
                localStorage.setItem("access_token", token);
                toast.success("Login successful!");
                navigate("/dashboard");
            } else {
                toast.error("Authentication failed: Missing token.");
                navigate("/login");
            }
        } else {
            // Check query params just in case
            const params = new URLSearchParams(location.search);
            const token = params.get("token");
            if (token) {
                localStorage.setItem("access_token", token);
                toast.success("Login successful!");
                navigate("/dashboard");
            } else {
                toast.error("Authentication failed: No token provided.");
                navigate("/login");
            }
        }
    }, [location, navigate]);

    return (
        <div className="flex h-screen w-full items-center justify-center flex-col gap-4">
            <Spinner className="size-8" />
            <p className="text-muted-foreground animate-pulse">Completing authentication...</p>
        </div>
    );
}
