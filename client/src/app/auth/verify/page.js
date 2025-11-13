"use client";
import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import { ThemeContext } from "@/context/ThemeContext";

export default function VerifyPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated, login } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);

  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (!loading && (!isAuthenticated || !user)) {
      router.replace(`/auth/login?message=Please login to verify your account`);
    }
  }, [loading, isAuthenticated, user, router]);

  useEffect(() => {
    let t;
    if (cooldown > 0) {
      t = setTimeout(() => setCooldown((s) => s - 1), 1000);
    }
    return () => clearTimeout(t);
  }, [cooldown]);

  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

  const sendOtp = async () => {
    setError("");
    setMessage("");
    setSending(true);
    try {
      const resp = await fetch(`${apiBase}/otp/request`, {
        method: "POST",
        credentials: "include",
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok || !data?.success) throw new Error(data?.message || "Failed to send OTP");
      setMessage("OTP sent to your registered email. It expires in 3 minutes.");
      setCooldown(60);
      setSent(true);
    } catch (err) {
      setError(err.message || "Failed to send OTP");
    } finally {
      setSending(false);
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!otp.trim()) {
      setError("Please enter OTP");
      return;
    }
    setVerifying(true);
    try {
      const resp = await fetch(`${apiBase}/otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ otp: otp.trim() }),
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok || !data?.success) throw new Error(data?.message || "Verification failed");
      const profileResp = await fetch(`${apiBase}/user/profile`, {
        method: "GET",
        credentials: "include",
      });
      const profileData = await profileResp.json().catch(() => ({}));
      if (profileResp.ok && profileData?.data?.user) {
        login(profileData.data.user);
      }
      setMessage("Account verified successfully.");
      setTimeout(() => router.replace("/profile"), 900);
    } catch (err) {
      setError(err.message || "Verification failed");
    } finally {
      setVerifying(false);
    }
  };

  if (!user) return null;

  const bg = theme === "dark" ? "bg-gray-950" : "bg-gray-50";
  const cardBg = theme === "dark" ? "bg-gray-900" : "bg-white";
  const textColor = theme === "dark" ? "text-gray-100" : "text-gray-900";
  const subText = theme === "dark" ? "text-gray-400" : "text-gray-600";
  const inputBg = theme === "dark" ? "bg-gray-800 border-gray-700 text-gray-200" : "bg-white border-gray-300 text-gray-900";

  // already verified
  if (user.accountStatus === "verified" || user.accountStatus === "approved") {
    return (
      <div className={`min-h-screen flex items-center justify-center ${bg} py-12 px-4 transition-colors duration-300`}>
        <div className={`w-full max-w-md ${cardBg} p-6 rounded-lg shadow transition-colors duration-300`}>
          <h2 className={`text-lg font-semibold mb-2 ${textColor}`}>Account verified</h2>
          <p className={`text-sm mb-4 ${subText}`}>Your account is already verified.</p>
          <div className="flex justify-end">
            <button
              onClick={() => router.push("/profile")}
              className="px-4 py-2 bg-black text-white rounded hover:bg-gray-600 transition-colors"
            >
              Go to profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex items-center justify-center ${bg} py-12 px-4 transition-colors duration-300`}>
      <div className={`w-full max-w-md ${cardBg} p-6 rounded-lg shadow transition-colors duration-300`}>
        <h2 className={`text-xl font-semibold mb-2 ${textColor}`}>Verify your account</h2>
        <p className={`text-sm mb-4 ${subText}`}>
          We will send a one-time password (OTP) to your registered email to verify your account.
        </p>

        {message && <div className="mb-3 text-sm text-green-500">{message}</div>}
        {error && <div className="mb-3 text-sm text-red-500">{error}</div>}

        {!sent && (
          <div className="flex gap-3 mb-4">
            <button
              onClick={sendOtp}
              disabled={sending || cooldown > 0}
              className={`flex-1 px-4 py-2 rounded text-sm text-white ${
                sending || cooldown > 0
                  ? "opacity-60 cursor-not-allowed bg-gray-600"
                  : "bg-black hover:bg-gray-600"
              }`}
            >
              {sending ? "Sending..." : cooldown > 0 ? `Resend in ${cooldown}s` : "Send OTP"}
            </button>
          </div>
        )}

        {sent && (
          <form onSubmit={verifyOtp} className="space-y-4">
            <label className={`block text-sm ${textColor}`}>Enter OTP</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
              className={`w-full px-3 py-2 border rounded-md text-sm ${inputBg}`}
              placeholder="6-digit code"
              disabled={!sent}
            />

            <div className="flex items-center justify-between">
              <button
                type="submit"
                disabled={verifying || !sent}
                className={`px-4 py-2 rounded text-sm text-white ${
                  verifying ? "bg-blue-500 opacity-60 cursor-not-allowed" : "bg-black hover:bg-gray-600"
                }`}
              >
                {verifying ? "Verifying..." : "Verify OTP"}
              </button>

              <button
                type="button"
                onClick={sendOtp}
                disabled={cooldown > 0 || sending}
                className={`text-sm ${
                  cooldown > 0 || sending
                    ? "text-gray-500 cursor-not-allowed"
                    : "text-blue-500 hover:underline"
                }`}
              >
                {cooldown > 0 ? `Resend (${cooldown}s)` : "Resend OTP"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
