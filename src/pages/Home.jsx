import { useEffect, useState } from 'react';
import { Users, CheckCircle, PlusCircle, Lock } from 'lucide-react'; 
import DashboardCard from '../components/DashboardCard';
import { PrincipalDonutChart, LoanAmountBarChart } from '../components/DashboardChart'; 
import { getSummary } from '../api-services/Modules/DashboardApi';



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
    // loanAmountBuckets: [
    //     { range: '0-50k', count: 1500 },
    //     { range: '50k-1L', count: 2200 },
    //     { range: '1L-5L', count: 3500 },
    //     { range: '5L+', count: 1800 },
    // ],
};



// ---------------------------------------------------

const HomePage = () => {
    const [data, setData] = useState(null); 
    // State for managing loading status
    const [isLoading, setIsLoading] = useState(true);
    // State for managing errors
    const [error, setError] = useState(null); 

    const fetchDashboardData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // ✅ API Call to your Interactor/Controller endpoint
            const response = await getSummary();
            
            // Assuming the API response structure is { data: { summary: DashboardSummary }, ... }
            const summaryData = response.data.data.summary; 
            
            setData(summaryData); 

        } catch (err) {
            console.error("Failed to fetch dashboard data:", err);
            setError("Could not load dashboard data. Please try again.");
            setData(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    if (isLoading) {
        // Updated loading state
        return <div className="p-8 text-center text-xl font-semibold">
            <p>📊 Loading IAM Dashboard Data...</p>
        </div>;
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

    // Normalize and aggregate genderDistribution
const normalizedGenderDistribution = genderDistribution
    .reduce((acc, curr) => {
        // Normalize name to title case
        const name = curr.name.toLowerCase() === "male" ? "Male" :
                     curr.name.toLowerCase() === "female" ? "Female" :
                     "Unspecified";

        // Check if entry already exists
        const existing = acc.find(item => item.name === name);
        if (existing) {
            existing.value += curr.value;
        } else {
            acc.push({ name, value: curr.value });
        }

        return acc;
    }, []);

    // Assuming PrincipalDonutChart is a reusable component for distribution
    const DistributionChart = PrincipalDonutChart; 

    return (
        <div className=" bg-gray-50 min-h-screen">
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
            
            <hr className="my-6 border-gray-200" />

            {/* --- 2. Primary Distribution Charts (Row 1) --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 ">
                
                {/* 2a. Principal Type Distribution Chart */}
                {/* <div className="col-span-1">
                    <DistributionChart 
                        data={principalTypeDistribution} 
                        title="Principal Type Distribution (Type)"
                    />
                </div> */}

                {/* 2b. Principal Source Distribution Chart */}
                {/* <div className="col-span-1">
                    <DistributionChart 
                        data={principalSourceDistribution} 
                        title="Principal Source Distribution (Source)"
                    />
                </div> */}

                {/* 2c. Verification Status Distribution Chart */}
                {/* <div className="col-span-1">
                    <DistributionChart 
                        data={verificationStatus} 
                        title="Verification Status Summary (Flags)"
                    />
                </div> */}
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
                        data={normalizedGenderDistribution} 
                        title="Gender Distribution"
                    />
                </div>
            </div>

             {/* --- Lender-wise Leads Table --- */}
      {/* <div className="mt-8 bg-white shadow rounded p-4">
        <h2 className="text-xl font-semibold mb-4">Lender-wise Leads</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Lender</th>
                <th className="px-4 py-2 text-right">Total Leads</th>
                <th className="px-4 py-2 text-right">Success</th>
                <th className="px-4 py-2 text-right">Rejected</th>
                <th className="px-4 py-2 text-right">Success Rate</th>
              </tr>
            </thead>
            <tbody>
              {lenderWiseLeads && lenderWiseLeads.map((lender, idx) => {
                const total = lender.success + lender.rejected;
                const successRate = total ? ((lender.success / total) * 100).toFixed(1) : "0";
                return (
                  <tr key={idx} className="border-t">
                    <td className="px-4 py-2">{lender.lenderName}</td>
                    <td className="px-4 py-2 text-right">{lender.totalLeads}</td>
                    <td className="px-4 py-2 text-right">{lender.success}</td>
                    <td className="px-4 py-2 text-right">{lender.rejected}</td>
                    <td className="px-4 py-2 text-right">{successRate}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div> */}
        </div>
    );
};

export default HomePage;


// const HomePage = () =>{
//     const navigate = useNavigate()

//     useEffect( () =>{
//   navigate('/leads')
//     },[]) 
  
// return(
//     <></>
// )
// }
// export default HomePage;