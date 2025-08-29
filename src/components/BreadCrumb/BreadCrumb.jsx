// // src/components/Breadcrumb.jsx
// import React from "react";
// import { Link, useLocation } from "react-router-dom";
// import { Home, ChevronRight } from "lucide-react";


// export default function Breadcrumb() {
//   const mode = 'light'
//   const location = useLocation();
//   const pathname = location.pathname;

//   const pathSegments = pathname.split("/").filter(Boolean);

//   // Handle special cases
//   if (pathSegments.length === 2 && /^\d+$/.test(pathSegments[1])) {
//     pathSegments[1] = "Edit";
//   } else if (pathSegments.length === 2 && pathSegments[1] === "create") {
//     pathSegments[1] = "Create";
//   }

//   const pages = pathSegments.map((seg, idx) => ({
//     name: seg.charAt(0).toUpperCase() + seg.slice(1),
//     href: "/" + pathSegments.slice(0, idx + 1).join("/"),
//     current: idx === pathSegments.length - 1,
//   }));

//   return (
//     <nav className="flex items-center text-sm mb-10 bg-white px-4 py-2 rounded shadow">
//       <ol className="flex items-center space-x-2">
//         {/* Home */}
//         <li>
//           <Link
//             to="/"
//             className={`flex items-center p-1 rounded hover:bg-gray-100 ${
//               mode === "light"
//                 ? "text-gray-500 hover:text-gray-700"
//                 : "text-gray-300 hover:text-gray-100"
//             }`}
//           >
//             <Home className="w-4 h-4 mr-1" />
//           </Link>
//         </li>

//         {/* Dynamic pages */}
//         {pages.map((page, idx) => (
//           <li key={idx} className="flex items-center">
//             <ChevronRight className="w-4 h-4 text-gray-400" />
//             {page.current ? (
//               <span
//                 className="ml-1 font-medium text-gray-700"
//               >
//                 {page.name}
//               </span>
//             ) : (
//               <Link
//                 to={page.href}
//                 className="ml-1 text-gray-500 hover:text-gray-700"
//               >
//                 {page.name}
//               </Link>
//             )}
//           </li>
//         ))}
//       </ol>
//     </nav>
//   );
// }


// src/components/Breadcrumb.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, ChevronRight } from "lucide-react";

export default function Breadcrumb() {
  const location = useLocation();
  const pathname = location.pathname;

  const pathSegments = pathname.split("/").filter(Boolean);

  // Special cases
  if (pathSegments.length === 2 && /^\d+$/.test(pathSegments[1])) {
    pathSegments[1] = "Edit";
  } else if (pathSegments.length === 2 && pathSegments[1] === "create") {
    pathSegments[1] = "Create";
  }

  const pages = pathSegments.map((seg, idx) => ({
    name: seg.charAt(0).toUpperCase() + seg.slice(1),
    href: "/" + pathSegments.slice(0, idx + 1).join("/"),
    current: idx === pathSegments.length - 1,
  }));

  return (
    <nav className="flex items-center text-sm bg-white  rounded-lg px-4 py-2 shadow-sm border border-gray-100">
      <ol className="flex items-center space-x-2">
        {/* Home */}
        <li>
          <Link
            to="/"
            className="flex items-center px-2 py-1 rounded-md text-gray-500 hover:text-primary hover:bg-gray-50 transition-colors"
          >
            <Home className="w-4 h-4" />
          </Link>
        </li>

        {/* Dynamic pages */}
        {pages.map((page, idx) => (
          <li key={idx} className="flex items-center">
            <ChevronRight className="w-4 h-4 text-gray-400" />
            {page.current ? (
              <span className="ml-1 font-semibold text-primary">
                {page.name}
              </span>
            ) : (
              <Link
                to={page.href}
                className="ml-1 text-gray-600 hover:text-primary transition-colors"
              >
                {page.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
