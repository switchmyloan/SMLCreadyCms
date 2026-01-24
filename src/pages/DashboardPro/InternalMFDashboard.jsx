import { useState, useEffect, useMemo, useCallback } from 'react';
import { Wallet, IndianRupee, FileText, Percent, Target, RefreshCw } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import StatCard from '../../components/dashboard-pro/StatCard';
import TrendChart from '../../components/dashboard-pro/TrendChart';
import SkeletonLoader from '../../components/dashboard-pro/SkeletonLoader';
import { getAllInternalMFUsers } from '../../api-services/Modules/MutalFundApi';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6'];

const InternalMFDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('loans');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllInternalMFUsers();
      const data = res?.data?.data?.data || res?.data?.data || res?.data || [];
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      setError('Failed to fetch internal MF data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Compute all metrics from users data
  const metrics = useMemo(() => {
    if (!users.length) return null;

    let totalPortfolioValue = 0;
    let totalLoans = 0;
    let activeLoans = 0;
    let totalDisbursedAmount = 0;
    let totalLoanAmount = 0;
    let successLoans = 0;
    let rejectedLoans = 0;
    let pendingLoans = 0;
    let usersWithPortfolio = 0;
    let totalPortfolioItems = 0;
    const allLoans = [];
    const allPortfolios = [];
    const ltvValues = [];
    const monthlyLoans = {};
    const roiValues = [];

    users.forEach(user => {
      // Portfolio calculations
      const portfolios = user.portfolios || [];
      let userPortfolioValue = 0;
      if (portfolios.length > 0) {
        usersWithPortfolio++;
        totalPortfolioItems += portfolios.length;
        portfolios.forEach(p => {
          const value = (Number(p.price) || 0) * (Number(p.quantity) || 0);
          userPortfolioValue += value;
          allPortfolios.push({
            user: user.user?.name || 'Unknown',
            fund: p.fundName || p.schemeName || 'MF Fund',
            qty: Number(p.quantity) || 0,
            currentValue: value,
            pnl: p.pnlPercentage || p.pnl || 0,
            ltvRatio: 0, // Will be calculated below
          });
        });
      }
      totalPortfolioValue += userPortfolioValue;

      // Loan calculations
      const loans = user.loanCreation || [];
      totalLoans += loans.length;
      loans.forEach(loan => {
        const disbursedAmt = Number(loan.disburshmentAmount || loan.disbursement_amount) || 0;
        const loanAmt = Number(loan.loan_amount) || disbursedAmt;
        totalDisbursedAmount += disbursedAmt;
        totalLoanAmount += loanAmt;

        const status = String(loan.status_xid || loan.status || '');
        if (status === '2' || status === 'Success' || status === 'Active') {
          successLoans++;
          activeLoans++;
        } else if (status === '3' || status === 'Rejected') {
          rejectedLoans++;
        } else {
          pendingLoans++;
        }

        const roi = Number(loan.rateOfInterest || loan.interest_rate) || 0;
        if (roi > 0) roiValues.push(roi);

        // LTV calculation: loan amount / portfolio value
        if (userPortfolioValue > 0 && disbursedAmt > 0) {
          const ltv = (disbursedAmt / userPortfolioValue) * 100;
          ltvValues.push(ltv);
        }

        // Monthly loan tracking
        const createdAt = loan.createdAt || user.createdAt;
        if (createdAt) {
          const month = new Date(createdAt).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
          monthlyLoans[month] = (monthlyLoans[month] || 0) + 1;
        }

        allLoans.push({
          id: loan._id || loan.id || Math.random(),
          user: user.user?.name || 'Unknown',
          amount: disbursedAmt,
          tenure: loan.tenure || '-',
          roi: roi,
          status: status === '2' || status === 'Success' || status === 'Active' ? 'Active'
            : status === '3' || status === 'Rejected' ? 'Rejected'
            : 'Pending',
          date: createdAt ? new Date(createdAt).toLocaleDateString('en-IN') : '-',
          ltv: userPortfolioValue > 0 ? ((disbursedAmt / userPortfolioValue) * 100).toFixed(1) : 0,
        });
      });
    });

    const avgLTV = ltvValues.length > 0 ? ltvValues.reduce((a, b) => a + b, 0) / ltvValues.length : 0;
    const avgROI = roiValues.length > 0 ? roiValues.reduce((a, b) => a + b, 0) / roiValues.length : 0;

    // LTV Distribution buckets
    const ltvDistribution = [
      { range: '< 30%', count: 0, color: '#10b981' },
      { range: '30-50%', count: 0, color: '#6366f1' },
      { range: '50-70%', count: 0, color: '#f59e0b' },
      { range: '> 70%', count: 0, color: '#ef4444' },
    ];
    ltvValues.forEach(ltv => {
      if (ltv < 30) ltvDistribution[0].count++;
      else if (ltv < 50) ltvDistribution[1].count++;
      else if (ltv < 70) ltvDistribution[2].count++;
      else ltvDistribution[3].count++;
    });

    // Monthly loan disbursements for chart
    const loanDisbursements = Object.entries(monthlyLoans)
      .map(([month, count]) => ({ month, count }))
      .slice(-12);

    // Targets based on actual data
    const targets = [
      { metric: 'Portfolio Value', target: totalPortfolioValue * 1.2, actual: totalPortfolioValue, unit: 'currency' },
      { metric: 'Active Loans', target: Math.max(totalLoans * 1.1, totalLoans + 5), actual: activeLoans, unit: 'number' },
      { metric: 'Avg LTV Ratio', target: 60, actual: avgLTV, unit: 'percentage' },
      { metric: 'Users with Portfolio', target: users.length, actual: usersWithPortfolio, unit: 'number' },
    ];

    return {
      totalPortfolioValue,
      totalLoans,
      activeLoans,
      totalDisbursedAmount,
      avgLTV,
      avgROI,
      usersWithPortfolio,
      successRate: totalLoans > 0 ? ((successLoans / totalLoans) * 100) : 0,
      ltvDistribution: ltvDistribution.filter(d => d.count > 0),
      loanDisbursements,
      targets,
      recentLoans: allLoans.slice(0, 20),
      portfolioHoldings: allPortfolios.slice(0, 20),
      loanStatusData: [
        { name: 'Active', value: successLoans, color: '#10b981' },
        { name: 'Pending', value: pendingLoans, color: '#f59e0b' },
        { name: 'Rejected', value: rejectedLoans, color: '#ef4444' },
      ].filter(s => s.value > 0),
    };
  }, [users]);

  const getStatusBadge = (actual, target) => {
    const pct = target > 0 ? (actual / target) * 100 : 0;
    if (pct >= 90) return { label: 'On Track', color: 'bg-emerald-50 text-emerald-700' };
    if (pct >= 70) return { label: 'At Risk', color: 'bg-amber-50 text-amber-700' };
    return { label: 'Behind', color: 'bg-red-50 text-red-700' };
  };

  const formatTargetValue = (value, unit) => {
    if (unit === 'currency') {
      if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
      if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
      return `₹${Math.round(value).toLocaleString('en-IN')}`;
    }
    if (unit === 'percentage') return `${Number(value).toFixed(1)}%`;
    return Math.round(value).toLocaleString('en-IN');
  };

  if (loading) {
    return (
      <div className="space-y-6 p-1">
        <SkeletonLoader variant="card" count={5} />
        <SkeletonLoader variant="chart" count={2} />
      </div>
    );
  }

  if (error && !users.length) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <p className="text-red-500 text-sm">{error}</p>
        <button onClick={fetchData} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700">Retry</button>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <p className="text-gray-500 text-sm">No internal MF data available</p>
        <button onClick={fetchData} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700">Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-1">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Internal MF Pro</h1>
          <p className="text-sm text-gray-500 mt-1">Portfolio, loans & performance tracking</p>
        </div>
        <button onClick={fetchData} disabled={loading} className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm disabled:opacity-50">
          <RefreshCw size={14} className={`text-gray-500 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Portfolio Value" value={metrics.totalPortfolioValue} icon={Wallet} color="primary" format="compact" />
        <StatCard title="Total Disbursed" value={metrics.totalDisbursedAmount} icon={IndianRupee} color="success" format="compact" />
        <StatCard title="Active Loans" value={metrics.activeLoans} icon={FileText} color="purple" format="number" subtitle={`${metrics.totalLoans} total`} />
        <StatCard title="Avg LTV Ratio" value={metrics.avgLTV} icon={Percent} color="warning" format="percentage" subtitle="Lower is safer" />
        <StatCard title="Success Rate" value={metrics.successRate} icon={Target} color="cyan" format="percentage" />
      </div>

      {/* Loan Disbursements + LTV Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {metrics.loanDisbursements.length > 0 && (
          <TrendChart
            title="Loan Disbursements"
            subtitle="Monthly loan count"
            type="bar"
            data={metrics.loanDisbursements}
            xAxisKey="month"
            dataKeys={[{ key: 'count', name: 'Loans', color: '#8b5cf6' }]}
            height="h-64"
          />
        )}
        {metrics.ltvDistribution.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h4 className="text-base font-semibold text-gray-800 mb-4">LTV Ratio Distribution</h4>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={metrics.ltvDistribution}
                    dataKey="count"
                    nameKey="range"
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={75}
                    label={({ range, count }) => `${range}: ${count}`}
                  >
                    {metrics.ltvDistribution.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Loan Status Pie */}
      {metrics.loanStatusData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h4 className="text-base font-semibold text-gray-800 mb-1">Loan Status Distribution</h4>
            <p className="text-sm text-gray-500 mb-4">Active vs Pending vs Rejected</p>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={metrics.loanStatusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={75}
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {metrics.loanStatusData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h4 className="text-base font-semibold text-gray-800 mb-4">Key Metrics</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-indigo-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Total Users</p>
                <p className="text-xl font-bold text-indigo-700">{users.length}</p>
              </div>
              <div className="text-center p-4 bg-emerald-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">With Portfolio</p>
                <p className="text-xl font-bold text-emerald-700">{metrics.usersWithPortfolio}</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Avg ROI%</p>
                <p className="text-xl font-bold text-purple-700">{metrics.avgROI.toFixed(1)}%</p>
              </div>
              <div className="text-center p-4 bg-amber-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Avg LTV%</p>
                <p className="text-xl font-bold text-amber-700">{metrics.avgLTV.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance vs Targets */}
      {metrics.targets.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h4 className="text-base font-semibold text-gray-800 mb-4">Performance vs Targets</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Metric</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-600">Target</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-600">Actual</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-600">Achievement</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-600">Progress</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {metrics.targets.map((t, i) => {
                  const pct = t.target > 0 ? ((t.actual / t.target) * 100).toFixed(1) : 0;
                  const status = getStatusBadge(t.actual, t.target);
                  return (
                    <tr key={i} className="border-b border-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-800">{t.metric}</td>
                      <td className="text-right py-3 px-4 text-gray-600">{formatTargetValue(t.target, t.unit)}</td>
                      <td className="text-right py-3 px-4 font-medium text-gray-800">{formatTargetValue(t.actual, t.unit)}</td>
                      <td className="text-right py-3 px-4 font-medium text-indigo-600">{pct}%</td>
                      <td className="py-3 px-4">
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${Number(pct) >= 90 ? 'bg-emerald-500' : Number(pct) >= 70 ? 'bg-amber-500' : 'bg-red-500'}`}
                            style={{ width: `${Math.min(Number(pct), 100)}%` }}
                          />
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Transaction Tables */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="flex items-center gap-1 mb-4">
          <button
            onClick={() => setActiveTab('loans')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'loans' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Recent Loans
          </button>
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'portfolio' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Portfolio Holdings
          </button>
        </div>

        {activeTab === 'loans' && metrics.recentLoans.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-3 font-semibold text-gray-600">User</th>
                  <th className="text-right py-3 px-3 font-semibold text-gray-600">Amount</th>
                  <th className="text-left py-3 px-3 font-semibold text-gray-600">Tenure</th>
                  <th className="text-right py-3 px-3 font-semibold text-gray-600">ROI%</th>
                  <th className="text-center py-3 px-3 font-semibold text-gray-600">Status</th>
                  <th className="text-left py-3 px-3 font-semibold text-gray-600">Date</th>
                  <th className="text-right py-3 px-3 font-semibold text-gray-600">LTV%</th>
                </tr>
              </thead>
              <tbody>
                {metrics.recentLoans.map((loan) => (
                  <tr key={loan.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-3 font-medium text-gray-800">{loan.user}</td>
                    <td className="text-right py-3 px-3 text-gray-600">₹{loan.amount.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 text-gray-600">{loan.tenure}</td>
                    <td className="text-right py-3 px-3 text-gray-600">{loan.roi}%</td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        loan.status === 'Active' ? 'bg-emerald-50 text-emerald-700' :
                        loan.status === 'Rejected' ? 'bg-red-50 text-red-700' :
                        'bg-amber-50 text-amber-700'
                      }`}>
                        {loan.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-gray-500">{loan.date}</td>
                    <td className="text-right py-3 px-3">
                      <span className={`font-medium ${Number(loan.ltv) > 70 ? 'text-red-600' : Number(loan.ltv) > 60 ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {loan.ltv}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'portfolio' && metrics.portfolioHoldings.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-3 font-semibold text-gray-600">User</th>
                  <th className="text-left py-3 px-3 font-semibold text-gray-600">Fund</th>
                  <th className="text-right py-3 px-3 font-semibold text-gray-600">Qty</th>
                  <th className="text-right py-3 px-3 font-semibold text-gray-600">Current Value</th>
                  <th className="text-right py-3 px-3 font-semibold text-gray-600">P&L %</th>
                </tr>
              </thead>
              <tbody>
                {metrics.portfolioHoldings.map((holding, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-3 font-medium text-gray-800">{holding.user}</td>
                    <td className="py-3 px-3 text-gray-600">{holding.fund}</td>
                    <td className="text-right py-3 px-3 text-gray-600">{holding.qty.toLocaleString('en-IN')}</td>
                    <td className="text-right py-3 px-3 text-gray-800 font-medium">₹{holding.currentValue.toLocaleString('en-IN')}</td>
                    <td className="text-right py-3 px-3">
                      <span className={`font-medium ${holding.pnl >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {holding.pnl >= 0 ? '+' : ''}{holding.pnl}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'loans' && metrics.recentLoans.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-8">No loan data available</p>
        )}
        {activeTab === 'portfolio' && metrics.portfolioHoldings.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-8">No portfolio data available</p>
        )}
      </div>
    </div>
  );
};

export default InternalMFDashboard;
