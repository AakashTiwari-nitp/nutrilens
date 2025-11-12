"use client";
import { useContext, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";

export default function EditProfilePage() {
  const router = useRouter();
  const { user, loading, isAuthenticated, login } = useContext(AuthContext);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [previewAvatar, setPreviewAvatar] = useState(null);
  const fileInputRef = useRef(null);
  const prevObjectUrlRef = useRef(null);
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
    companyRegistrationNo: "",
    gstNo: "",
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
        companyRegistrationNo: user.companyRegistrationNo ?? "",
        gstNo: user.gstNo ?? "",
      });
      // initialize preview from user avatar if available
      setPreviewAvatar(user?.avatar ?? null);
    }
  }, [user]);

  // cleanup any created object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (prevObjectUrlRef.current) {
        URL.revokeObjectURL(prevObjectUrlRef.current);
        prevObjectUrlRef.current = null;
      }
    };
  }, []);

  const handleChange = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
      const role = user?.role;
      const payload = {
        fullName: form.fullName || undefined,
        mobile: form.mobile || undefined,
        address: form.address || undefined,
        country: form.country || undefined,
        dob: form.dob || undefined,
      };
      
      // Only include user-specific fields for user role
      if (role === "user") {
        payload.weight = form.weight === "" ? undefined : Number(form.weight);
        payload.height = form.height === "" ? undefined : Number(form.height);
        payload.gender = form.gender === null ? undefined : Boolean(form.gender);
        payload.isVeg = form.isVeg === null ? undefined : Boolean(form.isVeg);
      }
      
      // Only include company-specific fields for company role
      if (role === "company") {
        payload.companyRegistrationNo = form.companyRegistrationNo || undefined;
        payload.gstNo = form.gstNo || undefined;
      }
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
      if (updated) {
        login(updated);
        // prefer server avatar when available
        setPreviewAvatar(updated.avatar ?? null);
        // revoke any temporary object URL created for preview
        if (prevObjectUrlRef.current) {
          try { URL.revokeObjectURL(prevObjectUrlRef.current); } catch (e) { }
          prevObjectUrlRef.current = null;
        }
      }
      setSuccess("Avatar updated successfully");
    } catch (err) {
      setError(err.message || "Avatar upload failed");
    } finally {
      setUploading(false);
    }
  };

  const role = user?.role;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 md:ml-48">
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
          <div className="flex items-center gap-4 md:gap-8 mb-6">
            <div className="relative">
              <img
                src={previewAvatar || user?.avatar || "/images/nutrilens_logo.png"}
                alt="Avatar"
                className="w-16 h-16 rounded-full object-cover border"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Change avatar"
                className="absolute -bottom-0.5 -right-0.5 bg-white border rounded-full p-1 shadow hover:bg-gray-50 focus:outline-none"
              >
                {/* pencil icon */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 11l6-6 3 3-6 6H9v-3z" />
                </svg>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  // create local preview
                  const objectUrl = URL.createObjectURL(f);
                  if (prevObjectUrlRef.current) {
                    URL.revokeObjectURL(prevObjectUrlRef.current);
                  }
                  prevObjectUrlRef.current = objectUrl;
                  setPreviewAvatar(objectUrl);
                  // upload in background
                  handleAvatarUpload(f);
                }}
                className="hidden"
                disabled={uploading}
              />

              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/80 p-2 rounded-full">
                    <svg className="animate-spin h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                  </div>
                </div>
              )}
            </div>
            <div>
              <div className="text-gray-700 font-medium">{user?.fullName || user?.username || "User"}</div>
              <div className="text-gray-700 font-medium">@{user?.username || "User"}</div>
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
                <label className="text-gray-500 text-sm">
                  {role === "company" ? "Contact Person" : "Full Name"}
                </label>
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
                  disabled
                  value={form.email}
                  className="mt-1 border text-gray-500 rounded px-3 py-2"
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

            {role === "user" ? (
              <>
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
              </>
            ) : (
              <div className="bg-gray-50 rounded-md p-4">
                <h2 className="text-sm font-semibold text-gray-700 mb-3">
                  {role === "company" ? "Company Details" : "Admin Details"}
                </h2>
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
                {role === "company" && (
                  <>
                    <div className="flex flex-col py-2 border-b border-gray-100">
                      <label className="text-gray-500 text-sm">Company Registration No</label>
                      <input
                        type="text"
                        value={form.companyRegistrationNo}
                        onChange={(e) => handleChange("companyRegistrationNo", e.target.value)}
                        className="mt-1 border rounded px-3 py-2"
                      />
                    </div>
                    <div className="flex flex-col py-2 border-b border-gray-100">
                      <label className="text-gray-500 text-sm">GST No</label>
                      <input
                        type="text"
                        value={form.gstNo}
                        onChange={(e) => handleChange("gstNo", e.target.value)}
                        className="mt-1 border rounded px-3 py-2"
                      />
                    </div>
                  </>
                )}
              </div>
            )}

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


