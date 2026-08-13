# InterviewAI (v3.1) - Complete Project Overview & Presentation Guide

## 1. Executive Summary
**InterviewAI** is an intelligent, automated mock-interview and recruitment platform designed to bridge the gap between candidate preparation and real-world technical interviews. It provides a complete pipeline from ATS (Applicant Tracking System) resume scoring to live, AI-driven, and fully proctored mock interviews. 

## 2. Platform Features & Functionality
- **Authentication & Onboarding**: Secure login/registration. Users must complete profiles (target role, college, skills) verified by AI to access the platform.
- **Dynamic Mock Interviews**: Instead of static question banks, Gemini AI generates unique questions tailored to the candidate's specific profile, difficulty level, and job experience.
- **Live Proctoring**: Acts as a digital invigilator tracking browser behavior (tab switching, resizing) and utilizing computer vision to track face and posture.
- **Analytics & Evaluation**: Real-time speech-to-text captures verbal answers which are then evaluated by AI to produce comprehensive feedback on technical depth, communication, and problem-solving skills.
- **Recruiter & Admin Portals**: Recruiter dashboards aggregate candidate scores, presenting "Strengths/Weaknesses", while Admins monitor platform health.

---

## 3. Score Calculation Mechanics

### AI Score (Overall Score)
- **Calculation**: When a candidate answers a question, the response is sent to Gemini AI alongside an "Ideal Answer Key." The AI evaluates it for technical depth, correctness, and understanding, returning a rating from 0 to 10. The overall score is the average of these ratings across an interview.
- **Fallback**: A local "Keyword Engine" matches technical keywords if the AI API is offline.
- **Sub-scores**: Currently, Technical, Communication, and Problem Solving scores are equalized to the overall average AI Score.

### Detailed Answer Metrics
- **Metrics**: Confidence, Clarity, Pace, Depth, Vocabulary.
- **Calculation**: Graded proportionally (0 to 100) by AI based on the transcript text, structure, and vocabulary used for each specific answer.

### Trust Score (Anti-Cheating Integrity)
- **Calculation**: Every interview starts at a perfect 100. Deductions occur for logged violations:
  - Camera Off (-15), Mic Off (-10), Browser Resize (-10), Exiting Fullscreen (-5), Switching Tabs (-5), Window Hidden (-5).
  - Video Analysis: Looking away (-15), no face (-25), multiple faces (-20).
- **Status Levels**: Excellent (90+), Good (75-89), Warning (50-74), Critical (<50).

### Readiness Percentage
- **Calculation**: Average AI Score * 10 (capped at 100). E.g., an 8.2 AI Score = 82% Readiness.

### Hiring Recommendations (Recruiter Board)
- **Categories**:
  - **Reject**: Trust Score is strictly below 60.
  - **Hire**: Trust Score is 80 or higher AND AI Score is 7.0 or higher.
  - **Consider**: Falls between these thresholds.

---

## 4. System Architecture & File Connections (Which File Does What)
The project follows a modular MERN stack architecture separating the client side and the server side.

### Backend (`/backend`)
- **`server.js`**: The main entry point that initializes the Express server, connects to MongoDB, and registers all routes.
- **`config/`**: Contains database connections and environment variables setup.
- **`routes/`**: Defines the API endpoints (e.g., `/api/users`, `/api/interviews`) and maps them to specific controller functions.
- **`controllers/`**: Contains the main business logic for each route. They handle the request, call necessary services, and send the response back to the client.
- **`services/`**: Houses complex, reusable logic detached from the HTTP layer. 
  - *Example*: `aiService.js` handles all direct communication with Google Gemini.
- **`models/`**: Mongoose schemas defining the structure of the database collections (e.g., User, Interview, Feedback).
- **`middleware/`**: Functions that run before controllers, such as JWT authentication verification, proctoring violation checks, and rate-limiting.
- **`utils/` & `validators/`**: Helper functions and request payload validation rules.

### Frontend (`/frontend`)
- **`src/main.jsx` & `src/App.jsx`**: The entry points of the React application. `App.jsx` handles the main routing logic to different pages.
- **`src/pages/`**: Contains the main full-page views of the application (e.g., `CandidateProfile.jsx`, Dashboard, Mock Interview interface).
- **`src/components/`**: Reusable UI elements (buttons, modals, navigation bars) used across various pages.
- **`src/context/`**: React Context API files for managing global state. 
  - *Example*: `AuthContext.jsx` manages the user's login state globally so any component can access the user's details.
- **`src/services/`**: API wrapper functions that make HTTP requests to the backend (e.g., `adminService.js` fetches data for the admin portal).
- **`src/hooks/`**: Custom React hooks for encapsulating complex state logic.

---

## 5. Technology Stack & Imported Modules Summary

