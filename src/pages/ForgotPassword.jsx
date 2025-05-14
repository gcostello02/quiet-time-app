import React, { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import logo from '../assets/logo.png';

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    // const { error } = await supabase.auth.resetPasswordForEmail(email, {
    //   redirectTo: "http://localhost:5173/resetpassword",
    // });

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "http://tawg.us/resetpassword",
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage("Check your email for the reset link.");
    }
  };

  return (
    <div className="flex min-h-screen flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img 
          alt="TAWG"
          src={logo} 
          className="mx-auto h-24 w-auto"
        />
        <h2 className="mt-10 text-center text-2xl font-bold tracking-tight text-gray-900">
          Forgot Password?
        </h2>
        <p className="text-center text-sm text-gray-500">
          Enter your email to receive a reset link.
        </p>
      </div>
      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-900">
              Email address
            </label>
            <div className="mt-2">
              <input
                type="email"
                id="email"
                name="email"
                required
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 border border-gray-300 placeholder:text-gray-400 focus:outline-2 focus:outline-indigo-600"
              />
            </div>
          </div>
  
          <div>
            <button type="submit" className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-indigo-600">
              Send Reset Link
            </button>
          </div>
          {message && <p className="text-green-600 text-center pt-4">{message}</p>}
          {error && <p className="text-red-600 text-center pt-4">{error}</p>}
        </form>
        <p className="mt-10 text-center text-sm text-gray-500">
          Remembered your password?{" "}
          <Link to="/signin" className="font-semibold text-indigo-600 hover:text-indigo-500">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
