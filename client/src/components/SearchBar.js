"use client";
import React from 'react';

const SearchBar = () => {
  return (
    <div className="relative w-full max-w-lg">
      <input
        type="text"
        placeholder="Search products..."
        className="
          w-full px-5 py-3 pr-14
          rounded-full 
          bg-white/20 dark:bg-gray-700/20
          backdrop-blur-md 
          text-gray-900 dark:text-gray-100
          shadow-lg border border-white/30 dark:border-gray-500/30
          focus:outline-none focus:ring-2 focus:ring-blue-400/60
          placeholder-gray-500 dark:placeholder-gray-300
          transition
        "
      />
      <button className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 bg-blue-500 hover:bg-blue-600 text-white transition shadow-md">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
          />
        </svg>
      </button>
    </div>
  );
};

export default SearchBar;
