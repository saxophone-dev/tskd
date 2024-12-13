"use client";

import { ThemeProvider } from "@/components/theme-provider";
import { Routes, Route } from "react-router";
import Landing from "@/pages/Landing";
import TermsOfService from "@/pages/ToS";
import PrivacyPolicy from "@/pages/PriPol";
import NotFound from "@/pages/NotFound";

function Home() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="flex items-center justify-center bg-background mx-auto w-screen">
        <Routes>
          <Route path="*" element={<NotFound />} />
          <Route index element={<Landing />} />
          <Route path="/tos" element={<TermsOfService />} />
          <Route path="/prp" element={<PrivacyPolicy />} />
        </Routes>
      </div>
    </ThemeProvider>
  );
}

export default Home;
