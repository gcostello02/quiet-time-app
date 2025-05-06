import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { supabase } from "../supabaseClient";
import { UserAuth } from "../context/AuthContext";

const DetailedUserNote = () => {
  const { noteId } = useParams();
  const navigate = useNavigate();
  const { session, profile } = UserAuth();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true)
  const [references, setReferences] = useState([])
  const [showMoreNote, setShowMoreNote] = useState(false);
  const [showMorePNote, setShowMorePNote] = useState(false);
  const [showMorePrayer, setShowMorePrayer] = useState(false);
  const [showMorePPrayer, setShowMorePPrayer] = useState(false);

  useEffect(() => {
    const fetchNote = async () => {
      setLoading(true)

      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("id", noteId)
        .single();

      if (error || !data) {
        navigate("/profile");
      } else if (data.user_id !== session.user.id) {
        navigate("/profile");
      } else {
        setNote(data);
      }

      const { data: references, error: errorReferences } = await supabase
        .from('note_references')
        .select('*')
        .eq('note_id', noteId)

      if (errorReferences) {
        console.log("Error fetching references", errorReferences)
        setLoading(false)
        return
      }

      setReferences(references)

      setLoading(false);
    };

    if (session?.user?.id) {
      fetchNote();
    }
  }, [navigate, noteId, session.user.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <Navbar />
        <div className="flex justify-center items-center mt-5">
          <div className="spinner-border animate-spin h-8 w-8 border-4 border-t-transparent border-indigo-600 rounded-full"></div>
        </div>
      </div>
    )
  }

  const memoryVerse = note.mem_verse_display
    ? `${note.mem_verse_book} ${note.mem_verse_chapter}:${note.mem_verse_start}${note.mem_verse_end && note.mem_verse_end !== note.mem_verse_start ? "-" + note.mem_verse_end : ""}`
    : null;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">      
      <Navbar />
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-4 max-w-md sm:max-w-xl md:max-w-2xl mx-auto my-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <img
                src={profile.avatar_url ? profile.avatar_url : "/src/assets/logo.png"}
                alt="profile"
                className="w-10 h-10 rounded-full object-cover border border-gray-300 dark:border-gray-600"
              />
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {profile.username}
              </p>
            </div>
            <div className="text-xs text-gray-400 italic">
              {new Date(note.created_at).toLocaleString()}
            </div>
          </div>

          <hr className="h-px bg-gray-200 border-0 dark:bg-gray-700"></hr>

          <div className="flex items-center justify-center">
            <p className="text-xl font-bold text-gray-900 dark:text-white break-words">
              {note.title}
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 my-3">
            {references.map((ref, idx) => (
              <div
                key={idx}
                className="px-3 py-1 bg-indigo-100 dark:bg-indigo-800 text-indigo-600 dark:text-indigo-100 rounded-full text-sm font-medium shadow-sm"
              >
                {ref.book} {ref.chapter}
              </div>
            ))}
          </div>

          {note.public_notes_content && (
            <div className="mb-4">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Notes:</h2>
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
                {showMoreNote || note.public_notes_content.length < 200
                  ? note.public_notes_content
                  : note.public_notes_content.slice(0, 200) + "..."}
              </p>
              {note.public_notes_content.length > 200 && (
                <button
                  onClick={() => setShowMoreNote(!showMoreNote)}
                  className="text-xs text-indigo-600 mt-1"
                >
                  {showMoreNote ? "Show less" : "Show more"}
                </button>
              )}
            </div>
          )}

          {note.private_notes_content && (
            <div className="mb-4">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Private Notes:</h2>
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
                {showMorePNote || note.private_notes_content.length < 200
                  ? note.private_notes_content
                  : note.private_notes_content.slice(0, 200) + "..."}
              </p>
              {note.private_notes_content.length > 200 && (
                <button
                  onClick={() => setShowMorePNote(!showMorePNote)}
                  className="text-xs text-indigo-600 mt-1"
                >
                  {showMorePNote ? "Show less" : "Show more"}
                </button>
              )}
            </div>
          )}

          {note.public_prayer_content && (
            <div className="mb-4">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Prayer:</h2>
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
                {showMorePrayer || note.public_prayer_content.length < 200
                  ? note.public_prayer_content
                  : note.public_prayer_content.slice(0, 200) + "..."}
              </p>
              {note.public_prayer_content.length > 200 && (
                <button
                  onClick={() => setShowMorePrayer(!showMorePrayer)}
                  className="text-xs text-indigo-600 mt-1"
                >
                  {showMorePrayer ? "Show less" : "Show more"}
                </button>
              )}
            </div>
          )}

          {note.private_prayer_content && (
            <div className="mb-4">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Private Prayers:</h2>
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
                {showMorePPrayer || note.private_prayer_content.length < 200
                  ? note.private_prayer_content
                  : note.private_prayer_content.slice(0, 200) + "..."}
              </p>
              {note.private_prayer_content.length > 200 && (
                <button
                  onClick={() => setShowMorePPrayer(!showMorePPrayer)}
                  className="text-xs text-indigo-600 mt-1"
                >
                  {showMorePPrayer ? "Show less" : "Show more"}
                </button>
              )}
            </div>
          )}

          {memoryVerse && (
            <div className="mb-4">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Memory Verse(s)</h2>
              <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">{memoryVerse}</p>
            </div>
          )}

          {note.pdf_url && (
            <div className="mb-4">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Attached PDF</h2>
              <a
                href={note.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300"
              >
                View your Written Notes
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailedUserNote;
