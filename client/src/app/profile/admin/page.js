"use client";
import { useContext, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import { ThemeContext } from "@/context/ThemeContext";

function InfoRow({ label, value, textColor, borderColor, subText }) {
  return (
    <div className={`flex items-start sm:items-center justify-between py-2 border-b ${borderColor}`}>
      <span className={`${subText}`}>{label}</span>
      <span className={`${textColor} font-medium break-all max-w-[60%] text-right`}>
        {value ?? "—"}
      </span>
    </div>
  );
}

export default function AdminProfilePage() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);

  if (!loading && (!isAuthenticated || !user)) {
    router.replace("/auth/login?message=Please login to view your profile");
    return null;
  }

  const dobText = useMemo(() => {
    if (!user?.dob) return "—";
    try {
      const d = new Date(user.dob);
      return d.toLocaleDateString();
    } catch {
      return "—";
    }
  }, [user]);

  // ✅ Theme-based styling
  const bg = theme === "dark" ? "bg-gradient-to-b from-black via-gray-900 to-gray-800" : "bg-gray-50";
  const cardBg = theme === "dark" ? "bg-gray-900" : "bg-white";
  const textColor = theme === "dark" ? "text-gray-100" : "text-gray-900";
  const subText = theme === "dark" ? "text-gray-400" : "text-gray-500";
  const borderColor = theme === "dark" ? "border-gray-700" : "border-gray-100";
  const sectionBg = theme === "dark" ? "bg-gray-800" : "bg-gray-50";

  return (
    <div className={`min-h-screen ${bg} ${textColor} transition-colors duration-300`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className={`text-2xl font-bold mb-6 ${textColor}`}>Admin Profile</h1>
        <div className="mb-4">
          <button
            onClick={() => router.push("/profile/edit")}
            className={`text-sm px-4 py-2 border rounded-md transition ${
              theme === "dark"
                ? "border-gray-700 hover:bg-gray-800 text-gray-100"
                : "border-gray-300 hover:bg-gray-50 text-gray-900"
            }`}
          >
            Edit Profile
          </button>
        </div>

        <div className={`${cardBg} rounded-lg shadow p-6`}>
          <div className="flex items-center gap-4 mb-6">
            <img
              src={user?.avatar || "/images/nutrilens_logo.png"}
              alt="Avatar"
              className="w-16 h-16 rounded-full object-cover border"
            />
            <div>
              <div className={`text-xl font-semibold ${textColor}`}>
                {user?.fullName ?? user?.username ?? "Admin"}
              </div>
              <div className={`${subText}`}>@{user?.username}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <h2 className={`text-sm font-semibold mb-3 ${subText}`}>Account</h2>
              <div className={`${sectionBg} rounded-md p-4`}>
                <InfoRow label="Role" value={user?.role} textColor={textColor} borderColor={borderColor} subText={subText} />
                <InfoRow label="Email" value={user?.email} textColor={textColor} borderColor={borderColor} subText={subText} />
                <InfoRow label="Mobile" value={user?.mobile} textColor={textColor} borderColor={borderColor} subText={subText} />
                <InfoRow label="Account Status" value={user?.accountStatus} textColor={textColor} borderColor={borderColor} subText={subText} />
              </div>
            </div>
            <div>
              <h2 className={`text-sm font-semibold mb-3 ${subText}`}>Admin Details</h2>
              <div className={`${sectionBg} rounded-md p-4`}>
                <InfoRow label="Full Name" value={user?.fullName} textColor={textColor} borderColor={borderColor} subText={subText} />
                <InfoRow label="DOB" value={dobText} textColor={textColor} borderColor={borderColor} subText={subText} />
                <InfoRow label="Address" value={user?.address} textColor={textColor} borderColor={borderColor} subText={subText} />
                <InfoRow label="Country" value={user?.country} textColor={textColor} borderColor={borderColor} subText={subText} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6">
            <div className={`${sectionBg} rounded-md p-4`}>
              <div className={`text-sm ${subText} mb-1`}>Favourites</div>
              <div className={`text-2xl font-bold ${textColor}`}>{user?.favourites?.length ?? 0}</div>
            </div>
            <div className={`${sectionBg} rounded-md p-4`}>
              <div className={`text-sm ${subText} mb-1`}>History</div>
              <div className={`text-2xl font-bold ${textColor}`}>{user?.history?.length ?? 0}</div>
            </div>
            <div className={`${sectionBg} rounded-md p-4`}>
              <div className={`text-sm ${subText} mb-1`}>News Subscriptions</div>
              <div className={`text-2xl font-bold ${textColor}`}>{user?.news?.length ?? 0}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
