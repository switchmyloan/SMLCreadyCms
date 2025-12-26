// // SummaryCards.jsx
// import React from 'react';
// import { Users, CheckCircle, XCircle, TriangleAlert  } from 'lucide-react';

// const SummaryCards = ({ totalLeads, successCount, rejectCount, duplicateCount, loading }) => {
//   // ... (JSX implementation as provided in the previous response)
//   const cards = [
//     { 
//       title: "Total Logs", // Renamed for clarity in Logs view
//       value: totalLeads, 
//       icon: Users, 
//       color: "text-blue-600",
//       bg: "bg-blue-50"
//     },
//     { 
//       title: "Successful", 
//       value: successCount, 
//       icon: CheckCircle, 
//       color: "text-green-600",
//       bg: "bg-green-50"
//     },
//     { 
//       title: "Rejected", 
//       value: rejectCount, 
//       icon: XCircle, 
//       color: "text-red-600",
//       bg: "bg-red-50"
//     },
//      { 
//       title: "Duplicate", 
//       value: duplicateCount, 
//       icon: TriangleAlert, 
//       color: "text-yellow-600",
//       bg: "bg-yellow-50"
//     },
//   ];

//   const SkeletonCard = () => (
//     <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 animate-pulse">
//       <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
//       <div className="h-8 bg-gray-300 rounded w-3/4"></div>
//     </div>
//   );

//   return (
//     <div className="grid grid-cols-1 sm:grid-cols-4 lg:grid-cols-4 gap-4 mb-4">
//       {loading ? (
//         <>
//           <SkeletonCard />
//           <SkeletonCard />
//           <SkeletonCard />
//           <SkeletonCard />
//         </>
//       ) : (
//         cards.map((card) => (
//           <div 
//             key={card.title}
//             className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-200 transition duration-300 hover:shadow-md"
//           >
//             <div>
//               <p className="text-sm font-medium text-gray-500">{card.title}</p>
//               <p className="mt-1 text-2xl font-bold text-gray-900">
//                 {typeof card.value === 'number' ? card.value.toLocaleString() : 'N/A'}
//               </p>
//             </div>
//             <div className={`p-3 rounded-full ${card.bg}`}>
//               <card.icon className={`${card.color}`} size={24} />
//             </div>
//           </div>
//         ))
//       )}
//     </div>
//   );
// };

// export default SummaryCards;


// SummaryCards.jsx
import React from 'react';
import { Users, CheckCircle, XCircle, TriangleAlert, ShieldOff, Clock, LineChart } from 'lucide-react';

// Mapping string names to actual Lucide icon components
const iconMap = {
  Users,
  CheckCircle,
  XCircle,
  TriangleAlert,
  ShieldOff,
  Clock,
  LineChart,
  // Add any other Lucide icons you might use in different modules
};

const SkeletonCard = () => (
  <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
    <div className="h-8 bg-gray-300 rounded w-3/4"></div>
  </div>
);

const SummaryCards = ({ metrics, loading }) => {
  // Ensure metrics is an array, default to 4 skeletons if metrics is empty but loading
  const skeletonCount = metrics.length > 0 ? metrics.length : 4;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 mb-4">
      {loading ? (
        <>
          {[...Array(skeletonCount)].map((_, i) => <SkeletonCard key={i} />)}
        </>
      ) : (
        metrics.map((card) => {
          const IconComponent = iconMap[card.icon]; // Resolve the icon string to a component

          return (
            <div 
              key={card.title}
              className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-200 transition duration-300 hover:shadow-md"
            >
              <div>
                <p className="text-sm font-medium text-gray-500">{card.title}</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {typeof card.value === 'number' ? card.value.toLocaleString() : 'N/A'}
                </p>
              </div>
              <div className={`p-3 rounded-full ${card.bg}`}>
                {IconComponent 
                  ? <IconComponent className={`${card.color}`} size={24} />
                  : <span className="text-gray-500">?</span> // Fallback for missing icon
                }
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default SummaryCards;