import { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { Link, useSearchParams, useNavigate } from "react-router-dom";

export default function VerifyEmail() {
  const cardRef = useRef(null);
  const inputRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
  ];

  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const initialPreviewUrl = searchParams.get("previewUrl") || "";
  const navigate = useNavigate();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [status, setStatus] = useState("idle"); // idle, loading, success, error
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState(initialPreviewUrl);

  // Resend cooldown timer
  const [cooldown, setCooldown] = useState(60);
  const [resendLoading, setResendLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  // GSAP animation on mount
  useEffect(() => {
    gsap.from(cardRef.current, {
      opacity: 0,
      y: 40,
      scale: 0.95,
      duration: 0.7,
      ease: "power2.out",
    });

    // Auto-focus first input on mount
    if (inputRefs[0].current) {
      inputRefs[0].current.focus();
    }
  }, []);

  // Cooldown countdown timer
  useEffect(() => {
    let interval = null;
    if (cooldown > 0) {
      interval = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [cooldown]);

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (isNaN(value)) return; // Only allow numbers

    const newOtp = [...otp];
    // Keep only the last character entered
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // If input is filled, move focus to the next input box
    if (value && index < 5) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    // If backspace is pressed
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        // If current box is empty, jump to previous box and clear it
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
        inputRefs[index - 1].current.focus();
      } else {
        // Clear current box
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").trim();
    if (!/^\d{6}$/.test(pasteData)) return; // Only accept exactly 6 digits

    const digits = pasteData.split("");
    setOtp(digits);

    // Focus last input box
    inputRefs[5].current.focus();
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }

    setStatus("loading");
    setError("");
    setMessage("");

    try {
      const res = await fetch(`${API_URL}/auth/verify-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setMessage(data.message || "Email verified successfully!");
      } else {
        setStatus("error");
        setError(data.message || "Failed to verify. Please try again.");
      }
    } catch (err) {
      setStatus("error");
      setError("Server connection failed. Try again.");
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resendLoading) return;

    setResendLoading(true);
    setError("");
    setMessage("");

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
        setMessage(data.message || "Verification code resent successfully.");
        if (data.previewUrl) {
          setPreviewUrl(data.previewUrl);
        }
        setCooldown(60); // Reset cooldown
      } else {
        setError(data.message || "Failed to resend code.");
      }
    } catch (err) {
      setError("Server connection failed. Try again.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050d1f] to-[#020617] flex items-center justify-center px-6 text-white">
      <div
        ref={cardRef}
        className="w-full max-w-md bg-[#0f172a] border border-gray-700 rounded-2xl p-10 shadow-2xl text-center"
      >
        {status === "success" ? (
          <div>
            <div className="mb-6 flex justify-center">
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center text-emerald-400 text-3xl">
                ✔️
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-3">Activated!</h1>
            <p className="text-gray-400 mb-8 text-sm leading-relaxed">{message}</p>
            <button
              onClick={() => navigate("/login")}
              className="w-full bg-cyan-500 hover:bg-cyan-600 transition py-3 rounded-lg font-semibold text-black cursor-pointer text-center"
            >
              Sign In →
            </button>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="mb-6 flex justify-center">
              <div className="w-16 h-16 bg-cyan-500/10 border border-cyan-500/30 rounded-full flex items-center justify-center text-cyan-400 text-3xl">
                🔑
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-3">Verification Code</h1>
            <p className="text-gray-400 text-sm mb-8">
              We've sent a 6-digit verification code to <br />
              <span className="text-cyan-400 font-semibold break-all">{email || "your email address"}</span>
            </p>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm mb-6">
                {error}
              </div>
            )}

            {message && (
              <div className="bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 p-3 rounded-lg text-sm mb-6">
                {message}
              </div>
            )}

            {previewUrl && (
              <div className="bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 p-4 rounded-lg text-sm mb-6">
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

            {/* OTP input boxes */}
            <form onSubmit={handleVerify}>
              <div className="flex justify-between gap-2 mb-8" onPaste={handlePaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={inputRefs[index]}
                    type="text"
                    pattern="\d*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className="w-12 h-14 text-center text-xl font-bold bg-[#020617] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500 transition-colors duration-200"
                    disabled={status === "loading"}
                  />
                ))}
              </div>

              <button
                type="submit"
                className="w-full bg-cyan-500 hover:bg-cyan-600 transition py-3 rounded-lg font-semibold text-black cursor-pointer disabled:opacity-50 mb-6"
                disabled={status === "loading"}
              >
                {status === "loading" ? "Verifying..." : "Verify Code →"}
              </button>
            </form>

            <div className="text-gray-400 text-sm flex flex-col gap-2 items-center">
              <div>
                Didn't receive code?{" "}
                {cooldown > 0 ? (
                  <span className="text-cyan-400 font-semibold">Resend in {cooldown}s</span>
                ) : (
                  <button
                    onClick={handleResend}
                    className="text-cyan-400 font-semibold hover:underline cursor-pointer bg-transparent border-none p-0 inline disabled:opacity-50"
                    disabled={resendLoading}
                  >
                    {resendLoading ? "Sending..." : "Resend Code"}
                  </button>
                )}
              </div>
              <Link to="/login" className="text-cyan-400 hover:underline mt-2">
                Back to Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
