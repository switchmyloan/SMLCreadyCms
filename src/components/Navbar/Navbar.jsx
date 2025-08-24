


// // function Navbar() {
// //   return (
// //     <nav className="bg-blue-600 text-white p-4 shadow-md fixed top-0 left-64 w-[calc(100%-16rem)] z-10">
// //       <div className="flex justify-between items-center">
// //         <h1 className="text-2xl font-semibold">CMS Dashboard</h1>
// //         <div>
// //           <a href="#" className="mr-4 hover:text-gray-300">Login</a>
// //           <a href="#" className="hover:text-gray-300">Signup</a>
// //         </div>
// //       </div>
// //     </nav>
// //   );
// // }

// // export default Navbar;


// import { Menu } from "lucide-react"; // icon lib (lucide-react)

// function Navbar({ onToggleSidebar }) {
//   return (
//     <nav className="bg-blue-600 text-white px-6 py-3 shadow-md fixed top-0 left-64 w-[calc(100%-16rem)] z-10 flex justify-between items-center">
//       {/* Left section */}
//       <div className="flex items-center gap-4">
//         {/* Sidebar toggle (optional) */}
//         <button 
//           onClick={onToggleSidebar} 
//           className="p-2 rounded-md hover:bg-blue-700 focus:outline-none lg:hidden"
//         >
//           <Menu size={22} />
//         </button>

//         <h1 className="text-xl font-semibold tracking-wide">CMS Dashboard</h1>
//       </div>

//       {/* Right section */}
//       <div className="flex items-center gap-6">
//         <a href="#" className="hover:text-gray-300">Login</a>
//         <a href="#" className="hover:text-gray-300">Signup</a>
//         <img 
//           src="https://via.placeholder.com/35" 
//           alt="profile" 
//           className="w-9 h-9 rounded-full border-2 border-white"
//         />
//       </div>
//     </nav>
//   );
// }

// export default Navbar;



import { Menu } from "lucide-react";

function Navbar({ onToggleSidebar }) {
  return (
    <nav className="bg-blue-600 text-white px-4 py-2 shadow-md fixed top-0 left-0 w-full z-10 flex justify-between items-center transition-all duration-300 ease-in-out">
      {/* Left section */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Sidebar toggle (optional) */}
        <button
          onClick={onToggleSidebar}
          className="p-1 sm:p-2 rounded-md hover:bg-blue-700 focus:outline-none"
          aria-label="Toggle sidebar"
        >
          <Menu size={18} sm:size={22} />
        </button>

        <h1 className="text-lg sm:text-xl md:text-2xl font-semibold tracking-wide">CMS Dashboard</h1>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2 sm:gap-4">
        <a href="#" className="text-xs sm:text-sm hover:text-gray-300">
          Login
        </a>
        <a href="#" className="text-xs sm:text-sm hover:text-gray-300">
          Signup
        </a>
        <img
          src="https://via.placeholder.com/35"
          alt="profile"
          className="w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full border-2 border-white"
        />
      </div>
    </nav>
  );
}

export default Navbar;