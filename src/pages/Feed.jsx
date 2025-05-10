import React, { useEffect, useState, useRef } from "react"
import Navbar from "../components/Navbar"
import { UserAuth } from "../context/AuthContext"
import { supabase } from "../supabaseClient"
import Post from "../components/Post"
import Footer from "../components/Footer"

const Feed = () => {
  const { session } = UserAuth()
  const [loading, setLoading] = useState(true)
  const [posts, setPosts] = useState([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const containerRef = useRef(null)

  const POSTS_LIMIT = 5

  useEffect(() => {
    if (session?.user?.id) {
      fetchPosts(page)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id])

  const fetchPosts = async (pageNum) => {
    setLoading(true)

    const friendIds = await fetchFriendIds()
    friendIds.push(session.user.id)

    const offset = (pageNum - 1) * POSTS_LIMIT

    const { data: newPosts, error } = await supabase
      .from("notes")
      .select("*")
      .in("visibility", ["public_all", "public_friends", "private_anonymous"])
      .order("created_at", { ascending: false })
      .range(offset, offset + POSTS_LIMIT - 1)

    if (error) {
      console.error("Error fetching posts:", error)
      setLoading(false)
      return
    }

    const filteredPosts = newPosts.filter((post) => {
      const isFriend = friendIds.includes(post.user_id)
      if (isFriend) {
        if (post.visibility === "public_all" || post.visibility === "public_friends") {
          post.anonymous = false
          return true
        } else if (post.visibility === "private_anonymous") {
          post.anonymous = true
          return true
        } else {
          return false
        }
      } else {
        post.anonymous = true
        return post.visibility === "public_all" || post.visibility === "private_anonymous"
      }
    })

    if (filteredPosts.length === 0) {
      setHasMore(false)
    }

    setPosts((prev) => [...prev, ...filteredPosts])
    setPage(pageNum)
    setLoading(false)
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

  useEffect(() => {
    const handleScroll = () => {
      if (
        containerRef.current &&
        window.innerHeight + window.scrollY >= containerRef.current.offsetHeight &&
        hasMore &&
        !loading
      ) {
        fetchPosts(page + 1)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, hasMore, loading])

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      <main className="flex-grow" ref={containerRef}>
        <div className="max-w-2xl mx-auto p-6 space-y-8">
          {posts.map((post) => (
            <Post note={post} key={post.id} />
          ))}
          {loading && (
            <div className="flex justify-center items-center mt-5">
              <div className="spinner-border animate-spin h-8 w-8 border-4 border-t-transparent border-indigo-600 rounded-full"></div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default Feed