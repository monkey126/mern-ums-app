import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/ui/logo";
import { useAuth } from "@/hooks/useAuth";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, CheckCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/dashboard";
  const verificationMessage = location.state?.message;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Clear error message when user starts typing - commented out to ensure error messages stay visible
  // const watchedFields = watch();
  // React.useEffect(() => {
  // 	if (errorMessage && (watchedFields.email || watchedFields.password)) {
  // 		// Only clear error if user has actually typed something new
  // 		const hasTyped = watchedFields.email || watchedFields.password;
  // 		if (hasTyped && errorMessage) {
  // 			setErrorMessage(null);
  // 		}
  // 	}
  // }, [watchedFields.email, watchedFields.password]);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setErrorMessage(null);
    console.log("LoginPage: Starting login process for:", data.email);

    try {
      await login(data.email, data.password);
      console.log("LoginPage: Login successful, navigating to:", from);
      navigate(from, { replace: true });
    } catch (error: unknown) {
      const isAxiosError = (
        err: unknown
      ): err is { response?: { data?: { message?: string } } } => {
        return typeof err === "object" && err !== null && "response" in err;
      };

      let message = isAxiosError(error)
        ? error.response?.data?.message || "Login failed"
        : "Login failed";
      console.log("LoginPage: Login failed with message:", message);

      // Handle account status issues
      if (message.includes("inactive") || message.includes("suspended")) {
        const status = message.includes("suspended") ? "suspended" : "inactive";
        console.log(
          "LoginPage: Account status issue detected, redirecting to account-status page"
        );
        navigate(
          `/account-status?status=${status}&email=${encodeURIComponent(
            data.email
          )}`,
          { replace: true }
        );
        return;
      }

      // Provide more specific error messages
      if (
        message
          .toLowerCase()
          .includes("no account found with this email address")
      ) {
        message =
          "No account found with this email address. Please check your email or sign up for a new account.";
      } else if (message.toLowerCase().includes("incorrect password")) {
        message =
          "Incorrect password. Please check your password and try again.";
      } else if (message.toLowerCase().includes("invalid credentials")) {
        message =
          "Invalid email or password. Please check your credentials and try again.";
      } else if (
        message.toLowerCase().includes("email") &&
        message.toLowerCase().includes("not found")
      ) {
        message =
          "No account found with this email address. Please check your email or sign up for a new account.";
      } else if (message.toLowerCase().includes("password")) {
        message =
          "Incorrect password. Please check your password and try again.";
      } else if (
        message.toLowerCase().includes("email not verified") ||
        message.toLowerCase().includes("verify your email")
      ) {
        message =
          "Please verify your email address before logging in. Check your inbox for a verification email.";
      } else if (
        message.toLowerCase().includes("account") &&
        message.toLowerCase().includes("inactive")
      ) {
        message =
          "Your account is inactive. Please contact support to reactivate your account.";
      } else if (
        message.toLowerCase().includes("account") &&
        message.toLowerCase().includes("suspended")
      ) {
        message =
          "Your account has been suspended. Please contact support for assistance.";
      } else if (
        message.toLowerCase().includes("network") ||
        message.toLowerCase().includes("connection")
      ) {
        message =
          "Network error. Please check your internet connection and try again.";
      } else if (
        message.toLowerCase().includes("server") ||
        message.toLowerCase().includes("internal")
      ) {
        message =
          "Server error. Please try again later or contact support if the problem persists.";
      } else if (!message || message === "Login failed") {
        message =
          "Login failed. Please check your email and password and try again.";
      }

      // Set the error message and ensure it's displayed
      setErrorMessage(message);
      console.log("LoginPage: Setting error message:", message);

      // Don't show toast for account status errors, let the UI handle them
      if (!message.includes("inactive") && !message.includes("suspended")) {
        // Remove the toast.error call to avoid interference with the error display
        // toast.error(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Logo size="xl" className="mx-auto text-blue-700" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Welcome back to World IT UMS
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {verificationMessage && (
              <Alert className="mb-4">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{verificationMessage}</AlertDescription>
              </Alert>
            )}

            {errorMessage && (
              <Alert
                variant="destructive"
                className="mb-4 border-red-200 bg-red-50 dark:bg-red-950/50 dark:border-red-800"
              >
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle className="text-red-900 dark:text-red-100">
                  Login Failed
                </AlertTitle>
                <AlertDescription className="text-red-800 dark:text-red-200 font-medium">
                  {errorMessage}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  {...register("email")}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    {...register("password")}
                    className={errors.password ? "border-red-500" : ""}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Forgot your password?
                </Link>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link to="/register" className="text-primary hover:underline">
                  Sign up
                </Link>
              </p>

              {/* Debug buttons for testing
							{process.env.NODE_ENV === 'development' && (
								<div className="mt-4 space-y-2">
									<p className="text-xs text-gray-500">
										Debug (Development only):
									</p>
									<div className="flex gap-2 justify-center">
										<Button
											variant="outline"
											size="sm"
											onClick={() => {
												console.log('Testing inactive user flow');
												navigate(
													'/account-status?status=inactive&email=test@example.com'
												);
											}}
										>
											Test Inactive
										</Button>
										<Button
											variant="outline"
											size="sm"
											onClick={() => {
												console.log('Testing suspended user flow');
												navigate(
													'/account-status?status=suspended&email=test@example.com'
												);
											}}
										>
											Test Suspended
										</Button>
									</div>
								</div>
							)} */}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
