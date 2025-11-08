import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { clientService } from '../services/clientService';
import { Client, ClientType } from '../types/client';

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    if (id) {
      loadClient(id);
    }
  }, [id]);

  const loadClient = async (clientId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await clientService.getClient(clientId);
      setClient(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load client');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await clientService.deleteClient(id);
      navigate('/clients');
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
          <p className="mt-2 text-sm text-gray-600">Loading client...</p>
        </div>
      </div>
    );
  }

  if (error || !client) {
    return (
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
            <p className="text-sm text-red-700">{error || 'Client not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/clients"
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
            <p className="mt-1 text-sm text-gray-600">Client Details</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to={`/clients/${client.id}/edit`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Edit
          </Link>
          {deleteConfirm ? (
            <>
              <button
                onClick={handleDelete}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Confirm Delete
              </button>
              <button
                onClick={() => setDeleteConfirm(false)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setDeleteConfirm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Client Information */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Client Information</h2>
        </div>
        <div className="px-6 py-5">
          <div className="flex items-start space-x-6">
            {client.imageUrl && (
              <img
                src={client.imageUrl}
                alt={client.name}
                className="h-24 w-24 rounded-lg object-cover"
              />
            )}
            <div className="flex-1 grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500">Client Name</label>
                <p className="mt-1 text-sm text-gray-900">{client.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Type</label>
                <span
                  className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getClientTypeBadgeColor(
                    client.type
                  )}`}
                >
                  {getClientTypeLabel(client.type)}
                </span>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-500">Address</label>
                <p className="mt-1 text-sm text-gray-900">{client.street1}</p>
                {client.street2 && <p className="text-sm text-gray-900">{client.street2}</p>}
                <p className="text-sm text-gray-900">
                  {client.city}, {client.state} {client.postalCode}
                </p>
                {client.country !== 'United States' && (
                  <p className="text-sm text-gray-900">{client.country}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contacts */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Contacts</h2>
        </div>
        {client.contacts.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-gray-500">No contacts added yet</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {client.contacts.map((contact) => (
              <li key={contact.id} className="px-6 py-4">
                <div className="flex items-center space-x-4">
                  {contact.imageUrl ? (
                    <img
                      src={contact.imageUrl}
                      alt={contact.name}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500 font-medium text-lg">
                        {contact.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900">{contact.name}</p>
                      {contact.isPrimary && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800">
                          Primary
                        </span>
                      )}
                    </div>
                    {contact.role && (
                      <p className="text-sm text-gray-500">{contact.role}</p>
                    )}
                    <div className="mt-1 flex items-center space-x-4">
                      {contact.email && (
                        <a
                          href={`mailto:${contact.email}`}
                          className="text-sm text-primary-600 hover:text-primary-800"
                        >
                          {contact.email}
                        </a>
                      )}
                      {contact.phone && (
                        <a
                          href={`tel:${contact.phone}`}
                          className="text-sm text-gray-500 hover:text-gray-700"
                        >
                          {contact.phone}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
