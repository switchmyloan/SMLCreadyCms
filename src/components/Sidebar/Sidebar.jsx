
  import { NavLink } from "react-router-dom";
  import logo from "../../assets/cready.webp";
  import { routes } from "../../routes/routes";
  import { X } from "lucide-react";

  import { Home, FileText, Users, HelpCircle, Newspaper  } from "lucide-react";

  const ICONS = { Home, FileText, Users, HelpCircle, Newspaper };


  function Sidebar({ onClose }) {
    return (
      <div className="w-64 h-full bg-white text-gray-700 flex flex-col shadow-lg">
        {/* Header / Logo */}
        <div className="p-[15px] flex justify-between items-center border-b border-gray-200 text-center">
          <img src={logo} alt="Logo" className="w-28 h-auto text-center" />
        
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
                        : "text-gray-600 hover:bg-neutral hover:text-white"
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
