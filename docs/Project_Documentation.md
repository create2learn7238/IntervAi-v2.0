# InterviewAI - Complete Project Documentation

## 1. Project Explanation
**InterviewAI** is an intelligent, automated mock-interview and recruitment platform. It is designed to bridge the gap between candidate preparation and real-world technical interviews. 

Candidates can log into the platform, upload their resumes for instant ATS (Applicant Tracking System) scoring, and participate in AI-driven mock interviews. Instead of static question banks, the platform uses Generative AI to ask dynamic, tailored questions based on the candidate's target role and experience level. During the interview, the platform acts as a digital invigilator, monitoring the candidate's audio, video, and browser behavior to calculate a "Trust Score." After completion, candidates receive detailed performance analytics, personalized feedback, and a verifiable completion certificate, while recruiters get an AI-summarized profile of the candidate.

---

## 2. Core Concepts & Technologies Used

### A. The MERN Stack (Architecture)
- **MongoDB & Mongoose**: A NoSQL database used to store flexible JSON-like documents (Users, Interviews, Feedbacks, Resumes).
- **Express.js & Node.js**: The backend server framework that provides robust RESTful APIs to handle business logic, file uploads, and AI communication.
- **React 19 & Vite**: The frontend UI framework. Vite provides lightning-fast hot module replacement, and React provides a component-driven architecture for a seamless user experience.

### B. Artificial Intelligence (Generative NLP)
- **Google Gemini API (`@google/generative-ai`)**: The brain of the platform. It is used heavily via prompt engineering to:
  1. Generate unique, unpredictable interview questions.
  2. Act as a recruiter to analyze resumes.
  3. Evaluate a candidate's spoken answers against ideal conceptual answers.

### C. Live Proctoring & Computer Vision
- **MediaPipe (`@mediapipe/tasks-vision`)**: Used for advanced browser-based computer vision. It tracks candidate posture, facial positioning, and dressing.
- **Trust Score Algorithm**: A custom algorithm that listens for browser events (like switching tabs or minimizing the window) and webcam data to penalize suspicious behavior, ensuring interview integrity.

### D. Audio & Video Processing
- **`react-webcam`**: Captures real-time video feeds during the interview for proctoring.
- **`react-speech-recognition`**: Converts the candidate's spoken audio into text in real-time, allowing the AI backend to evaluate their verbal responses.

### E. Cloud Storage & Media Handling
- **AWS S3 (`multer-s3`)**: Secure cloud storage for user assets. Instead of clogging the local database with heavy PDF files or images, resumes and profile pictures are streamed directly to AWS S3.

### F. Security & Authentication
- **JWT (JSON Web Tokens)**: Used for stateless user authentication.
- **HTTP-Only Cookies**: Tokens are stored securely in cookies that JavaScript cannot access, mitigating Cross-Site Scripting (XSS) attacks.
- **Helmet & Rate Limiting**: Express middleware that sets secure HTTP headers and prevents brute-force DDoS attacks.

---

## 3. List of Modules & Functionalities

### 1. Authentication & Onboarding
- **Register/Login**: Secure sign-up flow with password hashing (`bcryptjs`).
- **Profile Completeness Guard**: Forces new users to fill out their target role, college, and skills before accessing the dashboard.
- **AI Role Verification**: An AI check that verifies if the user's entered "Target Role" is a valid, high-demand industry role or a nonsensical term.

### 2. Resume Analyzer (ATS Scoring)
- **PDF Extraction**: Uploads a resume PDF and extracts raw text using `pdf-parse`.
- **AI Match Analysis**: Compares the extracted resume text against industry standards for the candidate's target role.
- **Feedback Generation**: Provides a score out of 100, identifies missing keywords, and suggests actionable improvements.

### 3. Mock Interview Engine
- **Pre-Interview Setup**: Candidates configure their difficulty level and job experience.
- **Dynamic Question Generation**: The backend prompts Gemini to create 5 highly specific technical or behavioral questions based on the candidate's profile.
- **Live Interview Interface**: A focused UI where questions are displayed, the webcam is active, and speech-to-text captures the answer.
- **Fallback Mechanism**: If the AI API fails, the system automatically falls back to a locally stored bank of classic engineering questions.

### 4. Proctoring & Live Monitoring
- **Tab Switching Detection**: Immediately flags if the candidate clicks outside the interview window.
- **Posture & Vision Detection**: Ensures the candidate's face remains visible and detects if multiple people are in the frame.
- **Violation Logging**: Real-time logging of all suspicious events to the backend.

### 5. Analytics & Evaluation
- **Candidate Analytics**: Visual charts (using `recharts`) showing historical performance, AI scores, and Trust Scores.
- **Detailed Feedback**: A breakdown of what the candidate answered correctly and where they lacked depth, evaluated by Gemini.

### 6. Recruiter & Admin Portals
- **Recruiter Dashboard**: Allows HR personnel to view an aggregated list of candidates, review their AI scores, and see automated "Strengths/Weaknesses" summaries.
- **Admin Analytics**: A bird's-eye view of platform health, total interviews conducted, and system metrics.

### 7. Certificate Generation
- **Proof of Completion**: Generates a visually appealing certificate containing the candidate's name, role, and date, validating their successful completion of an AI mock interview.
