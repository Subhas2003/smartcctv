import { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function ResetPassword() {
  const cardRef = useRef(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    gsap.from(cardRef.current, {
      opacity: 0,
      scale: 0.9,
      duration: 0.6,
      ease: "power2.out",
    });

    if (!token) {
      setError("Invalid reset request: Token missing.");
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setError("Token is missing. Cannot reset password.");
      return;
    }

    if (!password || !confirm) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        setError(data.message || "Failed to reset password");
      }
    } catch (err) {
      setError("Server connection failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050d1f] to-[#020617] flex items-center justify-center px-6 text-white">
      <div
        ref={cardRef}
        className="w-full max-w-md bg-[#0f172a] border border-gray-700 rounded-2xl p-10 shadow-2xl m-20"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">New Password</h1>
          <p className="text-gray-400 mt-2">
            Enter your new secure password
          </p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm mb-6 text-center">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 p-3 rounded-lg text-sm mb-6 text-center">
            {message} <br />
            <span className="text-xs text-gray-400">Redirecting to sign-in page...</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Password */}
          <label className="text-sm text-gray-300 block mb-2">New Password</label>
          <div className="relative mb-5">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 pr-12 rounded-lg bg-[#020617] border border-gray-700 text-white focus:outline-none focus:border-cyan-500"
              disabled={loading || !token}
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400"
            >
              {showPassword ? "🙈" : "👁"}
            </span>
          </div>

          {/* Confirm Password */}
          <label className="text-sm text-gray-300 block mb-2">Confirm Password</label>
          <div className="relative mb-6">
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full px-4 py-3 pr-12 rounded-lg bg-[#020617] border border-gray-700 text-white focus:outline-none focus:border-cyan-500"
              disabled={loading || !token}
            />
            <span
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400"
            >
              {showConfirm ? "🙈" : "👁"}
            </span>
          </div>

          <button
            type="submit"
            className="w-full bg-cyan-500 hover:bg-cyan-600 transition py-3 rounded-lg font-semibold text-black cursor-pointer disabled:opacity-50"
            disabled={loading || !token}
          >
            {loading ? "Updating..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
