// src/data/MechanicalArchitectureContent.jsx

export default function MechanicalArchitectureContent() {
  return (
    <>
      <ul className="list-disc pl-6 space-y-4">
        <li>
          <strong>AI-Powered Smart Surveillance System (Left):</strong> This
          stationary system is driven by a Raspberry Pi 4 and a Pi Camera
          Module. It utilizes YOLOv5 machine learning models to detect specific
          hazards—such as fires, tow trucks, falling objects, and helmet
          violations. Data and alerts are stored in AWS S3 and displayed to
          users via a MERN stack dashboard.
        </li>

        <li>
          <strong>Self-Balancing Autonomous Robot (Right):</strong> This mobile
          unit is controlled by an ESP32-WROVER microcontroller. It maintains
          its balance using an ICM-20948 IMU paired with a PID controller and
          drives its motors via a Cytron MDD3A driver. For navigation and
          safety, it uses HC-SR04 ultrasonic sensors for obstacle avoidance and
          includes a Flysky FS-i6X receiver for optional remote control.
        </li>

        <li>
          <strong>
            Integrated Smart Security & Monitoring Platform (Center/Bottom):
          </strong>{" "}
          Both the stationary surveillance network and the mobile robot feed
          their data (real-time alerts, hazard detection, and path planning)
          into this centralized platform to create a cohesive security and
          monitoring ecosystem.
        </li>
      </ul>
    </>
  );
}