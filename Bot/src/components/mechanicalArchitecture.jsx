// src/data/LiveStreamingArchitectureContent.jsx

export default function MehanicaArchitecture() {
  return (
    <>
      <ul className="list-disc pl-6 space-y-4">
        <li>
          The workflow begins on the Raspberry Pi local server, where the Pi
          Camera continuously captures live video from the surveillance
          environment and sends the video feed to a Flask-based streaming
          server.
        </li>

        <li>
          The Flask server processes the live video and generates an MJPEG video
          stream that can be accessed locally through the Raspberry Pi using a
          dedicated video feed endpoint.
        </li>

        <li>
          To enable remote access without exposing the Raspberry Pi directly to
          the internet, Cloudflare Tunnel establishes a secure encrypted
          connection between the local server and Cloudflare's network.
        </li>

        <li>
          Cloudflare Tunnel generates a secure public URL, allowing external
          devices to access the live video stream without requiring port
          forwarding or public IP configuration.
        </li>

        <li>
          The generated public stream URL is stored and managed by the backend
          server developed using Node.js and Express.js.
        </li>

        <li>
          The backend is responsible for camera management, stream URL storage,
          API endpoints, user authentication, and communication with the
          database.
        </li>

        <li>
          The React frontend fetches camera information and stream URLs from the
          backend and displays them through the web-based dashboard.
        </li>

        <li>
          Users can navigate to the live streaming page, select available
          cameras, and access real-time surveillance footage through the MERN
          application.
        </li>

        <li>
          The system provides centralized monitoring, allowing users to view
          live streams from multiple cameras using a single dashboard interface.
        </li>

        <li>
          This architecture enables secure live video streaming, remote camera
          access, centralized management, and real-time surveillance monitoring
          from any device connected to the internet.
        </li>
      </ul>
    </>
  );
}