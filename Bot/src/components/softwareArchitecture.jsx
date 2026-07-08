// src/data/SoftwareArchitectureContent.jsx

export default function SoftwareArchitectureContent() {
  return (
   <>
   <ul>
   <li>The workflow begins with account creation, where users can register either through Email and Password or by using their Google Account. In both cases, the system sends a One-Time Password (OTP) to the user's email address for verification.</li><br></br>

   <li>During the Email Verification phase, the user enters the OTP received via email. The server validates the OTP, and upon successful verification, the user's account is created and activated.</li><br></br>

   <li>For Login, users can again choose between Email/Password Authentication or Google Authentication. After successful credential validation or Google authorization, the system sends another OTP to the registered email address. The user must enter this OTP to complete the login process.</li><br></br>

   <li>Once the OTP is verified, the system generates a JSON Web Token (JWT), which is securely stored in the browser. This token allows authenticated access to protected resources within the application.</li><br></br>

<li>The platform also provides a Camera Management Module. Users can navigate to the Cameras section and add surveillance cameras by providing:<br></br>

Camera Name<br></br>
Camera Location<br></br>
Camera URL</li><br></br>

<li>After submission, the camera is added to the system and initially marked with a pending or offline status until connectivity is established.<br></br>

After authentication, users gain access to several protected features, including:<br></br>

Dashboard Overview<br></br>
Live Video Streaming<br></br>
Recorded Video Management<br></br>
Camera Management<br></br>
User Profile Management</li><br></br>

The system integrates with external services to enhance functionality. Cloudflare Tunnel provides a secure public URL for accessing live video streams without exposing the local server directly to the internet. AWS S3 is used for storing recorded surveillance videos, enabling secure cloud-based storage and easy retrieval.<br></br>

Overall, this workflow ensures secure user authentication, camera management, real-time video monitoring, cloud storage integration, and centralized surveillance system control through a web-based dashboard.</ul>
   </>
  );
}