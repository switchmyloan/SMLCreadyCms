// eslint-disable-next-line no-unused-vars
import { CheckCircle2, Loader2, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../custom-hooks/useAuth";
import { UserService } from "../../custom-hooks";
import { useUpload } from "../../context/UploadContext";
import { trackLogout } from "../../services/activityTrackingService";

// Pick a stable gradient based on the name so each user gets a
// consistent colour. Light hash of the name maps to one of N palettes.
const AVATAR_PALETTES = [
  ["#6366f1", "#8b5cf6"], // indigo → violet
  ["#0ea5e9", "#06b6d4"], // sky    → cyan
  ["#10b981", "#14b8a6"], // emerald→ teal
  ["#f59e0b", "#f97316"], // amber  → orange
  ["#ec4899", "#f43f5e"], // pink   → rose
  ["#8b5cf6", "#d946ef"], // violet → fuchsia
];

const hashString = (str = "") => {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
};

const InitialAvatar = ({ name = "", email = "", size = 40 }) => {
  const trimmed = (name || "").trim();
  const initials = trimmed
    ? trimmed
        .split(/\s+/)
        .slice(0, 2)
        .map((p) => p[0])
        .join("")
        .toUpperCase()
    : (email || "U").charAt(0).toUpperCase();

  const seed = trimmed || email || "user";
  const [from, to] = AVATAR_PALETTES[hashString(seed) % AVATAR_PALETTES.length];

  return (
    <div
      className="rounded-full inline-flex items-center justify-center text-white font-semibold select-none leading-none tracking-tight"
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        fontSize: Math.round(size * 0.4),
        lineHeight: 1,
        background: `linear-gradient(135deg, ${from}, ${to})`,
        boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
      }}
      title={trimmed || email || "User"}
    >
      <span style={{ transform: "translateY(1px)" }}>{initials}</span>
    </div>
  );
};

function Navbar({ onToggleSidebar }) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { uploadStatus, globalProgress } = useUpload();
  const getUser = UserService.getUser();

  const handleLogout = async () => {
    // Track logout before clearing data
    await trackLogout();
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
          className="cursor-pointer rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-200"
        >
          <InitialAvatar
            name={getUser?.name}
            email={getUser?.email}
            size={36}
          />
        </div>
        <ul
          tabIndex={0}
          className="menu menu-sm dropdown-content mt-3 z-[1] p-4 shadow bg-white rounded-xl w-64 text-black"
        >
          {/* User avatar */}
          <div className="flex flex-col items-center justify-center text-center">
            <InitialAvatar
              name={getUser?.name}
              email={getUser?.email}
              size={64}
            />
            <p className="font-semibold mt-2">{getUser?.name}</p>
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