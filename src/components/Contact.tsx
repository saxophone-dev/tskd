"use client";
import { useState } from "react";
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
  DialogTrigger 
} from "@/components/ui/dialog";

export function ContactDialog({ child }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

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
        toast({
          title: "Your feedback has been sent!",
          description: "Thank you so much for contacting us!",
        });
        setEmail("");
        setMessage("");
        setIsDialogOpen(false);
      } else {
        toast({
          title: "Whoops!",
          description: data.message || "Failed to send feedback.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Whoops!",
        description: "An error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        { child }
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Contact Us</DialogTitle>
          <DialogDescription>
            We'd love to hear from you! Reach out via email or send us your feedback.
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
      </DialogContent>
    </Dialog>
  );
}

export default ContactDialog;
