import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { UserAuth } from '../context/AuthContext';
import { supabase } from "../supabaseClient";

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

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <Navbar />
      <div className="max-w-lg mx-auto mt-10 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="flex justify-between border-b mb-4">
          {["requests", "friends", "notifications"].map((item) => (
            <button 
              key={item} 
              onClick={() => setTab(item)} 
              className={`w-1/3 py-2 text-center ${tab === item ? "border-b-2 border-blue-500 font-bold" : "text-gray-500"}`}
            >
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-center">Loading...</p>
        ) : tab === "requests" ? (
          <div>
            {pendingRequests.length !== 0 ? (
              <>
                <h3 className="text-lg font-semibold mt-4 mb-2">Pending Requests</h3>
                {pendingRequests.map((req) => (
                  <div key={req.receiver_id} className="flex justify-between items-center border p-2 rounded mb-2">
                    <span>{req.profiles.username}</span>
                    <span className="text-gray-500">Pending</span>
                  </div>
                ))}
              </>
            ) : null}
            <h3 className="text-lg font-semibold mb-2">Add Friends</h3>
            <input
              type="text"
              placeholder="Search users..."
              className="w-full p-2 mb-3 border rounded-lg dark:bg-gray-700 dark:text-white"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {users.length === 0 ? (
              <p>No users available to add.</p>
            ) : (
              users
                .filter((user) => user.username.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((user) => (
                  <div key={user.id} className="flex justify-between items-center border p-2 rounded-lg mb-2 dark:bg-gray-700">
                    <span>{user.username}</span>
                    <button onClick={() => sendFriendRequest(user.id)} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg">
                      Send Request
                    </button>
                  </div>
                ))
            )}
          </div>
        ) : tab === "friends" ? (
          <div>
            <h3 className="text-lg font-semibold mb-2">Friends</h3>
            {friends.length === 0 ? (
              <p>No friends yet.</p>
            ) : (
              friends.map((friend) => (
                <div key={friend.friend_id} className="flex justify-between items-center border p-3 rounded-lg dark:bg-gray-700">
                  <span>{friend.profiles.username}</span>
                  <button onClick={() => removeFriend(friend.friend_id)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg">
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
        ) : (
          <div>
            <h3 className="text-lg font-semibold mb-2">Received Requests</h3>
            {receivedRequests.length === 0 ? (
              <p>No received requests.</p>
            ) : (
              receivedRequests.map((req) => (
                <div key={req.sender_id} className="flex justify-between items-center border p-3 rounded-lg dark:bg-gray-700">
                  <span>{req.profiles.username}</span>
                  <div>
                    <button onClick={() => acceptFriendRequest(req.sender_id)} className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg mr-2">
                      Accept
                    </button>
                    <button onClick={() => declineFriendRequest(req.sender_id)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg">
                      Decline
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Friends;
