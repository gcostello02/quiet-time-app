import React from "react";
import { useNavigate } from "react-router-dom";
import { UserAuth } from "../context/AuthContext";
import Navbar from "./Navbar";

const Dashboard = () => {
  const { session, signOut } = UserAuth();
  const navigate = useNavigate();

  const handleSignOut = async (e) => {
    e.preventDefault();

    try {
      await signOut();
      navigate("/");
    } catch (err) {
      console.log("An unexpected error occurred ", err);
    }
  };
  console.log(session);
  return (
    <div>
      <Navbar />
      <div className="container mx-auto mt-1">
        <h1>Dashboard</h1>
        <h2>Welcome, {session?.user?.email}</h2>
        <div>
          <p
            onClick={handleSignOut}
            className="hover:cursor-pointer border inline-block px-4 py-3 mt-4 "
          >
            Sign out
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;