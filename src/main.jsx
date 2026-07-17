import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import UpdatePrompt from "./components/UpdatePrompt.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
      <UpdatePrompt />
    </ErrorBoundary>
  </StrictMode>,
);
