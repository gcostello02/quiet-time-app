import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { UserAuth } from "../context/AuthContext";
import { supabase } from "../supabaseClient";
import esvData from "../data/ESV.json";

const EditNote = () => {
  const { session } = UserAuth();
  const { noteId } = useParams();
  const navigate = useNavigate();

  const books = Object.keys(esvData);

  const [title, setTitle] = useState("");
  const [publicContent, setPublicContent] = useState("");
  const [privateContent, setPrivateContent] = useState("");
  const [publicPrayerContent, setPublicPrayerContent] = useState("");
  const [prayerContent, setPrayerContent] = useState("");
  const [visibility, setVisibility] = useState("public_all");
  const [bibleReferences, setBibleReferences] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNote = async () => {
      const { data, error } = await supabase
        .from("notes")
        .select(`
          id,
          user_id,
          title,
          public_notes_content,
          private_notes_content,
          public_prayer_content,
          private_prayer_content,
          visibility,
          note_references (
            book,
            chapter
          )
        `)
        .eq("id", noteId)
        .single();

      if (error || !data || data.user_id !== session.user.id) {
        navigate("/profile");
        return;
      }

      setTitle(data.title);
      setPublicContent(data.public_notes_content || "");
      setPrivateContent(data.private_notes_content || "");
      setPublicPrayerContent(data.public_prayer_content || "");
      setPrayerContent(data.private_prayer_content || "");
      setVisibility(data.visibility || "public_all");
      setBibleReferences(data.note_references || []);
      setLoading(false);
    };

    if (session?.user?.id) {
      fetchNote();
    }
  }, [noteId, session?.user?.id, navigate]);

  const handleContentChange = (e, setter) => setter(e.target.value);

  const handleBibleReferenceChange = (index, field, value) => {
    const newReferences = [...bibleReferences];
    newReferences[index][field] = value;
    setBibleReferences(newReferences);
  };

  const handleAddReference = () => {
    setBibleReferences([...bibleReferences, { book: books[0], chapter: "1" }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: updateError } = await supabase
      .from("notes")
      .update({
        title,
        public_notes_content: publicContent,
        private_notes_content: privateContent,
        public_prayer_content: publicPrayerContent,
        private_prayer_content: prayerContent,
        visibility
      })
      .eq("id", noteId);

    if (updateError) {
      setError("Failed to update note");
      setLoading(false);
      return;
    }

    await supabase.from("note_references").delete().eq("note_id", noteId);
    const referenceRows = bibleReferences.map(ref => ({
      note_id: noteId,
      book: ref.book,
      chapter: ref.chapter
    }));
    await supabase.from("note_references").insert(referenceRows);

    navigate(`/my-entries/${noteId}`);
  };

  if (loading) {
    return <div className="text-center text-gray-500 dark:text-gray-400 mt-10">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Navbar />
      <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-800 rounded shadow mt-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Edit Note</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white">Notes</label>
            <textarea
              value={publicContent}
              onChange={(e) => handleContentChange(e, setPublicContent)}
              className="mt-1 w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2"
              rows="4"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white">Private Notes</label>
            <textarea
              value={privateContent}
              onChange={(e) => handleContentChange(e, setPrivateContent)}
              className="mt-1 w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2"
              rows="4"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white">Prayers</label>
            <textarea
              value={publicPrayerContent}
              onChange={(e) => handleContentChange(e, setPublicPrayerContent)}
              className="mt-1 w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2"
              rows="4"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white">Private Prayers</label>
            <textarea
              value={prayerContent}
              onChange={(e) => handleContentChange(e, setPrayerContent)}
              className="mt-1 w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2"
              rows="4"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white">Chapters Read</label>
            {bibleReferences.map((ref, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <select
                  value={ref.book}
                  onChange={(e) => handleBibleReferenceChange(index, "book", e.target.value)}
                  className="w-1/2 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-2 py-1"
                >
                  {books.map(book => (
                    <option key={book} value={book}>{book}</option>
                  ))}
                </select>
                <select
                  value={ref.chapter}
                  onChange={(e) => handleBibleReferenceChange(index, "chapter", e.target.value)}
                  className="w-1/2 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-2 py-1"
                >
                  {Object.keys(esvData[ref.book]).map(ch => (
                    <option key={ch} value={ch}>{ch}</option>
                  ))}
                </select>
              </div>
            ))}
            <button type="button" onClick={handleAddReference} className="text-indigo-600 text-sm mt-2">
              Add Another Chapter
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white">Visibility</label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              className="mt-1 w-full rounded border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2"
            >
              <option value="public_all">Public (Friends + anonymous)</option>
              <option value="public_friends">Public (Friends only)</option>
              <option value="private_anonymous">Public (Anonymous)</option>
              <option value="private_not_seen">Private</option>
            </select>
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <div className="text-center">
            <button
              type="submit"
              className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700"
              disabled={loading}
            >
              {loading ? "Saving..." : "Update Note"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditNote;