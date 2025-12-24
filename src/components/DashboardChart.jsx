import React from 'react';
import { 
    PieChart, Pie, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, Cell, ResponsiveContainer 
} from 'recharts';

// --- Generic Chart Wrapper Component ---
// This ensures all charts have a consistent title and height/shadow.
const ChartWrapper = ({ title, children }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 h-96">
    <h3 className="text-sm font-semibold text-gray-800 mb-4 border-b pb-2">{title}</h3>
    <div style={{ height: 'calc(100% - 40px)' }} className='text-xs'> 
        {/* Adjusted height to fit title/border */}
        {children}
    </div>
  </div>
);

// --- Reusable Donut Chart for Distribution Data ---
export const PrincipalDonutChart = ({ data, title }) => {
  // Use professional and distinct color palette
  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#6366F1']; 

  return (
    <ChartWrapper title={title}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            innerRadius={65} // Make the donut thicker
            outerRadius={95}
            paddingAngle={3}
            dataKey="value"
            nameKey="name"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          
          {/* Legend Fix: Place the legend at the bottom */}
          <Legend 
            layout="horizontal" 
            verticalAlign="bottom" 
            align="center" 
            wrapperStyle={{ paddingTop: '10px' }}
          />
          <Tooltip 
            formatter={(value) => [`${value.toLocaleString()} Principals`, 'Count']} // Better tooltip formatting
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
};

// Example Bar Chart for Loan Amount data (Keeping it for completeness)
export const LoanAmountBarChart = ({ data, title }) => (
    <ChartWrapper title={title}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <XAxis dataKey="range" stroke="#6b7280" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill="#4f46e5" name="Users Count" />
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );