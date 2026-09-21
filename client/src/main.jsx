import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import { ClerkProvider } from "@clerk/react";
import { AppProvider } from "./context/AppContext.jsx";

const PUBLIC_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!PUBLIC_KEY) {
  throw new Error(
    "Missing Clerk publishable key. Please set the VITE_CLERK_PUBLISHABLE_KEY environment variable.",
  );
}
createRoot(document.getElementById("root")).render(
  <ClerkProvider publishableKey={PUBLIC_KEY}>
    <BrowserRouter>
      <AppProvider>
        <App />
      </AppProvider>
    </BrowserRouter>
  </ClerkProvider>,
);
