"use client";

import { useState, FormEvent, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";

// Define types for the API response and error
interface FeedbackResponse {
  recieved: {
    email: string;
    message: string;
  };
}

interface FeedbackPayload {
  email: string;
  message: string;
}

interface ContactDialogProps {
  child: ReactNode;
  apiEndpoint?: string;
}

export function ContactDialog({
  child,
  apiEndpoint = "https://tskd.onrender.com/api/feedback",
}: ContactDialogProps) {
  const [email, setEmail] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const { toast } = useToast();

  const validateEmail = (emailToValidate: string): boolean => {
    const emailRegex =
      /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/i;
    return emailRegex.test(emailToValidate);
  };

  const handleFeedbackSubmit = async (
    e: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();

    // Email validation
    if (!validateEmail(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    // Message length validation
    if (message.trim().length < 10) {
      toast({
        title: "Message Too Short",
        description:
          "Please provide a more detailed message (minimum 10 characters).",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const payload: FeedbackPayload = { email, message };

      const response: Response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data: FeedbackResponse = await response.json();

      console.log(data);

      if (response.ok) {
        toast({
          title: "Your feedback has been sent!",
          description: "Thank you so much for contacting us!",
        });

        // Reset form state
        setEmail("");
        setMessage("");
        setIsDialogOpen(false);
      } else {
        toast({
          title: "Whoops!",
          description: "Failed to send feedback.",
          variant: "destructive",
        });
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";

      toast({
        title: "Whoops!",
        description: `An error occurred: ${errorMessage}. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>{child}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-4xl font-logo">contact us.</DialogTitle>
          <DialogDescription>
            We'd love to hear from you! Reach out via email or send us your
            feedback.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleFeedbackSubmit} className="space-y-4">
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
              autoComplete="email"
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
              minLength={10}
              maxLength={500}
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={
              isLoading || !validateEmail(email) || message.trim().length < 10
            }
          >
            {isLoading ? "Sending..." : "Send Feedback"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default ContactDialog;
