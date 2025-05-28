import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { UserAuth } from "../context/AuthContext"
import { supabase } from "../supabaseClient"
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Accountability = () => {
  const { session } = UserAuth();
  const [loading, setLoading] = useState(true);
  const [friendsData, setFriendsData] = useState([]);

  const fetchFriendIds = async () => {
    const { data: friendsData, error } = await supabase
      .from("friends")
      .select("friend_id")
      .eq("user_id", session.user.id);

    if (error) {
      console.error("Error fetching friends:", error);
      return [];
    }

    return friendsData.map((f) => f.friend_id);
  };

  const fetchFriendProfile = async (id) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      return { username: "Unknown" };
    }

    return data;
  };

  const fetchStreakAndLast7Days = async (id) => {
    const { data: dateData } = await supabase
      .from("notes")
      .select("created_at")
      .eq("user_id", id);

    if (!dateData) return { streak: 0, last7Days: [] };

    const dates = dateData.map((n) => new Date(n.created_at).toDateString());
    const dateSet = new Set(dates);

    const today = new Date();
    let streak = 0;
    let d = new Date(today);

    if (!dateSet.has(d.toDateString())) d.setDate(d.getDate() - 1);

    while (dateSet.has(d.toDateString())) {
      streak++;
      d.setDate(d.getDate() - 1);
    }

    const last7Days = [];
    const tmp = new Date(today);
    for (let i = 6; i >= 0; i--) {
      const checkDate = new Date(tmp);
      checkDate.setDate(checkDate.getDate() - i);
      const label = checkDate.toLocaleDateString("en-US", { weekday: "short" });
      const done = dateSet.has(checkDate.toDateString());
      last7Days.push({ day: label, tawgDone: done });
    }

    return { streak, last7Days };
  };

  useEffect(() => {
    const fetchAll = async () => {
      const friendIds = await fetchFriendIds();
      friendIds.push(session.user.id)
      const allFriends = await Promise.all(
        friendIds.map(async (id) => {
          const { username } = await fetchFriendProfile(id);
          const { streak, last7Days } = await fetchStreakAndLast7Days(id);
          return { id, username, streak, last7Days };
        })
      );
      setFriendsData(allFriends);
      setLoading(false);
    };

    if (session?.user?.id) fetchAll();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <div className="flex justify-center items-center mt-10">
            <div className="spinner-border animate-spin h-8 w-8 border-4 border-t-transparent border-indigo-600 rounded-full"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="max-w-5xl mx-auto p-6 space-y-8">
          <div>
            <h1 className="text-3xl text-center font-bold text-gray-900 mb-4">Accountability Page</h1>
            <p className='text-center text-gray-900 '>If your friend hasn't done their TAWG in a while, you should text and encourage them to do so!</p>
          </div>          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 flex justify-center">
            {friendsData.map((friend) => (
              <div
                key={friend.id}
                className="bg-white p-4 rounded-lg shadow-md space-y-2"
              >
                <Link
                  to={`/profiles/${friend.id}`}
                  key={friend.id}
                > 
                  <p className="text-xl font-bold text-gray-900 hover:text-indigo-600">
                    {friend.username}
                  </p>
                </Link>
                <p className="text-gray-600">Streak: {friend.streak}</p>
                <div className="flex items-center space-x-2">
                  {friend.last7Days.map((day, index) => (
                    <div
                      key={index}
                      className={`w-8 h-8 flex flex-col items-center justify-center rounded-full text-xs font-bold ${
                        day.tawgDone ? "bg-green-500 text-white" : "bg-red-400 text-white"
                      }`}
                      title={day.day}
                    >
                      {day.day[0]}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Accountability;
