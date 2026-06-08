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
     // Mouse glow movement
    const moveGlow = (e) => {
      gsap.to(glowRef.current, {
        x: e.clientX - 150,
        y: e.clientY - 150,
        duration: 0.4,
        ease: "power2.out",
      });
    };

    window.addEventListener("mousemove", moveGlow);

    return () => window.removeEventListener("mousemove", moveGlow);

  }, []);
  

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-linear-to-b from-[#050d1f] to-[#020617] text-white px-10 py-20"
    >
         <div
        ref={glowRef}
        className="absolute w-[300px] h-[300px] bg-cyan-500/20 rounded-full blur-3xl pointer-events-none"
      ></div>
      {/* Heading */}
      <div className="text-center mb-14">
        <h1 className="text-4xl font-bold mb-4">
          About The Project
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Learn more about our intelligent warehouse surveillance system
          and the technologies powering it.
        </p>
      </div>

      {/* Content Cards */}
      <div className="grid md:grid-cols-2 gap-10 max-w-6xl mx-auto">

        {/* Key Features */}
        <div className="bg-[#0f172a] border border-gray-700 p-8 rounded-2xl shadow-xl">
          <h2 className="text-xl font-semibold mb-4 text-cyan-400">
            🔍 Key Features
          </h2>
          <ul className="space-y-3 text-gray-300">
            <li>• Real-time camera streaming</li>
            <li>• AI-based fire detection</li>
            <li>• Automatic alert system</li>
            <li>• Secure authentication system</li>
            <li>• Wireless remote monitoring</li>
          </ul>
        </div>

        {/* Technologies */}
        <div className="bg-[#0f172a] border border-gray-700 p-8 rounded-2xl shadow-xl">
          <h2 className="text-xl font-semibold mb-4 text-cyan-400">
            ⚙️ Technologies Used
          </h2>
          <ul className="space-y-3 text-gray-300">
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
      <div className="max-w-4xl mx-auto mt-16 bg-[#0f172a] border border-gray-700 p-8 rounded-2xl shadow-xl">
        <h2 className="text-xl font-semibold mb-4 text-cyan-400">
          🎯 Project Objective
        </h2>
        <p className="text-gray-300 leading-relaxed">
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
