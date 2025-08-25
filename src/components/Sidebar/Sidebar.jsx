import { NavLink } from 'react-router-dom';
import logo from '../../assets/cready.webp'
import { routes } from '../../routes/routes';


function Sidebar() {
  return (
    <div className="w-64 h-screen bg-gray-800 text-white fixed top-0 left-0 ">
      <div className="p-4  flex justify-center items-center border-b bottom-1 border-gray-700">
        <img src={logo} alt="Logo" className="w-32 h-auto text-center " />
      </div>
      <ul className="mt-4 flex-1">
        {routes
        .filter(route => route.showInSidebar)
        .map((route) => (
          <li key={route.path} className="px-4 mb-2">
            <NavLink
              to={route.path}
              end={route.path === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 ${
                  isActive
                    ? "bg-indigo-600 text-white font-medium"
                    : "text-gray-300 hover:bg-gray-700"
                }`
              }
            >
              {route.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Sidebar;
