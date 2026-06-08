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
      const res = await fetch(`${API_URL}/auth/resend-verification`, {
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
          navigate(`/verify-email?email=${encodeURIComponent(email)}${previewParam}`);
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
    <div className="min-h-screen bg-gradient-to-b from-[#050d1f] to-[#020617] flex items-center justify-center px-6 text-white">
      <div
        ref={cardRef}
        className="w-full max-w-md bg-[#0f172a] border border-gray-700 rounded-2xl p-10 shadow-2xl"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Resend Verification</h1>
          <p className="text-gray-400 mt-2">
            Enter your email to receive a new verification link
          </p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm mb-6 text-center">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 p-3 rounded-lg text-sm mb-6 text-center">
            {message}
          </div>
        )}

        {previewUrl && (
          <div className="bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 p-4 rounded-lg text-sm mb-6 text-center">
            <p className="font-semibold mb-1">🧪 Test Environment Mail Box:</p>
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-bold hover:text-cyan-200"
            >
              Open Ethereal Mailbox →
            </a>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label className="text-sm text-gray-300 block mb-2">Email Address</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mb-6 px-4 py-3 rounded-lg bg-[#020617] border border-gray-700 text-white focus:outline-none focus:border-cyan-500"
            disabled={loading}
          />

          <button
            type="submit"
            className="w-full bg-cyan-500 hover:bg-cyan-600 transition py-3 rounded-lg font-semibold text-black cursor-pointer disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Verification Link"}
          </button>
        </form>

        <p className="text-center text-gray-400 text-sm mt-6">
          Remembered your password or already verified?{" "}
          <Link to="/login" className="text-cyan-400 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
