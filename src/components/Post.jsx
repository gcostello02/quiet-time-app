import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Link } from "react-router-dom";

const Post = ({ note }) => {
  const [loading, setLoading] = useState(true);
  const [postProfile, setPostProfile] = useState({})
  const [postReferences, setPostReferences] = useState([])
  const [showMoreNote, setShowMoreNote] = useState(false);
  const [showMorePrayer, setShowMorePrayer] = useState(false);

  useEffect(() => {
    fetchData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note.user_id])

  const fetchData = async () => {
    if (!note.anonymous) {
      const { data: postProfile, error: errorProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', note.user_id)
        .single()
  
      if (errorProfile) {
        console.log("Error fetching profiles", errorProfile)
        setLoading(false)
        return
      }
  
      setPostProfile(postProfile)
    }

    const { data: postReferences, error: errorReferences } = await supabase
      .from('note_references')
      .select('*')
      .eq('note_id', note.id)

    if (errorReferences) {
      console.log("Error fetching references", errorReferences)
      setLoading(false)
      return
    }

    setPostReferences(postReferences)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="bg-white shadow-xl rounded-xl p-6 max-w-md sm:max-w-xl md:max-w-2xl mx-auto my-4 border border-gray-200">
        <div className="flex justify-center items-center">
          <div className="spinner-border animate-spin h-8 w-8 border-4 border-t-transparent border-indigo-600 rounded-full"></div>
        </div>
      </div>
    );
  }

  const memoryVerse = note.mem_verse_display
    ? `${note.mem_verse_book} ${note.mem_verse_chapter}:${note.mem_verse_start}${note.mem_verse_end && note.mem_verse_end !== note.mem_verse_start ? "-" + note.mem_verse_end : ""}`
    : null;

  return (
    <div className="bg-white shadow-xl rounded-xl p-4 mx-auto my-6 border border-gray-200">
      <div className="flex items-center justify-between mb-2">
        {note.anonymous ?
        (
          <div className="flex items-center gap-3">
            <img
              src="https://fkyfymxgbyyznrctanvs.supabase.co/storage/v1/object/public/profile-pictures/avatars/default.png"
              alt="profile"
              className="w-10 h-10 rounded-full object-cover border border-gray-300"
            />
            <p className="text-lg font-semibold text-gray-900">
              Anonymous
            </p>
          </div>
        ) :
        (
          <Link
            to={`/profiles/${note.user_id}`}
            key={note.id}
          >
            <div className="flex items-center gap-3">
              <img
                src={postProfile.avatar_url}
                alt="profile"
                className="w-10 h-10 rounded-full object-cover border border-gray-300"
              />
              <p className="text-lg font-semibold text-gray-900 hover:text-indigo-600">
                {postProfile.username}
              </p>
            </div>
          </Link>
        )}
        <div className="text-xs text-gray-400 italic">
          {new Date(note.created_at).toLocaleString()}
        </div>
      </div>

      <hr className="h-px bg-gray-200 border-0"></hr>

      <div className="flex items-center justify-center">
        <p className="text-xl font-bold text-gray-900">
          {note.title}
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-2 my-3">
        {postReferences.map((ref, idx) => (
          <div
            key={idx}
            className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-full text-sm font-medium shadow-sm"
          >
            {ref.book} {ref.chapter}
          </div>
        ))}
      </div>

      {note.public_notes_content && (
        <div className="mb-4">
          <h2 className="text-base font-semibold text-gray-900 mb-1">Notes:</h2>
          <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
            {showMoreNote || note.public_notes_content.length < 200
              ? note.public_notes_content
              : note.public_notes_content.slice(0, 200) + "..."}
          </p>
          {note.public_notes_content.length > 200 && (
            <button
              onClick={() => setShowMoreNote(!showMoreNote)}
              className="text-xs bg-white text-indigo-600 mt-1"
            >
              {showMoreNote ? "Show less" : "Show more"}
            </button>
          )}
        </div>
      )}

      {note.public_prayer_content && (
        <div className="mb-4">
          <h2 className="text-base font-semibold text-gray-900 mb-1">Prayer:</h2>
          <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
            {showMorePrayer || note.public_prayer_content.length < 200
              ? note.public_prayer_content
              : note.public_prayer_content.slice(0, 200) + "..."}
          </p>
          {note.public_prayer_content.length > 200 && (
            <button
              onClick={() => setShowMorePrayer(!showMorePrayer)}
              className="text-xs bg-white text-indigo-600 mt-1"
            >
              {showMorePrayer ? "Show less" : "Show more"}
            </button>
          )}
        </div>
      )}

      {memoryVerse && (
        <div className="mb-4">
          <h2 className="text-base font-semibold text-gray-900 mb-1">Memory Verse(s)</h2>
          <p className="text-sm text-indigo-600 font-medium">{memoryVerse}</p>
        </div>
      )}

      {note.pdf_url && note.pdf_display && (
        <div className="mb-4">
          <h2 className="text-base font-semibold text-gray-900 mb-1">Attached PDF:</h2>
          <a
            href={note.pdf_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-indigo-600 hover:text-indigo-800"
          >
            Scanned Notes
          </a>
        </div>
      )}
    </div>
  )
}

export default Post;