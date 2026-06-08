import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

export default function CameraFeed({ url, onLoaded, onError }) {
  const feedRef = useRef(null);
  const wrapperRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    gsap.from(feedRef.current, {
      opacity: 0,
      y: 20,
      duration: 0.6,
      ease: "power2.out",
    });
  }, [url]);

  // Fullscreen toggle (cross-browser)
  const toggleFullscreen = () => {
    const el = wrapperRef.current;
    if (!document.fullscreenElement) {
      if (el.requestFullscreen) el.requestFullscreen();
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
      else if (el.msRequestFullscreen) el.msRequestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      else if (document.msExitFullscreen) document.msExitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      {/* Fullscreen Button */}
      <button
        onClick={toggleFullscreen}
        className="absolute top-3 right-3 z-20 bg-black/70 hover:bg-black text-white text-xs md:text-sm px-3 py-1 rounded-lg"
      >
        {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
      </button>

      {/* Video/Image Feed */}
      <img
        ref={feedRef}
        src={url}
        alt="Live Camera Stream"
        className="w-full max-h-[70vh] md:max-h-[80vh] object-contain rounded-xl border border-gray-700 shadow-lg"
        onLoad={onLoaded}
        onError={onError}
      />
    </div>
  );
}
