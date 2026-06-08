# IMPORTANT INSTRUCTIONS FOR ANTIGRAVITY

Before making any changes:

1. Read this entire README file from top to bottom.
2. Analyze the complete project structure.
3. Analyze all frontend files.
4. Analyze all backend files.
5. Analyze all API routes.
6. Analyze MongoDB models.
7. Analyze AWS S3 integration.
8. Analyze authentication flow.
9. Analyze existing UI components.
10. Analyze environment variables.

Do NOT create a new project.

Do NOT replace working features.

Modify and improve the existing project.

Preserve all currently working functionality.

---

## Required Workflow

You must follow these steps:

### Step 1

Read the complete README.

### Step 2

Scan the entire codebase.

### Step 3

Understand existing architecture.

### Step 4

Identify missing features.

### Step 5

Implement all required backend features.

### Step 6

Implement all required frontend features.

### Step 7

Connect frontend and backend APIs.

### Step 8

Connect MongoDB.

### Step 9

Connect AWS S3.

### Step 10

Test all features.

### Step 11

Fix all discovered issues automatically.

### Step 12

Retest the entire project.

### Step 13

Generate implementation report.

---

## Development Rules

Do not leave placeholder code.

Do not leave TODO comments.

Do not leave incomplete APIs.

Do not leave incomplete UI.

Do not create mock data.

Implement production-ready solutions.

---

## Testing Requirements

Before delivery:

You must verify:

* Frontend Builds Successfully
* Backend Builds Successfully
* MongoDB Connection Works
* AWS S3 Works
* Authentication Works
* Google Login Works
* Forgot Password Works
* JWT Works
* Protected Routes Work
* Socket.IO Works
* Alert System Works
* Camera Monitoring Works
* Camera Offline Detection Works
* Stream Integration Works
* Recording Management Works

Fix any issue discovered during testing.

---

## Final Delivery

Do not stop after generating code.

Verify everything works.

After implementation provide:

1. Files Modified
2. APIs Added
3. Database Changes
4. Security Improvements
5. Test Results
6. Remaining Recommendations

Only mark the project complete after all requirements are implemented and verified.


# Smart CCTV MERN Project Upgrade Instructions

You are working on an existing MERN stack Smart CCTV project. Before making any changes, scan and understand the entire frontend and backend codebase, existing folder structure, API routes, models, middleware, authentication flow, AWS integration, and UI components.

Your task is to upgrade, refactor, complete, test, and deliver the project while preserving existing working functionality.

## Existing System

### CCTV Streaming Source

Live stream is provided by Raspberry Pi through Cloudflare Tunnel.

Stream URL:

https://camera.smartcctv2026.me/video_feed

This stream must be displayed inside the authenticated dashboard.

---

## Authentication Requirements

### Login Methods

Support both:

1. Email + Password Login
2. Google OAuth Login

### Signup Methods

Support both:

1. Normal Signup
2. Google Signup

### Database

MongoDB

### Authentication

JWT Authentication

### JWT Session

Token validity:

7 Days

After token expiration:

* Force login again
* Refresh user session securely

### Email Uniqueness

Every email must be unique.

No duplicate email accounts.

---

## Forgot Password System

Implement secure password reset flow.

Requirements:

1. User enters email
2. Generate secure reset token
3. Send reset link via email
4. Token expires automatically
5. User sets new password
6. Password must be hashed
7. Old reset token becomes invalid

Use industry-standard security practices.

---

## User Profile UI

After login:

Navbar should display:

User First Letter Avatar

Example:

User Name:

Subhas

Avatar:

S

Clicking avatar should open dropdown menu.

Dropdown contains:

* Profile
* Logout

Logout must:

* Clear JWT
* Clear session
* Redirect to Login Page

---

## Route Protection

Unauthenticated users must NOT access:

### Live Camera Stream

Dashboard Camera Page

### Recordings Page

### Alerts Page

### User Data

### Admin Data

### API Endpoints

Protect frontend and backend routes.

