// function Sidebar() {
//   return (
//     <div className="w-64 h-screen bg-gray-800 text-white fixed">
//       <div className="p-4">
//         <h2 className="text-xl font-bold">Menu</h2>
//       </div>
//       <ul className="mt-4">
//         <li className="p-4 hover:bg-gray-700 cursor-pointer">Dashboard</li>
//         <li className="p-4 hover:bg-gray-700 cursor-pointer">Users</li>
//         <li className="p-4 hover:bg-gray-700 cursor-pointer">Settings</li>
//       </ul>
//     </div>
//   );
// }

// export default Sidebar;

import { Link } from 'react-router-dom';
function Sidebar() {
  return (
    <div className="w-64 h-screen bg-gray-800 text-white fixed top-0 left-0">
      <div className="p-4">
        <h2 className="text-xl font-bold">Menu</h2>
      </div>
      <ul className="mt-4">
        <li className="p-4 hover:bg-gray-700 cursor-pointer"><Link to="/">Dashboard</Link></li>
        <li className="p-4 hover:bg-gray-700 cursor-pointer"><Link to="/blogs">Blogs</Link></li>
      </ul>
    </div>
  );
}

export default Sidebar;