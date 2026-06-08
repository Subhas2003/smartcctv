import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { NavLink } from "react-router-dom";

export default function Footer() {
  const footerRef = useRef(null);

  useEffect(() => {
    gsap.from(footerRef.current, {
      opacity: 0,
      y: 40,
      duration: 1,
      ease: "power2.out",
    });
  }, []);

  const linkStyle = ({ isActive }) =>
    `text-sm ${
      isActive ? "text-cyan-400" : "text-gray-300"
    } hover:text-cyan-400 transition`;

  return (
    <footer
      ref={footerRef}
      className="bg-gray-900 text-gray-400 px-6 md:px-12 py-12 border-t border-gray-700"
    >
      {/* MAIN GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
        
        {/* Column 1 */}
        <div>
          <h3 className="text-white text-lg font-semibold mb-3">
            Smart Surveillance
          </h3>
          <p className="text-sm leading-relaxed">
            AI-based warehouse monitoring system designed
            for real-time safety and intelligent detection.
          </p>
        </div>

        {/* Column 2 */}
        <div>
          <h3 className="text-white text-lg font-semibold mb-3">
            Quick Links
          </h3>

          <ul className="flex flex-col space-y-2">
            <NavLink to="/" className={linkStyle}>Home</NavLink>
            <NavLink to="/camera" className={linkStyle}>Camera</NavLink>
            <NavLink to="/about" className={linkStyle}>About</NavLink>
            <NavLink to="/login" className={linkStyle}>Login</NavLink>
            <NavLink to="/signup" className={linkStyle}>Signup</NavLink>
          </ul>
        </div>

        {/* Column 3 */}
        <div>
          <h3 className="text-white text-lg font-semibold mb-3">
            Contact Info
          </h3>
          <p className="text-sm">Email: demo@example.com</p>
          <p className="text-sm">Location: Smart Lab</p>
          <p className="text-sm">Project Type: Academic Demo</p>
        </div>

      </div>

      {/* BOTTOM BAR */}
      <div className="border-t border-gray-700 mt-10 pt-6 text-center text-xs md:text-sm">
        © 2026 Self-Balanced Warehouse Surveillance Bot.  
        All rights reserved.
      </div>
    </footer>
  );
}
