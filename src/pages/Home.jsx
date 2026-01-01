import { useEffect, useState } from 'react';
import { Users, CheckCircle, PlusCircle, Lock } from 'lucide-react';
import DashboardCard from '../components/DashboardCard';
import { PrincipalDonutChart, LoanAmountBarChart } from '../components/DashboardChart';
import { getSummary } from '../api-services/Modules/DashboardApi';
import { format } from 'date-fns';
import LenderWiseDashboard from './LenderLeadsTable';
import SourceDistributionChart from './SourceDistributionChart';
import GenderDistributionChart from './GenderDistributionChart';



export const dashboardSummaryData = {

    kpis: { totalPrincipals: 12500, activePrincipals: 1200, newThisMonth: 450, blockedPrincipals: 60 },
    verificationStatus: [
        { name: 'Email Verified', value: 8500 },
        { name: 'Phone Verified', value: 6100 },
        { name: 'PAN Verified', value: 1000 },
        { name: 'Not Verified', value: 2400 },
    ],
    principalTypeDistribution: [
        { name: 'Individual', value: 7800 },
        { name: 'Corporate', value: 3200 },
        { name: 'Admin/Staff', value: 1500 },
    ],
    principalSourceDistribution: [
        { name: 'Mobile App', value: 6500 },
        { name: 'Web Portal', value: 3500 },
        { name: 'API Onboarding', value: 2000 },
        { name: 'Referral', value: 500 },
    ],
    genderDistribution: [
        { name: 'Male', value: 6800 },
        { name: 'Female', value: 4500 },
        { name: 'Other', value: 1200 },
    ],
};



const HomePage = () => {
    const [filterMode, setFilterMode] = useState('today');
    const d = format(new Date(), 'yyyy-MM-dd');

    const getYYYYMMDD = (date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    const [filterDates, setFilterDates] = useState({
        startDate: '',
        endDate: ''
    })
    const [data, setData] = useState(null);
    // State for managing loading status
    const [isLoading, setIsLoading] = useState(true);
    // State for managing errors
    const [error, setError] = useState(null);

    const calculateDashboardDateRange = () => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        if (filterMode === 'today') {
            const d = getYYYYMMDD(today);
            return { fromDate: d, toDate: d };
        }

        if (filterMode === 'yesterday') {
            const d = getYYYYMMDD(yesterday);
            return { fromDate: d, toDate: d };
        }

        return {
            fromDate: filterDates.startDate,
            toDate: filterDates.endDate
        };
    };


    const fetchDashboardData = async () => {
        setIsLoading(true);
        setError(null);

        const { fromDate, toDate } = calculateDashboardDateRange();

        if (!fromDate || !toDate) {
            setIsLoading(false);
            return;
        }

        try {
            const response = await getSummary({
                fromDate,
                toDate
            });

            setData(response.data.data.summary);
        } catch (err) {
            setError('Failed to load dashboard data');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, [filterMode, filterDates.startDate, filterDates.endDate]);

    if (isLoading) {
        // Updated loading state
        // return <div className="p-8 text-center text-xl font-semibold">
        //     <p>📊 Loading Dashboard Data...</p>
        // </div>;
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] w-full p-8 transition-all duration-500">
                <div className="relative flex items-center justify-center">
                    {/* Outer Rotating Glow */}
                    <div className="absolute w-24 h-24 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-full blur-xl opacity-20 animate-pulse"></div>

                    {/* The Spinner Ring */}
                    <div className="w-16 h-16 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>

                    {/* Center Icon */}
                    <div className="absolute text-2xl">📊</div>
                </div>

                {/* Text with Staggered Opacity */}
                <div className="mt-8 text-center space-y-2">
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight animate-pulse">
                        Analyzing your data...
                    </h2>
                    <p className="text-slate-500 font-medium max-w-xs mx-auto text-sm leading-relaxed">
                        We're gathering the latest metrics and generating your dashboard view.
                    </p>
                </div>

                {/* Dots Animation */}
                <div className="flex mt-6 space-x-1.5">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                </div>
            </div>
        );
    }

    if (error) {
        // Display error message if the API call failed
        return <div className="p-8 text-center text-red-600 border border-red-300 bg-red-50 m-4 rounded">
            {error}
        </div>;
    }


    const {
        kpis,
        principalTypeDistribution,
        loanAmountBuckets,
        verificationStatus,
        principalSourceDistribution,
        genderDistribution,
        lenderWiseLeads
    } = data;

    return (
        <div className=" bg-gray-50 min-h-screen">
            <h2 className="text-lg font-bold text-gray-700 mb-4">
                Dashboard Filters
            </h2>
            <div className="flex flex-wrap gap-6 mb-4">

                {['today', 'yesterday', 'range'].map(mode => (
                    <label key={mode} className="flex items-center gap-2 text-sm font-medium">
                        <input
                            type="radio"
                            name="dashboardFilter"
                            value={mode}
                            checked={filterMode === mode}
                            onChange={() => {
                                setFilterMode(mode);
                                if (mode !== 'range') {
                                    setFilterDates({ startDate: '', endDate: '' });
                                }
                            }}
                        />
                        {mode === 'today' && 'Today'}
                        {mode === 'yesterday' && 'Yesterday'}
                        {mode === 'range' && 'Date Range'}
                    </label>
                ))}

            </div>

            {/* Date range inputs */}
            {filterMode === 'range' && (
                <div className="flex flex-wrap gap-4 mb-4">
                    <input
                        type="date"
                        value={filterDates.startDate}
                        onChange={e =>
                            setFilterDates({ ...filterDates, startDate: e.target.value })
                        }
                        className="border rounded px-3 py-2 text-sm"
                    />
                    <input
                        type="date"
                        value={filterDates.endDate}
                        onChange={e =>
                            setFilterDates({ ...filterDates, endDate: e.target.value })
                        }
                        className="border rounded px-3 py-2 text-sm"
                    />
                </div>
            )}
            {/* <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard 📊</h1> */}

            {/* --- 1. KPI Cards Section --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <DashboardCard
                    title="Total Users"
                    value={kpis.totalPrincipals}
                    icon={<Users size={24} />}
                    color="text-blue-600"
                />
                <DashboardCard
                    title="Active Users"
                    value={kpis.activePrincipals}
                    icon={<CheckCircle size={24} />}
                    color="text-green-600"
                />
                <DashboardCard
                    title="New This Month"
                    value={kpis.newThisMonth}
                    icon={<PlusCircle size={24} />}
                    color="text-purple-600"
                />
                <DashboardCard
                    title="Blocked users"
                    value={kpis.blockedPrincipals}
                    icon={<Lock size={24} />}
                    color="text-red-600"
                />
            </div>

            {/* --- 3. Secondary Charts (Row 2) --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">

                {/* 3a. Loan Amount Distribution Chart (Takes up 2 columns) */}
                <div className="col-span-2">
                    <SourceDistributionChart principalSourceDistribution={principalSourceDistribution} />
                </div>

                {/* 3b. Gender Distribution Chart (Takes up 1 column) */}
                <div className="col-span-1">
                    <GenderDistributionChart genderDistribution={genderDistribution} />
                </div>
            </div>
            <LenderWiseDashboard lenderWiseLeads={lenderWiseLeads} />

        </div>
    );
};

export default HomePage;
