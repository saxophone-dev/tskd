"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Lock, ArrowRight } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { useToast } from "@/hooks/use-toast";
import ContactDialog from "@/components/Contact";

function Landing() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const endpoint = isLogin ? "/api/login" : "/api/signup";
    const payload = isLogin
      ? { email, password }
      : { email, password, username };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Submitted successfully!",
          description: data.message,
        });
        // Here you might want to redirect the user or update the app state
      } else {
        toast({
          title: "Whoops!",
          description: data.message || "Failed to send responses.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Whoops!",
        description: "Failed to send responses.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-6">
      <div className="text-center">
        <h1 className="text-5xl flex items-center justify-center font-logo font-bold tracking-wide">
          tskd.
        </h1>
        <p className="text-muted-foreground">
          Understand your productivity, not just your tasks.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <div className="space-y-2">
            <Label className="flex items-center">
              <User className="mr-2 text-muted-foreground w-5" />
              <span>Username</span>
            </Label>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              required={!isLogin}
            />
          </div>
        )}

        <div className="space-y-2">
          <Label className="flex items-center">
            <Mail className="mr-2 text-muted-foreground w-5" />
            <span>Email</span>
          </Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center">
            <Lock className="mr-2 text-muted-foreground w-5" />
            <span>Password</span>
          </Label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Processing..." : isLogin ? "Log In" : "Sign Up"}
          {!isLoading && <ArrowRight className="ml-2" />}
        </Button>

        <div className="text-center">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-primary hover:underline"
          >
            {isLogin
              ? "Don't have an account? Sign Up"
              : "Already have an account? Log In"}
          </button>
        </div>
      </form>

      <div className="text-center text-xs text-muted-foreground">
        By continuing, you agree to our{" "}
        <Link to="/tos" className="underline">
          terms of service
        </Link>{" "}
        and{" "}
        <Link to="/prp" className="underline">
          privacy policy
        </Link>
        . For any furthur inquiries,{" "}
        <ContactDialog
          child={<span className="underline cursor-pointer">contact us</span>}
        />
        .
      </div>
    </div>
  );
}

export default Landing;
