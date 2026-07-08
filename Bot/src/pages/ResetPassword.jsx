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
   <div className="min-h-screen bg-gradient-to-b from-[#ADAAF7] via-[#BEC3FF] to-[#D9F9DF] flex items-center justify-center px-6">

  <div
    ref={cardRef}
    className="w-full max-w-md bg-white/50 backdrop-blur-sm border border-white/40 rounded-3xl p-10 shadow-2xl m-20"
  >

    <div className="text-center mb-8">
      <h1 className="text-3xl font-bold text-slate-900">
        New Password
      </h1>

      <p className="text-slate-600 mt-2">
        Enter your new secure password
      </p>
    </div>

    {error && (
      <div className="bg-red-500/10 border border-red-400 text-red-600 p-3 rounded-lg text-sm mb-6 text-center">
        {error}
      </div>
    )}

    {message && (
      <div className="bg-emerald-500/10 border border-emerald-400 text-emerald-600 p-3 rounded-lg text-sm mb-6 text-center">
        {message}
        <br />
        <span className="text-xs text-slate-500">
          Redirecting to sign-in page...
        </span>
      </div>
    )}

    <form onSubmit={handleSubmit}>

      {/* Password */}
      <label className="text-sm text-slate-700 block mb-2">
        New Password
      </label>

      <div className="relative mb-5">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 pr-12 rounded-lg bg-white border border-slate-300 text-slate-800 focus:outline-none focus:border-cyan-500"
          disabled={loading || !token}
        />

        <span
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-slate-500"
        >
          {showPassword ? "🙈" : "👁"}
        </span>
      </div>

      {/* Confirm Password */}
      <label className="text-sm text-slate-700 block mb-2">
        Confirm Password
      </label>

      <div className="relative mb-6">
        <input
          type={showConfirm ? "text" : "password"}
          placeholder="••••••••"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full px-4 py-3 pr-12 rounded-lg bg-white border border-slate-300 text-slate-800 focus:outline-none focus:border-cyan-500"
          disabled={loading || !token}
        />

        <span
          onClick={() => setShowConfirm(!showConfirm)}
          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-slate-500"
        >
          {showConfirm ? "🙈" : "👁"}
        </span>
      </div>

      <button
        type="submit"
        className="w-full bg-slate-900 hover:bg-slate-800 transition py-3 rounded-xl font-semibold text-white cursor-pointer disabled:opacity-50"
        disabled={loading || !token}
      >
        {loading ? "Updating..." : "Reset Password"}
      </button>

    </form>

  </div>

</div>
  );
}
