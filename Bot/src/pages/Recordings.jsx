import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Recordings() {
  const { token } = useContext(AuthContext);
  const [recordings, setRecordings] = useState([]);
  const [stats, setStats] = useState({ total: 0, storageUsageMb: 0 });
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [limit] = useState(6);

  // Search & Filter state
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("timestamp");
  const [order, setOrder] = useState("desc");

  // Playing video states
  const [playingVideoUrl, setPlayingVideoUrl] = useState(null);
  const [playingVideoName, setPlayingVideoName] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  const fetchRecordings = async () => {
    try {
      const queryParams = new URLSearchParams({
        page,
        limit,
        sortBy,
        order,
      });
      if (search) queryParams.append("search", search);

      const res = await fetch(`${API_URL}/recordings?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setRecordings(data.recordings);
        setPages(data.pagination.pages);
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching recordings:", error);
    }
  };

  useEffect(() => {
    fetchRecordings();
  }, [page, search, sortBy, order]);

  const handlePlayVideo = async (rec) => {
    try {
      const res = await fetch(`${API_URL}/recordings/${rec._id}/url`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setPlayingVideoUrl(data.url);
        setPlayingVideoName(rec.filename);
      } else {
        alert("Failed to load video source URL.");
      }
    } catch (error) {
      console.error("Error retrieving video URL:", error);
    }
  };

  const handleDownloadVideo = async (rec) => {
    try {
      const res = await fetch(`${API_URL}/recordings/${rec._id}/url`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        // Open the URL in a new window or trigger download
        const a = document.createElement("a");
        a.href = data.url;
        a.download = rec.filename;
        a.target = "_blank";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        alert("Failed to fetch download link.");
      }
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this recording?")) return;

    try {
      const res = await fetch(`${API_URL}/recordings/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        if (playingVideoUrl) {
          setPlayingVideoUrl(null);
          setPlayingVideoName("");
        }
        fetchRecordings();
      }
    } catch (error) {
      console.error("Error deleting recording:", error);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-[#050d1f] to-[#020617] text-white px-4 md:px-12 py-20">
      <h1 className="text-3xl md:text-5xl font-bold text-center mb-4 mt-6">
        Recording History
      </h1>
      <p className="text-center text-gray-400 mb-10 max-w-xl mx-auto">
        Browse and play automatic video backups uploaded to AWS S3.
      </p>

      {/* STATS & CONTROL BAR */}
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-4 justify-between items-center bg-[#0f172a] border border-gray-700 rounded-xl p-4 md:p-6 mb-8">
        
        {/* Search */}
        <div className="w-full md:w-80">
          <input
            type="text"
            placeholder="Search recordings by filename..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 bg-[#020617] border border-gray-600 rounded-lg focus:outline-none focus:border-cyan-500 text-sm"
          />
        </div>

        {/* Info */}
        <div className="flex gap-6 text-sm text-gray-300">
          <div>
            Total Backups: <span className="font-semibold text-cyan-400">{stats.total}</span>
          </div>
          <div>
            Storage Usage: <span className="font-semibold text-cyan-400">{stats.storageUsageMb} MB</span>
          </div>
        </div>

        {/* Sorting */}
        <div className="flex gap-4 items-center text-sm w-full md:w-auto justify-end">
          <span className="text-gray-400">Order:</span>
          <button
            onClick={() => setOrder(order === "desc" ? "asc" : "desc")}
            className="text-cyan-400 font-semibold cursor-pointer"
          >
            {order === "desc" ? "Latest First ↓" : "Oldest First ↑"}
          </button>
        </div>
      </div>

      {/* VIDEO PLAYER MODAL / PANEL */}
      {playingVideoUrl && (
        <div className="max-w-5xl mx-auto bg-[#0a1122] border-2 border-cyan-500/30 rounded-3xl p-5 mb-8 shadow-2xl animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-sm md:text-base text-cyan-400 truncate max-w-lg">
              🎬 Now Playing: {playingVideoName}
            </h3>
            <button
              onClick={() => {
                setPlayingVideoUrl(null);
                setPlayingVideoName("");
              }}
              className="text-gray-400 hover:text-white font-extrabold cursor-pointer"
            >
              Close Player ✖
            </button>
          </div>
          <div className="w-full aspect-video rounded-xl overflow-hidden bg-black border border-gray-800">
            <video src={playingVideoUrl} controls autoPlay className="w-full h-full object-contain" />
          </div>
        </div>
      )}

      {/* RECORDINGS GRID */}
      <div className="max-w-5xl mx-auto grid sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
        {recordings.length === 0 ? (
          <div className="col-span-full py-16 text-center text-gray-500 italic bg-[#0f172a]/40 border border-gray-800 rounded-2xl">
            No video recordings matching query.
          </div>
        ) : (
          recordings.map((v) => (
            <div
              key={v._id}
              className="bg-[#0f172a] border border-gray-700 rounded-2xl p-4 shadow-lg flex flex-col justify-between hover:border-gray-600 transition"
            >
              {/* Card Thumbnail Area */}
              <div
                onClick={() => handlePlayVideo(v)}
                className="aspect-video bg-slate-950 rounded-xl mb-3 flex flex-col items-center justify-center border border-gray-800 cursor-pointer group relative overflow-hidden"
              >
                <div className="text-3xl text-cyan-500 group-hover:scale-115 transition">▶</div>
                <div className="text-[10px] text-gray-500 mt-2">Duration: {v.duration}s</div>
                
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-cyan-500/10 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <span className="bg-black/80 px-3 py-1.5 rounded-lg text-xs font-bold text-cyan-400">Launch Player</span>
                </div>
              </div>

              {/* Meta details */}
              <div className="flex flex-col gap-1 min-w-0">
                <h4 className="font-bold text-sm truncate text-gray-200" title={v.filename}>
                  {v.filename}
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  📅 {new Date(v.timestamp).toLocaleDateString()} at {new Date(v.timestamp).toLocaleTimeString()}
                </p>
                <p className="text-xs text-gray-500">
                  💾 Size: {(v.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-gray-850">
                <button
                  onClick={() => handleDownloadVideo(v)}
                  className="bg-cyan-500/10 hover:bg-cyan-500 hover:text-black text-cyan-400 py-1.5 rounded-lg text-xs font-bold border border-cyan-500/20 cursor-pointer transition text-center"
                >
                  Download
                </button>
                <button
                  onClick={() => handleDelete(v._id)}
                  className="bg-red-600/15 hover:bg-red-600 hover:text-white text-red-400 py-1.5 rounded-lg text-xs font-bold border border-red-500/10 cursor-pointer transition text-center"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* PAGINATION */}
      {pages > 1 && (
        <div className="max-w-5xl mx-auto flex justify-between items-center bg-[#0f172a] border border-gray-800 rounded-xl p-4">
          <button
            onClick={() => setPage(Math.max(page - 1, 1))}
            disabled={page === 1}
            className="px-3 py-1.5 bg-[#020617] border border-gray-700 rounded-md hover:bg-slate-800 text-sm font-semibold disabled:opacity-40 cursor-pointer"
          >
            Previous
          </button>
          <span className="text-gray-400 text-sm">
            Page {page} of {pages}
          </span>
          <button
            onClick={() => setPage(Math.min(page + 1, pages))}
            disabled={page === pages}
            className="px-3 py-1.5 bg-[#020617] border border-gray-700 rounded-md hover:bg-slate-800 text-sm font-semibold disabled:opacity-40 cursor-pointer"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
