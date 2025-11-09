"use client";
import React, { useState } from "react";
import { FaBars, FaTimes, FaUser } from "react-icons/fa";
import Link from "next/link";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Services", path: "/services" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <>
      {/* Hamburger button for small screens */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-2xl text-gray-800 focus:outline-none"
        >
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        {/* Logo */}
        <div className="flex items-center justify-center h-20 border-b">
          <h1 className="text-2xl font-bold">LOGO</h1>
        </div>

        {/* Menu Items */}
        <ul className="flex flex-col mt-4">
          {menuItems.map((item) => (
              <li key={item.name} className="px-6 py-3 hover:bg-gray-100">
                <Link href={item.path} onClick={() => setIsOpen(false)}>
                  {item.name}
                </Link>
            </li>
          ))}
        </ul>

        {/* Login Icon at bottom */}
        <div className="absolute bottom-6 w-full flex justify-center">
          <Link href="/login">
            <FaUser className="text-2xl text-gray-800" />
          </Link>
        </div>
      </div>

      {/* Overlay for small screens */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
};

export default Navbar;
