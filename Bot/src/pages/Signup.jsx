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
    let resizeTimer;

    const renderGoogleBtn = () => {
      if (window.google) {
        const btnContainer = document.getElementById("google-signup-btn");
        if (btnContainer) {
          const parentWidth = btnContainer.parentElement?.clientWidth || 380;
          // Google's button API restricts width between 200px and 400px
          const btnWidth = Math.max(200, Math.min(parentWidth, 400));

          window.google.accounts.id.initialize({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "mock-google-client-id",
            callback: handleGoogleLogin,
          });
          window.google.accounts.id.renderButton(
            btnContainer,
            { theme: "filled_blue", size: "large", width: String(btnWidth), text: "signup_with" }
          );
        }
      }
    };

    // Retry checking if google script is loaded
    const interval = setInterval(() => {
      if (window.google) {
        renderGoogleBtn();
        clearInterval(interval);
      }
    }, 500);

    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        renderGoogleBtn();
      }, 200);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimer);
    };
  }, []);

  const handleGoogleLogin = async (response) => {
    setLoading(true);
    setError("");
    try {
      const data = await loginWithGoogle(response.credential);
      if (data && data.requiresOtp) {
        navigate(`/verify-otp?email=${encodeURIComponent(data.email)}&flow=google`);
      } else {
        navigate("/camera");
      }
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
      navigate(`/verify-otp?email=${encodeURIComponent(email)}&flow=signup${previewParam}`);
    } catch (err) {
      setError(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#ADAAF7] via-[#BEC3FF] to-[#D9F9DF] flex items-center justify-center px-6 mt-15">

  <div
    ref={cardRef}
    className="w-full max-w-md bg-white/50 backdrop-blur-sm border border-white/40 rounded-3xl p-6 sm:p-10 shadow-2xl my-8 mx-4"
  >

    {/* Title */}
    <div className="text-center mb-8">
      <h1 className="text-3xl font-bold text-slate-900">
        Create Account
      </h1>

      <p className="text-slate-600 mt-2">
        Join the surveillance system
      </p>
    </div>

    {error && (
      <div className="bg-red-500/10 border border-red-400 text-red-600 p-3 rounded-lg text-sm mb-6 text-center">
        {error}
      </div>
    )}

    <form onSubmit={handleSignup}>

      {/* Name */}
      <label className="text-sm text-slate-700 block mb-2">
        Full Name
      </label>

      <input
        type="text"
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full mb-5 px-4 py-3 rounded-lg bg-white border border-slate-300 text-slate-800 focus:outline-none focus:border-cyan-500"
        disabled={loading}
      />

      {/* Email */}
      <label className="text-sm text-slate-700 block mb-2">
        Email Address
      </label>

      <input
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full mb-5 px-4 py-3 rounded-lg bg-white border border-slate-300 text-slate-800 focus:outline-none focus:border-cyan-500"
        disabled={loading}
      />

      {/* Password */}
      <label className="text-sm text-slate-700 block mb-2">
        Password
      </label>

      <div className="relative mb-5">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 pr-12 rounded-lg bg-white border border-slate-300 text-slate-800 focus:outline-none focus:border-cyan-500"
          disabled={loading}
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
          disabled={loading}
        />

        <span
          onClick={() => setShowConfirm(!showConfirm)}
          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-slate-500"
        >
          {showConfirm ? "🙈" : "👁"}
        </span>
      </div>

      {/* CREATE ACCOUNT BUTTON */}
      <button
        type="submit"
        className="w-full bg-slate-900 hover:bg-slate-800 transition py-3 rounded-xl font-semibold text-white cursor-pointer disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Creating Account..." : "Create Account →"}
      </button>

    </form>

    <div className="relative flex py-4 items-center">
      <div className="flex-grow border-t border-slate-300"></div>

      <span className="flex-shrink mx-4 text-slate-500 text-xs uppercase">
        Or
      </span>

      <div className="flex-grow border-t border-slate-300"></div>
    </div>

    {/* GOOGLE SIGNUP */}
    <div className="flex flex-col gap-3 items-center justify-center w-full">
      <div
        id="google-signup-btn"
        className="w-full flex justify-center"
      ></div>
    </div>

    {/* Bottom Link */}
    <p className="text-center text-slate-600 text-sm mt-6">
      Already have an account?{" "}
      <Link
        to="/login"
        className="text-cyan-600 hover:underline font-medium"
      >
        Sign in
      </Link>
    </p>

  </div>

</div>
  );
}

