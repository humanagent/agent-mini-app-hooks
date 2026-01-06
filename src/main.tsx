import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MiniKitProvider } from "@worldcoin/minikit-js/minikit-provider";
import App from "./App";
import "./index.css";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(
  <StrictMode>
    <MiniKitProvider>
      <App />
    </MiniKitProvider>
  </StrictMode>,
);
