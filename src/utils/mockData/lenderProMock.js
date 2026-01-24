const lenders = ['LendingKart', 'KreditBee', 'MoneyTap', 'CASHe', 'Fibe', 'SmartCoin', 'EarlySalary', 'ZestMoney'];
const months = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'];

export const getLenderProMockData = (period = 'this_month') => {
  return {
    kpis: {
      totalLeads: { current: 5400, previous: 4800, change: 12.5 },
      approvalRate: { current: 34.2, previous: 31.8, change: 7.5 },
      avgTAT: { current: 4.2, previous: 5.1, change: -17.6 },
      revenue: { current: 8500000, previous: 7200000, change: 18.0 },
      activeLenders: { current: 12, previous: 11, change: 9.0 },
    },
    lenderComparison: lenders.map((name) => ({
      lenderName: name,
      leads: 400 + Math.floor(Math.random() * 800),
      approved: 120 + Math.floor(Math.random() * 350),
      rejected: 200 + Math.floor(Math.random() * 400),
      tat: +(2 + Math.random() * 6).toFixed(1),
      revenue: 500000 + Math.floor(Math.random() * 2500000),
    })),
    approvalTrend: months.map((month) => {
      const row = { month };
      lenders.slice(0, 5).forEach((l) => {
        row[l] = +(25 + Math.random() * 20).toFixed(1);
      });
      return row;
    }),
    tatAnalysis: lenders.map((lender) => ({
      lender,
      avgTAT: +(2 + Math.random() * 7).toFixed(1),
      minTAT: +(0.5 + Math.random() * 2).toFixed(1),
      maxTAT: +(8 + Math.random() * 16).toFixed(1),
    })),
    rejectionReasons: [
      { reason: 'Low CIBIL Score (<650)', count: 1200, percentage: 35 },
      { reason: 'Income Insufficient', count: 800, percentage: 23 },
      { reason: 'High Existing EMI', count: 520, percentage: 15 },
      { reason: 'Age Criteria Not Met', count: 380, percentage: 11 },
      { reason: 'Employment Type', count: 280, percentage: 8 },
      { reason: 'KYC Mismatch', count: 180, percentage: 5 },
      { reason: 'Other', count: 100, percentage: 3 },
    ],
    revenueByLender: lenders.map((lender) => ({
      lender,
      current: 500000 + Math.floor(Math.random() * 2000000),
      previous: 400000 + Math.floor(Math.random() * 1800000),
    })),
  };
};
