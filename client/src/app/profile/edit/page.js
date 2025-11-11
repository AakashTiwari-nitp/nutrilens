"use client";
import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";

export default function EditProfilePage() {
  const router = useRouter();
  const { user, loading, isAuthenticated, login } = useContext(AuthContext);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    mobile: "",
    address: "",
    country: "",
    dob: "",
    weight: "",
    height: "",
    gender: null,
    isVeg: null,
  });

  useEffect(() => {
    if (!loading && (!isAuthenticated || !user)) {
      router.replace("/auth/login?message=Please login to edit your profile");
    }
  }, [loading, isAuthenticated, user, router]);

  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName ?? "",
        email: user.email ?? "",
        mobile: user.mobile ?? "",
        address: user.address ?? "",
        country: user.country ?? "",
        dob: user.dob ? new Date(user.dob).toISOString().slice(0, 10) : "",
        weight: user.weight ?? "",
        height: user.height ?? "",
        gender: user.gender ?? null,
        isVeg: user.isVeg ?? null,
      });
    }
  }, [user]);

  const handleChange = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
      const payload = {
        fullName: form.fullName || undefined,
        email: form.email || undefined,
        mobile: form.mobile || undefined,
        address: form.address || undefined,
        country: form.country || undefined,
        dob: form.dob || undefined,
        weight: form.weight === "" ? undefined : Number(form.weight),
        height: form.height === "" ? undefined : Number(form.height),
        gender: form.gender === null ? undefined : Boolean(form.gender),
        isVeg: form.isVeg === null ? undefined : Boolean(form.isVeg),
      };
      const resp = await fetch(`${apiUrl}/user/update-account`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok || !data?.success) throw new Error(data?.message || "Update failed");
      const updated = data?.data?.user;
      if (updated) login(updated);
      setSuccess("Profile updated successfully");
      router.replace("/profile");
    } catch (err) {
      setError(err.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (file) => {
    if (!file) return;
    setError("");
    setSuccess("");
    setUploading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
      const fd = new FormData();
      fd.append("avatar", file);
      const resp = await fetch(`${apiUrl}/user/update-avatar`, {
        method: "PATCH",
        credentials: "include",
        body: fd,
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok || !data?.success) throw new Error(data?.message || "Avatar upload failed");
      const updated = data?.data?.user;
      if (updated) login(updated);
      setSuccess("Avatar updated successfully");
    } catch (err) {
      setError(err.message || "Avatar upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
          <button
            className="text-sm text-gray-600 underline"
            onClick={() => router.back()}
          >
            Cancel
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-4 mb-6">
            <img
              src={user?.avatar || "/images/nutrilens_logo.png"}
              alt="Avatar"
              className="w-16 h-16 rounded-full object-cover border"
            />
            <div>
              <label className="text-sm text-gray-600 mr-3">Change photo:</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleAvatarUpload(e.target.files?.[0])}
                disabled={uploading}
                className="text-sm"
              />
            </div>
          </div>

          {(error || success) && (
            <div className="mb-4">
              {error && <div className="text-red-600 text-sm">{error}</div>}
              {success && <div className="text-green-600 text-sm">{success}</div>}
            </div>
          )}

          <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-md p-4">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Account</h2>
              <div className="flex flex-col py-2 border-b border-gray-100">
                <label className="text-gray-500 text-sm">Full Name</label>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                  className="mt-1 border rounded px-3 py-2"
                />
              </div>
              <div className="flex flex-col py-2 border-b border-gray-100">
                <label className="text-gray-500 text-sm">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="mt-1 border rounded px-3 py-2"
                />
              </div>
              <div className="flex flex-col py-2 border-b border-gray-100">
                <label className="text-gray-500 text-sm">Mobile</label>
                <input
                  type="text"
                  value={form.mobile}
                  onChange={(e) => handleChange("mobile", e.target.value)}
                  className="mt-1 border rounded px-3 py-2"
                />
              </div>
            </div>

            <div className="bg-gray-50 rounded-md p-4">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Personal</h2>
              <div className="flex flex-col py-2 border-b border-gray-100">
                <label className="text-gray-500 text-sm">DOB</label>
                <input
                  type="date"
                  value={form.dob}
                  onChange={(e) => handleChange("dob", e.target.value)}
                  className="mt-1 border rounded px-3 py-2"
                />
              </div>
              <div className="flex flex-col py-2 border-b border-gray-100">
                <label className="text-gray-500 text-sm">Gender</label>
                <select
                  value={form.gender === null ? "" : form.gender ? "male" : "female"}
                  onChange={(e) =>
                    handleChange("gender", e.target.value === "" ? null : e.target.value === "male")
                  }
                  className="mt-1 border rounded px-3 py-2"
                >
                  <option value="">—</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div className="flex flex-col py-2 border-b border-gray-100">
                <label className="text-gray-500 text-sm">Vegetarian</label>
                <select
                  value={form.isVeg === null ? "" : form.isVeg ? "yes" : "no"}
                  onChange={(e) =>
                    handleChange("isVeg", e.target.value === "" ? null : e.target.value === "yes")
                  }
                  className="mt-1 border rounded px-3 py-2"
                >
                  <option value="">—</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
            </div>

            <div className="bg-gray-50 rounded-md p-4">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Contact</h2>
              <div className="flex flex-col py-2 border-b border-gray-100">
                <label className="text-gray-500 text-sm">Address</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  className="mt-1 border rounded px-3 py-2"
                />
              </div>
              <div className="flex flex-col py-2 border-b border-gray-100">
                <label className="text-gray-500 text-sm">Country</label>
                <input
                  type="text"
                  value={form.country}
                  onChange={(e) => handleChange("country", e.target.value)}
                  className="mt-1 border rounded px-3 py-2"
                />
              </div>
            </div>

            <div className="bg-gray-50 rounded-md p-4">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Body Metrics</h2>
              <div className="flex flex-col py-2 border-b border-gray-100">
                <label className="text-gray-500 text-sm">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={form.weight}
                  onChange={(e) => handleChange("weight", e.target.value)}
                  className="mt-1 border rounded px-3 py-2"
                />
              </div>
              <div className="flex flex-col py-2 border-b border-gray-100">
                <label className="text-gray-500 text-sm">Height (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={form.height}
                  onChange={(e) => handleChange("height", e.target.value)}
                  className="mt-1 border rounded px-3 py-2"
                />
              </div>
            </div>

            <div className="sm:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 bg-black text-white rounded-md disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


