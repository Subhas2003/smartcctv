import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

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

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        login,
        signup,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

