"use client";
import { useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";

export default function ProfileRouterPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated || !user) {
      router.replace("/auth/login?message=Please login to view your profile");
      return;
    }

    switch (user.role) {
      case "company":
        router.replace("/profile/company");
        break;
      case "admin":
        router.replace("/profile/admin");
        break;
      default:
        router.replace("/profile/user");
        break;
    }
  }, [loading, isAuthenticated, user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center text-gray-600">
      Loading profile...
    </div>
  );
}


