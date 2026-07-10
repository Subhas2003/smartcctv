// src/data/HardwareArchitectureContent.jsx

export default function HardwareArchitectureContent() {
  return (
    <>
      <ul className="list-disc pl-6 space-y-6">
        <li>
          <strong>Processing Core</strong>

          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li>
              <strong>ESP32-WROVER Microcontroller:</strong> The heart of the
              balancing system is a dual-core ESP32. It separates tasks to
              maintain a strict real-time control loop: Core 0 handles the
              time-critical PID balancing math, while Core 1 manages remote
              control inputs and telemetry.
            </li>
          </ul>
        </li>

        <li>
          <strong>Sensing & Signal Interface</strong>

          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li>
              <strong>Inertial Measurement Unit (IMU):</strong> It uses a
              SparkFun ICM-20948 (9-axis) for tilt sensing. Rather than the
              ESP32 doing the raw math, the IMU's onboard Digital Motion
              Processor (DMP) handles the sensor fusion internally and streams
              clean, fused digital pitch data directly to the ESP32 via an I2C
              bus.
            </li>

            <li>
              <strong>Ultrasonic Sensors:</strong> Three HC-SR04 sensors are
              angled to provide a 270-degree field of view for obstacle
              avoidance. Because these output a 5V signal and the ESP32 is only
              3.3V tolerant, a passive voltage divider network is used on each
              ECHO line to safely step down the analog logic levels.
            </li>
          </ul>
        </li>

        <li>
          <strong>Actuation & Power Management</strong>

          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li>
              <strong>Motor Control:</strong> A Cytron MDD3A dual-channel
              driver accepts 3.3V PWM signals directly from the ESP32 to
              bidirectionally control the wheels.
            </li>

            <li>
              <strong>Motors:</strong> The physical balancing and driving are
              performed by two GB37 12V DC brushed gear motors operating at
              200 RPM.
            </li>

            <li>
              <strong>Power Supply:</strong> A 3S LiPo battery (11.1V) powers
              the entire system. The raw 11.1V goes directly to the motor
              driver, while an XL4015 Buck Converter steps the voltage down to
              create a stable, isolated logic rail for the microcontrollers and
              sensors. All components are tied to a single common ground to
              prevent erratic signal noise.
            </li>
          </ul>
        </li>
      </ul>
    </>
  );
}