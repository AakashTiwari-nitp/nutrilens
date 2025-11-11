"use client";
import { useContext, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";

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

export default function AdminProfilePage() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useContext(AuthContext);

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

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Profile</h1>
        <div className="mb-4">
          <button
            onClick={() => router.push("/profile/edit")}
            className="text-sm px-4 py-2 border rounded-md hover:bg-gray-50"
          >
            Edit Profile
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
              <div className="text-xl font-semibold text-gray-900">
                {user?.fullName ?? user?.username ?? "Admin"}
              </div>
              <div className="text-gray-500">@{user?.username}</div>
            </div>
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
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Admin Details</h2>
              <div className="bg-gray-50 rounded-md p-4">
                <InfoRow label="Full Name" value={user?.fullName} />
                <InfoRow label="DOB" value={dobText} />
                <InfoRow label="Address" value={user?.address} />
                <InfoRow label="Country" value={user?.country} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6">
            <div className="bg-gray-50 rounded-md p-4">
              <div className="text-sm text-gray-500 mb-1">Favourites</div>
              <div className="text-2xl font-bold">{user?.favourites?.length ?? 0}</div>
            </div>
            <div className="bg-gray-50 rounded-md p-4">
              <div className="text-sm text-gray-500 mb-1">History</div>
              <div className="text-2xl font-bold">{user?.history?.length ?? 0}</div>
            </div>
            <div className="bg-gray-50 rounded-md p-4">
              <div className="text-sm text-gray-500 mb-1">News Subscriptions</div>
              <div className="text-2xl font-bold">{user?.news?.length ?? 0}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


