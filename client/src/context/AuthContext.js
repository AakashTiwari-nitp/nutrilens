"use client";
import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
        let response = await fetch(`${apiUrl}/user/profile`, {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok && response.status === 401) {
          // try to refresh access token and retry
          const refreshResp = await fetch(`${apiUrl}/user/refresh-token`, {
            method: "POST",
            credentials: "include",
          });
          if (refreshResp.ok) {
            response = await fetch(`${apiUrl}/user/profile`, {
              method: "GET",
              credentials: "include",
            });
          }
        }

        if (response.ok) {
          const data = await response.json();
          setUser(data.data?.user);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
      await fetch(`${apiUrl}/user/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};