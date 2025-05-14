import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { UserAuth } from '../context/AuthContext';
import { supabase } from "../supabaseClient";
import { Link } from "react-router-dom";
import Footer from '../components/Footer';

const Friends = () => {
  const { session } = UserAuth();
  const [tab, setTab] = useState("add");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (session?.user?.id) {
      fetchAll();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const fetchAll = async () => {
    await Promise.all([
      fetchUsers(),
      fetchPendingRequests(),
      fetchReceivedRequests(),
      fetchFriends(),
    ]);
  };

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
    fetchPendingRequests();
  };

  const fetchPendingRequests = async () => {
    const { data } = await supabase
      .from('friend_requests')
      .select(`receiver_id, profiles!friend_requests_receiver_id_fkey(id, username) as profiles`)
      .eq("sender_id", session?.user?.id);

    setPendingRequests(data);
  };

  const fetchReceivedRequests = async () => {
    const { data } = await supabase
      .from("friend_requests")
      .select(`sender_id, profiles!friend_requests_sender_id_fkey(id, username) as profiles`)
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
      .select(`friend_id, profiles!friends_friend_id_fkey(username) as profiles`)
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

  const tabs = [
    { key: "add", label: `Add Friends` },
    { key: "friends", label: `My Friends (${friends.length})` },
    { key: "requests", label: `Requests (${receivedRequests.length})` },
  ];

  const FriendRow = ({ username, children }) => (
    <div className="flex justify-between items-center p-4 bg-gray-100 rounded-lg">
      <p className='text-lg font-semibold text-gray-900 hover:text-indigo-600'>{username}</p>
      <div className="flex gap-2">{children}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="max-w-2xl mx-auto space-y-8 p-6">
          <div className="bg-white shadow rounded-xl p-4">
            <div className="flex border-b border-gray-300 mb-6">
              {tabs.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`w-1/3 py-3 text-lg font-medium transition-colors ${
                    tab === key ? "bg-indigo-600 text-white" : "bg-white text-gray-900"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex justify-center items-center mt-10">
                <div className="spinner-border animate-spin h-8 w-8 border-4 border-t-transparent border-indigo-600 rounded-full"></div>
              </div>
            ) : tab === "add" ? (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Find New Friends</h3>
                <input
                  type="text"
                  placeholder="Search users..."
                  className="w-full p-3 mb-4 border border-gray-300 rounded-lg bg-white"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {users.length === 0 ? (
                  <p className="text-gray-500">No users available to add.</p>
                ) : (
                  <div className="space-y-3">
                    {users.filter((user) => user.username.toLowerCase().includes(searchTerm.toLowerCase())).map((user) => (
                      <FriendRow key={user.id} username={<Link to={`/profiles/${user.id}`}>{user.username}</Link>}>
                        <button onClick={() => sendFriendRequest(user.id)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-lg">Send</button>
                      </FriendRow>
                    ))}
                  </div>
                )}

                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Pending Requests</h3>
                  {pendingRequests.length === 0 ? <p className="text-gray-500">No pending requests.</p> : (
                    <div className="space-y-3">
                      {pendingRequests.map((req) => (
                        <FriendRow key={req.receiver_id} username={<Link to={`/profiles/${req.profiles.id}`}>{req.profiles.username}</Link>}>
                          <span className="text-sm text-gray-500">Pending</span>
                        </FriendRow>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : tab === "friends" ? (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Friends</h3>
                {friends.length === 0 ? <p className="text-gray-500">No friends yet.</p> : (
                  <div className="space-y-3">
                    {friends.map((friend) => (
                      <FriendRow key={friend.friend_id} username={<Link to={`/profiles/${friend.friend_id}`}>{friend.profiles.username}</Link>}>
                        <button onClick={() => removeFriend(friend.friend_id)} className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-lg">Remove</button>
                      </FriendRow>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Received Requests</h3>
                {receivedRequests.length === 0 ? <p className="text-gray-500">No received requests.</p> : (
                  <div className="space-y-3">
                    {receivedRequests.map((req) => (
                      <FriendRow key={req.sender_id} username={<Link to={`/profiles/${req.sender_id}`}>{req.profiles.username}</Link>}>
                        <button onClick={() => acceptFriendRequest(req.sender_id)} className="bg-green-500 hover:bg-green-600 text-white px-4 py-1.5 rounded-lg">Accept</button>
                        <button onClick={() => declineFriendRequest(req.sender_id)} className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-lg">Decline</button>
                      </FriendRow>
                    ))}
                  </div>
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

export default Friends;