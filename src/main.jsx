import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { router } from "./router.jsx";
import { RouterProvider } from "react-router-dom";
import { AuthContextProvider } from "./context/AuthContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <>
      <AuthContextProvider>
        <div className="bg-gray-100 dark:bg-gray-800 min-h-screen">
          <RouterProvider router={router} />
        </div>
      </AuthContextProvider>
    </>
  </StrictMode>
);