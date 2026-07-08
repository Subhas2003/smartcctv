import { useEffect, useState, useContext, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { socket, connectSocket, disconnectSocket } from "../services/socket";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";

export default function Cameras() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const formRef = useRef(null);
  const gridRef = useRef(null);

  // Lists and loading states
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);

  // Form states
  const [cameraName, setCameraName] = useState("");
  const [location, setLocation] = useState("");
  const [streamUrl, setStreamUrl] = useState("");

  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Toggle state for Add/Edit input section
  const [showForm, setShowForm] = useState(false);

  // Notifications
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  const fetchCameras = async () => {
    try {
      const res = await fetch(`${API_URL}/cameras`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setCameras(data);
      }
    } catch (err) {
      console.error("Error fetching cameras:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCameras();

    gsap.from(gridRef.current, {
      opacity: 0,
      y: 30,
      duration: 0.6,
      ease: "power2.out",
    });

    // Real-time socket updates for status pings
    connectSocket();
    socket.on("camera_status_changed", (updatedCamera) => {
      setCameras((prevCameras) =>
        prevCameras.map((cam) =>
          cam._id === updatedCamera._id ? updatedCamera : cam
        )
      );
    });

    return () => {
      socket.off("camera_status_changed");
      disconnectSocket();
    };
  }, []);

  // GSAP animation triggered when showForm is toggled
  useEffect(() => {
    if (showForm && formRef.current) {
      gsap.fromTo(formRef.current,
        { opacity: 0, x: -30 },
        { opacity: 1, x: 0, duration: 0.4, ease: "power2.out" }
      );
    }
  }, [showForm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cameraName || !location || !streamUrl) {
      setError("All fields are required");
      return;
    }

    // URL verification
    try {
      new URL(streamUrl);
    } catch (_) {
      setError("Please enter a valid URL (e.g. http://192.168.1.100:8080/feed)");
      return;
    }

    setFormLoading(true);
    setError("");
    setSuccess("");

    try {
      const url = isEditing
        ? `${API_URL}/cameras/${editingId}`
        : `${API_URL}/cameras`;
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cameraName, location, streamUrl }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(isEditing ? "Camera updated successfully!" : "Camera registered successfully!");
        setCameraName("");
        setLocation("");
        setStreamUrl("");
        setIsEditing(false);
        setEditingId(null);
        setShowForm(false); // Close form panel on success
        fetchCameras();
      } else {
        setError(data.message || "Failed to process request");
      }
    } catch (err) {
      setError("Server connection failed. Please try again.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (camera) => {
    setIsEditing(true);
    setEditingId(camera._id);
    setCameraName(camera.cameraName);
    setLocation(camera.location);
    setStreamUrl(camera.streamUrl);
    setError("");
    setSuccess("");
    setShowForm(true); // Open form panel on edit
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this camera?")) return;

    try {
      const res = await fetch(`${API_URL}/cameras/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        fetchCameras();
        if (editingId === id) {
          setCameraName("");
          setLocation("");
          setStreamUrl("");
          setIsEditing(false);
          setEditingId(null);
          setShowForm(false);
        }
      } else {
        const data = await res.json();
        alert(data.message || "Failed to delete camera");
      }
    } catch (err) {
      console.error("Error deleting camera:", err);
    }
  };

  const handleCloseForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setCameraName("");
    setLocation("");
    setStreamUrl("");
    setError("");
    setSuccess("");
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#ADAAF7] via-[#BEC3FF] to-[#D9F9DF] text-slate-900 px-4 md:px-12 py-24">
      
      {/* Header section with Dynamic toggle button */}
      <div className="max-w-7xl mx-auto mb-10 flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
        <div className="text-center sm:text-left">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">Camera Console</h1>
          <p className="text-slate-700 text-sm mt-2">Manage your smart surveillance feeds and stream connections.</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-5 py-3 rounded-xl bg-[#8A8FF5] hover:bg-[#7479E8] text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer flex items-center gap-2 transform hover:-translate-y-0.5 active:translate-y-0"
          >
            ➕ Add Camera
          </button>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto items-start">
        
        {/* LEFT COLUMN: Add / Edit Form Panel (Toggled open/close) */}
        {showForm && (
          <div
            ref={formRef}
            className="bg-white/70 backdrop-blur-md border border-white/50 rounded-2xl p-6 md:p-8 shadow-2xl lg:sticky lg:top-24"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl md:text-2xl font-bold text-[#2F2B5A]">
                {isEditing ? "✏️ Edit Camera" : "📹 Add New Camera"}
              </h2>
              <button
                onClick={handleCloseForm}
                className="text-slate-500 hover:text-slate-800 font-extrabold text-sm p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
                title="Close console panel"
              >
                ✖
              </button>
            </div>
            <p className="text-sm text-[#5D5A86] mb-6">
              {isEditing ? "Update configuration settings for this camera." : "Register a local camera stream or IP camera URL."}
            </p>

            {error && (
              <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-2.5 rounded-lg text-xs font-semibold mb-4 text-center">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-2.5 rounded-lg text-xs font-semibold mb-4 text-center">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-[#4E4A75] font-bold block mb-1">
                  Camera Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Front Door"
                  value={cameraName}
                  onChange={(e) => setCameraName(e.target.value)}
                  disabled={formLoading}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white/80 border border-[#C7CBFF] text-[#2F2B5A] text-sm focus:outline-none focus:border-[#8A8FF5]"
                />
              </div>

              <div>
                <label className="text-xs text-[#4E4A75] font-bold block mb-1">
                  Location / Placement
                </label>
                <input
                  type="text"
                  placeholder="e.g. Entrance Gate"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  disabled={formLoading}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white/80 border border-[#C7CBFF] text-[#2F2B5A] text-sm focus:outline-none focus:border-[#8A8FF5]"
                />
              </div>

              <div>
                <label className="text-xs text-[#4E4A75] font-bold block mb-1">
                  Stream URL
                </label>
                <input
                  type="text"
                  placeholder="e.g. http://192.168.1.50:5000/stream"
                  value={streamUrl}
                  onChange={(e) => setStreamUrl(e.target.value)}
                  disabled={formLoading}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white/80 border border-[#C7CBFF] text-[#2F2B5A] text-sm focus:outline-none focus:border-[#8A8FF5]"
                />
              </div>

              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 py-3 rounded-lg text-sm font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 bg-[#8A8FF5] hover:bg-[#7479E8] text-white py-3 rounded-lg text-sm font-semibold transition cursor-pointer disabled:opacity-50"
                >
                  {formLoading ? "Saving..." : isEditing ? "Update" : "Register"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* RIGHT COLUMN: Cameras Grid */}
        <div ref={gridRef} className={showForm ? "lg:col-span-2" : "lg:col-span-3"}>
          {loading ? (
            <div className="flex items-center justify-center py-24 bg-white/40 border border-white/30 rounded-2xl">
              <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : cameras.length === 0 ? (
            <div className="text-center py-20 bg-white/50 backdrop-blur-sm border border-white/40 rounded-2xl shadow-lg p-10 flex flex-col items-center">
              <div className="text-5xl mb-4 opacity-50">📹</div>
              <h3 className="text-lg font-bold text-slate-800">No Cameras Registered</h3>
              <p className="text-sm text-slate-600 max-w-sm mt-2">
                Click "+ Add Camera" at the top to configure your first surveillance stream URL.
              </p>
            </div>
          ) : (
            <div className={`grid gap-6 ${showForm ? "sm:grid-cols-2" : "sm:grid-cols-2 md:grid-cols-3"}`}>
              {cameras.map((camera) => (
                <div
                  key={camera._id}
                  className="bg-white/60 backdrop-blur-sm border border-white/40 rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:border-cyan-300 transition duration-300"
                >
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-3">
                      <div>
                        <h3 className="font-extrabold text-slate-800 truncate max-w-[150px]" title={camera.cameraName}>
                          {camera.cameraName}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">📍 {camera.location}</p>
                      </div>
                      
                      {/* Connection status indicator */}
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        camera.status === "Online"
                          ? "bg-green-100 text-green-700 border border-green-200"
                          : "bg-red-100 text-red-700 border border-red-200"
                      }`}>
                        {camera.status}
                      </span>
                    </div>

                    <div className="bg-slate-100/60 border border-slate-200/50 rounded-lg p-2.5 mb-5 text-[11px] text-slate-600 font-mono break-all line-clamp-1 select-all" title={camera.streamUrl}>
                      🔗 {camera.streamUrl}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 mt-auto">
                    <button
                      onClick={() => navigate(`/camera?cameraId=${camera._id}`)}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      📺 View Stream
                    </button>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleEdit(camera)}
                        className="bg-cyan-500/10 hover:bg-cyan-500 hover:text-white text-cyan-600 py-2 rounded-lg text-xs font-bold border border-cyan-300 cursor-pointer transition text-center"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(camera._id)}
                        className="bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 py-2 rounded-lg text-xs font-bold border border-red-300 cursor-pointer transition text-center"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
