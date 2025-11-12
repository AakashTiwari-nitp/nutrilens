"use client";
import React, { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import { ThemeContext } from "@/context/ThemeContext";
import { FaTrash, FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt, FaIdCard } from "react-icons/fa";

export default function CompanyVerificationPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);

  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [removingId, setRemovingId] = useState(null);

  // Check if user is admin
  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      router.push("/auth/login");
    }
  }, [user, authLoading, router]);

  // Fetch verified companies
  useEffect(() => {
    if (user && user.role === "admin") {
      fetchVerifiedCompanies();
    }
  }, [user]);

  const fetchVerifiedCompanies = async () => {
    try {
      setLoading(true);
      setError("");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
      
      const response = await fetch(`${apiUrl}/user/verified-companies`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setCompanies(data.data?.companies || []);
      } else {
        setError(data.message || "Failed to fetch companies");
      }
    } catch (err) {
      console.error("Error fetching companies:", err);
      setError(err.message || "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveVerification = async (companyId) => {
    if (!window.confirm("Are you sure you want to remove this company's verification?")) {
      return;
    }

    try {
      setRemovingId(companyId);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

      const response = await fetch(`${apiUrl}/user/remove-verification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ companyId }),
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccessMessage("Verification removed successfully");
        setCompanies(companies.filter(c => c._id !== companyId));
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setError(data.message || "Failed to remove verification");
      }
    } catch (err) {
      console.error("Error removing verification:", err);
      setError(err.message || "Network error. Please try again.");
    } finally {
      setRemovingId(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        theme === "dark" ? "bg-gray-900" : "bg-gray-100"
      }`}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className={`mt-4 text-lg ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
            Loading companies...
          </p>
        </div>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        theme === "dark" ? "bg-gray-900" : "bg-gray-100"
      }`}>
        <div className="text-center">
          <p className={`text-xl ${theme === "dark" ? "text-red-400" : "text-red-600"}`}>
            Access Denied. Only admins can view this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === "dark" ? "bg-gray-900" : "bg-gray-100"} p-4 md:p-8 md:ml-48`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-4xl font-bold mb-2 ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}>
            Verified Companies
          </h1>
          <p className={`text-lg ${
            theme === "dark" ? "text-gray-400" : "text-gray-600"
          }`}>
            Manage verified company accounts
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className={`text-red-800 dark:text-red-300 font-medium`}>{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className={`text-green-800 dark:text-green-300 font-medium`}>{successMessage}</p>
          </div>
        )}

        {/* Companies List */}
        {companies.length === 0 ? (
          <div className={`text-center py-12 rounded-lg border-2 border-dashed ${
            theme === "dark" 
              ? "border-gray-700 bg-gray-800" 
              : "border-gray-300 bg-gray-50"
          }`}>
            <p className={`text-lg font-medium ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}>
              No verified companies found
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((company) => (
              <div
                key={company._id}
                className={`rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105 ${
                  theme === "dark"
                    ? "bg-gray-800 border border-gray-700"
                    : "bg-white border border-gray-200"
                }`}
              >
                {/* Card Header */}
                <div className={`px-6 py-4 ${
                  theme === "dark" ? "bg-linear-to-r from-blue-900 to-blue-800" : "bg-linear-to-r from-black to-gray-600"
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <FaUser className="text-white" />
                    <h3 className="text-white font-bold text-lg truncate">
                      {company.fullName}
                    </h3>
                  </div>
                  <p className="text-blue-100 text-sm font-medium">
                    {company.username}
                  </p>
                </div>

                {/* Card Body */}
                <div className={`px-6 py-4 space-y-3 ${
                  theme === "dark" ? "bg-gray-800" : "bg-white"
                }`}>
                  {/* Email */}
                  <div className="flex items-start gap-3">
                    <FaEnvelope className={`mt-1 text-sm ${
                      theme === "dark" ? "text-blue-400" : "text-blue-500"
                    }`} />
                    <div className="flex-1">
                      <p className={`text-xs ${
                        theme === "dark" ? "text-gray-400" : "text-gray-500"
                      }`}>Email</p>
                      <p className={`text-sm font-medium break-all ${
                        theme === "dark" ? "text-gray-200" : "text-gray-800"
                      }`}>
                        {company.email}
                      </p>
                    </div>
                  </div>

                  {/* Phone */}
                  {company.mobile && (
                    <div className="flex items-start gap-3">
                      <FaPhone className={`mt-1 text-sm ${
                        theme === "dark" ? "text-green-400" : "text-green-500"
                      }`} />
                      <div className="flex-1">
                        <p className={`text-xs ${
                          theme === "dark" ? "text-gray-400" : "text-gray-500"
                        }`}>Phone</p>
                        <p className={`text-sm font-medium ${
                          theme === "dark" ? "text-gray-200" : "text-gray-800"
                        }`}>
                          {company.mobile}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Address */}
                  {company.address && (
                    <div className="flex items-start gap-3">
                      <FaMapMarkerAlt className={`mt-1 text-sm ${
                        theme === "dark" ? "text-red-400" : "text-red-500"
                      }`} />
                      <div className="flex-1">
                        <p className={`text-xs ${
                          theme === "dark" ? "text-gray-400" : "text-gray-500"
                        }`}>Address</p>
                        <p className={`text-sm font-medium ${
                          theme === "dark" ? "text-gray-200" : "text-gray-800"
                        }`}>
                          {company.address}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Company Reg Number */}
                  {company.companyRegistrationNo && (
                    <div className="flex items-start gap-3">
                      <FaIdCard className={`mt-1 text-sm ${
                        theme === "dark" ? "text-purple-400" : "text-purple-500"
                      }`} />
                      <div className="flex-1">
                        <p className={`text-xs ${
                          theme === "dark" ? "text-gray-400" : "text-gray-500"
                        }`}>Reg. No</p>
                        <p className={`text-sm font-medium ${
                          theme === "dark" ? "text-gray-200" : "text-gray-800"
                        }`}>
                          {company.companyRegistrationNo}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* GST Number */}
                  {company.gstNo && (
                    <div className="flex items-start gap-3">
                      <FaIdCard className={`mt-1 text-sm ${
                        theme === "dark" ? "text-orange-400" : "text-orange-500"
                      }`} />
                      <div className="flex-1">
                        <p className={`text-xs ${
                          theme === "dark" ? "text-gray-400" : "text-gray-500"
                        }`}>GST No</p>
                        <p className={`text-sm font-medium ${
                          theme === "dark" ? "text-gray-200" : "text-gray-800"
                        }`}>
                          {company.gstNo}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="pt-2">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                      theme === "dark"
                        ? "bg-green-900/30 text-green-300 border border-green-700"
                        : "bg-green-100 text-green-800 border border-green-300"
                    }`}>
                      ✓ Verified
                    </span>
                  </div>
                </div>

                {/* Card Footer */}
                <div className={`px-6 py-4 border-t ${
                  theme === "dark" ? "border-gray-700 bg-gray-900" : "border-gray-200 bg-gray-50"
                }`}>
                  <button
                    onClick={() => handleRemoveVerification(company._id)}
                    disabled={removingId === company._id}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                      removingId === company._id
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:scale-105"
                    } ${
                      theme === "dark"
                        ? "bg-red-900/30 text-red-300 hover:bg-red-900/50 border border-red-700"
                        : "bg-red-100 text-red-700 hover:bg-red-200 border border-red-300"
                    }`}
                  >
                    <FaTrash size={14} />
                    {removingId === company._id ? "Removing..." : "Remove Verification"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
