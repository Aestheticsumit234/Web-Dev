import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Mail, Lock, Loader2 } from "lucide-react";

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: "",
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
      const res = await fetch("http://localhost:8080/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok && data.message === "Login successful") {
        localStorage.setItem(
          "user",
          JSON.stringify({
            email: formData.email,
            userId: data.user?.id,
            username: data.user?.username,
          }),
        );
        login();
        window.location.href = "/";
      } else {
        setErrors({ submit: data.error || "Invalid credentials" });
      }
    } catch (error) {
      setErrors({ submit: "Server error. Try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
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
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4">Welcome Back</h2>
          <p className="text-sm opacity-90 leading-relaxed">
            Access your DevGurukul account to solve coding problems and track
            your progress.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-6 lg:p-8">
        <div className="max-w-sm w-full space-y-4">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-black mb-1">Sign In</h1>
            <p className="text-sm text-gray-600">Welcome back to DevGurukul</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
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
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="pt-4 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-600">
              Don't have account?{" "}
              <a
                href="/register"
                className="text-blue-700 hover:underline font-medium"
              >
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