Implement middleware protection.

---

## Live Camera Status Detection

The Raspberry Pi stream URL is:

https://camera.smartcctv2026.me/video_feed

Implement stream monitoring.

If Raspberry Pi:

* loses power
* loses internet
* tunnel disconnects
* stream unavailable

Frontend must display:

"Camera Offline"

with proper UI state.

When stream becomes available again:

Automatically restore live feed.

No page refresh required.

---

## AWS S3 Recordings

Recordings are stored in AWS S3.

Implement:

### Recordings Dashboard

Features:

* List recordings
* Search recordings
* Sort by date
* Download recording
* Delete recording
* Pagination

### Security

Only authenticated users can access recordings.

---

## Alert System

Backend must support alert storage.

Alert Types:

* Fire
* Smoke
* Person
* Motion

Store alerts in MongoDB.

Alert fields:

* Alert Type
* Confidence
* Timestamp
* Camera ID
* Status

Create APIs for:

* Fetch Alerts
* Delete Alerts
* Mark Resolved

---

## Backend Requirements

Review existing backend code.

Implement:

### Models

* User
* Alert
* Recording

### Controllers

* Auth
* Alert
* Recording
* User

### Services

* Email Service
* AWS Service
* JWT Service

### Middleware

* Auth Middleware
* Error Middleware
* Validation Middleware

### Security

Implement:

* Password Hashing
* Input Validation
* Helmet
* Rate Limiting
* CORS Configuration
* Secure Cookies
* Environment Variables

---

## Frontend Requirements

Analyze existing frontend structure.

Upgrade UI while preserving functionality.

Implement:

### Dashboard

* Live Camera Card
* Camera Status Indicator
* Alert Summary
* Recording Summary

### Authentication Pages

* Login
* Signup
* Forgot Password
* Reset Password

### User Menu

Avatar with first letter.

Dropdown menu.

Logout support.

### Protected Routes

Redirect unauthorized users.

### Responsive Design

Desktop
Tablet
Mobile

---

## API Integration

Automatically connect frontend with backend APIs.

Do not leave placeholder implementations.

Use production-ready API services.

Handle:

* Loading States
* Error States
* Empty States

---

## Testing Requirements

Before delivery:

Automatically test:

### Authentication

* Signup
* Login
* Google Login
* Logout
* Password Reset

### Protected Routes

### JWT Expiration

### Stream Status Detection

### Recording APIs

### Alert APIs

### AWS Integration

### MongoDB Operations

### Error Handling

Fix discovered issues automatically.

---

## Code Quality Requirements

Refactor code where necessary.

Remove duplicated logic.

Keep architecture clean.

Follow production-grade MERN standards.

Use reusable components.

Use reusable services.

Use environment variables.

---

## Final Delivery Requirements

Before completion:

1. Verify all frontend pages work.
2. Verify all backend APIs work.
3. Verify MongoDB integration works.
4. Verify AWS S3 integration works.
5. Verify JWT authentication works.
6. Verify Google OAuth works.
7. Verify Password Reset works.
8. Verify Camera Offline detection works.
9. Verify Stream Page works.
10. Verify Protected Routes work.

Generate a final report including:

* Changes Made
* Files Modified
* APIs Added
* Security Improvements
* Test Results
* Remaining Recommendations

Do not stop until all requirements are implemented, integrated, tested, and verified.


# Additional Production Features (Mandatory)

Implement the following production-grade features and fully integrate them with the existing MERN Smart CCTV architecture.

Do not create mock implementations.

All features must be connected with backend APIs, MongoDB, React frontend, and Raspberry Pi detection events.

---

## 1. Real-Time Alert System (Socket.IO)

Implement Socket.IO for real-time communication.

When Raspberry Pi detects:

* Fire
* Smoke
* Person
* Motion

The backend must immediately broadcast the event using Socket.IO.

Frontend must receive the event instantly without page refresh.

Display real-time alert popup notifications.

Example:

🔥 Fire Detected

