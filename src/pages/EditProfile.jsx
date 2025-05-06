import React, { useEffect, useState } from "react";
import { UserAuth } from "../context/AuthContext";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import esvData from "../data/ESV.json";

const EditProfile = () => {
  const { session, setProfile, profile } = UserAuth(); 
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [displayPrayer, setDisplayPrayer] = useState(false);
  const [prayerreq, setPrayer] = useState("");

  const [avatar, setAvatar] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [selectedBook, setSelectedBook] = useState("Genesis");
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [startVerse, setStartVerse] = useState(1);
  const [endVerse, setEndVerse] = useState(1);
  const [displayVerse, setDisplayVerse] = useState(false);
  const books = Object.keys(esvData);
  const chapters = Object.keys(esvData[selectedBook]);
  const verses = esvData[selectedBook]?.[selectedChapter]?.length ?? 0;

  const [selectedMemBook, setSelectedMemBook] = useState("Genesis");
  const [selectedMemChapter, setSelectedMemChapter] = useState(1);
  const [startMemVerse, setStartMemVerse] = useState(1);
  const [endMemVerse, setEndMemVerse] = useState(1);
  const [displayMemVerse, setDisplayMemVerse] = useState(false);
  const chaptersMem = Object.keys(esvData[selectedMemBook]);
  const versesMem = esvData[selectedMemBook]?.[selectedMemChapter]?.length ?? 0;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!profile) {
      navigate("/profile")
    }

    setUsername(profile.username || "");
    setDescription(profile.description || "");
    setPreviewUrl(
      profile.avatar_url ||
        "https://www.nicepng.com/png/detail/933-9332131_profile-picture-default-png.png"
    );
    setName(profile.name || "");
    setPrayer(profile.prayer_req || "");
    setSelectedBook(profile.life_verse_book || "Genesis");
    setSelectedChapter(profile.life_verse_chapter || 1);
    setStartVerse(profile.life_verse_start || 1);
    setEndVerse(profile.life_verse_end || 1);
    setDisplayPrayer(profile.prayer_req_display || false);
    setDisplayVerse(profile.life_verse_display || false);
    setDisplayMemVerse(profile.mem_verse_display || false);
    setSelectedMemBook(profile.mem_verse_book || "Genesis");
    setSelectedMemChapter(profile.mem_verse_chapter || 1);
    setStartMemVerse(profile.mem_verse_start || 1);
    setEndMemVerse(profile.mem_verse_end || 1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setAvatar(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
  
    let avatarUrl = previewUrl;
  
    if (avatar) {
      const filePath = `avatars/${session.user.id}.${avatar.name}`;
      const { error: uploadError } = await supabase.storage
        .from("profile-pictures")
        .upload(filePath, avatar, { upsert: true });
  
      if (uploadError) {
        console.error("Error uploading avatar:", uploadError);
        setError("Failed to upload image.");
        setLoading(false);
        return;
      }
  
      avatarUrl = supabase.storage.from("profile-pictures").getPublicUrl(filePath).data.publicUrl;
    }
  
    const updatedProfile = {
      username: username,
      description: description,
      avatar_url: avatarUrl,
      name: name,
      prayer_req: prayerreq,
      prayer_req_display: displayPrayer,
      life_verse_display: displayVerse,
      life_verse_book: selectedBook,
      life_verse_chapter: selectedChapter,
      life_verse_start: startVerse,
      life_verse_end: endVerse,
      mem_verse_display: displayMemVerse,
      mem_verse_book: selectedMemBook,
      mem_verse_chapter: selectedMemChapter,
      mem_verse_start: startMemVerse,
      mem_verse_end: endMemVerse
    };
  
    try {
      const { error: updateError } = await supabase
        .from("profiles")
        .update(updatedProfile)
        .eq("id", session.user.id);
  
      if (updateError) {
        if (updateError.code === "23505") {
          setError("Username is already taken. Please choose another one.");
        } else {
          console.error("Error updating profile:", updateError);
          setError("Failed to update profile.");
        }
      } else {
        setProfile(updatedProfile);
        navigate("/profile");
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("An unexpected error occurred.");
    }
  
    setLoading(false);
  };  

  if (!session) {
    return <p className="text-center mt-10">Please sign in to edit your profile.</p>;
  }

  return (
    <div>
      <Navbar />
      <div className="max-w-lg mx-auto mt-10 bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-center">Edit Profile</h2>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="flex flex-col items-center">
            <img
              src={previewUrl}
              alt="Profile Avatar"
              className="w-24 h-24 rounded-full"
            />
            <input
              type="file"
              onChange={handleFileChange}
              className="mt-2"
              accept="image/*"
            />
          </div>

          <div className="flex gap-4 justify-between">
            <div>
              <label className="block text-sm font-medium">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                maxLength={30}
                className="w-full mt-1 p-2 border rounded-md dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Your Name (optional)</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={30}
                className="w-full mt-1 p-2 border rounded-md dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">Description (Max 200 chars)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={200}
              className="w-full mt-1 p-2 border rounded-md dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block mt-2 cursor-pointer">
              <input
                type="checkbox"
                checked={displayPrayer}
                onChange={() => setDisplayPrayer(!displayPrayer)}
                className="mr-1 cursor-pointer"
              />
              Display Prayer Request
            </label>
          </div>

          {displayPrayer && (
            <div>
              <label className="block text-sm font-medium">Prayer Request (Max 200 chars)</label>
              <textarea
                value={prayerreq}
                onChange={(e) => setPrayer(e.target.value)}
                maxLength={200}
                className="w-full mt-1 p-2 border rounded-md dark:bg-gray-700 dark:text-white"
              />
            </div>
          )}

          <div>
            <label className="block mt-2 cursor-pointer">
              <input
                type="checkbox"
                checked={displayVerse}
                onChange={() => setDisplayVerse(!displayVerse)}
                className="mr-1 cursor-pointer"
              />
              Display Favorite Verse
            </label>
          </div>

          {displayVerse && (
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-300">Favorite Verse(s)</label>
              <div className="flex gap-4">
                <select
                  value={selectedBook}
                  onChange={(e) => {
                    setSelectedBook(e.target.value);
                    setSelectedChapter(1);
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
                  value={selectedChapter}
                  onChange={(e) => setSelectedChapter(Number(e.target.value))}
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
            
          )}

          {displayVerse && (
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-300">
                Verse(s) Start & End
              </label>
              <div className="flex gap-4">
                <select
                  value={startVerse}
                  onChange={(e) => {
                    setStartVerse(Number(e.target.value));
                    setEndVerse((prevEnd) => (prevEnd < Number(e.target.value) ? Number(e.target.value) : prevEnd));
                  }}
                  className="mt-1 block w-20 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white"
                >
                  {Array.from({ length: verses }, (_, i) => i + 1).map((verse) => (
                    <option key={verse} value={verse}>
                      {verse}
                    </option>
                  ))}
                </select>
                <select
                  value={endVerse}
                  onChange={(e) => setEndVerse(Number(e.target.value))}
                  className="mt-1 block w-20 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white"
                >
                  {Array.from({ length: verses - startVerse + 1 }, (_, i) => i + startVerse).map((verse) => (
                    <option key={verse} value={verse}>
                      {verse}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div>
            <label className="block mt-2 cursor-pointer">
              <input
                type="checkbox"
                checked={displayMemVerse}
                onChange={() => setDisplayMemVerse(!displayMemVerse)}
                className="mr-1 cursor-pointer"
              />
              Display Memory Verse
            </label>
          </div>

          {displayMemVerse && (
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-300">Memory Verse(s)</label>
              <div className="flex gap-4">
                <select
                  value={selectedMemBook}
                  onChange={(e) => {
                    setSelectedMemBook(e.target.value);
                    setSelectedMemChapter(1);
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
                  onChange={(e) => setSelectedMemChapter(Number(e.target.value))}
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

          {displayMemVerse && (
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-300">
                Verse(s) Start & End
              </label>
              <div className="flex gap-4">
                <select
                  value={startMemVerse}
                  onChange={(e) => {
                    setStartMemVerse(Number(e.target.value));
                    setEndMemVerse((prevEnd) => (prevEnd < Number(e.target.value) ? Number(e.target.value) : prevEnd));
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
                  onChange={(e) => setEndMemVerse(Number(e.target.value))}
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

          <div className="flex justify-evenly">
            <button
              type="button"
              onClick={() => navigate(`/profile`)}
              className="bg-gray-500 text-white rounded-lg shadow-md hover:bg-gray-600 focus:outline-none"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              className="bg-indigo-600 text-white p-2 rounded-lg flex dark:bg-indigo-700"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>

          </div>
        </form>

        {error && <p className="text-center text-red-500">{error}</p>}
      </div>
    </div>
  );
};

export default EditProfile;
