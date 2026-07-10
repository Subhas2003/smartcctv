import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { socket, connectSocket } from "../services/socket";

export default function Alerts() {
  const { token } = useContext(AuthContext);
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({ total: 0, today: 0, active: 0, resolved: 0 });
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [limit] = useState(10);

  // Search & Filter state
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("timestamp");
  const [order, setOrder] = useState("desc");

  // Selected alert for notes editing
  const [editingAlertId, setEditingAlertId] = useState(null);
  const [notesText, setNotesText] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  const fetchAlerts = async () => {
    try {
      const queryParams = new URLSearchParams({
        page,
        limit,
        sortBy,
        order,
      });
      if (search) queryParams.append("search", search);
      if (typeFilter) queryParams.append("type", typeFilter);
      if (statusFilter) queryParams.append("status", statusFilter);

      const res = await fetch(`${API_URL}/alerts?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setAlerts(data.alerts);
        setPages(data.pagination.pages);
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching alerts:", error);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [page, search, typeFilter, statusFilter, sortBy, order]);

  // Connect socket and listen for real-time alerts
  useEffect(() => {
    connectSocket();

    const handleNewAlert = () => {
      // Re-fetch list to update stats and items correctly in real-time
      fetchAlerts();
    };

    socket.on("new_alert", handleNewAlert);
    socket.on("alert_updated", handleNewAlert);

    return () => {
      socket.off("new_alert", handleNewAlert);
      socket.off("alert_updated", handleNewAlert);
    };
  }, []);

  const handleResolve = async (id, currentNotes = "") => {
    try {
      const res = await fetch(`${API_URL}/alerts/${id}/resolve`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notes: currentNotes }),
      });
      if (res.ok) {
        fetchAlerts();
      }
    } catch (error) {
      console.error("Error resolving alert:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this alert?")) return;

    try {
      const res = await fetch(`${API_URL}/alerts/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        fetchAlerts();
      }
    } catch (error) {
      console.error("Error deleting alert:", error);
    }
  };

  const startEditNotes = (alert) => {
    setEditingAlertId(alert._id);
    setNotesText(alert.notes || "");
  };

  const saveNotes = async (id) => {
    try {
      const res = await fetch(`${API_URL}/alerts/${id}/notes`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notes: notesText }),
      });
      if (res.ok) {
        setEditingAlertId(null);
        fetchAlerts();
      }
    } catch (error) {
      console.error("Error updating notes:", error);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "Fire": return "🔥";
      case "Smoke": return "💨";
      case "Person": return "👤";
      case "Motion": return "🏃‍♂️";
      default: return "⚠️";
    }
  };

  return (
  <div className="min-h-screen bg-gradient-to-b from-[#ADAAF7] via-[#BEC3FF] to-[#D9F9DF] text-slate-900 px-4 md:px-12 py-20">

    <h1 className="text-3xl md:text-5xl font-bold text-center mb-4 mt-6">
      Alert History
    </h1>

    <p className="text-center text-slate-700 mb-10 max-w-xl mx-auto">
      Search and review historical detection events from the warehouse smart AI based Monitoring System.
    </p>

    {/* STATS OVERVIEW */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto mb-10">

      <div className="bg-white/50 backdrop-blur-sm border border-white/40 shadow-lg rounded-xl p-4 text-center">
        <p className="text-slate-600 text-sm">Total Alerts</p>
        <p className="text-2xl font-bold text-cyan-500 mt-1">{stats.total}</p>
      </div>

      <div className="bg-white/50 backdrop-blur-sm border border-white/40 shadow-lg rounded-xl p-4 text-center">
        <p className="text-slate-600 text-sm"> Alerts</p>
        <p className="text-2xl font-bold text-orange-500 mt-1">{stats.today}</p>
      </div>

      <div className="bg-white/50 backdrop-blur-sm border border-white/40 shadow-lg rounded-xl p-4 text-center">
        <p className="text-slate-600 text-sm">Active Alerts</p>
        <p className="text-2xl font-bold text-red-500 mt-1">{stats.active}</p>
      </div>

      <div className="bg-white/50 backdrop-blur-sm border border-white/40 shadow-lg rounded-xl p-4 text-center">
        <p className="text-slate-600 text-sm">Resolved Alerts</p>
        <p className="text-2xl font-bold text-emerald-500 mt-1">{stats.resolved}</p>
      </div>

    </div>

    {/* FILTERS */}
    <div className="max-w-5xl mx-auto bg-white/50 backdrop-blur-sm border border-white/40 rounded-xl p-4 md:p-6 mb-8 flex flex-col gap-4 shadow-lg">

      <div className="grid md:grid-cols-3 gap-4">

        <div className="flex flex-col">
          <label className="text-xs text-slate-600 mb-1">
            Search camera or notes
          </label>

          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-300 text-slate-800 rounded-lg focus:outline-none focus:border-cyan-500 text-sm"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-xs text-slate-600 mb-1">
            Filter by Type
          </label>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-300 text-slate-800 rounded-lg focus:outline-none focus:border-cyan-500 text-sm"
          >
            <option value="">All Types</option>
            <option value="Fire">Fire 🔥</option>
            <option value="Smoke">Smoke 💨</option>
            <option value="Person">Person 👤</option>
            <option value="Motion">Motion 🏃‍♂️</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-xs text-slate-600 mb-1">
            Filter by Status
          </label>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-300 text-slate-800 rounded-lg focus:outline-none focus:border-cyan-500 text-sm"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active 🔴</option>
            <option value="Resolved">Resolved 🟢</option>
          </select>
        </div>

      </div>

      <div className="flex justify-between items-center text-sm border-t border-slate-300 pt-4 mt-2">

        <div className="flex items-center gap-2">
          <span>Sort by:</span>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-transparent border-0 font-semibold text-cyan-600 focus:outline-none cursor-pointer"
          >
            <option value="timestamp">Date/Time</option>
            <option value="confidence">Confidence</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span>Order:</span>

          <button
            onClick={() => setOrder(order === "desc" ? "asc" : "desc")}
            className="text-cyan-600 font-semibold cursor-pointer"
          >
            {order === "desc" ? "Descending ↓" : "Ascending ↑"}
          </button>
        </div>

      </div>

    </div>

    {/* TABLE */}
    <div className="max-w-5xl mx-auto bg-white/60 backdrop-blur-sm border border-white/40 rounded-xl overflow-hidden shadow-xl">

      <div className="overflow-x-auto">

        <table className="w-full text-left border-collapse">

          <thead>
            <tr className="border-b border-slate-300 bg-white/70 text-slate-700 text-sm">
              <th className="p-4">Type</th>
              <th className="p-4">Camera</th>
              <th className="p-4">Confidence</th>
              <th className="p-4">Time</th>
              <th className="p-4">Status</th>
              <th className="p-4">Notes</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>

            {alerts.length === 0 ? (
  <tr>
    <td colSpan="7" className="p-10 text-center text-slate-500">
      No alert history records found.
    </td>
  </tr>
) : (
  alerts.map((alert) => (
    <tr
      key={alert._id}
      className="border-b border-slate-200 hover:bg-white/40 transition text-sm"
    >
      <td className="p-4 font-semibold text-slate-800">
        <span className="mr-2">{getTypeIcon(alert.type)}</span>
        {alert.type}
      </td>

      <td className="p-4 text-slate-700">
        <div className="font-semibold text-slate-800">{alert.cameraName}</div>
        <div className="text-xs text-slate-500 mt-0.5">Location: {alert.location || "Unknown"}</div>
      </td>

      <td className="p-4">
        <span
          className={`px-2 py-0.5 rounded-full font-bold text-xs ${
            alert.confidence > 80
              ? "bg-red-100 text-red-600"
              : "bg-orange-100 text-orange-600"
          }`}
        >
          {alert.confidence}%
        </span>
      </td>

      <td className="p-4 text-slate-600">
        {new Date(alert.timestamp).toLocaleString()}
      </td>

      <td className="p-4">
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 w-fit ${
            alert.status === "Active"
              ? "bg-red-100 text-red-600 border border-red-300 animate-pulse"
              : "bg-emerald-100 text-emerald-600 border border-emerald-300"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              alert.status === "Active"
                ? "bg-red-500"
                : "bg-emerald-500"
            }`}
          ></span>

          {alert.status}
        </span>
      </td>

      <td className="p-4">
        {editingAlertId === alert._id ? (
          <div className="flex gap-2 items-center">

            <input
              type="text"
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              className="bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 focus:outline-none focus:border-cyan-500"
            />

            <button
              onClick={() => saveNotes(alert._id)}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded px-2 py-1 text-xs cursor-pointer"
            >
              Save
            </button>

            <button
              onClick={() => setEditingAlertId(null)}
              className="bg-slate-500 hover:bg-slate-600 text-white rounded px-2 py-1 text-xs cursor-pointer"
            >
              X
            </button>

          </div>
        ) : (
          <div className="flex gap-2 items-center justify-between group min-w-[120px]">

            <span className="text-slate-500 italic max-w-[150px] truncate">
              {alert.notes || "No notes added"}
            </span>

            <button
              onClick={() => startEditNotes(alert)}
              className="text-cyan-600 hover:text-cyan-700 text-xs hidden group-hover:inline cursor-pointer"
            >
              Edit
            </button>

          </div>
        )}
      </td>

      <td className="p-4 text-center">
        <div className="flex justify-center gap-2">

          {alert.status === "Active" && (
            <button
              onClick={() => handleResolve(alert._id, alert.notes)}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-2.5 py-1 rounded text-xs font-semibold cursor-pointer"
            >
              Resolve
            </button>
          )}

          <button
            onClick={() => handleDelete(alert._id)}
            className="bg-red-100 hover:bg-red-500 hover:text-white text-red-600 px-2.5 py-1 rounded text-xs font-semibold cursor-pointer border border-red-300"
          >
            Delete
          </button>

        </div>
      </td>
    </tr>
  ))
)}
            </tbody>

       

        </table>

      </div>

      {pages > 1 && (
        <div className="p-4 bg-white/50 border-t border-slate-300 flex justify-between items-center">

          <button
            onClick={() => setPage(Math.max(page - 1, 1))}
            disabled={page === 1}
            className="px-3 py-1.5 bg-white border border-slate-300 rounded-md hover:bg-slate-100 text-slate-800 text-sm font-semibold disabled:opacity-40 cursor-pointer"
          >
            Previous
          </button>

          <span className="text-slate-600 text-sm">
            Page {page} of {pages}
          </span>

          <button
            onClick={() => setPage(Math.min(page + 1, pages))}
            disabled={page === pages}
            className="px-3 py-1.5 bg-white border border-slate-300 rounded-md hover:bg-slate-100 text-slate-800 text-sm font-semibold disabled:opacity-40 cursor-pointer"
          >
            Next
          </button>

        </div>
      )}

    </div>

  </div>
);
}
