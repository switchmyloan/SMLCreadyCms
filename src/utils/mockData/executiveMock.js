const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const getExecutiveMockData = (period = 'this_month') => {
  const multiplier = period === 'ytd' ? 12 : period === 'this_quarter' ? 3 : 1;

  return {
    kpis: {
      revenue: { current: 45000000 * multiplier, previous: 38000000 * multiplier, change: 18.4 },
      disbursements: { current: 1250 * multiplier, previous: 1100 * multiplier, change: 13.6, amount: 125000000 * multiplier },
      activeUsers: { current: 15600, previous: 14200, change: 9.8 },
      conversionRate: { current: 12.5, previous: 11.2, change: 11.6 },
    },
    revenueTrend: months.map((month, i) => ({
      month,
      revenue: 28000000 + Math.floor(Math.random() * 20000000) + i * 1500000,
      target: 35000000 + i * 1000000,
    })),
    userFunnel: [
      { name: 'App Installs', value: 50000, color: '#6366f1' },
      { name: 'Registrations', value: 28000, color: '#8b5cf6' },
      { name: 'KYC Complete', value: 18000, color: '#a855f7' },
      { name: 'Loan Applied', value: 8500, color: '#3b82f6' },
      { name: 'Approved', value: 3200, color: '#10b981' },
      { name: 'Disbursed', value: 2800, color: '#059669' },
    ],
    monthlyDisbursements: months.map((month, i) => ({
      month,
      count: 800 + Math.floor(Math.random() * 500) + i * 40,
      amount: 80000000 + Math.floor(Math.random() * 50000000) + i * 4000000,
    })),
    insights: [
      { type: 'success', title: 'Top Lender', message: 'LendingKart approved 45% more leads this month, contributing ₹82L in disbursements.' },
      { type: 'warning', title: 'KYC Drop-off', message: 'PAN verification rate dropped 3.2% - 1,400 users stuck at this stage.' },
      { type: 'info', title: 'Revenue Milestone', message: 'Monthly revenue crossed ₹4.5 Cr for the first time this quarter.' },
      { type: 'success', title: 'MF Growth', message: 'SIP registrations up 22% MoM, 450 new SIPs started this month.' },
    ],
  };
};
