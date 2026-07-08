import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthBrandPanel from "../components/AuthBrandPanel";

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await register(
        formData.name,
        formData.email,
        formData.password
      );

      if (user.role === "TEAM_MEMBER") {
        navigate("/team/dashboard");
      } else {
        navigate("/manager/dashboard");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      <AuthBrandPanel />

      <div className="w-full lg:w-1/2 min-h-screen flex items-center justify-center px-6 bg-slate-50">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-slate-100 px-10 py-9">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900">
              Create Account
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Sign up as a team member
            </p>
          </div>

          {error && (
            <div className="mb-5 bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="enter your name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-md px-4 py-3 text-sm focus:border-blue-500"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="enter your email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-md px-4 py-3 text-sm focus:border-blue-500"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="minimum 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full border border-slate-200 rounded-md px-4 py-3 text-sm pr-11 focus:border-blue-500"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white rounded-md py-3 text-sm font-semibold hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Sign up"}
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 font-semibold">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;