import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { marketplaceService } from '../services/marketplaceService';
import { InventoryItem } from '../types/inventory';

export default function MarketplacePage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCondition, setSelectedCondition] = useState<string>('all');

  useEffect(() => {
    loadSalvageItems();
  }, []);

  const loadSalvageItems = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Fetch salvage items from public marketplace API (no auth required)
      const items = await marketplaceService.getSalvageItems();
      setItems(items);
    } catch (err: any) {
      setError('Failed to load marketplace items');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCondition = selectedCondition === 'all' || item.condition === selectedCondition;
    return matchesSearch && matchesCondition;
  });

  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined || amount === null) return 'Contact for price';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getConditionBadgeColor = (condition: string | undefined) => {
    if (!condition) return 'bg-gray-100 text-gray-800';
    const colors: Record<string, string> = {
      'Excellent': 'bg-green-100 text-green-800',
      'Good': 'bg-blue-100 text-blue-800',
      'Fair': 'bg-yellow-100 text-yellow-800',
      'As-Is': 'bg-orange-100 text-orange-800',
    };
    return colors[condition] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      'ESTIMATED': 'bg-purple-100 text-purple-800 border-purple-300',
      'EXTRACTED': 'bg-blue-100 text-blue-800 border-blue-300',
      'AVAILABLE_FOR_SALE': 'bg-green-100 text-green-800 border-green-300',
      'LISTED': 'bg-cyan-100 text-cyan-800 border-cyan-300',
      'SOLD': 'bg-gray-100 text-gray-800 border-gray-300',
      'SHIPPED': 'bg-gray-100 text-gray-600 border-gray-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'ESTIMATED': 'Estimated (Pre-extraction)',
      'EXTRACTED': 'Extracted',
      'AVAILABLE_FOR_SALE': 'Available for Sale',
      'LISTED': 'Listed',
      'SOLD': 'Sold',
      'SHIPPED': 'Shipped',
    };
    return labels[status] || status;
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
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-2 text-sm text-gray-600">Loading marketplace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg shadow-lg p-8 text-white">
        <h1 className="text-3xl font-bold">Salvage Marketplace</h1>
        <p className="mt-2 text-lg text-primary-100">
          Quality salvaged materials from professional demolition projects
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search items..."
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="all">All Conditions</option>
              <option value="Excellent">Excellent</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="As-Is">As-Is</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white shadow-sm rounded-lg p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No items found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || selectedCondition !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Check back soon for new salvage items'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <Link
              key={item.id}
              to={`/marketplace/${item.id}`}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-200 hover:border-primary-300"
            >
              {/* Item Image */}
              <div className="aspect-w-16 aspect-h-12 bg-gray-200 relative">
                {item.photos && item.photos.length > 0 ? (
                  <img
                    src={item.photos.find(p => p.isPrimary)?.photoUrl || item.photos[0].photoUrl}
                    alt={item.name}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 flex items-center justify-center bg-gray-100">
                    <svg className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                {/* Status Badge */}
                <span className={`absolute top-2 left-2 inline-flex px-2 py-1 text-xs font-semibold rounded border ${getStatusBadgeColor(item.status)}`}>
                  {getStatusLabel(item.status)}
                </span>
                {/* Condition Badge */}
                {item.condition && (
                  <span className={`absolute top-2 right-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getConditionBadgeColor(item.condition)}`}>
                    {item.condition}
                  </span>
                )}
              </div>

              {/* Item Details */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.name}</h3>
                {item.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-primary-600">
                      {formatCurrency(item.estimatedValue)}
                    </p>
                    {item.dimensions && (
                      <p className="text-xs text-gray-500 mt-1">{item.dimensions}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Quantity</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {item.quantity} {item.unit}
                    </p>
                  </div>
                </div>

                {item.storageLocation && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center text-sm text-gray-500">
                      <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {item.storageLocation}
                    </div>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
