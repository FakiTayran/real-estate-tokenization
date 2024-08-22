import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Web3ModalProvider } from "./config/wagmiConfig.tsx";
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Web3ModalProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Web3ModalProvider>
  </StrictMode>
);
