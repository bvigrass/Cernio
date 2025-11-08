import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { clientService } from '../services/clientService';
import { Client, ClientType } from '../types/client';

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await clientService.getClients();
      setClients(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load clients');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await clientService.deleteClient(id);
      setClients(clients.filter((c) => c.id !== id));
      setDeleteConfirm(null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete client');
    }
  };

  const getClientTypeLabel = (type: ClientType) => {
    const labels: Record<ClientType, string> = {
      [ClientType.RESIDENTIAL]: 'Residential',
      [ClientType.COMMERCIAL]: 'Commercial',
      [ClientType.INDUSTRIAL]: 'Industrial',
      [ClientType.MUNICIPAL]: 'Municipal',
    };
    return labels[type];
  };

  const getClientTypeBadgeColor = (type: ClientType) => {
    const colors: Record<ClientType, string> = {
      [ClientType.RESIDENTIAL]: 'bg-blue-100 text-blue-800',
      [ClientType.COMMERCIAL]: 'bg-green-100 text-green-800',
      [ClientType.INDUSTRIAL]: 'bg-purple-100 text-purple-800',
      [ClientType.MUNICIPAL]: 'bg-yellow-100 text-yellow-800',
    };
    return colors[type];
  };

  const formatAddress = (client: Client) => {
    const parts = [client.street1];
    if (client.street2) parts.push(client.street2);
    parts.push(`${client.city}, ${client.state} ${client.postalCode}`);
    if (client.country !== 'United States') parts.push(client.country);
    return parts.join(', ');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <svg
            className="animate-spin h-8 w-8 text-primary-600 mx-auto"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="mt-2 text-sm text-gray-600">Loading clients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your client database and contacts
          </p>
        </div>
        <Link
          to="/clients/new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
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
          New Client
        </Link>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-4">
          <div className="flex">
            <svg
              className="h-5 w-5 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Clients Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        {clients.length === 0 ? (
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
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No clients</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first client
            </p>
            <div className="mt-6">
              <Link
                to="/clients/new"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
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
                New Client
              </Link>
            </div>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contacts
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {client.imageUrl ? (
                        <img
                          src={client.imageUrl}
                          alt={client.name}
                          className="h-10 w-10 rounded-lg object-cover mr-3"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center mr-3">
                          <span className="text-gray-500 font-medium">
                            {client.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="text-sm font-medium text-gray-900">
                        {client.name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getClientTypeBadgeColor(
                        client.type
                      )}`}
                    >
                      {getClientTypeLabel(client.type)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {formatAddress(client)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {client.contacts.length} contact
                    {client.contacts.length !== 1 ? 's' : ''}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                    <Link
                      to={`/clients/${client.id}`}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      View
                    </Link>
                    <Link
                      to={`/clients/${client.id}/edit`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Edit
                    </Link>
                    {deleteConfirm === client.id ? (
                      <>
                        <button
                          onClick={() => handleDelete(client.id)}
                          className="text-red-600 hover:text-red-900 font-semibold"
                        >
                          Confirm?
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(client.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
