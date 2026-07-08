import { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const cardRef = useRef(null);
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
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        if (data.previewUrl) {
          setPreviewUrl(data.previewUrl);
        }
      } else {
        setError(data.message || "Failed to send reset link");
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
    className="w-full max-w-md bg-white/70 backdrop-blur-md border border-white/50 rounded-2xl p-10 shadow-2xl"
  >
    <div className="text-center mb-8">
      <h1 className="text-3xl font-bold text-[#2F2B5A]">
        Reset Password
      </h1>
      <p className="text-[#5D5A86] mt-2">
        Enter your email to receive a password reset link
      </p>
    </div>

    {error && (
      <div className="bg-red-100 border border-red-300 text-red-700 p-3 rounded-lg text-sm mb-6 text-center">
        {error}
      </div>
    )}

    {message && (
      <div className="bg-green-100 border border-green-300 text-green-700 p-3 rounded-lg text-sm mb-6 text-center">
        {message}
      </div>
    )}

    {previewUrl && (
      <div className="bg-blue-100 border border-blue-300 text-blue-700 p-4 rounded-lg text-sm mb-6 text-center">
        <p className="font-semibold mb-1">
          🧪 Test Environment Mail Box:
        </p>
        <a
          href={previewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline font-bold hover:text-blue-900"
        >
          Open Ethereal Mailbox →
        </a>
      </div>
    )}

    <form onSubmit={handleSubmit}>
      <label className="text-sm text-[#4E4A75] block mb-2">
        Email Address
      </label>

      <input
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading}
        className="w-full mb-6 px-4 py-3 rounded-lg bg-white/80 border border-[#C7CBFF] text-[#2F2B5A] focus:outline-none focus:border-[#8A8FF5]"
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#8A8FF5] hover:bg-[#7479E8] transition py-3 rounded-lg font-semibold text-white cursor-pointer disabled:opacity-50"
      >
        {loading ? "Sending..." : "Send Reset Link"}
      </button>
    </form>

    <p className="text-center text-[#5D5A86] text-sm mt-6">
      Remember your password?{" "}
      <Link
        to="/login"
        className="text-[#6B6FF0] hover:underline font-medium"
      >
        Sign in
      </Link>
    </p>
  </div>
</div>
  );
}
