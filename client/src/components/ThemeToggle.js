"use client";
import { useContext } from 'react';
import { ThemeContext } from '@/context/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <div
      onClick={toggleTheme}
      className="relative w-20 h-10 rounded-full cursor-pointer bg-gray-300 dark:bg-gray-700 transition-all duration-300 shadow-md flex items-center"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`absolute left-1 h-8 w-8 transition-opacity ${
          theme === "dark" ? "opacity-30" : "opacity-100 text-yellow-400"
        }`}
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="12" r="6" />
      </svg>

      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`absolute right-1 h-6 w-6 transition-opacity ${
          theme === "dark" ? "opacity-100 text-blue-300" : "opacity-30"
        }`}
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
      </svg>

      <div
        className={`absolute top-0.6 w-10 h-9 rounded-full bg-transparent shadow-md transition-all duration-300 ${
          theme === "dark" ? "right-0.5" : "left-0.5"
        }`}
      />
    </div>
  );
};

export default ThemeToggle;
