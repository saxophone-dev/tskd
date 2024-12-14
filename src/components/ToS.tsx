"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function TermsOfService({ child }: { child: React.ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>{child}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto" aria-describedby="terms-dialog-description">
        <DialogHeader>
          <DialogTitle className="text-4xl font-logo">
            terms of service.
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p>Last updated: Dec 14, 2024</p>

          <section>
            <h2 className="text-lg font-semibold">1. Using the App</h2>
            <p>
              You must provide a valid email and password to create an account.
              Keep your credentials secure, as we are not responsible for
              unauthorized account access caused by user negligence.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">2. Local Data Processing</h2>
            <p>
              All your todo data is processed locally on your device. We do not
              store or access your tasks, timings, or other related data on our
              servers.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">3. Notifications</h2>
            <p>
              The app uses notifications to remind you of tasks. You can disable
              these notifications at any time in your device settings.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">
              4. Limitation of Liability
            </h2>
            <p>
              The app is provided "as is." We are not responsible for any loss
              or damage resulting from its use, including missed tasks or
              productivity outcomes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">5. Governing Law</h2>
            <p>
              These terms are governed by the laws of India. Any disputes must
              be resolved under Indian jurisdiction.
            </p>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
