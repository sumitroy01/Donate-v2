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
  const [expanded, setExpanded] = useState(false);
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

        <div className="mt-4 bg-white rounded-2xl shadow-md overflow-hidden">

          {/* HEADER */}
          <div className="flex items-center gap-4 p-5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
            <img
              src={profile.profilePic || "https://via.placeholder.com/150"}
              className="w-20 h-20 rounded-full border-2 border-white object-cover"
              alt="profile"
            />

            <div>
              <h1 className="text-xl font-semibold">{profile.name}</h1>
              {isGoalAchieved && (
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full mt-1 inline-block">
                  🎉 Goal Achieved
                </span>
              )}
              <p className="text-sm opacity-90 line-clamp-2 mt-1">
                {profile.bio || "No bio provided"}
              </p>
            </div>
          </div>

          {/* DETAILS */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 text-sm">
            <Info label="Age" value={profile.age} />
            <Info label="Email" value={profile.email} />
            <Info label="Phone" value={profile.phone} />
            <Info label="Disease" value={profile.disease} />
            <Info label="Goal" value={`₹${profile.donationGoal}`} />
            <Info label="Raised" value={`₹${profile.donatedAmount}`} />
          </div>

          {/* PROGRESS */}
          <div className="px-4">
            <div className="h-2 bg-gray-200 rounded-full">
              <div
                className="h-full bg-emerald-500"
                style={{
                  width: `${Math.min(
                    (profile.donatedAmount / profile.donationGoal) * 100,
                    100
                  )}%`
                }}
              />
            </div>
          </div>

          {/* DONATE */}
          <div className="p-4 flex gap-3">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount"
              disabled={isGoalAchieved}
              className="flex-1 border rounded-md px-3 py-2 text-sm"
            />
            <button
              onClick={handleDonate}
              disabled={loading || isGoalAchieved}
              className="bg-emerald-600 text-white px-5 rounded-md hover:bg-emerald-700 disabled:opacity-50"
            >
              {isGoalAchieved ? "Completed" : loading ? "..." : "Donate"}
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
                    className="bg-gray-100 rounded-lg overflow-hidden cursor-pointer"
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
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <button
              onClick={() => setActiveIndex(null)}
              className="absolute top-6 right-6 text-white text-3xl"
            >
              ✕
            </button>
            {isPDF(proofs[activeIndex]) ? (
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
  <div className="bg-gray-50 p-3 rounded-lg">
    <p className="text-xs text-gray-500">{label}</p>
    <p className="font-medium text-gray-800">{value || "N/A"}</p>
  </div>
);

export default ProfileDetails;
