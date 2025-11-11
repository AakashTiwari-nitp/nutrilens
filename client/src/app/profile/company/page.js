"use client";
import { useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start sm:items-center justify-between py-2 border-b border-gray-100">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-900 font-medium break-all max-w-[60%] text-right">
        {value ?? "—"}
      </span>
    </div>
  );
}

export default function CompanyProfilePage() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [prodLoading, setProdLoading] = useState(true);

  useEffect(() => {
    if (!loading && (!isAuthenticated || !user)) {
      router.replace("/auth/login?message=Please login to view your profile");
    }
  }, [loading, isAuthenticated, user, router]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
        const resp = await fetch(`${apiUrl}/user/get-all-products`, {
          method: "GET",
          credentials: "include",
        });
        if (resp.ok) {
          const data = await resp.json();
          setProducts(data?.data?.products || []);
        }
      } catch (e) {
        // silent
      } finally {
        setProdLoading(false);
      }
    };
    if (isAuthenticated) loadProducts();
  }, [isAuthenticated]);

  const dobText = useMemo(() => {
    if (!user?.dob) return "—";
    try {
      const d = new Date(user.dob);
      return d.toLocaleDateString();
    } catch {
      return "—";
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Company Profile</h1>
        <div className="mb-4">
          <button
            onClick={() => router.push("/profile/edit")}
            className="text-sm px-4 py-2 border rounded-md hover:bg-gray-50"
          >
            Edit Profile
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <img
              src={user?.avatar || "/images/nutrilens_logo.png"}
              alt="Avatar"
              className="w-16 h-16 rounded-full object-cover border"
            />
            <div>
              <div className="text-xl font-semibold text-gray-900">
                {user?.fullName ?? user?.username ?? "Company"}
              </div>
              <div className="text-gray-500">@{user?.username}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Account</h2>
              <div className="bg-gray-50 rounded-md p-4">
                <InfoRow label="Role" value={user?.role} />
                <InfoRow label="Email" value={user?.email} />
                <InfoRow label="Mobile" value={user?.mobile} />
                <InfoRow label="Account Status" value={user?.accountStatus} />
              </div>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Company Details</h2>
              <div className="bg-gray-50 rounded-md p-4">
                <InfoRow label="Contact Person" value={user?.fullName} />
                <InfoRow label="DOB" value={dobText} />
                <InfoRow label="Address" value={user?.address} />
                <InfoRow label="Country" value={user?.country} />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Products</h2>
            <div className="text-sm text-gray-500">
              {prodLoading ? "Loading..." : `${products.length} total`}
            </div>
          </div>

          {prodLoading ? (
            <div className="text-gray-500">Fetching products...</div>
          ) : products.length === 0 ? (
            <div className="text-gray-500">No products found.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {products.map((p) => (
                <div key={p._id} className="border rounded-md p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <img
                      src={p.productImage || "/images/nutrilens_logo.png"}
                      alt={p.name}
                      className="w-12 h-12 object-cover rounded-md border"
                    />
                    <div className="font-semibold">{p.name}</div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div>Category: {p.category ?? "—"}</div>
                    <div>Price: {p.price ?? "—"}</div>
                    <div>Status: {p.isApproved ? "Approved" : "Pending"}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


