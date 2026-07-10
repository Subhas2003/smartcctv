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
    gsap.from(navRef.current, {
      y: -40,
      opacity: 0,
      duration: 1,
    });
  }, []);

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

  const getAvatarLetter = () => {
    if (user?.name) return user.name[0].toUpperCase();
    if (user?.email) return user.email[0].toUpperCase();
    return "";
  };

  const linkStyle = ({ isActive }) =>
    `block py-3 px-4 text-base md:text-lg font-semibold transition ${isActive
      ? "text-white"
      : "text-black hover:text-slate-700 hover:underline"
    }`;

  return (
    <nav
      ref={navRef}
      className="fixed top-0 left-0 w-full flex justify-between items-center px-6 md:px-12 py-4 bg-[#A9AAF7] z-[100]"
    >
      {/* LOGO SECTION */}
      <div className="flex items-center gap-3">
        <NavLink to="/">
          <img
            src="/image/botImage.png"
            alt="Logo"
            className="w-14 h-14 object-contain"
          />
        </NavLink>
        <NavLink to="/">
          <img
            src="/image/bot.png"
            alt="AI Watch Patrol"
            className="w-64 h-12 object-contain"
          />
        </NavLink>

      </div>

      {/* DESKTOP MENU */}
      <div className="hidden md:flex items-center space-x-4">
        <NavLink to="/" className={linkStyle}>
          Home
        </NavLink>

        {token && (
          <NavLink to="/camera" className={linkStyle}>
            Dashboard
          </NavLink>
        )}

        {token && (
          <NavLink to="/cameras" className={linkStyle}>
            Cameras
          </NavLink>
        )}


        {token && (
          <NavLink to="/recordings" className={linkStyle}>
            Recordings
          </NavLink>
        )}

        {token && (
          <NavLink to="/alerts" className={linkStyle}>
            Alerts
          </NavLink>
        )}

        <NavLink to="/about" className={linkStyle}>
          About
        </NavLink>

        {!token ? (
          <NavLink
            to="/login"
            className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-xl font-semibold shadow-lg transition-all duration-300 cursor-pointer"
          >
            Login
          </NavLink>
        ) : (
          <div className="relative ml-4">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-10 h-10 rounded-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold flex items-center justify-center border border-cyan-300 transition cursor-pointer"
            >
              {getAvatarLetter()}
            </button>

            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setDropdownOpen(false)}
                />

                <div className="absolute right-0 mt-3 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-20 py-2">
                  <div className="px-4 py-3 border-b border-slate-700">
                    <p className="text-white font-semibold truncate">
                      {user?.name || "User"}
                    </p>

                    <p className="text-slate-400 text-xs truncate">
                      {user?.email || "Active Session"}
                    </p>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                  >
                    🚪 Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* MOBILE MENU BUTTON */}
      <div className="md:hidden flex items-center gap-4">

        {token && (
          <div className="w-8 h-8 rounded-full bg-cyan-500 text-black font-bold flex items-center justify-center">
            {getAvatarLetter()}
          </div>
        )}

        <button
          onClick={() => setOpen(true)}
          className="text-2xl text-black"
        >
          ☰
        </button>

      </div>

      {/* OVERLAY */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/60 z-[110] md:hidden"
        />
      )}

      {/* MOBILE MENU */}
      <div
        ref={menuRef}
        className="fixed md:hidden top-0 right-0 h-full w-72 bg-slate-900 border-l border-slate-700 shadow-2xl z-[120] translate-x-[100%]"
      >
        <div className="flex justify-between items-center p-5 border-b border-slate-700">
          <span className="text-cyan-400 font-bold">
            Menu
          </span>

          <button
            onClick={() => setOpen(false)}
            className="text-2xl text-white"
          >
            ✖
          </button>
        </div>

        <div className="flex flex-col mt-4 px-4">

          <NavLink
            to="/"
            onClick={() => setOpen(false)}
            className="py-3 text-white"
          >
            Home
          </NavLink>

          {token && (
            <>
              <NavLink
                to="/camera"
                onClick={() => setOpen(false)}
                className="py-3 text-white"
              >
                Dashboard
              </NavLink>

              <NavLink
                to="/cameras"
                onClick={() => setOpen(false)}
                className="py-3 text-white"
              >
                Cameras
              </NavLink>

              <NavLink
                to="/recordings"
                onClick={() => setOpen(false)}
                className="py-3 text-white"
              >
                Recordings
              </NavLink>

              <NavLink
                to="/alerts"
                onClick={() => setOpen(false)}
                className="py-3 text-white"
              >
                Alerts
              </NavLink>
            </>
          )}

          <NavLink
            to="/about"
            onClick={() => setOpen(false)}
            className="py-3 text-white"
          >
            About
          </NavLink>

          {!token ? (
            <NavLink
              to="/login"
              onClick={() => setOpen(false)}
              className="mt-4 bg-cyan-500 text-black text-center py-2 rounded-lg font-semibold"
            >
              Login
            </NavLink>
          ) : (
            <button
              onClick={handleLogout}
              className="mt-4 bg-red-600/20 text-red-400 py-2 rounded-lg"
            >
              Sign Out
            </button>
          )}

        </div>
      </div>
    </nav>
  );
}