import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Signup from "./components/Signup";
import Signin from "./components/Signin";
import Dashboard from "./components/Dashboard";
import PrivateRoute from "./components/PrivateRoute";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import Bible from "./components/Bible";
import Profile from "./components/Profile";
import Notifications from "./components/Notifications";
import Notes from "./components/Notes";
import EditProfile from "./components/EditProfile";

export const router = createBrowserRouter([
  { path: "/", element: <App /> },
  { path: "/signup", element: <Signup /> },
  { path: "/signin", element: <Signin /> },
  { path: "/forgotpassword", element: <ForgotPassword /> },
  { path: "/resetpassword", element: <ResetPassword /> },
  {
    path: "/dashboard",
    element: (
      <PrivateRoute>
        <Dashboard />
      </PrivateRoute>
    ),
  },
  { 
    path: "/bible", 
    element: (
      <PrivateRoute>
        <Bible />
      </PrivateRoute>
    )
  },
  { 
    path: "/profile", 
    element: (
      <PrivateRoute>
        <Profile />
      </PrivateRoute>
    )
  },
  { 
    path: "/notifications", 
    element: (
      <PrivateRoute>
        <Notifications />
      </PrivateRoute>
    )
  },
  { 
    path: "/notes", 
    element: (
      <PrivateRoute>
        <Notes />
      </PrivateRoute>
    )
  },
  { 
    path: "/edit-profile", 
    element: (
      <PrivateRoute>
        <EditProfile />
      </PrivateRoute>
    )
  },
]);