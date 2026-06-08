import { useEffect, useRef, useState, useContext } from "react";
import { gsap } from "gsap";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Signup() {
  const cardRef = useRef(null);
  const { signup, loginWithGoogle } = useContext(AuthContext);
  const navigate = useNavigate();

  // states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    gsap.from(cardRef.current, {
      opacity: 0,
      scale: 0.9,
      duration: 0.8,
      ease: "power2.out",
    });
  }, []);

  // Initialize Google Sign-in button for signup
  useEffect(() => {
    const initGoogle = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "mock-google-client-id",
          callback: handleGoogleLogin,
        });
        window.google.accounts.id.renderButton(
          document.getElementById("google-signup-btn"),
          { theme: "filled_blue", size: "large", width: "380", text: "signup_with" }
        );
      }
    };

    // Retry checking if google script is loaded
    const interval = setInterval(() => {
      if (window.google) {
        initGoogle();
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const handleGoogleLogin = async (response) => {
    setLoading(true);
    setError("");
    try {
      await loginWithGoogle(response.credential);
      navigate("/camera");
    } catch (err) {
      setError(err.message || "Google sign-up failed");
    } finally {
      setLoading(false);
    }
  };

  // email regex validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirm) {
      setError("Please fill in all fields");
      return;
    }

    if (!emailRegex.test(email)) {
      setError("Invalid email format");
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

    try {
      const data = await signup(name, email, password);
      const previewParam = data.previewUrl ? `&previewUrl=${encodeURIComponent(data.previewUrl)}` : "";
      navigate(`/verify-email?email=${encodeURIComponent(email)}${previewParam}`);
    } catch (err) {
      setError(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050d1f] to-[#020617] flex items-center justify-center px-6 text-white">
      <div
        ref={cardRef}
        className="w-full max-w-md bg-[#0f172a] border border-gray-700 rounded-2xl p-8 md:p-10 shadow-2xl  m-25"
      >
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Create Account</h1>
          <p className="text-gray-400 mt-2">Join the surveillance system</p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup}>
          {/* Name */}
          <label className="text-sm text-gray-300 block mb-2">Full Name</label>
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full mb-5 px-4 py-3 rounded-lg bg-[#020617] border border-gray-700 text-white focus:outline-none focus:border-cyan-500"
            disabled={loading}
          />

          {/* Email */}
          <label className="text-sm text-gray-300 block mb-2">Email Address</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mb-5 px-4 py-3 rounded-lg bg-[#020617] border border-gray-700 text-white focus:outline-none focus:border-cyan-500"
            disabled={loading}
          />

          {/* Password */}
          <label className="text-sm text-gray-300 block mb-2">Password</label>
          <div className="relative mb-5">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 pr-12 rounded-lg bg-[#020617] border border-gray-700 text-white focus:outline-none focus:border-cyan-500"
              disabled={loading}
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
              disabled={loading}
            />
            <span
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400"
            >
              {showConfirm ? "🙈" : "👁"}
            </span>
          </div>

          {/* CREATE ACCOUNT BUTTON */}
          <button
            type="submit"
            className="w-full bg-cyan-500 hover:bg-cyan-600 transition py-3 rounded-lg font-semibold text-black cursor-pointer disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account →"}
          </button>
        </form>

        <div className="relative flex py-4 items-center">
          <div className="flex-grow border-t border-gray-700"></div>
          <span className="flex-shrink mx-4 text-gray-500 text-xs uppercase">Or</span>
          <div className="flex-grow border-t border-gray-700"></div>
        </div>

        {/* GOOGLE SIGNUP */}
        <div className="flex flex-col gap-3 items-center justify-center w-full">
          <div id="google-signup-btn" className="w-full flex justify-center"></div>


        </div>

        {/* Bottom link */}
        <p className="text-center text-gray-400 text-sm mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-cyan-400 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

