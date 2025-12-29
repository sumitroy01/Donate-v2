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
  const [amount, setAmount] = useState("");
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    if (window.Razorpay) return setScriptLoaded(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => setScriptLoaded(true);
    document.body.appendChild(s);
  }, []);

  useEffect(() => {
    if (!allProfiles.length) getAllProfiles();
  }, [allProfiles]);

  useEffect(() => {
    const found = allProfiles.find(p => String(p._id) === String(id));
    if (found) setProfile(found);
  }, [allProfiles, id]);

  if (!profile)
    return <p className="text-center mt-20 text-gray-400">Loading...</p>;

  const isGoalAchieved =
    Number(profile.donatedAmount) >= Number(profile.donationGoal);

  const proofs = Array.isArray(profile.proofs)
    ? profile.proofs
    : profile.proofs ? [profile.proofs] : [];

  const isPDF = (url) => url?.toLowerCase().endsWith(".pdf");

  const handleDonate = async () => {
    if (isGoalAchieved) return;
    const amt = Number(amount);
    if (!amt) return alert("Enter valid amount");

    const order = await createOrder(profile._id, amt);
    if (!order) return;

    new window.Razorpay({
      key: order.key,
      amount: amt * 100,
      currency: "INR",
      name: profile.name,
      order_id: order.orderId,
      handler: async (res) => {
        await verifyPayment({ ...res, profileId: profile._id, amount: amt });
        window.location.href = "/";
      },
      theme: { color: "#10b981" }
    }).open();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">

        <Link to="/" className="text-sm text-emerald-600 hover:underline">
          ← Back
        </Link>

        <div className="mt-4 bg-white rounded-2xl shadow-lg overflow-hidden">

          {/* HEADER */}
          <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-emerald-600 via-teal-500 to-sky-500 text-white">
            <img
              src={profile.profilePic || "https://via.placeholder.com/150"}
              className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover cursor-pointer hover:scale-105 transition"
              alt="profile"
              onClick={() => setActiveIndex("profile")}
            />

            <div>
              <h1 className="text-xl font-semibold">{profile.name}</h1>

              {isGoalAchieved && (
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full mt-1 inline-block">
                  🎉 Goal Achieved
                </span>
              )}

              <p className="text-sm mt-3 bg-white/25 backdrop-blur-md p-3 rounded-lg leading-relaxed">
                {profile.bio || "No bio provided"}
              </p>
            </div>
          </div>

          {/* INFO */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
            <Info label="Age" value={profile.age} />
            <Info label="Email" value={profile.email} />
            <Info label="Phone" value={profile.phone} />
            <Info label="Disease" value={profile.disease} />
            <Info label="Goal" value={`₹${profile.donationGoal}`} />
            <Info label="Raised" value={`₹${profile.donatedAmount}`} />
          </div>

          {/* PROGRESS */}
          <div className="px-4 mt-2">
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-lime-400 transition-all"
                style={{
                  width: `${Math.min(
                    (profile.donatedAmount / profile.donationGoal) * 100,
                    100
                  )}%`
                }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              ₹{profile.donatedAmount} raised of ₹{profile.donationGoal}
            </p>
          </div>

          {/* DONATE */}
          <div className="p-4 flex gap-3 bg-emerald-50 rounded-xl mt-3">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              disabled={isGoalAchieved}
              className="flex-1 border border-emerald-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
            <button
              onClick={handleDonate}
              disabled={loading || isGoalAchieved}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 rounded-md font-semibold hover:scale-105 transition disabled:opacity-50"
            >
              {isGoalAchieved ? "Completed ❤️" : loading ? "Processing..." : "Donate Now"}
            </button>
          </div>

          {/* PROOFS */}
          {proofs.length > 0 && (
            <div className="p-4">
              <p className="text-sm font-medium mb-2">Proofs</p>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {proofs.map((url, i) => (
                  <div
                    key={i}
                    onClick={() => setActiveIndex(i)}
                    className="bg-white shadow-md rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition"
                  >
                    {isPDF(url) ? (
                      <div className="h-24 flex items-center justify-center text-sm">
                        📄 PDF
                      </div>
                    ) : (
                      <img src={url} className="h-24 w-full object-cover" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* MODAL */}
        {activeIndex !== null && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50">
            <button
              onClick={() => setActiveIndex(null)}
              className="absolute top-6 right-6 text-white text-3xl"
            >
              ✕
            </button>

            {activeIndex === "profile" ? (
              <img
                src={profile.profilePic}
                className="max-w-[90vw] max-h-[80vh] rounded-xl"
              />
            ) : isPDF(proofs[activeIndex]) ? (
              <iframe
                src={proofs[activeIndex]}
                className="w-[90vw] h-[80vh] bg-white rounded-xl"
              />
            ) : (
              <img
                src={proofs[activeIndex]}
                className="max-w-[90vw] max-h-[80vh] rounded-xl"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const Info = ({ label, value }) => (
  <div className="bg-white border border-gray-100 shadow-sm p-4 rounded-xl">
    <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
    <p className="font-semibold text-gray-800 mt-1">{value || "N/A"}</p>
  </div>
);

export default ProfileDetails;
