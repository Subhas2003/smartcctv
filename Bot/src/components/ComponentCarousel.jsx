import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import SoftwareArchitecture from "./softwareArchitecture";
import HardwareArchitecture from "./hardwareArchitecture"
import MehanicaArchitecture from "./mechanicalArchitecture"

const architectures = [
  {
    name: "Software Architecture",
    image: "/image/MernWorkflow.jpeg",
    // description:
    //   "The software architecture consists of React frontend, Node.js backend, MongoDB database, Cloudflare Tunnel, Raspberry Pi processing, and AWS cloud storage. It enables secure remote monitoring, real-time video streaming, intelligent detection, and centralized management through the MERN dashboard.",

    description: (
      <SoftwareArchitecture />
    ),
  },
  {
    name: "Mechanical Architecture",
    image: "/image/mechanical.jpg",
    // description:
    //   "The mechanical architecture includes the self-balancing chassis, motor assembly, wheel system, camera mounting mechanism, protective body frame, and servo positioning system for stable operation.",

    description:(
      <MehanicaArchitecture />
    )
  },
  {
    name: "Hardware Architecture",
    image: "/image/hardware.jpg",
    // description:
    //   "The hardware architecture consists of Raspberry Pi Zero W, Pi Camera Module, ESP32 WROVER, ICM20948 sensor, BTS7960 motor driver, battery system, and wireless communication modules.",

     description:(
     
       <HardwareArchitecture />
    )
  },
];

export default function ArchitectureSection() {
  const [current, setCurrent] = useState(0);
  const [open, setOpen] = useState(false);
  const [selectedArchitecture, setSelectedArchitecture] = useState(null);

  // Pause auto-slide while popup is open
  useEffect(() => {
    if (open) return;

    const interval = setInterval(() => {
      setCurrent((prev) =>
        prev === architectures.length - 1 ? 0 : prev + 1
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [open]);

  const nextSlide = () => {
    setCurrent((prev) =>
      prev === architectures.length - 1 ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrent((prev) =>
      prev === 0 ? architectures.length - 1 : prev - 1
    );
  };

  const openArchitecture = () => {
    setSelectedArchitecture(architectures[current]);
    setOpen(true);
  };

  const closeArchitecture = () => {
    setOpen(false);
    setSelectedArchitecture(null);
  };

  const left =
    current === 0
      ? architectures.length - 1
      : current - 1;

  const right =
    current === architectures.length - 1
      ? 0
      : current + 1;

  return (
    <>
      <section className="py-20 px-6 bg-[#ADAAF7] rounded-3xl overflow-hidden">
        <div className="max-w-7xl mx-auto">

          <h2 className="text-4xl font-bold text-center mb-14 text-slate-800">
            System Architecture
          </h2>

          <div className="relative flex items-center justify-center">

            {/* Left Arrow */}
            <button
              onClick={prevSlide}
              className="absolute left-0 z-30 bg-white p-3 rounded-full shadow-lg hover:scale-110 transition cursor-pointer"
            >
              <ChevronLeft size={28} />
            </button>

            {/* Cards */}
            <div className="flex items-center justify-center gap-6 w-full">

              {/* Left Preview */}
              <div className="hidden md:block w-64 opacity-40 scale-75">
                <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
                  <img
                    src={architectures[left].image}
                    alt={architectures[left].name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4 text-center font-semibold">
                    {architectures[left].name}
                  </div>
                </div>
              </div>

              {/* Active Card */}
              <div
                onClick={openArchitecture}
                className="w-full md:w-[650px] cursor-pointer hover:scale-105 transition duration-300"
              >
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                  <img
                    src={architectures[current].image}
                    alt={architectures[current].name}
                    className="w-full h-[350px] object-contain bg-slate-100 p-4"
                  />

                  <div className="p-6 text-center">
                    <h3 className="text-3xl font-bold text-slate-800">
                      {architectures[current].name}
                    </h3>

                    <p className="mt-3 text-slate-500">
                      Click to view complete architecture
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Preview */}
              <div className="hidden md:block w-64 opacity-40 scale-75">
                <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
                  <img
                    src={architectures[right].image}
                    alt={architectures[right].name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4 text-center font-semibold">
                    {architectures[right].name}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Arrow */}
            <button
              onClick={nextSlide}
              className="absolute right-0 z-30 bg-white p-3 rounded-full shadow-lg hover:scale-110 transition cursor-pointer"
            >
              <ChevronRight size={28} />
            </button>
          </div>

          {/* Dots */}
          <div className="flex justify-center mt-10 gap-3">
            {architectures.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrent(index)}
                className={`rounded-full transition-all duration-300 ${
                  current === index
                    ? "w-10 h-3 bg-slate-800"
                    : "w-3 h-3 bg-slate-500 opacity-40"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Popup */}
      {open && selectedArchitecture && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={closeArchitecture}
        >
          <div
            className="bg-white rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-y-auto p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeArchitecture}
              className="absolute top-5 right-5 text-slate-700 hover:text-red-500 cursor-pointer"
            >
              <X size={32} />
            </button>

            <img
              src={selectedArchitecture.image}
              alt={selectedArchitecture.name}
              className="w-full max-h-[70vh] object-contain"
            />

            <h2 className="text-4xl font-bold mt-8 text-center text-slate-800">
              {selectedArchitecture.name}
            </h2>

            <p className="mt-6 text-slate-600 text-lg leading-relaxed text-start max-w-4xl mx-auto">
              {selectedArchitecture.description}
            </p>
          </div>
        </div>
      )}
    </>
  );
}