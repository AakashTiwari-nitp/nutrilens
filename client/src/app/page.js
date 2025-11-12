"use client";
import { useState, useEffect, useContext } from "react";
import { ThemeContext } from "@/context/ThemeContext";
import Sidebar from "@/components/Sidebar";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import Header from "@/components/Header";

export default function HomePage() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const images = [
    "/images/slide1.jpg",
    "/images/slide2.jpg",
    "/images/slide3.jpg",
  ];

  const categories = [
    { name: "Biscuits", value: "biscuits", img: "/images/biscuit.jpg" },
    {
      name: "Breakfast & Spreads",
      value: "breakfast-and-spreads",
      img: "/images/bread.jpg",
    },
    {
      name: "Chocolates & Desserts",
      value: "chocolates-and-desserts",
      img: "/images/chocolate.jpg",
    },
    {
      name: "Cold Drinks & Juices",
      value: "cold-drinks-and-juices",
      img: "/images/colddrinks.jpg",
    },
    {
      name: "Dairy, Bread & Eggs",
      value: "dairy-bread-and-eggs",
      img: "/images/dairy.jpg",
    },
    {
      name: "Instant Foods",
      value: "instant-foods",
      img: "/images/instant.jpg",
    },
    { name: "Snacks", value: "snacks", img: "/images/snacks.jpg" },
    {
      name: "Cakes & Bakes",
      value: "cakes-and-bakes",
      img: "/images/bread.jpg",
    },
    {
      name: "Dry Fruits, Oil & Masalas",
      value: "dry-fruits-oil-and-masalas",
      img: "/images/dryfruits.jpg",
    },
    { name: "Meat", value: "meat", img: "/images/meat.jpg" },
    {
      name: "Rice, Atta & Dals",
      value: "rice-atta-and-dals",
      img: "/images/rice.jpg",
    },
    {
      name: "Tea, Coffee & More",
      value: "tea-coffee-and-more",
      img: "/images/coffee.jpg",
    },
    {
      name: "Supplements & Mores",
      value: "supplements-and-mores",
      img: "/images/protein.jpg",
    },
  ];

  const [current, setCurrent] = useState(0);
  const [showAll, setShowAll] = useState(false);
  // news list, selected news for modal, loading/error states
  const [newsList, setNewsList] = useState([]);
  const [selectedNews, setSelectedNews] = useState(null);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // --- Image slider ---
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [images.length]);

  // --- Fetch latest news from API ---
  useEffect(() => {
    const fetchNews = async () => {
      try {
        setNewsLoading(true);
        setNewsError(null);
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "localhost:5000/api/v1/news/get-news";
        const res = await fetch(`${baseUrl}/news/get-news`);
        const data = await res.json();
        if (data.success && Array.isArray(data.data?.news)) {
          setNewsList(data.data.news);
          // set first as selected by default (optional)
          setSelectedNews(data.data.news[0] || null);
        } else {
          setNewsList([]);
          setNewsError(data.message || "No news available");
        }
      } catch (err) {
        console.error("Error fetching news:", err);
        setNewsError("Failed to fetch latest news. Please try again later.");
      } finally {
        setNewsLoading(false);
      }
    };

    fetchNews();
  }, []);

  const displayedCategories = showAll ? categories : categories.slice(0, 4);

  const router = useRouter();

  const handleCategoryClick = (value) => {
    router.push(`/category/${value}`);
  };

  // Theme-based classes
  const bg =
    theme === "dark"
      ? "bg-gradient-to-b from-black via-gray-900 to-gray-800"
      : "bg-gray-100";
  const cardBg = theme === "dark" ? "bg-black" : "bg-white";
  const cardText = theme === "dark" ? "text-white" : "text-gray-800";
  const subText = theme === "dark" ? "text-gray-300" : "text-gray-700";
  const buttonText =
    theme === "dark"
      ? "text-blue-400 hover:text-blue-200"
      : "text-blue-600 hover:text-blue-800";

  return (
    <div className={`${bg} min-h-screen transition-colors duration-300`}>
      <Sidebar />
      <main className="md:ml-48 px-8 mt-4 min-h-screen overflow-y-auto relative">
        <Header />

        {/* Auto Image Slider */}
        <div className="relative w-full h-64 overflow-hidden rounded-2xl shadow-lg mb-8">
          {images.map((img, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === current ? "opacity-100" : "opacity-0"
                }`}
            >
              <Image
                src={img}
                alt={`Slide ${index + 1}`}
                fill
                className="object-cover"
                priority={index === 0}
              />
            </div>
          ))}
        </div>

        {/* Top Categories */}
        <h1 className={`text-3xl font-bold mb-6 ${cardText}`}>
          Top Categories
        </h1>

        <div
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-12 transition-all duration-500 ${showAll ? "max-h-[3000px]" : "max-h-[500px] overflow-hidden"
            }`}
        >
          {displayedCategories.map((cat, index) => (
            <div
              key={index}
              onClick={() => handleCategoryClick(cat.value)}
              className={`${cardBg} rounded-xl shadow-md overflow-hidden hover:shadow-xl hover:scale-105 transition-transform duration-300 cursor-pointer`}
            >
              <div className="relative w-full h-40">
                <Image
                  src={cat.img}
                  alt={cat.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4 text-center">
                <h2 className={`text-lg font-semibold ${cardText}`}>
                  {cat.name}
                </h2>
              </div>
            </div>
          ))}
        </div>

        {/* View More / Less */}
        <div className="flex justify-center mt-4 mb-10">
          <button
            onClick={() => setShowAll(!showAll)}
            className={`flex items-center gap-2 font-semibold transition-colors cursor-pointer ${buttonText}`}
          >
            {showAll ? (
              <>
                View Less <ChevronUp className="w-5 h-5" />
              </>
            ) : (
              <>
                View More <ChevronDown className="w-5 h-5" />
              </>
            )}
          </button>
        </div>

        {/* 📰 Latest News Section */}
        <section className={`${cardBg} rounded-xl shadow-md p-6 mb-12`}>
          <h2 className={`text-2xl font-bold mb-4 ${cardText}`}>Latest News</h2>

          {newsLoading ? (
            <p className={`${subText} italic`}>Fetching latest health news...</p>
          ) : newsError ? (
            <p className="text-red-600">{newsError}</p>
          ) : newsList.length === 0 ? (
            <p className={`${subText} italic`}>No news available.</p>
          ) : (
            <>
              {/* Featured news (first item) */}
              {newsList[0] && (
                <div className="flex flex-col sm:flex-row items-center gap-6 mb-4">
                  {newsList[0].newsImage && (
                    <div className="relative w-full sm:w-1/3 h-48 rounded-xl overflow-hidden">
                      <Image
                        src={newsList[0].newsImage}
                        alt={newsList[0].title}
                        fill
                        className="object-fill"
                      />
                    </div>
                  )}
                  <div className="sm:w-2/3">
                    <h3 className={`text-xl font-semibold mb-2 ${cardText}`}>
                      {newsList[0].title}
                    </h3>
                    <p className={`${subText} mb-3`}>{newsList[0].shortDescription}</p>
                    <button
                      onClick={() => {
                        setSelectedNews(newsList[0]);
                        setShowModal(true);
                      }}
                      className={`font-medium cursor-pointer ${buttonText}`}
                    >
                      Read Full Article →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </section>

        {/* 🌈 Video Section (Below Latest News) */}
        <section className="relative w-full h-[260px] sm:h-[340px] lg:h-[420px] overflow-hidden mb-12 rounded-2xl shadow-xl">
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/videos/animated_video.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          {/* Optional overlay */}
          <div
            className={`absolute inset-0 ${theme === "dark" ? "bg-black/40" : "bg-black/10"
              }`}
          />
        </section>

        {/* 🪟 Popup Modal */}
        {showModal && selectedNews && (
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 overflow-y-auto p-4"
            onClick={() => setShowModal(false)}
          >
            <div
              className={`${cardBg} shadow-xl max-w-3xl md:max-w-2xl lg:max-w-xl relative animate-fadeIn`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white z-10"
                aria-label="Close article modal"
              >
                <X size={22} />
              </button>

              {/* Modal content wrapper with padding and max-height for scrolling */}
              <div className="px-6 py-6 sm:px-8 sm:py-8 md:px-10 md:py-10 max-h-[95vh] overflow-y-auto">
                <h2 className={`text-2xl sm:text-3xl font-bold mb-4 ${cardText}`}>
                  {selectedNews.title}
                </h2>

                {selectedNews.newsImage && (
                  <div className="relative w-full h-56 sm:h-64 mb-6 rounded-lg overflow-hidden">
                    <Image
                      src={selectedNews.newsImage}
                      alt={selectedNews.title}
                      fill
                      className="object-fill"
                    />
                  </div>
                )}

                <div className={`${subText} whitespace-pre-line leading-relaxed text-base sm:text-lg`}>
                  {selectedNews.content}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 text-sm sm:text-base text-gray-500 dark:text-gray-400">
                  <div className="mb-1">Author: {selectedNews.author?.fullName || selectedNews.author?.username}</div>
                  <div>Published: {new Date(selectedNews.createdAt).toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
