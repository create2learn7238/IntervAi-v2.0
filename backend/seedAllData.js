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

async function seedData() {
  const connectionUris = [
    process.env.MONGODB_URI,
    process.env.MONGO_URI,
    'mongodb://127.0.0.1:27017/intervai'
  ].filter(Boolean);

  let connected = false;
  for (const uri of connectionUris) {
    try {
      console.log(`🔌 Attempting connection to: ${uri.includes('127.0.0.1') ? 'Local MongoDB' : 'Atlas Cluster'}`);
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
      console.log(`✅ Connected successfully to: ${uri.includes('127.0.0.1') ? 'Local MongoDB' : 'Atlas Cluster'}`);
      connected = true;
      break;
    } catch (err) {
      console.warn(`⚠️ Connection attempt failed: ${err.message}`);
    }
  }

  if (!connected) {
    console.error('❌ Could not connect to MongoDB Atlas. Please check network connection or MongoDB Atlas access IP settings.');
    process.exit(1);
  }

  try {
    // 1. Clear existing collections
    console.log('🧹 Cleaning up database collections...');
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

    // 2. Seed Admin & Recruiters
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

    // 3. Seed Exactly 25 Diverse Student Candidates
    console.log('🎓 Seeding 25 Full Student Profiles...');

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
      const user = await User.create({
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
        bio: `Enthusiastic ${c.role} candidate with hands-on experience in ${c.skills.slice(0, 3).join(', ')}. Looking to contribute to high-impact technical teams.`,
        phone: `+1 ${Math.floor(100 + Math.random() * 900)}-${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`,
        linkedIn: `https://linkedin.com/in/${c.name.toLowerCase().replace(/[^a-z]/g, '-')}`,
        github: `https://github.com/${c.name.toLowerCase().replace(/[^a-z]/g, '-')}`,
        placementStatus: c.status
      });
      studentUsers.push(user);
    }

    console.log(`✅ Created 25 Student Candidates successfully!`);

    // 4. Seed Rich Mock Interviews for Selected Candidates
    console.log('🎙️ Seeding Mock Interviews & AI Evaluations...');

    const sampleInterviewsData = [
      {
        candidate: studentUsers[0], // Demo Candidate
        role: 'Full Stack MERN Developer',
        desc: 'Comprehensive MERN technical evaluation covering event loops, server components, and NoSQL query injection security.',
        difficulty: 'Expert',
        persona: 'Strict Recruiter',
        score: 88,
        trust: 95,
        statusLevel: 'Excellent',
        questions: [
          { q: "Explain event loop architecture in Node.js and non-blocking I/O operations.", a: "Node.js uses a single-threaded event loop via libuv. Async operations like network and file system I/O are offloaded to worker threads.", rating: "9", just: "Accurate explanation of libuv threadpool and non-blocking I/O mechanics." },
          { q: "How do React 19 Server Components differ from standard Client Components?", a: "Server Components execute exclusively on the server, sending zero JavaScript bundle overhead to the browser client.", rating: "8", just: "Correctly identified zero-bundle-size benefit of Server Components." },
          { q: "What strategies prevent NoSQL query injection in MongoDB Mongoose queries?", a: "Using express-mongo-sanitize middleware, avoiding raw $where strings, and enforcing strict Zod input validation.", rating: "9", just: "Excellent production security awareness." }
        ]
      },
      {
        candidate: studentUsers[1], // Priya Sharma
        role: 'Frontend React Engineer',
        desc: 'Evaluation on React 19 Fiber reconciliation, hooks, custom state management, and CSS performance.',
        difficulty: 'Intermediate',
        persona: 'Strict Recruiter',
        score: 82,
        trust: 85,
        statusLevel: 'Good',
        questions: [
          { q: "Explain React hook rules and why hooks cannot be called conditionally.", a: "Hooks rely on call order array indices inside Fiber nodes; dynamic conditions disrupt internal index mapping.", rating: "8", just: "Solid understanding of internal Fiber node call ordering." },
          { q: "How do you optimize render performance in large React component trees?", a: "Utilizing React.memo, useCallback to memoize event handlers, useMemo for expensive math, and code-splitting with React.lazy.", rating: "8", just: "Proper identification of memoization techniques and dynamic imports." }
        ]
      },
      {
        candidate: studentUsers[2], // Alex Chen
        role: 'Backend Systems Architect',
        desc: 'Advanced system architecture interview covering Saga patterns, distributed consistency, and Redis caching.',
        difficulty: 'Expert',
        persona: 'Strict Recruiter',
        score: 98,
        trust: 100,
        statusLevel: 'Excellent',
        questions: [
          { q: "How do you maintain data consistency across distributed microservices?", a: "We use the Saga pattern with event-driven architecture and Kafka to manage eventual consistency across microservices.", rating: "10", just: "Flawless distributed transaction system design explanation." },
          { q: "Explain cache stampede prevention strategies in high-traffic Redis deployments.", a: "Using distributed locks (Redlock algorithm), probabilistic early expiration (XFetch), or background cache warmers.", rating: "9", just: "Demonstrated senior-level distributed caching expertise." }
        ]
      },
      {
        candidate: studentUsers[3], // Sarah Jenkins
        role: 'Data Scientist & ML Specialist',
        desc: 'Deep learning model optimization, PyTorch execution graphs, and feature engineering pipelines.',
        difficulty: 'Expert',
        persona: 'Strict Recruiter',
        score: 75,
        trust: 65,
        statusLevel: 'Warning',
        questions: [
          { q: "How do you address overfitting in deep neural networks?", a: "Applying L1/L2 weight regularization, Dropout layers, Early Stopping, Data Augmentation, and Batch Normalization.", rating: "8", just: "Good coverage of neural network regularization techniques." }
        ]
      },
      {
        candidate: studentUsers[4], // Vikram Patel
        role: 'DevOps & Cloud Engineer',
        desc: 'Terraform IaC, Kubernetes ingress controllers, AWS IAM roles, and CI/CD pipelines.',
        difficulty: 'Expert',
        persona: 'Strict Recruiter',
        score: 92,
        trust: 90,
        statusLevel: 'Excellent',
        questions: [
          { q: "Explain Kubernetes Pod lifecycle and Blue/Green deployment strategies.", a: "Pods transition through Pending, Running, Succeeded/Failed. Blue/Green deploys traffic via service selector switches.", rating: "9", just: "Clear zero-downtime deployment strategy." }
        ]
      },
      {
        candidate: studentUsers[6], // Rohan Mehta
        role: 'Full Stack MERN Developer',
        desc: 'MERN stack fundamental assessment covering Express middleware, JWT auth, and React state hooks.',
        difficulty: 'Intermediate',
        persona: 'Encouraging Coach',
        score: 80,
        trust: 95,
        statusLevel: 'Excellent',
        questions: [
          { q: "What is the role of middleware in Express.js application pipelines?", a: "Middleware functions execute sequentially during the request-response cycle, allowing auth checks, logging, and body parsing.", rating: "8", just: "Accurate middleware description." }
        ]
      },
      {
        candidate: studentUsers[7], // Aarav Gupta
        role: 'Backend Node.js Engineer',
        desc: 'TypeScript integration with Node.js, Mongoose schemas, and Jest unit test suites.',
        difficulty: 'Expert',
        persona: 'Strict Recruiter',
        score: 90,
        trust: 95,
        statusLevel: 'Excellent',
        questions: [
          { q: "How does TypeScript improve Node.js enterprise backend reliability?", a: "Static type checking catches null dereferences and signature mismatches during compile time before deployment.", rating: "9", just: "Clear type safety benefits outlined." }
        ]
      },
      {
        candidate: studentUsers[8], // Ananya Verma
        role: 'UI/UX Frontend Developer',
        desc: 'TailwindCSS design tokens, Framer Motion transitions, and accessible HTML semantics.',
        difficulty: 'Intermediate',
        persona: 'Encouraging Coach',
        score: 85,
        trust: 90,
        statusLevel: 'Excellent',
        questions: [
          { q: "How do ARIA attributes improve web accessibility for screen readers?", a: "ARIA roles and states provide semantic metadata to assistive technologies when native HTML tags are insufficient.", rating: "9", just: "Strong web accessibility knowledge." }
        ]
      }
    ];

    for (const item of sampleInterviewsData) {
      const mockId = uuidv4();
      
      // Create Interview
      const interview = await Interview.create({
        mockid: mockId,
        createdby: item.candidate.email,
        jobposition: item.role,
        jobdescription: item.desc,
        jobexp: '2',
        difficulty: item.difficulty,
        aiPersona: item.persona,
        status: 'Completed',
        sessionVideoUrl: `/api/v1/media/session-${mockId.substring(0, 6)}.webm`,
        jsonmockresp: JSON.stringify(item.questions.map(q => ({ question: q.q, answer: q.a })))
      });

      // Create Answers
      for (const q of item.questions) {
        await UserAnswer.create({
          mockidRef: mockId,
          question: q.q,
          correctanswer: q.a,
          useranswer: q.a,
          rating: q.rating,
          justification: q.just,
          feedback: `Solid response! Evaluation score: ${q.rating}/10.`,
          detailedFeedback: `Candidate demonstrated relevant domain terminology. Score: ${q.rating}/10.`,
          confidenceScore: Number(q.rating) * 10,
          eyeContactScore: item.trust,
          clarityScore: Number(q.rating) * 10,
          paceScore: 85,
          depthScore: Number(q.rating) * 10,
          vocabularyScore: Number(q.rating) * 10,
          fillerWordsCount: Math.floor(Math.random() * 3),
          userEmail: item.candidate.email,
          cheatEvents: { copyPasteCount: 0, tabSwitchCount: 0, multipleFacesDetected: false, lookingAwayCount: 0, noFaceCount: 0 }
        });
      }

      // Create Trust Score
      await TrustScore.create({
        interviewId: mockId,
        userEmail: item.candidate.email,
        score: item.trust,
        status: item.statusLevel
      });

      // Create Certificate if score > 80
      if (item.score >= 80 && item.trust >= 80) {
        await Certificate.create({
          userId: item.candidate._id,
          interviewId: mockId,
          candidateName: item.candidate.name,
          interviewTitle: item.role,
          score: item.score,
          status: 'Passed',
          certificateId: `CERT-${uuidv4().substring(0, 8).toUpperCase()}`
        });
      }

      // Create AI Candidate Profile
      await CandidateAiProfile.create({
        userId: item.candidate._id,
        summary: `${item.candidate.name} is a high-performing candidate for ${item.role} positions. Demonstrated technical depth with an overall score of ${item.score}/100 and ${item.trust}% proctoring integrity.`,
        strengths: item.questions.map(q => q.q.substring(0, 35) + '...'),
        weaknesses: ['Elaborate on production logging & monitoring'],
        recommendedRoles: [item.role, 'Senior Software Engineer'],
        matchScore: item.score,
        lastUpdated: new Date()
      });
    }

    // 5. Seed Proctoring Violations
    console.log('🛡️ Seeding Proctoring Violations...');
    await Violation.create([
      {
        interviewId: sampleInterviewsData[1].candidate.email,
        userEmail: 'priya.sharma@iet.edu',
        violationType: 'FULLSCREEN_EXIT',
        description: 'Candidate exited full-screen mode during response',
        duration: 4,
        severity: 'Medium',
        trustScoreBefore: 100,
        trustScoreAfter: 95
      },
      {
        interviewId: sampleInterviewsData[3].candidate.email,
        userEmail: 'sarah.j@stanford.edu',
        violationType: 'TAB_SWITCH',
        description: 'Switched active browser tab during session',
        duration: 9,
        severity: 'Medium',
        trustScoreBefore: 80,
        trustScoreAfter: 75
      },
      {
        interviewId: sampleInterviewsData[3].candidate.email,
        userEmail: 'sarah.j@stanford.edu',
        violationType: 'LOOKING_AWAY',
        description: 'Head pose turned away from primary webcam angle',
        duration: 15,
        severity: 'High',
        trustScoreBefore: 75,
        trustScoreAfter: 65
      }
    ]);

    // 6. Seed Site Feedback Reviews
    console.log('⭐ Seeding Site Feedback Reviews...');
    await SiteFeedback.create([
      {
        user: studentUsers[1]._id,
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
        user: studentUsers[2]._id,
        name: 'Alex Chen',
        email: 'alex.chen@berkeley.edu',
        feedback: 'The scenario questions were unpredictable and challenged my architectural depth. Highly recommend to engineering students!',
        rating: 5,
        needsUpgradation: false
      }
    ]);

    // 7. Seed AI Request Logs
    console.log('📊 Seeding AI Request Logs...');
    await AIRequestLog.create([
      { userId: studentUsers[0]._id, requestType: 'GENERATE_INTERVIEW_QUESTIONS', provider: 'gemini', responseTime: 1150, success: true },
      { userId: studentUsers[0]._id, requestType: 'EVALUATE_ANSWER', provider: 'gemini', responseTime: 1320, success: true },
      { userId: studentUsers[1]._id, requestType: 'GENERATE_CANDIDATE_INSIGHTS', provider: 'gemini', responseTime: 920, success: true },
      { userId: studentUsers[2]._id, requestType: 'EVALUATE_ANSWER', provider: 'gemini', responseTime: 1050, success: true }
    ]);

    console.log('\n🎉 ALL COLLECTIONS SUCCESSFULLY SEEDED ON ATLAS CLUSTER! 🎉');
    console.log('====================================================');
    console.log('📊 DATABASE SUMMARY:');
    console.log(`- 👥 Total Users Created: ${1 + recruiters.length + studentUsers.length} (1 Admin, 2 Recruiters, 25 Students)`);
    console.log(`- 🎙️ Mock Interviews & Evaluations: ${sampleInterviewsData.length}`);
    console.log(`- 📜 Verified Certificates & AI Profiles: Populated`);
    console.log('====================================================');
    process.exit(0);

  } catch (err) {
    console.error('❌ Error during seeding:', err);
    process.exit(1);
  }
}

seedData();
