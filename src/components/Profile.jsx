import React, { useEffect, useState } from "react";
import { UserAuth } from "../context/AuthContext";
import { supabase } from "../supabaseClient";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";

const ProfilePage = () => {
  const { session } = UserAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.user) return;
      
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        setError("Failed to load profile.");
      } else {
        setProfile(data);
      }

      setLoading(false);
    };

    fetchProfile();
  }, [session]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-blue-500 border-solid border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return <p className="text-center mt-10 text-red-500">{error}</p>;
  }

  return (
    <div>
      <Navbar />
      <div className="max-w-lg mx-auto mt-10 bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
        <img
          src={profile?.avatar_url || "https://www.nicepng.com/png/detail/933-9332131_profile-picture-default-png.png"}
          alt="Profile Avatar"
          className="w-24 h-24 rounded-full mx-auto"
        />
        <h2 className="text-xl text-center font-semibold mt-4">{profile?.username || "Unknown User"}</h2>
        <p className="text-center text-gray-600 mt-2 dark:text-gray-300">
          {profile?.description || "No description yet."}
        </p>

        <div className="mt-4 text-center">
          <Link to="/edit-profile" className="text-blue-500 hover:underline dark:text-blue-400">
            Edit Profile
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
