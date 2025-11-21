import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

interface HealthStatus {
  status: string;
  timestamp: string;
  service: string;
  version: string;
  environment: string;
}

export default function HomePage() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await axios.get<HealthStatus>('/api/v1/health');
        setHealth(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to connect to backend API');
        console.error('Health check failed:', err);
      } finally {
        setLoading(false);
      }
    };

    checkHealth();
  }, []);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg shadow-lg p-12 text-white">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Welcome to Cernio
          </h1>
          <p className="text-xl text-primary-100 mb-8">
            The complete demolition contractor platform with integrated salvage marketplace.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/marketplace"
              className="inline-flex items-center px-6 py-3 bg-white text-primary-600 rounded-md font-semibold hover:bg-primary-50 transition-colors"
            >
              <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Browse Marketplace
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center px-6 py-3 bg-primary-700 text-white rounded-md font-semibold hover:bg-primary-600 transition-colors border border-primary-500"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg mb-4">
            <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Project Management
          </h3>
          <p className="text-gray-600">
            Track projects, manage clients, and monitor financial performance all in one place.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Inventory Management
          </h3>
          <p className="text-gray-600">
            Track materials, tools, and salvage items across all your projects.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4">
            <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Salvage Marketplace
          </h3>
          <p className="text-gray-600">
            List and sell quality salvaged materials from your demolition projects.
          </p>
          <Link
            to="/marketplace"
            className="inline-flex items-center mt-4 text-purple-600 hover:text-purple-700 font-medium"
          >
            Explore marketplace
            <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      {/* API Status Section */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Backend API Status
        </h3>

        {loading && (
          <div className="text-gray-600">Checking backend connection...</div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 font-medium">❌ {error}</p>
            <p className="text-sm text-red-600 mt-2">
              Make sure the backend server is running on http://localhost:3000
            </p>
          </div>
        )}

        {health && !error && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 font-medium mb-3">
              ✅ Backend is running successfully!
            </p>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="font-medium text-gray-700">Status:</dt>
                <dd className="text-gray-900">{health.status}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-700">Service:</dt>
                <dd className="text-gray-900">{health.service}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-700">Version:</dt>
                <dd className="text-gray-900">{health.version}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-700">Environment:</dt>
                <dd className="text-gray-900">{health.environment}</dd>
              </div>
              <div className="col-span-2">
                <dt className="font-medium text-gray-700">Last Check:</dt>
                <dd className="text-gray-900">
                  {new Date(health.timestamp).toLocaleString()}
                </dd>
              </div>
            </dl>
          </div>
        )}
      </div>

      {/* Phase 0 Completion */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          🚀 Phase 0: Project Setup - Complete!
        </h3>
        <div className="space-y-2 text-gray-700">
          <p className="flex items-center">
            <span className="mr-2">✅</span> Monorepo structure created
          </p>
          <p className="flex items-center">
            <span className="mr-2">✅</span> NestJS backend initialized
          </p>
          <p className="flex items-center">
            <span className="mr-2">✅</span> React + Vite frontend initialized
          </p>
          <p className="flex items-center">
            <span className="mr-2">✅</span> Tailwind CSS configured
          </p>
          <p className="flex items-center">
            <span className="mr-2">✅</span> TypeScript configured
          </p>
          <p className="flex items-center">
            <span className="mr-2">✅</span> Health check endpoint working
          </p>
        </div>
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Next Steps:</strong> Phase 1 - Authentication & User
            Management
          </p>
        </div>
      </div>
    </div>
  );
}
