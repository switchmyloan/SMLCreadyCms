export const getAppStatsMockData = (period = 'this_month') => {
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(2026, 0, i + 1);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  });

  return {
    kpis: {
      installs: { current: 52000, previous: 45000, change: 15.5 },
      registrations: { current: 28000, previous: 24500, change: 14.2 },
      dau: { current: 3200, previous: 2900, change: 10.3 },
      mau: { current: 18500, previous: 16200, change: 14.1 },
      installToReg: { current: 53.8, previous: 54.4, change: -1.1 },
    },
    dailyGrowth: days.map((date) => ({
      date,
      installs: 1200 + Math.floor(Math.random() * 1000),
      registrations: 650 + Math.floor(Math.random() * 600),
    })),
    kycFunnel: [
      { name: 'Registered', value: 28000, color: '#6366f1' },
      { name: 'Email Verified', value: 22400, color: '#8b5cf6' },
      { name: 'Phone Verified', value: 19600, color: '#a855f7' },
      { name: 'PAN Verified', value: 14000, color: '#3b82f6' },
      { name: 'KYC Complete', value: 11200, color: '#10b981' },
    ],
    retention: [
      { day: 'Day 1', rate: 68 },
      { day: 'Day 7', rate: 42 },
      { day: 'Day 14', rate: 31 },
      { day: 'Day 30', rate: 22 },
    ],
    platformBreakdown: [
      { name: 'Android', value: 78, color: '#10b981' },
      { name: 'iOS', value: 22, color: '#6366f1' },
    ],
    weeklyGrowth: [
      { week: 'W1', current: 12500, previous: 11000 },
      { week: 'W2', current: 13200, previous: 11500 },
      { week: 'W3', current: 13800, previous: 11200 },
      { week: 'W4', current: 12500, previous: 11800 },
    ],
    utmSources: [
      { source: 'Google Ads', registrations: 8500, cost: 425000 },
      { source: 'Facebook', registrations: 5200, cost: 312000 },
      { source: 'Instagram', registrations: 3800, cost: 228000 },
      { source: 'Organic', registrations: 4500, cost: 0 },
      { source: 'Referral', registrations: 3200, cost: 96000 },
      { source: 'YouTube', registrations: 1800, cost: 180000 },
      { source: 'Others', registrations: 1000, cost: 85000 },
    ],
  };
};
