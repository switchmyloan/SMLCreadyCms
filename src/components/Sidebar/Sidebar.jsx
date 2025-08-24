// import { Link } from 'react-router-dom';
// function Sidebar() {
//   return (
//     <div className="w-64 h-screen bg-gray-800 text-white fixed top-0 left-0">
//       <div className="p-4">
//         <h2 className="text-xl font-bold">Menu</h2>
//       </div>
//       <ul className="mt-4">
//         <li className="p-4 hover:bg-gray-700 cursor-pointer"><Link to="/">Dashboard</Link></li>
//         <li className="p-4 hover:bg-gray-700 cursor-pointer"><Link to="/blogs">Blogs</Link></li>
//       </ul>
//     </div>
//   );
// }

// export default Sidebar;


import { NavLink } from 'react-router-dom';

function Sidebar() {
  return (
    <div className="w-64 h-screen bg-gray-800 text-white fixed top-0 left-0">
      <div className="p-4">
        <h2 className="text-xl font-bold">Menu</h2>
      </div>
      <ul className="mt-4">
        <li>
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `block p-4 cursor-pointer ${
                isActive ? "bg-gray-600 font-semibold" : "hover:bg-gray-700"
              }`
            }
          >
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/blogs"
            className={({ isActive }) =>
              `block p-4 cursor-pointer ${
                isActive ? "bg-gray-600 font-semibold" : "hover:bg-gray-700"
              }`
            }
          >
            Blogs
          </NavLink>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;
