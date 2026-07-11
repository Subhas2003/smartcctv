// src/data/SoftwareArchitectureContent.jsx

export default function SoftwareArchitectureContent() {
  return (
    <>
      <h3 className="font-bold text-lg mb-2">1. User Registration</h3>
      <p>
        The registration process allows users to create an account using either{" "}
        <strong>Email and Password</strong> or{" "}
        <strong>Google Authentication</strong>.
      </p>

      <ul className="list-disc pl-6 mt-2">
        <li>Email and Password Registration</li>
        <li>Google Account Registration</li>
      </ul>

      <p className="mt-2">
        After registration, a <strong>One-Time Password (OTP)</strong> is sent
        to the user's registered email address for identity verification.
      </p>

      <p className="mt-2">
        The user enters the received OTP, and the server validates it. Upon
        successful verification, the user account is created and activated.
      </p>

      <h3 className="font-bold text-lg mt-6 mb-2">2. User Authentication</h3>
      <p>
        The system provides secure login functionality through multiple
        authentication methods.
      </p>

      <ul className="list-disc pl-6 mt-2">
        <li>Email and Password Authentication</li>
        <li>Google Authentication</li>
      </ul>

      <p className="mt-2">
        After successful credential validation or Google authorization, an OTP
        is sent to the registered email address.
      </p>

      <p className="mt-2">
        The user must enter this OTP to complete the authentication process and
        gain access to the system.
      </p>

      <h3 className="font-bold text-lg mt-6 mb-2">
        3. JWT-Based Authorization
      </h3>

      <p>
        Once OTP verification is completed successfully, the system generates a{" "}
        <strong>JSON Web Token (JWT)</strong>.
      </p>

      <ul className="list-disc pl-6 mt-2">
        <li>JWT is securely stored in the browser.</li>
        <li>The token is used to authenticate subsequent requests.</li>
        <li>
          Access to protected resources is granted only to authenticated users.
        </li>
      </ul>

      <h3 className="font-bold text-lg mt-6 mb-2">
        4. Camera Management Module
      </h3>

      <p>
        The platform provides a dedicated camera management system for adding
        and monitoring surveillance cameras.
      </p>

      <p className="mt-2 font-semibold">Camera Registration</p>

      <ul className="list-disc pl-6 mt-2">
        <li>Camera Name</li>
        <li>Camera Location</li>
        <li>Camera URL</li>
      </ul>

      <p className="mt-2">
        After submission, the camera is added to the system and initially marked
        as <strong>Pending</strong> or <strong>Offline</strong> until a
        successful connection is established.
      </p>

      <h3 className="font-bold text-lg mt-6 mb-2">
        5. Protected System Features
      </h3>

      <p>
        After successful authentication, users gain access to the core
        functionalities of the surveillance platform.
      </p>

      <ul className="list-disc pl-6 mt-2">
        <li>Dashboard Overview</li>
        <li>Live Video Streaming</li>
        <li>Recorded Video Management</li>
        <li>Camera Management</li>
        <li>User Profile Management</li>
      </ul>

      <h3 className="font-bold text-lg mt-6 mb-2">
        6. Live Video Streaming
      </h3>

      <p>
        The system enables real-time surveillance monitoring through live video
        streams.
      </p>

      <ul className="list-disc pl-6 mt-2">
        <li>Secure access to camera feeds.</li>
        <li>Real-time monitoring through the web dashboard.</li>
        <li>Centralized management of multiple surveillance cameras.</li>
      </ul>

      <h3 className="font-bold text-lg mt-6 mb-2">
        7. Recorded Video Management
      </h3>

      <p>
        The platform supports recording storage and retrieval for surveillance
        footage.
      </p>

      <ul className="list-disc pl-6 mt-2">
        <li>Secure storage of recorded videos.</li>
        <li>Easy access and playback of archived recordings.</li>
        <li>Cloud-based storage integration for improved reliability.</li>
      </ul>

      <h3 className="font-bold text-lg mt-6 mb-2">
        8. Cloudflare Tunnel Integration
      </h3>

      <p>
        To ensure secure remote access, the system utilizes{" "}
        <strong>Cloudflare Tunnel</strong>.
      </p>

      <ul className="list-disc pl-6 mt-2">
        <li>Generates a secure public URL for video streaming.</li>
        <li>
          Eliminates the need to expose the local server directly to the
          internet.
        </li>
        <li>Provides enhanced security and accessibility.</li>
      </ul>

      <h3 className="font-bold text-lg mt-6 mb-2">
        9. AWS S3 Cloud Storage Integration
      </h3>

      <p>
        Recorded surveillance footage is stored using{" "}
        <strong>Amazon S3 (Simple Storage Service)</strong>.
      </p>

      <ul className="list-disc pl-6 mt-2">
        <li>Secure cloud-based video storage.</li>
        <li>Reliable backup and retention of recordings.</li>
        <li>Efficient retrieval and management of surveillance data.</li>
      </ul>

      <h3 className="font-bold text-lg mt-6 mb-2">10. System Overview</h3>

      <p>
        The Smart Surveillance System combines secure authentication, camera
        management, live monitoring, cloud storage, and centralized control
        within a unified web-based dashboard.
      </p>

      <ul className="list-disc pl-6 mt-2">
        <li>Secure User Authentication with OTP Verification</li>
        <li>JWT-Based Authorization</li>
        <li>Camera Registration and Management</li>
        <li>Real-Time Video Streaming</li>
        <li>Recorded Video Storage and Retrieval</li>
        <li>Cloudflare Tunnel Integration</li>
        <li>AWS S3 Cloud Storage</li>
        <li>Centralized Surveillance Dashboard Management</li>
      </ul>

      <p className="mt-2">
        This architecture ensures a secure, scalable, and efficient
        surveillance platform for monitoring, managing, and storing
        surveillance data through a modern web application.
      </p>
    </>
  );
}