import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MiniKitProvider } from "@worldcoin/minikit-js/minikit-provider";
import { isWorldApp } from "@/src/utils";
import App from "./App";
import "./index.css";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

const AppWithProviders = () => {
  if (isWorldApp()) {
    return (
      <MiniKitProvider>
        <App />
      </MiniKitProvider>
    );
  }
  return <App />;
};

createRoot(rootElement).render(
  <StrictMode>
    <AppWithProviders />
  </StrictMode>,
);
