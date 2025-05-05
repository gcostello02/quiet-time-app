import Navbar from "../components/Navbar"
import { UserAuth } from "../context/AuthContext"
import { useEffect, useState } from "react"
import { supabase } from "../supabaseClient"
import Post from "../components/Post"

const Feed = () => {
  const { session } = UserAuth() 
  const [loading, setLoading] = useState(true) 

  const [posts, setPosts] = useState([])

  useEffect(() => {
    if(session?.user?.id) {
      fetchPosts()
    }
  }, [session?.user?.id])

  const fetchPosts = async () => {
    setLoading(true)

    const { data: posts, error: error } = await supabase
      .from('notes')
      .select('*')

    if (error) {
      console.error("Error fetching posts:", error)
      setLoading(false)
      return
    }

    console.log(posts)
    setPosts(posts.reverse())
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <Navbar />
        <div className="flex justify-center items-center mt-5">
          <div className="spinner-border animate-spin h-8 w-8 border-4 border-t-transparent border-indigo-600 rounded-full"></div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">      
      <Navbar />
      <div className="max-w-4xl mx-auto pb-6">
        {posts.map((post) => (
          <Post note={post} key={post.id}></Post>
        ))}
      </div>
    </div>
  )
}

export default Feed
