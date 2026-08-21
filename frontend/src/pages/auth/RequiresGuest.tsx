import {useCurrentUser} from "@/hooks/useCurrentUser.ts";
import type {ReactNode} from "react";
import {Navigate} from "react-router-dom";
import {Spinner} from "@/components/ui/spinner.tsx";

export function RequireGuest({children}: {children: ReactNode}) {
    const { isLoading, data } = useCurrentUser()
    if (isLoading) return (
        <div className="flex items-center justify-center h-screen">
            <Spinner />
        </div>
    )
    if (data) return <Navigate to={'/dashboard'} replace/>
    return <>{children}</>
}
