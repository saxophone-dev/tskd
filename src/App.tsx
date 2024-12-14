"use client";

import { ThemeProvider } from "@/components/theme-provider";
import { Routes, Route } from "react-router";
import Landing from "@/pages/Landing";
import NotFound from "@/pages/NotFound";

function Home() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="flex items-center justify-center bg-background mx-auto w-screen">
        <Routes>
          <Route path="*" element={<NotFound />} />
          <Route index element={<Landing />} />
        </Routes>
      </div>
    </ThemeProvider>
  );
}

export default Home;
