import { CheckCircle2, Loader2, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../custom-hooks/useAuth";
import { UserService } from "../../custom-hooks";
import { useUpload } from "../../context/UploadContext";

function Navbar({ onToggleSidebar }) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { uploadStatus, globalProgress } = useUpload();
  const getUser = UserService.getUser()
  console.log(getUser, "getUser>>>>>>>>")

  const handleLogout = () => {
    logout(); // clear token + user
    navigate("/login"); // redirect
  };

  return (
    <nav className="bg-white text-white px-4 py-2 border-b fixed top-0 left-0 w-full z-10 flex justify-between items-center transition-all duration-300 ease-in-out">

      <div className="flex items-center gap-2 sm:gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-1 sm:p-2 rounded-md hover:bg-blue-700 focus:outline-none text-blue-500"
          aria-label="Toggle sidebar"
        >
          <Menu size={18} sm:size={22} />
        </button>

        <h1 className="text-lg sm:text-xl md:text-2xl font-semibold tracking-wide">CMS Dashboard</h1>
      </div>

      {/* Navbar.jsx mein ye update kijiye */}
      <div className="flex items-center gap-4">
        {uploadStatus === 'processing' && (
          <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100 shadow-sm transition-all">
            <Loader2 size={14} className="animate-spin text-blue-600" />
            <span className="text-[10px] sm:text-xs font-bold text-blue-700 font-mono">
              SYNCING: {globalProgress}%
            </span>
          </div>
        )}

        {/* {uploadStatus === 'completed' && (
          <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full border border-green-100 shadow-sm animate-bounce">
            <CheckCircle2 size={14} className="text-green-600" />
            <span className="text-[10px] sm:text-xs font-bold text-green-700 uppercase">
              Sync Done
            </span>
          </div>
        )} */}
      </div>
      <div className="dropdown dropdown-end">
        <div
          tabIndex={0}
          role="button"
          className="btn btn-ghost btn-circle avatar"
        >
          <div className="w-10 rounded-full">
            <img
              src="https://avatar.iran.liara.run/public/25"
              alt="profile"
            />
          </div>
        </div>
        <ul
          tabIndex={0}
          className="menu menu-sm dropdown-content mt-3 z-[1] p-4 shadow bg-white rounded-xl w-64 text-black"
        >
          {/* User avatar */}
          <div className="flex flex-col items-center justify-center text-center">
            <img
              src="https://avatar.iran.liara.run/public/25"
              alt="profile"
              className="w-16 h-16 rounded-full mb-2"
            />
            <p className="font-semibold">{getUser?.name}</p>
            <p className="text-xs text-gray-500">{getUser?.email}</p>
          </div>

          <div className="divider my-2"></div>

          {/* Options */}
          <li>
            <a>Profile</a>
          </li>
          <li>
            <a>Settings</a>
          </li>
          <li>
            <button onClick={handleLogout}>Logout</button>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;