import { useEffect, useRef } from "react";
import { gsap } from "gsap";

const components = [
  { name: "Raspberry Pi Zero W", details: "Main controller board", img: "/image/raspberry_pi.jpg" },
  { name: "Camera Module", details: "Captures real-time stream", img: "/image/Camera.jpg" },
  { name: "YOLO AI Model", details: "Object & fire detection", img: "/image/YOLO.jpg" },
  { name: "Node.js Server", details: "Backend communication layer", img: "/image/node.png" },
  { name: "React Dashboard", details: "User monitoring interface", img: "/image/React.webp" },
];

export default function ComponentCarousel() {
  const trackRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const track = trackRef.current;

    animationRef.current = gsap.to(track, {
      x: "-50%",
      duration: 40,
      ease: "linear",
      repeat: -1,
    });

    return () => {
      animationRef.current.kill();
    };
  }, []);

  return (
    <div
      className="overflow-hidden py-8"
      onMouseEnter={() => animationRef.current.pause()}
      onMouseLeave={() => animationRef.current.play()}
    >
      <div
        ref={trackRef}
        className="flex gap-10 w-max"
      >
        {[...components, ...components].map((c, i) => (
          <div
            key={i}
            className="group relative w-72 h-96 bg-[#0f172a] border border-gray-700 text-white rounded-2xl flex flex-col items-center justify-start p-6 cursor-pointer transition-transform duration-300 hover:scale-105"
          >
            {/* Component Name */}
            <h3 className="text-lg font-semibold mb-6 text-cyan-400 text-center">
              {c.name}
            </h3>

            {/* Component Image */}
            <div className="w-60 h-80 rounded-lg overflow-hidden mb-6">
              <img
                src={c.img}
                alt={c.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Hover Overlay (Details) */}
            <div className="absolute inset-0 bg-black/90 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-2xl flex flex-col items-center justify-center p-6 text-sm text-center">
              <h4 className="text-cyan-400 font-semibold mb-3">
                {c.name}
              </h4>
              <p className="text-gray-300">{c.details}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
