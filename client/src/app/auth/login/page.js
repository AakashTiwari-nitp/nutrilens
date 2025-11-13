"use client";
import { useState, Suspense, useContext } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AuthContext } from '@/context/AuthContext';
import { ThemeContext } from '@/context/ThemeContext';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get('message');
  const { login } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const identifier = formData.email.trim();
      if (!identifier || !formData.password) {
        setError('Please enter both email/username and password');
        setLoading(false);
        return;
      }

      const isEmail = identifier.includes('@');
      const requestBody = { password: formData.password };
      if (isEmail) requestBody.email = identifier.toLowerCase();
      else requestBody.username = identifier.toLowerCase();

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const response = await fetch(`${apiUrl}/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        credentials: 'include',
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.success && data.data?.user) {
        login(data.data.user);
        switch (data.data.user.role) {
          case 'admin': router.push('/profile/admin/'); break;
          case 'company': router.push('/profile/company/'); break;
          default: router.push('/');
        }
      } else {
        let errorMessage = data.message || data.error?.message || `Login failed (${response.status})`;
        if (Array.isArray(data.errors) && data.errors.length > 0) {
          errorMessage = data.errors.join(', ');
        }
        setError(errorMessage);
      }
    } catch (err) {
      setError(err.message || 'Network error. Please check if the server is running.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Theme-based styles
  const bg = theme === "dark" ? "bg-gray-950" : "bg-gray-100";
  const cardBg = theme === "dark" ? "bg-gray-900" : "bg-white";
  const textColor = theme === "dark" ? "text-gray-100" : "text-gray-900";
  const subText = theme === "dark" ? "text-gray-400" : "text-gray-500";
  const inputBg = theme === "dark" ? "bg-gray-800 border-gray-700 text-gray-200" : "bg-white border-gray-300 text-gray-900";
  const dividerColor = theme === "dark" ? "border-gray-700" : "border-gray-300";

  return (
    <div className={`min-h-screen flex flex-col justify-center py-12 px-6 lg:px-8 ${bg} transition-colors duration-300`}>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className={`text-center text-3xl font-extrabold mb-8 ${textColor}`}>
          Sign in to your account
        </h2>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {message && (
          <div className="mb-4 p-4 bg-green-500/10 text-green-400 rounded-md border border-green-700/30">
            {message}
          </div>
        )}

        <div className={`${cardBg} py-8 px-6 shadow rounded-lg sm:px-10 transition-colors duration-300`}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className={`block text-sm font-medium mb-1 ${subText}`}>
                Email or Username
              </label>
              <input
                type="text"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`mt-1 block w-full rounded-md border shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${inputBg}`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${subText}`}>
                Password
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={`mt-1 block w-full rounded-md border shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${inputBg}`}
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className={`w-full border-t ${dividerColor}`} />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className={`${subText} px-2 ${cardBg}`}>Or</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link
                href="/auth/signup"
                className="text-blue-500 hover:text-blue-400 transition-colors"
              >
                Create new account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-gray-400">
        Loading...
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
