import { Menu } from "lucide-react";

function Navbar({ onToggleSidebar }) {
  return (
    <nav className="bg-white text-white px-4 py-2 border-b fixed top-0 left-0 w-full z-10 flex justify-between items-center transition-all duration-300 ease-in-out">
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
        <a href="#" className="text-xs sm:text-sm hover:text-gray-300 text-black">
          Login
        </a>
        <a href="#" className="text-xs sm:text-sm hover:text-gray-300 text-black">
          Signup
        </a>
        <img
        
          src="https://avatar.iran.liara.run/public/25"
          alt="profile"
          className="w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full border-2 border-gray-600"
        />
      </div>
    </nav>
  );
}

export default Navbar;