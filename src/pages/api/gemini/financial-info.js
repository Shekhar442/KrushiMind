import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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
    },
    {
      id: '3',
      title: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
      description: 'Crop insurance to protect against natural calamities, pests & diseases.',
      eligibility: 'All farmers, including sharecroppers and tenant farmers.',
      benefits: 'Comprehensive crop insurance coverage with low premium rates.',
      documents: ['Land records', 'Bank account details', 'Aadhaar card']
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
    },
    {
      id: '2',
      title: 'Agricultural Term Loan',
      description: 'Long-term loan for farm mechanization, land development, etc.',
      interestRate: '9-12% depending on the bank and purpose',
      eligibility: 'Farmers with land ownership or lease agreements.',
      documents: ['Land ownership documents', 'Project plan', 'Identity proof']
    }
  ]
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Check if API key is available
    if (!process.env.GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY not found, using fallback data');
      return res.status(200).json(fallbackData);
    }

    // Get the generative model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Create a prompt for financial information
    const prompt = `Provide information about Indian government agricultural schemes and loans in the following JSON format:
    {
      "schemes": [
        {
          "id": "string",
          "title": "string",
          "description": "string",
          "eligibility": "string",
          "benefits": "string",
          "documents": ["string"]
        }
      ],
      "loans": [
        {
          "id": "string",
          "title": "string",
          "description": "string",
          "interestRate": "string",
          "eligibility": "string",
          "documents": ["string"]
        }
      ]
    }
    
    Include at least 3 major government schemes and 2 loan options. Make sure the information is accurate and up-to-date.`;

    try {
      // Generate content
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse the response
      const data = JSON.parse(text);

      // Validate the response structure
      if (!data.schemes || !data.loans || !Array.isArray(data.schemes) || !Array.isArray(data.loans)) {
        console.warn('Invalid response structure from Gemini API, using fallback data');
        return res.status(200).json(fallbackData);
      }

      return res.status(200).json(data);
    } catch (apiError) {
      console.error('Error with Gemini API:', apiError);
      // Return fallback data if Gemini API fails
      return res.status(200).json(fallbackData);
    }
  } catch (error) {
    console.error('Error in financial-info API:', error);
    // Return fallback data in case of any other error
    return res.status(200).json(fallbackData);
  }
} 