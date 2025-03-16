import React, { useEffect, useState } from "react";
import { UserAuth } from "../context/AuthContext";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

const EditProfile = () => {
  const { session } = UserAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [description, setDescription] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
        setUsername(data.username);
        setDescription(data.description);
        setPreviewUrl(data.avatar_url);
      }

      setLoading(false);
    };

    fetchProfile();
  }, [session]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setAvatar(file);
      setPreviewUrl(URL.createObjectURL(file))
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    let avatarUrl = previewUrl;

    if (avatar) {
      const filePath = `avatars/${session.user.id}`;
      const { error: uploadError } = await supabase.storage
        .from("profile-pictures")
        .upload(filePath, avatar, { upsert: true });

      if (uploadError) {
        console.error("Error uploading avatar:", uploadError);
        setError("Failed to upload image.");
        setLoading(false);
        return;
      }

      avatarUrl = supabase.storage.from("profile-pictures").getPublicUrl(filePath);
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        username,
        description,
        avatar_url: avatarUrl.data.publicUrl,
      })
      .eq("id", session.user.id);

    if (updateError) {
      console.error("Error updating profile:", updateError);
      setError("Failed to update profile.");
    } else {
      navigate("/profile");
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

        {error && <p className="text-center text-red-500">{error}</p>}

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="flex flex-col items-center">
            <img
              src={previewUrl || "https://www.nicepng.com/png/detail/933-9332131_profile-picture-default-png.png"}
              alt="Profile Avatar"
              className="w-24 h-24 rounded-full"
            />
            <input type="file" onChange={handleFileChange} className="mt-2" />
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
            <label className="block text-sm font-medium">Description (Max 200 chars)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={200}
              className="w-full mt-1 p-2 border rounded-md dark:bg-gray-700 dark:text-white"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded-md flex justify-center dark:bg-blue-700"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-solid border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Save Changes"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
