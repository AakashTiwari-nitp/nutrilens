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
  const [news, setNews] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // --- Image slider ---
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [images.length]);

  // --- Demo News ---
  useEffect(() => {
    const demoNews = {
      title: "Experts Warn Against Excessive Salt in Packaged Foods",
      description:
        "A new health report suggests that high sodium levels in instant noodles, chips, and other packaged foods can increase the risk of hypertension. Health authorities recommend reading nutrition labels carefully.",
      content: `
        Processed and packaged food items often contain hidden sodium, 
        even in products that don't taste particularly salty. Excessive sodium 
        intake can contribute to high blood pressure, stroke, and heart disease. 
        Experts recommend limiting packaged foods and opting for fresh alternatives 
        whenever possible.

        “The real issue,” says Dr. Anita Rao, “is that people are unaware of how 
        much salt is actually present in the food they consume daily.”

        The report calls for stricter labeling laws and encourages consumers to 
        check nutrition facts before purchase.
      `,
      image: "/images/news-demo.jpg",
    };
    setNews(demoNews);
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
      <main className="md:ml-48 p-8 min-h-screen overflow-y-auto relative">
        <Header />

        {/* Auto Image Slider */}
        <div className="relative w-full h-64 overflow-hidden rounded-2xl shadow-lg mb-8">
          {images.map((img, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === current ? "opacity-100" : "opacity-0"
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
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-12 transition-all duration-500 ${
            showAll ? "max-h-[3000px]" : "max-h-[500px] overflow-hidden"
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

        {/* Categories Grid - Updated Layout */}
        <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100">
          Browse Categories
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {categories.map((cat, index) => (
            <div
              key={index}
              onClick={() => handleCategoryClick(cat.value)}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl hover:scale-105 transition-transform duration-300 cursor-pointer"
            >
              <div className="relative w-full h-48">
                <Image
                  src={cat.img}
                  alt={cat.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <h2 className="absolute bottom-4 left-4 text-xl font-semibold text-white">
                  {cat.name}
                </h2>
              </div>
            </div>
          ))}
        </div>

        {/* 📰 Latest News Section */}
        <section className={`${cardBg} rounded-xl shadow-md p-6 mb-12`}>
          <h2 className={`text-2xl font-bold mb-4 ${cardText}`}>Latest News</h2>

          {!news ? (
            <p className={`${subText} italic`}>
              Fetching latest health news...
            </p>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {news.image && (
                <div className="relative w-full sm:w-1/3 h-48 rounded-xl overflow-hidden">
                  <Image
                    src={news.image}
                    alt={news.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="sm:w-2/3">
                <h3 className={`text-xl font-semibold mb-2 ${cardText}`}>
                  {news.title}
                </h3>
                <p className={`${subText} mb-3`}>{news.description}</p>
                <button
                  onClick={() => setShowModal(true)}
                  className={`font-medium cursor-pointer ${buttonText}`}
                >
                  Read Full Article →
                </button>
              </div>
            </div>
          )}
        </section>

        {/* 🌈 GIF Section (Below Latest News) */}
        <section className="relative w-full h-100 overflow-hidden mb-12">
          <Image
            src="/images/bg.gif"
            alt="Healthy food background animation"
            fill
            className="object-cover"
          />
        </section>

        {/* 🪟 Popup Modal */}
        {showModal && (
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50"
            onClick={() => setShowModal(false)}
          >
            <div
              className={`${cardBg} rounded-xl shadow-xl w-11/12 md:w-2/3 lg:w-1/2 p-6 relative animate-fadeIn`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 cursor-pointer"
              >
                <X size={24} />
              </button>

              {/* Article content */}
              <h2 className={`text-2xl font-bold mb-4 ${cardText}`}>
                {news.title}
              </h2>

              {news.image && (
                <div className="relative w-full h-52 mb-4 rounded-xl overflow-hidden">
                  <Image
                    src={news.image}
                    alt={news.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              <p className={`${subText} whitespace-pre-line leading-relaxed`}>
                {news.content}
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
