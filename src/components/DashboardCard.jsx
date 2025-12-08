// src/components/DashboardCard.tsx

import React from 'react';

const DashboardCard = ({ title, value, icon, color }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h2 className={`text-4xl font-bold ${color} mt-1`}>{value.toLocaleString()}</h2>
        </div>
        <div className={`p-3 rounded-full ${color.replace('text-', 'bg-')} bg-opacity-10`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default DashboardCard;