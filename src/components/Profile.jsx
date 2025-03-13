import React from 'react';
import Navbar from './Navbar';
import { UserAuth } from '../context/AuthContext';

const Profile = () => {
  const { session } = UserAuth();

  return (
    <div>
      <Navbar />
      <div className='container mx-auto mt-1'>
        Profile Page
        <h2>Welcome, {session?.user?.email}</h2>
      </div>
    </div>
  );
};

export default Profile;