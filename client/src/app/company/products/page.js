"use client";
import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";

export default function CompanyProductsPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated, login } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (!loading && (!isAuthenticated || !user || user.role !== "company")) {
      router.replace("/auth/login?message=Company access required");
    }
    if (user?.accountStatus !== "verified") {
      setError("Only verified companies can manage products");
    }
  }, [loading, isAuthenticated, user, router]);

  useEffect(() => {
    if (user?.role === "company" && user?.accountStatus === "verified") {
      loadProducts();
    }
  }, [user]);

  const loadProducts = async () => {
    try {
      setLoadingProducts(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
      const resp = await fetch(`${apiUrl}/user/get-all-products`, {
        method: "GET",
        credentials: "include",
      });
      const data = await resp.json();
      if (resp.ok && data?.success) {
        setProducts(data?.data?.products || []);
      } else {
        setError(data?.message || "Failed to load products");
      }
    } catch (err) {
      setError("Failed to load products");
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      setError("");
      setSuccess("");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
      const resp = await fetch(`${apiUrl}/product/delete/${productId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await resp.json();
      if (resp.ok && data?.success) {
        setSuccess("Product deleted successfully");
        await loadProducts();
      } else {
        setError(data?.message || "Failed to delete product");
      }
    } catch (err) {
      setError("Failed to delete product");
    }
  };

  if (!loading && (!isAuthenticated || !user || user.role !== "company")) {
    return null;
  }

  if (user?.accountStatus !== "verified") {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 md:ml-48">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Access Restricted</h2>
            <p className="text-red-600">Only verified companies can manage products. Please request verification first.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 md:ml-48">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Manage Products</h1>
          <button
            onClick={() => router.push("/company/products/add")}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Add New Product
          </button>
        </div>

        {(error || success) && (
          <div className="mb-4">
            {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">{error}</div>}
            {success && <div className="text-green-600 text-sm bg-green-50 p-3 rounded-md">{success}</div>}
          </div>
        )}

        {loadingProducts ? (
          <div className="text-center py-12">
            <div className="text-gray-500">Loading products...</div>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-gray-500 text-lg mb-4">No products found</div>
            <button
              onClick={() => router.push("/company/products/add")}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add Your First Product
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product._id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start gap-4 mb-4">
                  <img
                    src={product.productImage || "/images/nutrilens_logo.png"}
                    alt={product.name}
                    className="w-20 h-20 object-cover rounded-md border"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{product.name}</h3>
                    <div className="text-sm text-gray-500">ID: {product.productId}</div>
                    <div className="text-sm text-gray-500 capitalize">{product.category}</div>
                    <div className="text-lg font-bold text-gray-900 mt-2">₹{product.price}</div>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="text-sm text-gray-500 mb-1">Status</div>
                  <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                    product.isApproved ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {product.isApproved ? "Approved" : "Pending"}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/company/products/edit/${product.productId}`)}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product.productId)}
                    className="flex-1 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm transition-colors"
                  >
                    Delete
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