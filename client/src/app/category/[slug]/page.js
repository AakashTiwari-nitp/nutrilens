"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "@/components/ProductCard";

export default function CategoryPage() {
  const pathname = usePathname();
  const category = pathname.split("/").pop();

  // Demo items data - Replace this with actual API call later
  const [items, setItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(category);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const categories = [
    { name: "Biscuits", value: "biscuits", img: "/images/biscuit.jpg" },
    { name: "Breakfast & Spreads", value: "breakfast-and-spreads", img: "/images/bread.jpg" },
    { name: "Chocolates & Desserts", value: "chocolates-and-desserts", img: "/images/chocolate.jpg" },
    { name: "Cold Drinks & Juices", value: "cold-drinks-and-juices", img: "/images/colddrinks.jpg" },
    { name: "Dairy, Bread & Eggs", value: "dairy-bread-and-eggs", img: "/images/dairy.jpg" },
    { name: "Instant Foods", value: "instant-foods", img: "/images/instant.jpg" },
    { name: "Snacks", value: "snacks", img: "/images/snacks.jpg" },
    { name: "Cakes & Bakes", value: "cakes-and-bakes", img: "/images/bread.jpg" },
    { name: "Dry Fruits, Oil & Masalas", value: "dry-fruits-oil-and-masalas", img: "/images/dryfruits.jpg" },
    { name: "Meat", value: "meat", img: "/images/meat.jpg" },
    { name: "Rice, Atta & Dals", value: "rice-atta-and-dals", img: "/images/rice.jpg" },
    { name: "Tea, Coffee & More", value: "tea-coffee-and-more", img: "/images/coffee.jpg" },
    { name: "Supplements & Mores", value: "supplements-and-mores", img: "/images/protein.jpg" },
  ];

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get base URL from environment variable
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
        const apiUrl = `${baseUrl}/product/get-products`;
        
        console.log('Fetching from:', apiUrl); // Debug log
        
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        console.log('API Response:', data); // Debug log
        console.log('Selected Category:', selectedCategory); // Debug log
        
        if (data.success) {
          // Extract products from the correct path in the response
          const products = data.data.products || [];
          
          // Filter products for the current category
          const filteredProducts = products.filter(product => {
            const productCategory = product.category?.toLowerCase().trim() || '';
            const selectedCat = selectedCategory.replace(/-/g, " ").toLowerCase().trim();
            
            console.log('Comparing:', {
              product: product.name,
              productCategory,
              selectedCategory: selectedCat,
              isApproved: product.isApproved
            });
            
            return productCategory === selectedCat;
          });
          
          console.log('Filtered Products:', filteredProducts); // Debug log
          setItems(filteredProducts);
          setCurrentPage(1); // Reset to first page when category changes
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
    
    // Cleanup function
    return () => {
      setItems([]);
      setLoading(false);
      setError(null);
    };
  }, [selectedCategory]);

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
    <div className="flex min-h-screen bg-gray-100">
      {/* Category Sidebar - Keep this one */}
      <div className="hidden md:flex w-64 flex-col fixed h-screen bg-white shadow-lg overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Categories</h2>
          <div className="space-y-2">
            {categories.map((cat) => (
              <Link
                key={cat.value}
                href={`/category/${cat.value}`}
                className={`block p-2 rounded-lg transition-colors ${
                  selectedCategory === cat.value
                    ? "bg-blue-100 text-black"
                    : "hover:bg-gray-100"
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 md:ml-64 p-8">
        <h1 className="text-3xl font-bold mb-6 capitalize">
          {selectedCategory.replace(/-/g, " ")}
        </h1>

        {loading && (
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="text-black text-lg">Loading products...</div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-4">
            <p className="font-semibold">Error loading products:</p>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-600 p-4 rounded-lg">
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
                  <span className="text-sm font-medium">
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