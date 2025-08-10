import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { authService } from "@/services/authService";
import { CheckCircle, Loader2, Mail, XCircle } from "lucide-react";
import React, { useState, useCallback } from "react";
import { toast } from "react-hot-toast";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

export const EmailVerificationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(
    null
  );
  const navigate = useNavigate();

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const verifyEmail = useCallback(
    async (verificationToken: string) => {
      setIsVerifying(true);
      setVerificationError(null);

      try {
        await authService.verifyEmail(verificationToken);
        setIsVerified(true);
        toast.success("Email verified successfully!");

        // Redirect to login after a short delay
        setTimeout(() => {
          navigate("/login", {
            state: { message: "Email verified successfully! Please log in." },
          });
        }, 2000);
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error && "response" in error
            ? (error as { response?: { data?: { message?: string } } }).response
                ?.data?.message || "Email verification failed"
            : "Email verification failed";
        setVerificationError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsVerifying(false);
      }
    },
    [navigate]
  );

  // Auto-verify if token is present in URL
  React.useEffect(() => {
    console.log("Frontend API URL:", import.meta.env.VITE_API_URL);
    if (token) {
      verifyEmail(token);
    }
  }, [token, verifyEmail]);

  const resendVerificationEmail = async () => {
    if (!email) {
      toast.error("Email address not found. Please register again.");
      return;
    }

    try {
      await authService.resendVerificationEmail(email);
      toast.success("Verification email sent successfully!");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message || "Failed to resend verification email"
          : "Failed to resend verification email";
      toast.error(errorMessage);
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <Logo size="lg" className="mx-auto text-primary" />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Verifying Email
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Please wait while we verify your email address...
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <Logo size="lg" className="mx-auto text-primary" />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Email Verified!
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Your email has been successfully verified.
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center mb-4">
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>
              <p className="text-center text-sm text-gray-600">
                Redirecting to login page...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Logo size="xl" className="mx-auto text-blue-700" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Verify Your Email
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            We've sent a verification link to your email address
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Verification Required
            </CardTitle>
            <CardDescription>
              Please check your email and click the verification link to
              activate your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {verificationError && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{verificationError}</AlertDescription>
              </Alert>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Didn't receive the email?</strong>
              </p>
              <p className="text-sm text-blue-700 mt-1">
                Check your spam folder or click the button below to resend the
                verification email.
              </p>
            </div>

            {email && (
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  disabled
                  className="bg-gray-50"
                />
              </div>
            )}

            <div className="space-y-3">
              <Button
                onClick={resendVerificationEmail}
                variant="outline"
                className="w-full"
              >
                <Mail className="mr-2 h-4 w-4" />
                Resend Verification Email
              </Button>

              <Button asChild className="w-full">
                <Link to="/login">Back to Login</Link>
              </Button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already verified?{" "}
                <Link to="/login" className="text-primary hover:underline">
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
