import { useEffect, useState, useContext, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { socket, connectSocket, disconnectSocket } from "../services/socket";
import CameraFeed from "../components/CameraFeed";
import alarmSound from "../assets/sound/alarm.mp3";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

export default function Camera() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryCameraId = searchParams.get("cameraId");

  // User cameras
  const [cameras, setCameras] = useState([]);
  const [activeCamera, setActiveCamera] = useState(null);

  // Stream States
  const [streamOnline, setStreamOnline] = useState(false);
  const [streamLastSeen, setStreamLastSeen] = useState(null);
  const [loadingStream, setLoadingStream] = useState(true);

  // Health / Stats States
  const [alertStats, setAlertStats] = useState({ total: 0, today: 0, active: 0, resolved: 0 });
  const [recordingStats, setRecordingStats] = useState({ total: 0, storageUsageMb: 0 });
  
  // Lists
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [recentRecordings, setRecentRecordings] = useState([]);

  // Alert Popup/Toast & Audio Alarm
  const [activePopup, setActivePopup] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const audioRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  // Request browser notification permission
  useEffect(() => {
    if ("Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }
  }, []);

  const triggerBrowserNotification = (title, message) => {
    if ("Notification" in window && Notification.permission === "granted") {
      const notif = new Notification(title, {
        body: message,
        icon: "/vite.svg",
      });
      notif.onclick = () => {
        window.focus();
        navigate("/alerts");
      };
    }
  };

  const playAlarm = () => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((err) => console.log("Audio play blocked", err));
    }
  };

  // Fetch initial data
  const fetchDashboardData = async () => {
    try {
      // Fetch user cameras
      const camerasRes = await fetch(`${API_URL}/cameras`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      let loadedCameras = [];
      if (camerasRes.ok) {
        loadedCameras = await camerasRes.json();
        setCameras(loadedCameras);
      }

      // Determine active camera
      if (loadedCameras.length > 0) {
        let found = null;
        if (queryCameraId) {
          found = loadedCameras.find(c => c._id === queryCameraId || c.cameraId === queryCameraId);
        }
        setActiveCamera(found || loadedCameras[0]);
      } else {
        setActiveCamera(null);
      }

      // Fetch stream status for global fallback
      const streamRes = await fetch(`${API_URL}/cameras/stream-status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (streamRes.ok) {
        const streamData = await streamRes.json();
        setStreamOnline(streamData.online);
        setStreamLastSeen(streamData.lastSeen);
      }

      // Fetch alert summary & recent list
      const alertsRes = await fetch(`${API_URL}/alerts?limit=10`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (alertsRes.ok) {
        const alertsData = await alertsRes.json();
        setRecentAlerts(alertsData.alerts);
        setAlertStats(alertsData.stats);
      }

      // Fetch recording stats & list
      const recordingsRes = await fetch(`${API_URL}/recordings?limit=3`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (recordingsRes.ok) {
        const recordingsData = await recordingsRes.json();
        setRecentRecordings(recordingsData.recordings);
        setRecordingStats(recordingsData.stats);
      }

      setLoadingStream(false);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Socket.IO Setup
    connectSocket();

    // Listeners
    socket.on("stream_status_changed", (data) => {
      setStreamOnline(data.online);
      setStreamLastSeen(data.lastSeen);
    });

    socket.on("camera_status_changed", (updatedCamera) => {
      setCameras((prev) =>
        prev.map((c) => (c._id === updatedCamera._id ? updatedCamera : c))
      );
      setActiveCamera((prev) => {
        if (prev && prev._id === updatedCamera._id) {
          return updatedCamera;
        }
        return prev;
      });
    });

    socket.on("new_alert", (alert) => {
      // Prepend to list
      setRecentAlerts((prev) => [alert, ...prev.slice(0, 9)]);
      
      // Update counters
      setAlertStats((prev) => ({
        ...prev,
        total: prev.total + 1,
        active: prev.active + 1,
        today: prev.today + 1,
      }));

      // In-app alert popup
      const isCritical = alert.type === "Fire" || alert.type === "Smoke";
      const icon = alert.type === "Fire" ? "🔥" : alert.type === "Smoke" ? "💨" : alert.type === "Person" ? "👤" : "🏃‍♂️";
      
      setActivePopup({
        title: `${icon} ${alert.type} Detected`,
        message: `Camera: ${alert.cameraName} | Location: ${alert.location || "Unknown"} | Confidence: ${alert.confidence}%`,
        type: isCritical ? "critical" : "info",
        timestamp: alert.timestamp,
      });

      // Play alarm if Fire/Smoke
      if (isCritical) {
        playAlarm();
        triggerBrowserNotification(`${icon} CRITICAL ALERT`, `${alert.type} detected at ${alert.cameraName} - ${alert.location || "Unknown"} (${alert.confidence}% confidence)`);
      }
    });

    socket.on("alert_updated", () => {
      // Refresh list to sync resolved status
      fetchDashboardData();
    });

    return () => {
      socket.off("stream_status_changed");
      socket.off("camera_status_changed");
      socket.off("new_alert");
      socket.off("alert_updated");
      disconnectSocket();
    };
  }, [soundEnabled]);

  const handleResolveAlert = async (id) => {
    try {
      const res = await fetch(`${API_URL}/alerts/${id}/resolve`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notes: "Resolved from quick-action on Dashboard." }),
      });
      if (res.ok) {
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };



  const getAlertIcon = (type) => {
    switch (type) {
      case "Fire": return "🔥";
      case "Smoke": return "💨";
      case "Person": return "👤";
      case "Motion": return "🏃‍♂️";
      default: return "⚠️";
    }
  };

  const isCurrentOnline = activeCamera ? activeCamera.status === "Online" : streamOnline;
  const currentStreamUrl = activeCamera ? activeCamera.streamUrl : "https://camera.smartcctv2026.me/video_feed";

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#ADAAF7] via-[#BEC3FF] to-[#D9F9DF] text-slate-900 px-4 md:px-10 py-20">
      
      {/* Audio Element */}
      {/* <audio ref={audioRef} src={alarmSound} loop /> */}

      {/* Real-time Toast/Popup Alert */}
      {activePopup && (
        <div className={`fixed bottom-6 right-6 z-50 p-5 rounded-2xl shadow-2xl border flex flex-col gap-2 max-w-sm w-full animate-slide-up ${
          activePopup.type === "critical"
            ? "bg-red-950/90 border-red-500 text-white"
            : "bg-slate-900/90 border-cyan-500 text-white"
        }`}>
          <div className="flex justify-between items-start">
            <h3 className="font-bold text-lg">{activePopup.title}</h3>
            <button
              onClick={() => {
                setActivePopup(null);
                if (audioRef.current) audioRef.current.pause();
              }}
              className="text-gray-400 hover:text-white font-extrabold cursor-pointer"
            >
              ✖
            </button>
          </div>
          <p className="text-sm opacity-90">{activePopup.message}</p>
          <div className="flex justify-between items-center text-xs opacity-70 mt-2">
            <span>{new Date(activePopup.timestamp).toLocaleTimeString()}</span>
            {activePopup.type === "critical" && (
              <span className="font-bold uppercase tracking-wider text-red-400 animate-pulse">Critical Danger</span>
            )}
          </div>
        </div>
      )}

      {/* DASHBOARD HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 mt-4">
        <div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">Control Panel</h1>
          <p className="text-slate-600 text-sm mt-1">Real-time camera feed and intelligent warning center.</p>
        </div>

        {/* Audio / Browser Permission Control Center */}
        <div className="flex gap-3">
          {/* <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              if (soundEnabled && audioRef.current) {
                audioRef.current.pause();
              }
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              soundEnabled
                ? "bg-cyan-500 text-black shadow-md shadow-cyan-500/20"
                : "bg-slate-800 text-gray-400 border border-gray-700 hover:bg-slate-700"
            }`}
          >
            {soundEnabled ? "🔊 Sound Enabled" : "🔇 Sound Muted"}
          </button> */}

          <button
            onClick={() => {
              if ("Notification" in window) {
                Notification.requestPermission().then((perm) => {
                  alert(perm === "granted" ? "Notifications Allowed!" : "Notifications Denied.");
                });
              }
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 border border-gray-700 text-gray-300 hover:bg-slate-700 cursor-pointer transition"
          >
            🔔 Push Permissions
          </button>

        </div>
      </div>

      {/* STATS COUNTERS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white/50 backdrop-blur-sm border border-white/40 shadow-lg rounded-2xl p-5">
          <span className="text-slate-600 text-xs font-bold uppercase tracking-wider">Active Alerts</span>
          <div className="text-3xl font-extrabold text-red-500 mt-2">{alertStats.active}</div>
        </div>
        <div className="bg-white/50 backdrop-blur-sm border border-white/40 shadow-lg rounded-2xl p-5">
          <span className="text-slate-600 text-xs font-bold uppercase tracking-wider">Alerts</span>
          <div className="text-3xl font-extrabold text-orange-400 mt-2">{alertStats.today}</div>
        </div>
        <div className="bg-white/50 backdrop-blur-sm border border-white/40 shadow-lg rounded-2xl p-5">
          <span className="text-slate-600 text-xs font-bold uppercase tracking-wider">Total Warnings</span>
          <div className="text-3xl font-extrabold text-cyan-400 mt-2">{alertStats.total}</div>
        </div>
        <div className="bg-white/50 backdrop-blur-sm border border-white/40 shadow-lg rounded-2xl p-5">
          <span className="text-slate-600 text-xs font-bold uppercase tracking-wider">Recorded Clips</span>
          <div className="text-3xl font-extrabold text-emerald-400 mt-2">
            {recordingStats.total} <span className="text-xs text-gray-500 font-normal">({recordingStats.storageUsageMb} MB)</span>
          </div>
        </div>
      </div>

      {/* STREAM LAYOUT */}
      <div className="mb-8">
        
        {/* Live Camera Stream */}
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl border border-white/40 p-5 shadow-2xl relative">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isCurrentOnline ? "bg-red-500 animate-pulse" : "bg-gray-500"}`} />
              <span className="text-sm font-bold uppercase tracking-wider">
                {activeCamera ? activeCamera.cameraName : "Live Stream"}
              </span>
              {activeCamera && (
                <span className="text-xs text-slate-500 font-mono italic">
                  📍 {activeCamera.location}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              {cameras.length > 0 && (
                <select
                  value={activeCamera?._id || ""}
                  onChange={(e) => {
                    const selected = cameras.find((c) => c._id === e.target.value);
                    if (selected) {
                      setActiveCamera(selected);
                    }
                  }}
                  className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 text-xs font-semibold focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  {cameras.map((c) => (
                    <option key={c._id} value={c._id} className="cursor-pointer">
                      📹 {c.cameraName} ({c.location})
                    </option>
                  ))}
                </select>
              )}

              <div className="text-xs text-slate-600">
                {isCurrentOnline ? "🟢 Transmission Good" : `🔴 Stream Offline`}
              </div>
            </div>
          </div>

          {loadingStream ? (
            <div className="flex items-center justify-center min-h-[350px] md:min-h-[450px]">
              <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : isCurrentOnline ? (
            <div className="w-full overflow-hidden rounded-2xl border border-gray-800">
              <CameraFeed url={currentStreamUrl} onLoaded={() => {}} onError={() => {}} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[350px] md:min-h-[450px] bg-white/40 rounded-2xl border-dashed border-slate-300 p-10 text-center">
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20 text-3xl mb-6">
                📹
              </div>
              <h2 className="text-xl font-bold text-red-400">Camera Feed Offline</h2>
              <p className="text-slate-600 max-w-md mt-2 text-sm">
                The surveillance stream for this camera is currently unavailable. Ensure the camera is powered, connected to the network, and the stream URL is correct.
              </p>
              {activeCamera && activeCamera.lastSeen && (
                <span className="text-xs mt-4 block bg-white border border-slate-300 text-slate-600 px-3 py-1.5 rounded-lg">
                  ⏰ Last Active: {new Date(activeCamera.lastSeen).toLocaleString()}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ALERTS & RECORDINGS SUMMARY LAYOUT */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Recent Alerts */}
        <div className="lg:col-span-2 bg-white/50 backdrop-blur-sm border border-white/40 rounded-3xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold flex items-center gap-2">🚨 Live Threat Feed</h2>
            <Link to="/alerts" className="text-cyan-700 text-xs font-semibold hover:underline">
              View History →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-slate-300 text-slate-600">
              <thead>
                <tr className="border-b border-gray-850 text-gray-500 hover:bg-white/40">
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Camera / Location</th>
                  <th className="pb-3">Confidence</th>
                  <th className="pb-3 text-slate-500">Time</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentAlerts.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-gray-500 italic">No alerts logged.</td>
                  </tr>
                ) : (
                  recentAlerts.slice(0, 5).map((alert) => (
                    <tr key={alert._id} className="border-b border-gray-850/30 hover:bg-slate-800/10 transition">
                      <td className="py-3.5 font-semibold">
                        <span className="mr-2">{getAlertIcon(alert.type)}</span>
                        {alert.type}
                      </td>
                      <td className="py-3.5 text-xs text-slate-700">
                        <div className="font-semibold">{alert.cameraName}</div>
                        <div className="text-[10px] text-slate-500">Location: {alert.location || "Unknown"}</div>
                      </td>
                      <td className="py-3.5">
                        <span className="bg-orange-500/15 text-orange-400 px-2 py-0.5 rounded text-xs font-bold">
                          {alert.confidence}%
                        </span>
                      </td>
                      <td className="py-3.5 text-gray-400 text-xs">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          alert.status === "Active" ? "bg-red-500/15 text-red-400 animate-pulse" : "bg-emerald-500/15 text-emerald-400"
                        }`}>
                          {alert.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        {alert.status === "Active" ? (
                          <button
                            onClick={() => handleResolveAlert(alert._id)}
                            className="bg-emerald-500 hover:bg-emerald-600 text-black px-2 py-1 rounded text-xs font-bold cursor-pointer"
                          >
                            Resolve
                          </button>
                        ) : (
                          <span className="text-gray-500 text-xs italic">Cleared</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Recent Recordings Summary */}
        <div className="bg-white/50 backdrop-blur-sm border border-white/40 rounded-3xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold flex items-center gap-2">🎥 Backup Clips</h2>
            <Link to="/recordings" className="text-cyan-700 text-xs font-semibold hover:underline">
              All Recordings →
            </Link>
          </div>

          <div className="flex flex-col gap-4 flex-grow justify-center">
            {recentRecordings.length === 0 ? (
              <p className="text-slate-500 text-center italic text-sm">No backup clips found.</p>
            ) : (
              recentRecordings.map((rec) => (
                <div key={rec._id} className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg">
                  <div className="w-12 h-12 bg-cyan-500/10 text-cyan-600 rounded-xl flex items-center justify-center text-lg">
                    🎬
                  </div>
                  <div className="flex-grow min-w-0">
                    <h4 className="font-bold text-xs text-slate-800 truncate">{rec.filename}</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {new Date(rec.timestamp).toLocaleDateString()} | {(rec.size / (1024 * 1024)).toFixed(1)} MB
                    </p>
                  </div>
                  <button
                    onClick={() => navigate("/recordings")}
                    className="bg-slate-900 hover:bg-slate-800 text-white px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
                  >
                    Play
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
