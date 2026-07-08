import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { NavLink } from "react-router-dom";

export default function Footer() {
  const footerRef = useRef(null);

  useEffect(() => {
    gsap.from(footerRef.current, {
      opacity: 0,
      y: 5,
      duration: 1,
      ease: "power2.out",
    });
  }, []);

  const linkStyle = ({ isActive }) =>
    `text-sm transition ${
      isActive
        ? "text-slate-800 font-medium"
        : "text-slate-600 hover:text-slate-900 hover:underline"
    }`;

  return (
    <>
      {/* Smooth Transition */}
      <div className="h-0.1 border-t border-slate-400/40 " />
      {/* from-[#ADAAF7] to-[#D9F9DF] */}

      <footer
        ref={footerRef}
        className="bg-[#D9F9DF] px-6 md:px-12 py-12"
      >
        {/* Main Content */}
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-center gap-24">
          
          {/* Quick Links */}
          <div>
            <h3 className="text-black text-xl font-semibold mb-4">
              Quick Links
            </h3>

            <ul className="flex flex-col space-y-2">
              <NavLink to="/" className={linkStyle}>
                Home
              </NavLink>

              <NavLink to="/camera" className={linkStyle}>
                Camera
              </NavLink>

              <NavLink to="/about" className={linkStyle}>
                About
              </NavLink>

              <NavLink to="/login" className={linkStyle}>
                Login
              </NavLink>

              <NavLink to="/signup" className={linkStyle}>
                Signup
              </NavLink>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-black text-xl font-semibold mb-4">
              Contact Info
            </h3>

            <div className="space-y-2 text-slate-700">
              <p>
                <span className="font-medium">Email:</span>{" "}
                smartcctv.official2026@gmail.com
              </p>

              <p>
                <span className="font-medium">Location:</span>{" "}
                Kolkata, West Bengal
              </p>

              <p>
                <span className="font-medium">Project Type:</span>{" "}
                Smart AI Surveillance Roobot
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="max-w-4xl mx-auto border-t border-slate-400/40 mt-10 pt-6">
          <p className="text-center text-slate-700 text-sm">
            © 2026 Self-Balanced Warehouse Surveillance Bot.
            <br />
            All rights reserved.
          </p>
        </div>
      </footer>
    </>
  );
}