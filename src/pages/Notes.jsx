import React, { useState } from "react";
import esvData from "../data/ESV.json";
import Navbar from "../components/Navbar";
import { MinusCircle } from "lucide-react";
import { UserAuth } from "../context/AuthContext";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

const Notes = () => {
  const { session } = UserAuth(); 
  
  const [selectedBook, setSelectedBook] = useState(Object.keys(esvData)[0]);
  const [selectedChapter, setSelectedChapter] = useState("1");
  const [isBibleVisible, setIsBibleVisible] = useState(false);
  const books = Object.keys(esvData);
  const chapters = Object.keys(esvData[selectedBook]);

  const [title, setTitle] = useState("");
  const [publicContent, setPublicContent] = useState("");
  const [privateContent, setPrivateContent] = useState("");
  const [prayerContent, setPrayerContent] = useState("");
  const [publicPrayerContent, setPublicPrayerContent] = useState("");

  const [bibleReferences, setBibleReferences] = useState([{ book: selectedBook, chapter: selectedChapter }]);

  const [addMemoryVerse, setAddMemoryVerse] = useState(false);
  const [selectedMemBook, setMemSelectedBook] = useState(Object.keys(esvData)[0]);
  const [selectedMemChapter, setMemSelectedChapter] = useState(1);
  const [startMemVerse, setMemStartVerse] = useState(1);
  const [endMemVerse, setMemEndVerse] = useState(1);
  const chaptersMem = Object.keys(esvData[selectedMemBook]);
  const versesMem = esvData[selectedMemBook]?.[selectedMemChapter]?.length ?? 0;

  const [visibility, setVisibility] = useState("public_all");

  const [pdfFile, setPdfFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();


  const handleTitleChange = (e) => setTitle(e.target.value)

  const handleContentChange = (e, setter) => setter(e.target.value)

  const handleBibleReferenceChange = (index, field, value) => {
    const newReferences = [...bibleReferences];
    newReferences[index][field] = value;
    setBibleReferences(newReferences);
  }
  
  const handleFileChange = (e) => setPdfFile(e.target.files[0]);

  const handleAddReference = () => {
    setBibleReferences([...bibleReferences, { book: selectedBook, chapter: selectedChapter }]);
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    let pdfUrl = null
    
    if (pdfFile) {
      const filePath = `${session.user.id}/${new Date().toISOString().split("T")[0]}.pdf`
      const { error: uploadError } = await supabase.storage
      .from("note-pdfs")
      .upload(filePath, pdfFile, { upsert: true })
      
      if (uploadError) {
        console.error("Error uploading avatar:", uploadError);
        setError("Failed to upload pdf. Make sure it is a pdf.");
        setLoading(false);
        return;
      }

      pdfUrl = supabase.storage.from("note-pdfs").getPublicUrl(filePath).data.publicUrl
    }

    const { data: noteData, error: noteError } = await supabase
      .from("notes")
      .insert([
        {
          user_id: session.user.id,
          title: title,
          public_notes_content: publicContent,
          private_notes_content: privateContent,
          public_prayer_content: publicPrayerContent,
          private_prayer_content: prayerContent,
          visibility: visibility,
          pdf_url: pdfUrl,
          mem_verse_display: addMemoryVerse,
          mem_verse_book: selectedMemBook,
          mem_verse_chapter: selectedMemChapter,
          mem_verse_start: startMemVerse,
          mem_verse_end: endMemVerse
        },
      ])
      .select()
      .single();

    if (noteError) {
      console.error("Error inserting note:", noteError);
      setError("Failed to save note.");
      setLoading(false);
      return;
    }

    const referenceRows = bibleReferences.map((ref) => ({
      note_id: noteData.id,
      book: ref.book,
      chapter: ref.chapter,
    }));

    const { error: refError } = await supabase
      .from("note_references")
      .insert(referenceRows);

    if (refError) {
      console.error("Error inserting references:", refError);
      setError("Failed to save references.");
      setLoading(false);
      return;
    }

    setLoading(false);
    navigate("/dashboard")
  }

  return (
    <div>
      <Navbar />
      <div className="text-center mt-4">
        <button
          onClick={() => setIsBibleVisible(!isBibleVisible)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md shadow-md"
        >
          {isBibleVisible ? "Hide Bible" : "Show Splitscreen Bible"}
        </button>
      </div>

      <div className="min-h-screen p-6 flex flex-col lg:flex-row gap-4">
        <div className={`flex-1 p-4 mx-auto w-full ${isBibleVisible ? "lg:border-r-2 border-gray-300" : ""} lg:max-w-3xl`}>
          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-4">
            Time Alone with God
          </h2>         

          <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-900 shadow-md rounded-xl p-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-900 dark:text-white">
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={title}
                onChange={handleTitleChange}
                maxLength="35"
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white"
                placeholder="Suggestion: MM/DD/YYYY TAWG"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                 {title.length} / 35 characters
               </p>
            </div>

            <div>
              <label htmlFor="publicContent" className="block text-sm font-medium text-gray-900 dark:text-white">
                Notes
              </label>
              <textarea
                id="publicContent"
                name="publicContent"
                value={publicContent}
                onChange={(e) => handleContentChange(e, setPublicContent)}
                rows="4"
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white"
                placeholder="Notes here will be seen by others if a public visibility option is chosen"
              />
            </div>

            <div>
              <label htmlFor="privateContent" className="block text-sm font-medium text-gray-900 dark:text-white">
                Private Notes
              </label>
              <textarea
                id="privateContent"
                name="privateContent"
                value={privateContent}
                onChange={(e) => handleContentChange(e, setPrivateContent)}
                rows="4"
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white"
                placeholder="Notes here won't be seen by anyone no matter what visibility option is chosen"
              />
            </div>

            <div>
              <label htmlFor="publicPrayerContent" className="block text-sm font-medium text-gray-900 dark:text-white">
                Prayers
              </label>
              <textarea
                id="publicPrayerContent"
                name="publicPrayerContent"
                value={publicPrayerContent}
                onChange={(e) => handleContentChange(e, setPublicPrayerContent)}
                rows="4"
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white"
                placeholder="Prayers here will be seen by others if a public visibility option is chosen"
              />
            </div>

            <div>
              <label htmlFor="prayerContent" className="block text-sm font-medium text-gray-900 dark:text-white">
                Private Prayers
              </label>
              <textarea
                id="prayerContent"
                name="prayerContent"
                value={prayerContent}
                onChange={(e) => handleContentChange(e, setPrayerContent)}
                rows="4"
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white"
                placeholder="Prayers here won't be seen by anyone no matter what visibility option is chosen"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white">Chapters Read</label>
              {bibleReferences.map((reference, index) => (
                <div key={index} className="flex space-x-2 mb-2">
                  <select
                    value={reference.book}
                    onChange={(e) => {
                      handleBibleReferenceChange(index, "book", e.target.value);
                      handleBibleReferenceChange(index, "chapter", "1");
                    }}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white"
                  >
                    {books.map((book) => (
                      <option key={book} value={book}>
                        {book}
                      </option>
                    ))}
                  </select>
                  <select
                    value={reference.chapter}
                    onChange={(e) => handleBibleReferenceChange(index, "chapter", e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white"
                  >
                    {Object.keys(esvData[reference.book]).map((chapter) => (
                      <option key={chapter} value={chapter}>
                        {chapter}
                      </option>
                    ))}
                  </select>
                  {bibleReferences.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const updated = [...bibleReferences];
                        updated.splice(index, 1);
                        setBibleReferences(updated);
                      }}
                      className="text-indigo-600 hover:text-indigo-700 bg-gray-100"
                    >
                      <MinusCircle className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddReference}
                className="text-indigo-600 hover:text-indigo-700 text-sm bg-gray-100"
              >
                Add Another Chapter
              </button>
            </div>

            <div>
              <label className="block mt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={addMemoryVerse}
                  onChange={() => setAddMemoryVerse(!addMemoryVerse)}
                  className="mr-1 cursor-pointer"
                />
                Would you like to add a Memory Verse(s)?
              </label>
            </div>

            {addMemoryVerse && (
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-300">Favorite Verse(s)</label>
                <div className="flex gap-4">
                  <select
                    value={selectedMemBook}
                    onChange={(e) => {
                      setMemSelectedBook(e.target.value);
                      setMemSelectedChapter(1);
                    }}
                    className="mt-1 block w-48 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white"
                  >
                    {books.map((book) => (
                      <option key={book} value={book}>
                        {book}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedMemChapter}
                    onChange={(e) => setMemSelectedChapter(Number(e.target.value))}
                    className="mt-1 block w-20 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white"
                  >
                    {chaptersMem.map((chapter) => (
                      <option key={chapter} value={chapter}>
                        {chapter}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {addMemoryVerse && (
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-300">
                  Verse(s) Start & End
                </label>
                <div className="flex gap-4">
                  <select
                    value={startMemVerse}
                    onChange={(e) => {
                      setMemStartVerse(Number(e.target.value));
                      setMemEndVerse((prevEnd) => (prevEnd < Number(e.target.value) ? Number(e.target.value) : prevEnd));
                    }}
                    className="mt-1 block w-20 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white"
                  >
                    {Array.from({ length: versesMem }, (_, i) => i + 1).map((verse) => (
                      <option key={verse} value={verse}>
                        {verse}
                      </option>
                    ))}
                  </select>
                  <select
                    value={endMemVerse}
                    onChange={(e) => setMemEndVerse(Number(e.target.value))}
                    className="mt-1 block w-20 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white"
                  >
                    {Array.from({ length: versesMem - startMemVerse + 1 }, (_, i) => i + startMemVerse).map((verse) => (
                      <option key={verse} value={verse}>
                        {verse}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="pdfFile" className="block text-sm font-medium text-gray-900 dark:text-white">
                Upload PDF
              </label>
              <input
                type="file"
                id="pdfFile"
                name="pdfFile"
                onChange={handleFileChange}
                className="mt-1 block w-full text-sm text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white">Visibility</label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white"
              >
                <option value="public_all">Public (To friends and anonymous to other users)</option>
                <option value="public_friends">Public (Just to friends)</option>
                <option value="private_anonymous">Public (Anonymous to everyone)</option>
                <option value="private_not_seen">Private (Not to be seen)</option>
              </select>
            </div>

            <div className="text-center">
              <button
                type="submit"
                className="px-6 py-3 mt-4 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none"
                disabled={loading}
              >
                {loading ? "Saving..." : "Finish TAWG"}
              </button>
            </div>
          </form>

          {error && <p className="text-center text-red-500">{error}</p>}
        </div>

        {isBibleVisible && (
          <div className="flex-1 p-4 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-4">
              Bible (ESV)
            </h2>
            <div className="flex justify-center gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-300">
                  Select Book:
                </label>
                <select
                  value={selectedBook}
                  onChange={(e) => {
                    setSelectedBook(e.target.value);
                    setSelectedChapter("1"); 
                  }}
                  className="mt-1 block w-48 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white"
                >
                  {books.map((book) => (
                    <option key={book} value={book}>
                      {book}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-300">
                  Select Chapter:
                </label>
                <select
                  value={selectedChapter}
                  onChange={(e) => setSelectedChapter(e.target.value)}
                  className="mt-1 block w-20 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white"
                >
                  {chapters.map((chapter) => (
                    <option key={chapter} value={chapter}>
                      {chapter}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="max-w-3xl mx-auto bg-white dark:bg-gray-900 p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedBook} {selectedChapter}
              </h3>
              <div className="mt-2 space-y-2">
                {esvData[selectedBook][selectedChapter].map((verse) => (
                  <p key={verse.verse} className="text-gray-900 dark:text-gray-300">
                    <strong>{verse.verse}</strong> {verse.text}
                  </p>
                ))}
              </div>
            </div>
            <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400 px-4">
              The Holy Bible, English Standard Version. ESV® Text Edition: 2016. Copyright © 2001 by{" "}
              <a
                href="https://www.crossway.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
              >
                Crossway Bibles, a publishing ministry of Good News Publishers.
              </a>      
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notes;
