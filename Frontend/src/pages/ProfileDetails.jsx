import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import profileStore from "../store/profilestore";
import donationStore from "../store/donationStore";

const ProfileDetails = () => {
  const { id } = useParams();
  const { getAllProfiles, allProfiles } = profileStore();
  const { createOrder, verifyPayment, loading } = donationStore();

  const [profile, setProfile] = useState(null);
  const [activeIndex, setActiveIndex] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [amount, setAmount] = useState("");
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    if (window.Razorpay) {
      setScriptLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => setScriptLoaded(false);
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (!allProfiles.length) getAllProfiles();
  }, [allProfiles, getAllProfiles]);

  useEffect(() => {
    const found = allProfiles.find((p) => String(p._id) === String(id));
    if (found) setProfile(found);
  }, [allProfiles, id]);

  if (!profile) {
    return <p className="text-center text-gray-500 mt-8">Loading profile...</p>;
  }

  const isGoalAchieved =
    Number(profile.donatedAmount) >= Number(profile.donationGoal);

  const proofs = Array.isArray(profile.proofs)
    ? profile.proofs
    : profile.proofs
    ? [profile.proofs]
    : [];

  const handleDonate = async () => {
    if (isGoalAchieved) {
      alert("This campaign has already reached its goal 🎉");
      return;
    }

    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    if (!scriptLoaded || !window.Razorpay) {
      alert("Payment gateway not ready. Try again shortly.");
      return;
    }

    const orderData = await createOrder(profile._id, numericAmount);
    if (!orderData) {
      window.location.href = "/";
      return;
    }

    const options = {
      key: orderData.key,
      amount: Math.round(numericAmount * 100),
      currency: "INR",
      name: profile.name || "Donation",
      description: "Donation",
      order_id: orderData.orderId,

      handler: async (response) => {
        try {
          await verifyPayment({
            ...response,
            profileId: profile._id,
            amount: numericAmount,
          });
        } finally {
          window.location.href = "/";
        }
      },

      modal: {
        ondismiss: () => (window.location.href = "/"),
      },

      theme: { color: "#22c55e" },
    };

    new window.Razorpay(options).open();
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Link to="/" className="text-green-600 hover:underline mb-4 inline-block">
        ← Back to Profiles
      </Link>

      <div className="bg-white shadow-lg rounded-xl p-6">
        <div className="flex flex-col items-center text-center">
          <img
            src={profile.profilePic || "https://via.placeholder.com/150"}
            alt={profile.name}
            className="w-32 h-32 rounded-full border-4 border-green-100"
          />
          <h1 className="text-3xl font-bold mt-4">{profile.name}</h1>

          {isGoalAchieved && (
            <span className="mt-2 bg-green-600 text-white text-sm px-3 py-1 rounded-full">
              🎉 Goal Achieved
            </span>
          )}
        </div>

        <div className="mt-6 px-4">
          <p><strong>Donation Goal:</strong> ₹{profile.donationGoal}</p>
          <p><strong>Collected:</strong> ₹{profile.donatedAmount}</p>
        </div>

        <div className="mt-6 px-4">
          <input
            type="number"
            placeholder={
              isGoalAchieved
                ? "Goal already achieved"
                : "Enter donation amount"
            }
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={isGoalAchieved}
            className="border rounded-lg p-2 w-full mb-3 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />

          <button
            onClick={handleDonate}
            disabled={loading || isGoalAchieved}
            className="bg-green-600 text-white px-6 py-2 rounded-lg
                       hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGoalAchieved
              ? "Goal Achieved 🎉"
              : loading
              ? "Processing..."
              : "Donate"}
          </button>
        </div>

        {proofs.length > 0 && (
          <div className="mt-6 px-4">
            <h2 className="font-semibold mb-2">Proof Documents:</h2>
            <div className="grid grid-cols-3 gap-3">
              {proofs.map((url, idx) => (
                <img
                  key={idx}
                  src={url}
                  alt={`Proof ${idx + 1}`}
                  className="w-full h-32 object-cover rounded-lg cursor-pointer"
                  onClick={() => setActiveIndex(idx)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {activeIndex !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <button
            className="absolute top-5 right-5 text-white text-3xl"
            onClick={() => setActiveIndex(null)}
          >
            ✕
          </button>
          <img
            src={proofs[activeIndex]}
            alt="Proof"
            className="max-h-[80vh] max-w-[90vw] rounded-lg"
          />
        </div>
      )}
    </div>
  );
};

export default ProfileDetails;
