import { createBrowserRouter } from "react-router-dom";
import Signup from "./pages/Signup";
import Signin from "./pages/Signin";
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./components/PrivateRoute";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Bible from "./pages/Bible";
import Profile from "./pages/Profile";
import Notes from "./pages/Notes";
import EditProfile from "./pages/EditProfile";
import Friends from "./pages/Friends";
import HowTo from "./pages/HowTo";
import Plan from "./pages/Plan";
import Feed from "./pages/Feed";
import DetailedUserNote from "./pages/DetailedUserNote";
import EditNote from "./pages/EditNote";
import OtherProfilePage from "./pages/OtherProfiles";
import DetailedOtherNote from "./pages/DetailedOtherNote";
import Unauthorized from "./pages/Unauthorized";
import Information from "./pages/Information";
import Accountability from "./pages/Accountability";
import Progress from "./pages/Progress";

export const router = createBrowserRouter([
  { path: "/", element: <Dashboard /> },
  { path: "/signup", element: <Signup /> },
  { path: "/signin", element: <Signin /> },
  { path: "/forgotpassword", element: <ForgotPassword /> },
  { path: "/resetpassword", element: <ResetPassword /> },
  { path: "/bible", element: <Bible /> },
  { path: "/plan", element: <Plan />  },
  { path: "/howto", element: <HowTo /> },
  { path: "/information", element: <Information /> },
  { 
    path: "/profile", 
    element: (
      <PrivateRoute>
        <Profile />
      </PrivateRoute>
    )
  },
  { 
    path: "/tawg", 
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
  { 
    path: "/feed", 
    element: (
      <PrivateRoute>
        <Feed />
      </PrivateRoute>
    )
  },
  {
    path: "/my-entries/:noteId",
    element: (
      <PrivateRoute>
        <DetailedUserNote />
      </PrivateRoute>
    )
  },
  {
    path: "/edit-entry/:noteId",
    element: (
      <PrivateRoute>
        <EditNote />
      </PrivateRoute>
    )
  },
  {
    path: "/profiles/:profileId",
    element: (
      <PrivateRoute>
        <OtherProfilePage />
      </PrivateRoute>
    )
  },
  {
    path: "/entries/:noteId",
    element: (
      <PrivateRoute>
        <DetailedOtherNote />
      </PrivateRoute>
    )
  },
  {
    path: "/unauthorized",
    element: (
      <PrivateRoute>
        <Unauthorized />
      </PrivateRoute>
    )
  },
  {
    path: "/accountability",
    element: (
      <PrivateRoute>
        <Accountability />
      </PrivateRoute>
    )
  },
  {
    path: "/progress",
    element: (
      <PrivateRoute>
        <Progress />
      </PrivateRoute>
    )
  },
]);