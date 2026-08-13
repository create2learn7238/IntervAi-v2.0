require('dotenv').config();
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const User = require('./models/User');
const Interview = require('./models/Interview');
const UserAnswer = require('./models/UserAnswer');
const TrustScore = require('./models/TrustScore');
const Violation = require('./models/Violation');
const Certificate = require('./models/Certificate');
const CandidateAiProfile = require('./models/CandidateAiProfile');
const SiteFeedback = require('./models/SiteFeedback');
const AIRequestLog = require('./models/AIRequestLog');

const ATLAS_URI = 'mongodb+srv://learn7238_db_user:Au38YeIjTN8D9kDN@cluster0.ul2jk4n.mongodb.net/intervAi?retryWrites=true&w=majority';

async function seedData() {
  const connectionUris = [
    process.env.MONGODB_URI_ATLAS,
    process.env.MONGO_URI,
    'mongodb+srv://learn7238_db_user:Au38YeIjTN8D9kDN@cluster0.ul2jk4n.mongodb.net/intervAi?retryWrites=true&w=majority',
    'mongodb://127.0.0.1:27017/intervai'
  ].filter(Boolean);

  let connected = false;
  for (const uri of connectionUris) {
    try {
      console.log(`🔌 Attempting MongoDB connection to: ${uri.includes('127.0.0.1') ? 'Local MongoDB' : 'Atlas Cluster'}`);
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
      console.log(`✅ Connected successfully to: ${uri.includes('127.0.0.1') ? 'Local MongoDB' : 'Atlas Cluster'}`);
      connected = true;
      break;
    } catch (err) {
      console.warn(`⚠️ Failed to connect to ${uri.includes('127.0.0.1') ? 'Local' : 'Atlas'}: ${err.message}`);
    }
  }

  if (!connected) {
    console.error('❌ Could not connect to any MongoDB instance (Atlas or Local). Please check network or MongoDB service.');
    process.exit(1);
  }

    // 1. Seed Users (Admin, Recruiters, Students)
    console.log('👤 Seeding Users...');
    await User.deleteMany({});

    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@intervai.app',
      password: 'password123',
      role: 'admin',
      college: 'IntervAI Admin Center',
      branch: 'Computer Science & Engineering',
      graduationYear: '2025',
      profileCompleted: true,
      isUserTypeLocked: true,
      targetRole: 'Platform Administrator',
      skills: ['System Architecture', 'Node.js', 'Security', 'MongoDB', 'Cloud Infrastructure'],
      placementStatus: 'Placed'
    });

    const recruiters = await User.create([
      {
        name: 'Samantha Vance',
        email: 'recruiter@techcorp.com',
        password: 'password123',
        role: 'recruiter',
        college: 'Stanford University',
        branch: 'Human Resources & Talent Lead',
        profileCompleted: true,
        isUserTypeLocked: true,
        targetRole: 'Technical Recruiter',
        skills: ['Talent Acquisition', 'Technical Screening', 'Campus Placements'],
        placementStatus: 'Placed'
      },
      {
        name: 'Marcus Thorne',
        email: 'hr@innovate.io',
        password: 'password123',
        role: 'recruiter',
        college: 'MIT Sloan',
        branch: 'Talent Acquisition Director',
        profileCompleted: true,
        isUserTypeLocked: true,
        targetRole: 'Lead Hiring Manager',
        skills: ['Executive Search', 'Engineering Hiring', 'ATS Scoring'],
        placementStatus: 'Placed'
      }
    ]);

    const candidates = await User.create([
      {
        name: 'Demo Candidate',
        email: 'demo@interai.app',
        password: 'password123',
        role: 'student',
        college: 'Stanford University',
        branch: 'Computer Science',
        graduationYear: '2026',
        profileCompleted: true,
        isUserTypeLocked: true,
        targetRole: 'Full Stack MERN Developer',
        skills: ['React', 'Node.js', 'Express', 'MongoDB', 'JavaScript', 'TypeScript', 'TailwindCSS'],
        bio: 'Passionate MERN developer interested in cloud-native scalable backend APIs and reactive UIs.',
        phone: '+1 555-0192',
        linkedIn: 'https://linkedin.com/in/demo-candidate',
        github: 'https://github.com/demo-candidate',
        placementStatus: 'Looking for Jobs'
      },
      {
        name: 'Priya Sharma',
        email: 'priya.sharma@iet.edu',
        password: 'password123',
        role: 'student',
        college: 'LJ Institute of Engineering & Tech',
        branch: 'Information Technology',
        graduationYear: '2026',
        profileCompleted: true,
        isUserTypeLocked: true,
        targetRole: 'Frontend React Engineer',
        skills: ['React', 'JavaScript', 'Redux Toolkit', 'CSS3', 'HTML5', 'Next.js', 'REST APIs'],
        bio: 'Frontend enthusiast focused on pixel-perfect UI/UX design and dynamic web applications.',
        phone: '+91 98765-43210',
        linkedIn: 'https://linkedin.com/in/priya-sharma',
        github: 'https://github.com/priya-sharma',
        placementStatus: 'Interviewing'
      },
      {
        name: 'Alex Chen',
        email: 'alex.chen@berkeley.edu',
        password: 'password123',
        role: 'student',
        college: 'UC Berkeley',
        branch: 'Electrical Engineering & CS',
        graduationYear: '2025',
        profileCompleted: true,
        isUserTypeLocked: true,
        targetRole: 'Backend Systems Architect',
        skills: ['Node.js', 'Go', 'Docker', 'Kubernetes', 'PostgreSQL', 'Redis', 'Microservices'],
        bio: 'Backend engineer passionate about high-concurrency systems, distributed caching, and microservices.',
        phone: '+1 555-0482',
        linkedIn: 'https://linkedin.com/in/alex-chen',
        github: 'https://github.com/alex-chen',
        placementStatus: 'Placed'
      },
      {
        name: 'Sarah Jenkins',
        email: 'sarah.j@stanford.edu',
        password: 'password123',
        role: 'student',
        college: 'Stanford University',
        branch: 'Artificial Intelligence & ML',
        graduationYear: '2026',
        profileCompleted: true,
        isUserTypeLocked: true,
        targetRole: 'Data Scientist & ML Specialist',
        skills: ['Python', 'PyTorch', 'TensorFlow', 'Scikit-Learn', 'Pandas', 'SQL', 'Deep Learning'],
        bio: 'AI researcher specializing in LLM fine-tuning and natural language processing pipelines.',
        phone: '+1 555-0723',
        linkedIn: 'https://linkedin.com/in/sarah-jenkins',
        github: 'https://github.com/sarah-jenkins',
        placementStatus: 'Looking for Jobs'
      },
      {
        name: 'Vikram Patel',
        email: 'vikram.patel@iit.edu',
        password: 'password123',
        role: 'student',
        college: 'IIT Bombay',
        branch: 'Computer Science',
        graduationYear: '2025',
        profileCompleted: true,
        isUserTypeLocked: true,
        targetRole: 'DevOps & Cloud Engineer',
        skills: ['AWS', 'Terraform', 'Docker', 'CI/CD', 'Linux', 'Python', 'Kubernetes', 'Bash'],
        bio: 'Cloud practitioner dedicated to automating deployments and building resilient infrastructure.',
        phone: '+91 91234-56789',
        linkedIn: 'https://linkedin.com/in/vikram-patel',
        github: 'https://github.com/vikram-patel',
        placementStatus: 'Placed'
      },
      {
        name: 'Elena Rostova',
        email: 'elena.rostova@oxford.edu',
        password: 'password123',
        role: 'student',
        college: 'University of Oxford',
        branch: 'Software Engineering',
        graduationYear: '2026',
        profileCompleted: true,
        isUserTypeLocked: true,
        targetRole: 'Mobile App Developer',
        skills: ['Flutter', 'Dart', 'React Native', 'iOS', 'Android', 'Firebase', 'GraphQL'],
        bio: 'Cross-platform mobile developer crafting responsive iOS & Android mobile apps.',
        phone: '+44 20 7946 0912',
        placementStatus: 'Interviewing'
      }
    ]);

    console.log(`✅ Created ${User.length} users successfully.`);

    // 2. Seed Mock Interviews
    console.log('🎙️ Seeding Mock Interviews...');
    await Interview.deleteMany({});

    const mockIdDemo1 = uuidv4();
    const mockIdDemo2 = uuidv4();
    const mockIdPriya = uuidv4();
    const mockIdAlex = uuidv4();
    const mockIdSarah = uuidv4();

    const interviews = await Interview.create([
      {
        mockid: mockIdDemo1,
        createdby: 'demo@interai.app',
        jobposition: 'Full Stack MERN Developer',
        jobdescription: 'Senior MERN stack role focused on React frontend and Express/MongoDB backend microservices.',
        jobexp: '2',
        difficulty: 'Expert',
        aiPersona: 'Strict Recruiter',
        status: 'Completed',
        sessionVideoUrl: '/api/v1/media/sample-session-1.webm',
        jsonmockresp: JSON.stringify([
          { question: "Explain event loop architecture in Node.js and non-blocking I/O operations.", answer: "The Node.js event loop operates on a single thread using libuv, processing async callbacks through phases: timers, I/O callbacks, idle/prepare, poll, check, and close." },
          { question: "How do React 19 Server Components differ from standard Client Components?", answer: "Server Components execute exclusively on the server, sending zero bundle size to client, while Client Components handle interactive client-side state." },
          { question: "What strategies prevent NoSQL query injection in MongoDB Mongoose queries?", answer: "Using express-mongo-sanitize middleware, avoiding raw $where string queries, and strict Zod schema validation." },
          { question: "How would you optimize MongoDB aggregations for millions of records?", answer: "Utilize compound indexes early in the pipeline ($match / $sort first), limit projection fields, and use $facet for pagination." },
          { question: "Explain JWT token refresh flow and httpOnly cookie security.", answer: "Issue short-lived access tokens stored in memory and 7-day refresh tokens in httpOnly, SameSite=Strict cookies to prevent XSS theft." }
        ])
      },
      {
        mockid: mockIdDemo2,
        createdby: 'demo@interai.app',
        jobposition: 'Frontend React Engineer',
        jobdescription: 'Building high-performance design systems and state management using React and TailwindCSS.',
        jobexp: '1',
        difficulty: 'Intermediate',
        aiPersona: 'Encouraging Coach',
        status: 'Completed',
        jsonmockresp: JSON.stringify([
          { question: "What is the primary difference between useMemo and useCallback in React?", answer: "useMemo caches the calculated value of a function, whereas useCallback caches the function definition itself." },
          { question: "How does TailwindCSS eliminate unused CSS in production builds?", answer: "Tailwind uses PostCSS purge scanning to analyze source files and keep only used utility classes." },
          { question: "Explain the Virtual DOM reconciliation algorithm in React.", answer: "React compares the new Virtual DOM tree against the snapshot using a heuristic O(n) diffing algorithm." }
        ])
      },
      {
        mockid: mockIdPriya,
        createdby: 'priya.sharma@iet.edu',
        jobposition: 'Frontend React Engineer',
        jobdescription: 'Junior frontend engineer with focus on responsive layouts and state synchronization.',
        jobexp: '1',
        difficulty: 'Intermediate',
        aiPersona: 'Strict Recruiter',
        status: 'Completed',
        jsonmockresp: JSON.stringify([
          { question: "Explain React hook rules and why hooks cannot be called conditionally.", answer: "Hooks rely on call order array indices inside React internal Fiber nodes; dynamic conditions disrupt index mapping." },
          { question: "How do you handle global application state without prop-drilling?", answer: "Using React Context API, Redux Toolkit, or Zustand state stores." }
        ])
      },
      {
        mockid: mockIdAlex,
        createdby: 'alex.chen@berkeley.edu',
        jobposition: 'Backend Systems Architect',
        jobdescription: 'Designing distributed microservices, Redis caching, and PostgreSQL schema partitioning.',
        jobexp: '3',
        difficulty: 'Expert',
        aiPersona: 'Strict Recruiter',
        status: 'Completed',
        jsonmockresp: JSON.stringify([
          { question: "How do you maintain data consistency across distributed microservices?", answer: "Using the Saga pattern (orchestration or choreography) or Two-Phase Commit (2PC) with event-driven architecture." },
          { question: "Explain cache stampede (thundering herd) prevention strategies in Redis.", answer: "Using mutex locks (Redlock), probabilistic early expiration (XFetch algorithm), or background cache refreshing." }
        ])
      },
      {
        mockid: mockIdSarah,
        createdby: 'sarah.j@stanford.edu',
        jobposition: 'Data Scientist & ML Specialist',
        jobdescription: 'Machine learning model evaluation, feature engineering, and PyTorch deep learning pipelines.',
        jobexp: '2',
        difficulty: 'Expert',
        aiPersona: 'Strict Recruiter',
        status: 'Completed',
        jsonmockresp: JSON.stringify([
          { question: "How do you address overfitting in deep neural networks?", answer: "Applying L1/L2 regularization, Dropout layers, Early Stopping, Data Augmentation, and Batch Normalization." }
        ])
      }
    ]);

    console.log(`✅ Seeded ${interviews.length} mock interviews.`);

    // 3. Seed User Answers (Question Evaluation Ratings & Feedback)
    console.log('📝 Seeding Candidate Answers & AI Evaluations...');
    await UserAnswer.deleteMany({});

    await UserAnswer.create([
      {
        mockidRef: mockIdDemo1,
        question: "Explain event loop architecture in Node.js and non-blocking I/O operations.",
        correctanswer: "The Node.js event loop operates on a single thread using libuv, processing async callbacks through phases: timers, I/O callbacks, idle/prepare, poll, check, and close.",
        useranswer: "The Node.js event loop is managed by libuv. It handles asynchronous operations off the main thread so Node doesn't block on heavy I/O operations like disk or database access.",
        rating: "9",
        justification: "Demonstrated accurate technical knowledge of libuv and non-blocking I/O concepts.",
        feedback: "Excellent explanation! Clear understanding of single-threaded asynchronous execution.",
        detailedFeedback: "Candidate correctly identified libuv, single-threaded model, and non-blocking I/O mechanisms. Pacing and terminology were technical and articulate.",
        confidenceScore: 92,
        eyeContactScore: 95,
        clarityScore: 90,
        paceScore: 88,
        depthScore: 94,
        vocabularyScore: 90,
        fillerWordsCount: 1,
        userEmail: 'demo@interai.app',
        cheatEvents: { copyPasteCount: 0, tabSwitchCount: 0, multipleFacesDetected: false, lookingAwayCount: 0, noFaceCount: 0 }
      },
      {
        mockidRef: mockIdDemo1,
        question: "How do React 19 Server Components differ from standard Client Components?",
        correctanswer: "Server Components execute exclusively on the server, sending zero bundle size to client, while Client Components handle interactive client-side state.",
        useranswer: "Server components run on the server before sending HTML, so they don't add extra JS to client bundles. Client components run in browser for state like useState.",
        rating: "8",
        justification: "Correctly differentiated bundle impact and client interactivity.",
        feedback: "Good response! You hit the core distinction regarding bundle size reduction.",
        detailedFeedback: "Strong conceptual understanding. Mentioning zero-bundle size for server components demonstrated modern React knowledge.",
        confidenceScore: 85,
        eyeContactScore: 90,
        clarityScore: 88,
        paceScore: 85,
        depthScore: 82,
        vocabularyScore: 86,
        fillerWordsCount: 2,
        userEmail: 'demo@interai.app',
        cheatEvents: { copyPasteCount: 0, tabSwitchCount: 0, multipleFacesDetected: false, lookingAwayCount: 0, noFaceCount: 0 }
      },
      {
        mockidRef: mockIdDemo1,
        question: "What strategies prevent NoSQL query injection in MongoDB Mongoose queries?",
        correctanswer: "Using express-mongo-sanitize middleware, avoiding raw $where string queries, and strict Zod schema validation.",
        useranswer: "By sanitizing inputs using express-mongo-sanitize middleware and using strict schema validation with libraries like Zod or Joi.",
        rating: "9",
        justification: "Accurate security measures identified including sanitization middleware and schema validation.",
        feedback: "Great security awareness! Pointing out express-mongo-sanitize is ideal.",
        detailedFeedback: "Spot on security guidance for production MERN apps.",
        confidenceScore: 90,
        eyeContactScore: 92,
        clarityScore: 92,
        paceScore: 90,
        depthScore: 90,
        vocabularyScore: 92,
        fillerWordsCount: 0,
        userEmail: 'demo@interai.app',
        cheatEvents: { copyPasteCount: 0, tabSwitchCount: 0, multipleFacesDetected: false, lookingAwayCount: 0, noFaceCount: 0 }
      },
      {
        mockidRef: mockIdPriya,
        question: "Explain React hook rules and why hooks cannot be called conditionally.",
        correctanswer: "Hooks rely on call order array indices inside React internal Fiber nodes; dynamic conditions disrupt index mapping.",
        useranswer: "Hooks must be called at top level because React relies on call order array index inside Fiber nodes.",
        rating: "8",
        justification: "Accurate explanation of Fiber call order constraints.",
        feedback: "Solid grasp of React internal mechanics.",
        detailedFeedback: "Good explanation of why conditional hooks break internal order tracking.",
        confidenceScore: 85,
        eyeContactScore: 88,
        clarityScore: 86,
        paceScore: 84,
        depthScore: 80,
        vocabularyScore: 84,
        fillerWordsCount: 1,
        userEmail: 'priya.sharma@iet.edu',
        cheatEvents: { copyPasteCount: 0, tabSwitchCount: 0, multipleFacesDetected: false, lookingAwayCount: 0, noFaceCount: 0 }
      },
      {
        mockidRef: mockIdAlex,
        question: "How do you maintain data consistency across distributed microservices?",
        correctanswer: "Using the Saga pattern (orchestration or choreography) or Two-Phase Commit (2PC) with event-driven architecture.",
        useranswer: "We use the Saga pattern with event-driven architecture and event bus like Kafka to manage eventual consistency across microservices.",
        rating: "10",
        justification: "Perfect system design response identifying Sagas, Kafka, and eventual consistency.",
        feedback: "Flawless backend architecture answer!",
        detailedFeedback: "Demonstrated senior-level distributed system design knowledge.",
        confidenceScore: 98,
        eyeContactScore: 95,
        clarityScore: 96,
        paceScore: 95,
        depthScore: 98,
        vocabularyScore: 96,
        fillerWordsCount: 0,
        userEmail: 'alex.chen@berkeley.edu',
        cheatEvents: { copyPasteCount: 0, tabSwitchCount: 0, multipleFacesDetected: false, lookingAwayCount: 0, noFaceCount: 0 }
      }
    ]);

    // 4. Seed Trust Scores & Violations
    console.log('🛡️ Seeding Proctoring Trust Scores & Violations...');
    await TrustScore.deleteMany({});
    await Violation.deleteMany({});

    await TrustScore.create([
      { interviewId: mockIdDemo1, userEmail: 'demo@interai.app', score: 95, status: 'Excellent' },
      { interviewId: mockIdDemo2, userEmail: 'demo@interai.app', score: 90, status: 'Excellent' },
      { interviewId: mockIdPriya, userEmail: 'priya.sharma@iet.edu', score: 85, status: 'Good' },
      { interviewId: mockIdAlex, userEmail: 'alex.chen@berkeley.edu', score: 100, status: 'Excellent' },
      { interviewId: mockIdSarah, userEmail: 'sarah.j@stanford.edu', score: 65, status: 'Warning' }
    ]);

    await Violation.create([
      {
        interviewId: mockIdPriya,
        userEmail: 'priya.sharma@iet.edu',
        violationType: 'FULLSCREEN_EXIT',
        description: 'Candidate exited full-screen mode briefly',
        duration: 3,
        severity: 'Medium',
        trustScoreBefore: 100,
        trustScoreAfter: 95
      },
      {
        interviewId: mockIdSarah,
        userEmail: 'sarah.j@stanford.edu',
        violationType: 'TAB_SWITCH',
        description: 'Switched active browser tab during session',
        duration: 8,
        severity: 'Medium',
        trustScoreBefore: 80,
        trustScoreAfter: 75
      },
      {
        interviewId: mockIdSarah,
        userEmail: 'sarah.j@stanford.edu',
        violationType: 'LOOKING_AWAY',
        description: 'Head pose turned away from primary webcam angle',
        duration: 12,
        severity: 'High',
        trustScoreBefore: 75,
        trustScoreAfter: 65
      }
    ]);

    // 5. Seed Placement Certificates
    console.log('📜 Seeding Placement Certificates...');
    await Certificate.deleteMany({});

    await Certificate.create([
      {
        userId: candidates[0]._id,
        interviewId: mockIdDemo1,
        candidateName: 'Demo Candidate',
        interviewTitle: 'Full Stack MERN Developer',
        score: 87,
        status: 'Passed',
        certificateId: 'CERT-8A2F91C4'
      },
      {
        userId: candidates[2]._id,
        interviewId: mockIdAlex,
        candidateName: 'Alex Chen',
        interviewTitle: 'Backend Systems Architect',
        score: 98,
        status: 'Passed',
        certificateId: 'CERT-3B90E1F2'
      },
      {
        userId: candidates[1]._id,
        interviewId: mockIdPriya,
        candidateName: 'Priya Sharma',
        interviewTitle: 'Frontend React Engineer',
        score: 82,
        status: 'Passed',
        certificateId: 'CERT-5D71C809'
      }
    ]);

    // 6. Seed AI Insights Candidate Profiles
    console.log('💡 Seeding Candidate AI Profiles...');
    await CandidateAiProfile.deleteMany({});

    await CandidateAiProfile.create([
      {
        userId: candidates[0]._id,
        summary: 'Demo Candidate demonstrates outstanding technical command of the MERN stack, REST API security, and asynchronous JavaScript execution. Communicates concisely with high confidence.',
        strengths: ['Event Loop Mechanics', 'MongoDB Query Security', 'React 19 Server Components'],
        weaknesses: ['Could elaborate more on system monitoring & APM tools'],
        recommendedRoles: ['Senior MERN Developer', 'Full Stack Engineer', 'Backend Specialist'],
        matchScore: 88,
        lastUpdated: new Date()
      },
      {
        userId: candidates[2]._id,
        summary: 'Alex is an exceptional backend candidate with expert knowledge of distributed microservices, distributed transaction management (Saga pattern), and Redis caching strategy.',
        strengths: ['Microservices Saga Architecture', 'Redis Cache Stampede Mitigation', 'Distributed Consistency'],
        weaknesses: ['None observed'],
        recommendedRoles: ['Backend Systems Architect', 'Staff Backend Engineer'],
        matchScore: 98,
        lastUpdated: new Date()
      },
      {
        userId: candidates[1]._id,
        summary: 'Priya shows solid understanding of React internals, hook rules, and state management. Strong candidate for frontend development roles.',
        strengths: ['React Fiber Architecture', 'Component Lifecycle & Hook Rules', 'Context API State Management'],
        weaknesses: ['Explore SSR & Next.js App Router optimization'],
        recommendedRoles: ['Frontend React Engineer', 'UI/UX Web Developer'],
        matchScore: 82,
        lastUpdated: new Date()
      }
    ]);

    // 7. Seed Site Feedback Reviews
    console.log('⭐ Seeding Site Feedback Reviews...');
    await SiteFeedback.deleteMany({});

    await SiteFeedback.create([
      {
        user: candidates[1]._id,
        name: 'Priya Sharma',
        email: 'priya.sharma@iet.edu',
        feedback: 'IntervAI helped me crack my campus placement interviews! The speech recognition and real-time proctoring gave me genuine practice.',
        rating: 5,
        needsUpgradation: false
      },
      {
        user: recruiters[0]._id,
        name: 'Samantha Vance',
        email: 'recruiter@techcorp.com',
        feedback: 'The recruiter dashboard talent pool saves us dozens of hours in candidate screening. The Hire/Consider badges are spot on!',
        rating: 5,
        needsUpgradation: false
      },
      {
        user: candidates[2]._id,
        name: 'Alex Chen',
        email: 'alex.chen@berkeley.edu',
        feedback: 'The scenario questions were unpredictable and challenged my architectural depth. Highly recommend to engineering students!',
        rating: 5,
        needsUpgradation: false
      }
    ]);

    // 8. Seed AI Request Logs
    console.log('📊 Seeding AI Request Logs...');
    await AIRequestLog.deleteMany({});

    await AIRequestLog.create([
      { userId: candidates[0]._id, requestType: 'GENERATE_INTERVIEW_QUESTIONS', provider: 'gemini', responseTime: 1250, success: true },
      { userId: candidates[0]._id, requestType: 'EVALUATE_ANSWER', provider: 'gemini', responseTime: 1420, success: true },
      { userId: candidates[1]._id, requestType: 'GENERATE_CANDIDATE_INSIGHTS', provider: 'gemini', responseTime: 980, success: true },
      { userId: candidates[2]._id, requestType: 'EVALUATE_ANSWER', provider: 'gemini', responseTime: 1100, success: true }
    ]);

    console.log('\n🎉 ALL COLLECTIONS SUCCESSFULLY SEEDED ON ATLAS CLUSTER! 🎉');
    console.log('----------------------------------------------------');
    console.log('🔑 TEST LOGIN CREDENTIALS:');
    console.log('1. Admin:     admin@intervai.app    / password123');
    console.log('2. Recruiter: recruiter@techcorp.com / password123');
    console.log('3. Student:   demo@interai.app       / password123');
    console.log('4. Student:   priya.sharma@iet.edu   / password123');
    console.log('----------------------------------------------------');
    process.exit(0);
}

seedData();
