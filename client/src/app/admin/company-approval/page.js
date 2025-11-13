"use client";
import React, { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import { ThemeContext } from "@/context/ThemeContext";
import { FaTrash, FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt, FaIdCard } from "react-icons/fa";

export default function CompanyApprovalPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);

  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [removingId, setRemovingId] = useState(null);
  const [selectedList, setSelectedList] = useState("companies"); // 'companies' or 'products'
  const [products, setProducts] = useState([]);

  // Check if user is admin
  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin" || user.accountStatus !== "approved")) {
      router.push("/auth/login");
    }
  }, [user, authLoading, router]);

  // Fetch approved companies or products
  useEffect(() => {
    if (user && user.role === "admin") {
      if (selectedList === "companies") fetchApprovedCompanies();
      else fetchApprovedProducts();
    }
  }, [user, selectedList]);

  const fetchApprovedCompanies = async () => {
    try {
      setLoading(true);
      setError("");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
      
      const response = await fetch(`${apiUrl}/user/approved-companies`, {
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

  const fetchApprovedProducts = async () => {
    try {
      setLoading(true);
      setError("");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
      const response = await fetch(`${apiUrl}/product/approved-products`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setProducts(data.data?.products || []);
      } else {
        setError(data.message || "Failed to fetch products");
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(err.message || "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveApproval = async (companyId) => {
    if (!window.confirm("Are you sure you want to remove this company's approval?")) {
      return;
    }

    try {
      setRemovingId(companyId);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

      const response = await fetch(`${apiUrl}/user/remove-approval`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ companyId }),
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccessMessage("Approval removed successfully");
        setCompanies(companies.filter(c => c._id !== companyId));
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setError(data.message || "Failed to remove approval");
      }
    } catch (err) {
      console.error("Error removing approval:", err);
      setError(err.message || "Network error. Please try again.");
    } finally {
      setRemovingId(null);
    }
  };

  const handleRemoveProductApproval = async (productId) => {
    if (!window.confirm("Are you sure you want to remove this product's approval?")) return;
    try {
      setRemovingId(productId);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
      const response = await fetch(`${apiUrl}/product/remove-approval`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
        credentials: "include",
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setSuccessMessage("Product approval removed successfully");
        setProducts(products.filter(p => p._id !== productId));
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setError(data.message || "Failed to remove product approval");
      }
    } catch (err) {
      console.error("Error removing product approval:", err);
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

  if (user?.role !== "admin" || user?.accountStatus !== "approved") {
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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className={`text-4xl font-bold mb-2 ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}>
              Approved List
            </h1>
            <p className={`text-lg ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}>
              Manage approved companies and products
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedList("companies")}
              className={`px-3 py-1 rounded-md font-medium ${selectedList === "companies" ? "bg-black text-white hover:bg-gray-600" : "bg-transparent text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-700"}`}
            >
              Approved Companies
            </button>
            <button
              onClick={() => setSelectedList("products")}
              className={`px-3 py-1 rounded-md font-medium ${selectedList === "products" ? "bg-black text-white hover:bg-gray-600" : "bg-transparent text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-700"}`}
            >
              Approved Products
            </button>
          </div>
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

        {/* List content */}
        {selectedList === "companies" ? (
          companies.length === 0 ? (
            <div className={`text-center py-12 rounded-lg border-2 border-dashed ${
              theme === "dark" 
                ? "border-gray-700 bg-gray-800" 
                : "border-gray-300 bg-gray-50"
            }`}>
              <p className={`text-lg font-medium ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}>
                No approved companies found
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

                    {/* Status Badge */}
                    <div className="pt-2">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                        theme === "dark"
                          ? "bg-green-900/30 text-green-300 border border-green-700"
                          : "bg-green-100 text-green-800 border border-green-300"
                      }`}>
                        ✓ Approved
                      </span>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className={`px-6 py-4 border-t ${
                    theme === "dark" ? "border-gray-700 bg-gray-900" : "border-gray-200 bg-gray-50"
                  }`}>
                    <button
                      onClick={() => handleRemoveApproval(company._id)}
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
                      {removingId === company._id ? "Removing..." : "Remove Approval"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          // Products list
          products.length === 0 ? (
            <div className={`text-center py-12 rounded-lg border-2 border-dashed ${
              theme === "dark" 
                ? "border-gray-700 bg-gray-800" 
                : "border-gray-300 bg-gray-50"
            }`}>
              <p className={`text-lg font-medium ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}>
                No approved products found
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product._id} className={`rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105 ${
                  theme === "dark" ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"
                }`}>
                  <div className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={product.productImage || '/images/nutrilens_logo.png'} alt={product.name} className="w-16 h-16 object-cover rounded" />
                      <div>
                        <h3 className="text-lg font-bold">{product.name}</h3>
                        <p className="text-sm text-gray-500 truncate">{product.company?.username || product.companyName || ''}</p>
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-gray-400">{product.description || ''}</p>
                  </div>
                  <div className={`px-6 py-4 border-t ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}>
                    <button
                      onClick={() => handleRemoveProductApproval(product._id)}
                      disabled={removingId === product._id}
                      className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                        removingId === product._id ? "opacity-50 cursor-not-allowed" : "hover:scale-105"
                      } ${theme === "dark" ? "bg-red-900/30 text-red-300 border border-red-700" : "bg-red-100 text-red-700 border border-red-300"}`}
                    >
                      <FaTrash size={14} />
                      {removingId === product._id ? "Removing..." : "Remove Approval"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
