import { useEffect, useRef, useContext } from "react";
import { gsap } from "gsap";
import { useNavigate } from "react-router-dom";
import ComponentCarousel from "../components/ComponentCarousel";
import { AuthContext } from "../context/AuthContext";

export default function Home() {
  const containerRef = useRef(null);
  const botRef = useRef(null);
  const glowRef = useRef(null);

  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  useEffect(() => {
    gsap.from(containerRef.current.children, {
      opacity: 0,
      y: 40,
      stagger: 0.2,
      duration: 1,
      ease: "power3.out",
    });

    const tl = gsap.timeline({
      repeat: -1,
      repeatDelay: 1,
    });

    // tl.to(botRef.current, {
    //   width: "5.5ch",
    //   duration: 1.5,
    // }).to(botRef.current, {
    //   width: "0ch",
    //   duration: 1,
    //   delay: 1,
    // });
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#ADAAF7] via-[#BEC3FF] to-[#D9F9DF]">

      {/* Glow */}
      <div
        ref={glowRef}
        className="absolute top-40 right-20 w-[300px] h-[300px] bg-cyan-300/20 rounded-full blur-3xl pointer-events-none"
      />

      <div ref={containerRef} className="relative z-10">

        {/* HERO SECTION */}
        <section className="grid md:grid-cols-2 items-center px-6 md:px-12 py-20 md:py-32 gap-12">

          {/* LEFT */}
          <div className="md:pl-20 text-center md:text-left">

            <h1 className="text-4xl font-array-BoldWide sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight mb-6">
             AI-Powered
              <br />
              Self Balance
              <br />
              Surveillance{" "}
              <span
                // ref={botRef}
                className="inline-block overflow-hidden whitespace-nowrap text-cyan-600"
                // style={{ width: "0ch" }}
              >
                  Robot
              </span>
            </h1>

            <p className="text-slate-700 text-base md:text-lg leading-relaxed max-w-xl mb-8 mx-auto md:mx-0">
              Intelligent warehouse monitoring system powered by AI
              object detection, fire detection, real-time alerting,
              and secure remote monitoring.
            </p>

            <button
              onClick={() => navigate(token ? "/camera" : "/login")}
              className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-xl font-semibold shadow-lg transition-all duration-300 cursor-pointer"
            >
              Get Started →
            </button>

          </div>

          {/* RIGHT */}
          <div className="flex justify-center">

            <div className="w-[280px] h-[280px] sm:w-[350px] sm:h-[350px] md:w-[450px] md:h-[450px] rounded-full bg-gradient-to-br from-white/40 to-cyan-200/30 backdrop-blur-sm border border-white/40 shadow-[0_0_80px_rgba(255,255,255,0.35)] flex items-center justify-center">

              <div className="w-[88%] h-[88%] rounded-full overflow-hidden border border-white/30">

                <img
                  src="/image/bot.webp"
                  alt="Surveillance Bot"
                  className="w-full h-full object-cover"
                />

              </div>

            </div>

          </div>

        </section>

        {/* TOOLS SECTION */}
        <section className="px-6 md:px-12 py-20">

          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 text-center mb-12">
            Tools & Frameworks
          </h2>

          <ComponentCarousel />

        </section>

        {/* Transition to Footer */}
        <div className="h-20 bg-gradient-to-b from-transparent to-[#D9F9DF]" />

      </div>
    </div>
  );
}