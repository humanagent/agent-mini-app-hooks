import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { ToastProvider } from "./ui/toast";
import { XMTPClientProvider } from "./contexts/xmtp-client-context";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ToastProvider>
      <XMTPClientProvider>
        <App />
      </XMTPClientProvider>
    </ToastProvider>
  </StrictMode>,
);
