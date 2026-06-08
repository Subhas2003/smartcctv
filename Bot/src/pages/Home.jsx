import { useEffect, useRef, useContext } from "react";
import { gsap } from "gsap";
import { useNavigate } from "react-router-dom";
import ComponentCarousel from "../components/ComponentCarousel";
import botVideo from "../assets/video/bot.mp4";
import { AuthContext } from "../context/AuthContext";

export default function Home() {
  const containerRef = useRef(null);
  const botRef = useRef(null);
  const glowRef = useRef(null);
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  useEffect(() => {
    // Entry animation
    gsap.from(containerRef.current.children, {
      opacity: 0,
      y: 40,
      stagger: 0.2,
      duration: 1,
      ease: "power3.out",
    });

    // BOT write erase animation
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 1 });

    tl.to(botRef.current, { width: "3.5ch", duration: 1 })
      .to(botRef.current, { width: "0ch", duration: 1, delay: 1 });

    // Mouse glow effect
    const moveGlow = (e) => {
      gsap.to(glowRef.current, {
        x: e.clientX - 150,
        y: e.clientY - 150,
        duration: 0.4,
      });
    };

    window.addEventListener("mousemove", moveGlow);
    return () => window.removeEventListener("mousemove", moveGlow);
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#050d1f] to-[#020617] overflow-hidden text-white">

      {/* Glow */}
      <div
        ref={glowRef}
        className="absolute w-[250px] md:w-[300px] h-[250px] md:h-[300px] bg-cyan-500/20 rounded-full blur-3xl pointer-events-none"
      ></div>

      <div ref={containerRef} className="relative z-10">

        {/* HERO SECTION */}
        <div className="grid md:grid-cols-2 items-center px-6 md:px-12 py-16 md:py-24 gap-10">

          {/* LEFT TEXT */}
          <div className="md:pl-20 text-center md:text-left">
            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
              Self Balance <br />
              Power House <br />
              Surveillance{" "}
              <span
                ref={botRef}
                className="inline-block overflow-hidden whitespace-nowrap text-cyan-400"
                style={{ width: "0ch" }}
              >
                Bot
              </span>
            </h1>

            <p className="text-gray-400 mb-8 max-w-md mx-auto md:mx-0 text-sm md:text-base">
              Intelligent warehouse monitoring system powered by AI detection,
              real-time alerting and wireless remote access.
            </p>

            <button
              onClick={() => navigate(token ? "/camera" : "/login")}
              className="bg-cyan-500 hover:bg-cyan-600 px-6 py-3 cursor-pointer rounded-lg font-semibold text-black transition"
            >
              Get Started →
            </button>
          </div>

          {/* RIGHT VIDEO CIRCLE */}
          <div className="flex justify-center mt-8 md:mt-0">
            <div className="w-[260px] h-[260px] sm:w-[320px] sm:h-[320px] md:w-[420px] md:h-[420px] rounded-full bg-gradient-to-br from-cyan-500/30 to-blue-500/20 flex items-center justify-center shadow-2xl border border-gray-700">
              <div className="w-[85%] h-[85%] rounded-full overflow-hidden border border-gray-600">
                <video
                  src={botVideo}
                  muted
                  autoPlay
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

        </div>

        {/* COMPONENT SECTION */}
        <div className="px-6 md:px-12 pb-16 md:pb-24">

          <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-center">
            Components Used
          </h2>

          <ComponentCarousel />

        </div>
      </div>
    </div>
  );
}
