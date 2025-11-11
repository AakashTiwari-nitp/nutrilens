"use client";
import React, { useContext } from "react";
import Navbar from "./Sidebar";
import { ThemeContext } from "../context/ThemeContext";


export default function ThemedBody({ children }) {
  const { theme } = useContext(ThemeContext);
  const bodyBg = theme === "dark"
    ? "bg-gradient-to-b from-black via-gray-900 to-gray-800"
    : "bg-gray-100";
  return (
    <body className={bodyBg + " min-h-screen transition-colors duration-300"}>
      <Navbar />
      {children}
      {/* <Footer /> */}
    </body>
  );
}
