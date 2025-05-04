import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { useVoiceService } from '../hooks/useVoiceService';
import { getFinancialInfo, storeFinancialInfo } from '../utils/storage';
import { financialService } from '../services/financialService';
import FinancialCalculator from '../components/FinancialCalculator';
import { 
  BanknotesIcon, 
  ChartBarIcon, 
  DocumentTextIcon, 
  CalculatorIcon,
  ArrowTrendingUpIcon,
  PlusIcon,
  ChartPieIcon,
  DocumentChartBarIcon,
  CurrencyRupeeIcon,
  ScaleIcon,
  ShieldCheckIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';

// Dynamically import components with no SSR
const BankingInfoComponent = dynamic(() => import('../components/BankingInfo/BankingInfoComponent'), {
  ssr: false
});

export default function FinancePage() {
  const router = useRouter();
  const { playVoice } = useVoiceService();
  const [financialInfo, setFinancialInfo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('schemes');
  const [insights, setInsights] = useState(null);
  const [optimization, setOptimization] = useState(null);
  
  // Form states
  const [financialData, setFinancialData] = useState({
    income: '',
    expenses: '',
    savings: '',
    activeLoans: '',
    monthlyBudget: '',
    financialGoals: []
  });
  
  const [budgetData, setBudgetData] = useState({
    monthlyIncome: '',
    fixedExpenses: {
      rent: '',
      utilities: '',
      loanPayments: ''
    },
    variableExpenses: {
      supplies: '',
      labor: '',
      maintenance: ''
    },
    savingsGoals: {
      emergency: '',
      equipment: '',
      expansion: ''
    },
    seasonalFactors: {
      highSeason: [],
      lowSeason: []
    }
  });
  
  const [loanData, setLoanData] = useState({
    loanAmount: '',
    interestRate: '',
    loanTerm: ''
  });
  
  const [investmentData, setInvestmentData] = useState({
    initialInvestment: '',
    returnRate: '',
    investmentPeriod: ''
  });

  // Expense Tracker States
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [newExpense, setNewExpense] = useState({
    name: '',
    amount: '',
    category: '',
    date: '',
    type: 'expense' // 'expense' or 'income'
  });
  const [expenses, setExpenses] = useState([]);
  const [expenseCategories, setExpenseCategories] = useState({
    equipment: 0,
    supplies: 0,
    labor: 0,
    maintenance: 0,
    other: 0
  });
  const [monthlySummary, setMonthlySummary] = useState({
    income: 0,
    expenses: 0,
    balance: 0
  });

  useEffect(() => {
    // Play financial instructions voice
    playVoice('finance_instructions');
    
    // Load financial information
    const loadFinancialInfo = async () => {
      try {
        const data = await getFinancialInfo();
        setFinancialInfo(data);
        setLoading(false);
      } catch (error) {
        console.error('Error loading financial information:', error);
        setLoading(false);
      }
    };
    
    loadFinancialInfo();
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    playVoice(`finance_${tab}`);
  };

  const handleFinancialDataChange = (e) => {
    const { name, value } = e.target;
    setFinancialData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBudgetDataChange = (e) => {
    const { name, value } = e.target;
    const [category, field] = name.split('.');
    
    if (category && field) {
      setBudgetData(prev => ({
        ...prev,
        [category]: {
          ...prev[category],
          [field]: value
        }
      }));
    } else {
      setBudgetData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleLoanDataChange = (e) => {
    const { name, value } = e.target;
    setLoanData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleInvestmentDataChange = (e) => {
    const { name, value } = e.target;
    setInvestmentData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFinancialGoalsChange = (e) => {
    const goals = e.target.value.split(',').map(goal => goal.trim());
    setFinancialData(prev => ({
      ...prev,
      financialGoals: goals
    }));
  };

  const handleSeasonalFactorsChange = (e) => {
    const { name, value } = e.target;
    const months = value.split(',').map(month => month.trim());
    setBudgetData(prev => ({
      ...prev,
      seasonalFactors: {
        ...prev.seasonalFactors,
        [name]: months
      }
    }));
  };

  const generateInsights = async () => {
    try {
      setLoading(true);
      const insightsData = await financialService.getFinancialInsights(financialData);
      setInsights(insightsData);
    } catch (error) {
      console.error('Error generating insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateOptimization = async () => {
    try {
      setLoading(true);
      const optimizationData = await financialService.getBudgetOptimization(budgetData);
      setOptimization(optimizationData);
    } catch (error) {
      console.error('Error generating optimization:', error);
    } finally {
      setLoading(false);
    }
  };

  // Expense Form Handlers
  const handleExpenseChange = (e) => {
    const { name, value } = e.target;
    setNewExpense(prev => ({
      ...prev,
      [name]: name === 'amount' ? value.replace(/[^0-9.]/g, '') : value
    }));
  };

  const handleAddExpense = (e) => {
    e.preventDefault();
    const expense = {
      id: Date.now(),
      name: newExpense.name,
      amount: parseFloat(newExpense.amount) || 0,
      category: newExpense.category,
      date: newExpense.date,
      type: newExpense.type
    };
    
    // Update expenses
    setExpenses(prev => [...prev, expense]);
    
    // Update categories if it's an expense
    if (expense.type === 'expense') {
      const totalExpenses = expenses.reduce((sum, exp) => 
        exp.type === 'expense' ? sum + Math.abs(exp.amount) : sum, 0) + Math.abs(expense.amount);
      const categoryPercentage = (Math.abs(expense.amount) / totalExpenses) * 100;
      
      setExpenseCategories(prev => ({
        ...prev,
        [expense.category]: prev[expense.category] + categoryPercentage
      }));
    }
    
    // Update monthly summary
    setMonthlySummary(prev => {
      const newIncome = expense.type === 'income' ? prev.income + expense.amount : prev.income;
      const newExpenses = expense.type === 'expense' ? prev.expenses + Math.abs(expense.amount) : prev.expenses;
      const newBalance = newIncome - newExpenses;
      return {
        income: newIncome,
        expenses: newExpenses,
        balance: newBalance
      };
    });
    
    // Reset form
    setNewExpense({ name: '', amount: '', category: '', date: '', type: 'expense' });
    setIsAddingExpense(false);
  };

  const tabs = [
    { 
      id: 'schemes', 
      name: 'Schemes & Loans', 
      icon: DocumentTextIcon
    },
    { 
      id: 'expenses', 
      name: 'Expenses', 
      icon: BanknotesIcon
    },
    { 
      id: 'budget', 
      name: 'Budget', 
      icon: ArrowTrendingUpIcon
    },
    { 
      id: 'calculator', 
      name: 'Calculator', 
      icon: CalculatorIcon
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Financial Services - KrushiMind</title>
      </Head>

      <main className="container mx-auto px-4 py-8">
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Financial Management</h1>
                <p className="mt-2 text-sm text-gray-600">Manage your farm's finances, track expenses, and plan your budget</p>
              </div>
            </div>
            
            {/* Tabs */}
            <div className="bg-white shadow rounded-lg mb-8">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6" aria-label="Tabs">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`
                        group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
                        ${activeTab === tab.id
                          ? 'border-primary-500 text-primary-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }
                      `}
                    >
                      <tab.icon
                        className={`
                          -ml-0.5 mr-2 h-5 w-5
                          ${activeTab === tab.id ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'}
                        `}
                        aria-hidden="true"
                      />
                      <span>{tab.name}</span>
                    </button>
                  ))}
                </nav>
              </div>
              
              {/* Content */}
              <div className="p-6">
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
                  </div>
                ) : (
                  <>
                    {activeTab === 'schemes' && (
                      <BankingInfoComponent financialInfo={financialInfo} loading={loading} />
                    )}
                    
                    {activeTab === 'expenses' && (
                      <div className="space-y-6">
                        <div className="flex justify-between items-center">
                          <h2 className="text-2xl font-semibold text-gray-900">Expense Tracker</h2>
                          <button 
                            onClick={() => setIsAddingExpense(true)}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                          >
                            <PlusIcon className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />
                            Add Expense
                          </button>
                        </div>

                        {isAddingExpense && (
                          <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Transaction</h3>
                            <form onSubmit={handleAddExpense} className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700">
                                  Transaction Type
                                </label>
                                <div className="mt-2 space-x-4">
                                  <label className="inline-flex items-center">
                                    <input
                                      type="radio"
                                      name="type"
                                      value="expense"
                                      checked={newExpense.type === 'expense'}
                                      onChange={handleExpenseChange}
                                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">Expense</span>
                                  </label>
                                  <label className="inline-flex items-center">
                                    <input
                                      type="radio"
                                      name="type"
                                      value="income"
                                      checked={newExpense.type === 'income'}
                                      onChange={handleExpenseChange}
                                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">Income</span>
                                  </label>
                                </div>
                              </div>
                              <div>
                                <label htmlFor="expenseName" className="block text-sm font-medium text-gray-700">
                                  {newExpense.type === 'income' ? 'Income Source' : 'Expense Name'}
                                </label>
                                <input
                                  type="text"
                                  id="expenseName"
                                  name="name"
                                  value={newExpense.name}
                                  onChange={handleExpenseChange}
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                  required
                                />
                              </div>
                              <div>
                                <label htmlFor="expenseAmount" className="block text-sm font-medium text-gray-700">
                                  Amount (₹)
                                </label>
                                <input
                                  type="number"
                                  id="expenseAmount"
                                  name="amount"
                                  value={newExpense.amount}
                                  onChange={handleExpenseChange}
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                  required
                                />
                              </div>
                              {newExpense.type === 'expense' && (
                                <div>
                                  <label htmlFor="expenseCategory" className="block text-sm font-medium text-gray-700">
                                    Category
                                  </label>
                                  <select
                                    id="expenseCategory"
                                    name="category"
                                    value={newExpense.category}
                                    onChange={handleExpenseChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                    required
                                  >
                                    <option value="">Select a category</option>
                                    <option value="equipment">Equipment</option>
                                    <option value="supplies">Supplies</option>
                                    <option value="labor">Labor</option>
                                    <option value="maintenance">Maintenance</option>
                                    <option value="other">Other</option>
                                  </select>
                                </div>
                              )}
                              <div>
                                <label htmlFor="expenseDate" className="block text-sm font-medium text-gray-700">
                                  Date
                                </label>
                                <input
                                  type="date"
                                  id="expenseDate"
                                  name="date"
                                  value={newExpense.date}
                                  onChange={handleExpenseChange}
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                  required
                                />
                              </div>
                              <div className="flex justify-end space-x-3">
                                <button
                                  type="button"
                                  onClick={() => setIsAddingExpense(false)}
                                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="submit"
                                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                >
                                  Add {newExpense.type === 'income' ? 'Income' : 'Expense'}
                                </button>
                              </div>
                            </form>
                          </div>
                        )}

                        <div className="bg-gray-50 rounded-lg p-8">
                          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            <div className="bg-white p-6 rounded-lg shadow-sm">
                              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Transactions</h3>
                              <div className="space-y-4">
                                {expenses.length > 0 ? (
                                  expenses.slice(0, 5).map((expense) => (
                                    <div key={expense.id} className="flex justify-between items-center">
                                      <span className="text-sm text-gray-600">{expense.name}</span>
                                      <span className={`text-sm font-medium ${expense.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {expense.amount >= 0 ? '+' : ''}₹{Math.abs(expense.amount).toLocaleString()}
                                      </span>
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-sm text-gray-500">No transactions yet</p>
                                )}
                              </div>
                            </div>

                            <div className="bg-white p-6 rounded-lg shadow-sm">
                              <h3 className="text-lg font-medium text-gray-900 mb-4">Expense Categories</h3>
                              <div className="space-y-4">
                                {Object.entries(expenseCategories).map(([category, percentage]) => (
                                  <div key={category} className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600 capitalize">{category}</span>
                                    <span className="text-sm font-medium text-gray-900">{percentage}%</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="bg-white p-6 rounded-lg shadow-sm">
                              <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Summary</h3>
                              <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-600">Income</span>
                                  <span className="text-sm font-medium text-green-600">
                                    +₹{monthlySummary.income.toLocaleString()}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-600">Expenses</span>
                                  <span className="text-sm font-medium text-red-600">
                                    -₹{monthlySummary.expenses.toLocaleString()}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                                  <span className="text-sm font-medium text-gray-900">Net Balance</span>
                                  <span className={`text-sm font-medium ${monthlySummary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {monthlySummary.balance >= 0 ? '+' : ''}₹{Math.abs(monthlySummary.balance).toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {activeTab === 'budget' && (
                      <div className="space-y-6">
                        <div className="flex justify-between items-center">
                          <h2 className="text-2xl font-semibold text-gray-900">Budget Optimization</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-white p-6 rounded-lg shadow-sm">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Budget Data</h3>
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700">Monthly Income</label>
                                <input
                                  type="number"
                                  name="monthlyIncome"
                                  value={budgetData.monthlyIncome}
                                  onChange={handleBudgetDataChange}
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                  placeholder="Enter monthly income"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700">Fixed Expenses</label>
                                <div className="mt-2 space-y-2">
                                  <input
                                    type="number"
                                    name="fixedExpenses.rent"
                                    value={budgetData.fixedExpenses.rent}
                                    onChange={handleBudgetDataChange}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                    placeholder="Rent"
                                  />
                                  <input
                                    type="number"
                                    name="fixedExpenses.utilities"
                                    value={budgetData.fixedExpenses.utilities}
                                    onChange={handleBudgetDataChange}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                    placeholder="Utilities"
                                  />
                                  <input
                                    type="number"
                                    name="fixedExpenses.loanPayments"
                                    value={budgetData.fixedExpenses.loanPayments}
                                    onChange={handleBudgetDataChange}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                    placeholder="Loan Payments"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700">Variable Expenses</label>
                                <div className="mt-2 space-y-2">
                                  <input
                                    type="number"
                                    name="variableExpenses.supplies"
                                    value={budgetData.variableExpenses.supplies}
                                    onChange={handleBudgetDataChange}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                    placeholder="Supplies"
                                  />
                                  <input
                                    type="number"
                                    name="variableExpenses.labor"
                                    value={budgetData.variableExpenses.labor}
                                    onChange={handleBudgetDataChange}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                    placeholder="Labor"
                                  />
                                  <input
                                    type="number"
                                    name="variableExpenses.maintenance"
                                    value={budgetData.variableExpenses.maintenance}
                                    onChange={handleBudgetDataChange}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                    placeholder="Maintenance"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700">Savings Goals</label>
                                <div className="mt-2 space-y-2">
                                  <input
                                    type="number"
                                    name="savingsGoals.emergency"
                                    value={budgetData.savingsGoals.emergency}
                                    onChange={handleBudgetDataChange}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                    placeholder="Emergency Fund"
                                  />
                                  <input
                                    type="number"
                                    name="savingsGoals.equipment"
                                    value={budgetData.savingsGoals.equipment}
                                    onChange={handleBudgetDataChange}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                    placeholder="Equipment Fund"
                                  />
                                  <input
                                    type="number"
                                    name="savingsGoals.expansion"
                                    value={budgetData.savingsGoals.expansion}
                                    onChange={handleBudgetDataChange}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                    placeholder="Expansion Fund"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700">High Season Months (comma separated)</label>
                                <input
                                  type="text"
                                  name="highSeason"
                                  value={budgetData.seasonalFactors.highSeason.join(', ')}
                                  onChange={handleSeasonalFactorsChange}
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                  placeholder="e.g., April, May, June"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700">Low Season Months (comma separated)</label>
                                <input
                                  type="text"
                                  name="lowSeason"
                                  value={budgetData.seasonalFactors.lowSeason.join(', ')}
                                  onChange={handleSeasonalFactorsChange}
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                  placeholder="e.g., December, January, February"
                                />
                              </div>
                              <button
                                onClick={generateOptimization}
                                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                              >
                                Generate Optimization Plan
                              </button>
                            </div>
                          </div>
                          
                          {optimization && (
                            <div className="bg-white p-6 rounded-lg shadow-sm">
                              <h3 className="text-lg font-medium text-gray-900 mb-4">Optimization Plan</h3>
                              <div className="space-y-4">
                                <div>
                                  <h4 className="text-sm font-medium text-gray-700">Immediate Actions</h4>
                                  <ul className="mt-2 list-disc list-inside text-sm text-gray-600">
                                    {optimization.optimizationPlan.immediateActions.map((action, index) => (
                                      <li key={index}>{action}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {activeTab === 'calculator' && (
                      <FinancialCalculator />
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}