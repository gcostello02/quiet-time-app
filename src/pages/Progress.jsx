import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import bibleChapters from "../data/Chapters.json";
import { UserAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

const Progress = () => {
  const { session } = UserAuth();
  // eslint-disable-next-line no-unused-vars
  const [references, setReferences] = useState([]);
  const [progressByBook, setProgressByBook] = useState({});
  const [overallProgress, setOverallProgress] = useState(0);

  useEffect(() => {
    const fetchReferences = async () => {
      const { data, error } = await supabase
        .from("notes")
        .select("note_references(book, chapter)")
        .eq("user_id", session.user.id);

      if (error) {
        console.error("Error fetching references", error);
        return;
      }

      const allRefs = data.flatMap(note => note.note_references || []);
      setReferences(allRefs);

      const progress = {};
      const seen = new Set();

      allRefs.forEach(({ book, chapter }) => {
        if (!progress[book]) progress[book] = new Set();
        progress[book].add(chapter);
        seen.add(`${book}-${chapter}`);
      });

      setProgressByBook(progress);

      const totalChapters = Object.values(bibleChapters).reduce((a, b) => a + b, 0);
      const readChapters = seen.size;
      setOverallProgress(((readChapters / totalChapters) * 100).toFixed(2));
    };

    if (session?.user?.id) {
      fetchReferences();
    }
  }, [session]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">      
      <Navbar />
      <main className="flex-grow">
        <div className="max-w-5xl mx-auto p-6 space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4 text-gray-900">Bible Reading Progress</h1>
            <p className="text-2xl font-semibold text-gray-900">You've read <span className="font-semibold">{overallProgress}%</span> of the Bible using TAWG!!</p>
            <div className="w-full max-w-xl mx-auto h-4 bg-gray-300 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 transition-all duration-500"
                style={{ width: `${overallProgress}%` }}
              ></div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(bibleChapters).map(([book, total]) => {
              const readChapters = progressByBook[book]?.size || 0;
              const rawPercent = (readChapters / total) * 100;
              const percent = Number.isInteger(rawPercent) ? rawPercent : rawPercent.toFixed(1);
              return (
                <div key={book} className="bg-white rounded-xl shadow p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-semibold">{book.replace(/_/g, " ")}</h2>
                    <span className="text-lg font-semibold text-gray-600">{percent}% read</span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mb-3">
                    <div
                      className="h-full bg-indigo-600 transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: total }, (_, i) => {
                      const chapter = i + 1;
                      const isRead = progressByBook[book]?.has(chapter);
                      return (
                        <div
                          key={chapter}
                          className={`w-8 h-8 flex items-center justify-center text-sm rounded-full border ${
                            isRead ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {chapter}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Progress;
