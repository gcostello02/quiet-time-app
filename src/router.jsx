import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Signup from "./pages/Signup";
import Signin from "./pages/Signin";
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./components/PrivateRoute";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Bible from "./pages/Bible";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import Notes from "./pages/Notes";
import EditProfile from "./pages/EditProfile";
import Friends from "./pages/Friends";

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
  { 
    path: "/friends", 
    element: (
      <PrivateRoute>
        <Friends />
      </PrivateRoute>
    )
  },
]);