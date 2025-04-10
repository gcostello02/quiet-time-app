import React, { useEffect, useState } from "react";
import { UserAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import { supabase } from "../supabaseClient";

const Dashboard = () => {
  const { session } = UserAuth();
  const userId = session.user.id;

  const [totalQuietTimes, setTotalQuietTimes] = useState(0);
  const [mostReadBook, setMostReadBook] = useState("");
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      const { count: total } = await supabase
        .from("notes")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
      setTotalQuietTimes(total || 0)

      const { data: bookData } = await supabase
        .from("note_references")
        .select("book, notes!inner(user_id)")
        .eq("notes.user_id", userId);

      if (bookData) {
        const bookCounts = bookData.reduce((acc, ref) => {
          acc[ref.book] = (acc[ref.book] || 0) + 1;
          return acc;
        }, {});
        const topBook = Object.entries(bookCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
        setMostReadBook(topBook || "N/A");
      }

      const { data: dateData } = await supabase
        .from("notes")
        .select("created_at")
        .eq("user_id", userId);

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
  }, [userId])

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Navbar />
      <div className="max-w-5xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome to TAWG!</h1>
        </div>


        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
            <h3 className="text-md font-semibold text-gray-800 dark:text-white">🔥 Quiet time streak:</h3>
            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{streak} days</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
            <h3 className="text-md font-semibold text-gray-800 dark:text-white">Total Quiet Times:</h3>
            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{totalQuietTimes} days</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
            <h3 className="text-md font-semibold text-gray-800 dark:text-white">Most Read Book:</h3>
            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{mostReadBook}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">About This App</h2>
          <p className="text-gray-700 dark:text-gray-300">
            <strong>TWAG</strong>, or <strong>T</strong>ime <strong>A</strong>lone <strong>W</strong>ith <strong>G</strong>od is...
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow mb-6">
          
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
            <h3 className="text-2xl font-semibold text-gray-800 dark:text-white">The Bible is...</h3>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
            
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
            <img
              src="/src/assets/references.jpg"
              alt="Graph showing quiet time activity"
              className="w-full rounded"
            />
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Bible References:</h3>
            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">klnslk</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;