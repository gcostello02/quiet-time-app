import React, { useState, useEffect } from "react";
import { UserAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { supabase } from "../supabaseClient";

const ProfilePage = () => {
  const { session, profile } = UserAuth();
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (profile) {
      setLoading(false);
      console.log("Profile", profile)
    }

    const fetchStats = async () => {
      const { data: dateData } = await supabase
        .from("notes")
        .select("created_at")
        .eq("user_id", session.user.id);

      if (dateData) {
        console.log(dateData)

        const dates = dateData
          .map((n) => new Date(n.created_at).toLocaleDateString("en-CA"))
          .sort((a, b) => (a > b ? -1 : 1));
        
        console.log(dates)

        const dateSet = new Set(dates);
        
        const today = new Date();
        const todayStr = today.toISOString().split("T")[0];

        let currentStreak = 0;
        let checkingDate = new Date(today)

        if (!dateSet.has(todayStr)) {
          checkingDate.setDate(checkingDate.getDate() - 1);
        }

        while (true) {
          const dateStr = checkingDate.toISOString().split("T")[0];
          if (dateSet.has(dateStr)) {
            currentStreak++
            checkingDate.setDate(checkingDate.getDate() - 1)
          } else {
            break
          }
        }

        setStreak(currentStreak);
      }
    }

    fetchStats()
  }, [profile, session.user.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex justify-center items-center">
        <div className="spinner-border animate-spin h-8 w-8 border-4 border-t-transparent border-indigo-600 rounded-full"></div>
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
                className="border border-gray-300 dark:border-gray-500 px-4 py-1 rounded-lg text-sm font-medium text-indigo-600 visited:text-indigo-600 hover:bg-gray-100 dark:hover:bg-gray-700"
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
                {profile.prayer_req_display ? profile.prayer_req : "None"}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-around text-center border-t pt-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Favorite Verse</p>
            <p className="text-lg font-semibold">
              {profile.life_verse_display 
                ? `${profile.life_verse_book} ${profile.life_verse_chapter}:${profile.life_verse_start}${profile.life_verse_start !== profile.life_verse_end ? `-${profile.life_verse_end}` : ""}` : "None"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">TAWG Streak</p>
            <p className="text-lg font-semibold">{streak}</p>
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
