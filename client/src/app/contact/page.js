"use client";
import React, { useContext, useState } from "react";
import { ThemeContext } from "@/context/ThemeContext";

export default function ContactPage() {
  const { theme } = useContext(ThemeContext);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(null);

  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");

    const scriptURL = process.env.NEXT_PUBLIC_CONTACT_SCRIPT_URL || "";

    if (!scriptURL) {
      console.error("Contact script URL is not defined");
      setStatus("error");
      setError("Server configuration error. Please try again later.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("message", message);

      // Use no-cors to avoid CORS/preflight issues. Request will reach the Apps Script.
      await fetch(scriptURL, {
        method: "POST",
        mode: "no-cors",
        body: formData,
      });

      // We can't reliably read response due to no-cors, assume success if no exception
      setStatus("success");
      setName(""); setEmail(""); setMessage("");
    } catch (err) {
      console.error("Error submitting form:", err);
      setStatus("error");
    }
  };

  const textColor = theme === "dark" ? "text-white" : "text-gray-900";
  const subText = theme === "dark" ? "text-gray-300" : "text-gray-700";

  const scriptURL = process.env.NEXT_PUBLIC_CONTACT_SCRIPT_URL || "";
  const scriptAvailable = Boolean(scriptURL);

  return (
    <div
      className={`
        relative w-full min-h-screen overflow-hidden 
        ${theme === "dark"
          ? "bg-linear-to-b from-black via-gray-900 to-gray-800"
          : "bg-linear-to-br from-white via-gray-200 to-blue-100"
        }
        transition-colors duration-500
      `}
    >
      {/* ✅ Ambient gradient overlay */}
      <div className="s-ambient-gradient absolute inset-0 opacity-70"></div>

      <main className="relative flex flex-col items-center px-4 py-16 animate-fadeIn">
        {/* ✅ Glass card container */}
        <div
          className={`
            relative max-w-xl w-full p-10 rounded-3xl glass-card smooth-transition
            ${theme === "dark" ? "glow-border-dark" : "glow-border-light"}
          `}
        >
          {/* Lens glow overlay */}
          <div
            className={`
              absolute inset-0 rounded-3xl opacity-40 blur-xl pointer-events-none
              ${theme === "dark"
                ? "bg-linear-to-r from-white/20 via-transparent to-white/20"
                : "bg-linear-to-r from-gray-200 via-transparent to-gray-200"
              }
            `}
          ></div>

          {/* Header */}
          <h1
            className={`relative text-4xl font-extrabold text-center mb-4 ${textColor}`}
          >
            📩 Contact Us
          </h1>

          <p className={`relative mb-10 text-center text-lg ${subText}`}>
            We'd love to hear from you! Reach out with any questions or feedback.
          </p>

          {/* ✅ Contact Form */}
          <form onSubmit={handleSubmit} className="relative flex flex-col gap-6">
            {/* Name */}
            <div className="hover-lift transition-all">
              <label className={`block mb-2 font-semibold ${textColor}`}>
                Your Name
              </label>
              <input
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                type="text"
                placeholder="Enter your name"
                required
                className={`
                  w-full px-5 py-3 rounded-xl
                  bg-white/40 dark:bg-black/30
                  backdrop-blur-xl smooth-transition
                  border border-white/40 dark:border-gray-500/40
                  shadow-md focus:ring-2 focus:ring-blue-400/60 
                  text-gray-900 dark:text-gray-100
                  placeholder-gray-600 dark:placeholder-gray-300
                `}
              />
            </div>

            {/* Email */}
            <div className="hover-lift transition-all">
              <label className={`block mb-2 font-semibold ${textColor}`}>
                Your Email
              </label>
              <input
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="Enter your email"
                required
                className={`
                  w-full px-5 py-3 rounded-xl
                  bg-white/40 dark:bg-black/30
                  backdrop-blur-xl smooth-transition
                  border border-white/40 dark:border-gray-500/40
                  shadow-md focus:ring-2 focus:ring-blue-400/60 
                  text-gray-900 dark:text-gray-100
                  placeholder-gray-600 dark:placeholder-gray-300
                `}
              />
            </div>

            {/* Message */}
            <div className="hover-lift transition-all">
              <label className={`block mb-2 font-semibold ${textColor}`}>
                Your Message
              </label>
              <textarea
                name="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                placeholder="Type your message..."
                required
                className={`
                  w-full px-5 py-3 rounded-xl
                  bg-white/40 dark:bg-black/30
                  backdrop-blur-xl smooth-transition
                  border border-white/40 dark:border-gray-500/40
                  shadow-md focus:ring-2 focus:ring-blue-400/60 
                  text-gray-900 dark:text-gray-100
                  placeholder-gray-600 dark:placeholder-gray-300 resize-none
                `}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!scriptAvailable}
              className={`
                w-full py-3 mt-2 rounded-xl text-lg font-bold
                transition transform hover:scale-105 hover:shadow-xl
                ${theme === "dark"
                  ? "bg-black text-white hover:bg-gray-600"
                  : "bg-blue-500 text-white hover:bg-gray-600"
                }
                ${(!scriptAvailable || error) ? "opacity-60 cursor-not-allowed" : ""}
              `}
            >
              {scriptAvailable ? 'Send Message →' : 'Unavailable'}
            </button>

            {/* Show server configuration message when script URL missing */}
            {!scriptAvailable && (
              <p className="text-center text-red-500 mt-2">
                Server configuration error. Please try again later.
              </p>
            )}

            {/* ✅ Status messages */}
            {status === "loading" && (
              <p className="text-center text-blue-400 mt-2 animate-pulse">
                Sending...
              </p>
            )}
            {status === "success" && (
              <p className="text-center text-green-500 mt-2">
                ✅ Message sent successfully!
              </p>
            )}
            {status === "error" && (
              <p className="text-center text-red-500 mt-2">
                ❌ Something went wrong. Please try again.
              </p>
            )}
          </form>

          {/* Contact Info */}
          <div className={`relative mt-10 text-center text-sm ${subText}`}>
            <p className="mb-1">
              📧 Email:{" "}
              <a
                href="mailto:info@nutrilens.com"
                className="underline hover:text-blue-400"
              >
                info@nutrilens.com
              </a>
            </p>
            <p className="mb-1">
              📞 Phone:{" "}
              <a
                href="tel:+1234567890"
                className="underline hover:text-blue-400"
              >
                +1 (234) 567-890
              </a>
            </p>
            <p>📍 Address: #112, Church Street, Bengaluru-560064</p>
          </div>
        </div>
      </main>
    </div>
  );
}