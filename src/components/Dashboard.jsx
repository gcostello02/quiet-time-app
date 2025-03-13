import React from "react";
import { UserAuth } from "../context/AuthContext";
import Navbar from "./Navbar";

const Dashboard = () => {
  
  return (
    <div>
      <Navbar />
      <div className="container mx-auto mt-1">
        <h2>Dashboard</h2>
      </div>
    </div>
  );
};

export default Dashboard;