Camera: Main Camera

Confidence: 92%

Time: 11:42 PM

Store all alerts in MongoDB before broadcasting.

Implement automatic reconnection handling.

Implement alert acknowledgement support.

---

## 2. Browser Notifications

Implement browser push notifications.

When user grants notification permission:

Display browser notification immediately when:

* Fire detected
* Smoke detected
* Critical Camera Offline event

Notification example:

🔥 Fire Detected

Camera: Main Camera

Clicking notification should redirect user to Alert Details page.

Support:

* Chrome
* Edge
* Firefox

Handle permission request properly.

Do not repeatedly request notification permission.

---

## 3. Alert History Page

Create dedicated Alert History page.

Store all alerts in MongoDB.

Fields:

* Alert Type
* Camera Name
* Confidence
* Timestamp
* Status
* Notes

Features:

* Search
* Filter
* Sort
* Pagination

Status Types:

* Active
* Resolved
* False Positive

Users must be able to:

* View Alert
* Mark Resolved
* Delete Alert
* Add Notes

Provide responsive UI.

---

## 4. Camera Health Monitoring Dashboard

Implement complete camera health monitoring.

Raspberry Pi must periodically send heartbeat data to backend.

Heartbeat interval:

30 seconds

Store:

* Camera ID
* Last Seen
* Status
* CPU Usage
* Memory Usage
* Temperature
* Network Status

Dashboard must display:

🟢 Online

🔴 Offline

🟡 Warning

If heartbeat is not received for more than 90 seconds:

Automatically mark camera as Offline.

Frontend must immediately update camera status using Socket.IO.

Display:

Camera Name

Status

Last Seen

CPU Usage

Temperature

Stream Availability

Network Status

---

## 5. Offline Stream Detection

Monitor live stream:

https://camera.smartcctv2026.me/video_feed

If stream becomes unavailable:

Frontend must automatically replace video player with:

"Camera Offline"

and show:

Last Seen Time

No manual refresh required.

When stream becomes available again:

Automatically restore live video.

---

## 6. Fire Detection Workflow

When Fire is detected:

Step 1

Save alert in MongoDB.

Step 2

Broadcast alert using Socket.IO.

Step 3

Show React popup.

Step 4

Trigger browser notification.

Step 5

Store event in Alert History.

Step 6

Update Dashboard Alert Counter.

Prevent duplicate alerts by implementing cooldown logic.

Recommended cooldown:

30 seconds.

---

## 7. Dashboard Enhancements

Dashboard must include:

### Live Camera Section

Live Stream

Camera Status

Last Seen

### Alert Summary

Total Alerts

Today's Alerts

Active Alerts

Resolved Alerts

### Camera Health Card

CPU Usage

Memory Usage

Temperature

Connection Status

### Recent Alerts

Latest 10 alerts

### Recording Summary

Total Recordings

Storage Usage

Recent Recordings

---

## 8. Production Testing Requirements

Before delivery:

Automatically test:

* JWT Authentication
* Google OAuth
* Password Reset
* Socket.IO Events
* Browser Notifications
* Alert Storage
* Alert History
* Camera Health Monitoring
* Stream Availability Detection
* AWS S3 Recording Access
* MongoDB Queries
* Protected Routes

Fix all discovered issues automatically.

Generate final test report.

---

## 9. Final Delivery Checklist

Do not deliver until all items are verified:

✅ Authentication Working

✅ Google Login Working

✅ Password Reset Working

✅ JWT Expiration Working

✅ Protected Routes Working

✅ Raspberry Pi Stream Working

✅ Camera Offline Detection Working

✅ AWS S3 Recordings Working

✅ Socket.IO Working

✅ Browser Notifications Working

✅ Alert History Working

✅ Camera Health Monitoring Working

✅ MongoDB Working

✅ Responsive UI Working

Generate a final implementation report including:

* Files Modified
* APIs Added
* Database Changes
* Security Improvements
* Testing Results
* Remaining Recommendations
