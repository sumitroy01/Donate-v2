import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import profileStore from "../store/profilestore.js";

const Profile = () => {
  const navigate = useNavigate();
  const {
    hasProfile,
    profileId,
    profile,
    isCreatingProfile,
    isUpdatingProfile,
    isLoadingProfile,
    checkProfile,
    getProfileById,
    fillForm,
    updateProfileById,
  } = profileStore();

  const [form, setForm] = useState({
    name: "",
    age: "",
    email: "",
    phone: "",
    disease: "",
    donationGoal: "",
    profilePic: null,
    bio: "",
    proofs: null,
  });

  const [previewFiles, setPreviewFiles] = useState([]);

  const isPDF = (file) => file?.type === "application/pdf";

  useEffect(() => {
    (async () => {
      const exists = await checkProfile();
      if (exists && profileId) {
        await getProfileById(profileId);
      } else {
        setForm({
          name: "",
          age: "",
          email: "",
          phone: "",
          disease: "",
          donationGoal: "",
          profilePic: null,
          bio: "",
          proofs: null,
        });
      }
    })();
  }, []);

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name || "",
        age: profile.age || "",
        email: profile.email || "",
        phone: profile.phone || "",
        disease: profile.disease || "",
        donationGoal: profile.donationGoal || "",
        profilePic: null,
        bio: profile.bio || "",
        proofs: null,
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "proofs" && files) {
      const fileArray = Array.from(files);
      setPreviewFiles(fileArray);
      setForm((prev) => ({ ...prev, proofs: files }));
      return;
    }

    if (name === "profilePic" && files) {
      setForm((prev) => ({ ...prev, profilePic: files[0] }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const fd = new FormData();
    Object.keys(form).forEach((key) => {
      const val = form[key];
      if (val !== null && val !== "") {
        if (key === "proofs" && val instanceof FileList) {
          Array.from(val).forEach((file) => fd.append("proofs", file));
        } else {
          fd.append(key, val);
        }
      }
    });

    if (hasProfile && profileId) {
      await updateProfileById({ id: profileId, data: fd });
    } else {
      await fillForm(fd);
    }

    navigate("/");
  };

  const busy = isCreatingProfile || isUpdatingProfile || isLoadingProfile;

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center py-10 px-4">
      <div className="bg-white w-full max-w-3xl p-8 rounded-xl shadow-md border">
        <h1 className="text-3xl font-bold text-emerald-600 mb-6 text-center">
          {hasProfile ? "Edit Donation Request" : "Create Donation Request"}
        </h1>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Full Name" className="w-full border rounded p-2" />
          <input type="number" name="age" value={form.age} onChange={handleChange} placeholder="Age" className="w-full border rounded p-2" />
          <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Email" className="w-full border rounded p-2" />
          <input type="text" name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" className="w-full border rounded p-2" />
          <input type="text" name="disease" value={form.disease} onChange={handleChange} placeholder="Disease" className="w-full border rounded p-2" />
          <input type="number" name="donationGoal" value={form.donationGoal} onChange={handleChange} placeholder="Donation Goal" className="w-full border rounded p-2" />

          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            rows="4"
            placeholder="Bio"
            className="w-full border rounded p-2"
          />

          <input type="file" name="profilePic" accept="image/*" onChange={handleChange} />

          <input
            type="file"
            name="proofs"
            multiple
            accept="image/*,application/pdf"
            onChange={handleChange}
          />

          {/* PREVIEW */}
          {previewFiles.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mt-3">
              {previewFiles.map((file, i) => (
                <div
                  key={i}
                  className="border rounded-lg p-2 flex flex-col items-center justify-center bg-gray-50"
                >
                  {isPDF(file) ? (
                    <>
                      <div className="text-4xl">📄</div>
                      <p className="text-xs mt-1 truncate">{file.name}</p>
                    </>
                  ) : (
                    <img
                      src={URL.createObjectURL(file)}
                      className="w-full h-24 object-cover rounded"
                      alt="preview"
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className={`w-full py-3 text-white rounded-lg ${
              busy ? "bg-emerald-400" : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            {busy ? "Submitting..." : hasProfile ? "Update Profile" : "Create Profile"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
