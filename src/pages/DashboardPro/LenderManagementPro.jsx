import { useState, useEffect, useMemo, useCallback } from 'react';
import { Send, CheckCircle, Clock, IndianRupee, Building2, RefreshCw } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import StatCard from '../../components/dashboard-pro/StatCard';
import TrendChart from '../../components/dashboard-pro/TrendChart';
import SkeletonLoader from '../../components/dashboard-pro/SkeletonLoader';
import { getComprehensiveAnalytics, getLenderWiseLeads } from '../../api-services/Modules/DashboardApi';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6'];

const LenderManagementPro = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [analyticsRes, lenderRes] = await Promise.allSettled([
        getComprehensiveAnalytics(),
        getLenderWiseLeads(),
      ]);

      let lenders = [];
      if (analyticsRes.status === 'fulfilled' && analyticsRes.value?.data?.success) {
        lenders = analyticsRes.value.data.data?.lenders || [];
        setAnalyticsData(analyticsRes.value.data.data);
      }
      if (lenderRes.status === 'fulfilled' && lenderRes.value?.data?.success) {
        const lenderWise = lenderRes.value.data.data;
        if (Array.isArray(lenderWise) && lenderWise.length > 0 && lenders.length === 0) {
          setAnalyticsData(prev => ({ ...prev, lenders: lenderWise }));
        }
      }

      if (analyticsRes.status === 'rejected' && lenderRes.status === 'rejected') {
        setError('Failed to fetch lender data');
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

  const lenders = useMemo(() => {
    const raw = analyticsData?.lenders || [];
    return raw.map(l => ({
      ...l,
      successRate: l.totalLeads > 0 ? ((l.success / l.totalLeads) * 100) : 0,
    })).sort((a, b) => (b.totalLeads || 0) - (a.totalLeads || 0));
  }, [analyticsData?.lenders]);

  // Aggregate KPIs
  const totalLeadsSent = useMemo(() => lenders.reduce((s, l) => s + (l.totalLeads || 0), 0), [lenders]);
  const totalApproved = useMemo(() => lenders.reduce((s, l) => s + (l.success || 0), 0), [lenders]);
  const totalRejected = useMemo(() => lenders.reduce((s, l) => s + (l.rejected || 0), 0), [lenders]);
  const overallApprovalRate = totalLeadsSent > 0 ? ((totalApproved / totalLeadsSent) * 100) : 0;
  const activeLendersCount = lenders.filter(l => (l.totalLeads || 0) > 0).length;

  // Rejection reasons from lead data (if available)
  const rejectionData = useMemo(() => {
    if (totalRejected === 0) return [];
    // Compute per-lender rejection share
    return lenders
      .filter(l => (l.rejected || 0) > 0)
      .map(l => ({
        reason: l.lenderName,
        count: l.rejected,
        percentage: totalRejected > 0 ? ((l.rejected / totalRejected) * 100).toFixed(1) : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [lenders, totalRejected]);

  // Chart: Approval vs Rejection by lender
  const lenderChartData = useMemo(() => {
    return lenders.slice(0, 10).map(l => ({
      name: l.lenderName || 'Unknown',
      Approved: l.success || 0,
      Rejected: l.rejected || 0,
    }));
  }, [lenders]);

  // Chart: Success rate comparison
  const successRateData = useMemo(() => {
    return lenders.slice(0, 10).map(l => ({
      name: l.lenderName || 'Unknown',
      'Success Rate': Number(l.successRate?.toFixed(1)) || 0,
    }));
  }, [lenders]);

  if (loading) {
    return (
      <div className="space-y-6 p-1">
        <SkeletonLoader variant="card" count={5} />
        <SkeletonLoader variant="chart" count={2} />
      </div>
    );
  }

  if (error && !analyticsData) {
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
          <h1 className="text-2xl font-bold text-gray-900">Lender Performance</h1>
          <p className="text-sm text-gray-500 mt-1">Real-time lender analytics from live data</p>
        </div>
        <button onClick={fetchData} disabled={loading} className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm disabled:opacity-50">
          <RefreshCw size={14} className={`text-gray-500 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Total Leads Sent" value={totalLeadsSent} icon={Send} color="primary" format="number" />
        <StatCard title="Total Approved" value={totalApproved} icon={CheckCircle} color="success" format="number" />
        <StatCard title="Approval Rate" value={overallApprovalRate} icon={Clock} color="warning" format="percentage" subtitle={`${totalRejected.toLocaleString('en-IN')} rejected`} />
        <StatCard title="Total Rejected" value={totalRejected} icon={IndianRupee} color="danger" format="number" />
        <StatCard title="Active Lenders" value={activeLendersCount} icon={Building2} color="cyan" format="number" />
      </div>

      {/* Approval vs Rejection by Lender */}
      {lenderChartData.length > 0 && (
        <TrendChart
          title="Approval vs Rejection by Lender"
          subtitle="Lead outcomes comparison (top lenders)"
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

      {/* Two Column: Success Rate + Rejection Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {successRateData.length > 0 && (
          <TrendChart
            title="Success Rate by Lender"
            subtitle="Approval percentage comparison"
            type="bar"
            data={successRateData}
            xAxisKey="name"
            dataKeys={[{ key: 'Success Rate', name: 'Success Rate %', color: '#6366f1' }]}
            height="h-72"
          />
        )}

        {/* Rejection Distribution Pie */}
        {rejectionData.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h4 className="text-base font-semibold text-gray-800 mb-1">Rejection Distribution</h4>
            <p className="text-sm text-gray-500 mb-4">Rejected leads by lender</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={rejectionData}
                    dataKey="count"
                    nameKey="reason"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ reason, percentage }) => `${percentage}%`}
                  >
                    {rejectionData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => v.toLocaleString('en-IN')} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Performance Table */}
      {lenders.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h4 className="text-base font-semibold text-gray-800 mb-4">Lender Performance Details</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">#</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Lender</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-600">Total Leads</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-600">Approved</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-600">Rejected</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-600">Success Rate</th>
                </tr>
              </thead>
              <tbody>
                {lenders.map((lender, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-400">{i + 1}</td>
                    <td className="py-3 px-4 font-medium text-gray-800">{lender.lenderName}</td>
                    <td className="text-right py-3 px-4 text-gray-600">{(lender.totalLeads || 0).toLocaleString('en-IN')}</td>
                    <td className="text-right py-3 px-4 text-emerald-600 font-medium">{(lender.success || 0).toLocaleString('en-IN')}</td>
                    <td className="text-right py-3 px-4 text-red-500">{(lender.rejected || 0).toLocaleString('en-IN')}</td>
                    <td className="text-right py-3 px-4">
                      <span className={`font-medium ${lender.successRate > 30 ? 'text-emerald-600' : lender.successRate > 15 ? 'text-amber-600' : 'text-red-500'}`}>
                        {lender.successRate.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default LenderManagementPro;
