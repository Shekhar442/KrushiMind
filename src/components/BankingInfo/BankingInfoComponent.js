import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from '../../styles/BankingInfo.module.css';
import { 
  BanknotesIcon, 
  DocumentTextIcon, 
  ArrowLeftIcon,
  PlusIcon,
  MinusIcon
} from '@heroicons/react/24/outline';

// Fallback data in case API fails
const fallbackData = {
  schemes: [
    {
      id: '1',
      title: 'PM-KISAN',
      description: 'Income support of ₹6,000 per year to all farmer families in three equal installments.',
      eligibility: 'All small and marginal farmers with cultivable land.',
      benefits: '₹6,000 per year in three equal installments of ₹2,000 each.',
      documents: ['Aadhaar card', 'Land records', 'Bank account details']
    },
    {
      id: '2',
      title: 'Soil Health Card Scheme',
      description: 'Free soil testing to provide crop-wise nutrient recommendations.',
      eligibility: 'All farmers with agricultural land.',
      benefits: 'Free soil testing and personalized recommendations for crop cultivation.',
      documents: ['Land ownership documents', 'Aadhaar card']
    }
  ],
  loans: [
    {
      id: '1',
      title: 'Kisan Credit Card (KCC)',
      description: 'Credit for agricultural needs with flexible repayment options.',
      interestRate: '7-9% (with 3% interest subvention for timely repayment)',
      eligibility: 'All farmers, tenant farmers, sharecroppers, and SHGs.',
      documents: ['Identity and address proof', 'Land records', 'Passport-sized photos']
    }
  ]
};

const BankingInfoComponent = ({ financialInfo, loading }) => {
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState('schemes');
  const [expandedSchemes, setExpandedSchemes] = useState({});
  const [schemes, setSchemes] = useState(fallbackData.schemes);
  const [loans, setLoans] = useState(fallbackData.loans);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFinancialInfo = async () => {
      try {
        const response = await fetch('/api/gemini/financial-info');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.schemes && Array.isArray(data.schemes)) {
          setSchemes(data.schemes);
        } else {
          console.warn('Invalid schemes data received, using fallback');
        }
        
        if (data.loans && Array.isArray(data.loans)) {
          setLoans(data.loans);
        } else {
          console.warn('Invalid loans data received, using fallback');
        }
      } catch (error) {
        console.error('Error fetching financial information:', error);
        setError(error.message);
        // Use fallback data in case of error
        setSchemes(fallbackData.schemes);
        setLoans(fallbackData.loans);
      }
    };

    fetchFinancialInfo();
  }, []);

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Toggle expanded state
  const toggleScheme = (schemeId) => {
    setExpandedSchemes(prev => ({
      ...prev,
      [schemeId]: !prev[schemeId]
    }));
  };

  // Handle back to home
  const handleBackToHome = () => {
    router.push('/');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Banking & Schemes</h1>
          <p className="mt-1 text-sm text-gray-600">Access government schemes and agricultural loans</p>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('schemes')}
            className={`inline-flex items-center px-4 py-2 rounded-lg border-2 font-medium text-sm transition-colors duration-200 ${
              activeTab === 'schemes'
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-gray-200 text-gray-700 hover:border-primary-300'
            }`}
          >
            <DocumentTextIcon className="h-5 w-5 mr-2" />
            Government Schemes
          </button>
          <button
            onClick={() => setActiveTab('loans')}
            className={`inline-flex items-center px-4 py-2 rounded-lg border-2 font-medium text-sm transition-colors duration-200 ${
              activeTab === 'loans'
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-gray-200 text-gray-700 hover:border-primary-300'
            }`}
          >
            <BanknotesIcon className="h-5 w-5 mr-2" />
            Agricultural Loans
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">
            Error loading data: {error}. Showing fallback information.
          </p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 space-y-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
          ) : (
            <>
              {activeTab === 'schemes' && (
                <div className="space-y-6">
                  {schemes.length > 0 ? (
                    schemes.map((scheme) => (
                      <div key={scheme.id} className="border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => toggleScheme(scheme.id)}
                          className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                        >
                          <h3 className="text-lg font-semibold text-gray-900">{scheme.title}</h3>
                          <div className="flex items-center space-x-2">
                            {expandedSchemes[scheme.id] ? (
                              <MinusIcon className="h-5 w-5 text-gray-500" />
                            ) : (
                              <PlusIcon className="h-5 w-5 text-gray-500" />
                            )}
                          </div>
                        </button>
                        
                        {expandedSchemes[scheme.id] && (
                          <div className="p-4 space-y-4">
                            <p className="text-gray-600">{scheme.description}</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-medium text-gray-900 mb-2">Eligibility</h4>
                                <p className="text-gray-600">{scheme.eligibility}</p>
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900 mb-2">Benefits</h4>
                                <p className="text-gray-600">{scheme.benefits}</p>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">Required Documents</h4>
                              <ul className="list-disc list-inside text-gray-600">
                                {scheme.documents.map((doc, index) => (
                                  <li key={index}>{doc}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No schemes available at the moment.
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'loans' && (
                <div className="space-y-6">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800 text-sm">
                      This information is periodically updated. For the most current details, please visit your local agricultural office or bank branch.
                    </p>
                  </div>
                  {loans.length > 0 ? (
                    loans.map((loan) => (
                      <div key={loan.id} className="border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => toggleScheme(loan.id)}
                          className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                        >
                          <h3 className="text-lg font-semibold text-gray-900">{loan.title}</h3>
                          <div className="flex items-center space-x-2">
                            {expandedSchemes[loan.id] ? (
                              <MinusIcon className="h-5 w-5 text-gray-500" />
                            ) : (
                              <PlusIcon className="h-5 w-5 text-gray-500" />
                            )}
                          </div>
                        </button>
                        
                        {expandedSchemes[loan.id] && (
                          <div className="p-4 space-y-4">
                            <p className="text-gray-600">{loan.description}</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-medium text-gray-900 mb-2">Interest Rate</h4>
                                <p className="text-gray-600">{loan.interestRate}</p>
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900 mb-2">Eligibility</h4>
                                <p className="text-gray-600">{loan.eligibility}</p>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">Required Documents</h4>
                              <ul className="list-disc list-inside text-gray-600">
                                {loan.documents.map((doc, index) => (
                                  <li key={index}>{doc}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No loans available at the moment.
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleBackToHome}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default BankingInfoComponent;