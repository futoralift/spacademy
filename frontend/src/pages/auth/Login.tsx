import {LoginForm} from "@/components/login-form.tsx";
import {RequireGuest} from "@/pages/auth/RequiresGuest.tsx";

function LoginPage(){
    return (
        <RequireGuest>
            <div className="flex items-center justify-center h-screen">
                <LoginForm/>
            </div>
        </RequireGuest>
    )
}

export default LoginPage;