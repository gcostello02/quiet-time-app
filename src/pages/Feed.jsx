import React, { useEffect, useState, useRef } from "react"
import Navbar from "../components/Navbar"
import { UserAuth } from "../context/AuthContext"
import { supabase } from "../supabaseClient"
import Post from "../components/Post"
import Footer from "../components/Footer"
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import chaptersData from "../data/Chapters.json";

const Feed = () => {
  const { session } = UserAuth()
  const [loading, setLoading] = useState(true)
  const [posts, setPosts] = useState([])
  const [allPosts, setAllPosts] = useState([]) // Store all posts for filtering
  const [hasMore, setHasMore] = useState(true)
  const containerRef = useRef(null)
  const [today, setToday] = useState(false)
  const navigate = useNavigate();
  const [numFriendsDone, setNumFriendsDone] = useState(0)
  
  // Filter state
  const [selectedBook, setSelectedBook] = useState("")
  const [selectedChapter, setSelectedChapter] = useState("")
  const [availableChapters, setAvailableChapters] = useState([])
  const [filteredPosts, setFilteredPosts] = useState([]) // Store filtered posts

  const POSTS_LIMIT = 10
  const books = Object.keys(chaptersData)

  useEffect(() => {
    if (session?.user?.id) {
      fetchCompletedToday()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id])

  useEffect(() => {
    if (session?.user?.id && today) {
      fetchFriendsDone()
      fetchPosts() // Always start with page 1
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [today, session?.user?.id])

  // Update available chapters when book changes
  useEffect(() => {
    if (selectedBook) {
      const chapters = [];
      for (let i = 1; i <= chaptersData[selectedBook]; i++) {
        chapters.push(i);
      }
      setAvailableChapters(chapters);
      setSelectedChapter(""); // Reset chapter when book changes
    } else {
      setAvailableChapters([]);
      setSelectedChapter("");
    }
  }, [selectedBook]);

  // Filter posts when filter changes
  useEffect(() => {
    if (allPosts.length > 0) {
      filterPosts();
    }
  }, [selectedBook, selectedChapter, allPosts]);

  const filterPosts = async () => {
    if (!selectedBook && !selectedChapter) {
      // No filter applied, show all posts
      setFilteredPosts(allPosts);
      setPosts(allPosts.slice(0, POSTS_LIMIT));
      setHasMore(allPosts.length > POSTS_LIMIT);
      return;
    }

    // Get all posts with their references for filtering
    const postsWithReferences = await Promise.all(
      allPosts.map(async (post) => {
        const { data: references } = await supabase
          .from('note_references')
          .select('book, chapter')
          .eq('note_id', post.id);
        
        return {
          ...post,
          references: references || []
        };
      })
    );

    // Filter posts based on selected book and chapter
    const filtered = postsWithReferences.filter(post => {
      if (!post.references || post.references.length === 0) {
        return false; // Skip posts without references when filter is active
      }

      return post.references.some(ref => {
        const bookMatches = !selectedBook || ref.book === selectedBook;
        const chapterMatches = !selectedChapter || ref.chapter === parseInt(selectedChapter);
        return bookMatches && chapterMatches;
      });
    });

    setFilteredPosts(filtered);
    setPosts(filtered.slice(0, POSTS_LIMIT));
    setHasMore(filtered.length > POSTS_LIMIT);
  };

  const clearFilters = () => {
    setSelectedBook("");
    setSelectedChapter("");
  };

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

  const fetchPosts = async () => {
    setLoading(true);
  
    const friendIds = await fetchFriendIds();
    friendIds.push(session.user.id);
  
    // Fetch all posts instead of paginating
    const { data: newPosts, error } = await supabase
      .from("notes")
      .select("*")
      .in("visibility", ["public_all", "public_friends", "private_anonymous"])
      .order("created_at", { ascending: false });
  
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
  
    const uniquePosts = Array.from(new Set(filteredPosts.map(post => post.id)))
      .map(id => filteredPosts.find(post => post.id === id));
  
    setAllPosts(uniquePosts);
    
    // Apply current filter to the new data
    if (!selectedBook && !selectedChapter) {
      setPosts(uniquePosts.slice(0, POSTS_LIMIT));
      setHasMore(uniquePosts.length > POSTS_LIMIT);
    } else {
      // Filter will be applied in the useEffect
      setHasMore(uniquePosts.length > POSTS_LIMIT);
    }
  
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
      const currentPosts = selectedBook || selectedChapter ? filteredPosts : allPosts;
      const currentCount = posts.length;
      const nextPosts = currentPosts.slice(currentCount, currentCount + POSTS_LIMIT);
      setPosts([...posts, ...nextPosts]);
      setHasMore(currentCount + POSTS_LIMIT < currentPosts.length);
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
          <div className="max-w-2xl mx-auto p-6 space-y-8">
            {/* Bible Filter */}
            <div className="bg-white shadow rounded-xl p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <label htmlFor="book-select" className="block text-sm font-medium text-gray-700 mb-1">
                    Book
                  </label>
                  <select
                    id="book-select"
                    value={selectedBook}
                    onChange={(e) => setSelectedBook(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900"
                  >
                    <option value="">All Books</option>
                    {books.map((book) => (
                      <option key={book} value={book}>
                        {book.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex-1">
                  <label htmlFor="chapter-select" className="block text-sm font-medium text-gray-700 mb-1">
                    Chapter
                  </label>
                  <select
                    id="chapter-select"
                    value={selectedChapter}
                    onChange={(e) => setSelectedChapter(e.target.value)}
                    disabled={!selectedBook}
                    className="w-full px-3 py-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">All Chapters</option>
                    {availableChapters.map((chapter) => (
                      <option key={chapter} value={chapter}>
                        {chapter}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-gray-600 transition-colors duration-200 text-sm font-medium"
                  >
                    Clear
                  </button>
                </div>
              </div>
              
              {(selectedBook || selectedChapter) && (
                <div className="mt-3 text-sm text-gray-600">
                  <span className="font-medium">Active filters:</span>
                  {selectedBook && (
                    <span className="ml-2 px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs">
                      {selectedBook.replace(/_/g, " ")}
                    </span>
                  )}
                  {selectedChapter && (
                    <span className="ml-2 px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs">
                      Chapter {selectedChapter}
                    </span>
                  )}
                </div>
              )}
            </div>

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