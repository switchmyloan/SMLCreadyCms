import { useState, useEffect, useMemo, useCallback } from 'react';
import { IndianRupee, Users, TrendingUp, Target, Lightbulb, AlertTriangle, Info, CheckCircle, RefreshCw, Download } from 'lucide-react';
import StatCard from '../../components/dashboard-pro/StatCard';
import TrendChart from '../../components/dashboard-pro/TrendChart';
import FunnelChart from '../../components/dashboard-pro/FunnelChart';
import SkeletonLoader from '../../components/dashboard-pro/SkeletonLoader';
import { getComprehensiveAnalytics, getLenderWiseLeads } from '../../api-services/Modules/DashboardApi';
import { getAllMFLoans } from '../../api-services/Modules/MutalFundApi';

const insightIcons = {
  success: CheckCircle,
  warning: AlertTriangle,
  info: Info,
};

const insightColors = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  warning: 'border-amber-200 bg-amber-50 text-amber-800',
  info: 'border-blue-200 bg-blue-50 text-blue-800',
};

const ExecutiveDashboard = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [lenderData, setLenderData] = useState(null);
  const [loansData, setLoansData] = useState(null);
  const [appMetrics, setAppMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const BASE_URL = import.meta.env.VITE_API_URL;

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [analyticsRes, lenderRes, loansRes, appMetricsRes] = await Promise.allSettled([
        getComprehensiveAnalytics(),
        getLenderWiseLeads(),
        getAllMFLoans(),
        fetch(`${BASE_URL}/public/admin/app-metrics`).then(r => r.json()),
      ]);

      if (analyticsRes.status === 'fulfilled' && analyticsRes.value?.data?.success) {
        setAnalyticsData(analyticsRes.value.data.data);
      }
      if (lenderRes.status === 'fulfilled' && lenderRes.value?.data?.success) {
        setLenderData(lenderRes.value.data.data);
      }
      if (loansRes.status === 'fulfilled') {
        const raw = loansRes.value?.data?.data?.data?.data?.data || loansRes.value?.data?.data?.data?.data || loansRes.value?.data?.data?.data || loansRes.value?.data?.data || [];
        setLoansData(Array.isArray(raw) ? raw : []);
      }
      if (appMetricsRes.status === 'fulfilled' && appMetricsRes.value?.success) {
        setAppMetrics(appMetricsRes.value);
      }

      if (analyticsRes.status === 'rejected' && lenderRes.status === 'rejected') {
        setError('Failed to fetch data from server');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  }, [BASE_URL]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Compute KPIs from real data
  const leads = analyticsData?.leads || {};
  const mf = analyticsData?.mutualFunds || {};
  const lenders = analyticsData?.lenders || lenderData || [];

  const totalLeads = leads.totalLeads || 0;
  const totalMfUsers = mf.totalMfUsers || 0;
  const totalLoans = Array.isArray(loansData) ? loansData.length : 0;

  const totalLoanAmount = useMemo(() => {
    if (!loansData?.length) return leads.totalLoanAmount || 0;
    return loansData.reduce((sum, loan) => sum + (Number(loan.loan_amount) || Number(loan.disbursement_amount) || 0), 0);
  }, [loansData, leads.totalLoanAmount]);

  const totalDisbursed = useMemo(() => {
    if (!loansData?.length) return 0;
    return loansData.reduce((sum, loan) => sum + (Number(loan.disbursement_amount) || 0), 0);
  }, [loansData]);

  // Conversion rate: leads that got approved/disbursed out of total
  const totalApproved = useMemo(() => {
    if (!Array.isArray(lenders)) return 0;
    return lenders.reduce((sum, l) => sum + (l.success || 0), 0);
  }, [lenders]);

  const conversionRate = totalLeads > 0 ? ((totalApproved / totalLeads) * 100) : 0;

  // App installs from real metrics
  const totalInstalls = appMetrics?.summary?.newInstalls || 0;

  // Daily leads trend
  const dailyLeadsTrend = useMemo(() => {
    if (!leads.dailyLeads?.length) return [];
    return leads.dailyLeads.slice(-30).map(item => ({
      date: new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      leads: item.count || 0,
    }));
  }, [leads.dailyLeads]);

  // Weekly leads trend for chart
  const weeklyTrend = useMemo(() => {
    if (!leads.weeklyLeads?.length) return [];
    return leads.weeklyLeads.map(item => ({
      week: `W${item.week}`,
      leads: item.count || 0,
    }));
  }, [leads.weeklyLeads]);

  // User funnel from real data
  const userFunnel = useMemo(() => {
    const installs = totalInstalls || totalLeads;
    const registered = totalLeads;
    const emailVerified = leads.verification?.emailVerified || 0;
    const phoneVerified = leads.verification?.phoneVerified || 0;
    const panVerified = leads.verification?.panVerified || 0;
    const approved = totalApproved;

    return [
      { name: 'App Installs', value: installs, color: '#6366f1' },
      { name: 'Registered', value: registered, color: '#8b5cf6' },
      { name: 'Email Verified', value: emailVerified, color: '#a855f7' },
      { name: 'Phone Verified', value: phoneVerified, color: '#3b82f6' },
      { name: 'PAN Verified', value: panVerified, color: '#10b981' },
      { name: 'Approved', value: approved, color: '#059669' },
    ].filter(s => s.value > 0);
  }, [totalInstalls, totalLeads, leads.verification, totalApproved]);

  // Lender performance chart data
  const lenderChartData = useMemo(() => {
    if (!Array.isArray(lenders) || !lenders.length) return [];
    return lenders
      .sort((a, b) => (b.totalLeads || 0) - (a.totalLeads || 0))
      .slice(0, 8)
      .map(l => ({
        name: l.lenderName || 'Unknown',
        Approved: l.success || 0,
        Rejected: l.rejected || 0,
      }));
  }, [lenders]);

  // Generate insights from real data
  const insights = useMemo(() => {
    const result = [];

    // Top lender insight
    if (Array.isArray(lenders) && lenders.length > 0) {
      const topLender = [...lenders].sort((a, b) => (b.success || 0) - (a.success || 0))[0];
      if (topLender) {
        const rate = topLender.totalLeads > 0 ? ((topLender.success / topLender.totalLeads) * 100).toFixed(1) : 0;
        result.push({
          type: 'success',
          title: 'Top Lender',
          message: `${topLender.lenderName} has the highest approvals (${topLender.success?.toLocaleString('en-IN')}) with ${rate}% success rate.`,
        });
      }
    }

    // MF users insight
    if (mf.totalMfUsers > 0) {
      const consentRate = mf.consentGiven > 0 ? ((mf.consentGiven / mf.totalMfUsers) * 100).toFixed(1) : 0;
      result.push({
        type: 'info',
        title: 'MF Users',
        message: `${mf.totalMfUsers.toLocaleString('en-IN')} MF users registered. ${consentRate}% gave consent.`,
      });
    }

    // Verification drop-off
    if (leads.verification) {
      const { total, emailVerified, panVerified } = leads.verification;
      if (total > 0 && panVerified < emailVerified) {
        const dropRate = (((emailVerified - panVerified) / emailVerified) * 100).toFixed(1);
        result.push({
          type: 'warning',
          title: 'KYC Drop-off',
          message: `${dropRate}% users drop off between email and PAN verification (${(emailVerified - panVerified).toLocaleString('en-IN')} users).`,
        });
      }
    }

    // Loan amount insight
    if (totalLoanAmount > 0) {
      result.push({
        type: 'success',
        title: 'Disbursement Volume',
        message: `Total loan amount: ₹${(totalLoanAmount / 10000000).toFixed(2)} Cr across ${totalLoans.toLocaleString('en-IN')} loans.`,
      });
    }

    // Today's leads
    if (leads.todayLeads > 0) {
      result.push({
        type: 'info',
        title: "Today's Activity",
        message: `${leads.todayLeads} new leads today. ${mf.todayMfUsers || 0} new MF users today.`,
      });
    }

    return result;
  }, [lenders, mf, leads, totalLoanAmount, totalLoans]);

  if (loading) {
    return (
      <div className="space-y-6 p-1">
        <SkeletonLoader variant="card" count={4} />
        <SkeletonLoader variant="chart" count={2} />
      </div>
    );
  }

  if (error && !analyticsData) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <p className="text-red-500 text-sm">{error}</p>
        <button onClick={fetchData} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-1">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Executive Overview</h1>
          <p className="text-sm text-gray-500 mt-1">Real-time business performance from live data</p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm disabled:opacity-50"
        >
          <RefreshCw size={14} className={`text-gray-500 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Loan Amount"
          value={totalLoanAmount}
          icon={IndianRupee}
          color="success"
          format="compact"
          subtitle={`${totalLoans} total loans`}
        />
        <StatCard
          title="Total Leads"
          value={totalLeads}
          icon={TrendingUp}
          color="primary"
          format="number"
          subtitle={`${leads.todayLeads || 0} today`}
        />
        <StatCard
          title="MF Users"
          value={totalMfUsers}
          icon={Users}
          color="purple"
          format="number"
          subtitle={`${mf.todayMfUsers || 0} today`}
        />
        <StatCard
          title="Approval Rate"
          value={conversionRate}
          icon={Target}
          color="warning"
          format="percentage"
          subtitle={`${totalApproved.toLocaleString('en-IN')} approved of ${totalLeads.toLocaleString('en-IN')}`}
        />
      </div>

      {/* App Install Stats (if available) */}
      {appMetrics?.summary && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <StatCard title="App Installs" value={appMetrics.summary.newInstalls} icon={Download} color="cyan" format="number" />
          <StatCard title="App Updates" value={appMetrics.summary.updates} icon={RefreshCw} color="primary" format="number" />
          <StatCard title="Uninstalls (New)" value={appMetrics.summary.uninstallsAfterInstall} icon={AlertTriangle} color="danger" format="number" />
          <StatCard title="Uninstalls (Update)" value={appMetrics.summary.uninstallsAfterUpdate} icon={AlertTriangle} color="warning" format="number" />
        </div>
      )}

      {/* Daily Leads Trend */}
      {dailyLeadsTrend.length > 0 && (
        <TrendChart
          title="Daily Leads Trend"
          subtitle="Lead registrations over the last 30 days"
          type="area"
          data={dailyLeadsTrend}
          xAxisKey="date"
          dataKeys={[
            { key: 'leads', name: 'Leads', color: '#6366f1' },
          ]}
          height="h-72"
        />
      )}

      {/* Two Column: Funnel + Lender Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {userFunnel.length > 0 && (
          <FunnelChart
            title="User Verification Funnel"
            stages={userFunnel}
            showPercentage={true}
          />
        )}
        {lenderChartData.length > 0 && (
          <TrendChart
            title="Lender Performance"
            subtitle="Approved vs rejected by lender"
            type="bar"
            data={lenderChartData}
            xAxisKey="name"
            dataKeys={[
              { key: 'Approved', name: 'Approved', color: '#10b981', stackId: 'a' },
              { key: 'Rejected', name: 'Rejected', color: '#ef4444', stackId: 'a' },
            ]}
            height="h-72"
          />
        )}
      </div>

      {/* Distribution Charts */}
      {(leads.incomeDistribution?.length > 0 || leads.jobTypeDistribution?.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {leads.incomeDistribution?.length > 0 && (
            <TrendChart
              title="Income Distribution"
              subtitle="Lead income brackets"
              type="bar"
              data={leads.incomeDistribution.map(d => ({ range: d.range, count: d.count }))}
              xAxisKey="range"
              dataKeys={[{ key: 'count', name: 'Users', color: '#8b5cf6' }]}
              height="h-64"
            />
          )}
          {leads.jobTypeDistribution?.length > 0 && (
            <TrendChart
              title="Employment Type"
              subtitle="Lead job type breakdown"
              type="bar"
              data={leads.jobTypeDistribution.map(d => ({ type: d.name, count: d.value }))}
              xAxisKey="type"
              dataKeys={[{ key: 'count', name: 'Users', color: '#06b6d4' }]}
              height="h-64"
            />
          )}
        </div>
      )}

      {/* Quick Insights */}
      {insights.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-semibold text-gray-800">Live Insights</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {insights.map((insight, i) => {
              const Icon = insightIcons[insight.type] || Info;
              return (
                <div
                  key={i}
                  className={`flex items-start gap-3 p-4 rounded-xl border ${insightColors[insight.type]}`}
                >
                  <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold">{insight.title}</p>
                    <p className="text-sm mt-0.5 opacity-80">{insight.message}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Lender Details Table */}
      {Array.isArray(lenders) && lenders.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h4 className="text-base font-semibold text-gray-800 mb-4">Lender-wise Breakdown</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Lender</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-600">Total Leads</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-600">Approved</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-600">Rejected</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-600">Success Rate</th>
                </tr>
              </thead>
              <tbody>
                {[...lenders].sort((a, b) => (b.totalLeads || 0) - (a.totalLeads || 0)).map((lender, i) => {
                  const rate = lender.totalLeads > 0 ? ((lender.success / lender.totalLeads) * 100).toFixed(1) : '0.0';
                  return (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-800">{lender.lenderName}</td>
                      <td className="text-right py-3 px-4 text-gray-600">{(lender.totalLeads || 0).toLocaleString('en-IN')}</td>
                      <td className="text-right py-3 px-4 text-emerald-600 font-medium">{(lender.success || 0).toLocaleString('en-IN')}</td>
                      <td className="text-right py-3 px-4 text-red-500">{(lender.rejected || 0).toLocaleString('en-IN')}</td>
                      <td className="text-right py-3 px-4">
                        <span className={`font-medium ${Number(rate) > 30 ? 'text-emerald-600' : Number(rate) > 15 ? 'text-amber-600' : 'text-red-500'}`}>
                          {rate}%
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
    </div>
  );
};

export default ExecutiveDashboard;
