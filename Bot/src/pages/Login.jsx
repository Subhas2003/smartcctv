import { useContext, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const cardRef = useRef(null);
  const { login, loginWithGoogle } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    gsap.from(cardRef.current, {
      opacity: 0,
      y: 40,
      duration: 0.8,
      ease: "power2.out",
    });
  }, []);

  // Initialize Google Sign-in button
  useEffect(() => {
    let resizeTimer;

    const renderGoogleBtn = () => {
      if (window.google) {
        const btnContainer = document.getElementById("google-signin-btn");
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
            { theme: "filled_blue", size: "large", width: String(btnWidth), text: "signin_with" }
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
        navigate("/camera"); //camera
      }
    } catch (err) {
      setError(err.message || "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await login(email, password);
      if (data && data.requiresOtp) {
        navigate(`/verify-otp?email=${encodeURIComponent(email)}&flow=login`);
      } else {
        navigate("/camera"); //camera
      }
    } catch (err) {
      setError(err.message || "Invalid email or password");
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
        Welcome Back
      </h1>

      <p className="text-slate-600 mt-2">
        Sign in to access your dashboard
      </p>
    </div>

    {error && (
      <div className="bg-red-500/10 border border-red-400 text-red-600 p-3 rounded-lg text-sm mb-6 text-center">
        {error}
      </div>
    )}

    <form onSubmit={handleLogin}>

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

      <input
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full mb-3 px-4 py-3 rounded-lg bg-white border border-slate-300 text-slate-800 focus:outline-none focus:border-cyan-500"
        disabled={loading}
      />

      <div className="flex justify-between mb-6">

        {/* <Link
          to="/resend-verification"
          className="text-cyan-600 text-sm hover:underline"
        >
          Resend verification?
        </Link> */}

        <Link
          to="/forgot-password"
          className="text-cyan-600 text-sm hover:underline"
        >
          Forgot password?
        </Link>

      </div>

      {/* LOGIN BUTTON */}
      <button
        type="submit"
        className="w-full bg-slate-900 hover:bg-slate-800 transition py-3 rounded-xl font-semibold text-white cursor-pointer disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Signing In..." : "Sign In →"}
      </button>

    </form>

    <div className="relative flex py-4 items-center">
      <div className="flex-grow border-t border-slate-300"></div>

      <span className="flex-shrink mx-4 text-slate-500 text-xs uppercase">
        Or
      </span>

      <div className="flex-grow border-t border-slate-300"></div>
    </div>

    {/* GOOGLE LOGIN */}
    <div className="flex flex-col gap-3 items-center justify-center w-full">
      <div
        id="google-signin-btn"
        className="w-full flex justify-center"
      ></div>
    </div>

    {/* Bottom Link */}
    <p className="text-center text-slate-600 text-sm mt-6">
      Don’t have an account?{" "}
      <Link
        to="/signup"
        className="text-cyan-600 hover:underline font-medium"
      >
        Sign up
      </Link>
    </p>

  </div>

</div>
  )
}

