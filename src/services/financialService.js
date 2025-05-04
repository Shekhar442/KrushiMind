import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

// Helper function to clean and parse JSON response
const cleanAndParseJSON = (text) => {
  try {
    // Remove markdown code block syntax if present
    const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error('Error parsing JSON:', error);
    throw new Error('Invalid response format from AI model');
  }
};

// Helper function to generate dynamic prompts
const generateDynamicPrompt = (template, data, context) => {
  return template
    .replace(/\${([^}]+)}/g, (match, key) => {
      const value = data[key];
      return value !== undefined ? value : match;
    })
    .replace(/\${context}/g, context);
};

const schema = {
  type: "object",
  properties: {
    schemeName: { type: "string" },
    description: { type: "string" },
    eligibility: { type: "string" },
    benefits: { type: "string" },
    documentsRequired: { type: "string" },
    applicationProcess: { type: "string" },
    applicationGuidelines: { type: "array", items: { type: "string" } }
  },
  required: ["schemeName", "description", "eligibility", "benefits"]
};

export const financialService = {
  async getFinancialInsights(data) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      
      const prompt = generateDynamicPrompt(`
        You are an expert agricultural financial advisor with deep knowledge of farming economics, rural banking, and government schemes.
        Based on the following financial data, provide detailed insights in JSON format.
        Focus on agricultural-specific financial metrics and recommendations.
        Do not include any markdown formatting or additional text, just the JSON object.
        
        Financial Data:
        - Income: ${data.income}
        - Expenses: ${data.expenses}
        - Savings: ${data.savings}
        - Active Loans: ${data.activeLoans}
        - Monthly Budget: ${data.monthlyBudget}
        - Financial Goals: ${JSON.stringify(data.financialGoals)}
        - Location: ${data.location || 'Not specified'}
        - Crop Type: ${data.cropType || 'Not specified'}
        - Farm Size: ${data.farmSize || 'Not specified'}
        
        Consider:
        1. Agricultural income patterns (seasonal variations)
        2. Government subsidies and schemes
        3. Crop insurance and risk management
        4. Farm equipment financing
        5. Agricultural market trends
        6. Local market conditions
        7. Weather patterns and climate risks
        8. Crop-specific financial requirements
        
        JSON format:
        {
          "financialHealth": {
            "score": number,
            "status": "string",
            "strengths": ["string"],
            "weaknesses": ["string"],
            "riskFactors": ["string"],
            "improvementAreas": ["string"]
          },
          "budgetAnalysis": {
            "savingsRate": number,
            "expenseBreakdown": {
              "essential": number,
              "nonEssential": number,
              "investments": number,
              "seasonal": number
            },
            "recommendations": ["string"],
            "seasonalAdjustments": ["string"],
            "cropSpecific": ["string"]
          },
          "loanManagement": {
            "debtToIncome": number,
            "repaymentStrategy": ["string"],
            "riskAssessment": "string",
            "governmentSchemes": ["string"],
            "refinancingOptions": ["string"]
          },
          "investmentOpportunities": {
            "agricultural": ["string"],
            "nonAgricultural": ["string"],
            "riskLevel": "string",
            "ROI": number,
            "timeline": ["string"],
            "resourceRequirements": ["string"]
          },
          "financialPlanning": {
            "shortTerm": ["string"],
            "longTerm": ["string"],
            "emergencyFund": "string",
            "insuranceCoverage": ["string"],
            "riskMitigation": ["string"]
          },
          "marketAnalysis": {
            "currentTrends": ["string"],
            "priceForecast": ["string"],
            "demandAnalysis": ["string"],
            "competition": ["string"]
          },
          "governmentSupport": {
            "availableSchemes": ["string"],
            "eligibility": ["string"],
            "applicationProcess": ["string"],
            "subsidyDetails": ["string"]
          }
        }
      `, data);

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return cleanAndParseJSON(text);
    } catch (error) {
      console.error('Error in getFinancialInsights:', error);
      throw new Error('Failed to generate financial insights. Please try again.');
    }
  },

  async getLoanRecommendations(data) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      
      const prompt = generateDynamicPrompt(`
        You are an expert agricultural loan advisor specializing in farm financing and government agricultural schemes.
        Based on the following information, provide loan recommendations in JSON format.
        Focus on agricultural-specific loan products and government schemes.
        Do not include any markdown formatting or additional text, just the JSON object.
        
        Information:
        - Crop Type: ${data.cropType}
        - Land Size: ${data.landSize}
        - Current Income: ${data.currentIncome}
        - Credit Score: ${data.creditScore}
        - Existing Loans: ${JSON.stringify(data.existingLoans)}
        - Purpose: ${data.purpose}
        - Location: ${data.location || 'Not specified'}
        - Farming Experience: ${data.farmingExperience || 'Not specified'}
        - Previous Loan History: ${data.previousLoanHistory || 'Not specified'}
        
        Consider:
        1. Kisan Credit Card (KCC) schemes
        2. Agricultural term loans
        3. Equipment financing
        4. Government subsidy programs
        5. Crop insurance requirements
        6. Local bank policies
        7. Crop-specific loan schemes
        8. Seasonal repayment flexibility
        
        JSON format:
        {
          "loanOptions": [
            {
              "type": "string",
              "amount": number,
              "interestRate": number,
              "tenure": "string",
              "eligibility": "string",
              "documents": ["string"],
              "benefits": ["string"],
              "subsidyAvailable": boolean,
              "subsidyDetails": "string",
              "processingTime": "string",
              "collateralRequirements": ["string"]
            }
          ],
          "recommendations": {
            "bestOption": "string",
            "reason": "string",
            "alternativeOptions": ["string"],
            "governmentSchemes": ["string"],
            "cropSpecific": ["string"]
          },
          "riskAssessment": {
            "score": number,
            "factors": ["string"],
            "mitigation": ["string"],
            "insuranceRequirements": ["string"],
            "contingencyPlans": ["string"]
          },
          "applicationTips": ["string"],
          "repaymentStrategy": {
            "monthlyEMI": number,
            "seasonalAdjustments": ["string"],
            "gracePeriods": ["string"],
            "prepaymentOptions": ["string"]
          },
          "documentation": {
            "required": ["string"],
            "optional": ["string"],
            "format": ["string"],
            "submissionProcess": ["string"]
          },
          "supportServices": {
            "technicalAssistance": ["string"],
            "trainingPrograms": ["string"],
            "marketLinkages": ["string"]
          }
        }
      `, data);

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return cleanAndParseJSON(text);
    } catch (error) {
      console.error('Error in getLoanRecommendations:', error);
      throw new Error('Failed to generate loan recommendations. Please try again.');
    }
  },

  async getBudgetOptimization(data) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      
      const prompt = generateDynamicPrompt(`
        You are an expert agricultural budget planner specializing in farm economics and seasonal financial planning.
        Based on the following budget data, provide optimization recommendations in JSON format.
        Focus on agricultural-specific budget considerations and seasonal variations.
        Do not include any markdown formatting or additional text, just the JSON object.
        
        Budget Data:
        - Monthly Income: ${data.monthlyIncome}
        - Fixed Expenses: ${JSON.stringify(data.fixedExpenses)}
        - Variable Expenses: ${JSON.stringify(data.variableExpenses)}
        - Savings Goals: ${JSON.stringify(data.savingsGoals)}
        - Seasonal Factors: ${JSON.stringify(data.seasonalFactors)}
        - Crop Type: ${data.cropType || 'Not specified'}
        - Location: ${data.location || 'Not specified'}
        - Market Conditions: ${data.marketConditions || 'Not specified'}
        
        Consider:
        1. Crop cycles and seasonal income patterns
        2. Agricultural input costs
        3. Labor costs during peak seasons
        4. Equipment maintenance schedules
        5. Market price fluctuations
        6. Weather-related risks
        7. Crop-specific requirements
        8. Local market dynamics
        
        JSON format:
        {
          "currentAnalysis": {
            "incomeDistribution": {
              "essential": number,
              "savings": number,
              "discretionary": number,
              "seasonalReserve": number,
              "emergencyFund": number
            },
            "expenseEfficiency": number,
            "savingsRate": number,
            "riskExposure": number,
            "profitability": number
          },
          "optimizationPlan": {
            "immediateActions": ["string"],
            "longTermStrategies": ["string"],
            "costReductionAreas": ["string"],
            "investmentPriorities": ["string"],
            "riskMitigation": ["string"]
          },
          "seasonalAdjustments": {
            "highSeason": {
              "income": ["string"],
              "expenses": ["string"],
              "savings": ["string"],
              "labor": ["string"],
              "equipment": ["string"]
            },
            "lowSeason": {
              "income": ["string"],
              "expenses": ["string"],
              "savings": ["string"],
              "maintenance": ["string"],
              "planning": ["string"]
            },
            "transitionPeriods": {
              "preparation": ["string"],
              "recovery": ["string"],
              "resourceAllocation": ["string"]
            }
          },
          "riskManagement": {
            "emergencyFund": "string",
            "insuranceCoverage": ["string"],
            "contingencyPlans": ["string"],
            "marketHedging": ["string"],
            "weatherProtection": ["string"]
          },
          "governmentSchemes": {
            "available": ["string"],
            "eligibility": ["string"],
            "applicationProcess": ["string"],
            "benefits": ["string"]
          },
          "resourceOptimization": {
            "labor": ["string"],
            "equipment": ["string"],
            "inputs": ["string"],
            "storage": ["string"]
          },
          "marketStrategy": {
            "pricing": ["string"],
            "timing": ["string"],
            "channels": ["string"],
            "competition": ["string"]
          }
        }
      `, data);

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return cleanAndParseJSON(text);
    } catch (error) {
      console.error('Error in getBudgetOptimization:', error);
      throw new Error('Failed to generate budget optimization. Please try again.');
    }
  },

  async getCropFinancialAnalysis(data) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      
      const prompt = generateDynamicPrompt(`
        You are an expert agricultural financial analyst specializing in crop-specific financial planning and analysis.
        Based on the following crop data, provide detailed financial analysis in JSON format.
        Focus on crop-specific financial metrics and recommendations.
        Do not include any markdown formatting or additional text, just the JSON object.
        
        Crop Data:
        - Crop Type: ${data.cropType}
        - Area: ${data.area}
        - Expected Yield: ${data.expectedYield}
        - Market Price: ${data.marketPrice}
        - Input Costs: ${JSON.stringify(data.inputCosts)}
        - Location: ${data.location}
        - Season: ${data.season}
        - Previous Performance: ${data.previousPerformance || 'Not available'}
        
        Consider:
        1. Crop-specific input requirements
        2. Market price trends
        3. Yield optimization
        4. Cost management
        5. Risk factors
        6. Government support
        7. Market access
        8. Value addition opportunities
        
        JSON format:
        {
          "financialProjection": {
            "totalInvestment": number,
            "expectedRevenue": number,
            "profitMargin": number,
            "breakEvenPoint": number,
            "ROI": number
          },
          "costAnalysis": {
            "inputCosts": {
              "seeds": number,
              "fertilizers": number,
              "pesticides": number,
              "labor": number,
              "equipment": number,
              "other": number
            },
            "fixedCosts": number,
            "variableCosts": number,
            "costOptimization": ["string"]
          },
          "riskAssessment": {
            "marketRisks": ["string"],
            "productionRisks": ["string"],
            "priceRisks": ["string"],
            "mitigationStrategies": ["string"]
          },
          "marketAnalysis": {
            "demandTrends": ["string"],
            "priceForecast": ["string"],
            "competition": ["string"],
            "marketAccess": ["string"]
          },
          "optimization": {
            "inputEfficiency": ["string"],
            "yieldImprovement": ["string"],
            "costReduction": ["string"],
            "valueAddition": ["string"]
          },
          "governmentSupport": {
            "schemes": ["string"],
            "subsidies": ["string"],
            "insurance": ["string"],
            "training": ["string"]
          }
        }
      `, data);

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return cleanAndParseJSON(text);
    } catch (error) {
      console.error('Error in getCropFinancialAnalysis:', error);
      throw new Error('Failed to generate crop financial analysis. Please try again.');
    }
  }
}; 