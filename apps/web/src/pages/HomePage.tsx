import { useEffect, useState } from 'react';
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
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome to Cernio
        </h2>
        <p className="text-lg text-gray-600 mb-6">
          The complete demolition contractor platform with integrated salvage
          marketplace.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-primary-50 rounded-lg">
            <h3 className="font-semibold text-primary-900 mb-2">
              Project Management
            </h3>
            <p className="text-sm text-primary-700">
              Track projects, estimates, and financial performance
            </p>
          </div>
          <div className="p-4 bg-primary-50 rounded-lg">
            <h3 className="font-semibold text-primary-900 mb-2">
              Field Operations
            </h3>
            <p className="text-sm text-primary-700">
              Mobile time tracking and expense logging
            </p>
          </div>
          <div className="p-4 bg-primary-50 rounded-lg">
            <h3 className="font-semibold text-primary-900 mb-2">
              Salvage Marketplace
            </h3>
            <p className="text-sm text-primary-700">
              Sell salvaged materials through online auctions
            </p>
          </div>
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
