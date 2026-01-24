import { useState, useEffect, useMemo, useCallback } from 'react';
import { TrendingUp, BarChart3, UserPlus, Wallet, Percent, RefreshCw } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import StatCard from '../../components/dashboard-pro/StatCard';
import TrendChart from '../../components/dashboard-pro/TrendChart';
import FunnelChart from '../../components/dashboard-pro/FunnelChart';
import SkeletonLoader from '../../components/dashboard-pro/SkeletonLoader';
import { getComprehensiveAnalytics } from '../../api-services/Modules/DashboardApi';
import { getAllMFUsers, getAllMFLoans } from '../../api-services/Modules/MutalFundApi';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6'];

const MutualFundsDashboard = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [mfUsers, setMfUsers] = useState([]);
  const [mfLoans, setMfLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [analyticsRes, usersRes, loansRes] = await Promise.allSettled([
        getComprehensiveAnalytics(),
        getAllMFUsers(),
        getAllMFLoans(),
      ]);

      if (analyticsRes.status === 'fulfilled' && analyticsRes.value?.data?.success) {
        setAnalyticsData(analyticsRes.value.data.data);
      }
      if (usersRes.status === 'fulfilled') {
        const users = usersRes.value?.data?.data?.data || usersRes.value?.data?.data || [];
        setMfUsers(Array.isArray(users) ? users : []);
      }
      if (loansRes.status === 'fulfilled') {
        // Handle deeply nested loan response
        const loansData = loansRes.value?.data?.data?.data?.data?.data
          || loansRes.value?.data?.data?.data?.data
          || loansRes.value?.data?.data?.data
          || loansRes.value?.data?.data
          || [];
        setMfLoans(Array.isArray(loansData) ? loansData : []);
      }

      if (analyticsRes.status === 'rejected' && usersRes.status === 'rejected') {
        setError('Failed to fetch mutual funds data');
      }
    } catch {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const mf = analyticsData?.mutualFunds || {};

  // KPI values
  const totalMfUsers = mf.totalMfUsers || 0;
  const todayMfUsers = mf.todayMfUsers || 0;
  const consentGiven = mf.consentGiven || 0;
  const usersWithPortfolio = mf.portfolio?.usersWithPortfolio || 0;
  const totalPortfolioValue = mf.portfolio?.totalValue || 0;
  const totalPortfolios = mf.portfolio?.totalPortfolios || 0;

  // Consent-to-Investment Rate
  const consentToInvestRate = consentGiven > 0 ? ((usersWithPortfolio / consentGiven) * 100) : 0;

  // SIP count from users data
  const sipCount = useMemo(() => {
    return mfUsers.filter(u => u.sipActive || u.sip_count > 0).length;
  }, [mfUsers]);

  // Daily MF users trend
  const dailyMfTrend = useMemo(() => {
    if (!mf.dailyMfUsers?.length) return [];
    return mf.dailyMfUsers.slice(-30).map(item => ({
      date: new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      users: item.count || 0,
    }));
  }, [mf.dailyMfUsers]);

  // Investment funnel from stage distribution
  const investmentFunnel = useMemo(() => {
    const stages = mf.stageDistribution || [];
    if (stages.length === 0) {
      // Build from available KPIs
      const funnel = [
        { name: 'Total MF Users', value: totalMfUsers, color: '#6366f1' },
        { name: 'Consent Given', value: consentGiven, color: '#8b5cf6' },
        { name: 'With Portfolio', value: usersWithPortfolio, color: '#10b981' },
      ];
      return funnel.filter(s => s.value > 0);
    }
    return stages.map((s, i) => ({
      name: s.name || s.stage || `Stage ${i + 1}`,
      value: s.count || s.value || 0,
      color: COLORS[i % COLORS.length],
    })).filter(s => s.value > 0);
  }, [mf.stageDistribution, totalMfUsers, consentGiven, usersWithPortfolio]);

  // KYC Statistics
  const kycData = useMemo(() => {
    const kyc = mf.kycStatistics || {};
    const stages = [
      { name: 'KYC Initiated', value: kyc.initiated || 0, color: '#6366f1' },
      { name: 'KYC Completed', value: kyc.completed || 0, color: '#10b981' },
      { name: 'KYC Pending', value: kyc.pending || 0, color: '#f59e0b' },
      { name: 'KYC Failed', value: kyc.failed || 0, color: '#ef4444' },
    ];
    return stages.filter(s => s.value > 0);
  }, [mf.kycStatistics]);

  // Top AMCs
  const topAmcData = useMemo(() => {
    if (!mf.topAmcs?.length) return [];
    return mf.topAmcs.map(amc => ({
      name: amc.name || amc.amcName || 'Unknown',
      aum: amc.aum || amc.totalValue || amc.count || 0,
    }));
  }, [mf.topAmcs]);

  // Investor demographics from mfUsers
  const investorDemographics = useMemo(() => {
    if (!mfUsers.length) return { ageGroups: [], incomeBrackets: [] };

    // Income brackets
    const incomeMap = {};
    mfUsers.forEach(u => {
      const income = Number(u.income) || 0;
      let bracket;
      if (income <= 300000) bracket = '< 3L';
      else if (income <= 500000) bracket = '3L - 5L';
      else if (income <= 1000000) bracket = '5L - 10L';
      else if (income <= 2000000) bracket = '10L - 20L';
      else bracket = '> 20L';
      incomeMap[bracket] = (incomeMap[bracket] || 0) + 1;
    });

    const incomeBrackets = Object.entries(incomeMap)
      .map(([range, count], i) => ({ range, count, color: COLORS[i % COLORS.length] }));

    // Job type distribution
    const jobMap = {};
    mfUsers.forEach(u => {
      const job = u.jobType || u.job_type || 'Unknown';
      jobMap[job] = (jobMap[job] || 0) + 1;
    });

    const jobTypes = Object.entries(jobMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    return { incomeBrackets, jobTypes };
  }, [mfUsers]);

  // Loan metrics
  const loanMetrics = useMemo(() => {
    if (!mfLoans.length) return { totalAmount: 0, avgAmount: 0, count: 0 };
    const totalAmount = mfLoans.reduce((sum, l) => sum + (Number(l.loan_amount || l.disbursement_amount) || 0), 0);
    return {
      totalAmount,
      avgAmount: mfLoans.length > 0 ? totalAmount / mfLoans.length : 0,
      count: mfLoans.length,
    };
  }, [mfLoans]);

  // Fund categories from portfolio data (if available)
  const fundCategories = useMemo(() => {
    // Use stage distribution as category proxy if available
    const stages = mf.stageDistribution || [];
    if (stages.length > 2) {
      return stages.map((s, i) => ({
        name: s.name || s.stage,
        value: s.count || s.value || 0,
        color: COLORS[i % COLORS.length],
      })).filter(s => s.value > 0);
    }
    return [];
  }, [mf.stageDistribution]);

  if (loading) {
    return (
      <div className="space-y-6 p-1">
        <SkeletonLoader variant="card" count={5} />
        <SkeletonLoader variant="chart" count={2} />
      </div>
    );
  }

  if (error && !analyticsData && !mfUsers.length) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <p className="text-red-500 text-sm">{error}</p>
        <button onClick={fetchData} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700">Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-1">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mutual Funds Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Portfolio health, investor metrics & fund performance</p>
        </div>
        <button onClick={fetchData} disabled={loading} className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm disabled:opacity-50">
          <RefreshCw size={14} className={`text-gray-500 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Total MF Users" value={totalMfUsers} icon={TrendingUp} color="primary" format="number" subtitle={`${todayMfUsers} today`} />
        <StatCard title="Consent Given" value={consentGiven} icon={BarChart3} color="success" format="number" />
        <StatCard title="With Portfolio" value={usersWithPortfolio} icon={UserPlus} color="purple" format="number" subtitle={`${totalPortfolios} portfolios`} />
        <StatCard title="Portfolio Value" value={totalPortfolioValue} icon={Wallet} color="warning" format="compact" />
        <StatCard title="Consent → Invest" value={consentToInvestRate} icon={Percent} color="cyan" format="percentage" />
      </div>

      {/* Daily MF Users Trend */}
      {dailyMfTrend.length > 0 && (
        <TrendChart
          title="Daily MF User Registrations"
          subtitle="New MF users over last 30 days"
          type="area"
          data={dailyMfTrend}
          xAxisKey="date"
          dataKeys={[{ key: 'users', name: 'New Users', color: '#6366f1' }]}
          height="h-72"
        />
      )}

      {/* Investment Funnel + KYC Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {investmentFunnel.length > 0 && (
          <FunnelChart
            title="Investment Funnel"
            stages={investmentFunnel}
            showPercentage={true}
          />
        )}
        {kycData.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h4 className="text-base font-semibold text-gray-800 mb-1">KYC Statistics</h4>
            <p className="text-sm text-gray-500 mb-4">User KYC status breakdown</p>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={kycData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={75}
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {kycData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Fund Categories + Income Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {fundCategories.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h4 className="text-base font-semibold text-gray-800 mb-4">Stage Distribution</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={fundCategories}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={80}
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {fundCategories.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {investorDemographics.incomeBrackets.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h4 className="text-base font-semibold text-gray-800 mb-4">Income Distribution</h4>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={investorDemographics.incomeBrackets}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" name="Users" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Job Type Distribution */}
      {investorDemographics.jobTypes.length > 0 && (
        <TrendChart
          title="Employment Type Distribution"
          subtitle="MF investor job type breakdown"
          type="bar"
          data={investorDemographics.jobTypes}
          xAxisKey="name"
          dataKeys={[{ key: 'value', name: 'Users', color: '#f59e0b' }]}
          height="h-64"
        />
      )}

      {/* Top AMCs */}
      {topAmcData.length > 0 && (
        <TrendChart
          title="Top AMCs"
          subtitle="Assets under management by fund house"
          type="bar"
          data={topAmcData}
          xAxisKey="name"
          dataKeys={[{ key: 'aum', name: 'AUM', color: '#6366f1' }]}
          height="h-64"
        />
      )}

      {/* Loan Summary */}
      {loanMetrics.count > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h4 className="text-base font-semibold text-gray-800 mb-4">MF Loan Summary</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-indigo-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Total Loans</p>
              <p className="text-2xl font-bold text-indigo-700">{loanMetrics.count.toLocaleString('en-IN')}</p>
            </div>
            <div className="text-center p-4 bg-emerald-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Total Amount</p>
              <p className="text-2xl font-bold text-emerald-700">₹{(loanMetrics.totalAmount / 100000).toFixed(1)}L</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Avg Loan Amount</p>
              <p className="text-2xl font-bold text-purple-700">₹{Math.round(loanMetrics.avgAmount).toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MutualFundsDashboard;
