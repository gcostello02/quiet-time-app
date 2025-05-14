import React, { useState, useEffect } from "react"
import esvData from "../data/ESV.json"
import Navbar from "../components/Navbar"
import { MinusCircle } from "lucide-react"
import { UserAuth } from "../context/AuthContext"
import { supabase } from "../supabaseClient"
import { useNavigate } from "react-router-dom"
import Footer from "../components/Footer"
import { Link } from "react-router-dom"

const Notes = () => {
  const { session } = UserAuth() 
  
  const [selectedBook, setSelectedBook] = useState(Object.keys(esvData)[0])
  const [selectedChapter, setSelectedChapter] = useState("1")
  const [isBibleVisible, setIsBibleVisible] = useState(false)
  const books = Object.keys(esvData)
  const chapters = Object.keys(esvData[selectedBook])

  const [title, setTitle] = useState("")
  const [publicContent, setPublicContent] = useState("")
  const [privateContent, setPrivateContent] = useState("")
  const [prayerContent, setPrayerContent] = useState("")
  const [publicPrayerContent, setPublicPrayerContent] = useState("")

  const [bibleReferences, setBibleReferences] = useState([{ book: selectedBook, chapter: selectedChapter }])

  const [addMemoryVerse, setAddMemoryVerse] = useState(false)
  const [selectedMemBook, setMemSelectedBook] = useState(Object.keys(esvData)[0])
  const [selectedMemChapter, setMemSelectedChapter] = useState(1)
  const [startMemVerse, setMemStartVerse] = useState(1)
  const [endMemVerse, setMemEndVerse] = useState(1)
  const chaptersMem = Object.keys(esvData[selectedMemBook])
  const versesMem = esvData[selectedMemBook]?.[selectedMemChapter]?.length ?? 0

  const [visibility, setVisibility] = useState("public_all")

  const [pdfFile, setPdfFile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {    
    const checkTodayNote = async () => {
      setLoading(true)

      if (!session?.user?.id) return

      const { data, error } = await supabase
        .from("notes")
        .select("id, created_at")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(1)

      if (error) {
        console.error("Error checking today's note:", error)
        return
      }

      const today = new Date().toLocaleDateString()
      const note = data?.[0]

      if (note && new Date(note.created_at).toLocaleDateString() === today) {
        navigate(`/my-entries/${note.id}`)
      }

      setLoading(false)
    }

    checkTodayNote()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id])

  const handleTitleChange = (e) => setTitle(e.target.value)

  const handleContentChange = (e, setter) => setter(e.target.value)

  const handleBibleReferenceChange = (index, field, value) => {
    const newReferences = [...bibleReferences]
    newReferences[index][field] = value
    setBibleReferences(newReferences)
  }
  
  const handleFileChange = (e) => setPdfFile(e.target.files[0])

  const handleAddReference = () => {
    setBibleReferences([...bibleReferences, { book: selectedBook, chapter: selectedChapter }])
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
        console.error("Error uploading avatar:", uploadError)
        setError("Failed to upload pdf. Make sure it is a pdf.")
        setLoading(false)
        return
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
      .single()

    if (noteError) {
      console.error("Error inserting note:", noteError)
      setError("Failed to save note.")
      setLoading(false)
      return
    }

    const referenceRows = bibleReferences.map((ref) => ({
      note_id: noteData.id,
      book: ref.book,
      chapter: ref.chapter,
    }))

    const { error: refError } = await supabase
      .from("note_references")
      .insert(referenceRows)

    if (refError) {
      console.error("Error inserting references:", refError)
      setError("Failed to save references.")
      setLoading(false)
      return
    }

    setLoading(false)
    navigate("/dashboard")
  }

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

  const enduringWord = selectedBook === 'Psalms' ? "https://enduringword.com/bible-commentary/psalm-" + selectedChapter + "/" : "https://enduringword.com/bible-commentary/" + selectedBook + "-" + selectedChapter + "/"

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="text-center mx-auto mt-4">
          <button
            onClick={() => setIsBibleVisible(!isBibleVisible)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md shadow-md"
          >
            {isBibleVisible ? "Hide Bible" : "Show Splitscreen Bible"}
          </button>
        </div>

        <div className="px-6 pb-6 pt-4 flex flex-col lg:flex-row gap-4">
          <div className="flex-1 mx-auto w-full md:max-w-3xl space-y-8 mb-4 lg:mb-0">
            <div className="">
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
                Time Alone with God
              </h2>
              <h2 className="text-xl font-bold text-center text-gray-900">
                Don't know what to do?{" "}
                <Link
                  to="/howto"
                  className="text-indigo-600 font-bold hover:underline"
                >
                  Click Here!
                </Link>
              </h2>         
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow rounded-xl p-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-900">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={title}
                  onChange={handleTitleChange}
                  maxLength="50"
                  className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 px-3 py-2 text-gray-900"
                  placeholder="Suggestion: MM/DD/YYYY TAWG"
                />
                <p className="text-xs text-gray-500">
                  {title.length} / 50 characters
                </p>
              </div>

              <div>
                <label htmlFor="publicContent" className="block text-sm font-medium text-gray-900">
                  Notes
                </label>
                <textarea
                  id="publicContent"
                  name="publicContent"
                  value={publicContent}
                  onChange={(e) => handleContentChange(e, setPublicContent)}
                  rows="4"
                  className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 px-3 py-2 text-gray-900"
                  placeholder="Notes here will be seen by others if a public visibility option is chosen"
                />
              </div>

              <div>
                <label htmlFor="privateContent" className="block text-sm font-medium text-gray-900">
                  Private Notes
                </label>
                <textarea
                  id="privateContent"
                  name="privateContent"
                  value={privateContent}
                  onChange={(e) => handleContentChange(e, setPrivateContent)}
                  rows="4"
                  className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 px-3 py-2 text-gray-900"
                  placeholder="Notes here won't be seen by anyone no matter what visibility option is chosen"
                />
              </div>

              <div>
                <label htmlFor="publicPrayerContent" className="block text-sm font-medium text-gray-900">
                  Prayers
                </label>
                <textarea
                  id="publicPrayerContent"
                  name="publicPrayerContent"
                  value={publicPrayerContent}
                  onChange={(e) => handleContentChange(e, setPublicPrayerContent)}
                  rows="4"
                  className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 px-3 py-2 text-gray-900"
                  placeholder="Prayers here will be seen by others if a public visibility option is chosen"
                />
              </div>

              <div>
                <label htmlFor="prayerContent" className="block text-sm font-medium text-gray-900">
                  Private Prayers
                </label>
                <textarea
                  id="prayerContent"
                  name="prayerContent"
                  value={prayerContent}
                  onChange={(e) => handleContentChange(e, setPrayerContent)}
                  rows="4"
                  className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 px-3 py-2 text-gray-900"
                  placeholder="Prayers here won't be seen by anyone no matter what visibility option is chosen"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900">Chapters Read</label>
                {bibleReferences.map((reference, index) => (
                  <div key={index} className="flex space-x-2 mb-2">
                    <select
                      value={reference.book}
                      onChange={(e) => {
                        handleBibleReferenceChange(index, "book", e.target.value)
                        handleBibleReferenceChange(index, "chapter", "1")
                      }}
                      className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 px-3 py-2 text-gray-900"
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
                      className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 px-3 py-2 text-gray-900"
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
                          const updated = [...bibleReferences]
                          updated.splice(index, 1)
                          setBibleReferences(updated)
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
                <label className="block mt-2 cursor-pointer text-gray-900">
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
                  <label className="block text-sm font-medium text-gray-900">Book & Chapter</label>
                  <div className="flex gap-4">
                    <select
                      value={selectedMemBook}
                      onChange={(e) => {
                        setMemSelectedBook(e.target.value)
                        setMemSelectedChapter(1)
                      }}
                      className="mt-1 block w-48 rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900"
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
                      className="mt-1 block w-20 rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900"
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
                  <label className="block text-sm font-medium text-gray-900">
                    Verse(s) Start & End
                  </label>
                  <div className="flex gap-4">
                    <select
                      value={startMemVerse}
                      onChange={(e) => {
                        setMemStartVerse(Number(e.target.value))
                        setMemEndVerse((prevEnd) => (prevEnd < Number(e.target.value) ? Number(e.target.value) : prevEnd))
                      }}
                      className="mt-1 block w-20 rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900"
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
                      className="mt-1 block w-20 rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900"
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
                <label htmlFor="pdfFile" className="block text-sm font-medium text-gray-900">
                  Upload PDF
                </label>
                <input
                  type="file"
                  id="pdfFile"
                  name="pdfFile"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="mt-1 block w-full text-sm text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900">Visibility</label>
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 px-3 py-2 text-gray-900"
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
            <div className="flex-1 max-w-3xl mx-auto space-y-8">
              <div className="">
                <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
                  The Holy Bible
                </h2>
                <h2 className="text-xl font-bold text-center text-gray-900 mb-4">
                  English Standard Version
                </h2>
              </div>

              <div className="flex justify-center gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900">
                    Select Book:
                  </label>
                  <select
                    value={selectedBook}
                    onChange={(e) => {
                      setSelectedBook(e.target.value)
                      setSelectedChapter("1")
                    }}
                    className="mt-1 block w-48 rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900"
                  >
                    {books.map((book) => (
                      <option key={book} value={book}>
                        {book}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900">
                    Select Chapter:
                  </label>
                  <select
                    value={selectedChapter}
                    onChange={(e) => setSelectedChapter(e.target.value)}
                    className="mt-1 block w-20 rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900"
                  >
                    {chapters.map((chapter) => (
                      <option key={chapter} value={chapter}>
                        {chapter}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="text-lg font-bold text-center text-gray-900">
                <a
                  href={enduringWord}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline"
                >
                  Enduring Word Commentary for {selectedBook} {selectedChapter}
                </a>
              </div>

              <div className="max-w-3xl mx-auto bg-white p-4 rounded-xl shadow">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedBook} {selectedChapter}
                </h3>
                <div className="mt-2 space-y-2">
                  {esvData[selectedBook][selectedChapter].map((verse) => (
                    <p key={verse.verse} className="text-gray-900">
                      <strong>{verse.verse}</strong> {verse.text}
                    </p>
                  ))}
                </div>
              </div>
              <div className="mt-4 text-center text-sm text-gray-600 px-4">
                The Holy Bible, English Standard Version. ESV® Text Edition: 2016. Copyright © 2001 by{" "}
                <a
                  href="https://www.crossway.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline inline-flex items-center gap-1"
                >
                  Crossway Bibles, a publishing ministry of Good News Publishers.
                </a>      
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default Notes
