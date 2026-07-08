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
  <div className="min-h-screen bg-gradient-to-b from-[#ADAAF7] via-[#BEC3FF] to-[#D9F9DF] text-slate-900 px-4 md:px-12 py-20">

  <h1 className="text-3xl md:text-5xl font-bold text-center mb-4 mt-6">
    Recording History
  </h1>

  <p className="text-center text-slate-700 mb-10 max-w-xl mx-auto">
    Browse and play automatic video backups uploaded to AWS S3.
  </p>

  {/* STATS & CONTROL BAR */}
  <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-4 justify-between items-center bg-white/50 backdrop-blur-sm border border-white/40 rounded-xl p-4 md:p-6 mb-8 shadow-lg">

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
        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-cyan-500 text-sm text-slate-800"
      />
    </div>

    {/* Info */}
    <div className="flex gap-6 text-sm text-slate-700">
      <div>
        Total Backups:{" "}
        <span className="font-semibold text-cyan-600">
          {stats.total}
        </span>
      </div>

      <div>
        Storage Usage:{" "}
        <span className="font-semibold text-cyan-600">
          {stats.storageUsageMb} MB
        </span>
      </div>
    </div>

    {/* Sorting */}
    <div className="flex gap-4 items-center text-sm w-full md:w-auto justify-end">
      <span className="text-slate-600">Order:</span>

      <button
        onClick={() => setOrder(order === "desc" ? "asc" : "desc")}
        className="text-cyan-600 font-semibold cursor-pointer"
      >
        {order === "desc"
          ? "Latest First ↓"
          : "Oldest First ↑"}
      </button>
    </div>

  </div>

  {/* VIDEO PLAYER */}
  {playingVideoUrl && (
    <div className="max-w-5xl mx-auto bg-white/60 backdrop-blur-sm border border-cyan-300 rounded-3xl p-5 mb-8 shadow-xl">

      <div className="flex justify-between items-center mb-4">

        <h3 className="font-bold text-sm md:text-base text-cyan-600 truncate max-w-lg">
          🎬 Now Playing: {playingVideoName}
        </h3>

        <button
          onClick={() => {
            setPlayingVideoUrl(null);
            setPlayingVideoName("");
          }}
          className="text-slate-600 hover:text-slate-900 font-extrabold cursor-pointer"
        >
          Close Player ✖
        </button>

      </div>

      <div className="w-full aspect-video rounded-xl overflow-hidden bg-black border border-slate-300">
        <video
          src={playingVideoUrl}
          controls
          autoPlay
          className="w-full h-full object-contain"
        />
      </div>

    </div>
  )}

  {/* RECORDINGS GRID */}
  <div className="max-w-5xl mx-auto grid sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">

    {recordings.length === 0 ? (
      <div className="col-span-full py-16 text-center text-slate-500 italic bg-white/40 border border-white/40 rounded-2xl">
        No video recordings matching query.
      </div>
    ) : (
      recordings.map((v) => (
        <div
          key={v._id}
          className="bg-white/60 backdrop-blur-sm border border-white/40 rounded-2xl p-4 shadow-lg flex flex-col justify-between hover:border-cyan-300 transition"
        >

          {/* Thumbnail */}
          <div
            onClick={() => handlePlayVideo(v)}
            className="aspect-video bg-slate-100 rounded-xl mb-3 flex flex-col items-center justify-center border border-slate-300 cursor-pointer group relative overflow-hidden"
          >

            <div className="text-3xl text-cyan-600 group-hover:scale-110 transition">
              ▶
            </div>

            {/* <div className="text-[10px] text-slate-500 mt-2">
              Duration: {v.duration}s
            </div> */}

            <div className="absolute inset-0 bg-cyan-500/10 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
              <span className="bg-white px-3 py-1.5 rounded-lg text-xs font-bold text-cyan-600 shadow">
                Launch Player
              </span>
            </div>

          </div>

          {/* Details */}
          <div className="flex flex-col gap-1 min-w-0">

            <h4
              className="font-bold text-sm truncate text-slate-800"
              title={v.filename}
            >
              {v.filename}
            </h4>

            <p className="text-xs text-slate-600 mt-1">
              📅 {new Date(v.timestamp).toLocaleDateString()} at{" "}
              {new Date(v.timestamp).toLocaleTimeString()}
            </p>

            <p className="text-xs text-slate-600">
              💾 Size: {(v.size / (1024 * 1024)).toFixed(2)} MB
            </p>

          </div>

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-300">

            <button
              onClick={() => handleDownloadVideo(v)}
              className="bg-cyan-500/10 hover:bg-cyan-500 hover:text-white text-cyan-600 py-1.5 rounded-lg text-xs font-bold border border-cyan-300 cursor-pointer transition text-center"
            >
              Download
            </button>

            <button
              onClick={() => handleDelete(v._id)}
              className="bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 py-1.5 rounded-lg text-xs font-bold border border-red-300 cursor-pointer transition text-center"
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
    <div className="max-w-5xl mx-auto flex justify-between items-center bg-white/50 backdrop-blur-sm border border-white/40 rounded-xl p-4">

      <button
        onClick={() => setPage(Math.max(page - 1, 1))}
        disabled={page === 1}
        className="px-3 py-1.5 bg-white border border-slate-300 rounded-md hover:bg-slate-100 text-sm font-semibold text-slate-800 disabled:opacity-40 cursor-pointer"
      >
        Previous
      </button>

      <span className="text-slate-600 text-sm">
        Page {page} of {pages}
      </span>

      <button
        onClick={() => setPage(Math.min(page + 1, pages))}
        disabled={page === pages}
        className="px-3 py-1.5 bg-white border border-slate-300 rounded-md hover:bg-slate-100 text-sm font-semibold text-slate-800 disabled:opacity-40 cursor-pointer"
      >
        Next
      </button>

    </div>
  )}

</div>
  );
}
