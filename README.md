# Smart AI-Powered Self-Balancing Surveillance Robot

## Project Overview

The Smart AI-Powered Self-Balancing Surveillance Robot is an intelligent surveillance system that combines Artificial Intelligence, Edge Computing, Cloud Storage, and Full-Stack Web Technologies. The system utilizes a Raspberry Pi-based self-balancing robotic platform equipped with a Pi Camera for real-time monitoring, object detection, fire detection, cloud recording, and remote access through a secure MERN-based web application.

The robot continuously captures live video, performs AI-based analysis using YOLOv5 and Fire Detection ONNX models, streams live footage to authorized users, records surveillance data, and stores video segments in AWS S3 cloud storage for future access.

---

# Key Features

## Authentication & Security

- User Registration
- Email OTP Verification
- Email & Password Login
- Google OAuth Login
- JWT Authentication
- Protected Routes
- Secure Password Hashing
- Session Management

---

## AI-Powered Surveillance

- Real-Time Object Detection using YOLOv5
- Fire Detection using ONNX Deep Learning Model
- Bounding Box Visualization
- Confidence Score Display
- Real-Time AI Inference on Raspberry Pi

---

### Security
- OTP Verification for New Accounts
- Password Hashing
- JWT Token Validation
- Cloudflare Tunnel Secure Access

---

## Self-Balancing Robotic Platform

- Raspberry Pi 4 Controller
- Self-Balancing Mechanism
- Autonomous Surveillance Capability
- Wireless Network Connectivity
- Edge AI Processing

---

## Live Monitoring System

- Real-Time Video Streaming
- Flask MJPEG Streaming
- Cloudflare Tunnel Integration
- Public Secure Streaming URL
- Browser-Based Monitoring

---

## Cloud Recording & Storage

- Automatic Video Recording
- 5-Minute Video Segmentation
- AWS S3 Cloud Upload
- Remote Video Access
- Automatic Local Storage Cleanup

---

## User Dashboard

- Secure Login System
- Live CCTV Monitoring
- Recorded Video Management
- User Profile Management
- Camera Stream Management

---

# System Architecture

```text
Pi Camera
     ↓
Raspberry Pi 4
     ↓
YOLOv5 Object Detection
     ↓
Fire Detection ONNX Model
     ↓
Processed Video Frame
     ↓
 ┌───────────────┬
 │               │
 ▼               ▼
Live Stream    Video Recording
 │               │
 ▼               ▼
Cloudflare     AWS S3
Tunnel         Cloud Storage
 │               │
 └───────┬───────┘
         ▼
MERN Web Application
         ▼
Authenticated User
```

---

# Technology Stack

## Frontend

- React.js
- Tailwind CSS
- React Router DOM
- Context API

---

## Backend

- Node.js
- Express.js
- JWT Authentication
- Google OAuth
- Nodemailer
- REST API

---

## Database

- MongoDB Atlas
- Mongoose ODM

---

## Edge AI & Computer Vision

- Raspberry Pi 4
- Raspberry Pi Camera Module
- OpenCV
- YOLOv5 ONNX Model
- Fire Detection ONNX Model
- Python

---

## Cloud Services

### AWS

- Amazon S3
- Cloud Video Storage

### Cloudflare

- Cloudflare Tunnel
- Secure Public Streaming URL
- HTTPS Protection

---

# Authentication Workflow

## Registration

1. User enters registration details.
2. User information is temporarily stored.
3. A One-Time Password (OTP) is sent to the registered email address.
4. User enters the OTP for verification.
5. The backend validates the OTP.
6. The account is activated after successful verification.
7. User can now log in to the system.

## Login

## Email Authentication

1. User registers using email and password.
2. System generates an OTP.
3. OTP is sent to the user's email.
4. User enters the OTP.
5. Backend verifies the OTP and activates the account.
6. User logs in using email and password.
7. Backend validates credentials.
8. JWT token is generated.
9. Access is granted.

## Google OAuth Authentication

1. User selects Google Login.
2. Google verifies the user's identity.
3. Backend validates the Google token.
4. JWT token is generated.
5. Access is granted.
---

# AI Detection Workflow

```text
Video Capture
      ↓
Frame Extraction
      ↓
Preprocessing
      ↓
YOLOv5 Detection
      ↓
Fire Detection Model
      ↓
Bounding Box Generation
      ↓
Label & Confidence Score
      ↓
Output Frame
```

---

# Cloud Recording Workflow

```text
Live Video Capture
        ↓
OpenCV VideoWriter
        ↓
5-Minute MP4 Segment
        ↓
AWS S3 Upload
        ↓
Upload Verification
        ↓
Delete Local File
        ↓
Cloud Storage Access
```

---

# Installation

## Backend Setup

```bash
npm install
npm run dev
```

## Frontend Setup

```bash
npm install
npm run dev
```

## Raspberry Pi Setup

```bash
pip install -r requirements.txt
python3 app.py
```

---


# Challenges Faced

- Raspberry Pi Wi-Fi Connectivity Issues
- Cloudflare Tunnel Disconnections
- Real-Time Video Streaming Optimization
- AWS S3 Upload Synchronization
- False Fire Detection Reduction
- Frontend-Backend Integration
- JWT Authentication Implementation
- Google OAuth Configuration
- Cloud Storage Management

---

# Future Enhancements

- Face Recognition System
- Intrusion Detection Alerts
- Mobile Application
- Push Notifications
- Multi-Camera Support
- WebRTC Low-Latency Streaming
- AI Analytics Dashboard
- Automatic Emergency Alerts
- Robot Navigation Automation

---

# Project Type

**Final Year Academic Project**

---
