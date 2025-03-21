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

  useEffect(() => {
    if (session?.user?.id) {
      fetchUsers()
      fetchPendingRequests()
      fetchReceivedRequests()
      fetchFriends()
    }
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

    const { data: friendsData, error: friendsError } = await supabase
      .from("friends")
      .select("friend_id")
      .eq("user_id", session?.user?.id);

    if (friendsError) {
      console.error("Error fetching friends:", friendsError);
      setLoading(false);
      return;
    }

    const friendIds = new Set(friendsData?.map((f) => f.friend_id));

    const { data: friendsRequestData, error: friendsRequestError } = await supabase
      .from("friend_requests")
      .select("receiver_id")
      .eq("sender_id", session?.user?.id);

    if (friendsRequestError) {
      console.error("Error fetching friends:", friendsRequestError);
      setLoading(false);
      return;
    }

    const friendRequestIds = new Set(friendsRequestData?.map((f) => f.receiver_id));

    const filteredUsers = allUsers.filter(user => !friendIds.has(user.id) && !friendRequestIds.has(user.id));
    setUsers(filteredUsers);

    setLoading(false);
  };

  const sendFriendRequest = async (receiverId) => {
    if (!session) return;
  
    const { error } = await supabase
      .from("friend_requests")
      .insert([{ sender_id: session.user.id, receiver_id: receiverId, status: "pending" }]);
  
    if (error) console.error("Error sending friend request:", error);
  
    fetchUsers();
  };

  const fetchPendingRequests = async () => {
    let { data, error } = await supabase
      .from('friend_requests')
      .select(`
        receiver_id,
        profiles!friend_requests_receiver_id_fkey(id, username) as receiver_profile
      `)
      .eq("sender_id", session?.user?.id)
  
    if (error) {
      console.error("Error fetching pending requests:", error);
      return;
    }
  
    setPendingRequests(data);
  };

  const fetchReceivedRequests = async () => {
    const { data, error } = await supabase
      .from("friend_requests")
      .select(`
        sender_id, 
        profiles!friend_requests_sender_id_fkey(id, username) as sender_profile`)
      .eq("receiver_id", session?.user?.id)
      .eq("status", "pending");

    if (error) {
      console.error("Error fetching received requests:", error);
      return;
    }
    
    setReceivedRequests(data);
  };

  const acceptFriendRequest = async (senderId) => {
    const { data, error } = await supabase.from("friends").insert([
      { user_id: session.user.id, friend_id: senderId },
      { user_id: senderId, friend_id: session.user.id },
    ]).select();

    console.log(data, error)

    await supabase.from("friend_requests")
      .delete()
      .eq("sender_id", senderId)
      .eq("receiver_id", session.user.id);

    await supabase.from("friend_requests")
      .delete()
      .eq("receiver_id", senderId)
      .eq("sender_id", session.user.id);

    fetchReceivedRequests();
  }

  const declineFriendRequest = async (senderId) => {
    await supabase.from("friend_requests")
      .delete()
      .eq("sender_id", senderId)
      .eq("receiver_id", session.user.id);

    fetchReceivedRequests();
  }

  
  const fetchFriends = async () => {
    const { data, error } = await supabase
      .from("friends")
      .select(`
        friend_id, 
        profiles!friends_friend_id_fkey(username) as friend_profile`)
      .eq("user_id", session?.user?.id);

    if (!error) {
      setFriends(data);
    }
  }

  return (
    <div>
      <Navbar />
      <div className="max-w-lg mx-auto mt-10 bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
        <div className="flex justify-between border-b mb-4">
          <button onClick={() => setTab("requests")} className={`w-1/3 py-2 ${tab === "requests" ? "border-b-2 border-blue-500 font-bold" : ""}`}>
            Find Friends
          </button>
          <button onClick={() => setTab("friends")} className={`w-1/3 py-2 ${tab === "friends" ? "border-b-2 border-blue-500 font-bold" : ""}`}>
            Friends
          </button>
          <button onClick={() => setTab("notifications")} className={`w-1/3 py-2 ${tab === "notifications" ? "border-b-2 border-blue-500 font-bold" : ""}`}>
            Received
          </button>
        </div>

        {loading ? (
          <p className="text-center">Loading...</p>
        ) : tab === "requests" ? (
          <div>
            {pendingRequests.length !== 0 && (
              <>
                <h3 className="text-lg font-semibold mt-4 mb-2">Pending Requests</h3>
                {pendingRequests.map((req) => (
                  <div key={req.receiver_id} className="flex justify-between items-center border p-2 rounded mb-2">
                    <span>{req.profiles.username}</span>
                    <span className="text-gray-500">Pending</span>
                  </div>
                ))}
              </>
            )}
            <h3 className="text-lg font-semibold mb-2">Add Friends</h3>
            {users.length === 0 ? <p>No users available to add.</p> : users.map((user) => (
              <div key={user.id} className="flex justify-between items-center border p-2 rounded mb-2">
                <span>{user.username}</span>
                <button onClick={() => sendFriendRequest(user.id)} className="bg-blue-500 text-white px-3 py-1 rounded">Send Request</button>
              </div>
            ))}
          </div>
        ) : tab === "friends" ? (
          <div>
            <h3 className="text-lg font-semibold mb-2">Friends</h3>
            {friends.length === 0 ? (
              <p>No friends yet.</p>
            ) : (
              friends.map((friend) => (
                <div key={friend.friend_id} className="border p-2 rounded mb-2">
                  <span>{friend.profiles.username}</span>
                </div>
              ))
            )}
          </div>
        ) : (
          <div>
            <h3 className="text-lg font-semibold mt-4 mb-2">Received Requests</h3>
            {receivedRequests.length === 0 ? (
              <p>No received requests.</p>
            ) : (
              receivedRequests.map((req) => (
                <div key={req.sender_id} className="flex justify-between items-center border p-2 rounded mb-2">
                  <span>{req.profiles.username}</span>
                  <div>
                    <button onClick={() => acceptFriendRequest(req.sender_id)} className="bg-green-500 text-white px-3 py-1 rounded mr-2">Accept</button>
                    <button onClick={() => declineFriendRequest(req.sender_id)} className="bg-red-500 text-white px-3 py-1 rounded">Decline</button>
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