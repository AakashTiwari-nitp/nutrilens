"use client";
import { useContext, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import { MdVerified } from "react-icons/md";
import { GoPencil } from "react-icons/go";

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start sm:items-center justify-between py-2 border-b border-gray-100">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-900 font-medium break-all max-w-[60%] text-right">
        {value ?? "—"}
      </span>
    </div>
  );
}

export default function UserProfilePage() {
  const router = useRouter();
  const { user, loading, isAuthenticated, login } = useContext(AuthContext);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState(() => ({
    fullName: user?.fullName ?? "",
    email: user?.email ?? "",
    mobile: user?.mobile ?? "",
    address: user?.address ?? "",
    country: user?.country ?? "",
    dob: user?.dob ? new Date(user.dob).toISOString().slice(0, 10) : "",
    weight: user?.weight ?? "",
    height: user?.height ?? "",
    gender: user?.gender ?? null,
    isVeg: user?.isVeg ?? null,
  }));

  if (!loading && (!isAuthenticated || !user)) {
    router.replace("/auth/login?message=Please login to view your profile");
    return null;
  }

  const genderText = useMemo(() => {
    if (user?.gender === undefined || user?.gender === null) return "—";
    return user.gender ? "Male" : "Female";
  }, [user]);

  const avatarSrc = (() => {
    const userAvatar = user?.avatar;
    if (userAvatar && typeof userAvatar === "string" && userAvatar.trim() !== "") {
      return userAvatar;
    }
    // user.gender is expected to be boolean (true = Male, false = Female) or null/undefined
    if (user?.gender === true) return "/images/male-placeholder.webp";
    if (user?.gender === false) return "/images/female-placeholder.webp";
    return "/images/nutrilens_logo.png";
  })();

  const dobText = useMemo(() => {
    if (!user?.dob) return "—";
    try {
      const d = new Date(user.dob);
      return d.toLocaleDateString();
    } catch {
      return "—";
    }
  }, [user]);

  const favouritesCount = user?.favourites?.length ?? 0;
  const historyCount = user?.history?.length ?? 0;
  const newsCount = user?.news?.length ?? 0;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Profile</h1>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-4 mb-6">
            <img
              src={avatarSrc}
              alt={`${user?.fullName ?? user?.username ?? "User"} avatar`}
              className="w-16 h-16 rounded-full object-cover border"
            />
            <div>
              <div className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                {user?.fullName ?? user?.username ?? "User"}
              </div>
              <div className="flex items-center gap-2">
                <div className="text-gray-500">@{user?.username}</div>
                {user?.accountStatus === "verified" && (
                  <>
                    <span title="Verified" className="text-green-600 inline-flex items-center">
                      <MdVerified className="h-5 w-5" />
                    </span>
                    <button
                      onClick={() => router.push("/auth/approve")}
                      className="ml-2 text-sm px-2 py-1 bg-blue-100 text-blue-800 border border-blue-200 rounded hover:bg-blue-200"
                    >
                      Apply for Approval
                    </button>
                  </>
                )}

                {user?.accountStatus === "approved" && (
                  <span title="Approved" className="text-green-600 inline-flex items-center">
                    <MdVerified className="h-5 w-5" />
                  </span>
                )}
                {user?.accountStatus === "pending" && (
                  <button
                    onClick={() => router.push("/auth/verify")}
                    className="ml-2 text-sm px-2 py-1 bg-blue-100 text-blue-800 border border-blue-200 rounded hover:bg-blue-200"
                  >
                    Get Verified
                  </button>
                )}
              </div>
            </div>

            {/* improved edit button */}
            <button
              type="button"
              onClick={() => router.push("/profile/edit")}
              aria-label="Edit profile"
              className="ml-auto inline-flex items-center gap-2 px-3 py-1.5 border rounded-md text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-200"
            >
              <GoPencil className="h-4 w-4" />
              <span className="hidden sm:inline">Edit</span>
            </button>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Account</h2>
              <div className="bg-gray-50 rounded-md p-4">
                <InfoRow label="Role" value={user?.role} />
                <InfoRow label="Email" value={user?.email} />
                <InfoRow label="Mobile" value={user?.mobile} />
                <InfoRow label="Account Status" value={user?.accountStatus} />
              </div>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Personal</h2>
              <div className="bg-gray-50 rounded-md p-4">
                <InfoRow label="Full Name" value={user?.fullName} />
                <InfoRow label="DOB" value={dobText} />
                <InfoRow label="Gender" value={genderText} />
                <InfoRow label="Vegetarian" value={user?.isVeg === undefined ? "—" : (user?.isVeg ? "Yes" : "No")} />
              </div>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Contact</h2>
              <div className="bg-gray-50 rounded-md p-4">
                <InfoRow label="Address" value={user?.address} />
                <InfoRow label="Country" value={user?.country} />
              </div>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Body Metrics</h2>
              <div className="bg-gray-50 rounded-md p-4">
                <InfoRow label="Weight (kg)" value={user?.weight} />
                <InfoRow label="Height (cm)" value={user?.height} />
                <InfoRow label="BMI" value={user?.bmi?.toFixed ? user.bmi.toFixed(2) : user?.bmi} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6">
            <div className="bg-gray-50 rounded-md p-4">
              <div className="text-sm text-gray-500 mb-1">Favourites</div>
              <div className="text-2xl font-bold">{favouritesCount}</div>
            </div>
            <div className="bg-gray-50 rounded-md p-4">
              <div className="text-sm text-gray-500 mb-1">History</div>
              <div className="text-2xl font-bold">{historyCount}</div>
            </div>
            <div className="bg-gray-50 rounded-md p-4">
              <div className="text-sm text-gray-500 mb-1">News Subscriptions</div>
              <div className="text-2xl font-bold">{newsCount}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


