import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

function PriPol({ child }: { child: React.ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>{child}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto" aria-describedby="privacypolicy-dialog-description">
        <DialogHeader>
          <DialogTitle className="text-4xl font-logo">
            privacy policy.
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p>Last updated: Dec 14, 2024</p>

          <section>
            <h2 className="text-lg font-semibold">1. Data We Collect</h2>
            <p>
              We collect only your email and password for account creation and
              login purposes. No additional personal or task-related data is
              stored on our servers.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">2. Local Data Storage</h2>
            <p>
              Your todo data, including tasks, timings, and completion history,
              is stored locally on your device using localStorage. You can
              encrypt this data for extra security, but this is entirely under
              your control.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">3. Data Sharing</h2>
            <p>
              We do not share your data with any third parties. All information
              remains securely on your device.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">4. Notifications</h2>
            <p>
              The app may send notifications to remind you of tasks. These can
              be managed or disabled anytime through your device settings.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">5. Governing Law</h2>
            <p>
              This privacy policy is governed by the laws of India. By using the
              app, you agree to these terms and the jurisdiction of Indian law.
            </p>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default PriPol;
