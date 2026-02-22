import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Mail, User, Lock, Loader2 } from "lucide-react";

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();

  if (isAuthenticated) {
    window.location.href = "/";
    return null;
  }

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Valid email is required";
    }
    if (!formData.username || formData.username.length < 3) {
      newErrors.username = "Username must be 3+ characters";
    }
    if (!formData.password || formData.password.length < 6) {
      newErrors.password = "Password must be 6+ characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      const res = await fetch("http://localhost:8080/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok && data.message === "Registration successful") {
        window.location.href = "/login";
      } else {
        setErrors({ submit: data.error || "Registration failed" });
      }
    } catch (error) {
      setErrors({ submit: "Server error. Try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-6 lg:p-8">
        <div className="max-w-sm w-full space-y-4">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-black mb-1">
              Create Account
            </h1>
            <p className="text-sm text-gray-600">Join DevGurukul</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Email */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-9 pr-3 py-2.5 text-sm border rounded-md focus:ring-1 focus:ring-blue-700 focus:border-blue-700 transition-all ${
                    errors.email
                      ? "border-red-400 bg-red-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  placeholder="your@email.com"
                />
              </div>
              {errors.email && (
                <p className="text-red-600 text-xs">{errors.email}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`w-full pl-9 pr-3 py-2.5 text-sm border rounded-md focus:ring-1 focus:ring-blue-700 focus:border-blue-700 transition-all ${
                    errors.username
                      ? "border-red-400 bg-red-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  placeholder="username"
                />
              </div>
              {errors.username && (
                <p className="text-red-600 text-xs">{errors.username}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-9 pr-3 py-2.5 text-sm border rounded-md focus:ring-1 focus:ring-blue-700 focus:border-blue-700 transition-all ${
                    errors.password
                      ? "border-red-400 bg-red-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="text-red-600 text-xs">{errors.password}</p>
              )}
            </div>

            {errors.submit && (
              <div className="p-2 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-700 text-xs text-center">
                  {errors.submit}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-700 hover:bg-blue-800 text-white py-2.5 px-4 rounded-md font-medium text-sm focus:ring-2 focus:ring-blue-700 focus:ring-offset-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <span>Sign Up</span>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-600">
              Already have account?{" "}
              <a
                href="/login"
                className="text-blue-700 hover:underline font-medium"
              >
                Log in
              </a>
            </p>
          </div>
        </div>
      </div>
      <div className="w-full lg:w-1/2 bg-linear-to-br from-blue-700 via-blue-800 to-gray-900  items-center justify-center p-12 hidden lg:flex">
        <div className="text-center text-white max-w-sm">
          <div className="w-20 h-20 bg-white/20 rounded-2xl mx-auto mb-6 flex items-center justify-center backdrop-blur-sm">
            <svg
              className="w-10 h-10"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4">Welcome to DevGurukul</h2>
          <p className="text-sm opacity-90 leading-relaxed">
            Join thousands of developers mastering coding skills with our
            comprehensive practice platform.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