### Backend Modules & Their Uses
- **`express`**: The core web framework used to handle HTTP routing, endpoints, and server logic.
- **`mongoose`**: An Object Data Modeling (ODM) library for MongoDB. Used to define data schemas (Users, Interviews, etc.) and interact with the database.
- **`@google/generative-ai`**: Google Gemini API client. The "brain" of the platform, used to dynamically generate interview questions and evaluate candidates' answers.
- **`bcryptjs`**: Used for hashing and salting user passwords to ensure they are stored securely in the database.
- **`jsonwebtoken`**: Used to generate and verify JWTs for secure, stateless user authentication across API requests.
- **`multer`, `multer-s3`, `@aws-sdk/client-s3`**: Together, these handle file uploads (like candidate resumes and profile pictures) and stream them directly into AWS S3 cloud storage to save server space.
- **Security Middleware (`cors`, `helmet`, `express-rate-limit`, `express-mongo-sanitize`, `xss-clean`)**: Essential modules that protect the backend by setting secure HTTP headers, preventing cross-site scripting (XSS), stopping NoSQL injection attacks, and mitigating brute-force DDoS attacks.
- **`nodemailer`**: Used to send automated emails to users (such as account verification or password resets).

### Frontend Modules & Their Uses
- **`react`, `react-dom`, `react-router-dom`**: The foundational libraries for building the user interface and handling navigation between different pages without reloading the browser.
- **`@tanstack/react-query`**: A powerful data-fetching library used to manage server state, cache API responses, and handle loading/error states cleanly.
- **`axios`**: A promise-based HTTP client used to send API requests from the React frontend to the Express backend.
- **`framer-motion`**: An animation library used to create smooth, complex, and beautiful UI transitions and micro-animations to enhance user experience.
- **`@mediapipe/tasks-vision`**: A machine learning computer vision module. It powers the live proctoring by tracking the candidate's facial movements, posture, and ensuring they remain in frame.
- **`react-webcam`**: A dedicated React component used to easily hook into the user's webcam and capture real-time video feed during the mock interview.
- **`react-speech-recognition` (with `regenerator-runtime`)**: Captures the candidate's spoken audio in real-time and converts it into text, which is then sent to the AI for evaluation.
- **`recharts`**: A charting library used to generate visual data representations (like graphs and pie charts) on the dashboard for candidate performance analytics.
- **`html2pdf.js`**: Used to convert DOM elements (specifically, the final Completion Certificate) into downloadable PDF files for the user.
- **`lucide-react`**: A comprehensive SVG icon library used for modern iconography across the platform.
- **`react-hot-toast`**: Provides beautiful, lightweight popup notifications (toasts) for user feedback (e.g., "Saved successfully", "Camera error").

---

## 6. Challenges Faced & Technical Solutions (Suggested Talking Points)
During a presentation, discussing hurdles demonstrates deep technical understanding. Consider mentioning these points:
- **Challenge: Real-time Audio Processing:** Browser-based speech-to-text can be inconsistent and heavy on resources.
  - *Solution:* Utilized `react-speech-recognition` to capture rolling transcripts locally on the client's browser, and only sent the finalized text batch to Gemini AI after the candidate finished speaking. This eliminated websocket lag, reduced API costs, and drastically improved stability.
- **Challenge: AI Hallucinations & Parsing:** Generative AI can sometimes give arbitrary scores or return conversational text instead of structured data.
  - *Solution:* Implemented strict prompt engineering with "Ideal Answer Keys" and forced the AI to return data in a rigid JSON format. This ensured the Express backend could parse the metrics reliably. Also created a local "Keyword Engine" as a fallback in case the AI API went offline.
- **Challenge: Cheating Prevention in Remote Environments:** Ensuring the integrity of remote mock interviews is notoriously difficult.
  - *Solution:* Combined basic browser-level event listeners (visibility API, blur events for tab switching) with MediaPipe's machine learning vision to detect if multiple faces were present or if the candidate looked away. We consolidated these into a single, unified "Trust Score" algorithm.

## 7. Unique Selling Propositions (USPs)
Highlight why this platform stands out compared to existing competitors or standard college projects:
- **Dynamic vs. Static Questioning:** We don't use a fixed, hardcoded database of 100 questions. Every single interview is uniquely generated on-the-fly based on the specific candidate's resume, their chosen target role, and their experience level.
- **Holistic Evaluation:** The AI doesn't just grade the technical correctness of the answer. It is prompted to grade the candidate's communication pace, vocabulary depth, and clarity.
- **End-to-End Pipeline:** The platform covers the entire recruitment journey—from initial user onboarding, to the actual proctored interview, to the final dashboard where recruiters can view AI-summarized candidate profiles.

## 8. Future Roadmap & Scalability
Where the project can go next (investors and professors love forward-thinking features):
- **Integrated Code Compiler:** Adding a live IDE (like Monaco Editor) directly into the interview interface so candidates can write and execute real code, not just speak their answers.
- **Multi-lingual Support:** Expanding the speech-to-text modules and AI prompt structures to support technical interviews in Spanish, Mandarin, Hindi, etc., opening up a global market.
- **Enterprise Job Board Integration:** Building public APIs so real-world companies can integrate `IntervAi` directly into their Workday, Greenhouse, or LinkedIn hiring workflows.

---
*Note: This document can serve as a comprehensive script and visual guide for a project presentation, explaining both the features, the mathematical score calculations, the internal codebase architecture, and strategic talking points.*
