import React, { useEffect } from "react";
import { UserAuth } from "../context/AuthContext";
import { supabase } from "../supabaseClient";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";

const ProfilePage = () => {
  const { profile, setProfile, session } = UserAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      if (session?.user?.id) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (data) setProfile(data);
      }
    };

    fetchProfile();
  }, [session]);

  return (
    <div>
      <Navbar />
      <div className="max-w-3xl mx-auto mt-10 p-6 bg-white dark:bg-gray-900 shadow-md rounded-lg">
        <div className="flex items-center space-x-8">
          <img 
            src={profile?.avatar_url || "https://via.placeholder.com/150"} 
            alt="Profile Avatar" 
            className="w-32 h-32 rounded-full border-4 border-gray-300" 
          />

          <div className="flex-1">
            <div className="flex items-center space-x-4">
              <h2 className="text-2xl font-semibold">{profile?.username || "Username"}</h2>
              <Link to="/edit-profile" className="border px-4 py-1 rounded-lg text-sm font-medium hover:bg-gray-100">
                Edit Profile
              </Link>
            </div>

            <p className="mt-4 text-gray-700">{profile?.description || "No description yet."}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
