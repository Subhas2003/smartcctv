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
    <div className="min-h-screen bg-linear-to-b from-[#050d1f] to-[#020617] text-white px-4 md:px-12 py-20">
      <h1 className="text-3xl md:text-5xl font-bold text-center mb-4 mt-6">
        Alert History
      </h1>
      <p className="text-center text-gray-400 mb-10 max-w-xl mx-auto">
        Search and review historical detection events from the warehouse smart CCTV system.
      </p>

      {/* STATS OVERVIEW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto mb-10">
        <div className="bg-[#0f172a]/60 border border-gray-800 p-4 rounded-xl text-center">
          <p className="text-gray-400 text-sm">Total Alerts</p>
          <p className="text-2xl font-bold text-cyan-400 mt-1">{stats.total}</p>
        </div>
        <div className="bg-[#0f172a]/60 border border-gray-800 p-4 rounded-xl text-center">
          <p className="text-gray-400 text-sm">Today's Alerts</p>
          <p className="text-2xl font-bold text-orange-400 mt-1">{stats.today}</p>
        </div>
        <div className="bg-[#0f172a]/60 border border-gray-800 p-4 rounded-xl text-center">
          <p className="text-gray-400 text-sm">Active Alerts</p>
          <p className="text-2xl font-bold text-red-500 mt-1">{stats.active}</p>
        </div>
        <div className="bg-[#0f172a]/60 border border-gray-800 p-4 rounded-xl text-center">
          <p className="text-gray-400 text-sm">Resolved Alerts</p>
          <p className="text-2xl font-bold text-emerald-500 mt-1">{stats.resolved}</p>
        </div>
      </div>

      {/* FILTERS & SEARCH */}
      <div className="max-w-5xl mx-auto bg-[#0f172a] border border-gray-700 rounded-xl p-4 md:p-6 mb-8 flex flex-col gap-4">
        <div className="grid md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="flex flex-col">
            <label className="text-xs text-gray-400 mb-1">Search camera or notes</label>
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3 py-2 bg-[#020617] border border-gray-600 rounded-lg focus:outline-none focus:border-cyan-500 text-sm"
            />
          </div>

          {/* Type Filter */}
          <div className="flex flex-col">
            <label className="text-xs text-gray-400 mb-1">Filter by Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 bg-[#020617] border border-gray-600 rounded-lg focus:outline-none focus:border-cyan-500 text-sm"
            >
              <option value="">All Types</option>
              <option value="Fire">Fire 🔥</option>
              <option value="Smoke">Smoke 💨</option>
              <option value="Person">Person 👤</option>
              <option value="Motion">Motion 🏃‍♂️</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex flex-col">
            <label className="text-xs text-gray-400 mb-1">Filter by Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-[#020617] border border-gray-600 rounded-lg focus:outline-none focus:border-cyan-500 text-sm"
            >
              <option value="">All Statuses</option>
              <option value="Active">Active 🔴</option>
              <option value="Resolved">Resolved 🟢</option>
            </select>
          </div>
        </div>

        <div className="flex justify-between items-center text-sm border-t border-gray-800 pt-4 mt-2">
          <div className="flex items-center gap-2">
            <span>Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent border-0 font-semibold text-cyan-400 focus:outline-none cursor-pointer"
            >
              <option value="timestamp">Date/Time</option>
              <option value="confidence">Confidence</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span>Order:</span>
            <button
              onClick={() => setOrder(order === "desc" ? "asc" : "desc")}
              className="text-cyan-400 font-semibold cursor-pointer"
            >
              {order === "desc" ? "Descending ↓" : "Ascending ↑"}
            </button>
          </div>
        </div>
      </div>

      {/* ALERTS TABLE */}
      <div className="max-w-5xl mx-auto bg-[#0f172a] border border-gray-700 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-800 bg-[#0d1326] text-gray-400 text-sm">
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
                  <td colSpan="7" className="p-10 text-center text-gray-500">
                    No alert history records found.
                  </td>
                </tr>
              ) : (
                alerts.map((alert) => (
                  <tr key={alert._id} className="border-b border-gray-800 hover:bg-slate-800/40 transition text-sm">
                    <td className="p-4 font-semibold">
                      <span className="mr-2">{getTypeIcon(alert.type)}</span>
                      {alert.type}
                    </td>
                    <td className="p-4 text-gray-300">{alert.cameraName}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-xs ${
                        alert.confidence > 80 ? "bg-red-500/20 text-red-400" : "bg-orange-500/20 text-orange-400"
                      }`}>
                        {alert.confidence}%
                      </span>
                    </td>
                    <td className="p-4 text-gray-400">
                      {new Date(alert.timestamp).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 w-fit ${
                        alert.status === "Active"
                          ? "bg-red-600/20 text-red-400 border border-red-500/30 animate-pulse"
                          : "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${alert.status === "Active" ? "bg-red-500" : "bg-emerald-500"}`}></span>
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
                            className="bg-[#020617] border border-gray-600 rounded px-2 py-1 text-xs focus:outline-none focus:border-cyan-500"
                          />
                          <button
                            onClick={() => saveNotes(alert._id)}
                            className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded px-2 py-1 text-xs cursor-pointer"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingAlertId(null)}
                            className="bg-gray-700 hover:bg-gray-600 text-white rounded px-2 py-1 text-xs cursor-pointer"
                          >
                            X
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2 items-center justify-between group min-w-[120px]">
                          <span className="text-gray-400 italic max-w-[150px] truncate">
                            {alert.notes || "No notes added"}
                          </span>
                          <button
                            onClick={() => startEditNotes(alert)}
                            className="text-cyan-400 hover:text-cyan-300 text-xs hidden group-hover:inline cursor-pointer"
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
                            className="bg-emerald-500 hover:bg-emerald-600 text-black px-2.5 py-1 rounded text-xs font-semibold cursor-pointer"
                          >
                            Resolve
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(alert._id)}
                          className="bg-red-600/30 hover:bg-red-600 hover:text-white text-red-400 px-2.5 py-1 rounded text-xs font-semibold cursor-pointer border border-red-500/20"
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

        {/* PAGINATION */}
        {pages > 1 && (
          <div className="p-4 bg-[#0d1326] border-t border-gray-800 flex justify-between items-center">
            <button
              onClick={() => setPage(Math.max(page - 1, 1))}
              disabled={page === 1}
              className="px-3 py-1.5 bg-[#0f172a] border border-gray-700 rounded-md hover:bg-slate-800 text-sm font-semibold disabled:opacity-40 cursor-pointer"
            >
              Previous
            </button>
            <span className="text-gray-400 text-sm">
              Page {page} of {pages}
            </span>
            <button
              onClick={() => setPage(Math.min(page + 1, pages))}
              disabled={page === pages}
              className="px-3 py-1.5 bg-[#0f172a] border border-gray-700 rounded-md hover:bg-slate-800 text-sm font-semibold disabled:opacity-40 cursor-pointer"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
