"use client";
import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";

export default function AdminVerificationPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated, login } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!loading && (!isAuthenticated || !user || user.role !== "admin")) {
      router.replace("/auth/login?message=Admin access required");
    }
  }, [loading, isAuthenticated, user, router]);

  useEffect(() => {
    if (user?.role === "admin") {
      loadRequests();
    }
  }, [user]);

  const loadRequests = async () => {
    try {
      setLoadingRequests(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
      const resp = await fetch(`${apiUrl}/user/pending-verifications`, {
        method: "GET",
        credentials: "include",
      });
      const data = await resp.json();
      if (resp.ok && data?.success) {
        setRequests(data?.data?.requests || []);
      } else {
        setError(data?.message || "Failed to load requests");
      }
    } catch (err) {
      setError("Failed to load verification requests");
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleVerification = async (companyId, action) => {
    try {
      setError("");
      setSuccess("");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
      const resp = await fetch(`${apiUrl}/user/handle-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ companyId, action }),
      });
      const data = await resp.json();
      if (resp.ok && data?.success) {
        setSuccess(action === "approve" ? "Company verified successfully" : "Verification request denied");
        // Reload requests
        await loadRequests();
        // Update user context if needed
        if (data?.data?.company) {
          // Refresh current user if it was updated
          const profileResp = await fetch(`${apiUrl}/user/profile`, {
            credentials: "include",
          });
          if (profileResp.ok) {
            const profileData = await profileResp.json();
            if (profileData?.data?.user) {
              login(profileData.data.user);
            }
          }
        }
      } else {
        setError(data?.message || `Failed to ${action} verification`);
      }
    } catch (err) {
      setError(`Failed to ${action} verification request`);
    }
  };

  if (!loading && (!isAuthenticated || !user || user.role !== "admin")) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 md:ml-48">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Company Verification Requests</h1>
        </div>

        {(error || success) && (
          <div className="mb-4">
            {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">{error}</div>}
            {success && <div className="text-green-600 text-sm bg-green-50 p-3 rounded-md">{success}</div>}
          </div>
        )}

        {loadingRequests ? (
          <div className="text-center py-12">
            <div className="text-gray-500">Loading verification requests...</div>
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-gray-500 text-lg">No pending verification requests</div>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((company) => (
              <div key={company._id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <img
                      src={company.avatar || "/images/nutrilens_logo.png"}
                      alt={company.fullName}
                      className="w-16 h-16 rounded-full object-cover border"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {company.fullName || company.username}
                        </h3>
                        <span className="text-sm text-gray-500">@{company.username}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <div className="text-sm text-gray-500">Email</div>
                          <div className="text-gray-900">{company.email || "—"}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Mobile</div>
                          <div className="text-gray-900">{company.mobile || "—"}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Company Registration No</div>
                          <div className="text-gray-900">{company.companyRegistrationNo || "—"}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">GST No</div>
                          <div className="text-gray-900">{company.gstNo || "—"}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Address</div>
                          <div className="text-gray-900">{company.address || "—"}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Country</div>
                          <div className="text-gray-900">{company.country || "—"}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Account Status</div>
                          <div className="text-gray-900 capitalize">{company.accountStatus || "pending"}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Request Date</div>
                          <div className="text-gray-900">
                            {company.createdAt ? new Date(company.createdAt).toLocaleDateString() : "—"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleVerification(company._id, "approve")}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleVerification(company._id, "deny")}
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

