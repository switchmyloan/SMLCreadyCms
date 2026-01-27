// // export default LoginPage;
// import { useEffect, useState } from "react";
// import logo from "../../assets/cready.webp";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../../custom-hooks/useAuth";

// function LoginPage() {
//   const { login, logout } = useAuth();
//   const navigate = useNavigate();
//   const [error, setError] = useState("");
//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//   });

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     // 🔹 Dummy user and token
//     const dummyToken = "dummy_access_token_12345";
//     const dummyUser = {
//       id: 1,
//       name: "John Doe",
//       email: "admin@gmail.com",
//       password: "admin@123",
//     };

//     const enteredEmail = (formData.email || "").trim().toLowerCase();
//     const expectedEmail = (dummyUser.email || "").trim().toLowerCase();
//     const enteredPassword = formData.password || "";

//     if (enteredEmail === expectedEmail && enteredPassword === dummyUser.password) {
//       // save in storage via useAuth
//       login(dummyToken, dummyUser);

//       // redirect to home page
//       navigate("/");
//     } else {
//       setError("Invalid email or password. Please try again.");
//     }

//   };

//   useEffect(() => {
//     logout();
//   }, []);

//   return (
//     <div
//       className="flex items-center justify-center min-h-screen 
//       bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 px-4"
//     >
//       {/* Login Card */}
//       <div className="w-full max-w-md shadow-xl bg-white/80 backdrop-blur-xl border border-white/40 rounded-2xl p-8">
//         {/* Logo */}
//         <div className="mb-6 flex justify-center">
//           <img src={logo} alt="Logo" className="w-32" />
//         </div>

//         {/* Form */}
//         <form onSubmit={handleSubmit} className="space-y-5">
//           {/* Email */}
//           <div className="form-control">
//             <label className="label">
//               <span className="label-text font-medium text-gray-700">Email</span>
//             </label>
//             <input
//               type="email"
//               name="email"
//               value={formData.email}
//               onChange={handleChange}
//               placeholder="Enter your email"
//               className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none transition"
//             />
//           </div>

//           {/* Password */}
//           <div className="form-control">
//             <label className="label">
//               <span className="label-text font-medium text-gray-700">Password</span>
//             </label>
//             <input
//               type="password"
//               name="password"
//               value={formData.password}
//               onChange={handleChange}
//               placeholder="Enter your password"
//               className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none transition"
//             />
//           </div>

//           {/* Remember me */}
//           {/* <div className="form-control flex items-center gap-2">
//             <input type="checkbox" className="w-4 h-4 text-indigo-500 border-gray-300 rounded focus:ring-indigo-400" />
//             <span className="text-gray-700">Remember me</span>
//           </div> */}

//           {error && (
//             <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>
//           )}
//           {/* Login Button */}
//           <button
//             type="submit"
//             className="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition duration-200 shadow-md"
//           >
//             Login
//           </button>
//         </form>

//         {/* Signup link */}
//         {/* <p className="mt-6 text-center text-sm text-gray-600">
//           Don’t have an account?{" "}
//           <a href="#" className="text-indigo-600 font-medium hover:underline">
//             Sign up
//           </a>
//         </p> */}
//       </div>
//     </div>
//   );
// }

// export default LoginPage;



import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../custom-hooks/useAuth";
import { Eye, EyeOff } from "lucide-react";
import { adminLogin } from "../../api-services/Modules/AdminRoleApi";

function LoginPage() {
  const { login, logout } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const email = formData.email.trim();
    const password = formData.password;

    if (!email || !password) {
      setError("Please enter both email and password");
      setIsLoading(false);
      return;
    }

    try {
      const response = await adminLogin(email, password);
      const { token, user, permissions } = response.data.data;

      // Store user with permissions and role info
      const userData = {
        ...user,
        permissions,
        role: user.role?.slug || user.role?.name || 'admin',
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
      };

      login(token, userData);
      navigate("/");
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Login failed. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => logout(), []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white w-96 p-6 rounded shadow-md space-y-4">
        <h2 className="text-2xl font-semibold">Login</h2>
        <input name="email" type="email" placeholder="Email" onChange={handleChange} value={formData.email} className="w-full p-2 border rounded"/>
        <div className="relative">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            onChange={handleChange}
            value={formData.password}
            className="w-full p-2 border rounded pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={isLoading}
          className="bg-indigo-600 w-full text-white p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

export default LoginPage;
