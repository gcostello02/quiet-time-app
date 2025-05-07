import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { UserAuth } from '../context/AuthContext';
import { supabase } from "../supabaseClient";
import { Link } from "react-router-dom";

const Friends = () => {
  const { session } = UserAuth();
  const [tab, setTab] = useState("requests");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (session?.user?.id) {
      fetchUsers();
      fetchPendingRequests();
      fetchReceivedRequests();
      fetchFriends();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const fetchUsers = async () => {
    setLoading(true);
    const { data: allUsers, error: profilesError } = await supabase
      .from("profiles")
      .select("id, username")
      .neq("id", session?.user?.id);

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      setLoading(false);
      return;
    }

    const { data: friendsData } = await supabase
      .from("friends")
      .select("friend_id")
      .eq("user_id", session?.user?.id);

    const friendIds = new Set(friendsData?.map((f) => f.friend_id));

    const { data: friendRequestsData } = await supabase
      .from("friend_requests")
      .select("receiver_id")
      .eq("sender_id", session?.user?.id);

    const friendRequestIds = new Set(friendRequestsData?.map((f) => f.receiver_id));

    const filteredUsers = allUsers.filter(user => !friendIds.has(user.id) && !friendRequestIds.has(user.id));
    setUsers(filteredUsers);
    setLoading(false);
  };

  const sendFriendRequest = async (receiverId) => {
    if (!session) return;

    await supabase
      .from("friend_requests")
      .insert([{ sender_id: session.user.id, receiver_id: receiverId }]);

    fetchUsers();
  };

  const fetchPendingRequests = async () => {
    const { data } = await supabase
      .from('friend_requests')
      .select(`receiver_id, profiles!friend_requests_receiver_id_fkey(id, username) as receiver_profile`)
      .eq("sender_id", session?.user?.id);

    setPendingRequests(data);
  };

  const fetchReceivedRequests = async () => {
    const { data } = await supabase
      .from("friend_requests")
      .select(`sender_id, profiles!friend_requests_sender_id_fkey(id, username) as sender_profile`)
      .eq("receiver_id", session?.user?.id)

    setReceivedRequests(data);
  };

  const acceptFriendRequest = async (senderId) => {
    await supabase.from("friends").insert([
      { user_id: session.user.id, friend_id: senderId },
      { user_id: senderId, friend_id: session.user.id },
    ]);

    await supabase.from("friend_requests")
      .delete()
      .eq("sender_id", senderId)
      .eq("receiver_id", session.user.id);

    fetchReceivedRequests();
    fetchFriends();
  };

  const declineFriendRequest = async (senderId) => {
    await supabase.from("friend_requests")
      .delete()
      .eq("sender_id", senderId)
      .eq("receiver_id", session.user.id);

    fetchReceivedRequests();
  };

  const fetchFriends = async () => {
    const { data } = await supabase
      .from("friends")
      .select(`friend_id, profiles!friends_friend_id_fkey(username) as friend_profile`)
      .eq("user_id", session?.user?.id);

    setFriends(data);
  };

  const removeFriend = async (friendId) => {
    await supabase.from("friends")
      .delete()
      .eq("user_id", session.user.id)
      .eq("friend_id", friendId);

    await supabase.from("friends")
      .delete()
      .eq("user_id", friendId)
      .eq("friend_id", session.user.id);

    fetchFriends();
  };

  const TabButton = ({ label, active, onClick }) => (
    <button
      onClick={onClick}
      className={`w-1/3 py-2 text-center ${active ? "bg-indigo-600 text-gray-100 font-bold" : "text-gray-500"}`}
    >
      {label.charAt(0).toUpperCase() + label.slice(1)}
    </button>
  );
  
  const UserCard = ({ username, rightElement }) => (
    <div className="flex justify-between items-center border p-2 rounded-lg mb-2 dark:bg-gray-700">
      <span>{username}</span>
      {rightElement}
    </div>
  );
  
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <Navbar />
      <div className="max-w-2xl mx-auto mt-12 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
        <div className="flex border-b border-gray-300 dark:border-gray-600 mb-6">
          {["requests", "friends", "notifications"].map((item) => (
            <button
              key={item}
              onClick={() => setTab(item)}
              className={`w-1/3 py-3 text-lg font-medium transition-colors ${
                tab === item
                  ? "bg-indigo-600 text-white rounded-t-md"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </button>
          ))}
        </div>
  
        {loading ? (
          <p className="text-center text-gray-500 dark:text-gray-400">Loading...</p>
        ) : tab === "requests" ? (
          <div className="space-y-6">
            {pendingRequests.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Pending Requests</h3>
                <div className="space-y-3">
                  {pendingRequests.map((req) => (
                    <div key={req.receiver_id} className="flex justify-between items-center p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      <Link
                        to={`/profiles/${req.profiles.id}`}
                        key={req.profiles.id}
                      >
                        <p className='text-lg font-semibold text-gray-900 dark:text-white hover:text-indigo-600'>{req.profiles.username}</p>
                      </Link>
                      <span className="text-sm text-gray-500">Pending</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
  
            <div>
              <h3 className="text-lg font-semibold mb-3">Add Friends</h3>
              <input
                type="text"
                placeholder="Search users..."
                className="w-full p-3 mb-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {users.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">No users available to add.</p>
              ) : (
                <div className="space-y-3">
                  {users
                    .filter((user) => user.username.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((user) => (
                      <div key={user.id} className="flex justify-between items-center p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <Link
                          to={`/profiles/${user.id}`}
                          key={user.id}
                        >
                          <p className='text-lg font-semibold text-gray-900 dark:text-white hover:text-indigo-600'>{user.username}</p>
                        </Link>
                        <button
                          onClick={() => sendFriendRequest(user.id)}
                          className="bg-indigo-600 hover:bg-indigo-600 text-white px-4 py-1.5 rounded-lg transition"
                        >
                          Send Request
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        ) : tab === "friends" ? (
          <div>
            <h3 className="text-lg font-semibold mb-4">Friends</h3>
            {friends.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No friends yet.</p>
            ) : (
              <div className="space-y-3">
                {friends.map((friend) => (
                  <div key={friend.friend_id} className="flex justify-between items-center p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <Link
                      to={`/profiles/${friend.friend_id}`}
                      key={friend.friend_id}
                    >
                      <p className='text-lg font-semibold text-gray-900 dark:text-white hover:text-indigo-600'>{friend.profiles.username}</p>
                    </Link>
                    <button
                      onClick={() => removeFriend(friend.friend_id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-lg transition"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <h3 className="text-lg font-semibold mb-4">Received Requests</h3>
            {receivedRequests.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No received requests.</p>
            ) : (
              <div className="space-y-3">
                {receivedRequests.map((req) => (
                  <div key={req.sender_id} className="flex justify-between items-center p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <Link
                      to={`/profiles/${req.sender_id}`}
                      key={req.sender_id}
                    >
                      <p className='text-lg font-semibold text-gray-900 dark:text-white hover:text-indigo-600'>{req.profiles.username}</p>
                    </Link>
                    <div className="flex gap-2">
                      <button
                        onClick={() => acceptFriendRequest(req.sender_id)}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-1.5 rounded-lg transition"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => declineFriendRequest(req.sender_id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-lg transition"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );  
};

export default Friends;
