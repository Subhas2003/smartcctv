import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function About() {
  const containerRef = useRef(null);
  const glowRef = useRef(null);

  useEffect(() => {
    gsap.from(containerRef.current.children, {
      opacity: 0,
      y: 30,
      stagger: 0.15,
      duration: 1,
      ease: "power2.out",
    });
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#ADAAF7] via-[#BEC3FF] to-[#D9F9DF] px-6 md:px-12 py-24"
    >
      {/* Glow Effect */}
      <div
        ref={glowRef}
        className="absolute top-40 left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-cyan-300/20 rounded-full blur-3xl pointer-events-none"
      />

      {/* Heading */}
      <div className="relative z-10 text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
          About The Project
        </h1>

        <p className="text-slate-700 max-w-2xl mx-auto text-lg">
          Learn more about our intelligent warehouse surveillance system
          and the technologies powering it.
        </p>
      </div>

      {/* Content Cards */}
      <div className="relative z-10 grid md:grid-cols-2 gap-10 max-w-6xl mx-auto">

        {/* Key Features */}
        <div className="bg-white/50 backdrop-blur-sm border border-white/40 p-8 rounded-3xl shadow-xl">
          <h2 className="text-2xl font-semibold mb-5 text-slate-900">
            🔍 Key Features
          </h2>

          <ul className="space-y-3 text-slate-700">
            <li>• Real-time camera streaming</li>
            <li>• AI-based fire detection</li>
            <li>• Automatic alert system</li>
            <li>• Secure authentication system</li>
            <li>• Wireless remote monitoring</li>
          </ul>
        </div>

        {/* Technologies */}
        <div className="bg-white/50 backdrop-blur-sm border border-white/40 p-8 rounded-3xl shadow-xl">
          <h2 className="text-2xl font-semibold mb-5 text-slate-900">
            ⚙️ Technologies Used
          </h2>

          <ul className="space-y-3 text-slate-700">
            <li>• Raspberry Pi Zero W</li>
            <li>• Python + OpenCV</li>
            <li>• YOLO / MobileNet</li>
            <li>• Node.js & Express</li>
            <li>• React + Tailwind CSS</li>
            <li>• GSAP Animations</li>
          </ul>
        </div>

      </div>

      {/* Objective Section */}
      <div className="relative z-10 max-w-5xl mx-auto mt-16 bg-white/50 backdrop-blur-sm border border-white/40 p-8 rounded-3xl shadow-xl">
        <h2 className="text-2xl font-semibold mb-5 text-slate-900">
          🎯 Project Objective
        </h2>

        <p className="text-slate-700 leading-relaxed text-lg">
          The primary goal of this system is to create a cost-effective,
          AI-driven surveillance solution capable of detecting fire and
          monitoring warehouse environments in real-time. The system
          ensures instant alerts, remote accessibility, and a modern
          web-based dashboard interface for seamless monitoring.
        </p>
      </div>
    </div>
  );
}