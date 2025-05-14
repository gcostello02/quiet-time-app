import React, { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import { UserAuth } from "../context/AuthContext"
import { supabase } from "../supabaseClient"
import esvData from "../data/ESV.json"
import { MinusCircle } from "lucide-react"
import Footer from "../components/Footer"
import { Link } from "react-router-dom"

const EditNote = () => {
  const { session } = UserAuth()
  const { noteId } = useParams()
  const navigate = useNavigate()

  const [selectedBook, setSelectedBook] = useState(Object.keys(esvData)[0])
  const [selectedChapter, setSelectedChapter] = useState("1")
  const [isBibleVisible, setIsBibleVisible] = useState(false)
  const books = Object.keys(esvData)
  const chapters = Object.keys(esvData[selectedBook])

  const [title, setTitle] = useState("")
  const [publicContent, setPublicContent] = useState("")
  const [privateContent, setPrivateContent] = useState("")
  const [publicPrayerContent, setPublicPrayerContent] = useState("")
  const [prayerContent, setPrayerContent] = useState("")
  const [visibility, setVisibility] = useState("public_all")
  const [bibleReferences, setBibleReferences] = useState([])

  const [addMemoryVerse, setAddMemoryVerse] = useState(false)
  const [selectedMemBook, setMemSelectedBook] = useState(Object.keys(esvData)[0])
  const [selectedMemChapter, setMemSelectedChapter] = useState(1)
  const [startMemVerse, setMemStartVerse] = useState(1)
  const [endMemVerse, setMemEndVerse] = useState(1)
  const chaptersMem = Object.keys(esvData[selectedMemBook])
  const versesMem = esvData[selectedMemBook]?.[selectedMemChapter]?.length ?? 0

  const [pdfFile, setPdfFile] = useState(null)
  const [existingPdfUrl, setExistingPdfUrl] = useState(null)
  const [createdAt, setCreatedAt] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchNote = async () => {
      setLoading(true)

      const { data, error } = await supabase
        .from("notes")
        .select(`
          id,
          user_id,
          created_at,
          title,
          public_notes_content,
          private_notes_content,
          public_prayer_content,
          private_prayer_content,
          visibility,
          pdf_url,
          mem_verse_display,
          mem_verse_book,
          mem_verse_chapter,
          mem_verse_start,
          mem_verse_end,
          note_references (
            book,
            chapter
          )
        `)
        .eq("id", noteId)
        .single()

      if (data.user_id !== session.user.id) {
        navigate("/unauthorized")
        return
      }

      if (error || !data) {
        navigate("/profile")
        return
      }

      setTitle(data.title)
      setPublicContent(data.public_notes_content || "")
      setPrivateContent(data.private_notes_content || "")
      setPublicPrayerContent(data.public_prayer_content || "")
      setPrayerContent(data.private_prayer_content || "")
      setVisibility(data.visibility || "public_all")
      setBibleReferences(data.note_references || [])
      setAddMemoryVerse(data.mem_verse_display || false)
      setMemSelectedBook(data.mem_verse_book || "Genesis")
      setMemSelectedChapter(data.mem_verse_chapter || 1)
      setMemStartVerse(data.mem_verse_start || 1)
      setMemEndVerse(data.mem_verse_end || 1)
      setPdfFile(null)
      setCreatedAt(new Date(data.created_at))
      setExistingPdfUrl(data.pdf_url || null)
      setLoading(false)
    }

    if (session?.user?.id) {
      fetchNote()
    }
  }, [noteId, session?.user?.id, navigate])

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

  const handleDelete = async () => {
    setLoading(true)
    const { error } = await supabase.from("notes").delete().eq("id", noteId)
    if (error) {
      setError("Failed to delete note")
      setLoading(false)
      return
    }
    navigate("/profile")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    let pdfUrl = existingPdfUrl

    if (pdfFile) {
      const filePath = `${session.user.id}/${createdAt.toISOString().split("T")[0]}.pdf`
      const { error: uploadError } = await supabase.storage
        .from("note-pdfs")
        .upload(filePath, pdfFile, { upsert: true })

      if (uploadError) {
        console.error("Error uploading PDF:", uploadError)
        setError("Failed to upload PDF. Make sure it is a PDF.")
        setLoading(false)
        return
      }

      pdfUrl = supabase.storage.from("note-pdfs").getPublicUrl(filePath).data.publicUrl
    }

    const { error: updateError } = await supabase
      .from("notes")
      .update({
        title,
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
      })
      .eq("id", noteId)

    if (updateError) {
      setError("Failed to update note")
      setLoading(false)
      return
    }

    await supabase.from("note_references").delete().eq("note_id", noteId)
    const referenceRows = bibleReferences.map(ref => ({
      note_id: noteId,
      book: ref.book,
      chapter: ref.chapter
    }))
    await supabase.from("note_references").insert(referenceRows)

    navigate(`/my-entries/${noteId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="flex justify-center items-center mt-5">
          <div className="spinner-border animate-spin h-8 w-8 border-4 border-t-transparent border-indigo-600 rounded-full"></div>
        </div>
      </div>
    )
  }

  const enduringWord = "https://enduringword.com/bible-commentary/" + selectedBook + "-" + selectedChapter + "/"

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
                Edit Time Alone with God
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
                  onChange={(e) => setTitle(e.target.value)}
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
                {existingPdfUrl && (
                  <p className="text-sm mb-1 text-indigo-600">
                    <a href={existingPdfUrl} target="_blank" rel="noopener noreferrer">
                      View current PDF
                    </a>
                  </p>
                )}
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


              <div className="flex flex-col lg:flex-row lg:justify-evenly mt-2">
                <button
                  type="button"
                  onClick={() => navigate(`/my-entries/${noteId}`)}
                  className="px-6 py-3 mt-4 bg-gray-500 text-white rounded-lg shadow-md hover:bg-gray-600 focus:outline-none"
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  className="px-6 py-3 mt-4 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none"
                  disabled={loading}
                >
                  Update TAWG
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-6 py-3 mt-4 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 focus:outline-none"
                  disabled={loading}
                >
                  Delete
                </button>
              </div>
            </form>
            
            {error && <p className="text-red-500 text-center">{error}</p>}
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

export default EditNote