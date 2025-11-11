"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const [selectedRole, setSelectedRole] = useState('');
  const router = useRouter();

  const handleRoleSelect = (role) => {
    router.push(`/auth/signup/${role}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-8">
          Create your account
        </h2>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10">
          <h3 className="text-lg font-medium text-gray-900 mb-6">
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
                className="w-full flex items-center justify-between p-4 border rounded-lg hover:border-gray-500 hover:bg-blue-50 transition-colors"
              >
                <div>
                  <h4 className=" flex justify-items-start text-lg font-medium text-gray-900">{type.title}</h4>
                  <p className=" flex justify-center text-sm text-gray-500">{type.description}</p>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>

          <div className="mt-6">
            <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-black hover:text-gray-500">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
