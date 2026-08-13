const { v4: uuidv4 } = require('uuid');

const User = require('../models/User');
const Interview = require('../models/Interview');
const UserAnswer = require('../models/UserAnswer');
const TrustScore = require('../models/TrustScore');
const Violation = require('../models/Violation');
const Certificate = require('../models/Certificate');
const CandidateAiProfile = require('../models/CandidateAiProfile');
const SiteFeedback = require('../models/SiteFeedback');
const AIRequestLog = require('../models/AIRequestLog');

async function runSeed() {
  console.log('🧹 Cleaning existing collections...');
  await Promise.all([
    User.deleteMany({}),
    Interview.deleteMany({}),
    UserAnswer.deleteMany({}),
    TrustScore.deleteMany({}),
    Violation.deleteMany({}),
    Certificate.deleteMany({}),
    CandidateAiProfile.deleteMany({}),
    SiteFeedback.deleteMany({}),
    AIRequestLog.deleteMany({})
  ]);

  // 1. System Admin & Recruiters
  console.log('👤 Seeding System Admin & Recruiters...');
  const adminUser = await User.create({
    name: 'System Administrator',
    email: 'admin@intervai.app',
    password: 'password123',
    role: 'admin',
    college: 'IntervAI Global Admin Hub',
    branch: 'Computer Science & Software Architecture',
    graduationYear: '2024',
    profileCompleted: true,
    isUserTypeLocked: true,
    targetRole: 'Platform Administrator',
    skills: ['System Architecture', 'Node.js', 'MongoDB', 'Security Audit', 'DevOps', 'Cloud Infrastructure'],
    placementStatus: 'Placed'
  });

  const recruiters = await User.create([
    {
      name: 'Samantha Vance',
      email: 'recruiter@techcorp.com',
      password: 'password123',
      role: 'recruiter',
      college: 'Stanford University',
      branch: 'Human Resources & Talent Acquisition',
      profileCompleted: true,
      isUserTypeLocked: true,
      targetRole: 'Technical Recruiter & Hiring Manager',
      skills: ['Technical Screening', 'Campus Placements', 'MERN Evaluation', 'System Design Assessment'],
      placementStatus: 'Placed'
    },
    {
      name: 'Marcus Thorne',
      email: 'hr@innovate.io',
      password: 'password123',
      role: 'recruiter',
      college: 'MIT Sloan School of Management',
      branch: 'Talent Acquisition Director',
      profileCompleted: true,
      isUserTypeLocked: true,
      targetRole: 'Lead Technical Hiring Manager',
      skills: ['Engineering Hiring', 'Executive Search', 'ATS Score Analysis', 'Proctoring Audits'],
      placementStatus: 'Placed'
    }
  ]);

  // 2. Seed 25 Full Student Candidates
  console.log('🎓 Seeding 25 Full Student Candidates...');
  const candidateDataList = [
    { name: 'Demo Candidate', email: 'demo@interai.app', college: 'Stanford University', branch: 'Computer Science', year: '2026', role: 'Full Stack MERN Developer', skills: ['React', 'Node.js', 'Express', 'MongoDB', 'JavaScript', 'TypeScript', 'TailwindCSS'], status: 'Looking for Jobs' },
    { name: 'Priya Sharma', email: 'priya.sharma@iet.edu', college: 'LJ Institute of Engineering & Tech', branch: 'Information Technology', year: '2026', role: 'Frontend React Engineer', skills: ['React', 'JavaScript', 'Redux Toolkit', 'CSS3', 'HTML5', 'Next.js', 'REST APIs'], status: 'Interviewing' },
    { name: 'Alex Chen', email: 'alex.chen@berkeley.edu', college: 'UC Berkeley', branch: 'Electrical Engineering & CS', year: '2025', role: 'Backend Systems Architect', skills: ['Node.js', 'Go', 'Docker', 'Kubernetes', 'PostgreSQL', 'Redis', 'Microservices'], status: 'Placed' },
    { name: 'Sarah Jenkins', email: 'sarah.j@stanford.edu', college: 'Stanford University', branch: 'Artificial Intelligence & ML', year: '2026', role: 'Data Scientist & ML Specialist', skills: ['Python', 'PyTorch', 'TensorFlow', 'Scikit-Learn', 'Pandas', 'SQL', 'Deep Learning'], status: 'Looking for Jobs' },
    { name: 'Vikram Patel', email: 'vikram.patel@iit.edu', college: 'IIT Bombay', branch: 'Computer Science', year: '2025', role: 'DevOps & Cloud Engineer', skills: ['AWS', 'Terraform', 'Docker', 'CI/CD', 'Linux', 'Python', 'Kubernetes', 'Bash'], status: 'Placed' },
    { name: 'Elena Rostova', email: 'elena.rostova@oxford.edu', college: 'University of Oxford', branch: 'Software Engineering', year: '2026', role: 'Mobile App Developer', skills: ['Flutter', 'Dart', 'React Native', 'iOS', 'Android', 'Firebase', 'GraphQL'], status: 'Interviewing' },
    { name: 'Rohan Mehta', email: 'rohan.m@nitk.edu', college: 'NIT Surathkal', branch: 'Computer Science & Engineering', year: '2026', role: 'Full Stack MERN Developer', skills: ['MongoDB', 'Express', 'React', 'Node.js', 'REST APIs', 'Git', 'TailwindCSS'], status: 'Looking for Jobs' },
    { name: 'Aarav Gupta', email: 'aarav.g@bits.edu', college: 'BITS Pilani', branch: 'Information Systems', year: '2025', role: 'Backend Node.js Engineer', skills: ['Node.js', 'Express', 'TypeScript', 'MongoDB', 'Redis', 'Jest', 'Docker'], status: 'Placed' },
    { name: 'Ananya Verma', email: 'ananya.v@dtu.edu', college: 'Delhi Technological University', branch: 'Software Engineering', year: '2026', role: 'UI/UX Frontend Developer', skills: ['React', 'TypeScript', 'TailwindCSS', 'Figma', 'Next.js', 'Redux', 'Framer Motion'], status: 'Interviewing' },
    { name: 'David Kim', email: 'david.kim@cmu.edu', college: 'Carnegie Mellon University', branch: 'Computer Science', year: '2025', role: 'Distributed Systems Engineer', skills: ['C++', 'Go', 'Distributed Systems', 'gRPC', 'PostgreSQL', 'Docker', 'Linux'], status: 'Placed' },
    { name: 'Sofia Rodriguez', email: 'sofia.r@mit.edu', college: 'MIT', branch: 'Electrical Engineering & CS', year: '2026', role: 'Cybersecurity Analyst', skills: ['Network Security', 'Python', 'Ethical Hacking', 'Linux', 'OWASP Top 10', 'Cryptography'], status: 'Looking for Jobs' },
    { name: 'Kavya Nair', email: 'kavya.n@vit.edu', college: 'VIT Vellore', branch: 'Computer Science & Tech', year: '2026', role: 'Cloud Software Engineer', skills: ['Java', 'Spring Boot', 'AWS', 'Microservices', 'Docker', 'Hibernate', 'SQL'], status: 'Interviewing' },
    { name: 'Liam O\'Connor', email: 'liam.oc@harvard.edu', college: 'Harvard University', branch: 'Computer Science', year: '2025', role: 'Full Stack Developer', skills: ['React', 'Python', 'Django', 'PostgreSQL', 'JavaScript', 'AWS', 'Docker'], status: 'Placed' },
    { name: 'Siddharth Joshi', email: 'siddharth.j@vjti.edu', college: 'VJTI Mumbai', branch: 'Information Technology', year: '2026', role: 'Frontend React Developer', skills: ['React', 'JavaScript', 'HTML5', 'CSS3', 'Bootstrap', 'REST APIs', 'Git'], status: 'Looking for Jobs' },
    { name: 'Meera Deshmukh', email: 'meera.d@coep.edu', college: 'COEP Pune', branch: 'Computer Engineering', year: '2025', role: 'Data Engineer', skills: ['Python', 'PySpark', 'Apache Kafka', 'SQL', 'Snowflake', 'Airflow', 'AWS'], status: 'Placed' },
    { name: 'Karan Malhotra', email: 'karan.m@thapar.edu', college: 'Thapar Institute', branch: 'Computer Science', year: '2026', role: 'MERN Stack Developer', skills: ['React', 'Node.js', 'Express', 'MongoDB', 'TailwindCSS', 'Redux', 'Git'], status: 'Looking for Jobs' },
    { name: 'Jessica Taylor', email: 'jessica.t@ucla.edu', college: 'UCLA', branch: 'Computer Science', year: '2026', role: 'QA Automation Engineer', skills: ['Selenium', 'Cypress', 'JavaScript', 'Python', 'Jest', 'CI/CD Pipelines', 'Jira'], status: 'Interviewing' },
    { name: 'Arjun Nambiar', email: 'arjun.n@iitm.edu', college: 'IIT Madras', branch: 'Electrical Engineering', year: '2025', role: 'Embedded Software Engineer', skills: ['C', 'C++', 'Embedded Systems', 'RTOS', 'ARM', 'Python', 'Linux Kernel'], status: 'Placed' },
    { name: 'Tanvi Agarwal', email: 'tanvi.a@nsut.edu', college: 'NSUT Delhi', branch: 'Information Technology', year: '2026', role: 'Frontend React Engineer', skills: ['React', 'TypeScript', 'Redux', 'CSS Modules', 'Next.js', 'Jest', 'Webpack'], status: 'Interviewing' },
    { name: 'Carlos Mendez', email: 'carlos.m@utexas.edu', college: 'UT Austin', branch: 'Computer Science', year: '2026', role: 'Backend Node.js Engineer', skills: ['Node.js', 'Express', 'PostgreSQL', 'Docker', 'REST APIs', 'Redis', 'AWS'], status: 'Looking for Jobs' },
    { name: 'Neha Kulkarni', email: 'neha.k@pict.edu', college: 'PICT Pune', branch: 'Computer Science', year: '2025', role: 'Full Stack Java Engineer', skills: ['Java', 'Spring Boot', 'React', 'MySQL', 'Hibernate', 'Docker', 'Maven'], status: 'Placed' },
    { name: 'Omar Al-Mansoor', email: 'omar.m@nyu.edu', college: 'NYU Courant', branch: 'Computer Science', year: '2026', role: 'AI Applications Engineer', skills: ['Python', 'LangChain', 'FastAPI', 'OpenAI API', 'React', 'MongoDB', 'Vector DBs'], status: 'Looking for Jobs' },
    { name: 'Ishita Roy', email: 'ishita.r@ju.edu', college: 'Jadavpur University', branch: 'Computer Science & Tech', year: '2026', role: 'Frontend Developer', skills: ['JavaScript', 'React', 'HTML5', 'CSS3', 'TailwindCSS', 'Git', 'Figma'], status: 'Looking for Jobs' },
    { name: 'Lucas Silva', email: 'lucas.s@gatech.edu', college: 'Georgia Tech', branch: 'Computer Science', year: '2025', role: 'Site Reliability Engineer', skills: ['Kubernetes', 'Prometheus', 'Grafana', 'Python', 'Go', 'AWS', 'Terraform'], status: 'Placed' },
    { name: 'Riya Sengupta', email: 'riya.s@iiit.edu', college: 'IIIT Hyderabad', branch: 'Computer Science & Engineering', year: '2026', role: 'Full Stack MERN Developer', skills: ['React', 'Node.js', 'Express', 'MongoDB', 'TypeScript', 'Redux Toolkit', 'TailwindCSS'], status: 'Interviewing' }
  ];

  const studentUsers = [];
  for (const c of candidateDataList) {
    const u = await User.create({
      name: c.name,
      email: c.email,
      password: 'password123',
      role: 'student',
      college: c.college,
      branch: c.branch,
      graduationYear: c.year,
      profileCompleted: true,
      isUserTypeLocked: true,
      targetRole: c.role,
      skills: c.skills,
      bio: `Enthusiastic ${c.role} candidate with hands-on experience in ${c.skills.slice(0, 3).join(', ')}. Passionate about building scalable applications.`,
      phone: `+1 ${Math.floor(100 + Math.random() * 900)}-${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`,
      linkedIn: `https://linkedin.com/in/${c.name.toLowerCase().replace(/[^a-z]/g, '-')}`,
      github: `https://github.com/${c.name.toLowerCase().replace(/[^a-z]/g, '-')}`,
      placementStatus: c.status
    });
    studentUsers.push(u);
  }

  console.log(`✅ Created 25 Full Student Profiles.`);

  // 3. Seed 3 Full Sessions with Perfect Evaluations for Demo Candidate (demo@interai.app)
  console.log('🎙️ Seeding 3 Full Perfect Sessions for Demo Candidate...');
  const demoCandidate = studentUsers[0];

  const demoSessions = [
    {
      title: 'Full Stack MERN Developer Assessment',
      desc: 'Advanced technical mock evaluation covering Node.js event loop, React 19 Server Components, MongoDB indexing, and NoSQL query injection security.',
      difficulty: 'Expert',
      persona: 'Strict Recruiter',
      score: 90,
      trust: 95,
      questions: [
        {
          q: "Explain event loop architecture in Node.js and non-blocking I/O operations.",
          a: "Node.js runs single-threaded using libuv. Asynchronous operations like network requests, database calls, and file system tasks are offloaded to worker threads via libuv.",
          rating: "9",
          just: "Demonstrated accurate technical knowledge of libuv, event loop phases, and single-threaded async execution.",
          fb: "Flawless explanation! You clearly understand how non-blocking I/O keeps the main thread unblocked."
        },
        {
          q: "How do React 19 Server Components differ from standard Client Components?",
          a: "Server Components render exclusively on the server before transmitting zero JavaScript bundle to the browser client, whereas Client Components handle client-side interactivity like useState.",
          rating: "9",
          just: "Clear differentiation of bundle footprint reduction and client-side state handling.",
          fb: "Spot on! Great understanding of modern React 19 server rendering patterns."
        },
        {
          q: "What strategies prevent NoSQL query injection in MongoDB Mongoose queries?",
          a: "Using express-mongo-sanitize middleware to strip $ operators, avoiding raw $where strings, and strictly validating input types using Zod schemas.",
          rating: "9",
          just: "Comprehensive production security awareness.",
          fb: "Excellent! Expressing input sanitization and schema validation shows high security consciousness."
        },
        {
          q: "How would you optimize MongoDB aggregations for millions of records?",
          a: "Place $match and $sort stages at the top of the pipeline to leverage compound indexes, project only needed fields, and use $facet for pagination.",
          rating: "9",
          just: "Clear index leverage strategy and aggregation pipeline optimization.",
          fb: "Great performance optimization strategy!"
        }
      ]
    },
    {
      title: 'Frontend React & Next.js Architecture',
      desc: 'Senior React interview evaluating Fiber reconciliation, custom hooks, Redux Toolkit, and web performance optimization.',
      difficulty: 'Expert',
      persona: 'Encouraging Coach',
      score: 95,
      trust: 100,
      questions: [
        {
          q: "Explain React hook rules and why hooks cannot be called conditionally.",
          a: "Hooks rely on internal call order array indices inside Fiber nodes. Dynamic conditional execution disrupts the internal call order mapping across re-renders.",
          rating: "10",
          just: "Flawless technical explanation of Fiber call order array tracking.",
          fb: "Perfect! You know the exact internal Fiber node mechanics behind React Hook rules."
        },
        {
          q: "How do you optimize render performance in complex React component trees?",
          a: "Using React.memo to memoize components, useCallback for function props, useMemo for heavy calculations, and dynamic imports via React.lazy for code splitting.",
          rating: "9",
          just: "Comprehensive memoization and dynamic import performance strategy.",
          fb: "Excellent performance techniques!"
        },
        {
          q: "What is the difference between client-side routing and Next.js SSR App Router?",
          a: "Client-side routing downloads full JS bundles and renders in browser, while Next.js App Router renders HTML per request on edge servers for instant FCP and optimal SEO.",
          rating: "9",
          just: "Accurate distinction between SPA client-side rendering and SSR edge streaming.",
          fb: "Great grasp of modern SSR routing architectures!"
        },
        {
          q: "How do you handle global state synchronization without prop-drilling?",
          a: "Using Redux Toolkit slices or Zustand stores for global application state, and React Context API for localized UI theme/auth state.",
          rating: "10",
          just: "Clean architectural division between global domain state and contextual UI state.",
          fb: "Very clean architectural approach!"
        }
      ]
    },
    {
      title: 'Backend Systems Architecture & Microservices',
      desc: 'Distributed systems design interview covering Saga orchestrators, Redis distributed caching, and JWT refresh token flows.',
      difficulty: 'Expert',
      persona: 'Strict Recruiter',
      score: 92,
      trust: 98,
      questions: [
        {
          q: "How do you maintain data consistency across distributed microservices?",
          a: "We implement the Saga pattern using event-driven architecture with Kafka/RabbitMQ to manage eventual consistency and compensating transactions.",
          rating: "10",
          just: "Expert system design explanation identifying Sagas, event brokers, and eventual consistency.",
          fb: "Outstanding backend architecture response!"
        },
        {
          q: "Explain cache stampede prevention strategies in Redis deployments.",
          a: "Using distributed mutex locks (Redlock), probabilistic early expiration (XFetch algorithm), or background worker warmers.",
          rating: "9",
          just: "Demonstrated senior-level knowledge of distributed cache concurrency control.",
          fb: "Very strong cache concurrency management!"
        },
        {
          q: "How do you securely structure JWT token authentication with Refresh Tokens?",
          a: "Issue short-lived access tokens stored in memory and 7-day refresh tokens stored in httpOnly, SameSite=Strict cookies with token rotation.",
          rating: "9",
          just: "Clear security strategy protecting against XSS and CSRF vulnerabilities.",
          fb: "Spot on security implementation!"
        },
        {
          q: "What is the role of database indexing and how do compound indexes work?",
          a: "Indexes create B-Tree lookup structures. Compound indexes cover multi-field queries, following the Equality, Sort, Range (ESR) rule.",
          rating: "9",
          just: "Accurate B-Tree indexing and ESR query rule explanation.",
          fb: "Solid database internals knowledge!"
        }
      ]
    }
  ];

  for (const session of demoSessions) {
    const mockId = uuidv4();
    
    await Interview.create({
      mockid: mockId,
      createdby: demoCandidate.email,
      jobposition: session.title,
      jobdescription: session.desc,
      jobexp: '2',
      difficulty: session.difficulty,
      aiPersona: session.persona,
      status: 'Completed',
      sessionVideoUrl: `/api/v1/media/sample-${mockId.substring(0, 6)}.webm`,
      jsonmockresp: JSON.stringify(session.questions.map(q => ({ question: q.q, answer: q.a })))
    });

    for (const q of session.questions) {
      await UserAnswer.create({
        mockidRef: mockId,
        question: q.q,
        correctanswer: q.a,
        useranswer: q.a,
        rating: q.rating,
        justification: q.just,
        feedback: q.fb,
        detailedFeedback: `${q.fb} Evaluation score: ${q.rating}/10. Clear technical depth and terminology.`,
        confidenceScore: Number(q.rating) * 10,
        eyeContactScore: session.trust,
        clarityScore: Number(q.rating) * 10,
        paceScore: 88,
        depthScore: Number(q.rating) * 10,
        vocabularyScore: Number(q.rating) * 10,
        fillerWordsCount: 1,
        userEmail: demoCandidate.email,
        cheatEvents: { copyPasteCount: 0, tabSwitchCount: 0, multipleFacesDetected: false, lookingAwayCount: 0, noFaceCount: 0 }
      });
    }

    await TrustScore.create({
      interviewId: mockId,
      userEmail: demoCandidate.email,
      score: session.trust,
      status: 'Excellent'
    });

    await Certificate.create({
      userId: demoCandidate._id,
      interviewId: mockId,
      candidateName: demoCandidate.name,
      interviewTitle: session.title,
      score: session.score,
      status: 'Passed',
      certificateId: `CERT-${uuidv4().substring(0, 8).toUpperCase()}`
    });
  }

  // AI Profile for Demo Candidate
  await CandidateAiProfile.create({
    userId: demoCandidate._id,
    summary: 'Demo Candidate shows exceptional technical depth across Full Stack MERN development, React 19 internals, and distributed microservices architecture. Communicates with top-tier confidence.',
    strengths: ['Event Loop & Non-Blocking I/O', 'React 19 Fiber Reconciliation & Hooks', 'Microservices Saga Architecture & Security'],
    weaknesses: ['Explore advanced APM & Prometheus metrics monitoring'],
    recommendedRoles: ['Senior MERN Developer', 'Full Stack Architect', 'Lead Frontend Engineer'],
    matchScore: 92,
    lastUpdated: new Date()
  });

  // Seed additional sessions for Priya Sharma & Alex Chen
  const priyaUser = studentUsers[1];
  const alexUser = studentUsers[2];

  const additionalSessions = [
    {
      user: priyaUser,
      role: 'Frontend React Engineer',
      desc: 'React state hooks and component lifecycle assessment',
      score: 85,
      trust: 90,
      questions: [{ q: "Explain React hook rules.", a: "Hooks must be called at top level due to Fiber node call order index.", rating: "8", just: "Good understanding." }]
    },
    {
      user: alexUser,
      role: 'Backend Systems Architect',
      desc: 'Distributed microservices and Saga transaction management',
      score: 98,
      trust: 100,
      questions: [{ q: "How do you maintain consistency in microservices?", a: "Using Saga pattern with Kafka event bus.", rating: "10", just: "Flawless response." }]
    }
  ];

  for (const item of additionalSessions) {
    const mockId = uuidv4();
    await Interview.create({
      mockid: mockId,
      createdby: item.user.email,
      jobposition: item.role,
      jobdescription: item.desc,
      jobexp: '2',
      difficulty: 'Expert',
      aiPersona: 'Strict Recruiter',
      status: 'Completed',
      jsonmockresp: JSON.stringify(item.questions.map(q => ({ question: q.q, answer: q.a })))
    });

    for (const q of item.questions) {
      await UserAnswer.create({
        mockidRef: mockId,
        question: q.q,
        correctanswer: q.a,
        useranswer: q.a,
        rating: q.rating,
        justification: q.just,
        feedback: `Great response! Rated ${q.rating}/10`,
        detailedFeedback: `Clear candidate response. Score: ${q.rating}/10`,
        confidenceScore: Number(q.rating) * 10,
        eyeContactScore: item.trust,
        clarityScore: 90,
        paceScore: 85,
        depthScore: Number(q.rating) * 10,
        vocabularyScore: 90,
        fillerWordsCount: 0,
        userEmail: item.user.email,
        cheatEvents: { copyPasteCount: 0, tabSwitchCount: 0, multipleFacesDetected: false, lookingAwayCount: 0, noFaceCount: 0 }
      });
    }

    await TrustScore.create({
      interviewId: mockId,
      userEmail: item.user.email,
      score: item.trust,
      status: 'Excellent'
    });

    await Certificate.create({
      userId: item.user._id,
      interviewId: mockId,
      candidateName: item.user.name,
      interviewTitle: item.role,
      score: item.score,
      status: 'Passed',
      certificateId: `CERT-${uuidv4().substring(0, 8).toUpperCase()}`
    });

    await CandidateAiProfile.create({
      userId: item.user._id,
      summary: `${item.user.name} is a top candidate for ${item.role} roles.`,
      strengths: [item.role],
      weaknesses: ['None'],
      recommendedRoles: [item.role],
      matchScore: item.score,
      lastUpdated: new Date()
    });
  }

  // Seed Site Feedback
  await SiteFeedback.create([
    {
      user: studentUsers[0]._id,
      name: 'Demo Candidate',
      email: 'demo@interai.app',
      feedback: 'IntervAI provides real interview simulation! The speech recognition and detailed AI evaluation scores gave me genuine confidence for campus drives.',
      rating: 5,
      needsUpgradation: false
    },
    {
      user: recruiters[0]._id,
      name: 'Samantha Vance',
      email: 'recruiter@techcorp.com',
      feedback: 'The recruiter dashboard talent pool saves us dozens of hours in candidate screening.',
      rating: 5,
      needsUpgradation: false
    }
  ]);

  // Seed AI Logs
  await AIRequestLog.create([
    { userId: studentUsers[0]._id, requestType: 'GENERATE_INTERVIEW_QUESTIONS', provider: 'gemini', responseTime: 1100, success: true },
    { userId: studentUsers[0]._id, requestType: 'EVALUATE_ANSWER', provider: 'gemini', responseTime: 1250, success: true }
  ]);

  return { usersCount: 1 + recruiters.length + studentUsers.length, demoSessionsCount: demoSessions.length };
}

module.exports = { runSeed };
