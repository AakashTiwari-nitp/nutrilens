"use client";
import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import { ThemeContext } from "@/context/ThemeContext";

export default function CompanyProductsPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated, login } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    productId: "",
    price: "",
    manufacturingDate: "",
    expiryDate: "",
    nutritionalInfo: JSON.stringify({}),
    ingredients: JSON.stringify([]),
    tags: JSON.stringify([]),
  });
  const [productImage, setProductImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setProductImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });
      if (productImage) formDataToSend.append("productImage", productImage);

      const resp = await fetch(`${apiUrl}/product/register`, {
        method: "POST",
        credentials: "include",
        body: formDataToSend,
      });

      const data = await resp.json();
      if (resp.ok && data?.success) {
        setSuccess("Product submitted for approval successfully");
        setShowAddForm(false);
        setFormData({
          name: "",
          category: "",
          description: "",
          productId: "",
          price: "",
          manufacturingDate: "",
          expiryDate: "",
          nutritionalInfo: JSON.stringify({}),
          ingredients: JSON.stringify([]),
          tags: JSON.stringify([]),
        });
        setProductImage(null);
        setImagePreview(null);
        await loadProducts();
      } else {
        setError(data?.message || "Failed to submit product");
      }
    } catch (err) {
      setError("Failed to submit product");
    } finally {
      setSubmitting(false);
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

  // ✅ Theme-based styles
  const bg = theme === "dark" ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900";
  const cardBg = theme === "dark" ? "bg-gray-800" : "bg-white";
  const borderColor = theme === "dark" ? "border-gray-700" : "border-gray-200";
  const buttonPrimary = theme === "dark" ? "bg-blue-700 hover:bg-gray-600" : "bg-black hover:bg-gray-600";
  const buttonDanger = theme === "dark" ? "bg-red-700 hover:bg-red-600" : "bg-red-600 hover:bg-red-700";

  const categories = [
    'biscuits', 'breakfast and spreads', 'chocolates and desserts',
    'cold drinks and juices', 'dairy, bread and eggs', 'instant foods',
    'snacks', 'cakes and bakes', 'dry fruits, oil and masalas',
    'meat', 'rice, atta and dals', 'tea, coffee and more',
    'supplements and mores'
  ];

  return (
    <div className={`min-h-screen md:ml-48 ${bg} transition-colors duration-300`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Manage Products</h1>
          <button
            onClick={() => setShowAddForm(true)}
            className={`px-4 py-2 text-white rounded-md transition-colors ${buttonPrimary}`}
          >
            Add New Product
          </button>
        </div>

        {(error || success) && (
          <div className="mb-4">
            {error && <div className={`text-sm p-3 rounded-md bg-red-500/10 text-red-400 border ${borderColor}`}>{error}</div>}
            {success && <div className={`text-sm p-3 rounded-md bg-green-500/10 text-green-400 border ${borderColor}`}>{success}</div>}
          </div>
        )}

        {loadingProducts ? (
          <div className="text-center py-12 text-gray-400">Loading products...</div>
        ) : products.length === 0 ? (
          <div className={`${cardBg} rounded-lg shadow p-8 text-center`}>
            <div className="text-gray-400 text-lg mb-4">No products found</div>
            <button
              onClick={() => setShowAddForm(true)}
              className={`px-4 py-2 text-white rounded-md ${buttonPrimary}`}
            >
              Add Your First Product
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product._id} className={`${cardBg} rounded-lg shadow p-6`}>
                <div className="flex items-start gap-4 mb-4">
                  <img
                    src={product.productImage || "/images/nutrilens_logo.png"}
                    alt={product.name}
                    className="w-20 h-20 object-cover rounded-md border"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">{product.name}</h3>
                    <div className="text-sm text-gray-400">ID: {product.productId}</div>
                    <div className="text-sm text-gray-400 capitalize">{product.category}</div>
                    <div className="text-lg font-bold mt-2">₹{product.price}</div>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="text-sm text-gray-400 mb-1">Status</div>
                  <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                    product.isApproved
                      ? "bg-green-500/20 text-green-400"
                      : "bg-yellow-500/20 text-yellow-400"
                  }`}>
                    {product.isApproved ? "Approved" : "Pending"}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/company/products/edit/${product.productId}`)}
                    className={`flex-1 px-3 py-2 text-white rounded-md text-sm ${buttonPrimary}`}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product.productId)}
                    className={`flex-1 px-3 py-2 text-white rounded-md text-sm ${buttonDanger}`}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal Form — themed */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className={`${cardBg} rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto`}>
              <div className={`sticky top-0 ${cardBg} border-b ${borderColor} px-6 py-4 flex items-center justify-between`}>
                <h2 className="text-2xl font-bold">Add New Product</h2>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-400 hover:text-gray-200"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddProduct} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    ["Product Name *", "name", "text"],
                    ["Product ID *", "productId", "number"],
                    ["Price (₹) *", "price", "number"],
                    ["Manufacturing Date *", "manufacturingDate", "date"],
                    ["Expiry Date *", "expiryDate", "date"],
                  ].map(([label, name, type]) => (
                    <div key={name}>
                      <label className="block text-sm mb-1">{label}</label>
                      <input
                        type={type}
                        name={name}
                        value={formData[name]}
                        onChange={handleInputChange}
                        required
                        className={`w-full border ${borderColor} rounded-md px-3 py-2 bg-transparent`}
                      />
                    </div>
                  ))}

                  <div>
                    <label className="block text-sm mb-1">Category *</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      className={`w-full border ${borderColor} rounded-md px-3 py-2 bg-transparent`}
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm mb-1">Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className={`w-full border ${borderColor} rounded-md px-3 py-2 bg-transparent`}
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1">Nutritional Info (JSON) *</label>
                  <textarea
                    name="nutritionalInfo"
                    value={formData.nutritionalInfo}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className={`w-full border ${borderColor} rounded-md px-3 py-2 bg-transparent font-mono text-sm`}
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1">Ingredients (JSON Array) *</label>
                  <textarea
                    name="ingredients"
                    value={formData.ingredients}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className={`w-full border ${borderColor} rounded-md px-3 py-2 bg-transparent font-mono text-sm`}
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1">Product Image *</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    required
                    className={`w-full border ${borderColor} rounded-md px-3 py-2`}
                  />
                  {imagePreview && (
                    <img src={imagePreview} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded-md border" />
                  )}
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`flex-1 px-4 py-2 text-white rounded-md ${buttonPrimary}`}
                  >
                    {submitting ? "Submitting..." : "Submit for Approval"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className={`px-4 py-2 rounded-md border ${borderColor}`}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
