import { useState, useRef, useEffect, useContext } from "react";
import { gsap } from "gsap";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function VerifyOtp() {
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
  const flow = searchParams.get("flow") || "login";
  const navigate = useNavigate();

  const { verifyOtp } = useContext(AuthContext);

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
      await verifyOtp(email, code);
      setStatus("success");
      setMessage("Verification successful! Logging you in...");
      setTimeout(() => {
        navigate("/camera");
      }, 1500);
    } catch (err) {
      setStatus("error");
      setError(err.message || "Failed to verify OTP. Please try again.");
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resendLoading) return;

    setResendLoading(true);
    setError("");
    setMessage("");

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
        setMessage(data.message || "OTP code resent successfully.");
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
    <div className="min-h-screen bg-gradient-to-b from-[#ADAAF7] via-[#BEC3FF] to-[#D9F9DF] flex items-center justify-center px-6">
      <div
        ref={cardRef}
        className="w-full max-w-md bg-white/50 backdrop-blur-sm border border-white/40 rounded-3xl p-10 shadow-2xl text-center"
      >
        {status === "success" ? (
          <div>
            <div className="mb-6 flex justify-center">
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-400 rounded-full flex items-center justify-center text-emerald-600 text-3xl">
                ✔️
              </div>
            </div>

            <h1 className="text-3xl font-bold text-slate-900 mb-3">
              Success!
            </h1>

            <p className="text-slate-600 mb-8 text-sm leading-relaxed">
              {message}
            </p>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="mb-6 flex justify-center">
              <div className="w-16 h-16 bg-cyan-500/10 border border-cyan-400 rounded-full flex items-center justify-center text-cyan-600 text-3xl">
                🔑
              </div>
            </div>

            <h1 className="text-3xl font-bold text-slate-900 mb-3">
              OTP Verification
            </h1>

            <p className="text-slate-600 text-sm mb-8">
              We've sent a 6-digit verification code to <br />
              <span className="text-cyan-600 font-semibold break-all">
                {email || "your email address"}
              </span>
            </p>

            {error && (
              <div className="bg-red-500/10 border border-red-400 text-red-600 p-3 rounded-lg text-sm mb-6">
                {error}
              </div>
            )}

            {message && (
              <div className="bg-emerald-500/10 border border-emerald-400 text-emerald-600 p-3 rounded-lg text-sm mb-6">
                {message}
              </div>
            )}

            {previewUrl && (
              <div className="bg-cyan-500/10 border border-cyan-400 text-cyan-700 p-4 rounded-lg text-sm mb-6">
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

            {/* OTP Inputs */}
            <form onSubmit={handleVerify}>
              <div
                className="flex justify-between gap-2 mb-8"
                onPaste={handlePaste}
              >
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
                    className="w-12 h-14 text-center text-xl font-bold bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-cyan-500 transition-colors duration-200"
                    disabled={status === "loading"}
                  />
                ))}
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 transition py-3 rounded-xl font-semibold text-white cursor-pointer disabled:opacity-50 mb-6"
                disabled={status === "loading"}
              >
                {status === "loading" ? "Verifying..." : "Verify Code →"}
              </button>
            </form>

            <div className="text-slate-600 text-sm flex flex-col gap-2 items-center">
              <div>
                Didn't receive code?{" "}
                {cooldown > 0 ? (
                  <span className="text-cyan-600 font-semibold">
                    Resend in {cooldown}s
                  </span>
                ) : (
                  <button
                    onClick={handleResend}
                    className="text-cyan-600 font-semibold hover:underline cursor-pointer bg-transparent border-none p-0 inline disabled:opacity-50"
                    disabled={resendLoading}
                  >
                    {resendLoading ? "Sending..." : "Resend Code"}
                  </button>
                )}
              </div>

              <Link
                to="/login"
                className="text-cyan-600 hover:underline mt-2 font-medium"
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
