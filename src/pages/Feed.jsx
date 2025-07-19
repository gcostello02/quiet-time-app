import React, { useEffect, useState, useRef } from "react"
import Navbar from "../components/Navbar"
import { UserAuth } from "../context/AuthContext"
import { supabase } from "../supabaseClient"
import Post from "../components/Post"
import Footer from "../components/Footer"
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const Feed = () => {
  const { session } = UserAuth()
  const [loading, setLoading] = useState(true)
  const [posts, setPosts] = useState([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const containerRef = useRef(null)
  const [today, setToday] = useState(false)
  const navigate = useNavigate();
  const [numFriendsDone, setNumFriendsDone] = useState(0)

  const POSTS_LIMIT = 10

  useEffect(() => {
    if (session?.user?.id) {
      fetchCompletedToday()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id])

  useEffect(() => {
    if (session?.user?.id && today) {
      fetchFriendsDone()
      fetchPosts(1) // Always start with page 1
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [today, session?.user?.id])

  const fetchCompletedToday = async () => {
    const { data: dateData } = await supabase
      .from("notes")
      .select("created_at")
      .eq("user_id", session?.user?.id);

    if (dateData) {
      const dates = dateData.map(n => new Date(n.created_at));
      const today = new Date(); 
      const todayStr = today.toLocaleDateString(); 

      const dateSet = new Set(dates.map(date => date.toLocaleDateString()));

      if (!dateSet.has(todayStr)) {
        setToday(false)
      }
      else {
        setToday(true)
      }
    }
  }

  const fetchPosts = async (pageNum) => {
    setLoading(true);
  
    const friendIds = await fetchFriendIds();
    friendIds.push(session.user.id);
  
    const offset = (pageNum - 1) * POSTS_LIMIT;
  
    const { data: newPosts, error } = await supabase
      .from("notes")
      .select("*")
      .in("visibility", ["public_all", "public_friends", "private_anonymous"])
      .order("created_at", { ascending: false })
      .range(offset, offset + POSTS_LIMIT - 1);
  
    if (error) {
      console.error("Error fetching posts:", error);
      setLoading(false);
      return;
    }
  
    const filteredPosts = newPosts.filter((post) => {
      const isFriend = friendIds.includes(post.user_id);
      if (isFriend) {
        if (post.visibility === "public_all" || post.visibility === "public_friends") {
          post.anonymous = false;
          return true;
        } else if (post.visibility === "private_anonymous") {
          post.anonymous = true;
          return true;
        } else {
          return false;
        }
      } else {
        post.anonymous = true;
        return post.visibility === "public_all" || post.visibility === "private_anonymous";
      }
    });
  
    // If it's page 1, replace all posts. Otherwise, append new posts
    const allPosts = pageNum === 1 ? filteredPosts : [...posts, ...filteredPosts];
  
    const uniquePosts = Array.from(new Set(allPosts.map(post => post.id)))
      .map(id => allPosts.find(post => post.id === id));
  
    setPosts(uniquePosts);
  
    const hasMorePosts = filteredPosts.length >= POSTS_LIMIT;
  
    setHasMore(hasMorePosts);
    setPage(pageNum);
    setLoading(false);
  }

  const fetchFriendIds = async () => {
    const { data: friendsData, error } = await supabase
      .from("friends")
      .select("friend_id")
      .eq("user_id", session.user.id)

    if (error) {
      console.error("Error fetching friends:", error)
      return []
    }

    return friendsData.map((f) => f.friend_id)
  }

  const fetchFriendsDone = async () => {
    setLoading(true);

    const friendIds = await fetchFriendIds();
    const todayStr = new Date().toLocaleDateString();

    const doneChecks = await Promise.all(
      friendIds.map(async (id) => {
        const { data } = await supabase
          .from("notes")
          .select("created_at")
          .eq("user_id", id);

        if (data) {
          const dateSet = new Set(data.map(n => new Date(n.created_at).toLocaleDateString()));
          return dateSet.has(todayStr);
        }

        return false;
      })
    );

    const totalDone = doneChecks.filter(Boolean).length;
    setNumFriendsDone(totalDone);
    setLoading(false);
  }

  const handleShowMore = () => {
    if (hasMore && !loading) {
      fetchPosts(page + 1);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      <main className="flex-grow" ref={containerRef}>
        {!today && (
          <div className="max-w-5xl mx-auto p-6 space-y-8">
            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-center text-3xl font-bold text-gray-900 mb-2">
                🚨 It Looks Like You Haven't Done Your TAWG Yet 🚨
              </h2>
              <p className="text-center font-bold text-gray-700">
                You must do your TAWG before viewing the Feed
              </p>
              <p className="text-center font-bold text-gray-700">
                Click the button and do it right now!
              </p>
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => navigate("/tawg")}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md shadow-md"
                >
                  Let's Go
                </button>
              </div>
            </div>
          </div>
        )}
        {today && (
          <div className="max-w-4xl mx-auto pr-6 pl-6 pt-6">
            <div className="bg-white shadow rounded-xl p-4 mx-auto">
              <h2 className="text-center text-5xl font-bold text-gray-900 mb-2">
                {numFriendsDone}
              </h2>
              <p className="text-center text-xl font-bold text-gray-700">
                of your friends have done their TAWG today
              </p>
              <Link
                to={"/accountability"}
                className="text-indigo-600 text-center font-bold flex justify-center text-xl hover:underline mt-1"
              >
                Click here to check on your friends' progress and hold them accountable!
              </Link>
            </div>
          </div>
        )}
        {today && (
          <div className="max-w-2xl mx-auto pb-6 pr-6 pl-6 space-y-8">
            {posts.map((post) => (
              <Post note={post} key={post.id} />
            ))}
            {loading && (
              <div className="flex justify-center items-center mt-5">
                <div className="spinner-border animate-spin h-8 w-8 border-4 border-t-transparent border-indigo-600 rounded-full"></div>
              </div>
            )}
            {hasMore && !loading && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={handleShowMore}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-colors duration-200 font-semibold"
                >
                  Show More
                </button>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}

export default Feed