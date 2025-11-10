"use client";
import { useState, useEffect, useContext } from 'react';
import { ThemeContext } from '@/context/ThemeContext';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function ProductDetailsPage() {
  const { theme } = useContext(ThemeContext);
  const pathname = usePathname();
  const productId = pathname.split("/").pop();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const bg = theme === "dark" ? "bg-gray-900" : "bg-gray-100";
  const cardBg = theme === "dark" ? "bg-gray-800" : "bg-white";
  const textColor = theme === "dark" ? "text-white" : "text-gray-900";
  const subText = theme === "dark" ? "text-gray-300" : "text-gray-600";

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        const response = await fetch(`${baseUrl}/product/${productId}`);
        const data = await response.json();

        if (data.success) {
          setProduct(data.data.product);
        } else {
          setError(data.message || "Failed to fetch product details");
        }
      } catch (error) {
        setError("Failed to load product details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bg} py-12 px-4 sm:px-6 lg:px-8 md:ml-48 transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto">
        <div className={`${cardBg} rounded-xl shadow-lg overflow-hidden transition-colors duration-300`}>
          {/* Product Header */}
          <div className="p-8">
            <Link href={`/category/${product.category}`} className="text-blue-600 hover:underline mb-4 block">
              ← Back to {product.category}
            </Link>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Product Image */}
              <div className="relative h-96 rounded-lg overflow-hidden">
                <Image 
                  src={product.productImage} 
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Product Info */}
              <div>
                <h1 className={`text-3xl font-bold ${textColor} mb-4 transition-colors duration-300`}>
                  {product.name}
                </h1>
                <p className={`${subText} mb-4 transition-colors duration-300`}>
                  {product.description}
                </p>
                <div className="space-y-4">
                  <p className="text-2xl font-bold text-blue-600">₹{product.price}</p>
                  <div className="flex gap-2">
                    {product.tags.map((tag) => (
                      <span key={tag} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div>
                    <p className={`text-sm ${subText} transition-colors duration-300`}>
                      Product ID: {product.productId}
                    </p>
                    <p className={`text-sm ${subText} transition-colors duration-300`}>
                      Expiry: {new Date(product.expiryDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Nutritional Info */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-8">
            <h2 className={`text-2xl font-bold mb-4 ${textColor}`}>Nutritional Information</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {Object.entries(product.nutritionalInfo).map(([key, value]) => (
                <div key={key} className={`${theme === "dark" ? "bg-gray-700" : "bg-gray-50"} p-4 rounded-lg text-center transition-colors duration-300`}>
                  <p className={`${subText} capitalize transition-colors duration-300`}>{key}</p>
                  <p className={`font-bold ${textColor} transition-colors duration-300`}>{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Ingredients */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-8">
            <h2 className={`text-2xl font-bold mb-4 ${textColor}`}>Ingredients</h2>
            <div className="flex flex-wrap gap-2">
              {product.ingredients.map((ingredient, index) => (
                <span key={index} className={`px-3 py-1 ${theme === "dark" ? "bg-gray-700 text-gray-200" : "bg-gray-100 text-gray-800"} rounded-full text-sm transition-colors duration-300`}>
                  {ingredient}
                </span>
              ))}
            </div>
          </div>

          {/* Additional Information */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold mb-4">Product Details</h2>
              <div className="space-y-2">
                <p><span className="font-semibold">Manufacturing Date:</span> {new Date(product.manufacturingDate).toLocaleDateString()}</p>
                <p><span className="font-semibold">Expiry Date:</span> {new Date(product.expiryDate).toLocaleDateString()}</p>
                <p><span className="font-semibold">Rating:</span> {product.publicRating} ⭐</p>
              </div>
            </div>
            {product.certifications.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Certifications</h2>
                <div className="flex flex-wrap gap-2">
                  {product.certifications.map((cert, index) => (
                    <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
