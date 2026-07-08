# Smart AI CCTV Surveillance System

## Overview

The Smart AI CCTV Surveillance System is a full-stack surveillance platform that integrates Raspberry Pi, Artificial Intelligence, Cloud Storage, and a MERN (MongoDB, Express.js, React.js, Node.js) web application. The system provides secure user authentication, real-time CCTV monitoring, cloud-based video storage, and remote accessibility through a modern web dashboard.

---

## Features

### Authentication & Security

* User Registration
* Email Verification
* Email & Password Login
* Google OAuth Login
* JWT Authentication
* Protected Routes
* Secure Cookie-Based Authorization

### Live CCTV Monitoring

* Real-Time Video Streaming
* Raspberry Pi Camera Integration
* Cloudflare Tunnel Public URL Access
* Browser-Based Live Viewing

### AI-Powered Detection

* YOLOv5 Object Detection
* Fire Detection using ONNX Model
* Bounding Box Visualization
* Real-Time Detection Processing

### Video Recording & Storage

* Automatic Video Recording
* Segmented Video Generation
* AWS S3 Cloud Storage Integration
* Remote Video Access

### User Dashboard

* Secure Login System
* Live Stream Monitoring
* Recording Management
* User Profile Management

---

## System Architecture

User
↓
React Frontend
↓
Node.js + Express Backend
↓
MongoDB Database

External Integrations:

* Raspberry Pi Local Stream
* Cloudflare Tunnel
* AWS S3 Cloud Storage

---

## Technology Stack

### Frontend

* React.js
* Axios
* React Router DOM
* Tailwind CSS

### Backend

* Node.js
* Express.js
* JWT Authentication
* Google OAuth

### Database

* MongoDB
* Mongoose

### AI & Surveillance

* Raspberry Pi 4
* Pi Camera Module
* OpenCV
* YOLOv5
* ONNX Fire Detection Model

### Cloud Services

* AWS S3
* Cloudflare Tunnel

---

## Authentication Workflow

1. User registers with email and password.
2. Verification link is sent via email.
3. User verifies account.
4. User logs in using:

   * Email & Password
   * Google OAuth
5. Server validates credentials.
6. JWT token is generated.
7. Token is verified using authMiddleware.
8. Protected resources become accessible.

---

## Installation

### Backend

```bash
npm install
npm run dev
```

### Frontend

```bash
npm install
npm run dev
```

### Environment Variables

Backend `.env`

```env
PORT=5000

MONGODB_URI=YOUR_MONGODB_URI

JWT_SECRET=YOUR_SECRET

GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID

GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET

AWS_ACCESS_KEY_ID=YOUR_AWS_KEY

AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET

AWS_BUCKET_NAME=YOUR_BUCKET
```

---

## Future Enhancements

* Face Recognition
* Intrusion Detection
* Mobile Application
* Push Notifications
* Multi-Camera Support
* WebRTC Streaming
* Advanced Analytics Dashboard

---

## Author

Developed as a Smart AI CCTV Surveillance System using Raspberry Pi, Artificial Intelligence, Cloud Computing, and MERN Stack technologies.
