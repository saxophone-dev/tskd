"use client";

import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router";
import App from "@/App";
import "@/index.css";
import { Toaster } from "@/components/ui/toaster";
import "@fontsource/geist-sans/latin.css";
import "@fontsource/alkalami/latin.css";
import "@fontsource-variable/inter";

const root = document.getElementById("root");

// @ts-ignore
ReactDOM.createRoot(root).render(
  <BrowserRouter>
    <div className="flex min-w-screen min-h-screen">
      <App />
      <Toaster />
    </div>
  </BrowserRouter>,
);
