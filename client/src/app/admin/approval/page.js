"use client";
import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import { ThemeContext } from "@/context/ThemeContext";

export default function AdminApprovalPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated, login } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);

  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedType, setSelectedType] = useState("company"); // 'company' or 'product'

  useEffect(() => {
    if (!loading && (!isAuthenticated || !user || user.role !== "admin" || user.accountStatus !== "approved")) {
      router.replace("/auth/login?message=Admin access required");
    }
  }, [loading, isAuthenticated, user, router]);

  useEffect(() => {
    if (user?.role === "admin") {
      loadRequests(selectedType);
    }
  }, [user, selectedType]);

  const loadRequests = async () => {
    try {
      setLoadingRequests(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
      let resp;
      if (selectedType === "company") {
        resp = await fetch(`${apiUrl}/user/pending-approvals`, {
          method: "GET",
          credentials: "include",
        });
      } else {
        // product pending approvals
        resp = await fetch(`${apiUrl}/product/pending-approvals`, {
          method: "GET",
          credentials: "include",
        });
      }
      const data = await resp.json();
      if (resp.ok && data?.success) {
        // products endpoint returns requests array as well
        setRequests(data?.data?.requests || data?.data?.products || []);
      } else {
        setError(data?.message || "Failed to load requests");
      }
    } catch {
      setError("Failed to load approval requests");
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleApproval = async (id, action) => {
    try {
      setError("");
      setSuccess("");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
      let resp;
      if (selectedType === "company") {
        resp = await fetch(`${apiUrl}/user/handle-approval`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ companyId: id, action }),
        });
      } else {
        // product approval
        resp = await fetch(`${apiUrl}/product/handle-approval`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ productId: id, action }),
        });
      }
      const data = await resp.json();
      if (resp.ok && data?.success) {
        setSuccess(action === "approve" ? (selectedType === "company" ? "Company approved successfully" : "Product approved successfully") : "Approval request denied");
        await loadRequests();
      } else {
        setError(data?.message || `Failed to ${action} approval`);
      }
    } catch {
      setError(`Failed to ${action} approval request`);
    }
  };

  if (!loading && (!isAuthenticated || !user || user.role !== "admin" || user.accountStatus !== "approved")) {
    return null;
  }

  const bg = theme === "dark" ? "bg-gray-900" : "bg-gray-50";
  const cardBg = theme === "dark" ? "bg-gray-800" : "bg-white";
  const textColor = theme === "dark" ? "text-gray-100" : "text-gray-900";
  const subText = theme === "dark" ? "text-gray-400" : "text-gray-500";

  return (
    <div className={`min-h-screen ${bg} ${textColor} md:ml-48 transition-colors duration-300`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">{selectedType === "company" ? "Company Approval Requests" : "Product Approval Requests"}</h1>
          <div className="ml-4 flex items-center gap-2">
            <button
              onClick={() => setSelectedType("company")}
              className={`px-3 py-1 rounded-md font-medium ${selectedType === "company" ? "bg-black text-white hover:bg-gray-600" : "bg-transparent text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-700"}`}
            >
              Company
            </button>
            <button
              onClick={() => setSelectedType("product")}
              className={`px-3 py-1 rounded-md font-medium ${selectedType === "product" ? "bg-black text-white hover:bg-gray-600" : "bg-transparent text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-700"}`}
            >
              Product
            </button>
          </div>
        </div>

        {(error || success) && (
          <div className="mb-4">
            {error && <div className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-md">{error}</div>}
            {success && (
              <div className="text-green-500 text-sm bg-green-50 dark:bg-green-900/20 p-3 rounded-md">{success}</div>
            )}
          </div>
        )}

        {loadingRequests ? (
          <div className="text-center py-12">
            <div className={`${subText}`}>Loading approval requests...</div>
          </div>
        ) : requests.length === 0 ? (
          <div className={`${cardBg} rounded-lg shadow p-8 text-center transition-colors duration-300`}>
            <div className={`${subText} text-lg`}>No pending approval requests</div>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((company) => (
              <div
                key={company._id}
                className={`${cardBg} rounded-lg shadow p-6 transition-colors duration-300`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <img
                      src={company.avatar || "/images/nutrilens_logo.png"}
                      alt={company.fullName}
                      className="w-16 h-16 rounded-full object-cover border"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">{company.fullName || company.username}</h3>
                        <span className={`text-sm ${subText}`}>@{company.username}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <Info label="Email" value={company.email} subText={subText} />
                        <Info label="Mobile" value={company.mobile} subText={subText} />
                        <Info label="Company Registration No" value={company.companyRegistrationNo} subText={subText} />
                        <Info label="GST No" value={company.gstNo} subText={subText} />
                        <Info label="Address" value={company.address} subText={subText} />
                        <Info label="Country" value={company.country} subText={subText} />
                        <Info label="Account Status" value={company.accountStatus || "pending"} subText={subText} />
                        <Info
                          label="Request Date"
                          value={company.createdAt ? new Date(company.createdAt).toLocaleDateString() : "—"}
                          subText={subText}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleApproval(company._id, "approve")}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleApproval(company._id, "deny")}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                      Deny
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Info({ label, value, subText }) {
  return (
    <div>
      <div className={`text-sm ${subText}`}>{label}</div>
      <div className="font-medium">{value || "—"}</div>
    </div>
  );
}
