"use client";
import { useContext, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import { ThemeContext } from "@/context/ThemeContext";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.productId;
  const { user, loading, isAuthenticated } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);

  const [loadingProduct, setLoadingProduct] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    price: "",
    manufacturingDate: "",
    expiryDate: "",
    calories: "0",
    protein_g: "0",
    fat_g: "0",
    sat_fat_g: "0",
    trans_fat_g: "0",
    carbs_g: "0",
    fiber_g: "0",
    sugar_g: "0",
    sodium_mg: "0",
    potassium_mg: "0",
    calcium_mg: "0",
    has_processed_meat: "0",
    has_red_meat: "0",
    has_trans_fats: "0",
    has_artificial_colors: "0",
    has_preservatives: "0",
    preservative_count: "0",
  });
  const [ingredients, setIngredients] = useState([""]);
  const [productImage, setProductImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImage, setExistingImage] = useState("");

  useEffect(() => {
    if (!loading && (!isAuthenticated || !user || user.role !== "company")) {
      router.replace("/auth/login?message=Company access required");
    }
    if (user?.accountStatus !== "verified") {
      setError("Only verified companies can edit products");
    }
  }, [loading, isAuthenticated, user, router]);

  useEffect(() => {
    if (productId && user?.role === "company") {
      loadProduct();
    }
  }, [productId, user]);

  const loadProduct = async () => {
    try {
      setLoadingProduct(true);
      setError("");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
      const resp = await fetch(`${apiUrl}/product/${productId}`, {
        method: "GET",
        credentials: "include",
      });
      const data = await resp.json();
      
      if (resp.ok && data?.success) {
        const product = data?.data?.product;
        
        // Verify the product belongs to the company
        if (product.companyId?._id !== user?._id && product.companyId !== user?._id) {
          setError("You are not authorized to edit this product");
          return;
        }

        // Fill form with existing product data
        setFormData({
          name: product.name || "",
          category: product.category || "",
          description: product.description || "",
          price: product.price?.toString() || "",
          manufacturingDate: product.manufacturingDate ? new Date(product.manufacturingDate).toISOString().split('T')[0] : "",
          expiryDate: product.expiryDate ? new Date(product.expiryDate).toISOString().split('T')[0] : "",
          calories: product.nutritionalInfo?.calories?.toString() || "0",
          protein_g: product.nutritionalInfo?.protein_g?.toString() || "0",
          fat_g: product.nutritionalInfo?.fat_g?.toString() || "0",
          sat_fat_g: product.nutritionalInfo?.sat_fat_g?.toString() || "0",
          trans_fat_g: product.nutritionalInfo?.trans_fat_g?.toString() || "0",
          carbs_g: product.nutritionalInfo?.carbs_g?.toString() || "0",
          fiber_g: product.nutritionalInfo?.fiber_g?.toString() || "0",
          sugar_g: product.nutritionalInfo?.sugar_g?.toString() || "0",
          sodium_mg: product.nutritionalInfo?.sodium_mg?.toString() || "0",
          potassium_mg: product.nutritionalInfo?.potassium_mg?.toString() || "0",
          calcium_mg: product.nutritionalInfo?.calcium_mg?.toString() || "0",
          has_processed_meat: product.nutritionalInfo?.has_processed_meat?.toString() || "0",
          has_red_meat: product.nutritionalInfo?.has_red_meat?.toString() || "0",
          has_trans_fats: product.nutritionalInfo?.has_trans_fats?.toString() || "0",
          has_artificial_colors: product.nutritionalInfo?.has_artificial_colors?.toString() || "0",
          has_preservatives: product.nutritionalInfo?.has_preservatives?.toString() || "0",
          preservative_count: product.nutritionalInfo?.preservative_count?.toString() || "0",
        });

        // Set ingredients
        if (product.ingredients && product.ingredients.length > 0) {
          setIngredients(product.ingredients);
        } else {
          setIngredients([""]);
        }

        // Set existing image
        if (product.productImage) {
          setExistingImage(product.productImage);
          setImagePreview(product.productImage);
        }
      } else {
        setError(data?.message || "Failed to load product");
      }
    } catch (err) {
      setError("Failed to load product");
    } finally {
      setLoadingProduct(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleIngredientChange = (index, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value;
    setIngredients(newIngredients);
  };

  const addIngredientField = () => {
    setIngredients([...ingredients, ""]);
  };

  const removeIngredientField = (index) => {
    if (ingredients.length > 1) {
      const newIngredients = ingredients.filter((_, i) => i !== index);
      setIngredients(newIngredients);
    }
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

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      // Build nutritional info object from form data
      const nutritionalInfo = {
        calories: parseFloat(formData.calories) || 0,
        protein_g: parseFloat(formData.protein_g) || 0,
        fat_g: parseFloat(formData.fat_g) || 0,
        sat_fat_g: parseFloat(formData.sat_fat_g) || 0,
        trans_fat_g: parseFloat(formData.trans_fat_g) || 0,
        carbs_g: parseFloat(formData.carbs_g) || 0,
        fiber_g: parseFloat(formData.fiber_g) || 0,
        sugar_g: parseFloat(formData.sugar_g) || 0,
        sodium_mg: parseFloat(formData.sodium_mg) || 0,
        potassium_mg: parseFloat(formData.potassium_mg) || 0,
        calcium_mg: parseFloat(formData.calcium_mg) || 0,
        has_processed_meat: parseInt(formData.has_processed_meat) || 0,
        has_red_meat: parseInt(formData.has_red_meat) || 0,
        has_trans_fats: parseInt(formData.has_trans_fats) || 0,
        has_artificial_colors: parseInt(formData.has_artificial_colors) || 0,
        has_preservatives: parseInt(formData.has_preservatives) || 0,
        preservative_count: parseInt(formData.preservative_count) || 0,
      };

      // Filter out empty ingredients
      const ingredientsArray = ingredients.filter(ing => ing.trim() !== "");

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
      const formDataToSend = new FormData();
      
      formDataToSend.append("name", formData.name);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("manufacturingDate", formData.manufacturingDate);
      formDataToSend.append("expiryDate", formData.expiryDate);
      formDataToSend.append("nutritionalInfo", JSON.stringify(nutritionalInfo));
      formDataToSend.append("ingredients", JSON.stringify(ingredientsArray));
      formDataToSend.append("tags", JSON.stringify([]));
      
      // Only append image if a new one is selected
      if (productImage) {
        formDataToSend.append("productImage", productImage);
      }

      const resp = await fetch(`${apiUrl}/product/update-product/${productId}`, {
        method: "PATCH",
        credentials: "include",
        body: formDataToSend,
      });

      const data = await resp.json();
      if (resp.ok && data?.success) {
        setSuccess("Product updated successfully. Changes require admin approval.");
        setTimeout(() => {
          router.push("/company/products");
        }, 2000);
      } else {
        setError(data?.message || "Failed to update product");
      }
    } catch (err) {
      setError("Failed to update product");
    } finally {
      setSubmitting(false);
    }
  };

  if (!loading && (!isAuthenticated || !user || user.role !== "company")) {
    return null;
  }

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

  if (loadingProduct) {
    return (
      <div className={`min-h-screen md:ml-48 ${bg} transition-colors duration-300 flex items-center justify-center`}>
        <div className="text-center">
          <div className="text-lg mb-2">Loading product...</div>
          <div className="text-sm text-gray-400">Please wait</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen md:ml-48 ${bg} transition-colors duration-300`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Edit Product</h1>
          <button
            onClick={() => router.push("/company/products")}
            className={`px-4 py-2 rounded-md border ${borderColor}`}
          >
            Back to Products
          </button>
        </div>

        {(error || success) && (
          <div className="mb-4">
            {error && <div className={`text-sm p-3 rounded-md bg-red-500/10 text-red-400 border ${borderColor}`}>{error}</div>}
            {success && <div className={`text-sm p-3 rounded-md bg-green-500/10 text-green-400 border ${borderColor}`}>{success}</div>}
          </div>
        )}

        <div className={`${cardBg} rounded-lg shadow-xl p-6`}>
          <form onSubmit={handleUpdateProduct} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                ["Product Name *", "name", "text"],
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

            {/* Nutritional Info Section */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-3">Nutritional Information *</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[
                  ["Calories", "calories"],
                  ["Protein (g)", "protein_g"],
                  ["Fat (g)", "fat_g"],
                  ["Saturated Fat (g)", "sat_fat_g"],
                  ["Trans Fat (g)", "trans_fat_g"],
                  ["Carbs (g)", "carbs_g"],
                  ["Fiber (g)", "fiber_g"],
                  ["Sugar (g)", "sugar_g"],
                  ["Sodium (mg)", "sodium_mg"],
                  ["Potassium (mg)", "potassium_mg"],
                  ["Calcium (mg)", "calcium_mg"],
                  ["Has Processed Meat (0/1)", "has_processed_meat"],
                  ["Has Red Meat (0/1)", "has_red_meat"],
                  ["Has Trans Fats (0/1)", "has_trans_fats"],
                  ["Has Artificial Colors (0/1)", "has_artificial_colors"],
                  ["Has Preservatives (0/1)", "has_preservatives"],
                  ["Preservative Count", "preservative_count"],
                ].map(([label, name]) => (
                  <div key={name}>
                    <label className="block text-xs mb-1">{label}</label>
                    <input
                      type="number"
                      name={name}
                      value={formData[name]}
                      onChange={handleInputChange}
                      step={name.includes("has_") || name === "preservative_count" ? "1" : "0.01"}
                      min="0"
                      required
                      className={`w-full border ${borderColor} rounded-md px-2 py-1 text-sm bg-transparent`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Ingredients Section */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">Ingredients *</h3>
                <button
                  type="button"
                  onClick={addIngredientField}
                  className={`text-sm px-3 py-1 rounded-md border ${borderColor} hover:bg-gray-100 dark:hover:bg-gray-700`}
                >
                  + Add Ingredient
                </button>
              </div>
              <div className="space-y-2">
                {ingredients.map((ingredient, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={ingredient}
                      onChange={(e) => handleIngredientChange(index, e.target.value)}
                      placeholder={`Ingredient ${index + 1}`}
                      required={index === 0}
                      className={`flex-1 border ${borderColor} rounded-md px-3 py-2 bg-transparent`}
                    />
                    {ingredients.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeIngredientField(index)}
                        className={`px-3 py-2 rounded-md ${buttonDanger} text-white`}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm mb-1">Product Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className={`w-full border ${borderColor} rounded-md px-3 py-2`}
              />
              {imagePreview && (
                <img src={imagePreview} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded-md border" />
              )}
              <p className="text-xs text-gray-400 mt-1">Leave empty to keep current image</p>
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <button
                type="submit"
                disabled={submitting}
                className={`flex-1 px-4 py-2 text-white rounded-md ${buttonPrimary}`}
              >
                {submitting ? "Updating..." : "Update Product & Request Approval"}
              </button>
              <button
                type="button"
                onClick={() => router.push("/company/products")}
                className={`px-4 py-2 rounded-md border ${borderColor}`}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
