const { v4: uuidv4 } = require('uuid');
const Interview = require('../models/Interview');
const aiService = require('../services/aiService');
const emailService = require('../services/emailService');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

// GET /api/interviews/practice — generate dynamic behavioral questions with Gemini
const generatePracticeQuestions = catchAsync(async (req, res, next) => {
    const prompt = `Act as a senior HR recruiter. Generate 5 UNIQUE, RANDOMIZED behavioral and situational interview questions with structured STAR method advice in JSON format.
Vary the questions across leadership, conflict resolution, time management, failure, and adaptability.

Return ONLY a valid JSON array exactly matching this structure:
[
  {"q": "The behavioral question here", "a": "Specific advice on how to structure the answer using the STAR method", "category": "Short Category Name"}
]
Do not include any explanation or markdown wrapping, only the raw JSON array.`;

    const result = await aiService.generatePracticeQuestions();
    res.json(result);
});

// GET /api/interviews
const getInterviews = catchAsync(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    const interviews = await Interview.find({ createdby: req.user.email })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
      
    const totalCount = await Interview.countDocuments({ createdby: req.user.email });

    res.json({
      data: interviews,
      page,
      totalPages: Math.ceil(totalCount / limit),
      totalCount
    });
});

// GET /api/interviews/:mockid
const getInterview = catchAsync(async (req, res, next) => {
    const interview = await Interview.findOne({ mockid: req.params.mockid });
    if (!interview) return next(new AppError('Interview not found', 404));
    if (interview.createdby !== req.user.email) return next(new AppError('Unauthorized access', 403));
    res.json(interview);
});

// Helper removed as we strictly use the bot to avoid predefined questions

