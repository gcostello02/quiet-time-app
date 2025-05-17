import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserAuth } from "../context/AuthContext";
import logo from '../assets/logo.png';

const Signin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const { signInUser } = UserAuth();
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    const { session, error } = await signInUser(email, password);

    if (error) {
      setError(error);

      setTimeout(() => {
        setError("");
      }, 3000);
    } else {
      navigate("/");
    }

    if (session) {
      // eslint-disable-next-line no-undef
      closeModal();
      setError("");
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
          Sign in to your account
        </h2>
      </div>
      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit={handleSignIn} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-900">
              Email address
            </label>
            <div className="mt-2">
              <input
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 border border-gray-300 placeholder:text-gray-400 focus:outline-2 focus:outline-indigo-600"
                type="email"
                name="email"
                id="email"
              />
            </div>
          </div>
  
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium text-gray-900">
                Password
              </label>
              <div className="text-sm">
                <Link to="/forgotpassword" className="font-semibold text-indigo-600 hover:text-indigo-500">
                  Forgot password?
                </Link>
              </div>
            </div>
            <div className="mt-2">
              <input
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 border border-gray-300 placeholder:text-gray-400 focus:outline-2 focus:outline-indigo-600"
                type="password"
                name="password"
                id="password"
                autoComplete="current-password"
              />
            </div>
          </div>
  
          <div>
            <button type="submit" className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-indigo-600">
              Sign In
            </button>
          </div>
          {error && <p className="text-red-600 text-center pt-4">{error}</p>}
        </form>
        <p className="mt-10 text-center text-sm text-gray-500">
          Don't have an account?{" "}
          <Link to="/signup" className="font-semibold text-indigo-600 hover:text-indigo-500">
            Sign up
          </Link>
        </p>
        <p className="mt-10 text-center text-sm text-gray-500">
          <Link to="/" className="font-semibold text-indigo-600 hover:text-indigo-500">
            Continue Without Logging In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signin;