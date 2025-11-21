import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { marketplaceService } from '../services/marketplaceService';
import { InventoryItem } from '../types/inventory';

export default function MarketplaceItemPage() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<number>(0);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (id) {
      loadItem(id);
    }
  }, [id]);

  const loadItem = async (itemId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      // Fetch item from public marketplace API (no auth required)
      const data = await marketplaceService.getSalvageItem(itemId);
      setItem(data);
    } catch (err: any) {
      setError('Failed to load item details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would submit to an API endpoint
    console.log('Contact form submitted:', contactForm);
    setSubmitSuccess(true);
    setShowContactForm(false);
    // Reset form
    setTimeout(() => {
      setSubmitSuccess(false);
      setContactForm({ name: '', email: '', phone: '', message: '' });
    }, 5000);
  };

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
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error || 'Item not found'}</p>
        <Link to="/marketplace" className="mt-4 inline-block text-primary-600 hover:text-primary-900">
          Back to Marketplace
        </Link>
      </div>
    );
  }

  const photos = item.photos || [];
  const currentPhoto = photos[selectedPhoto];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <Link to="/marketplace" className="hover:text-primary-600">Marketplace</Link>
        <span>/</span>
        <span className="text-gray-900">{item.name}</span>
      </div>

      {/* Success Message */}
      {submitSuccess && (
        <div className="rounded-md bg-green-50 border border-green-200 p-4">
          <div className="flex">
            <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="ml-3 text-sm text-green-700">
              Thank you for your inquiry! We'll get back to you soon.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
          {/* Left Column - Images */}
          <div>
            {/* Main Image */}
            <div className="aspect-w-1 aspect-h-1 bg-gray-200 rounded-lg overflow-hidden mb-4">
              {currentPhoto ? (
                <img
                  src={currentPhoto.photoUrl}
                  alt={item.name}
                  className="w-full h-96 object-cover"
                />
              ) : (
                <div className="w-full h-96 flex items-center justify-center bg-gray-100">
                  <svg className="h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {photos.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {photos.map((photo, index) => (
                  <button
                    key={photo.id}
                    onClick={() => setSelectedPhoto(index)}
                    className={`aspect-w-1 aspect-h-1 rounded-lg overflow-hidden ${
                      selectedPhoto === index ? 'ring-2 ring-primary-600' : 'ring-1 ring-gray-200'
                    }`}
                  >
                    <img
                      src={photo.photoUrl}
                      alt={`${item.name} ${index + 1}`}
                      className="w-full h-20 object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{item.name}</h1>
              <div className="mt-2 flex flex-wrap gap-2">
                {/* Status Badge */}
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded border ${getStatusBadgeColor(item.status)}`}>
                  {getStatusLabel(item.status)}
                </span>
                {/* Condition Badge */}
                {item.condition && (
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getConditionBadgeColor(item.condition)}`}>
                    {item.condition} Condition
                  </span>
                )}
              </div>
            </div>

            {/* ESTIMATED Status Notice */}
            {item.status === 'ESTIMATED' && (
              <div className="rounded-md bg-purple-50 border border-purple-200 p-4">
                <div className="flex">
                  <svg className="h-5 w-5 text-purple-400 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className="text-sm font-medium text-purple-800">Pre-extraction Estimate</h3>
                    <p className="mt-1 text-sm text-purple-700">
                      This item has not yet been extracted. Actual quantity and condition may vary once extraction is complete. Contact seller to discuss details and place a pre-order.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="border-t border-b border-gray-200 py-6">
              <div className="flex items-baseline justify-between">
                <div>
                  <p className="text-sm text-gray-500">Price</p>
                  <p className="text-4xl font-bold text-primary-600">
                    {formatCurrency(item.estimatedValue)}
                  </p>
                  {item.reservePrice && item.reservePrice !== item.estimatedValue && (
                    <p className="text-sm text-gray-500 mt-1">
                      Reserve: {formatCurrency(item.reservePrice)}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Available</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {item.quantity} {item.unit}
                  </p>
                </div>
              </div>
            </div>

            {item.description && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
                <p className="text-gray-600">{item.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {item.dimensions && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Dimensions</p>
                  <p className="text-gray-900">{item.dimensions}</p>
                </div>
              )}
              {item.storageLocation && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Location</p>
                  <p className="text-gray-900">{item.storageLocation}</p>
                </div>
              )}
            </div>

            {/* Call to Action */}
            <div className="space-y-3 pt-6">
              <button
                onClick={() => setShowContactForm(true)}
                className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Contact Seller
              </button>
              <Link
                to="/marketplace"
                className="w-full inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Back to Marketplace
              </Link>
            </div>

            {/* Trust Signals */}
            <div className="pt-6 border-t border-gray-200">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <svg className="mx-auto h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <p className="mt-1 text-xs text-gray-600">Verified Source</p>
                </div>
                <div>
                  <svg className="mx-auto h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="mt-1 text-xs text-gray-600">Quick Response</p>
                </div>
                <div>
                  <svg className="mx-auto h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                  <p className="mt-1 text-xs text-gray-600">Pickup Available</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Form Modal */}
      {showContactForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Contact Seller</h3>
              <button
                onClick={() => setShowContactForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name *</label>
                <input
                  type="text"
                  required
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email *</label>
                <input
                  type="email"
                  required
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Message *</label>
                <textarea
                  required
                  rows={4}
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  placeholder={`I'm interested in ${item.name}...`}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowContactForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                >
                  Send Inquiry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
