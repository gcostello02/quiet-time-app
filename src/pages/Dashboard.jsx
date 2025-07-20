import React, { useEffect, useState } from "react";
import { UserAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { supabase } from "../supabaseClient";
import { BookOpenIcon, FireIcon, LinkIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { session } = UserAuth();

  const [totalQuietTimes, setTotalQuietTimes] = useState(0);
  const [mostReadBook, setMostReadBook] = useState("");
  const [streak, setStreak] = useState(0)

  const [today, setToday] = useState(true)
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)

      const { count: total } = await supabase
        .from("notes")
        .select("*", { count: "exact", head: true })
        .eq("user_id", session?.user?.id);
      setTotalQuietTimes(total || 0);

      const { data: bookData } = await supabase
        .from("note_references")
        .select("book, notes!inner(user_id)")
        .eq("notes.user_id", session?.user?.id);

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
        .eq("user_id", session?.user?.id);

      if (dateData) {
        const dates = dateData.map(n => new Date(n.created_at));
        const today = new Date(); 
        const todayStr = today.toLocaleDateString(); 

        const dateSet = new Set(dates.map(date => date.toLocaleDateString()));

        let currentStreak = 0;
        let checkingDate = new Date(today);

        if (!dateSet.has(todayStr)) {
          checkingDate.setDate(checkingDate.getDate() - 1);
          setToday(false)
        }
        else {
          setToday(true)
        }

        while (true) {
          const dateStr = checkingDate.toLocaleDateString();
          if (dateSet.has(dateStr)) {
            currentStreak++;
            checkingDate.setDate(checkingDate.getDate() - 1);
          } else {
            break;
          }
        }

        setStreak(currentStreak);
        setLoading(false)
      }
    };

    if (session?.user?.id) {
      fetchStats();
    }

  }, [session?.user?.id]);

  // eslint-disable-next-line no-unused-vars
  const StatCard = ({ icon: Icon, title, value }) => (
    <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow">
      <Icon className="h-8 w-8 text-indigo-500" />
      <div>
        <h4 className="text-md font-semibold text-gray-700">{title}</h4>
        {loading ? (
          <div className="flex justify-center items-center mt-1">
            <div className="h-6 w-6 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) :  (
          <p className="text-xl font-bold text-indigo-600">{value}</p>
        )}
      </div>
    </div>
  );

  const LinkList = ({ title, links }) => (
    <div className="bg-white p-4 rounded-xl shadow">
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
      <ul className="list-disc list-inside space-y-1">
        {links.map((link, idx) => {
          const isInternal = link.href.startsWith("/");
  
          return (
            <li key={idx} className="text-gray-900">
              {isInternal ? (
                <Link
                  to={link.href}
                  className="text-indigo-600 hover:underline inline-flex items-center gap-1"
                >
                  <LinkIcon className="h-4 w-4" />
                  {link.label}
                </Link>
              ) : (
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline inline-flex items-center gap-1"
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
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="max-w-5xl mx-auto p-6 space-y-8">
          <div>
            <h1 className="text-4xl text-center font-bold text-gray-900">Welcome to TAWG!</h1>
          </div>

          {session?.user?.id && (
            <>
              {!today && (
                <div className="bg-white p-6 rounded-xl shadow">
                  <h2 className="text-center text-3xl font-bold text-gray-900 mb-2">
                    🚨 It Looks Like You Haven't Done Your TAWG Yet 🚨
                  </h2>
                  <p className="text-center font-bold text-gray-700">
                    Click the button and do it right now!
                  </p>
                  <div className="flex justify-center mt-4">
                    <button
                      onClick={() => navigate("/tawg")}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md shadow-md"
                    >
                      Let's Go
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <StatCard icon={FireIcon} title="TAWG Streak" value={`${streak} days`} />
                <StatCard icon={SparklesIcon} title="Total TAWGs" value={`${totalQuietTimes} days`} />
                <StatCard icon={BookOpenIcon} title="Most Read Book" value={mostReadBook} />
              </div>
            </>
          )}

          {!session?.user?.id && (
            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-center text-3xl font-bold text-gray-900 mb-2">
                🚨 It Looks Like You Aren't Logged In 🚨
              </h2>
              <p className="text-center font-bold text-gray-700">
                Please sign-in to experience the full functionality of TAWG!
              </p>
              <div className="flex justify-center mt-4 gap-4">
                <button
                  onClick={() => navigate("/signin")}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md shadow-md"
                >
                  Sign In!
                </button>
                <button
                  onClick={() => navigate("/signup")}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md shadow-md"
                >
                  Sign Up!
                </button>
              </div>
            </div>
          )}

          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">About TAWG</h2>
            <p className="text-gray-700">
              <strong>TAWG</strong> (<strong>T</strong>ime <strong>A</strong>lone <strong>W</strong>ith <strong>G</strong>od) is a way to intentionally slow down and connect with God daily through Scripture, prayer, and reflection. 
              As believers we are called to spend time in God's word. Psalm 1:1-2 says: "Blessed is the man who walks not in the counsel of the wicked, nor stands in the way of sinners, nor sits in the seat of scoffers; 
              but his delight is in the law of the Lord, and on his law he meditates day and night."
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">📊 Track Your Bible Reading</h2>
            <p className="text-gray-700 mb-4">
              See how much of the Bible you've read and track your progress book by book!
            </p>
            <button
              onClick={() => navigate("/progress")}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700"
            >
              View Bible Progress
            </button>
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
                { label: "Enduring Word Commentary", href: "https://enduringword.com/#commentary" },
                { label: "Conquering the Summer Guide", href: "https://docs.google.com/document/d/1QfTpVVRfp9lHQJhRdvOi1d0ubiK-3AbAUf5YSi7fQ_0/edit?usp=sharing" }
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow space-y-4">
              <h3 className="text-xl font-semibold text-gray-800">Why We Can Trust the Bible:</h3>
              <div>
                <p className="font-semibold text-gray-900">📜 Historically Accurate</p>
                <p className="text-gray-700">
                  2 Peter 1:16 - "For we did not follow cleverly devised myths when we made known to you the power and coming of our Lord Jesus Christ, but we were eyewitnesses of his majesty."
                </p>
              </div>
              <div>
                <p className="font-semibold text-gray-900">🔗 Internally Consistent</p>
                <p className="text-gray-700">
                  There are 63,779 cross-references as seen in the graph on the right, which shows that though the Bible is 66 books with 40 authors, it is one story inspired by the Holy Spirit.
                </p>
              </div>
              <div>
                <p className="font-semibold text-gray-900">🔮 Prophetically Accurate</p>
                <p className="text-gray-700">
                  2 Peter 1:21 - "For no prophecy was ever produced by the will of man, but men spoke from God as they were carried along by the Holy Spirit."
                </p>
              </div>
              <div>
                <p className="font-semibold text-gray-900">🙌 Jesus Approved</p>
                <p className="text-gray-700">
                  Romans 10:17 - "So faith comes from hearing, and hearing through the word of Christ."
                </p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Graph of Bible Cross References:</h3>
              <img
                src="https://fkyfymxgbyyznrctanvs.supabase.co/storage/v1/object/public/profile-pictures/avatars/references.jpg"
                alt="Bible cross reference visualization"
                className="w-full rounded"
              />
              <p className="mt-2 text-center text-sm text-gray-600">
                This visualization depicts Bible chapters with alternating light and dark gray bars, starting with Genesis 1 on the left. White bars mark the first chapters of the Old and New Testaments. Bar lengths represent verse counts, with Psalm 119 being the longest. The 63,779 cross references are shown as colored arcs, creating a rainbow effect based on chapter distance.
              </p>
              <p className="mt-2 text-center text-sm text-gray-600">
                Graph from{" "}
                <a
                  href="https://www.chrisharrison.net/index.php/Visualizations/BibleViz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline inline-flex items-center gap-1"
                >
                  Chris Harrison
                </a>
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
