import { useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/Marketplace.module.css';

export default function SellPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('view');
  const [listings, setListings] = useState([]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleCreateListing = () => {
    setActiveTab('create');
  };

  const handleBackToHome = () => {
    router.push('/');
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div>
        <h1 className={styles.Marketplace_title}>Sell Your Crops</h1>
        
        {/* Tab Buttons */}
        <div className="flex space-x-4 mb-6">
          <button
            className={`px-4 py-2 rounded-md ${
              activeTab === 'view' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
            onClick={() => handleTabChange('view')}
          >
            View Listings
          </button>
          
          <button
            className={`px-4 py-2 rounded-md ${
              activeTab === 'create' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
            onClick={() => handleTabChange('create')}
          >
            Create Listing
          </button>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-lg shadow p-6">
          {activeTab === 'view' ? (
            listings.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">No listings available. Create your first listing!</p>
                <button
                  onClick={handleCreateListing}
                  className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
                >
                  Create Listing
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((listing) => (
                  <div key={listing.id} className="border rounded-lg p-4">
                    <h3 className="text-lg font-semibold">{listing.productName}</h3>
                    <p className="text-gray-600">{listing.description}</p>
                    <p className="text-primary-600 font-semibold mt-2">
                      {listing.price} per {listing.unit}
                    </p>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="max-w-md mx-auto">
              <h2 className="text-xl font-semibold mb-4">Create New Listing</h2>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Product Name</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Quantity</label>
                  <input
                    type="number"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Price per Unit</label>
                  <input
                    type="number"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
                >
                  Create Listing
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Back to Home Button */}
        <div className="mt-6 text-center">
          <button
            onClick={handleBackToHome}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
          >
            Back to Home
          </button>
        </div>
      </div>
    </main>
  );
}