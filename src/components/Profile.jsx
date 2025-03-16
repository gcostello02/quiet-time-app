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
      <div className="max-w-lg mx-auto mt-10 bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
        <img src={profile?.avatar_url} alt="Profile Avatar" className="w-24 h-24 rounded-full mx-auto" />
        <h2 className="text-xl text-center font-semibold mt-4">{profile?.username}</h2>
        <p className="text-center text-gray-600 mt-2">{profile?.description || "No description yet."}</p>
        <div className="mt-4 text-center">
          <Link to="/edit-profile" className="text-blue-500 hover:underline">Edit Profile</Link>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
