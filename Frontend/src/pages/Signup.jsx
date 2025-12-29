import React, { useState } from "react";
import { DotLottiePlayer } from "@dotlottie/react-player";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import userstore from "../store/userstore";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("signup");
  const [cooldown, setCooldown] = useState(0);
  const [emailForOTP, setEmailForOTP] = useState(""); // 🔥 IMPORTANT

  const { signUp, verifyOTP, resendOTP, isSigningUp } = userstore();
  const navigate = useNavigate();

  // ================== SIGNUP ==================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password) {
      toast.error("Please fill in all fields.");
      return;
    }

    const res = await signUp(form);

    if (res?.success) {
      setEmailForOTP(form.email); // 👈 save email
      setStep("otp");
    } else {
      toast.error(res?.message || "Signup failed");
    }
  };

  // ================== VERIFY OTP ==================
  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    if (!otp) {
      toast.error("Please enter the OTP");
      return;
    }

    const res = await verifyOTP(emailForOTP, otp);

    if (res?.success) {
      navigate("/");
    }
  };

  // ================== RESEND OTP ==================
  const handleResend = async () => {
    if (cooldown > 0) return;

    await resendOTP(emailForOTP);

    setCooldown(30);
    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gradient-to-br from-green-800 to-green-500">
      <DotLottiePlayer
        src="https://lottie.host/967f5eba-4045-4c2a-8bc9-a4ec9a2093ba/SMIAZ04t9e.lottie"
        className="absolute inset-0 w-full h-full"
        loop
        autoplay
      />

      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-md">
          {step === "signup" ? (
            <>
              <h2 className="text-2xl font-semibold text-center mb-6">
                Create an Account
              </h2>

              <form className="space-y-4" onSubmit={handleSubmit}>
                <input
                  type="text"
                  placeholder="Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />

                <input
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg pr-10"
                  />
                  <span
                    className="absolute inset-y-0 right-3 flex items-center cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isSigningUp}
                  className="w-full py-2 bg-blue-600 text-white rounded-lg"
                >
                  {isSigningUp ? "Signing Up..." : "Sign Up"}
                </button>
              </form>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-semibold text-center mb-2">
                Verify OTP
              </h2>

              <p className="text-sm text-gray-500 text-center mb-4">
                Didn’t receive the email? Please check your{" "}
                <span className="font-medium">Spam</span> or
                <span className="font-medium"> Promotions</span> folder.
              </p>

              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                />

                <button
                  type="submit"
                  className="w-full py-2 bg-green-600 text-white rounded-lg"
                >
                  Verify OTP
                </button>
              </form>

              <button
                onClick={handleResend}
                disabled={cooldown > 0}
                className={`mt-4 w-full py-2 rounded-lg ${
                  cooldown > 0
                    ? "bg-yellow-300 cursor-not-allowed"
                    : "bg-yellow-500 hover:bg-yellow-600"
                }`}
              >
                {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Resend OTP"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Signup;
