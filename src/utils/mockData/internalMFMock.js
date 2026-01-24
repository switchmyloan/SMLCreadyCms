const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const getInternalMFMockData = (period = 'this_month') => {
  return {
    kpis: {
      portfolioValue: { current: 85000000, previous: 78000000, change: 8.9 },
      commissionEarned: { current: 2450000, previous: 2100000, change: 16.6 },
      activeLoans: { current: 342, previous: 310, change: 10.3 },
      avgLTV: { current: 62.5, previous: 64.2, change: -2.6 },
      targetAchievement: { current: 87.5, previous: 82.0, change: 6.7 },
    },
    commissionTrend: months.map((month, i) => ({
      month,
      earned: 1800000 + Math.floor(Math.random() * 800000) + i * 50000,
      target: 2200000 + i * 30000,
    })),
    loanDisbursements: months.map((month, i) => ({
      month,
      count: 22 + Math.floor(Math.random() * 15) + Math.floor(i * 1.5),
      amount: 5000000 + Math.floor(Math.random() * 3000000) + i * 300000,
    })),
    targets: [
      { metric: 'New MF Users', target: 500, actual: 435, unit: 'users' },
      { metric: 'Loans Disbursed', target: 40, actual: 35, unit: 'loans' },
      { metric: 'Commission Revenue', target: 2800000, actual: 2450000, unit: 'currency' },
      { metric: 'Portfolio Growth', target: 15, actual: 12.8, unit: 'percentage' },
      { metric: 'SIP Conversions', target: 200, actual: 178, unit: 'count' },
    ],
    recentLoans: [
      { id: 'LN001', user: 'Rahul Sharma', amount: 250000, tenure: '12 months', roi: 12.5, status: 'Active', date: '2026-01-18', ltv: 58 },
      { id: 'LN002', user: 'Priya Patel', amount: 180000, tenure: '6 months', roi: 11.0, status: 'Active', date: '2026-01-15', ltv: 62 },
      { id: 'LN003', user: 'Amit Kumar', amount: 500000, tenure: '24 months', roi: 13.5, status: 'Active', date: '2026-01-12', ltv: 72 },
      { id: 'LN004', user: 'Sneha Reddy', amount: 150000, tenure: '6 months', roi: 10.5, status: 'Closed', date: '2026-01-10', ltv: 45 },
      { id: 'LN005', user: 'Vikram Singh', amount: 320000, tenure: '12 months', roi: 12.0, status: 'Active', date: '2026-01-08', ltv: 65 },
      { id: 'LN006', user: 'Anjali Gupta', amount: 220000, tenure: '9 months', roi: 11.5, status: 'Active', date: '2026-01-05', ltv: 55 },
      { id: 'LN007', user: 'Karthik Nair', amount: 450000, tenure: '18 months', roi: 13.0, status: 'Overdue', date: '2025-12-28', ltv: 75 },
      { id: 'LN008', user: 'Meera Joshi', amount: 175000, tenure: '6 months', roi: 10.0, status: 'Active', date: '2025-12-22', ltv: 48 },
    ],
    portfolioHoldings: [
      { user: 'Rahul Sharma', fund: 'HDFC Mid-Cap', qty: 1250, currentValue: 435000, pnl: 12.5, ltvRatio: 58 },
      { user: 'Priya Patel', fund: 'SBI Bluechip', qty: 850, currentValue: 292000, pnl: 8.2, ltvRatio: 62 },
      { user: 'Amit Kumar', fund: 'ICICI Technology', qty: 2100, currentValue: 695000, pnl: 18.7, ltvRatio: 72 },
      { user: 'Sneha Reddy', fund: 'Axis ELSS', qty: 1800, currentValue: 338000, pnl: -2.1, ltvRatio: 45 },
      { user: 'Vikram Singh', fund: 'Kotak Balanced', qty: 1500, currentValue: 495000, pnl: 14.3, ltvRatio: 65 },
      { user: 'Anjali Gupta', fund: 'Mirae Large Cap', qty: 980, currentValue: 402000, pnl: 9.8, ltvRatio: 55 },
    ],
    ltvDistribution: [
      { range: '< 50%', count: 85, color: '#10b981' },
      { range: '50-60%', count: 120, color: '#6366f1' },
      { range: '60-70%', count: 95, color: '#f59e0b' },
      { range: '70-75%', count: 42, color: '#ef4444' },
    ],
  };
};
