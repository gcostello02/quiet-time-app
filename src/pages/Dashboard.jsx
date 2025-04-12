import React, { useEffect, useState } from "react";
import { UserAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import { supabase } from "../supabaseClient";
import { BookOpenIcon, FireIcon, LinkIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";

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
        .eq("user_id", userId);
      setTotalQuietTimes(total || 0);

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
        const dates = dateData.map(n => new Date(n.created_at));
        const today = new Date(); 
        const todayStr = today.toISOString().split("T")[0]; 

        const dateSet = new Set(dates.map(date => date.toLocaleDateString("en-CA")));

        let currentStreak = 0;
        let checkingDate = new Date(today);

        if (!dateSet.has(todayStr)) {
          checkingDate.setDate(checkingDate.getDate() - 1);
        }

        while (true) {
          const dateStr = checkingDate.toLocaleDateString("en-CA");
          if (dateSet.has(dateStr)) {
            currentStreak++;
            checkingDate.setDate(checkingDate.getDate() - 1);
          } else {
            break;
          }
        }

        setStreak(currentStreak);
      }
    };

    fetchStats();
  }, [userId]);

  // eslint-disable-next-line no-unused-vars
  const StatCard = ({ icon: Icon, title, value }) => (
    <div className="flex items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
      <Icon className="h-8 w-8 text-indigo-500" />
      <div>
        <h4 className="text-md font-semibold text-gray-700 dark:text-white">{title}</h4>
        <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{value}</p>
      </div>
    </div>
  );

  const LinkList = ({ title, links }) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
      <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">{title}</h3>
      <ul className="list-disc list-inside space-y-1">
        {links.map((link, idx) => {
          const isInternal = link.href.startsWith("/");
  
          return (
            <li key={idx}>
              {isInternal ? (
                <Link
                  to={link.href}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
                >
                  <LinkIcon className="h-4 w-4" />
                  {link.label}
                </Link>
              ) : (
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
                >
                  <LinkIcon className="h-4 w-4" />
                  {link.label}
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Navbar />
      <div className="max-w-5xl mx-auto p-6 space-y-8">
        <div>
          <h1 className="text-4xl text-center font-bold text-gray-900 dark:text-white mb-2">Welcome to TAWG!</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatCard icon={FireIcon} title="TAWG Streak" value={`${streak} days`} />
          <StatCard icon={SparklesIcon} title="Total TAWGs" value={`${totalQuietTimes} days`} />
          <StatCard icon={BookOpenIcon} title="Most Read Book" value={mostReadBook} />
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">About This App</h2>
          <p className="text-gray-700 dark:text-gray-300">
            <strong>TAWG</strong> (<strong>T</strong>ime <strong>A</strong>lone <strong>W</strong>ith <strong>G</strong>od) is a way to intentionally slow down and connect with God daily through Scripture, prayer, and reflection.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <LinkList
            title="📖 Reading Plans"
            links={[
              { label: "40 Day Getting Started Plan", href: "/plan" },
              { label: "Bible in a Year Plan", href: "https://www.biblica.com/resources/reading-plans/" },
            ]}
          />
          <LinkList
            title="📚 Resources"
            links={[
              { label: "How to do TAWG", href: "/howto" },
              { label: "Got Questions", href: "https://www.gotquestions.org/" },
              { label: "Enduring Word Commentary", href: "https://enduringword.com/bible-commentary/" },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Why We Can Trust the Bible:</h3>
            <div>
              <p className="font-semibold">📜 Historically Accurate</p>
              <p className="text-gray-700 dark:text-gray-300">
                2 Peter 1:16 - For we did not follow cleverly devised myths when we made known to you the power and coming of our Lord Jesus Christ, but we were eyewitnesses of his majesty.
              </p>
            </div>
            <div>
              <p className="font-semibold">🔗 Internally Consistent</p>
              <p className="text-gray-700 dark:text-gray-300">
                63,779 cross-references in the graph show how the Bible is 66 books written by 40 authors, but is one story because each writer was inspired by the Holy Spirit.
              </p>
            </div>
            <div>
              <p className="font-semibold">🔮 Prophetically Accurate</p>
              <p className="text-gray-700 dark:text-gray-300">
                2 Peter 1:21 - For no prophecy was ever produced by the will of man, but men spoke from God as they were carried along by the Holy Spirit.
              </p>
            </div>
            <div>
              <p className="font-semibold">🙌 Jesus Approved</p>
              <p className="text-gray-700 dark:text-gray-300">
                Romans 10:17 - So faith comes from hearing, and hearing through the word of Christ.
              </p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Graph of Bible Cross References:</h3>
            <img
              src="/src/assets/references.jpg"
              alt="Bible cross reference visualization"
              className="w-full rounded"
            />
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              This visualization depicts Bible chapters with alternating light and dark gray bars, starting with Genesis 1 on the left. White bars mark the first chapters of the Old and New Testaments. Bar lengths represent verse counts, with Psalm 119 being the longest. The 63,779 cross references are shown as colored arcs, creating a rainbow effect based on chapter distance.
            </p>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              Graph from{" "}
              <a
                href="https://www.chrisharrison.net/index.php/Visualizations/BibleViz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
              >
                Chris Harrison
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
