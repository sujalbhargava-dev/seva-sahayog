import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
// import aiService from '../services/ai.service'; // We will use a mock service here for now

/**
 * GET /api/ai/insights
 * Returns demand forecasting data
 */
export const getDemandInsights = asyncHandler(async (req: Request, res: Response) => {
  // In a real implementation, this would proxy to the Python AI service
  // or query the database for demand trends.
  
  const mockInsights = {
    highDemand: {
      title: 'High Demand Now',
      message: 'Electrician demand up 34% in Gwalior today',
    },
    forecast: [
      { day: 'Mon', value: 30, active: false },
      { day: 'Tue', value: 45, active: false },
      { day: 'Wed', value: 35, active: false },
      { day: 'Thu', value: 50, active: false },
      { day: 'Fri', value: 70, active: false },
      { day: 'Sat', value: 100, active: true },
      { day: 'Sun', value: 65, active: false },
    ],
    bestAreas: [
      { name: 'City Centre, Gwalior', jobs: '~18 jobs expected', demand: 'High' },
      { name: 'Morar', jobs: '~9 jobs expected', demand: 'Medium' },
      { name: 'Thatipur', jobs: '~4 jobs expected', demand: 'Low' },
    ]
  };

  res.json(ApiResponse.ok(mockInsights));
});

/**
 * GET /api/ai/match
 * Returns recommended workers based on AI matching
 */
export const getSmartMatches = asyncHandler(async (req: Request, res: Response) => {
  // In a real implementation, this queries the database and applies a scoring algorithm
  // based on the customer's location, budget, and history.
  
  const mockMatches = [
    {
      id: 1,
      name: 'Ramesh Kumar',
      profession: 'Electrician',
      price: '₹500',
      match: '98%',
      initial: 'R',
      initialBg: '#e6f4ed',
      initialColor: '#008751',
      tags: ['Near you', 'Fits budget', 'Top rated']
    },
    {
      id: 2,
      name: 'Suresh Yadav',
      profession: 'Plumber',
      price: '₹450',
      match: '91%',
      initial: 'S',
      initialBg: '#eff6ff',
      initialColor: '#2563eb',
      tags: ['Available now', 'Fits budget']
    },
    {
      id: 3,
      name: 'Vikas Sharma',
      profession: 'Carpenter',
      price: '₹600',
      match: '87%',
      initial: 'V',
      initialBg: '#f0fdfa',
      initialColor: '#0d9488',
      tags: ['Highly rated', 'Fast response']
    }
  ];

  res.json(ApiResponse.ok(mockMatches));
});
