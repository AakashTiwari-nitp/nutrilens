"use client";
import React, { useState, useContext } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { ThemeContext } from "../context/ThemeContext";
import { FaBars, FaTimes, FaChevronDown, FaChevronUp } from "react-icons/fa";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [catsOpen, setCatsOpen] = useState(false);
  const pathname = usePathname();
  const { theme } = useContext(ThemeContext);

  const menuItems = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Services", path: "/services" },
    { name: "Contact", path: "/contact" },
  ];

  const categories = [
    { name: "Biscuits", value: "biscuits" },
    { name: "Breakfast & Spreads", value: "breakfast-and-spreads" },
    { name: "Chocolates & Desserts", value: "chocolates-and-desserts" },
    { name: "Cold Drinks & Juices", value: "cold-drinks-and-juices" },
    { name: "Dairy, Bread & Eggs", value: "dairy-bread-and-eggs" },
    { name: "Instant Foods", value: "instant-foods" },
    { name: "Snacks", value: "snacks" },
    { name: "Cakes & Bakes", value: "cakes-and-bakes" },
    { name: "Dry Fruits, Oil & Masalas", value: "dry-fruits-oil-and-masalas" },
    { name: "Meat", value: "meat" },
    { name: "Rice, Atta & Dals", value: "rice-atta-and-dals" },
    { name: "Tea, Coffee & More", value: "tea-coffee-and-more" },
    { name: "Supplements & Mores", value: "supplements-and-mores" },
  ];

  const sidebarBg =
    theme === "dark"
      ? "bg-gradient-to-b from-black via-gray-900 to-gray-800"
      : "bg-gray-200";

  const isActiveCategory = (value) => {
    if (!pathname) return false;
    return pathname.startsWith(`/category/${value}`);
  };

  return (
    <>
      {/* Mobile hamburger icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 text-2xl text-gray-800 dark:text-gray-100"
        aria-label="Toggle sidebar"
      >
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>

      <aside
        className={`fixed top-0 left-0 h-full w-48 ${sidebarBg} shadow-xl border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 ease-in-out z-50
          ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-24 border-b border-gray-300 dark:border-gray-700">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              LOGO
            </h1>
          </div>

          {/* Menu */}
          <nav className="mt-6 px-4">
            <ul className="flex flex-col space-y-2">
              {menuItems.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.path}
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

           {/* Categories Dropdown */}
          <div className="px-4 mt-2">
            <button
              onClick={() => setCatsOpen(!catsOpen)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <span className= "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition">
                Categories
              </span>
              <span className="text-gray-500 dark:text-gray-300">
                {catsOpen ? <FaChevronUp /> : <FaChevronDown />}
              </span>
            </button>

            {catsOpen && (
              <ul className="mt-2 max-h-56 overflow-auto space-y-1">
                {categories.map((cat) => (
                  <li key={cat.value}>
                    <Link
                      href={`/category/${cat.value}`}
                      onClick={() => setIsOpen(false)}
                      className={`block px-3 py-2 rounded-md text-sm transition ${
                        isActiveCategory(cat.value)
                          ? "bg-blue-100 text-black"
                          : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                      }`}
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Spacer pushes remaining items to bottom */}
          <div className="flex-grow" />

          {/* Login/Register */}
          <div className="px-4 mb-4">
            <button
              className={`w-full py-2 rounded-lg font-semibold transition
                ${theme === "dark"
                  ? "bg-white text-black hover:bg-gray-200"
                  : "bg-black text-white hover:bg-gray-900"}`}
            >
              Login/Signup
            </button>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-300 dark:border-gray-700 mx-4 my-3" />

          {/* Footer */}
          <div className="w-full text-center text-xs text-gray-600 dark:text-gray-300 mb-4">
            <div className="flex flex-col items-center justify-center gap-2 mb-1">
              <Link href="/privacy" className="hover:underline">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:underline">
                Terms & Conditions
              </Link>
            </div>
            <p>© 2025 NutriLens</p>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
