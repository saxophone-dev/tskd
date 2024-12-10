"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, MessageCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";

function Contact() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("https://tskd.onrender.com/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, message }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Your feedback has been sent!");
        setEmail("");
        setMessage("");
      } else {
        toast.error(data.message || "Failed to send feedback.");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-6">
      <div className="text-center">
        <h1 className="text-5xl flex items-center justify-center font-logo font-bold tracking-wide">
          contact us
        </h1>
        <p className="text-muted-foreground mt-2">
          We'd love to hear from you! Reach out via email or send us your feedback.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Email Us!</h2>
          <p>
            📧 <a href="mailto:contact@tskd.us.kg" className="underline">contact@tskd.us.kg</a>
          </p>
        </div>

        <form onSubmit={handleFeedbackSubmit} className="space-y-4">
          <h2 className="text-lg font-semibold">Send Feedback</h2>
          <div className="space-y-2">
            <Label className="flex items-center">
              <Mail className="mr-2 text-muted-foreground w-5" />
              <span>Email</span>
            </Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center">
              <MessageCircle className="mr-2 text-muted-foreground w-5" />
              <span>Message</span>
            </Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your feedback or question here"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Sending..." : "Send Feedback"}
          </Button>
        </form>
      </div>

      <div className="text-center text-xs text-muted-foreground">
        Thank you for reaching out! We'll get back to you as soon as possible from <span className="underline">noreply@tskd.us.kg</span>.
      </div>
    </div>
  );
}

export default Contact;

