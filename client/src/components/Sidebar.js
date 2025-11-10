"use client";
import React, { useState, useContext } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { ThemeContext } from "../context/ThemeContext";
import { FaBars, FaTimes } from "react-icons/fa";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { theme } = useContext(ThemeContext);

  if (pathname.startsWith("/category/")) return null;

  const menuItems = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Services", path: "/services" },
    { name: "Contact", path: "/contact" },
  ];

  const sidebarBg =
    theme === "dark"
      ? "bg-gradient-to-b from-black via-gray-900 to-gray-800"
      : "bg-gray-200";

  return (
    <>
      {/* Mobile hamburger icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 text-2xl text-gray-800 dark:text-gray-100"
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
    <nav className="mt-12">
      <ul className="flex flex-col space-y-2">
        {menuItems.map((item) => (
          <li key={item.name}>
            <Link
              href={item.path}
              onClick={() => setIsOpen(false)}
              className="block px-6 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition"
            >
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>

    {/* Spacer pushes remaining items to bottom */}
    <div className="flex-grow"></div>

    {/* Login/Register */}
    <div className="px-6 mb-4">
      <button
        className={`
          w-full py-2 rounded-lg font-semibold transition
          ${theme === "dark" 
            ? "bg-white text-black hover:bg-gray-200"
            : "bg-black text-white hover:bg-gray-900"}
        `}
      >
        Login / Register
      </button>
    </div>

    {/* Divider */}
    <div className="border-t border-gray-300 dark:border-gray-700 mx-4 my-3"></div>

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
        ></div>
      )}
    </>
  );
};

export default Sidebar;
