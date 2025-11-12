"use client";
import { useContext, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import { ThemeContext } from "@/context/ThemeContext";
import { MdVerified } from "react-icons/md";
import { GoPencil } from "react-icons/go";

function InfoRow({ label, value, subText, textColor, borderColor }) {
  return (
    <div className={`flex items-start sm:items-center justify-between py-2 border-b ${borderColor}`}>
      <span className={`${subText}`}>{label}</span>
      <span className={`${textColor} font-medium break-all max-w-[60%] text-right`}>
        {value ?? "—"}
      </span>
    </div>
  );
}

export default function UserProfilePage() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

  // ✅ Theme colors
  const bg = theme === "dark" ? "bg-gradient-to-b from-black via-gray-900 to-gray-800" : "bg-gray-50";
  const cardBg = theme === "dark" ? "bg-gray-900" : "bg-white";
  const sectionBg = theme === "dark" ? "bg-gray-800" : "bg-gray-50";
  const textColor = theme === "dark" ? "text-gray-100" : "text-gray-900";
  const subText = theme === "dark" ? "text-gray-400" : "text-gray-500";
  const borderColor = theme === "dark" ? "border-gray-700" : "border-gray-100";

  return (
    <div className={`min-h-screen ${bg} ${textColor} transition-colors duration-300`}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className={`text-2xl font-bold mb-6 ${textColor}`}>Your Profile</h1>

        <div className={`${cardBg} rounded-lg shadow p-6`}>
          <div className="flex items-center gap-4 mb-6">
            <img
              src={avatarSrc}
              alt={`${user?.fullName ?? user?.username ?? "User"} avatar`}
              className="w-16 h-16 rounded-full object-cover border"
            />
            <div>
              <div className={`text-xl font-semibold flex items-center gap-2 ${textColor}`}>
                {user?.fullName ?? user?.username ?? "User"}
              </div>
              <div className="flex items-center gap-2">
                <div className={`${subText}`}>@{user?.username}</div>

                {user?.accountStatus === "verified" && (
                  <>
                    <span title="Verified" className="text-green-500 inline-flex items-center">
                      <MdVerified className="h-5 w-5" />
                    </span>
                    <button
                      onClick={() => router.push("/auth/approve")}
                      className={`ml-2 text-sm px-2 py-1 border rounded transition ${
                        theme === "dark"
                          ? "bg-gray-800 border-gray-700 text-blue-300 hover:bg-gray-700"
                          : "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200"
                      }`}
                    >
                      Apply for Approval
                    </button>
                  </>
                )}

                {user?.accountStatus === "approved" && (
                  <span title="Approved" className="text-green-500 inline-flex items-center">
                    <MdVerified className="h-5 w-5" />
                  </span>
                )}

                {user?.accountStatus === "pending" && (
                  <button
                    onClick={() => router.push("/auth/verify")}
                    className={`ml-2 text-sm px-2 py-1 border rounded transition ${
                      theme === "dark"
                        ? "bg-gray-800 border-gray-700 text-blue-300 hover:bg-gray-700"
                        : "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200"
                    }`}
                  >
                    Get Verified
                  </button>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => router.push("/profile/edit")}
              aria-label="Edit profile"
              className={`ml-auto inline-flex items-center gap-2 px-3 py-1.5 border rounded-md text-sm transition ${
                theme === "dark"
                  ? "text-gray-300 border-gray-700 hover:bg-gray-800"
                  : "text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              <GoPencil className="h-4 w-4" />
              <span className="hidden sm:inline">Edit</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <h2 className={`text-sm font-semibold mb-3 ${subText}`}>Account</h2>
              <div className={`${sectionBg} rounded-md p-4`}>
                <InfoRow label="Role" value={user?.role} subText={subText} textColor={textColor} borderColor={borderColor} />
                <InfoRow label="Email" value={user?.email} subText={subText} textColor={textColor} borderColor={borderColor} />
                <InfoRow label="Mobile" value={user?.mobile} subText={subText} textColor={textColor} borderColor={borderColor} />
                <InfoRow label="Account Status" value={user?.accountStatus} subText={subText} textColor={textColor} borderColor={borderColor} />
              </div>
            </div>

            <div>
              <h2 className={`text-sm font-semibold mb-3 ${subText}`}>Personal</h2>
              <div className={`${sectionBg} rounded-md p-4`}>
                <InfoRow label="Full Name" value={user?.fullName} subText={subText} textColor={textColor} borderColor={borderColor} />
                <InfoRow label="DOB" value={dobText} subText={subText} textColor={textColor} borderColor={borderColor} />
                <InfoRow label="Gender" value={genderText} subText={subText} textColor={textColor} borderColor={borderColor} />
                <InfoRow
                  label="Vegetarian"
                  value={user?.isVeg === undefined ? "—" : user?.isVeg ? "Yes" : "No"}
                  subText={subText}
                  textColor={textColor}
                  borderColor={borderColor}
                />
              </div>
            </div>

            <div>
              <h2 className={`text-sm font-semibold mb-3 ${subText}`}>Contact</h2>
              <div className={`${sectionBg} rounded-md p-4`}>
                <InfoRow label="Address" value={user?.address} subText={subText} textColor={textColor} borderColor={borderColor} />
                <InfoRow label="Country" value={user?.country} subText={subText} textColor={textColor} borderColor={borderColor} />
              </div>
            </div>

            <div>
              <h2 className={`text-sm font-semibold mb-3 ${subText}`}>Body Metrics</h2>
              <div className={`${sectionBg} rounded-md p-4`}>
                <InfoRow label="Weight (kg)" value={user?.weight} subText={subText} textColor={textColor} borderColor={borderColor} />
                <InfoRow label="Height (cm)" value={user?.height} subText={subText} textColor={textColor} borderColor={borderColor} />
                <InfoRow label="BMI" value={user?.bmi?.toFixed ? user.bmi.toFixed(2) : user?.bmi} subText={subText} textColor={textColor} borderColor={borderColor} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6">
            <div className={`${sectionBg} rounded-md p-4`}>
              <div className={`text-sm mb-1 ${subText}`}>Favourites</div>
              <div className={`text-2xl font-bold ${textColor}`}>{favouritesCount}</div>
            </div>
            <div className={`${sectionBg} rounded-md p-4`}>
              <div className={`text-sm mb-1 ${subText}`}>History</div>
              <div className={`text-2xl font-bold ${textColor}`}>{historyCount}</div>
            </div>
            <div className={`${sectionBg} rounded-md p-4`}>
              <div className={`text-sm mb-1 ${subText}`}>News Subscriptions</div>
              <div className={`text-2xl font-bold ${textColor}`}>{newsCount}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