// POST /api/interviews — generate questions with Gemini and save
const createInterview = catchAsync(async (req, res, next) => {
    const { jobposition, jobdescription, jobdesc, jobexp, difficulty } = req.body;
    const authorEmail = req.user.email;
    const effectiveJobDesc = jobdescription || jobdesc || 'Technical & Behavioral Mock Interview';

    if (!jobposition || !jobposition.trim()) {
      return next(new AppError('Job position is required', 400));
    }

    let jsonmockresp = null;

    // Attempt Gemini AI generation with randomized seed prompt
    try {
      jsonmockresp = await aiService.generateInterviewQuestions(jobposition, effectiveJobDesc, jobexp, difficulty);
    } catch (aiErr) {
      console.warn('Gemini AI error during question generation:', aiErr.message);
    }

    // Fallback to randomized predefined questions if AI generation fails
    if (!jsonmockresp) {
      console.warn('Using predefined randomized fallback questions due to AI failure.');
      const predefinedQuestions = [
        // Behavioral & Leadership
        { question: "Tell me about a time you had to lead a project without formal authority. How did you align the team?", answer: "Ideal: Mentions building trust, actively listening to concerns, finding common ground, and leading by example rather than rank." },
        { question: "Describe a situation where you strongly disagreed with a manager's decision. How did you handle it?", answer: "Ideal: Discusses presenting data/evidence, remaining professional, seeking compromise, and ultimately committing to the team's final decision." },
        { question: "Can you give an example of a project that completely failed? What went wrong and what did you learn?", answer: "Ideal: Takes accountability without blaming others. Focuses on the post-mortem analysis and the structural changes made to prevent future failures." },
        { question: "How do you handle scope creep when a client or product manager keeps adding features mid-sprint?", answer: "Ideal: Mentions negotiating trade-offs (time vs features), referencing the original requirements document, and communicating impact clearly." },
        { question: "Tell me about a time you had to mentor a junior team member who was struggling. What was your approach?", answer: "Ideal: Highlights patience, paired programming, breaking down complex tasks, and providing constructive, actionable feedback." },
        
        // System Design & Architecture
        { question: "How would you design a highly available, globally distributed load balancer for a video streaming service?", answer: "Ideal: Mentions Anycast, DNS round-robin, consistent hashing, caching at the edge (CDN), and health checks." },
        { question: "Explain the key differences between a microservices architecture and a monolithic architecture. When would you choose which?", answer: "Ideal: Microservices offer independent scaling and deployments but add network overhead. Monoliths are simpler to develop initially but harder to scale." },
        { question: "Describe how you would design a rate limiter for a public API.", answer: "Ideal: Mentions algorithms like Token Bucket or Leaky Bucket, and utilizing in-memory datastores like Redis for distributed state." },
        { question: "What are the trade-offs between SQL (Relational) and NoSQL (Document/Key-Value) databases?", answer: "Ideal: SQL provides ACID compliance and structured schemas. NoSQL provides flexible schemas, horizontal scalability, and eventual consistency." },
        { question: "Explain how Event Sourcing and CQRS work together in a distributed system.", answer: "Ideal: Mentions separating read and write models, storing state as a sequence of events, and allowing replayability of state." },
        
        // Web Technologies & Frontend
        { question: "How does the browser's rendering engine work from receiving HTML to painting pixels on the screen?", answer: "Ideal: Describes parsing HTML to DOM, CSS to CSSOM, building the render tree, layout (reflow), and painting." },
        { question: "What are the security implications of storing JWTs in localStorage versus HTTP-only cookies?", answer: "Ideal: localStorage is vulnerable to XSS attacks. HTTP-only cookies are immune to XSS but require CSRF protection." },
        { question: "Explain the virtual DOM and why modern frameworks like React use it for performance optimization.", answer: "Ideal: The virtual DOM is an in-memory representation. React diffs it with the previous version (reconciliation) to minimize expensive actual DOM updates." },
        { question: "What is a Service Worker and how does it enable offline web applications (PWAs)?", answer: "Ideal: A background script that acts as a network proxy, intercepting requests and serving cached responses via the Cache API." },
        { question: "How do you optimize the Critical Rendering Path to improve First Contentful Paint (FCP)?", answer: "Ideal: Minifying assets, deferring non-critical JS/CSS, inlining critical CSS, and utilizing CDNs." },
        
        // Backend & API Design
        { question: "What is the difference between REST and GraphQL? What are the pros and cons of each?", answer: "Ideal: REST uses multiple endpoints and standard HTTP verbs. GraphQL uses a single endpoint and allows clients to request exactly the data they need, preventing over-fetching." },
        { question: "Explain how Node.js handles asynchronous operations despite being single-threaded.", answer: "Ideal: Mentions the V8 engine, the Event Loop (timers, poll, check phases), the Call Stack, and the worker pool (libuv) for blocking I/O." },
        { question: "How would you prevent a race condition in a database where two users try to purchase the last remaining item simultaneously?", answer: "Ideal: Mentions using pessimistic locking (SELECT FOR UPDATE) or optimistic locking (version numbers) and database transactions." },
        { question: "What is OAuth 2.0 and how does the authorization code flow work?", answer: "Ideal: An authorization framework. Describes the client requesting authorization, receiving a code, and exchanging it for an access token via a secure backchannel." },
        { question: "How do you handle database migrations in a production environment with zero downtime?", answer: "Ideal: Mentions the expand-and-contract pattern: adding new columns/tables first, writing to both, migrating old data, reading from new, and then dropping the old." },
        
        // General Programming & Debugging
        { question: "Can you describe a time when you had to debug a deeply nested or complex issue? How did you isolate the problem?", answer: "Ideal: Explains a systematic debugging approach, isolating variables, reading logs/stack traces, and applying hypothesis-driven problem solving." },
        { question: "What is dependency injection and how does it improve code testability?", answer: "Ideal: Supplying external dependencies to a class/function rather than hardcoding them, allowing for easy mocking during unit tests." },
        { question: "Explain the difference between Pass-by-Value and Pass-by-Reference.", answer: "Ideal: Pass-by-value copies the actual value. Pass-by-reference copies the memory address, meaning modifications affect the original variable." },
        { question: "What are SOLID principles? Can you explain the Single Responsibility Principle?", answer: "Ideal: SOLID is a set of object-oriented design principles. Single Responsibility means a class should have one, and only one, reason to change." },
        { question: "Describe your process for reviewing someone else's code. What key things do you look for?", answer: "Ideal: Focuses on readability, maintainability, test coverage, potential edge cases, security flaws, and providing constructive, empathetic feedback." },
        
        // DevOps & Infrastructure
        { question: "Explain what Docker is and the difference between an image and a container.", answer: "Ideal: Docker is a containerization platform. An image is a read-only template, while a container is a running, stateful instance of that image." },
        { question: "What is a CI/CD pipeline and what are the key stages you would include in one?", answer: "Ideal: Continuous Integration/Deployment. Stages include linting, building, unit testing, integration testing, and automated deployment." },
        { question: "How do you handle secrets and sensitive configuration data in a cloud environment?", answer: "Ideal: Never committing them to version control. Using secure vaults like AWS Secrets Manager, HashiCorp Vault, or environment variables injected at runtime." },
        { question: "What is Blue-Green deployment and how does it minimize risk?", answer: "Ideal: Maintaining two identical environments (blue and green). You route traffic to blue, deploy/test on green, then switch the router to green, allowing instant rollback." },
        { question: "Explain the concept of Infrastructure as Code (IaC).", answer: "Ideal: Managing and provisioning computing infrastructure through machine-readable definition files (like Terraform or CloudFormation) rather than manual interactive tools." },
        
        // Data Structures & Algorithms
        { question: "What is the time complexity of searching for an element in a Hash Map versus a Binary Search Tree?", answer: "Ideal: Hash Map is O(1) average case. Binary Search Tree is O(log n) average case." },
        { question: "Explain how a caching algorithm like LRU (Least Recently Used) is implemented under the hood.", answer: "Ideal: typically implemented using a combination of a Hash Map (for fast lookups) and a Doubly Linked List (for fast eviction/reordering)." },
        { question: "What is the difference between Depth First Search (DFS) and Breadth First Search (BFS)?", answer: "Ideal: DFS goes deep into a graph using a Stack (or recursion). BFS explores neighbors level by level using a Queue." },
        { question: "Explain Dynamic Programming and the concept of Memoization.", answer: "Ideal: Breaking a complex problem into simpler subproblems. Memoization is caching the results of expensive function calls to avoid redundant work." },
        { question: "When would you choose to use an Array versus a Linked List?", answer: "Ideal: Arrays offer fast O(1) random access but slow O(n) insertions/deletions. Linked lists offer fast O(1) insertions/deletions (if the node is known) but slow O(n) access." }
      ];
      
      // Shuffle the predefined questions to ensure variety
      for (let i = predefinedQuestions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [predefinedQuestions[i], predefinedQuestions[j]] = [predefinedQuestions[j], predefinedQuestions[i]];
      }
      
      // Pick 5 random questions
      jsonmockresp = JSON.stringify(predefinedQuestions.slice(0, 5));
    }

    const mockid = uuidv4();
    const interview = await Interview.create({
      mockid,
      jsonmockresp,
      jobposition,
      jobdescription: effectiveJobDesc,
      jobexp: String(jobexp || '1'),
      difficulty: difficulty || 'Intermediate',
      createdby: authorEmail,
    });

    res.status(201).json(interview);
});

// POST /api/interviews/send-email-report
const sendEmailReport = catchAsync(async (req, res, next) => {
    const recipient = req.user.email;
    const previewUrl = await emailService.sendInterviewReport(recipient, req.body);

    res.json({
      success: true,
      message: `Interview feedback report successfully sent to ${recipient}`,
      previewUrl: previewUrl || null,
    });
});

module.exports = { getInterviews, getInterview, createInterview, sendEmailReport, generatePracticeQuestions };
