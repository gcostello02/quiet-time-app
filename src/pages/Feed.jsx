import Navbar from "../components/Navbar"
import { UserAuth } from "../context/AuthContext"
import { useEffect, useState } from "react"
import { supabase } from "../supabaseClient"
import Post from "../components/Post"

const Feed = () => {
  const { session } = UserAuth() 
  const [loading, setLoading] = useState(true) 

  const [posts, setPosts] = useState([])
  const [page, setPage] = useState(1)

  const POSTS_LIMIT = 10

  useEffect(() => {
    if(session?.user?.id) {
      fetchPosts()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id])

  const fetchPosts = async (pageNum = 1) => {
    setLoading(true)

    const friendIds = await fetchFriendIds()
    friendIds.push(session.user.id)

    const offset = (pageNum - 1) * POSTS_LIMIT

    const { data: posts, error } = await supabase
      .from('notes')
      .select('*')
      .in('visibility', ['public_all', 'public_friends', 'private_anonymous'])
      .order('created_at', { ascending: false })
      .range(offset, offset + POSTS_LIMIT - 1)

    if (error) {
      console.error("Error fetching posts:", error)
      setLoading(false)
      return
    }

    const filteredPosts = posts.filter(post => {
      const isFriend = friendIds.includes(post.user_id)
      if (isFriend) {
        if (post.visibility === 'public_all' || post.visibility === 'public_friends') {
          post.anonymous = false
          return true
        }
        else if (post.visibility === 'private_anonymous') {
          post.anonymous = true
          return true
        }
        else {
          return false
        }
      } else {
        post.anonymous = true
        return post.visibility === 'public_all' || post.visibility === 'private_anonymous'
      }
    })

    if (pageNum === 1) {
      setPosts(filteredPosts)
    } else {
      setPosts(prev => [...prev, ...filteredPosts])
    }


    setPage(pageNum)
    setLoading(false)
  }

  const fetchFriendIds = async () => {
    const { data: friendsData, error } = await supabase
      .from('friends')
      .select('friend_id')
      .eq('user_id', session.user.id)
  
    if (error) {
      console.error('Error fetching friends:', error)
      return []
    }
  
    return friendsData.map(f => f.friend_id)
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
      <div className="max-w-4xl mx-auto">
      {posts.map((post) => {
        return <Post note={post} key={post.id}/>
      })}
      </div>
      <div className="flex justify-center mt-4">
        <button
          className="px-4 py-2 bg-indigo-600 text-white rounded"
          onClick={() => fetchPosts(page + 1)}
        >
          Load More
        </button>
      </div>
    </div>
  )
}

export default Feed
