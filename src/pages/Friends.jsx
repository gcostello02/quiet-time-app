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

  useEffect(() => {
    if (session?.user?.id) {
      fetchUsers()
      fetchPendingRequests()
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
    console.log(friendIds)

    const filteredUsers = allUsers.filter(user => !friendIds.has(user.id));
    console.log(filteredUsers)
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
    const { data, error } = await supabase
      .from("friend_requests")
      .select("receiver_id, profiles (username)")
      .eq("sender_id", session?.user?.id)
      .eq("status", "pending");
  
    if (!error) {
      setPendingRequests(data);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="max-w-lg mx-auto mt-10 bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
        <div className="flex justify-between border-b mb-4">
          <button onClick={() => setTab("requests")} className={`w-1/2 py-2 ${tab === "requests" ? "border-b-2 border-blue-500 font-bold" : ""}`}>
            Find Friends
          </button>
          <button onClick={() => setTab("friends")} className={`w-1/2 py-2 ${tab === "friends" ? "border-b-2 border-blue-500 font-bold" : ""}`}>
            Friends
          </button>
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
            {users.length === 0 ? <p>No users available to add.</p> : users.map((user) => (
              <div key={user.id} className="flex justify-between items-center border p-2 rounded mb-2">
                <span>{user.username}</span>
                <button onClick={() => sendFriendRequest(user.id)} className="bg-blue-500 text-white px-3 py-1 rounded">Send Request</button>
              </div>
            ))}
          </div>
        ) : (
          <div>
            <h3 className="text-lg font-semibold mb-2">Friends</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default Friends;