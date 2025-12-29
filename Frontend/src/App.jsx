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
import NotFound from "./pages/NotFound.jsx";
import PublicRoute from "./components/PublicRoute.jsx";
import { Toaster } from "react-hot-toast";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const loadingMessages = [
  "Waking up the server ☕",
  "Convincing the backend to get out of bed 😴",
  "Feeding the server some coffee ☕",
  "Spinning cloud hamsters 🐹",
  "Almost ready… promise 🤞",
  "Free servers need love too 💙",
  "Optimizing bits and pixels ✨",
  "Good things take a moment 😌",
];

const funFacts = [
  "This app runs on free infrastructure 🌱",
  "You’re supporting sustainable hosting 💚",
  "Patience level: legendary 🏆",
  "Almost there — thanks for waiting!",
];

function AppWrapper() {
  const { authUser, checkAuth } = userStore();
  const { checkProfile, hasProfile } = profileStore();
  const navigate = useNavigate();

  const [backendReady, setBackendReady] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const [factIndex, setFactIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  // 🔁 Ping backend
  useEffect(() => {
    let interval;

    const pingBackend = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/user/health`);
        if (res.ok) {
          setBackendReady(true);
          clearInterval(interval);
        }
      } catch (_) {}
    };

    pingBackend();

    interval = setInterval(() => {
      pingBackend();
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  // 🔄 Rotate messages
  useEffect(() => {
    const msgTimer = setInterval(() => {
      setMessageIndex((i) => (i + 1) % loadingMessages.length);
      setFactIndex((i) => (i + 1) % funFacts.length);
    }, 3500);

    return () => clearInterval(msgTimer);
  }, []);

  // 🎯 Fake progress (smooth)
  useEffect(() => {
    const progressTimer = setInterval(() => {
      setProgress((p) => (p < 95 ? p + 1 : p));
    }, 700);

    return () => clearInterval(progressTimer);
  }, []);

  // 🔐 Auth checks
  useEffect(() => {
    if (backendReady) checkAuth();
  }, [backendReady]);

  useEffect(() => {
    if (authUser) checkProfile();
  }, [authUser]);

  useEffect(() => {
    if (authUser && hasProfile && window.location.pathname === "/profile") {
      navigate("/");
    }
  }, [authUser, hasProfile, navigate]);

  // 🌈 LOADING SCREEN
  if (!backendReady) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white px-6 text-center">

        <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-white mb-6" />

        <h2 className="text-lg font-semibold mb-2">
          {loadingMessages[messageIndex]}
        </h2>

        <p className="text-sm text-gray-400 mb-4">
          {funFacts[factIndex]}
        </p>

        <div className="w-64 bg-gray-700 rounded-full h-2 overflow-hidden">
          <div
            className="bg-white h-2 rounded-full transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="text-xs text-gray-500 mt-4">
          Thanks for your patience 💙
        </p>

        {progress > 90 && (
          <button
            onClick={() => window.location.reload()}
            className="mt-4 text-xs underline text-gray-400 hover:text-white"
          >
            Still loading? Try refreshing
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route
          path="/signup"
          element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          }
        />

        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          }
        />

        <Route path="/benefitted" element={<Benefitted />} />

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

        <Route path="/profile/:id" element={<ProfileDetails />} />

        <Route path="*" element={<NotFound />} />
      </Routes>

      <Footer />

      <Toaster
        position="top-left"
        toastOptions={{
          duration: 1200,
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

