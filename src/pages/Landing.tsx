import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { useState, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import ContactDialog from "@/components/Contact";
import { motion, AnimatePresence } from "motion/react";
import zxcvbn from "zxcvbn";
import PriPol from "@/components/PriPol";
import TermsOfService from "@/components/ToS";
import { useAuth } from "@/hooks/useAuth";

// Constants
const MIN_PASSWORD_STRENGTH = 3;
const EMAIL_REGEX =
  /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/i;

// Rate Limiting Configuration
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_ATTEMPTS = 6;

const { login, register } = useAuth();

// Types
interface PasswordStrengthInfo {
  score: number;
  suggestions: string[];
  warning: string;
}

interface RateLimitState {
  attempts: number;
  lastAttemptTime: number;
}

function Landing() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordStrengthInfo, setPasswordStrengthInfo] =
    useState<PasswordStrengthInfo | null>(null);
  const [isPasswordInfoOpen, setIsPasswordInfoOpen] = useState(false);

  // Rate Limiting Ref
  const rateLimitRef = useRef<RateLimitState>({
    attempts: 0,
    lastAttemptTime: 0,
  });

  const { toast } = useToast();

  // Rate Limiting Check
  const checkRateLimit = useCallback((): boolean => {
    const now = Date.now();
    const { attempts, lastAttemptTime } = rateLimitRef.current;

    if (now - lastAttemptTime > RATE_LIMIT_WINDOW) {
      rateLimitRef.current = { attempts: 1, lastAttemptTime: now };
      return true;
    }

    if (attempts >= MAX_ATTEMPTS) {
      toast({
        title: "Too Many Attempts",
        description: "Please wait a moment before trying again.",
        variant: "destructive",
      });
      return false;
    }

    rateLimitRef.current = {
      attempts: attempts + 1,
      lastAttemptTime: now,
    };
    return true;
  }, [toast]);

  // Validate email format
  const validateEmail = (emailToValidate: string): boolean => {
    if (!emailToValidate) {
      setEmailError("Email is required");
      return false;
    }

    if (!EMAIL_REGEX.test(emailToValidate)) {
      setEmailError("Please enter a valid email address");
      return false;
    }

    setEmailError("");
    return true;
  };

  // Validate password strength
  const validatePassword = (passwordToValidate: string): boolean => {
    if (!passwordToValidate) {
      setPasswordError("Password is required");
      setPasswordStrengthInfo(null);
      return false;
    }

    if (!isLogin) {
      const result = zxcvbn(passwordToValidate);

      if (result.score < MIN_PASSWORD_STRENGTH) {
        setPasswordError("Password is too weak");
        setPasswordStrengthInfo({
          score: result.score,
          suggestions: result.feedback.suggestions,
          warning: result.feedback.warning,
        });
        return false;
      }
    }

    setPasswordError("");
    setPasswordStrengthInfo(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!checkRateLimit()) {
      return;
    }

    setIsLoading(true);

    try {
      const isEmailValid = validateEmail(email);
      const isPasswordValid = validatePassword(password);
      const isUsernameValid = !isLogin ? username.trim().length > 0 : true;

      if (!isEmailValid || !isPasswordValid || !isUsernameValid) {
        setIsLoading(false);
        return;
      }

      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password, username);
      }

      toast({
        title: "Success!",
        description: isLogin
          ? "Logged in successfully!"
          : "Account created successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div
        className="w-full max-w-md p-8 space-y-6"
        role="main"
        aria-label="Login and Signup Form"
      >
        <div className="text-center">
          <h1
            className="text-5xl flex items-center justify-center font-logo font-bold tracking-wide"
            aria-level={1}
          >
            tskd.
          </h1>
          <p
            className="text-muted-foreground"
            aria-description="Productivity management platform tagline"
          >
            Learn to manage your productivity, not your tasks.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
          aria-label={isLogin ? "Login Form" : "Signup Form"}
        >
          <AnimatePresence>
            {!isLogin && (
              <motion.div
                key="username"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="px-1 space-y-2"
              >
                <Label className="flex items-center" htmlFor="username">
                  <User className="mr-2 text-muted-foreground w-5" />
                  <span>Name</span>
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your name"
                  required={!isLogin}
                  aria-required={!isLogin}
                  aria-invalid={username.trim().length === 0 && !isLogin}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className={"px-1 space-y-2 " + (isLogin ? "pt-1" : "")}>
            <Label className="flex items-center" htmlFor="email">
              <Mail className="mr-2 text-muted-foreground w-5" />
              <span>Email</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                validateEmail(e.target.value);
              }}
              placeholder="Enter your email"
              required
              aria-required="true"
              aria-invalid={!!emailError}
              aria-describedby={emailError ? "email-error" : undefined}
            />
            {emailError && emailError !== "Email is required" && (
              <div
                id="email-error"
                className="text-red-400 flex items-center text-sm mt-1"
                role="alert"
              >
                <AlertCircle className="mr-1 w-4 h-4" />
                {emailError}
              </div>
            )}
          </div>

          <div className="px-1 space-y-2">
            <Label className="flex items-center" htmlFor="password">
              <Lock className="mr-2 text-muted-foreground w-5" />
              <span>Password</span>
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                validatePassword(e.target.value);
              }}
              placeholder="Enter your password"
              required
              aria-required="true"
              aria-invalid={!!passwordError}
              aria-describedby={passwordError ? "password-error" : undefined}
            />
            {passwordError && passwordError !== "Password is required" && (
              <div
                id="password-error"
                className="text-red-400 flex items-center text-sm mt-1 cursor-pointer"
                onClick={() => setIsPasswordInfoOpen(true)}
                role="alert"
              >
                <HelpCircle className="mr-1 w-4 h-4" />
                {passwordError}
              </div>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
            aria-busy={isLoading}
          >
            {isLoading ? "Processing..." : isLogin ? "Log In" : "Sign Up"}
            {!isLoading && <ArrowRight className="ml-2" />}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-primary hover:underline"
              aria-label={isLogin ? "Switch to Signup" : "Switch to Login"}
            >
              {isLogin
                ? "Don't have an account? Sign Up"
                : "Already have an account? Log In"}
            </button>
          </div>
        </form>

        <div
          className="text-center text-xs text-muted-foreground"
          role="contentinfo"
        >
          By continuing, you agree to our{" "}
          <TermsOfService
            child={
              <button className="underline" aria-label="Terms of Service">
                terms of service
              </button>
            }
          />{" "}
          and{" "}
          <PriPol
            child={
              <button className="underline" aria-label="Privacy Policy">
                privacy policy
              </button>
            }
          />
          . For any further inquiries,{" "}
          <ContactDialog
            child={
              <button
                className="underline cursor-pointer"
                aria-label="Contact Us"
              >
                contact us
              </button>
            }
          />
          .
        </div>
      </div>

      {/* Password Strength Info Dialog */}
      <Dialog open={isPasswordInfoOpen} onOpenChange={setIsPasswordInfoOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Password Strength Details</DialogTitle>
            <DialogDescription>
              {passwordStrengthInfo?.warning && (
                <div className="mb-4 text-orange-500">
                  Warning: {passwordStrengthInfo.warning}
                </div>
              )}
              <h3 className="font-semibold mb-2">Suggestions to Improve:</h3>
              <ul className="list-disc pl-5 space-y-2">
                {passwordStrengthInfo?.suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default Landing;
