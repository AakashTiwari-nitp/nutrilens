"use client";
import React, { useState, useContext, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

import { ThemeContext } from "../context/ThemeContext";
import { AuthContext } from "../context/AuthContext";
import { FaBars, FaTimes, FaChevronDown, FaChevronUp, FaUser, FaSignOutAlt, FaShieldAlt, FaBox } from "react-icons/fa";
import navItems from "./NavItems.js";
import { ChevronDown, ChevronRight } from "lucide-react";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [catsOpen, setCatsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const { theme } = useContext(ThemeContext);
  const { user, isAuthenticated, logout, loading } = useContext(AuthContext);

  const [openSubmenu, setOpenSubmenu] = useState(null);
  const menuButtonRef = useRef(null);

  const toggleSubmenu = (title) => {
    setOpenSubmenu(openSubmenu === title ? null : title);
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closeSidebar = () => {
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  const handleLinkClick = () => {
    if (window.innerWidth < 768) {
      onLinkClick();
    }
  };

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

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
    setUserMenuOpen(false);
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
          <div className="flex items-center">
            <Image
              src="/images/nutrilens_logo.png"
              alt="NutriLens Logo"
              width={30}
              height={30}
              className="rounded-full object-cover ml-6 mt-6"
              priority
            />
            <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100 mt-6 ml-6">
              NutriLens
            </h1>
          </div>

          {/* Menu */}
          <nav className="p-2 mt-4 overflow-y-auto h-[calc(100vh-64px)] md:h-auto">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.name}>
                  {item.dropdown ? (
                    // Dropdown menu
                    <div>
                      <button
                        onClick={() => toggleSubmenu(item.name)}
                        className="flex items-center justify-between w-full p-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium"
                      >
                        <span className="flex items-center gap-2">
                          {item.icon}
                          {item.name}
                        </span>
                        {openSubmenu === item.name ? (
                          <ChevronDown size={16} />
                        ) : (
                          <ChevronRight size={16} />
                        )}
                      </button>

                      <ul
                        className={`ml-6 mt-1 space-y-2 overflow-hidden transition-all duration-200 ${openSubmenu === item.name ? "max-h-40 overflow-y-auto" : "max-h-0"
                          }`}
                      >
                        {item.dropdown.map((subitem) => (
                          <li key={subitem.name}>
                            {!!subitem.url ? (
                              <Link
                                href={subitem.url}
                                className="block p-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                                onClick={closeSidebar}
                              >
                                {subitem.name}
                              </Link>
                            ) : (
                              <span className="block p-2 text-[#8B3A32] font-medium">
                                {subitem.name}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : !!item.url ? (
                    // Normal item with url
                    <Link
                      href={item.url}
                      className="flex items-center gap-2 p-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium"
                      onClick={closeSidebar}
                    >
                      {item.icon}
                      {item.name}
                    </Link>
                  ) : (
                    // No url → render as plain text (e.g., department title)
                    <span className="flex items-center gap-2 p-2 text-red-700 font-bold">
                      {item.icon}
                      {item.name}
                    </span>
                  )}
                </li>
              ))}
              {/* Admin-only approval link */}
              {user?.role === "admin" && user?.accountStatus === "approved" && (
                <>
                  <li>
                    <Link
                      href="/admin/approval"
                      className="flex items-center gap-2 p-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium"
                      onClick={closeSidebar}
                    >
                      <FaShieldAlt size={18} />
                      Approval Requests
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/admin/company-approval"
                      className="flex items-center gap-2 p-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium"
                      onClick={closeSidebar}
                    >
                      <FaShieldAlt size={18} />
                      Approved List
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </nav>

                        {/* Company-only product management link */}
                        {user?.role === "company" && user?.accountStatus === "verified" && (
                <li>
                  <Link
                    href="/company/products"
                    className="flex items-center gap-2 p-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium"
                    onClick={closeSidebar}
                  >
                    <FaBox size={18} />
                    My Products
                  </Link>
                </li>
              )}

          {/* Spacer pushes remaining items to bottom */}
          <div className="grow" />

          {/* Login/Register or User Menu */}
          <div className="px-4 mb-4 mx-auto">
            {!loading && (isAuthenticated && user) ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className={`
                    w-full py-3 px-5 text-center font-semibold text-sm 
                    rounded-full transition-all duration-300 relative overflow-hidden
                    flex items-center justify-center gap-2
                    ${theme === "dark"
                      ? "bg-linear-to-r from-white/80 via-gray-200 to-white/70 text-black shadow-lg shadow-white/20 border border-white/20 hover:shadow-white/40"
                      : "bg-linear-to-r from-black via-gray-800 to-black text-white shadow-lg shadow-black/20 border border-black/20 hover:shadow-black/40"
                    }
                    hover:scale-[1.03]
                  `}
                >
                  <FaUser size={16} />
                  <span className="truncate">{user.username}</span>
                </button>

                {userMenuOpen && (
                  <div className={`absolute bottom-full mb-2 w-full rounded-md shadow-lg z-50 ${theme === "dark" ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-300"
                    }`}>
                    <Link
                      href="/profile"
                      onClick={() => {
                        setIsOpen(false);
                        setUserMenuOpen(false);
                      }}
                      className={`block px-4 py-2 text-sm rounded-t-md ${theme === "dark"
                        ? "text-gray-200 hover:bg-gray-700"
                        : "text-gray-700 hover:bg-gray-100"
                        }`}
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className={`w-full text-left px-4 py-2 text-sm rounded-b-md flex items-center gap-2 ${theme === "dark"
                        ? "text-red-400 hover:bg-gray-700"
                        : "text-red-600 hover:bg-gray-100"
                        }`}
                    >
                      <FaSignOutAlt size={14} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth/signup"
                onClick={() => setIsOpen(false)}
                className={`
                  w-full py-3 px-5 text-center font-semibold text-sm 
                  rounded-full transition-all duration-300 relative overflow-hidden
                  flex items-center justify-center
                  ${theme === "dark"
                    ? "bg-linear-to-r from-white/80 via-gray-200 to-white/70 text-black shadow-lg shadow-white/20 border border-white/20 hover:shadow-white/40"
                    : "bg-linear-to-r from-black via-gray-800 to-black text-white shadow-lg shadow-black/20 border border-black/20 hover:shadow-black/40"
                  }
                  hover:scale-[1.03]
                `}
              >
                {/* Inner sheen effect */}
                <span
                  className={`
                    absolute inset-0 rounded-full pointer-events-none
                    ${theme === "dark"
                      ? "bg-linear-to-r from-transparent via-white/20 to-transparent opacity-40"
                      : "bg-linear-to-r from-transparent via-gray-300/20 to-transparent opacity-40"
                    }
                  `}
                ></span>

                Login / Signup
              </Link>
            )}
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
