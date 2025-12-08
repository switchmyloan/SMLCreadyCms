// src/pages/HomePage.jsx

import React, { useEffect, useState } from 'react';
import { Users, CheckCircle, PlusCircle, Lock } from 'lucide-react'; 
import DashboardCard from '../components/DashboardCard';
// Assuming PrincipalDonutChart and LoanAmountBarChart are available in this path
import { PrincipalDonutChart, LoanAmountBarChart } from '../components/DashboardChart'; 

// --- Data and Fetch function (As provided by you) ---
// Note: You must ensure this data structure is in a file that is NOT imported with type syntax.
export const dashboardSummaryData = {
    // ... (rest of the data structure remains the same)
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
    loanAmountBuckets: [
        { range: '0-50k', count: 1500 },
        { range: '50k-1L', count: 2200 },
        { range: '1L-5L', count: 3500 },
        { range: '5L+', count: 1800 },
    ],
};

const fetchDashboardData = () => {
    return new Promise((resolve) => {
        setTimeout(() => resolve(dashboardSummaryData), 500);
    });
};
// ---------------------------------------------------

const HomePage = () => {
    // Type annotations removed. useState is now pure JavaScript syntax.
    const [data, setData] = useState(null); 

    useEffect(() => {
        fetchDashboardData().then((result) => {
            // Type assertion removed. The component now trusts the result shape.
            setData(result); 
        });
    }, []);

    if (!data) {
        return <div className="p-8 text-center">Loading Dashboard...</div>;
    }

    // Object destructuring is safe and clean in JavaScript
    const { 
        kpis, 
        principalTypeDistribution, 
        loanAmountBuckets, 
        verificationStatus,
        principalSourceDistribution, 
        genderDistribution 
    } = data;

    // Assuming PrincipalDonutChart is a reusable component for distribution
    const DistributionChart = PrincipalDonutChart; 

    return (
        <div className=" bg-gray-50 min-h-screen">
            {/* <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard 📊</h1> */}
            
            {/* --- 1. KPI Cards Section --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <DashboardCard 
                    title="Total Principals"
                    value={kpis.totalPrincipals}
                    icon={<Users size={24} />}
                    color="text-blue-600"
                />
                <DashboardCard 
                    title="Active Principals"
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
                    title="Blocked Principals"
                    value={kpis.blockedPrincipals}
                    icon={<Lock size={24} />}
                    color="text-red-600"
                />
            </div>
            
            <hr className="my-6 border-gray-200" />

            {/* --- 2. Primary Distribution Charts (Row 1) --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 ">
                
                {/* 2a. Principal Type Distribution Chart */}
                <div className="col-span-1">
                    <DistributionChart 
                        data={principalTypeDistribution} 
                        title="Principal Type Distribution (Type)"
                    />
                </div>

                {/* 2b. Principal Source Distribution Chart */}
                <div className="col-span-1">
                    <DistributionChart 
                        data={principalSourceDistribution} 
                        title="Principal Source Distribution (Source)"
                    />
                </div>

                {/* 2c. Verification Status Distribution Chart */}
                <div className="col-span-1">
                    <DistributionChart 
                        data={verificationStatus} 
                        title="Verification Status Summary (Flags)"
                    />
                </div>
            </div>

            {/* --- 3. Secondary Charts (Row 2) --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">

                {/* 3a. Loan Amount Distribution Chart (Takes up 2 columns) */}
                <div className="col-span-2"> 
                    <LoanAmountBarChart data={loanAmountBuckets} />
                </div>

                {/* 3b. Gender Distribution Chart (Takes up 1 column) */}
                <div className="col-span-1">
                    <DistributionChart 
                        data={genderDistribution} 
                        title="Gender Distribution"
                    />
                </div>
            </div>
        </div>
    );
};

export default HomePage;