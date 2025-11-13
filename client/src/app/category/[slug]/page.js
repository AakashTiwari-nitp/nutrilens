"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import Header from "@/components/Header";

export default function CategoryPage() {
  const pathname = usePathname();
  const category = pathname.split("/").pop();

  const [items, setItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(category);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const categories = [
    { name: "Biscuits", value: "biscuits", dbValue: "biscuits" },
    { name: "Breakfast & Spreads", value: "breakfast-and-spreads", dbValue: "breakfast and spreads" },
    { name: "Chocolates & Desserts", value: "chocolates-and-desserts", dbValue: "chocolates and desserts" },
    { name: "Cold Drinks & Juices", value: "cold-drinks-and-juices", dbValue: "cold drinks and juices" },
    { name: "Dairy, Bread & Eggs", value: "dairy-bread-and-eggs", dbValue: "dairy, bread and eggs" },
    { name: "Instant Foods", value: "instant-foods", dbValue: "instant foods" },
    { name: "Snacks", value: "snacks", dbValue: "snacks" },
    { name: "Cakes & Bakes", value: "cakes-and-bakes", dbValue: "cakes and bakes" },
    { name: "Dry Fruits, Oil & Masalas", value: "dry-fruits-oil-and-masalas", dbValue: "dry fruits, oil and masalas" },
    { name: "Meat", value: "meat", dbValue: "meat" },
    { name: "Rice, Atta & Dals", value: "rice-atta-and-dals", dbValue: "rice, atta and dals" },
    { name: "Tea, Coffee & More", value: "tea-coffee-and-more", dbValue: "tea, coffee and more" },
    { name: "Supplements & Mores", value: "supplements-and-mores", dbValue: "supplements and mores" },
  ];

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
        const apiUrl = `${baseUrl}/product/get-products`;
        
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        if (data.success) {
          const products = data.data.products || [];
          
          // Find the category mapping
          const categoryMapping = categories.find(cat => cat.value === selectedCategory);
          const dbCategoryValue = categoryMapping?.dbValue || selectedCategory.replace(/-/g, " ").toLowerCase().trim();
          
          // Filter products for the current category - exact match with database value
          const filteredProducts = products.filter(product => {
            const productCategory = (product.category || '').toLowerCase().trim();
            const targetCategory = dbCategoryValue.toLowerCase().trim();
            
            // Also check if product is approved (double check)
            return productCategory === targetCategory && product.isApproved === true;
          });
          
          setItems(filteredProducts);
          setCurrentPage(1);
        } else {
          setError(data.message || "Failed to fetch products");
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        setError(
          error.message === "Failed to fetch" 
            ? "Unable to connect to the server. Please check your internet connection or try again later."
            : "Failed to fetch products. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    
    return () => {
      setItems([]);
      setLoading(false);
      setError(null);
    };
  }, [selectedCategory]);

  // Update selectedCategory when pathname changes
  useEffect(() => {
    if (category) {
      setSelectedCategory(category);
    }
  }, [category]);

  // Pagination calculations
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = items.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="flex-1 md:ml-48 mt-4 px-8">
        <Header />
        <h1 className="text-3xl font-bold mb-6 capitalize text-gray-800 dark:text-white">
          {selectedCategory.replace(/-/g, " ")}
        </h1>

        {loading && (
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="text-black dark:text-white text-lg">Loading products...</div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-4 rounded-lg mb-4">
            <p className="font-semibold">Error loading products:</p>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-600 dark:text-yellow-400 p-4 rounded-lg">
            No approved products found in this category.
          </div>
        )}

        {/* Items Grid */}
        {!loading && !error && items.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentItems.map((item) => (
                <ProductCard key={item._id} item={item} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <Button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  variant="outline"
                  size="icon"
                  className="h-10 w-10"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-800 dark:text-white">
                    Page {currentPage} of {totalPages}
                  </span>
                </div>

                <Button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  size="icon"
                  className="h-10 w-10"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}