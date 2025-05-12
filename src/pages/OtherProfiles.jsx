import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { supabase } from "../supabaseClient";
import { UserAuth } from "../context/AuthContext";
import Footer from "../components/Footer";

const OtherProfilePage = () => {
  const { profileId } = useParams();
  const navigate = useNavigate();
  const { session } = UserAuth();

  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  const [notes, setNotes] = useState([]);
  const [visibleCount, setVisibleCount] = useState(9);
  const [profile, setProfile] = useState(null);
  const [isFriend, setIsFriend] = useState(false);

  useEffect(() => {
    if (profileId === session?.user?.id) {
      navigate("/profile");
    }
  }, [profileId, session?.user?.id, navigate]);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", profileId)
        .single();

      if (error || !profile) {
        navigate("/dashboard");
        return;
      }

      setProfile(profile);
      setLoading(false);
    };

    fetchProfile();
  }, [profileId, navigate]);

  useEffect(() => {
    const checkIfFriend = async () => {
      if (!session?.user?.id || !profileId) return;

      const { data, error } = await supabase
        .from("friends")
        .select("*")
        .or(`user_id.eq.${session.user.id},friend_id.eq.${session.user.id}`)
        .eq("user_id", profileId);

      if (!error && data.length > 0) {
        setIsFriend(true);
      }
    };

    checkIfFriend();
  }, [profileId, session?.user?.id]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!profile) return;

      const { data: dateData, error } = await supabase
        .from("notes")
        .select("created_at")
        .eq("user_id", profileId);

      if (error) {
        console.error("Error fetching note stats:", error);
        return;
      }

      const dates = dateData.map((n) => new Date(n.created_at));
      const today = new Date();
      const todayStr = today.toLocaleDateString();
      const dateSet = new Set(dates.map((date) => date.toLocaleDateString()));

      let currentStreak = 0;
      let checkingDate = new Date(today);

      if (!dateSet.has(todayStr)) {
        checkingDate.setDate(checkingDate.getDate() - 1);
      }

      while (true) {
        const dateStr = checkingDate.toLocaleDateString();
        if (dateSet.has(dateStr)) {
          currentStreak++;
          checkingDate.setDate(checkingDate.getDate() - 1);
        } else {
          break;
        }
      }

      setStreak(currentStreak);
    };

    fetchStats();
  }, [profile, profileId]);

  useEffect(() => {
    const fetchNotes = async () => {
      if (!profile || !isFriend) return;

      const { data, error } = await supabase
        .from("notes")
        .select(`
          id,
          title,
          created_at,
          note_references (
            book,
            chapter
          )
        `)
        .eq("user_id", profileId)
        .in("visibility", ["public_all", "public_friends"])
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching notes:", error);
        return;
      }

      setNotes(data);
    };

    fetchNotes();
  }, [profile, profileId, isFriend]);

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

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="max-w-5xl mx-auto p-6 space-y-8 mt-6">
          <div className="bg-white shadow rounded-xl p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-4 sm:space-y-0">
              <img
                src={profile.avatar_url || "https://fkyfymxgbyyznrctanvs.supabase.co/storage/v1/object/public/profile-pictures/avatars/logo.png"}
                alt="Profile Avatar"
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-gray-300 self-center sm:self-auto"
              />

              <div className="flex-1 w-full min-w-0">
                <h2 className="text-2xl font-semibold text-gray-900 break-words">
                  {profile.username || "Username"}
                </h2>

                {profile.name?.length > 0 && (
                  <h4 className="text-md font-semibold text-gray-900 break-words">
                    {profile.name}
                  </h4>
                )}

                <div className="mt-3 max-w-full overflow-hidden">
                  <p className="text-sm text-gray-500">Bio</p>
                  <p className="text-gray-700 break-words whitespace-pre-wrap">
                    {profile.description || "No description yet."}
                  </p>
                </div>

                <div className="mt-3 max-w-full overflow-hidden">
                  <p className="text-sm text-gray-500">Prayer Request</p>
                  <p className="text-gray-700 break-words whitespace-pre-wrap">
                    {profile.prayer_req_display ? profile.prayer_req : "None"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-around text-center border-t pt-4">
              <div className="">
                <p className="text-sm text-gray-500">Favorite Verse(s)</p>
                <p className="text-lg font-semibold text-gray-900">
                  {profile.life_verse_display 
                    ? `${profile.life_verse_book} ${profile.life_verse_chapter}:${profile.life_verse_start}${profile.life_verse_start !== profile.life_verse_end ? `-${profile.life_verse_end}` : ""}` : "None"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">TAWG Streak</p>
                <p className="text-lg font-semibold text-gray-900">{streak}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Memory Verse(s)</p>
                <p className="text-lg font-semibold text-gray-900">
                  {profile.mem_verse_display 
                    ? `${profile.mem_verse_book} ${profile.mem_verse_chapter}:${profile.mem_verse_start}${profile.mem_verse_start !== profile.mem_verse_end ? `-${profile.mem_verse_end}` : ""}` : "None"}
                </p>
              </div>
            </div>

            {notes.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">TAWG Entries:</h3>
                
                {notes.length === 0 ? (
                  <p className="text-gray-500">No TAWG entries yet</p>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {notes.slice(0, visibleCount).map(note => (
                        <Link to={`/entries/${note.id}`} key={note.id} className="block border p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition">
                          <p className="text-xs text-gray-500 italic">
                            {new Date(note.created_at).toLocaleDateString()}
                          </p>
                          <h4 className="text-md font-bold text-gray-900 mb-1 break-words">{note.title}</h4>
                          {note.note_references?.length > 0 && (
                            <div className="flex flex-wrap gap-1 text-sm">
                              {note.note_references.map((ref, index) => (
                                <span key={index} className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs">
                                  {ref.book} {ref.chapter}
                                </span>
                              ))}
                            </div>
                          )}
                        </Link>
                      ))}
                    </div>

                    {visibleCount < notes.length && (
                      <div className="flex justify-center mt-4">
                        <button
                          onClick={() => setVisibleCount(visibleCount + 9)}
                          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                        >
                          Load More
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OtherProfilePage;