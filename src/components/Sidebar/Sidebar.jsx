// // Sidebar.jsx (updated with collapse feature)
// import { X, ChevronLeft, ChevronRight } from "lucide-react";
// import { NavLink } from "react-router-dom";
// import logo from "../../assets/cready.webp";
// import shortLogo from "../../assets/shortLogo.svg"
// import { routes } from "../../routes/routes";
// import { Home, FileText, Users, HelpCircle, Newspaper, MessageSquare } from "lucide-react";

// const ICONS = { Home, FileText, Users, HelpCircle, Newspaper, MessageSquare };

// function Sidebar({ onClose, collapsed, onToggleCollapse }) {
//   return (
//     <div
//       className={`h-full bg-white text-gray-700 flex flex-col shadow-lg transition-all duration-300 ${collapsed ? "w-20" : "w-64"
//         }`}
//     >
//       {/* Header / Logo */}
//       <div className="p-[15px] flex justify-between items-center border-b border-gray-200">
//         {!collapsed ? (
//           <img src={logo} alt="Logo" className="w-28 h-auto" />
//         ) : (
//           // Small logo for collapsed state
//           <img src={shortLogo} alt="Logo" className="w-5 h-auto" />
//         )}
//         <div className="flex items-center gap-2">
//           <button
//             onClick={onToggleCollapse}
//             className="text-gray-500 hover:text-primary"
//           >
//             {collapsed ? <ChevronRight size={22} /> : <ChevronLeft size={22} />}
//           </button>

//           {/* Mobile close button */}
//           <button
//             onClick={onClose}
//             className="md:hidden text-gray-500 hover:text-primary"
//           >
//             <X size={22} />
//           </button>
//         </div>
//       </div>

//       {/* Nav Links */}
//       <ul className="mt-6 flex-1 px-3">
//         {routes
//           .filter((route) => route.showInSidebar)
//           .map((route) => {
//             const Icon = ICONS[route.icon];
//             return (
//               <li key={route.path} className="mb-2">
//                 <NavLink
//                   to={route.path}
//                   end={route.path === "/"}
//                   className={({ isActive }) =>
//                     `flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 font-medium ${isActive
//                       ? "bg-primary text-white shadow"
//                       : "text-gray-600 hover:bg-neutral hover:text-white"
//                     }`
//                   }
//                 >
//                   {Icon && <Icon size={18} />}
//                   {!collapsed && route.label}
//                 </NavLink>
//               </li>
//             );
//           })}
//       </ul>

//       {/* Footer */}
//       {!collapsed && (
//         <div className="p-4 text-xs text-gray-500 border-t border-gray-200">
//           © 2025 Cready CMS
//         </div>
//       )}
//     </div>
//   );
// }

// export default Sidebar;


import { X, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import React, { useState, useEffect } from "react";
import logo from "../../assets/cready.webp";
import shortLogo from "../../assets/shortLogo.svg";
import { Home, FileText, Users, HelpCircle, Newspaper, MessageSquare } from "lucide-react";
import { routes } from "../../routes/routes";

const ICONS = { Home, FileText, Users, HelpCircle, Newspaper, MessageSquare };

function Sidebar({ onClose, collapsed, onToggleCollapse }) {
  const location = useLocation();
  const [openGroup, setOpenGroup] = useState(null);

  // Close dropdown if location is not inside the group's children
  useEffect(() => {
    const currentRoute = routes.find((r) => r.path === location.pathname);
    if (currentRoute?.group) {
      setOpenGroup(currentRoute.group);
    } else {
      setOpenGroup(null);
    }
  }, [location.pathname]);

  // Group and sort routes
  const groupedRoutes = routes
    .filter((r) => r.showInSidebar)
    .sort((a, b) => a.order - b.order)
    .reduce((acc, route) => {
      if (route.group) {
        if (!acc[route.group]) acc[route.group] = [];
        acc[route.group].push(route);
      } else {
        acc[route.label] = route;
      }
      return acc;
    }, {});

  return (
    <div
      className={`h-full bg-white text-gray-700 flex flex-col shadow-lg transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Header */}
      <div className="p-[15px] flex justify-between items-center border-b border-gray-200">
        {!collapsed ? (
          <img src={logo} alt="Logo" className="w-28 h-auto" />
        ) : (
          <img src={shortLogo} alt="Logo" className="w-5 h-auto" />
        )}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleCollapse}
            className="text-gray-500 hover:text-primary"
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {collapsed ? <ChevronRight size={22} /> : <ChevronLeft size={22} />}
          </button>
          <button
            onClick={onClose}
            className="md:hidden text-gray-500 hover:text-primary"
            title="Close Sidebar"
          >
            <X size={22} />
          </button>
        </div>
      </div>

      {/* Nav Links */}
      <ul className="mt-6 flex-1 px-3 overflow-y-auto">
        {Object.entries(groupedRoutes).map(([key, value]) => {
          if (Array.isArray(value)) {
            // Group (Dropdown)
            const groupIcon = ICONS[value[0].icon] || HelpCircle; // Fallback icon
            return (
              <li key={key} className="mb-2">
                <button
                  onClick={() => setOpenGroup(openGroup === key ? null : key)}
                  className={`w-full flex items-center justify-between px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
                    openGroup === key
                      ? "bg-primary text-white shadow"
                      : "text-gray-600 hover:bg-neutral hover:text-white"
                  }`}
                  title={collapsed ? key : ""}
                >
                  <div className="flex items-center gap-3">
                    {groupIcon && React.createElement(groupIcon, { size: 18 })}
                    {!collapsed && key}
                  </div>
                  {!collapsed && <ChevronDown size={18} />}
                </button>

                {openGroup === key && !collapsed && (
                  <ul className="ml-10 mt-1 space-y-1">
                    {value.map((route) => (
                      <li key={route.path}>
                        <NavLink
                          to={route.path}
                          className={({ isActive }) =>
                            `block px-3 py-1.5 rounded-md text-sm ${
                              isActive
                                ? "bg-primary text-white"
                                : "text-gray-600 hover:bg-neutral hover:text-white"
                            }`
                          }
                        >
                          {route.label}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          } else {
            // Single (Non-grouped)
            const Icon = ICONS[value.icon] || HelpCircle; // Fallback icon
            return (
              <li key={value.path} className="mb-2">
                <NavLink
                  to={value.path}
                  end={value.path === "/"}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
                      isActive
                        ? "bg-primary text-white shadow"
                        : "text-gray-600 hover:bg-neutral hover:text-white"
                    }`
                  }
                  title={collapsed ? value.label : ""}
                >
                  {Icon && <Icon size={18} />}
                  {!collapsed && value.label}
                </NavLink>
              </li>
            );
          }
        })}
      </ul>

      {!collapsed && (
        <div className="p-4 text-xs text-gray-500 border-t border-gray-200">
          © 2025 Cready CMS
        </div>
      )}
    </div>
  );
}

export default Sidebar;