// import { NavLink } from 'react-router-dom';
// import logo from '../../assets/cready.webp'
// import { routes } from '../../routes/routes';


// function Sidebar() {
//   return (
//     <div className="w-64 h-screen bg-gray-800 text-white fixed top-0 left-0 ">
//       <div className="p-4  flex justify-center items-center border-b bottom-1 border-gray-700">
//         <img src={logo} alt="Logo" className="w-32 h-auto text-center " />
//       </div>
//       <ul className="mt-4 flex-1">
//         {routes
//         .filter(route => route.showInSidebar)
//         .map((route) => (
//           <li key={route.path} className="px-4 mb-2">
//             <NavLink
//               to={route.path}
//               end={route.path === "/"}
//               className={({ isActive }) =>
//                 `flex items-center gap-3 rounded-lg px-3 py-2 ${
//                   isActive
//                     ? "bg-indigo-600 text-white font-medium"
//                     : "text-gray-300 hover:bg-gray-700"
//                 }`
//               }
//             >
//               {route.label}
//             </NavLink>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }

// export default Sidebar;


import { NavLink } from "react-router-dom";
import logo from "../../assets/cready.webp";
import { routes } from "../../routes/routes";
import { X } from "lucide-react";

import { Home, FileText, Users } from "lucide-react";

const ICONS = { Home, FileText, Users };


function Sidebar({ onClose }) {
  return (
    <div className="w-64 h-full bg-white text-gray-700 flex flex-col shadow-lg">
      {/* Header / Logo */}
      <div className="p-6 flex justify-between items-center border-b border-gray-200">
        <img src={logo} alt="Logo" className="w-28 h-auto" />
        {/* Close button (mobile only) */}
        <button
          onClick={onClose}
          className="md:hidden text-gray-500 hover:text-primary"
        >
          <X size={22} />
        </button>
      </div>

      {/* Nav Links */}
      <ul className="mt-6 flex-1 px-3">
        {routes
          .filter((route) => route.showInSidebar)
          .map((route) => {
             const Icon = ICONS[route.icon]; 
            return(
            <li key={route.path} className="mb-2">
              <NavLink
                to={route.path}
                end={route.path === "/"}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
                    isActive
                      ? "bg-primary text-white shadow"
                      : "text-gray-600 hover:bg-primary-light hover:text-white"
                  }`
                }
              >
                {Icon && <Icon size={18} />}
                {route.label}
              </NavLink>
            </li>
          )})}
      </ul>

      {/* Footer */}
      <div className="p-4 text-xs text-gray-500 border-t border-gray-200">
        © 2025 Cready CMS
      </div>
    </div>
  );
}

export default Sidebar;
