"use client";

import { Link } from "react-router";

export default function TermsOfService() {
  return (
    <div className="max-w-2xl p-6 space-y-4 mx-5 text-center sm:mx-20 sm:text-left">
      <h1 className="text-5xl font-logo font-bold text-center mt-5">
        privacy policy
      </h1>
      <h2 className="text-xl font-bold">"Where's my data going?"</h2>
      <p>
        At tskd, we prioritize your privacy. Here’s how we handle your
        information responsibly and transparently.
      </p>
      <h3 className="font-semibold text-lg text-center sm:text-left">
        1. Data we collect
      </h3>
      <p>
        We collect only your email and password for account creation and login
        purposes. No additional personal or task-related data is stored on our
        servers.
      </p>
      <h3 className="font-semibold text-lg text-center sm:text-left">
        2. Local Data Storage
      </h3>
      <p>
        Your todo data, including tasks, timings, and completion history, is
        stored locally on your device using localStorage. You can encrypt this
        data for extra security, but this is entirely under your control.
      </p>
      <h3 className="font-semibold text-lg text-center sm:text-left">
        3. Data sharing
      </h3>
      <p>
        We do not share your data with any third parties. All information
        remains securely on your device.
      </p>
      <h3 className="font-semibold text-lg text-center sm:text-left">
        4. Notifications
      </h3>
      <p>
        The app may send notifications to remind you of tasks. These can be
        managed or disabled anytime through your device settings.
      </p>
      <h3 className="font-semibold text-lg text-center sm:text-left">
        5. Governing Law
      </h3>
      <p>
        This privacy policy is governed by the laws of India. By using the app,
        you agree to these terms and the jurisdiction of Indian law.
      </p>{" "}
      <div className="font-bold text-center dark:text-blue-400 text-blue-700">
        <Link to="/">Go back?</Link>
      </div>
    </div>
  );
}
