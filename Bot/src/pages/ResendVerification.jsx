import { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { Link, useNavigate } from "react-router-dom";

export default function ResendVerification() {
  const cardRef = useRef(null);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    gsap.from(cardRef.current, {
      opacity: 0,
      scale: 0.9,
      duration: 0.6,
      ease: "power2.out",
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");
    setPreviewUrl("");

    try {
      const res = await fetch(`${API_URL}/auth/resend-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || "Verification code sent successfully.");
        if (data.previewUrl) {
          setPreviewUrl(data.previewUrl);
        }
        const previewParam = data.previewUrl ? `&previewUrl=${encodeURIComponent(data.previewUrl)}` : "";
        setTimeout(() => {
          navigate(`/verify-otp?email=${encodeURIComponent(email)}&flow=signup${previewParam}`);
        }, 1500);
      } else {
        setError(data.message || "Failed to resend verification email.");
      }
    } catch (err) {
      setError("Server connection failed. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="min-h-screen bg-gradient-to-b from-[#ADAAF7] via-[#BEC3FF] to-[#D9F9DF] flex items-center justify-center px-6">

  <div
    ref={cardRef}
    className="w-full max-w-md bg-white/50 backdrop-blur-sm border border-white/40 rounded-3xl p-10 shadow-2xl"
  >

    <div className="text-center mb-8">
      <h1 className="text-3xl font-bold text-slate-900">
        Resend Verification
      </h1>

      <p className="text-slate-600 mt-2">
        Enter your email to receive a new verification link
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
      </div>
    )}

    {previewUrl && (
      <div className="bg-cyan-500/10 border border-cyan-400 text-cyan-700 p-4 rounded-lg text-sm mb-6 text-center">
        <p className="font-semibold mb-1">
          🧪 Test Environment Mail Box:
        </p>

        <a
          href={previewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline font-bold hover:text-cyan-900"
        >
          Open Ethereal Mailbox →
        </a>
      </div>
    )}

    <form onSubmit={handleSubmit}>

      <label className="text-sm text-slate-700 block mb-2">
        Email Address
      </label>

      <input
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full mb-6 px-4 py-3 rounded-lg bg-white border border-slate-300 text-slate-800 focus:outline-none focus:border-cyan-500"
        disabled={loading}
      />

      <button
        type="submit"
        className="w-full bg-slate-900 hover:bg-slate-800 transition py-3 rounded-xl font-semibold text-white cursor-pointer disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Sending..." : "Send Verification Link"}
      </button>

    </form>

    <p className="text-center text-slate-600 text-sm mt-6">
      Remembered your password or already verified?{" "}
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
