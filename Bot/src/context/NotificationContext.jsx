import { createContext, useState, useEffect, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import { socket, connectSocket, disconnectSocket } from "../services/socket";
import alarmSound from "../assets/sound/alarm.mp3";

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activePopup, setActivePopup] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const audioRef = useRef(null);

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

  useEffect(() => {
    if (!token || token === "undefined" || token === "null") {
      // Clean up when user logs out
      setActivePopup(null);
      if (audioRef.current) {
        audioRef.current.pause();
      }
      socket.off("new_alert");
      disconnectSocket();
      return;
    }

    // Connect socket for logged in user
    connectSocket();

    const handleNewAlert = (alert) => {
      const isCritical = alert.type === "Fire" || alert.type === "Smoke";
      const icon = alert.type === "Fire" ? "🔥" : alert.type === "Smoke" ? "💨" : alert.type === "Person" ? "👤" : "🏃‍♂️";

      setActivePopup({
        title: `${icon} ${alert.type} Detected`,
        message: `Camera: ${alert.cameraName}  | Confidence: ${alert.confidence}%`,
        type: isCritical ? "critical" : "info",
        timestamp: alert.timestamp,
      });

      if (isCritical) {
        playAlarm();
        triggerBrowserNotification(
          `${icon} CRITICAL ALERT`,
          `${alert.type} detected at ${alert.cameraName} - ${alert.location || "Unknown"} (${alert.confidence}% confidence)`
        );
      }
    };

    socket.on("new_alert", handleNewAlert);

    return () => {
      socket.off("new_alert", handleNewAlert);
    };
  }, [token, soundEnabled]); // Depend on soundEnabled so playAlarm gets the updated state

  const handleClosePopup = () => {
    setActivePopup(null);
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        activePopup,
        setActivePopup,
        soundEnabled,
        setSoundEnabled,
        audioRef,
      }}
    >
      {children}
      {/* Hidden audio element for global alarm playback */}
      <audio ref={audioRef} src={alarmSound} loop />

      {/* Global alert popup rendering */}
      {activePopup && (
        <div
          className={`fixed bottom-6 right-6 z-50 p-5 rounded-2xl shadow-2xl border flex flex-col gap-2 max-w-sm w-full animate-slide-up ${
            activePopup.type === "critical"
              ? "bg-red-950/90 border-red-500 text-white"
              : "bg-slate-900/90 border-cyan-500 text-white"
          }`}
        >
          <div className="flex justify-between items-start">
            <h3 className="font-bold text-lg">{activePopup.title}</h3>
            <button
              onClick={handleClosePopup}
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
    </NotificationContext.Provider>
  );
};
