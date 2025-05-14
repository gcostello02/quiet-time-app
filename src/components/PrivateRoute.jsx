import React from "react";
import { UserAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const { session } = UserAuth();

  if (session === undefined) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
        <main className="flex-grow">
          <div className="flex justify-center items-center mt-10">
            <div className="spinner-border animate-spin h-8 w-8 border-4 border-t-transparent border-indigo-600 rounded-full"></div>
          </div>
        </main>
      </div>
    );
  }

  return <div>{session ? <>{children}</> : <Navigate to="/signin" />}</div>;
};

export default PrivateRoute;