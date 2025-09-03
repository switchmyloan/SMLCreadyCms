// // src/components/Breadcrumb.jsx
// import React from "react";
// import { Link, useLocation } from "react-router-dom";
// import { Home, ChevronRight } from "lucide-react";

// export default function Breadcrumb() {
//   const location = useLocation();
//   const pathname = location.pathname;

//   const pathSegments = pathname.split("/").filter(Boolean);

//   // Special cases
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
//     <nav className="flex items-center text-sm bg-white px-4 py-2 shadow-sm border border-gray-100 pt-4">
//       <ol className="flex items-center space-x-2">
//         {/* Home */}
//         <li>
//           <Link
//             to="/"
//             className="flex items-center px-2 py-1 rounded-md text-gray-500 hover:text-primary hover:bg-gray-50 transition-colors"
//           >
//             <Home className="w-4 h-4" />
//           </Link>
//         </li>

//         {/* Dynamic pages */}
//         {pages.map((page, idx) => (
//           <li key={idx} className="flex items-center">
//             <ChevronRight className="w-4 h-4 text-gray-400" />
//             {page.current ? (
//               <span className="ml-1 font-semibold text-primary">
//                 {page.name}
//               </span>
//             ) : (
//               <Link
//                 to={page.href}
//                 className="ml-1 text-gray-600 hover:text-primary transition-colors"
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
import { routes } from "@routes/routes"; // your routes config

export default function Breadcrumb() {
  const location = useLocation();
  const pathname = location.pathname;

  // Find current route
  const currentRoute = routes.find((r) => r.path === pathname);

  let crumbs = [];
  if (currentRoute) {
    if (currentRoute.group) {
      // Find all routes in same group
      const groupRoutes = routes
        .filter((r) => r.group === currentRoute.group)
        .sort((a, b) => a.order - b.order); // keep order consistent

      const firstChild = groupRoutes[0];

      // Parent clickable (goes to first child)
      crumbs.push({
        name: currentRoute.group,
        href: firstChild?.path || null,
      });

      // Current child
      crumbs.push({ name: currentRoute.label, href: pathname });
    } else {
      // Non-grouped route
      crumbs.push({ name: currentRoute.label, href: pathname });
    }
  }

  return (
    <nav className="flex items-center text-sm bg-white px-4 py-2 shadow-sm border border-gray-100 pt-4">
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

        {/* Dynamic crumbs */}
        {crumbs.map((page, idx) => (
          <li key={idx} className="flex items-center">
            <ChevronRight className="w-4 h-4 text-gray-400" />
            {page.href ? (
              <Link
                to={page.href}
                className={`ml-1 ${
                  idx === crumbs.length - 1
                    ? "font-semibold text-primary"
                    : "text-gray-600 hover:text-primary"
                } transition-colors`}
              >
                {page.name}
              </Link>
            ) : (
              <span className="ml-1 font-semibold text-gray-800">
                {page.name}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
