import { X, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import React, { useState, useEffect } from "react";
import logo from "../../assets/cready.webp";
import shortLogo from "../../assets/shortLogo.svg";
import { 
  Home, 
  Users, 
  FileText, 
  HelpCircle, 
  Newspaper, 
  MessageSquare, 
  UserPlus, 
  UserMinus, 
  UserCheck, 
  Building2, 
  BookOpen, 
  ClipboardList, 
  ShieldCheck, 
  Settings 
} from "lucide-react";
import { routes } from "../../routes/routes";

const ICONS = { Home, FileText, Users, HelpCircle, Newspaper, MessageSquare,
   UserPlus, 
  UserMinus, 
  UserCheck, 
  Building2, 
  BookOpen, 
  ClipboardList, 
  ShieldCheck, 
  Settings 
 };

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

  // Group routes
const groupedRoutes = routes
  .filter((r) => r.showInSidebar)
  .reduce((acc, route) => {
    if (route.group) {
      if (!acc[route.group]) acc[route.group] = { order: route.groupOrder, items: [] };
      acc[route.group].items.push(route);
    } else {
      acc[route.label] = route;
    }
    return acc;
  }, {});

// Sort parent and children
const sortedGroupedRoutes = Object.entries(groupedRoutes)
  .sort(([keyA, valueA], [keyB, valueB]) => {
    const orderA = valueA.items ? valueA.order : valueA.order;
    const orderB = valueB.items ? valueB.order : valueB.order;
    return orderA - orderB;
  })
  .map(([key, value]) => {
    if (value.items) {
      return [key, value.items.sort((a, b) => a.order - b.order)];
    }
    return [key, value];
  });


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
        {sortedGroupedRoutes.map(([key, value]) => {
          if (Array.isArray(value)) {
            // Group (Dropdown)
            const groupIcon = ICONS[value[0].icon] || HelpCircle;
            return (
              <li key={key} className="mb-2">
                <button
                  onClick={() => setOpenGroup(openGroup === key ? null : key)}
                  className={`w-full flex items-center justify-between px-2 py-2 rounded-lg transition-all duration-200 font-medium ${
                    openGroup === key
                      ? "bg-gray-600 text-white shadow"
                      : "text-gray-600 hover:bg-gray-600 hover:text-white"
                  }`}
                  title={collapsed ? key : ""}
                >
                  <div className="flex items-center gap-2">
                    {groupIcon && React.createElement(groupIcon, { size: 16 })}
                    {!collapsed && key}
                  </div>
                  {!collapsed && <ChevronDown size={16} />}
                </button>

                {openGroup === key && !collapsed && (
                  <ul className="ml-2 mt-1 space-y-1">
                    {value.map((route) => {
                      const SubIcon = ICONS[route.icon] || HelpCircle;
                      return (
                        <li key={route.path}>
                          <NavLink
                            to={route.path}
                            className={({ isActive }) =>
                              `flex items-center gap-3 px-3 py-1.5 rounded-md text-sm ${
                                isActive
                                  ? "bg-primary text-white"
                                  : "text-gray-600 hover:bg-gray-600 hover:text-white"
                              }`
                            }
                          >
                            <SubIcon size={16} />
                            {route.label}
                          </NavLink>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          } else {
            // Single (Non-grouped)
            const Icon = ICONS[value.icon] || HelpCircle;
            return (
              <li key={value.path} className="mb-2">
                <NavLink
                  to={value.path}
                  end={value.path === "/"}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
                      isActive
                        ? "bg-primary text-white shadow"
                        : "text-gray-600 hover:bg-gray-600 hover:text-white"
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
