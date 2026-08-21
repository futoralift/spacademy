import {useState, type ComponentProps, type SubmitEventHandler} from "react"
import {useMutation} from "@tanstack/react-query"
import type {ResponseModel} from "@/api/types"
import { cn } from "@/lib/utils"
import {registerUser} from "@/api/auth/register-user"
import {registerSchema, type RegisterRequestModel} from "@/entities/register"
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
import {Input} from "@/components/ui/input"
import {Spinner} from "@/components/ui/spinner.tsx";
import {Link, useNavigate} from "react-router-dom";
import {getGoogleLoginUrl} from "@/api";

export function SignupForm({
  className,
  ...props
}: ComponentProps<"div">) {
  const navigate = useNavigate()
  const [errors, setErrors] = useState<Record<string, string>>({})

  const registerMutation = useMutation<ResponseModel, Error, RegisterRequestModel>({
    mutationFn: (payload: RegisterRequestModel) => registerUser(payload),
    onSuccess: (_, variables) => {
      sessionStorage.setItem("email", variables.email)
      navigate("/signup/otp")
    },
    onError: (error: any) => {
      console.error("Registration failed", error)
      setErrors({
        form: error.message || "Something went wrong. Please try again."
      })
    },
  })

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()
    setErrors({})

    const formData = new FormData(event.currentTarget as HTMLFormElement)
    const result = registerSchema.safeParse({
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
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

    registerMutation.mutate({
      firstName: result.data.firstName,
      lastName: result.data.lastName,
      email: result.data.email,
      phone: result.data.phone,
      password: result.data.password,
    })
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create your account</CardTitle>
          <CardDescription>
            Enter your email below to create your account
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
              <Field className="grid grid-cols-2 gap-4">
                <Field data-invalid={!!errors.firstName}>
                  <FieldLabel htmlFor="firstName">First Name</FieldLabel>
                  <Input id="firstName" name="firstName" type="text" placeholder="Enter your first name" required />
                  <FieldError>{errors.firstName}</FieldError>
                </Field>
                <Field data-invalid={!!errors.lastName}>
                  <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
                  <Input id="lastName" name="lastName" type="text" placeholder="Enter your last name" required />
                  <FieldError>{errors.lastName}</FieldError>
                </Field>
              </Field>
              <Field data-invalid={!!errors.email}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="student@example.com"
                  required
                />
                <FieldError>{errors.email}</FieldError>
              </Field>
              <Field data-invalid={!!errors.phone}>
                <FieldLabel htmlFor="phone">Phone</FieldLabel>
                <Input id="phone" name="phone" type="tel" placeholder="+91 XXXXXXXXXX" />
                <FieldError>{errors.phone}</FieldError>
              </Field>
              <Field data-invalid={!!errors.password || !!errors.confirmPassword}>
                <div className="grid grid-cols-2 gap-4">
                  <Field data-invalid={!!errors.password}>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Input id="password" name="password" type="password" placeholder="Enter your password" required />
                  </Field>
                  <Field data-invalid={!!errors.confirmPassword}>
                    <FieldLabel htmlFor="confirmPassword">
                      Confirm Password
                    </FieldLabel>
                    <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="Re-enter your password" required />
                  </Field>
                </div>
                <FieldError>{errors.password || errors.confirmPassword}</FieldError>
                <FieldDescription>
                  Must be at least 8 characters long.
                </FieldDescription>
              </Field>
              <Field>
                <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
                  {registerMutation.isPending ? (<div className="flex items-center justify-center gap-3"><Spinner /> Creating Account</div>) : ("Create Account")}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  type="button"
                  onClick={() => window.location.href = getGoogleLoginUrl()}
                >
                  Sign up with Google
                </Button>
                <FieldDescription className="text-center">
                  Already have an account? <Link to="/login">Login</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  )
}
