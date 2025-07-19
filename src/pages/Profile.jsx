import React, { useState, useEffect } from "react";
import { UserAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { supabase } from "../supabaseClient";
import Footer from "../components/Footer";
import chaptersData from "../data/Chapters.json";

const ProfilePage = () => {
  const { session, profile } = UserAuth();
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  const [notes, setNotes] = useState([]);
  const [allNotes, setAllNotes] = useState([]); // Store all notes for filtering
  const [visibleCount, setVisibleCount] = useState(9);
  
  // Filter state
  const [selectedBook, setSelectedBook] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("");
  const [availableChapters, setAvailableChapters] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const books = Object.keys(chaptersData);

  useEffect(() => {
    if (profile) {
      setLoading(false);
    }

    const fetchStats = async () => {
      const { data: dateData } = await supabase
        .from("notes")
        .select("created_at")
        .eq("user_id", session.user.id);

      if (dateData) {
        const dates = dateData.map(n => new Date(n.created_at));
        const today = new Date(); 
        const todayStr = today.toLocaleDateString(); 

        const dateSet = new Set(dates.map(date => date.toLocaleDateString()));

        let currentStreak = 0;
        let checkingDate = new Date(today);

        if (!dateSet.has(todayStr)) {
          checkingDate.setDate(checkingDate.getDate() - 1);
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
      }
    };

    const fetchNotes = async () => {
      const { data, error } = await supabase
        .from("notes")
        .select(`
          id,
          title,
          created_at,
          note_references (
            book,
            chapter
          )
        `)
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (!error) {
        setAllNotes(data);
        setNotes(data);
      }
    };

    fetchStats();
    fetchNotes();
  }, [profile, session.user.id]);

  // Update available chapters when book changes
  useEffect(() => {
    if (selectedBook) {
      const chapters = [];
      for (let i = 1; i <= chaptersData[selectedBook]; i++) {
        chapters.push(i);
      }
      setAvailableChapters(chapters);
      setSelectedChapter(""); // Reset chapter when book changes
    } else {
      setAvailableChapters([]);
      setSelectedChapter("");
    }
  }, [selectedBook]);

  // Filter notes when filter changes
  useEffect(() => {
    if (allNotes.length > 0) {
      filterNotes();
    }
  }, [selectedBook, selectedChapter, startDate, endDate, allNotes]);

  const filterNotes = () => {
    let filtered = allNotes;

    // Filter by Bible reference
    if (selectedBook || selectedChapter) {
      filtered = filtered.filter(note => {
        if (!note.note_references || note.note_references.length === 0) {
          return false; // Skip notes without references when filter is active
        }

        return note.note_references.some(ref => {
          const bookMatches = !selectedBook || ref.book === selectedBook;
          const chapterMatches = !selectedChapter || ref.chapter === parseInt(selectedChapter);
          return bookMatches && chapterMatches;
        });
      });
    }

    // Filter by date range
    if (startDate || endDate) {
      filtered = filtered.filter(note => {
        const noteDate = new Date(note.created_at);
        const noteDateStr = noteDate.toISOString().split('T')[0]; // YYYY-MM-DD format
        
        const startMatch = !startDate || noteDateStr >= startDate;
        const endMatch = !endDate || noteDateStr <= endDate;
        
        return startMatch && endMatch;
      });
    }

    setNotes(filtered);
    setVisibleCount(9);
  };

  const clearFilters = () => {
    setSelectedBook("");
    setSelectedChapter("");
    setStartDate("");
    setEndDate("");
  };

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
        <div className="max-w-5xl mx-auto p-6 space-y-8 mt-6">
          <div className="bg-white shadow rounded-xl p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-4 sm:space-y-0">
              <img 
                src={profile.avatar_url || "https://fkyfymxgbyyznrctanvs.supabase.co/storage/v1/object/public/profile-pictures/avatars/default.png"} 
                alt="Profile Avatar" 
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-gray-300 self-center sm:self-auto" 
              />

              <div className="flex-1 w-full min-w-0">
                <h2 className="text-2xl font-semibold text-gray-900 break-words">
                  {profile.username || "Username"}
                </h2>

                {profile.name?.length > 0 && (
                  <h4 className="text-md font-semibold text-gray-900 break-words">
                    {profile.name}
                  </h4>
                )}

                <div className="mt-3 max-w-full overflow-hidden">
                  <p className="text-sm text-gray-500">Bio</p>
                  <p className="text-gray-700 break-words whitespace-pre-wrap">
                    {profile.description || "No description yet."}
                  </p>
                </div>

                <div className="mt-3 max-w-full overflow-hidden">
                  <p className="text-sm text-gray-500">Prayer Request</p>
                  <p className="text-gray-700 break-words whitespace-pre-wrap">
                    {profile.prayer_req_display ? profile.prayer_req : "None"}
                  </p>
                </div>

                <div className="mt-4 flex justify-start">
                  <Link 
                    to="/edit-profile" 
                    className="border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium text-indigo-600 visited:text-indigo-600 hover:bg-gray-100 w-full sm:w-auto text-center"
                  >
                    Edit Profile
                  </Link>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-around text-center border-t pt-4">
              <div>
                <p className="text-sm text-gray-500">Favorite Verse(s)</p>
                <p className="text-lg font-semibold text-gray-900">
                  {profile.life_verse_display 
                    ? `${profile.life_verse_book} ${profile.life_verse_chapter}:${profile.life_verse_start}${profile.life_verse_start !== profile.life_verse_end ? `-${profile.life_verse_end}` : ""}` : "None"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">TAWG Streak</p>
                <p className="text-lg font-semibold text-gray-900">{streak}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Memory Verse(s)</p>
                <p className="text-lg font-semibold text-gray-900">
                  {profile.mem_verse_display 
                    ? `${profile.mem_verse_book} ${profile.mem_verse_chapter}:${profile.mem_verse_start}${profile.mem_verse_start !== profile.mem_verse_end ? `-${profile.mem_verse_end}` : ""}` : "None"}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Your TAWG Entries:</h3>

              {/* Filter Section */}
              <div className="bg-white shadow rounded-xl p-4 mb-4 border">
                <div className="flex items-center justify-between">
                  <h4 className="text-md font-semibold text-gray-900">Filter</h4>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="text-indigo-600 focus:outline-none"
                    type="button"
                  >
                    <svg
                      className={`w-5 h-5 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                </div>

                {/* Active Filters Display - Always visible */}
                {(selectedBook || selectedChapter || startDate || endDate) && (
                  <div className="mb-3 text-sm text-gray-600">
                    <span className="font-medium">Active filters:</span>
                    {selectedBook && (
                      <span className="ml-2 px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs">
                        {selectedBook.replace(/_/g, " ")}
                      </span>
                    )}
                    {selectedChapter && (
                      <span className="ml-2 px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs">
                        Chapter {selectedChapter}
                      </span>
                    )}
                    {startDate && (
                      <span className="ml-2 px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs">
                        From {new Date(startDate).toLocaleDateString()}
                      </span>
                    )}
                    {endDate && (
                      <span className="ml-2 px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs">
                        To {new Date(endDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                )}

                {/* Collapsible Filter Options */}
                {showFilters && (
                  <div className="border-t pt-4">
                    {/* Bible Reference Filter */}
                    <div className="mb-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Bible Reference</h5>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1">
                          <label htmlFor="book-select" className="block text-xs text-gray-600 mb-1">
                            Book
                          </label>
                          <select
                            id="book-select"
                            value={selectedBook}
                            onChange={(e) => setSelectedBook(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                          >
                            <option value="">All Books</option>
                            {books.map((book) => (
                              <option key={book} value={book}>
                                {book.replace(/_/g, " ")}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="flex-1">
                          <label htmlFor="chapter-select" className="block text-xs text-gray-600 mb-1">
                            Chapter
                          </label>
                          <select
                            id="chapter-select"
                            value={selectedChapter}
                            onChange={(e) => setSelectedChapter(e.target.value)}
                            disabled={!selectedBook}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
                          >
                            <option value="">All Chapters</option>
                            {availableChapters.map((chapter) => (
                              <option key={chapter} value={chapter}>
                                {chapter}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Date Range Filter */}
                    <div className="mb-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Date Range</h5>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1">
                          <label htmlFor="start-date" className="block text-xs text-gray-600 mb-1">
                            Start Date
                          </label>
                          <input
                            type="date"
                            id="start-date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                          />
                        </div>
                        
                        <div className="flex-1">
                          <label htmlFor="end-date" className="block text-xs text-gray-600 mb-1">
                            End Date
                          </label>
                          <input
                            type="date"
                            id="end-date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Clear Button */}
                    <div className="flex justify-end">
                      <button
                        onClick={clearFilters}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200 text-sm font-medium"
                      >
                        Clear Filters
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {notes.length === 0 ? (
                <p className="text-gray-500">
                  {selectedBook || selectedChapter || startDate || endDate
                    ? "No TAWG entries match your filter criteria." 
                    : "Do your TAWG and they will show up here!"}
                </p>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {notes.slice(0, visibleCount).map(note => (
                      <Link to={`/my-entries/${note.id}`} key={note.id} className="block border p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition">
                        <p className="text-xs text-gray-500 italic">
                          {new Date(note.created_at).toLocaleDateString()}
                        </p>
                        <h4 className="text-md font-bold text-gray-900 mb-1 break-words">{note.title}</h4>
                        {note.note_references?.length > 0 && (
                          <div className="flex flex-wrap gap-1 text-sm">
                            {note.note_references.map((ref, index) => (
                              <span key={index} className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs">
                                {ref.book} {ref.chapter}
                              </span>
                            ))}
                          </div>
                        )}
                      </Link>
                    ))}
                  </div>

                  {visibleCount < notes.length && (
                    <div className="flex justify-center mt-4">
                      <button
                        onClick={() => setVisibleCount(visibleCount + 9)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                      >
                        Load More
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProfilePage;