import React, { useState } from 'react';
import { CalculatorIcon, CurrencyRupeeIcon, ChartBarIcon } from '@heroicons/react/24/outline';

const FinancialCalculator = () => {
  // Loan calculator state
  const [loanData, setLoanData] = useState({
    amount: '',
    interestRate: '',
    term: '',
    monthlyPayment: '',
    totalPayment: '',
    totalInterest: ''
  });

  // Handle loan calculation
  const calculateLoan = () => {
    const { amount, interestRate, term } = loanData;
    if (!amount || !interestRate || !term) return;

    const principal = parseFloat(amount);
    const monthlyRate = parseFloat(interestRate) / 100 / 12;
    const numberOfPayments = parseFloat(term) * 12;

    // Calculate monthly payment
    const monthlyPayment = principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments) / (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    const totalPayment = monthlyPayment * numberOfPayments;
    const totalInterest = totalPayment - principal;

    setLoanData(prev => ({
      ...prev,
      monthlyPayment: monthlyPayment.toFixed(2),
      totalPayment: totalPayment.toFixed(2),
      totalInterest: totalInterest.toFixed(2)
    }));
  };

  // Handle input changes
  const handleLoanChange = (e) => {
    const { name, value } = e.target;
    setLoanData(prev => ({
      ...prev,
      [name]: value,
      monthlyPayment: '',
      totalPayment: '',
      totalInterest: ''
    }));
  };

  return (
    <div className="p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-gray-900">Loan Calculator</h2>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Loan Amount</label>
              <input
                type="number"
                name="amount"
                value={loanData.amount}
                onChange={handleLoanChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="Enter loan amount"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Interest Rate</label>
              <input
                type="number"
                name="interestRate"
                value={loanData.interestRate}
                onChange={handleLoanChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="Enter interest rate"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Loan Term (years)</label>
              <input
                type="number"
                name="term"
                value={loanData.term}
                onChange={handleLoanChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="Enter loan term"
              />
            </div>
            <button
              onClick={calculateLoan}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Calculate
            </button>
            
            {loanData.monthlyPayment && (
              <div className="mt-4 space-y-2">
                <p className="text-sm text-gray-600">Monthly Payment: ₹{loanData.monthlyPayment}</p>
                <p className="text-sm text-gray-600">Total Payment: ₹{loanData.totalPayment}</p>
                <p className="text-sm text-gray-600">Total Interest: ₹{loanData.totalInterest}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialCalculator; 