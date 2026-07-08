import { useEffect, useState, useContext, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import CameraFeed from "../components/CameraFeed";
import { gsap } from "gsap";

export default function CameraStream() {
  const { token } = useContext(AuthContext);
  const { id } = useParams();
  const navigate = useNavigate();
  const cardRef = useRef(null);

  const [camera, setCamera] = useState(null);
  const [loading, setLoading] = useState(true);
  const [streamOnline, setStreamOnline] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    const fetchCamera = async () => {
      try {
        const res = await fetch(`${API_URL}/cameras/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setCamera(data);
          // Set initial stream status state based on database
          setStreamOnline(data.status === "Online");
        } else {
          alert("Unable to find camera or unauthorized access.");
          navigate("/cameras");
        }
      } catch (err) {
        console.error("Error fetching camera details:", err);
        navigate("/cameras");
      } finally {
        setLoading(false);
      }
    };

    fetchCamera();
  }, [id]);

  useEffect(() => {
    if (!loading && camera) {
      gsap.from(cardRef.current, {
        opacity: 0,
        scale: 0.95,
        duration: 0.5,
        ease: "power2.out",
      });
    }
  }, [loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#ADAAF7] via-[#BEC3FF] to-[#D9F9DF] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!camera) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#ADAAF7] via-[#BEC3FF] to-[#D9F9DF] text-slate-900 px-4 md:px-12 py-24">
      <div className="max-w-5xl mx-auto flex flex-col gap-6 mt-4">
        
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <button
              onClick={() => navigate("/cameras")}
              className="text-[#6B6FF0] hover:text-[#5357D5] hover:underline font-bold text-sm flex items-center gap-1 cursor-pointer mb-2"
            >
              ← Back to Cameras
            </button>
            <h1 className="text-3xl font-extrabold text-[#2F2B5A] tracking-tight truncate max-w-lg" title={camera.cameraName}>
              📹 Streaming: {camera.cameraName}
            </h1>
            <p className="text-sm text-slate-700 mt-1">📍 Location: {camera.location}</p>
          </div>

          <div className="flex items-center gap-2 bg-white/40 border border-white/50 backdrop-blur-sm px-4 py-2 rounded-xl self-start sm:self-auto text-xs font-semibold">
            <span className={`w-2.5 h-2.5 rounded-full ${streamOnline ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
            <span>Connection Status: {streamOnline ? "ONLINE" : "OFFLINE"}</span>
          </div>
        </div>

        {/* Stream Display Wrapper */}
        <div
          ref={cardRef}
          className="bg-white/60 backdrop-blur-md rounded-3xl border border-white/40 p-5 shadow-2xl relative"
        >
          {streamOnline ? (
            <div className="w-full overflow-hidden rounded-2xl border border-gray-200">
              <CameraFeed
                url={camera.streamUrl}
                onLoaded={() => setStreamOnline(true)}
                onError={() => setStreamOnline(false)}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[350px] md:min-h-[450px] bg-white/30 rounded-2xl border-dashed border-slate-300 p-10 text-center">
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20 text-3xl mb-6">
                📺
              </div>
              <h2 className="text-xl font-bold text-red-500">Camera Stream Offline</h2>
              <p className="text-slate-700 max-w-md mt-2 text-sm">
                The stream source URL could not be loaded directly. Verify the camera is powered, online, and that the stream URL matches:
              </p>
              <code className="bg-white border border-slate-200 text-slate-800 text-xs px-3 py-1.5 rounded-md mt-4 font-mono break-all max-w-lg select-all">
                {camera.streamUrl}
              </code>
              <button
                onClick={() => setStreamOnline(true)}
                className="mt-6 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow cursor-pointer transition"
              >
                🔄 Retry Feed Connection
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
