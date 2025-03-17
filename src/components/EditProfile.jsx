import React, { useEffect, useState } from "react";
import { UserAuth } from "../context/AuthContext";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import esvData from "../data/ESV.json";

const EditProfile = () => {
  const { session, setProfile } = UserAuth(); 
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [prayerreq, setPrayer] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedBook, setSelectedBook] = useState("Genesis");
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [startVerse, setStartVerse] = useState(1);
  const [endVerse, setEndVerse] = useState(1);

  const books = Object.keys(esvData);
  const chapters = Object.keys(esvData[selectedBook]);
  const verses = esvData[selectedBook]?.[selectedChapter]?.length ?? 0;

  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.user) return;

      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        setError("Failed to load profile.");
      } else {
        setUsername(data.username || "");
        setDescription(data.description || "");
        setPreviewUrl(
          data.avatar_url ||
            "https://www.nicepng.com/png/detail/933-9332131_profile-picture-default-png.png"
        );
        setName(data.name || "");
        setPrayer(data.prayer_req || "");
      }

      setLoading(false);
    };

    fetchProfile();
  }, [session]);

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
            <label className="block text-sm font-medium">Prayer Request (Max 200 chars)</label>
            <textarea
              value={prayerreq}
              onChange={(e) => setPrayer(e.target.value)}
              maxLength={200}
              className="w-full mt-1 p-2 border rounded-md dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-300">Favorite Verse(s)</label>
            <div className="flex">
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

          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded-md flex justify-center dark:bg-blue-700"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>

        {error && <p className="text-center text-red-500">{error}</p>}
      </div>
    </div>
  );
};

export default EditProfile;
