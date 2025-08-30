import { useEffect, useState } from "react";
import logo from "../../assets/cready.webp"
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../custom-hooks/useAuth"

function LoginPage() {

  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // 🔹 Dummy user and token
    const dummyToken = "dummy_access_token_12345";
    const dummyUser = {
      id: 1,
      name: "John Doe",
      email: formData.email,
    };

    // save in storage via useAuth
    login(dummyToken, dummyUser);

    // redirect to home page
    navigate("/");
  };

  // useEffect(() => {
  //   logout();
  // }, []);


  return (
    <div className="flex items-center justify-center min-h-screen 
                    bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-800 px-4">
      <div className="w-full max-w-md shadow-2xl bg-white rounded-2xl p-8">
        <div className="mb-6 flex justify-center">
          <img src={logo} alt="" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Email</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="input input-bordered w-full"

            />
          </div>

          {/* Password */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Password</span>
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="input input-bordered w-full"

            />
            {/* <label className="label">
              <a href="#" className="label-text-alt link link-hover">
                Forgot password?
              </a>
            </label> */}
          </div>

          {/* Remember me */}
          <div className="form-control">
            <label className="cursor-pointer flex items-center gap-2">
              <input type="checkbox" className="checkbox checkbox-primary" />
              <span className="label-text">Remember me</span>
            </label>
          </div>

          {/* Login Button */}
          <button type="submit" className="btn btn-primary w-full">
            Login
          </button>
        </form>

        {/* Signup link */}
        {/* <p className="mt-6 text-center text-sm">
          Don’t have an account?{" "}
          <a href="#" className="link link-primary">
            Sign up
          </a>
        </p> */}
      </div>
    </div>
  );
}

export default LoginPage;