import { useEffect, useRef, useState, useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const navRef = useRef(null);
  const menuRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { token, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    gsap.from(navRef.current, { y: -40, opacity: 0, duration: 1 });
  }, []);

  // slide animation for mobile menu
  useEffect(() => {
    if (open) {
      gsap.to(menuRef.current, {
        x: 0,
        duration: 0.4,
        ease: "power3.out",
      });
      document.body.style.overflow = "hidden";
    } else {
      gsap.to(menuRef.current, {
        x: "100%",
        duration: 0.4,
        ease: "power3.in",
      });
      document.body.style.overflow = "auto";
    }
  }, [open]);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    setOpen(false);
    navigate("/login");
  };

  const linkStyle = ({ isActive }) =>
    `block py-3 px-4 text-base md:text-sm font-semibold transition ${
      isActive ? "text-cyan-400" : "text-white hover:text-cyan-300"
    }`;

  const getAvatarLetter = () => {
    if (user && user.name) return user.name[0].toUpperCase();
    if (user && user.email) return user.email[0].toUpperCase();
    return "U";
  };

  return (
    <nav
      ref={navRef}
      className="fixed top-0 left-0 w-full flex justify-between items-center px-6 md:px-12 py-4 text-white border-b border-white/10 bg-slate-950/60  z-[100]"
      
    >
      {/* LEFT LOGO */}
      <NavLink to="/" className="text-xl text-cyan-400 font-bold tracking-wider hover:text-cyan-300 transition">
        SmartCCTV
      </NavLink>

      {/* DESKTOP MENU */}
      <div className="hidden md:flex items-center space-x-4">
        <NavLink to="/" className={linkStyle}>Home</NavLink>
        {token && <NavLink to="/camera" className={linkStyle}>Dashboard</NavLink>}
        {token && <NavLink to="/recordings" className={linkStyle}>Recordings</NavLink>}
        {token && <NavLink to="/alerts" className={linkStyle}>Alerts</NavLink>}
        <NavLink to="/about" className={linkStyle}>About</NavLink>

        {!token && (
          <>
            <NavLink to="/login" className="bg-cyan-500 hover:bg-cyan-600 px-4 py-2 rounded-lg font-bold text-black text-xs transition ml-2">Login</NavLink>
            {/* <NavLink
              to="/signup"
              className="bg-cyan-500 hover:bg-cyan-600 px-4 py-2 rounded-lg font-bold text-black text-xs transition ml-2"
            >
              Sign Up
            </NavLink> */}
          </>
        )}

        {/* USER PROFILE AVATAR & DROPDOWN */}
        {token && (
          <div className="relative ml-4">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-9 h-9 rounded-full bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold flex items-center justify-center text-sm border-2 border-cyan-300 shadow-md cursor-pointer transition"
            >
              {getAvatarLetter()}
            </button>

            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-3 w-56 bg-[#0f172a] border border-gray-700 rounded-xl shadow-2xl z-20 py-2 animate-fade-in text-sm">
                  <div className="px-4 py-3 border-b border-gray-800">
                    <p className="text-gray-200 font-semibold truncate">{user?.name || "User"}</p>
                    <p className="text-gray-500 text-xs truncate mt-0.5">{user?.email || "Active Session"}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 hover:bg-red-500/10 text-red-400 font-medium transition cursor-pointer"
                  >
                    🚪 Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* MOBILE MENU ICON */}
      <div className="md:hidden flex items-center gap-4">
        {token && (
          <div className="w-8 h-8 rounded-full bg-cyan-500 text-black font-extrabold flex items-center justify-center text-xs border border-cyan-300">
            {getAvatarLetter()}
          </div>
        )}
        <button onClick={() => setOpen(true)} className="text-2xl cursor-pointer">
          ☰
        </button>
      </div>

      {/* OVERLAY (click outside to close) */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[110] md:hidden"
        />
      )}

      {/* MOBILE SIDE MENU */}
      <div
        ref={menuRef}
        className="fixed md:hidden top-0 right-0 h-full w-72 bg-[#020617]/95 backdrop-blur-md border-l border-gray-800 shadow-2xl z-[120] translate-x-[100%]"
      >
        {/* CLOSE BUTTON */}
        <div className="flex justify-between items-center p-5 border-b border-gray-800">
          <span className="text-cyan-400 font-bold">Menu</span>
          <button
            onClick={() => setOpen(false)}
            className="text-2xl text-white cursor-pointer"
          >
            ✖
          </button>
        </div>

        {/* MENU LINKS */}
        <div className="flex flex-col mt-4 space-y-1 px-4">
          <NavLink to="/" onClick={() => setOpen(false)} className={linkStyle}>Home</NavLink>
          {token && <NavLink to="/camera" onClick={() => setOpen(false)} className={linkStyle}>Dashboard</NavLink>}
          {token && <NavLink to="/recordings" onClick={() => setOpen(false)} className={linkStyle}>Recordings</NavLink>}
          {token && <NavLink to="/alerts" onClick={() => setOpen(false)} className={linkStyle}>Alerts</NavLink>}
          <NavLink to="/about" onClick={() => setOpen(false)} className={linkStyle}>About</NavLink>

          {!token ? (
            <>
              <div className="border-t border-gray-800 my-4" />
              <NavLink to="/login" onClick={() => setOpen(false)} className={linkStyle}>Login</NavLink>
              <NavLink
                to="/signup"
                onClick={() => setOpen(false)}
                className="block text-center bg-cyan-500 hover:bg-cyan-600 px-4 py-2.5 rounded-lg font-bold text-black text-sm transition mt-2"
              >
                Sign Up
              </NavLink>
            </>
          ) : (
            <>
              <div className="border-t border-gray-800 my-4" />
              <button
                onClick={handleLogout}
                className="w-full text-center bg-red-600/20 hover:bg-red-600 hover:text-white text-red-400 py-2.5 rounded-lg text-sm font-semibold transition border border-red-500/20 cursor-pointer"
              >
                Sign Out
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
