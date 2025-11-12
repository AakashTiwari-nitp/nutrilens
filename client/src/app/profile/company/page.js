"use client";
import { useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import { ThemeContext } from "@/context/ThemeContext";

function InfoRow({ label, value, textColor, subText, borderColor }) {
  return (
    <div className={`flex items-start sm:items-center justify-between py-2 border-b ${borderColor}`}>
      <span className={`${subText}`}>{label}</span>
      <span className={`${textColor} font-medium break-all max-w-[60%] text-right`}>
        {value ?? "—"}
      </span>
    </div>
  );
}

export default function CompanyProfilePage() {
  const router = useRouter();
  const { user, loading, isAuthenticated, login } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const [products, setProducts] = useState([]);
  const [prodLoading, setProdLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    if (!loading && (!isAuthenticated || !user)) {
      router.replace("/auth/login?message=Please login to view your profile");
    }
  }, [loading, isAuthenticated, user, router]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
        const resp = await fetch(`${apiUrl}/user/get-all-products`, {
          method: "GET",
          credentials: "include",
        });
        if (resp.ok) {
          const data = await resp.json();
          setProducts(data?.data?.products || []);
        }
      } catch (e) {
        // silent
      } finally {
        setProdLoading(false);
      }
    };
    if (isAuthenticated) loadProducts();
  }, [isAuthenticated]);

  const dobText = useMemo(() => {
    if (!user?.dob) return "—";
    try {
      const d = new Date(user.dob);
      return d.toLocaleDateString();
    } catch {
      return "—";
    }
  }, [user]);

  const handleRequestApproval = async () => {
    if (user?.accountStatus === "verified") {
      setMessage({ type: "error", text: "Company is already verified" });
      return;
    }
    if (user?.approvalRequested) {
      setMessage({ type: "error", text: "Approval request already pending" });
      return;
    }

    setRequesting(true);
    setMessage({ type: "", text: "" });
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
      const resp = await fetch(`${apiUrl}/user/request-approval`, {
        method: "POST",
        credentials: "include",
      });
      const data = await resp.json();
      if (resp.ok && data?.success) {
        setMessage({ type: "success", text: "Approval request submitted successfully" });
        const profileResp = await fetch(`${apiUrl}/user/profile`, { credentials: "include" });
        if (profileResp.ok) {
          const profileData = await profileResp.json();
          if (profileData?.data?.user) {
            login(profileData.data.user);
          }
        }
      } else {
        setMessage({ type: "error", text: data?.message || "Failed to submit approval request" });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to submit approval request" });
    } finally {
      setRequesting(false);
    }
  };

  // ✅ Theme-based styles
  const bg = theme === "dark" ? "bg-gradient-to-b from-black via-gray-900 to-gray-800" : "bg-gray-50";
  const cardBg = theme === "dark" ? "bg-gray-900" : "bg-white";
  const sectionBg = theme === "dark" ? "bg-gray-800" : "bg-gray-50";
  const textColor = theme === "dark" ? "text-gray-100" : "text-gray-900";
  const subText = theme === "dark" ? "text-gray-400" : "text-gray-500";
  const borderColor = theme === "dark" ? "border-gray-700" : "border-gray-100";

  return (
    <div className={`min-h-screen ${bg} ${textColor} md:ml-48 transition-colors duration-300`}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className={`text-2xl font-bold mb-6 ${textColor}`}>Company Profile</h1>

        <div className="mb-4 flex gap-2">
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

          {user?.accountStatus !== "verified" && !user?.approvalRequested && (
            <button
              onClick={handleRequestApproval}
              disabled={requesting}
              className={`text-sm px-4 py-2 rounded-md transition ${
                theme === "dark"
                  ? "bg-blue-600 text-white hover:bg-blue-500"
                  : "bg-black text-white hover:bg-gray-700"
              } disabled:opacity-50`}
            >
              {requesting ? "Submitting..." : "Request Approval"}
            </button>
          )}

          {user?.approvalRequested && (
            <button
              disabled
              className="text-sm px-4 py-2 bg-yellow-500 text-white rounded-md opacity-75 cursor-not-allowed"
            >
              Approval Requested
            </button>
          )}
        </div>

        {message.text && (
          <div
            className={`mb-4 p-3 rounded-md ${
              message.type === "success"
                ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
                : "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className={`${cardBg} rounded-lg shadow p-6 mb-8`}>
          <div className="flex items-center gap-4 mb-6">
            <img
              src={user?.avatar || "/images/nutrilens_logo.png"}
              alt="Avatar"
              className="w-16 h-16 rounded-full object-cover border"
            />
            <div>
              <div className={`text-xl font-semibold ${textColor}`}>
                {user?.fullName ?? user?.username ?? "Company"}
              </div>
              <div className={`${subText}`}>@{user?.username}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <h2 className={`text-sm font-semibold mb-3 ${subText}`}>Account</h2>
              <div className={`${sectionBg} rounded-md p-4`}>
                <InfoRow label="Role" value={user?.role} textColor={textColor} subText={subText} borderColor={borderColor} />
                <InfoRow label="Email" value={user?.email} textColor={textColor} subText={subText} borderColor={borderColor} />
                <InfoRow label="Mobile" value={user?.mobile} textColor={textColor} subText={subText} borderColor={borderColor} />
                <InfoRow label="Account Status" value={user?.accountStatus} textColor={textColor} subText={subText} borderColor={borderColor} />
              </div>
            </div>

            <div>
              <h2 className={`text-sm font-semibold mb-3 ${subText}`}>Company Details</h2>
              <div className={`${sectionBg} rounded-md p-4`}>
                <InfoRow label="Company Name" value={user?.fullName} textColor={textColor} subText={subText} borderColor={borderColor} />
                <InfoRow label="Address" value={user?.address} textColor={textColor} subText={subText} borderColor={borderColor} />
                <InfoRow label="Country" value={user?.country} textColor={textColor} subText={subText} borderColor={borderColor} />
                <InfoRow label="Company Registration No" value={user?.companyRegistrationNo} textColor={textColor} subText={subText} borderColor={borderColor} />
                <InfoRow label="GST No" value={user?.gstNo} textColor={textColor} subText={subText} borderColor={borderColor} />
              </div>
            </div>
          </div>
        </div>

        <div className={`${cardBg} rounded-lg shadow p-6`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-lg font-semibold ${textColor}`}>Products</h2>
            <div className={`text-sm ${subText}`}>
              {prodLoading ? "Loading..." : `${products.length} total`}
            </div>
          </div>

          {prodLoading ? (
            <div className={`${subText}`}>Fetching products...</div>
          ) : products.length === 0 ? (
            <div className={`${subText}`}>No products found.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {products.map((p) => (
                <div key={p._id} className={`${sectionBg} border ${borderColor} rounded-md p-4`}>
                  <div className="flex items-center gap-3 mb-2">
                    <img
                      src={p.productImage || "/images/nutrilens_logo.png"}
                      alt={p.name}
                      className="w-12 h-12 object-cover rounded-md border"
                    />
                    <div className={`font-semibold ${textColor}`}>{p.name}</div>
                  </div>
                  <div className={`text-sm ${subText}`}>
                    <div>Category: {p.category ?? "—"}</div>
                    <div>Price: {p.price ?? "—"}</div>
                    <div>Status: {p.isApproved ? "Approved" : "Pending"}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
