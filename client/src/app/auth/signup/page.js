"use client";
import { useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ThemeContext } from '@/context/ThemeContext';

export default function SignupPage() {
  const [selectedRole, setSelectedRole] = useState('');
  const router = useRouter();
  const { theme } = useContext(ThemeContext);

  const handleRoleSelect = (role) => {
    router.push(`/auth/signup/${role}`);
  };

  const bg = theme === "dark" ? "bg-gray-950" : "bg-gray-100";
  const cardBg = theme === "dark" ? "bg-gray-900" : "bg-white";
  const textColor = theme === "dark" ? "text-gray-100" : "text-gray-900";
  const subText = theme === "dark" ? "text-gray-400" : "text-gray-500";
  const borderColor = theme === "dark" ? "border-gray-700" : "border-gray-300";
  const hoverBg = theme === "dark" ? "hover:bg-gray-800" : "hover:bg-blue-50";
  const hoverBorder = theme === "dark" ? "hover:border-gray-500" : "hover:border-gray-500";

  return (
    <div className={`min-h-screen flex flex-col justify-center py-12 px-6 lg:px-8 ${bg} transition-colors duration-300`}>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className={`text-center text-3xl font-extrabold mb-8 ${textColor}`}>
          Create your account
        </h2>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className={`${cardBg} py-8 px-6 shadow rounded-lg sm:px-10 transition-colors duration-300`}>
          <h3 className={`text-lg font-medium mb-6 ${textColor}`}>
            Select your account type
          </h3>

          <div className="space-y-4">
            {[
              { role: 'user', title: 'Individual User', description: 'For personal use and nutrition tracking' },
              { role: 'company', title: 'Company', description: 'For food manufacturers and suppliers' },
              { role: 'admin', title: 'Admin', description: 'For system administrators' }
            ].map((type) => (
              <button
                key={type.role}
                onClick={() => handleRoleSelect(type.role)}
                className={`w-full flex items-center justify-between p-4 border rounded-lg transition-colors ${borderColor} ${hoverBorder} ${hoverBg}`}
              >
                <div className="text-left">
                  <h4 className={`text-lg font-medium ${textColor}`}>{type.title}</h4>
                  <p className={`text-sm ${subText}`}>{type.description}</p>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>

          <div className="mt-6">
            <p className={`text-center text-sm ${subText}`}>
              Already have an account?{' '}
              <Link href="/auth/login" className="text-blue-500 hover:text-blue-400">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
