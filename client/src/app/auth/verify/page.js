"use client";
import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";

export default function VerifyPage() {
    const router = useRouter();
    const { user, loading, isAuthenticated, login } = useContext(AuthContext);

    const [sending, setSending] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [otp, setOtp] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [sent, setSent] = useState(false);
    const [cooldown, setCooldown] = useState(0); // seconds remaining to resend

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
        if (!otp || otp.trim().length === 0) { setError("Please enter OTP"); return; }
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
            // refresh user profile
            const profileResp = await fetch(`${apiBase}/user/profile`, {
                method: "GET",
                credentials: "include",
            });
            const profileData = await profileResp.json().catch(() => ({}));
            if (profileResp.ok && profileData?.data?.user) {
                login(profileData.data.user);
            }
            setMessage("Account verified successfully.");
            // redirect to profile after a short delay
            setTimeout(() => router.replace("/profile"), 900);
        } catch (err) {
            setError(err.message || "Verification failed");
        } finally {
            setVerifying(false);
        }
    };

    if (!user) return null;

    // If already verified, show friendly message
    if (user.accountStatus === "verified" || user.accountStatus === "approved") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
                <div className="w-full max-w-md bg-white p-6 rounded-lg shadow">
                    <h2 className="text-lg font-semibold mb-2">Account verified</h2>
                    <p className="text-sm text-gray-600 mb-4">Your account is already verified.</p>
                    <div className="flex justify-end">
                        <button onClick={() => router.push('/profile')} className="px-4 py-2 bg-black text-white rounded">Go to profile</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen text-gray-900 flex items-center justify-center bg-gray-50 py-12 px-4">
            <div className="w-full max-w-md bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-2">Verify your account</h2>
                <p className="text-sm text-gray-600 mb-4">We will send a one-time password (OTP) to your registered email to verify your account.</p>

                {message && <div className="mb-3 text-sm text-green-700">{message}</div>}
                {error && <div className="mb-3 text-sm text-red-600">{error}</div>}

                                {/* Show primary Send button only before first send */}
                                {!sent && (
                                    <div className="flex gap-3 mb-4">
                                        <button
                                                onClick={sendOtp}
                                                disabled={sending || cooldown > 0}
                                                className={`flex-1 px-4 py-2 rounded bg-black text-white text-sm ${sending || cooldown>0 ? 'opacity-60 cursor-not-allowed' : 'hover:bg-gray-900'}`}
                                        >
                                                {sending ? 'Sending...' : (cooldown > 0 ? `Resend in ${cooldown}s` : 'Send OTP')}
                                        </button>
                                    </div>
                                )}

                                {/* Show OTP input + Verify only after Send OTP was clicked */}
                                {sent && (
                                    <form onSubmit={verifyOtp} className="space-y-4">
                    <label className="block text-sm text-gray-700">Enter OTP</label>
                    <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                        className="w-full px-3 py-2 border rounded-md text-sm"
                        placeholder="6-digit code"
                        disabled={!sent}
                    />

                    <div className="flex items-center justify-between">
                        <button
                            type="submit"
                            disabled={verifying || !sent}
                            className={`px-4 py-2 rounded bg-blue-600 text-white text-sm ${verifying ? 'opacity-60 cursor-not-allowed' : 'hover:bg-blue-700'}`}
                        >
                            {verifying ? 'Verifying...' : 'Verify OTP'}
                        </button>

                                <button
                                    type="button"
                                    onClick={() => sendOtp()}
                                    disabled={cooldown > 0 || sending}
                                    className={`text-sm ${cooldown > 0 || sending ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:underline'}`}
                                >
                                    {cooldown > 0 ? `Resend (${cooldown}s)` : 'Resend OTP'}
                                </button>
                    </div>
                </form>
                )}
            </div>
        </div>
    );
}