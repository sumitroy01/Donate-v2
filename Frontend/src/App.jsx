import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import LandingPage from "./pages/LandingPage.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Profile from "./pages/Profile.jsx";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";

import userStore from "./store/userstore.js";
import profileStore from "./store/profilestore.js";

import ProfileDetails from "./pages/ProfileDetails.jsx";
import UpdateProfile from "./pages/UpdateProfile.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import Benefitted from "./pages/Benefitted.jsx";

import { Toaster } from "react-hot-toast";

// ✅ SAFE backend URL (prevents undefined)
const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

function AppWrapper() {
  const { authUser, checkAuth } = userStore();
  const { checkProfile, hasProfile } = profileStore();
  const navigate = useNavigate();

  const [backendReady, setBackendReady] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let interval;

    const pingBackend = async () => {
      try {
        // ✅ FIXED health path
        const res = await fetch(`${BACKEND_URL}/api/user/health`);
        if (res.ok) {
          setBackendReady(true);
          clearInterval(interval);
        }
      } catch (err) {
        // ignore, retry
      }
    };

    pingBackend();

    interval = setInterval(() => {
      setSeconds((s) => s + 3);
      pingBackend();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (backendReady) {
      checkAuth();
    }
  }, [backendReady]);

  useEffect(() => {
    if (authUser) {
      checkProfile();
    }
  }, [authUser]);

  useEffect(() => {
    if (authUser && hasProfile && window.location.pathname === "/profile") {
      navigate("/");
    }
  }, [authUser, hasProfile, navigate]);

  if (!backendReady) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
        <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-white mb-6" />
        <h2 className="text-lg font-semibold">
          Waking up server…
        </h2>
        <p className="text-sm text-gray-400 mt-2">
          Free-tier cold start ({seconds}s)
        </p>
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/benefitted" element={<Benefitted />} />

        {/* Profile */}
        <Route path="/profile/:id" element={<ProfileDetails />} />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/updateprofile"
          element={
            <ProtectedRoute>
              <UpdateProfile />
            </ProtectedRoute>
          }
        />
      </Routes>

      <Footer />

      <Toaster
        position="top-left"
        toastOptions={{
          duration: 1000,
          style: { background: "#333", color: "#fff" },
        }}
      />
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}
