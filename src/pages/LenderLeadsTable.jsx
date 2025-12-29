import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from "recharts";
const LenderWiseDashboard = ({lenderWiseLeads}) => {

    console.log(lenderWiseLeads, "fff")
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Lender-wise Leads Overview</h2>

      {/* --- Table --- */}
      <div className="overflow-x-auto mb-8">
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="py-3 px-4 text-left">Lender</th>
              <th className="py-3 px-4 text-right">Total Leads</th>
              <th className="py-3 px-4 text-right">Success</th>
              <th className="py-3 px-4 text-right">Rejected</th>
              <th className="py-3 px-4 text-right">Success Rate</th>
            </tr>
          </thead>
          <tbody>
            {lenderWiseLeads.map((lender) => (
              <tr key={lender.lenderId} className="border-b hover:bg-gray-50">
                <td className="py-2 px-4 font-medium">{lender.lenderName}</td>
                <td className="py-2 px-4 text-right">{lender.totalLeads}</td>
                <td className="py-2 px-4 text-right text-green-600">{lender.success}</td>
                <td className="py-2 px-4 text-right text-red-600">{lender.rejected}</td>
                <td className="py-2 px-4 text-right">{lender.successRate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- Bar Chart --- */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Success vs Rejected Leads</h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={lenderWiseLeads} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
            <XAxis dataKey="lenderName" angle={-30} textAnchor="end" interval={0} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="success" fill="#34D399" name="Success">
              <LabelList dataKey="success" position="top" />
            </Bar>
            <Bar dataKey="rejected" fill="#F87171" name="Rejected">
              <LabelList dataKey="rejected" position="top" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default LenderWiseDashboard;
