import {useState, type ComponentProps, type SubmitEventHandler} from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {Link} from "react-router-dom";
import {useLoginMutation, getGoogleLoginUrl} from "@/api";
import {Spinner} from "@/components/ui/spinner.tsx";
import {loginRequestSchema} from "@/entities/login.ts";

export function   LoginForm({
  className,
  ...props
}: ComponentProps<"div">) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const loginMutation = useLoginMutation()

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()
    setErrors({})

    const formData = new FormData(event.currentTarget as HTMLFormElement)
    const result = loginRequestSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    })

    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      result.error.issues.forEach((issue) => {
        const path = issue.path[0]
        if (typeof path === "string") {
          fieldErrors[path] = issue.message
        }
      })
      setErrors(fieldErrors)
      return
    }
    
    loginMutation.mutate({
      email: result.data.email,
      password: result.data.password,
    }, {
      onError: (err: any) => {
        console.error("Login failed", err)
        setErrors({
          form: err.message || "Invalid email or password. Please try again."
        })
      }
    })
  }

  return (
    <div className={cn("flex w-full max-w-sm flex-col gap-6", className)} {...props}>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              {errors.form && (
                <div role="alert" className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
                  {errors.form}
                </div>
              )}
              <Field data-invalid={!!errors.email}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="student@example.com"
                  required
                  aria-label="email"
                />
                <FieldError>{errors.email}</FieldError>
              </Field>
              <Field data-invalid={!!errors.password}>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Link
                    to="/forgot-password"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <Input id="password" name="password" type="password" placeholder="Enter your password" required />
                <FieldError>{errors.password}</FieldError>
              </Field>
              <Field className="flex flex-col gap-2">
                <Button className="w-full" type="submit" disabled={loginMutation.isPending}>
                  {loginMutation.isPending ? (<div className="flex items-center gap-2"><Spinner className="size-3" /> Logging in</div>) : "Login"}
                </Button>
                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                  type="button"
                  onClick={() => {
                    localStorage.setItem("access_token", "demo_admin_jwt_token");
                    window.location.href = "/dashboard/admin/overview";
                  }}
                >
                  ⚡ Direct Admin Login (Demo)
                </Button>
                <Button 
                  className="w-full" 
                  variant="outline" 
                  type="button"
                  onClick={() => window.location.href = getGoogleLoginUrl()}
                >
                  Login with Google
                </Button>
                <FieldDescription className="text-center">
                  Don&apos;t have an account? <Link to="/signup">Sign up</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
