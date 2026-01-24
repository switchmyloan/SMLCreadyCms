const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const getMutualFundsMockData = (period = 'this_month') => {
  return {
    kpis: {
      totalAUM: { current: 125000000, previous: 112000000, change: 11.6 },
      sipCount: { current: 4500, previous: 3800, change: 18.4 },
      newInvestors: { current: 1200, previous: 980, change: 22.4 },
      avgPortfolioValue: { current: 185000, previous: 172000, change: 7.5 },
      consentToInvestment: { current: 42.5, previous: 38.2, change: 11.2 },
    },
    aumTrend: months.map((month, i) => ({
      month,
      aum: 80000000 + i * 4000000 + Math.floor(Math.random() * 10000000),
      previousYear: 55000000 + i * 3000000 + Math.floor(Math.random() * 8000000),
    })),
    sipVsLumpsum: months.map((month) => ({
      month,
      sip: 280 + Math.floor(Math.random() * 200),
      lumpsum: 80 + Math.floor(Math.random() * 100),
    })),
    fundCategories: [
      { name: 'Equity', value: 45, aum: 56250000, color: '#6366f1' },
      { name: 'Debt', value: 25, aum: 31250000, color: '#10b981' },
      { name: 'Hybrid', value: 20, aum: 25000000, color: '#f59e0b' },
      { name: 'ELSS', value: 10, aum: 12500000, color: '#ef4444' },
    ],
    investorDemographics: {
      ageGroups: [
        { range: '18-25', count: 320 },
        { range: '26-35', count: 580 },
        { range: '36-45', count: 420 },
        { range: '46-55', count: 180 },
        { range: '55+', count: 95 },
      ],
      investmentBrackets: [
        { range: '< 50K', count: 450, color: '#6366f1' },
        { range: '50K-2L', count: 380, color: '#8b5cf6' },
        { range: '2L-5L', count: 220, color: '#10b981' },
        { range: '5L-10L', count: 95, color: '#f59e0b' },
        { range: '> 10L', count: 45, color: '#ef4444' },
      ],
    },
    investmentFunnel: [
      { name: 'MF Registered', value: 8500, color: '#6366f1' },
      { name: 'KYC Complete', value: 6200, color: '#8b5cf6' },
      { name: 'Consent Given', value: 4800, color: '#a855f7' },
      { name: 'Portfolio Created', value: 3200, color: '#3b82f6' },
      { name: 'First Investment', value: 2100, color: '#10b981' },
    ],
    topFunds: [
      { name: 'HDFC Mid-Cap Opportunities', category: 'Equity', aum: 12500000, return1Y: 28.5, investors: 320, sipCount: 180 },
      { name: 'SBI Bluechip Fund', category: 'Equity', aum: 10800000, return1Y: 22.3, investors: 280, sipCount: 165 },
      { name: 'ICICI Pru Technology Fund', category: 'Equity', aum: 9500000, return1Y: 35.2, investors: 195, sipCount: 120 },
      { name: 'Axis Long Term Equity', category: 'ELSS', aum: 8200000, return1Y: 18.7, investors: 410, sipCount: 350 },
      { name: 'HDFC Corporate Bond', category: 'Debt', aum: 7800000, return1Y: 8.5, investors: 150, sipCount: 90 },
      { name: 'Kotak Balanced Advantage', category: 'Hybrid', aum: 6500000, return1Y: 15.2, investors: 180, sipCount: 110 },
      { name: 'Mirae Asset Large Cap', category: 'Equity', aum: 5900000, return1Y: 20.1, investors: 220, sipCount: 145 },
      { name: 'Parag Parikh Flexi Cap', category: 'Equity', aum: 5200000, return1Y: 24.8, investors: 175, sipCount: 130 },
    ],
    topAMCs: [
      { name: 'HDFC AMC', aum: 35000000, count: 450 },
      { name: 'SBI MF', aum: 28000000, count: 380 },
      { name: 'ICICI Prudential', aum: 22000000, count: 310 },
      { name: 'Axis MF', aum: 18000000, count: 260 },
      { name: 'Kotak MF', aum: 12000000, count: 180 },
      { name: 'Mirae Asset', aum: 10000000, count: 150 },
    ],
  };
};
