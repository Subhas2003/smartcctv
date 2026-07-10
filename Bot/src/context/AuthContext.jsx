import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const parseJwt = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    const stored = localStorage.getItem("token");
    return stored === "undefined" || stored === "null" ? null : stored;
  });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile on mount to verify token validity
  useEffect(() => {
    const verifyTokenOnStart = async () => {
      if (!token || token === "undefined" || token === "null") {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_URL}/auth/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
        } else {
          // Token is invalid/expired
          console.warn("Session expired or invalid token on startup.");
          logout();
        }
      } catch (err) {
        console.error("Error verifying session:", err);
      } finally {
        setLoading(false);
      }
    };

    verifyTokenOnStart();
  }, [token]);

  const login = async (email, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to sign in");
    }

    if (data.requiresOtp) {
      return data;
    }

    localStorage.setItem("token", data.token);
    setToken(data.token);
    setUser(data);
    return data;
  };

  const signup = async (name, email, password) => {
    const res = await fetch(`${API_URL}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to create account");
    }

    if (data.token) {
      localStorage.setItem("token", data.token);
      setToken(data.token);
      setUser(data);
    }
    return data;
  };

  const loginWithGoogle = async (credential) => {
    const res = await fetch(`${API_URL}/auth/google`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ credential }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed Google Sign-In");
    }

    if (data.requiresOtp) {
      return data;
    }

    localStorage.setItem("token", data.token);
    setToken(data.token);
    setUser(data);
    return data;
  };

  const verifyOtp = async (email, code) => {
    const res = await fetch(`${API_URL}/auth/verify-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, code }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Verification failed");
    }

    localStorage.setItem("token", data.token);
    setToken(data.token);
    setUser(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  // Set up auto-logout timer based on JWT expiration
  useEffect(() => {
    if (!token || token === "undefined" || token === "null") return;

    const decoded = parseJwt(token);
    if (decoded && decoded.exp) {
      const expirationTime = decoded.exp * 1000;
      const timeLeft = expirationTime - Date.now();

      if (timeLeft <= 0) {
        console.warn("Session already expired. Logging out...");
        logout();
      } else {
        const minutesLeft = Math.round(timeLeft / 1000 / 60);
        console.log(`Session expires in ${minutesLeft} minutes.`);
        const timer = setTimeout(() => {
          console.warn("Session expired. Automatically logging out...");
          logout();
        }, timeLeft);

        return () => clearTimeout(timer);
      }
    }
  }, [token]);

  // Global fetch interceptor to catch 401 Unauthorized errors and force logout
  useEffect(() => {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      if (response.status === 401 && localStorage.getItem("token")) {
        console.warn("API returned 401 Unauthorized. Logging out...");
        logout();
      }
      return response;
    };
    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        login,
        signup,
        loginWithGoogle,
        verifyOtp,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

