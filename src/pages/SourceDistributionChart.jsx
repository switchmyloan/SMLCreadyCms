import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";


const mapSourceXID = (xid) => {
  if (xid === 1) return "Mobile App";
  if (xid === 2) return "Web";
  return "Unknown";
};
// Color palette
const COLORS = ["#10B981","#3B82F6", , "#FBBF24"]; // Blue, Green, Yellow

const SourceDistributionChart = ({ principalSourceDistribution = []}) => {
      const formattedData = principalSourceDistribution.map((item) => {
    let xid = 0;
    // Extract XID number from "Source XID: 1" format
    if (item.name && item.name.includes(":")) {
      xid = Number(item.name.split(":")[1].trim());
    }
    return {
      name: mapSourceXID(xid),
      value: item.value,
    };
  });
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">App vs Web Users</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={formattedData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill="#8884d8"
            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
          >
            {formattedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [value, "Leads"]} />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SourceDistributionChart;
