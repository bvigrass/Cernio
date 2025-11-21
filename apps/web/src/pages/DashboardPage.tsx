import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function DashboardPage() {
  const { user } = useAuthStore();

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user.firstName}!
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          {user.company.name} • {user.role.replace('_', ' ')}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
              <svg
                className="h-6 w-6 text-primary-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Projects</p>
              <p className="text-2xl font-semibold text-gray-900">0</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Revenue (MTD)</p>
              <p className="text-2xl font-semibold text-gray-900">$0</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
              <svg
                className="h-6 w-6 text-yellow-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending Estimates</p>
              <p className="text-2xl font-semibold text-gray-900">0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Cards */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Navigate</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/clients"
            className="flex flex-col items-center justify-center px-4 py-6 border-2 border-gray-200 rounded-lg shadow-sm text-center bg-white hover:bg-gray-50 hover:border-primary-300 transition-colors"
          >
            <svg
              className="h-8 w-8 text-primary-600 mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span className="text-sm font-medium text-gray-900">Clients</span>
            <span className="text-xs text-gray-500 mt-1">View & manage clients</span>
          </Link>

          <Link
            to="/projects"
            className="flex flex-col items-center justify-center px-4 py-6 border-2 border-gray-200 rounded-lg hover:bg-gray-50 hover:border-primary-300 transition-colors shadow-sm text-center"
          >
            <svg
              className="h-8 w-8 text-primary-600 mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            <span className="text-sm font-medium text-gray-900">Projects</span>
            <span className="text-xs text-gray-500 mt-1">View & manage projects</span>
          </Link>

          <Link
            to="/inventory"
            className="flex flex-col items-center justify-center px-4 py-6 border-2 border-gray-200 rounded-lg hover:bg-gray-50 hover:border-primary-300 transition-colors shadow-sm text-center"
          >
            <svg
              className="h-8 w-8 text-primary-600 mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <span className="text-sm font-medium text-gray-900">Inventory</span>
            <span className="text-xs text-gray-500 mt-1">Manage materials, tools & salvage</span>
          </Link>

          <div className="flex flex-col items-center justify-center px-4 py-6 border-2 border-gray-200 rounded-lg shadow-sm text-center bg-gray-50 cursor-not-allowed opacity-60">
            <svg
              className="h-8 w-8 text-gray-400 mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <span className="text-sm font-medium text-gray-600">Estimates</span>
            <span className="text-xs text-gray-500 mt-1">Coming soon</span>
          </div>

          <div className="flex flex-col items-center justify-center px-4 py-6 border-2 border-gray-200 rounded-lg shadow-sm text-center bg-gray-50 cursor-not-allowed opacity-60">
            <svg
              className="h-8 w-8 text-gray-400 mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span className="text-sm font-medium text-gray-600">Invoices</span>
            <span className="text-xs text-gray-500 mt-1">Coming soon</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/clients/new"
            className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <svg
              className="mr-2 h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            New Client
          </Link>
          <Link
            to="/projects/new"
            className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <svg
              className="mr-2 h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            New Project
          </Link>
          <Link
            to="/inventory/new"
            className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <svg
              className="mr-2 h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            New Inventory Item
          </Link>
          <button
            disabled
            className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-400 bg-gray-50 cursor-not-allowed"
          >
            <svg
              className="mr-2 h-5 w-5 text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            New Invoice
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No activity yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating your first project
          </p>
        </div>
      </div>
    </div>
  );
}
