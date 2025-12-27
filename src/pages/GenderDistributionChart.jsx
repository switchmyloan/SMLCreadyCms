import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

// Color palette
const COLORS = ["#3B82F6", "#EC4899", "#FBBF24", "#9CA3AF"]; // Blue = Male, Pink = Female, Yellow = Other, Gray = Unspecified

const GenderDistributionChart = ({ genderDistribution = [] }) => {
  // Normalize and aggregate values
  const normalizedData = genderDistribution.reduce((acc, curr) => {
    let name = "Unspecified";
    if (curr.name) {
      const lower = curr.name.toLowerCase();
      if (lower === "male") name = "Male";
      else if (lower === "female") name = "Female";
      else if (lower === "other") name = "Other";
    }

    const existing = acc.find(item => item.name === name);
    if (existing) {
      existing.value += curr.value; // sum duplicates
    } else {
      acc.push({ name, value: curr.value });
    }

    return acc;
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Users by Gender</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={normalizedData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill="#8884d8"
            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
          >
            {normalizedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [value, "Users"]} />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GenderDistributionChart;
