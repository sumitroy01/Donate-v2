import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import userstore from "../store/userstore";
import profileStore from "../store/profilestore";
import { useNavigate } from "react-router-dom";

const UpdateProfile = () => {
  const { authUser } = userstore();
  const {
    profile,
    profileId,
    getMyProfile,
    updateProfileById,
    isUpdatingProfile,
  } = profileStore();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    bio: "",
    age: "",
    email: "",
    phone: "",
    disease: "",
    donationGoal: "",
    profilePic: null,
    proofs: [],
    existingProofs: [],
  });
  const [previewFiles, setPreviewFiles] = useState([]);

  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch profile
  useEffect(() => {
    getMyProfile();
  }, [getMyProfile]);

  // Prefill when profile loads
  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name || "",
        bio: profile.bio || "",
        age: profile.age || "",
        email: profile.email || "",
        phone: profile.phone || "",
        disease: profile.disease || "",
        donationGoal: profile.donationGoal || "",
        profilePic: null,
        proofs: [],
        existingProofs: profile.proofs || [],
      });
    }
  }, [profile]);

  // Input/file handlers
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      if (name === "proofs" && files) {
        const fileArray = Array.from(files);
        setPreviewFiles(fileArray);
        setForm((prev) => ({ ...prev, proofs: fileArray }));
        return;
      }
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Remove existing proof
  const handleRemoveProof = (proofUrl) => {
    setForm((prev) => ({
      ...prev,
      existingProofs: prev.existingProofs.filter((p) => p !== proofUrl),
    }));
  };

  // Remove newly added proof
  const handleRemoveNewProof = (index) => {
    setForm((prev) => {
      const newProofs = [...prev.proofs];
      newProofs.splice(index, 1);
      return { ...prev, proofs: newProofs };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const fd = new FormData();

      // Add all text fields
      fd.append("name", form.name);
      fd.append("bio", form.bio);
      fd.append("age", form.age);
      fd.append("email", form.email);
      fd.append("phone", form.phone);
      fd.append("disease", form.disease);
      fd.append("donationGoal", form.donationGoal);

      // Add profile picture if selected
      if (form.profilePic) {
        fd.append("profilePic", form.profilePic);
      }

      // Add existing proofs to keep
      form.existingProofs.forEach((proof) => {
        fd.append("existingProofs", proof);
      });

      // Add new proofs
      form.proofs.forEach((file) => {
        fd.append("proofs", file);
      });

      const result = await updateProfileById({
        id: profileId,
        data: fd,
      });

      if (result?.success !== false) {
        toast.success("Profile updated successfully!");
        setIsEditing(false);

        // refresh profile in place
        await getMyProfile();
      } else {
        toast.error(result?.message || "Failed to update profile");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      toast.error("Something went wrong!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPDF = (fileOrUrl) =>
    typeof fileOrUrl === "string"
      ? fileOrUrl.toLowerCase().endsWith(".pdf")
      : fileOrUrl?.type === "application/pdf";

  const busy = isUpdatingProfile || isSubmitting;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 to-purple-300 p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">My Profile</h2>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            {isEditing ? "Cancel" : "Edit"}
          </button>
        </div>

        {!isEditing ? (
          // Read-Only View
          <div className="space-y-4">
            <img
              src={profile?.profilePic || "/default-avatar.png"}
              alt="Profile"
              className="w-20 h-20 rounded-full border object-cover"
            />
            <p>
              <strong>Name:</strong> {profile?.name}
            </p>
            <p>
              <strong>Bio:</strong> {profile?.bio}
            </p>
            <p>
              <strong>Age:</strong> {profile?.age}
            </p>
            <p>
              <strong>Email:</strong> {profile?.email}
            </p>
            <p>
              <strong>Phone:</strong> {profile?.phone}
            </p>
            <p>
              <strong>Disease:</strong> {profile?.disease}
            </p>
            <p>
              <strong>Donation Goal:</strong> ₹{profile?.donationGoal}
            </p>

            {profile?.proofs?.length > 0 && (
              <div>
                <strong>Proofs:</strong>
                <div className="flex gap-3 mt-2 flex-wrap">
                  {profile.proofs.map((proof, idx) => (
                    <div
                      key={idx}
                      className="border rounded-lg p-2 flex flex-col items-center justify-center"
                    >
                      {proof.toLowerCase().endsWith(".pdf") ? (
                        <>
                          <div className="text-3xl">📄</div>
                          <button
                            onClick={() => window.open(proof, "_blank")}
                            className="text-blue-600 text-xs mt-1"
                          >
                            View PDF
                          </button>
                        </>
                      ) : (
                        <img
                          src={proof}
                          alt={`Proof ${idx + 1}`}
                          className="w-24 h-24 object-cover rounded cursor-pointer hover:scale-105"
                          onClick={() => window.open(proof, "_blank")}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          // Edit Form
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="mt-1 w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Bio
              </label>
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                rows="3"
                className="mt-1 w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Age */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Age
              </label>
              <input
                type="number"
                name="age"
                value={form.age}
                onChange={handleChange}
                min="1"
                required
                className="mt-1 w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="mt-1 w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phone
              </label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                required
                className="mt-1 w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Disease */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Disease / Condition
              </label>
              <input
                type="text"
                name="disease"
                value={form.disease}
                onChange={handleChange}
                required
                className="mt-1 w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Donation Goal */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Donation Goal (₹)
              </label>
              <input
                type="number"
                name="donationGoal"
                value={form.donationGoal}
                onChange={handleChange}
                min="1"
                required
                className="mt-1 w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Profile Picture */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Profile Picture
              </label>
              <input
                type="file"
                name="profilePic"
                accept="image/*"
                onChange={handleChange}
                className="mt-1 w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
              {profile?.profilePic && (
                <img
                  src={profile.profilePic}
                  alt="Current avatar"
                  className="w-16 h-16 rounded-full border mt-2 object-cover"
                />
              )}
            </div>

            {/* Proofs */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Medical Proof / Report
              </label>

              <input
                type="file"
                name="proofs"
                accept="application/pdf,image/*"
                multiple
                onChange={handleChange}
                className="mt-1 w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />

              {/* Existing proofs */}
              {form.existingProofs.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Existing Proofs:
                  </p>
                  <div className="flex gap-3 flex-wrap">
                    {form.existingProofs.map((proof, idx) => (
                      <div key={idx} className="relative border rounded-lg p-2">
                        {proof.toLowerCase().endsWith(".pdf") ? (
                          <div className="flex flex-col items-center">
                            <span className="text-3xl">📄</span>
                            <button
                              type="button"
                              onClick={() => window.open(proof, "_blank")}
                              className="text-blue-600 text-xs mt-1"
                            >
                              View PDF
                            </button>
                          </div>
                        ) : (
                          <img
                            src={proof}
                            alt="Proof"
                            className="w-24 h-24 object-cover rounded"
                          />
                        )}

                        <button
                          type="button"
                          onClick={() => handleRemoveProof(proof)}
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full px-2 py-1 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New proofs */}
              {form.proofs.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    New Proofs:
                  </p>
                  <div className="flex gap-3 flex-wrap">
                    {form.proofs.map((file, idx) => (
                      <div key={idx} className="relative border rounded-lg p-2">
                        {file.type === "application/pdf" ? (
                          <div className="flex flex-col items-center">
                            <span className="text-3xl">📄</span>
                            <p className="text-xs truncate max-w-[80px]">
                              {file.name}
                            </p>
                          </div>
                        ) : (
                          <img
                            src={URL.createObjectURL(file)}
                            alt="Preview"
                            className="w-24 h-24 object-cover rounded"
                          />
                        )}

                        <button
                          type="button"
                          onClick={() => handleRemoveNewProof(idx)}
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full px-2 py-1 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Submit button with spinner */}
            <button
              type="submit"
              disabled={busy}
              className={`w-full flex items-center justify-center gap-2 text-white py-3 px-6 rounded-lg transition ${
                busy
                  ? "bg-blue-300 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {busy && (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
                  ></path>
                </svg>
              )}
              {busy ? "Updating..." : "Save Changes"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default UpdateProfile;
