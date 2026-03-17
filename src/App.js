import React from "react";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes";
import { PosProvider } from "./state/posStore";

export default function App() {
  return (
    <PosProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </PosProvider>
  );
}

