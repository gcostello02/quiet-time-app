import React, { useState, useEffect } from "react";
import { UserAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

const ProfilePage = () => {
  const { profile } = UserAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      setLoading(false);
      console.log("Profile", profile)
    }
  }, [profile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex justify-center items-center">
        <div className="spinner-border animate-spin h-8 w-8 border-4 border-t-transparent border-blue-500 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Navbar />
      <div className="max-w-4xl mx-auto mt-10 p-6 bg-white dark:bg-gray-800 shadow-md rounded-lg">
        <div className="flex items-center space-x-6">
          <img 
            src={profile.avatar_url || "https://www.nicepng.com/png/detail/933-9332131_profile-picture-default-png.png"} 
            alt="Profile Avatar" 
            className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-gray-300 dark:border-gray-600" 
          />

          <div className="flex-1">
            <div className="flex items-center space-x-4">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-200">
                {profile.username || "Username"}
              </h2>
              <Link 
                to="/edit-profile" 
                className="border border-gray-300 dark:border-gray-500 px-4 py-1 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Edit Profile
              </Link>
            </div>

            {profile.name.length > 0 ? (
              <h4 className="text-md font-semibold text-gray-900 dark:text-gray-200">
                {profile.name}
              </h4>
            ) : null}

            <div className="mt-3">
              <p className="text-sm text-gray-500 dark:text-gray-400">Bio</p>
              <p className="text-gray-700 dark:text-gray-300">
                {profile.description || "No description yet."}
              </p>
            </div>

            <div className="mt-3">
              <p className="text-sm text-gray-500 dark:text-gray-400">Prayer Request</p>
              <p className="text-gray-700 dark:text-gray-300">
                {profile.prayer_req_display ? profile.prayer_req || "No request" : "Hidden"}
              </p>
          </div>
          </div>
        </div>

        <div className="mt-6 flex justify-around text-center border-t pt-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">QT Streak</p>
            <p className="text-lg font-semibold">{profile.streak ? profile.streak : 0}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Favorite Verse</p>
            <p className="text-lg font-semibold">
              {profile.life_verse_display 
                ? `${profile.life_verse_book} ${profile.life_verse_chapter}:${profile.life_verse_start}${profile.life_verse_start !== profile.life_verse_end ? `-${profile.life_verse_end}` : ""}` : "None"}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200">Posts</h3>
          <p className="text-gray-500 dark:text-gray-400">Coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
