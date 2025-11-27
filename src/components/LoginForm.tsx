"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";
import { Eye, EyeOff, Mail, Lock, User, X, ArrowLeft } from "lucide-react";
import { signupUser, checkEmailExists } from "@/lib/auth-api";

interface AuthDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthStep = "email" | "login" | "signup";

export default function AuthDrawer({ isOpen, onClose }: AuthDrawerProps) {
  const [step, setStep] = useState<AuthStep>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuthStore();

  // Handle ESC key and scroll prevention
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll
      document.body.style.overflow = "hidden";

      return () => {
        document.removeEventListener("keydown", handleEscape);
        // Restore body scroll
        document.body.style.overflow = "unset";
      };
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  // Reset form when drawer closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep("email");
        setEmail("");
        setPassword("");
        setFirstName("");
        setLastName("");
        setShowPassword(false);
        setError("");
      }, 300);
    }
  }, [isOpen]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setError("");

    try {
      console.log("Checking email:", email);
      const result = await checkEmailExists(email);
      console.log("Check email result:", result);
      setStep(result.exists ? "login" : "signup");
    } catch (error) {
      console.error("Email check error:", error);
      setError("Failed to check email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      login(data.user);
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      console.log("Sending signup request with data:", {
        email,
        firstName,
        lastName,
        password: "***",
      });

      const result = await signupUser({
        email,
        password,
        firstName,
        lastName,
      });

      console.log("Signup successful:", result);
      login(result.user);
      onClose();
    } catch (error) {
      console.error("Signup error details:", error);
      setError(error instanceof Error ? error.message : "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (step === "login" || step === "signup") {
      setStep("email");
      setPassword("");
      setFirstName("");
      setLastName("");
      setError("");
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity z-[100] ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-screen w-full max-w-md bg-card border-l border-border shadow-2xl transform transition-transform z-[101] flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-4 border-b border-border/50 bg-card flex-shrink-0">
          <div className="flex items-center space-x-3">
            {(step === "login" || step === "signup") && (
              <button
                onClick={handleBack}
                className="p-2 hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors text-muted-foreground"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h2 className="text-lg font-semibold text-card-foreground">
              {step === "login" && "Sign In"}
              {step === "signup" && "Create Account"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors text-muted-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 bg-card min-h-0 scrollbar-hide">
          <style jsx>{`
            .scrollbar-hide {
              -ms-overflow-style: none; /* IE and Edge */
              scrollbar-width: none; /* Firefox */
            }
            .scrollbar-hide::-webkit-scrollbar {
              display: none; /* Chrome, Safari, Opera */
            }
          `}</style>

          <div className="max-w-sm mx-auto">
            {/* Error Message */}
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-destructive rounded-full animate-pulse"></div>
                  <span className="text-destructive text-sm font-medium">
                    {error}
                  </span>
                </div>
              </div>
            )}

            {/* Email Step */}
            {step === "email" && (
              <div className="animate-in slide-in-from-right-5 duration-500">
                <form onSubmit={handleEmailSubmit} className="space-y-6">
                  <div className="text-center mb-8">
                    <div className="mb-4">
                      <span className="text-2xl font-bold text-card-foreground tracking-wider">
                        VYSE
                      </span>
                    </div>
                    <p className="text-lg font-medium text-card-foreground mb-2">
                      Enter your email to continue
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Join thousands of sneaker enthusiasts
                    </p>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-card-foreground">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !email}
                    className="w-full bg-primary text-primary-foreground font-medium py-3 px-4 rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-3"></div>
                        Checking...
                      </div>
                    ) : (
                      "Continue"
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* Login Step */}
            {step === "login" && (
              <div className="animate-in slide-in-from-right-5 duration-500">
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Lock className="w-8 h-8 text-primary" />
                    </div>
                    <p className="text-lg font-medium text-card-foreground mb-2">
                      Welcome back!
                    </p>
                    <div className="bg-muted/50 rounded-lg px-3 py-1 inline-block">
                      <p className="text-sm text-muted-foreground">{email}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-card-foreground">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-12 py-3 bg-background border border-border rounded-lg text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                        placeholder="Enter your password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-card-foreground transition-colors p-1 rounded-lg hover:bg-accent"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !password}
                    className="w-full bg-primary text-primary-foreground font-medium py-3 px-4 rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-3"></div>
                        Signing in...
                      </div>
                    ) : (
                      "Sign In"
                    )}
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      className="text-sm text-muted-foreground hover:text-card-foreground underline underline-offset-4 transition-colors duration-200 hover:decoration-2"
                    >
                      Forgot password?
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Signup Step */}
            {step === "signup" && (
              <div className="animate-in slide-in-from-right-5 duration-500">
                <form onSubmit={handleSignup} className="space-y-6">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <User className="w-8 h-8 text-primary" />
                    </div>
                    <p className="text-lg font-medium text-card-foreground mb-2">
                      Create your account
                    </p>
                    <div className="bg-muted/50 rounded-lg px-3 py-1 inline-block">
                      <p className="text-sm text-muted-foreground">{email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-card-foreground">
                        First Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full pl-10 pr-3 py-3 bg-background border border-border rounded-lg text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                          placeholder="John"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-card-foreground">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full px-3 py-3 bg-background border border-border rounded-lg text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                        placeholder="Doe"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-card-foreground">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-12 py-3 bg-background border border-border rounded-lg text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                        placeholder="Create a secure password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-card-foreground transition-colors p-1 rounded-lg hover:bg-accent"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center space-x-1">
                      <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                      <span>Password must be at least 8 characters</span>
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !password || !firstName || !lastName}
                    className="w-full bg-primary text-primary-foreground font-medium py-3 px-4 rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-3"></div>
                        Creating account...
                      </div>
                    ) : (
                      "Create Account"
                    )}
                  </button>

                  <div className="text-center pt-2">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      By creating an account, you agree to our{" "}
                      <button className="text-card-foreground hover:text-primary underline underline-offset-2 transition-colors duration-200">
                        Terms of Service
                      </button>{" "}
                      and{" "}
                      <button className="text-card-foreground hover:text-primary underline underline-offset-2 transition-colors duration-200">
                        Privacy Policy
                      </button>
                    </p>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
