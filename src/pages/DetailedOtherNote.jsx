import React, { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import { supabase } from "../supabaseClient"
import { UserAuth } from "../context/AuthContext"
import { ArrowLeft } from "lucide-react"
import Footer from "../components/Footer"

const DetailedOtherNote = () => {
  const { noteId } = useParams()
  const navigate = useNavigate()
  const { session } = UserAuth()
  const [note, setNote] = useState(null)
  const [loading, setLoading] = useState(true)
  const [references, setReferences] = useState([])
  const [showMoreNote, setShowMoreNote] = useState(false)
  const [showMorePrayer, setShowMorePrayer] = useState(false)

  useEffect(() => {
    setLoading(true)

    const fetchNote = async () => {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("id", noteId)
        .single()

      if (error || !data) {
        navigate("/dashboard")
        return
      }

      setNote(data)

      if (data.user_id === session.user.id) {
        navigate(`/my-entries/${noteId}`)
        return
      }

      const { data: references, error: errorReferences } = await supabase
        .from("note_references")
        .select("*")
        .eq("note_id", noteId)

      if (errorReferences) {
        console.log("Error fetching references", errorReferences)
        setLoading(false)
        return
      }

      setReferences(references)
      setLoading(false)
    }

    const checkIfFriend = async () => {
      if (!session?.user?.id || !note) return

      const { data, error } = await supabase
        .from("friends")
        .select("*")
        .or(
          `user_id.eq.${session.user.id},friend_id.eq.${session.user.id}`
        )
        .eq("user_id", note.user_id)

      if (error) {
        console.error("Error checking friendship:", error)
        return
      }

      if (data.length === 0) {
        navigate("/unauthorized")
      }
    }

    checkIfFriend()
    fetchNote()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteId, session.user.id])

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
    )
  }

  const memoryVerse = note?.mem_verse_display
    ? `${note.mem_verse_book} ${note.mem_verse_chapter}:${note.mem_verse_start}${note.mem_verse_end && note.mem_verse_end !== note.mem_verse_start ? "-" + note.mem_verse_end : ""}`
    : null

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">  
      <Navbar />
      <main className="flex-grow">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow-md rounded-xl p-4 max-w-md sm:max-w-xl md:max-w-2xl mx-auto my-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <button
                  onClick={() => navigate(`/profiles/${note.user_id}`)}
                  className="text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-2 bg-white"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="text-sm font-medium">Back to Profile</span>
                </button>
              </div>
              <div className="text-xs text-gray-400 italic">
                {new Date(note.created_at).toLocaleString()}
              </div>
            </div>

            <hr className="h-px bg-gray-200 border-0"></hr>

            <div className="flex items-center justify-center">
              <p className="text-xl font-bold text-gray-900 break-words">
                {note.title}
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-2 my-3">
              {references.map((ref, idx) => (
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
                    className="text-xs text-indigo-600 mt-1 bg-white"
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
                    className="text-xs text-indigo-600 mt-1 bg-white"
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

          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default DetailedOtherNote
