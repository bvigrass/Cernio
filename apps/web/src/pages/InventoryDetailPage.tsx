import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useInventoryStore } from '../store/inventoryStore';
import { InventoryItemType, InventoryStatus } from '../types/inventory';

export default function InventoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentItem: item, isLoading, error, fetchItem, deleteItem, clearCurrentItem } = useInventoryStore();
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    if (id) {
      fetchItem(id);
    }
    return () => clearCurrentItem();
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteItem(id);
      navigate('/inventory');
    } catch (err: any) {
      alert(err.message || 'Failed to delete inventory item');
    }
  };

  const getStatusLabel = (status: InventoryStatus) => {
    return status.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ');
  };

  const getStatusBadgeColor = (status: InventoryStatus) => {
    const colors: Record<InventoryStatus, string> = {
      [InventoryStatus.PURCHASED]: 'bg-blue-100 text-blue-800',
      [InventoryStatus.IN_STOCK]: 'bg-green-100 text-green-800',
      [InventoryStatus.CONSUMED]: 'bg-gray-100 text-gray-800',
      [InventoryStatus.AVAILABLE]: 'bg-green-100 text-green-800',
      [InventoryStatus.ASSIGNED]: 'bg-yellow-100 text-yellow-800',
      [InventoryStatus.IN_USE]: 'bg-blue-100 text-blue-800',
      [InventoryStatus.MAINTENANCE]: 'bg-orange-100 text-orange-800',
      [InventoryStatus.EXTRACTED]: 'bg-purple-100 text-purple-800',
      [InventoryStatus.AVAILABLE_FOR_SALE]: 'bg-green-100 text-green-800',
      [InventoryStatus.LISTED]: 'bg-blue-100 text-blue-800',
      [InventoryStatus.SOLD]: 'bg-red-100 text-red-800',
      [InventoryStatus.SHIPPED]: 'bg-gray-100 text-gray-800',
    };
    return colors[status];
  };

  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined || amount === null) return 'Not set';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: string | undefined) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error || 'Inventory item not found'}</p>
        <Link to="/inventory" className="mt-4 inline-block text-primary-600 hover:text-primary-900">
          Back to Inventory
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/inventory" className="text-gray-400 hover:text-gray-600">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{item.name}</h1>
            <p className="mt-1 text-sm text-gray-600">
              {item.type.charAt(0) + item.type.slice(1).toLowerCase()} Details
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to={`/inventory/${item.id}/edit`}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Edit
          </Link>
          {deleteConfirm ? (
            <>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Confirm Delete
              </button>
              <button
                onClick={() => setDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setDeleteConfirm(true)}
              className="px-4 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {/* General Information */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">General Information</h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500">Name</label>
            <p className="mt-1 text-sm text-gray-900">{item.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Type</label>
            <p className="mt-1 text-sm text-gray-900">
              {item.type.charAt(0) + item.type.slice(1).toLowerCase()}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Status</label>
            <span className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(item.status)}`}>
              {getStatusLabel(item.status)}
            </span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Quantity</label>
            <p className="mt-1 text-sm text-gray-900">
              {item.quantity} {item.unit}
            </p>
          </div>
          {item.description && (
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-500">Description</label>
              <p className="mt-1 text-sm text-gray-900">{item.description}</p>
            </div>
          )}
          {item.project && (
            <div>
              <label className="block text-sm font-medium text-gray-500">Project</label>
              <Link
                to={`/projects/${item.project.id}`}
                className="mt-1 text-sm text-primary-600 hover:text-primary-900"
              >
                {item.project.name}
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Type-Specific Information */}
      {item.type === InventoryItemType.MATERIAL && (
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Material Information</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500">Supplier</label>
              <p className="mt-1 text-sm text-gray-900">{item.supplier || 'Not specified'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Category</label>
              <p className="mt-1 text-sm text-gray-900">{item.materialCategory || 'Not specified'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Purchase Cost</label>
              <p className="mt-1 text-sm text-gray-900">{formatCurrency(item.purchaseCost)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Purchase Date</label>
              <p className="mt-1 text-sm text-gray-900">{formatDate(item.purchaseDate)}</p>
            </div>
          </div>
        </div>
      )}

      {item.type === InventoryItemType.TOOL && (
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Tool Information</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500">Ownership</label>
              <p className="mt-1 text-sm text-gray-900">{item.ownership || 'Not specified'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Serial Number</label>
              <p className="mt-1 text-sm text-gray-900">{item.serialNumber || 'Not specified'}</p>
            </div>
            {item.ownership === 'RENTED' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Rental Rate</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {item.rentalRate ? `${formatCurrency(item.rentalRate)} / ${item.rentalPeriod}` : 'Not set'}
                  </p>
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-500">Last Maintenance</label>
              <p className="mt-1 text-sm text-gray-900">{formatDate(item.maintenanceDate)}</p>
            </div>
          </div>
        </div>
      )}

      {item.type === InventoryItemType.SALVAGE && (
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Salvage Information</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500">Condition</label>
              <p className="mt-1 text-sm text-gray-900">{item.condition || 'Not specified'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Storage Location</label>
              <p className="mt-1 text-sm text-gray-900">{item.storageLocation || 'Not specified'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Estimated Value</label>
              <p className="mt-1 text-sm text-gray-900">{formatCurrency(item.estimatedValue)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Reserve Price</label>
              <p className="mt-1 text-sm text-gray-900">{formatCurrency(item.reservePrice)}</p>
            </div>
            {item.dimensions && (
              <div>
                <label className="block text-sm font-medium text-gray-500">Dimensions</label>
                <p className="mt-1 text-sm text-gray-900">{item.dimensions}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Photos */}
      {item.photos && item.photos.length > 0 && (
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Photos</h2>
          <div className="grid grid-cols-3 gap-4">
            {item.photos.map((photo) => (
              <div key={photo.id} className="relative">
                <img
                  src={photo.photoUrl}
                  alt={item.name}
                  className="w-full h-48 object-cover rounded-lg"
                />
                {photo.isPrimary && (
                  <span className="absolute top-2 left-2 bg-primary-600 text-white text-xs px-2 py-1 rounded">
                    Primary
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metadata */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Metadata</h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500">Created</label>
            <p className="mt-1 text-sm text-gray-900">{formatDate(item.createdAt)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Last Updated</label>
            <p className="mt-1 text-sm text-gray-900">{formatDate(item.updatedAt)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
