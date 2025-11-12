"use client";
import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import { ThemeContext } from "@/context/ThemeContext";

export default function AdminVerificationPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);

  const [activeTab, setActiveTab] = useState("company-requests");

  const [companyRequests, setCompanyRequests] = useState([]);
  const [companyList, setCompanyList] = useState([]);
  const [loadingCompanyRequests, setLoadingCompanyRequests] = useState(true);
  const [loadingCompanyList, setLoadingCompanyList] = useState(true);

  const [productRequests, setProductRequests] = useState([]);
  const [productList, setProductList] = useState([]);
  const [loadingProductRequests, setLoadingProductRequests] = useState(true);
  const [loadingProductList, setLoadingProductList] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!loading && (!isAuthenticated || !user || user.role !== "admin")) {
      router.replace("/auth/login?message=Admin access required");
    }
  }, [loading, isAuthenticated, user, router]);

  useEffect(() => {
    if (user?.role === "admin") {
      if (activeTab === "company-requests") loadCompanyRequests();
      else if (activeTab === "company-list") loadCompanyList();
      else if (activeTab === "product-requests") loadProductRequests();
      else if (activeTab === "product-list") loadProductList();
    }
  }, [user, activeTab]);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

  const loadCompanyRequests = async () => {
    try {
      setLoadingCompanyRequests(true);
      const resp = await fetch(`${apiUrl}/user/pending-verifications`, { credentials: "include" });
      const data = await resp.json();
      if (resp.ok && data?.success) setCompanyRequests(data.data?.requests || []);
      else setError(data?.message || "Failed to load requests");
    } catch {
      setError("Failed to load company requests");
    } finally {
      setLoadingCompanyRequests(false);
    }
  };

  const loadCompanyList = async () => {
    try {
      setLoadingCompanyList(true);
      const resp = await fetch(`${apiUrl}/user/approved-companies`, { credentials: "include" });
      const data = await resp.json();
      if (resp.ok && data?.success) setCompanyList(data.data?.companies || []);
      else setError(data?.message || "Failed to load companies");
    } catch {
      setError("Failed to load company list");
    } finally {
      setLoadingCompanyList(false);
    }
  };

  const handleCompanyApproval = async (companyId, action) => {
    try {
      setError("");
      setSuccess("");
      const resp = await fetch(`${apiUrl}/user/handle-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ companyId, action }),
      });
      const data = await resp.json();
      if (resp.ok && data?.success) {
        setSuccess(action === "approve" ? "Company verified successfully" : "Verification denied");
        await loadCompanyRequests();
        if (action === "approve") await loadCompanyList();
      } else setError(data?.message || "Failed to verify company");
    } catch {
      setError("Request failed");
    }
  };

  const handleRemoveCompany = async (companyId) => {
    if (!confirm("Are you sure you want to remove this company's verification?")) return;
    try {
      setError("");
      setSuccess("");
      const resp = await fetch(`${apiUrl}/user/remove-approval`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ companyId }),
      });
      const data = await resp.json();
      if (resp.ok && data?.success) {
        setSuccess("Company verification removed");
        await loadCompanyList();
      } else setError(data?.message || "Failed to remove verification");
    } catch {
      setError("Failed to remove verification");
    }
  };

  const loadProductRequests = async () => {
    try {
      setLoadingProductRequests(true);
      const resp = await fetch(`${apiUrl}/product/pending-approvals`, { credentials: "include" });
      const data = await resp.json();
      if (resp.ok && data?.success) setProductRequests(data.data?.products || []);
      else setError(data?.message || "Failed to load product requests");
    } catch {
      setError("Failed to load product requests");
    } finally {
      setLoadingProductRequests(false);
    }
  };

  const loadProductList = async () => {
    try {
      setLoadingProductList(true);
      const resp = await fetch(`${apiUrl}/product/approved-products`, { credentials: "include" });
      const data = await resp.json();
      if (resp.ok && data?.success) setProductList(data.data?.products || []);
      else setError(data?.message || "Failed to load products");
    } catch {
      setError("Failed to load products");
    } finally {
      setLoadingProductList(false);
    }
  };

  const handleProductApproval = async (productId, action) => {
    try {
      setError("");
      setSuccess("");
      const resp = await fetch(`${apiUrl}/product/handle-approval`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId, action }),
      });
      const data = await resp.json();
      if (resp.ok && data?.success) {
        setSuccess(action === "approve" ? "Product approved" : "Product denied");
        await loadProductRequests();
        if (action === "approve") await loadProductList();
      } else setError(data?.message || "Failed to approve product");
    } catch {
      setError("Product approval failed");
    }
  };

  const handleRemoveProduct = async (productId) => {
    if (!confirm("Are you sure you want to remove this product?")) return;
    try {
      setError("");
      setSuccess("");
      const resp = await fetch(`${apiUrl}/product/remove-approval`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId }),
      });
      const data = await resp.json();
      if (resp.ok && data?.success) {
        setSuccess("Product removed");
        await loadProductList();
      } else setError(data?.message || "Failed to remove product");
    } catch {
      setError("Failed to remove product");
    }
  };

  if (!loading && (!isAuthenticated || !user || user.role !== "admin")) return null;

  const bg = theme === "dark" ? "bg-gray-900" : "bg-gray-50";
  const card = theme === "dark" ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900";
  const textMuted = theme === "dark" ? "text-gray-400" : "text-gray-500";

  return (
    <div className={`min-h-screen ${bg} transition-colors duration-300 md:ml-48`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className={`text-2xl font-bold mb-6 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
          Admin Verification
        </h1>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            {["company-requests", "company-list", "product-requests", "product-list"].map((id) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === id
                    ? "border-blue-500 text-blue-500"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                {id.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              </button>
            ))}
          </nav>
        </div>

        {(error || success) && (
          <div className="mb-4">
            {error && <div className="text-red-500 bg-red-100 dark:bg-red-900/30 p-3 rounded">{error}</div>}
            {success && <div className="text-green-500 bg-green-100 dark:bg-green-900/30 p-3 rounded">{success}</div>}
          </div>
        )}

        {/* Dynamic tab content */}
        <div className={`${card} p-4 rounded-lg shadow transition-colors duration-300`}>
          {activeTab === "company-requests" && (
            <TabContent
              items={companyRequests}
              loading={loadingCompanyRequests}
              emptyText="No pending company verification requests"
              textMuted={textMuted}
              onApprove={(id) => handleCompanyApproval(id, "approve")}
              onDeny={(id) => handleCompanyApproval(id, "deny")}
            />
          )}
          {activeTab === "company-list" && (
            <TabContent
              items={companyList}
              loading={loadingCompanyList}
              emptyText="No verified companies"
              textMuted={textMuted}
              onRemove={handleRemoveCompany}
            />
          )}
          {activeTab === "product-requests" && (
            <TabContent
              items={productRequests}
              loading={loadingProductRequests}
              emptyText="No pending product approval requests"
              textMuted={textMuted}
              onApprove={(id) => handleProductApproval(id, "approve")}
              onDeny={(id) => handleProductApproval(id, "deny")}
            />
          )}
          {activeTab === "product-list" && (
            <TabContent
              items={productList}
              loading={loadingProductList}
              emptyText="No approved products"
              textMuted={textMuted}
              onRemove={handleRemoveProduct}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function TabContent({ items, loading, emptyText, textMuted, onApprove, onDeny, onRemove }) {
  if (loading)
    return <div className={`text-center py-12 ${textMuted}`}>Loading...</div>;
  if (items.length === 0)
    return <div className={`text-center py-12 ${textMuted}`}>{emptyText}</div>;

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item._id} className="border border-gray-300 dark:border-gray-700 rounded-lg p-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold">{item.name || item.fullName || "Unnamed"}</h3>
              <p className={`text-sm ${textMuted}`}>
                {item.email || item.category || item.productId || "—"}
              </p>
            </div>
            <div className="flex gap-2">
              {onApprove && (
                <button
                  onClick={() => onApprove(item._id)}
                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Approve
                </button>
              )}
              {onDeny && (
                <button
                  onClick={() => onDeny(item._id)}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Deny
                </button>
              )}
              {onRemove && (
                <button
                  onClick={() => onRemove(item._id)}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
