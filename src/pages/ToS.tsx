"use client";

import { Link } from "react-router";

export default function TermsOfService() {
  return (
    <div className="max-w-2xl p-6 space-y-4 mx-5 text-center sm:mx-20 sm:text-left">
      <h1 className="text-5xl font-logo font-bold text-center mt-5">
        terms of service
      </h1>
      <h2 className="text-xl font-bold">Welcome to tskd!</h2>
      <p>
        By using our app, you agree to the terms outlined below. If you don’t
        agree, please don’t use the app.
        <sub className="ml-1 text-[11px]">what'd you expect?</sub>
      </p>
      <h3 className="font-semibold text-lg text-center sm:text-left">
        1. Using the App
      </h3>
      <p>
        You must provide a valid email and password to create an account. Keep
        your credentials secure, as we are not responsible for unauthorized
        account access caused by user negligence.
      </p>
      <h3 className="font-semibold text-lg text-center sm:text-left">
        2. Local Data Processing
      </h3>
      <p>
        All your todo data is processed locally on your device. We do not store
        or access your tasks, timings, or other related data on our servers.
      </p>
      <h3 className="font-semibold text-lg text-center sm:text-left">
        3. Notifications
      </h3>
      <p>
        The app uses notifications to remind you of tasks. You can disable these
        notifications at any time in your device settings.
      </p>
      <h3 className="font-semibold text-lg text-center sm:text-left">
        4. Limitation of Liability
      </h3>
      <p>
        The app is provided "as is." We are not responsible for any loss or
        damage resulting from its use, including missed tasks or productivity
        outcomes.
      </p>
      <h3 className="font-semibold text-lg text-center sm:text-left">
        5. Governing Law
      </h3>
      <p>
        These terms are governed by the laws of India. Any disputes must be
        resolved under Indian jurisdiction.
      </p>{" "}
      <div className="font-bold text-center dark:text-blue-400 text-blue-700">
        <Link to="/">Go back?</Link>
      </div>
    </div>
  );
}
