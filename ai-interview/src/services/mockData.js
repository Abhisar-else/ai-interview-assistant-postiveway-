/* Mock Data Service
   Realistic mock data for all screens until the FastAPI backend is ready.
   Toggle via VITE_USE_MOCK=true in .env */

const MOCK_USER = {
  id: 1,
  name: 'Vinod Sharma',
  email: 'vinod@example.com',
  phone: '+91 98765 43210',
  created_at: '2026-07-15T10:30:00Z',
};

const MOCK_ADMIN = {
  id: 1,
  name: 'Admin',
  email: 'admin@interviewsim.ai',
  created_at: '2026-07-01T00:00:00Z',
};

const MOCK_RESUME = {
  id: 1,
  user_id: 1,
  file_path: 'uploads/resumes/vinod_resume.pdf',
  uploaded_at: '2026-07-16T14:20:00Z',
  parsed_json: {
    name: 'Vinod Sharma',
    skills: ['React', 'JavaScript', 'TypeScript', 'Node.js', 'Python', 'FastAPI', 'PostgreSQL', 'MongoDB', 'Docker', 'Git'],
    projects: [
      {
        title: 'AI Interview Simulator',
        description: 'Full-stack web app for mock interviews with AI-driven adaptive questioning and scoring.',
        tech: ['React', 'FastAPI', 'PostgreSQL', 'Gemini API'],
      },
      {
        title: 'E-Commerce Platform',
        description: 'Scalable marketplace with real-time inventory, payment integration, and admin analytics.',
        tech: ['Next.js', 'Node.js', 'MongoDB', 'Stripe'],
      },
    ],
    experience: [
      {
        role: 'Full Stack Developer Intern',
        company: 'TechStartup Inc.',
        duration: '3 months',
        highlights: ['Built REST APIs serving 10k+ requests/day', 'Reduced page load time by 40%'],
      },
    ],
    education: [
      {
        degree: 'B.Tech Computer Science',
        institution: 'Delhi Technological University',
        year: '2027 (Expected)',
      },
    ],
  },
};

const MOCK_SESSIONS = [
  {
    id: 1,
    user_id: 1,
    resume_id: 1,
    job_role: 'Software Engineer',
    interview_type: 'Technical',
    difficulty: 'Medium',
    status: 'completed',
    started_at: '2026-07-20T09:00:00Z',
    completed_at: '2026-07-20T09:35:00Z',
    transcript: [
      { role: 'ai', content: 'Can you explain the difference between REST and GraphQL APIs, and when you would choose one over the other?' },
      { role: 'user', content: 'REST uses fixed endpoints with HTTP methods, while GraphQL has a single endpoint with a query language. I\'d choose REST for simple CRUD apps and GraphQL when clients need flexible data fetching to avoid over-fetching.' },
      { role: 'ai', content: 'You mentioned over-fetching. Can you describe a specific scenario from your projects where this was a problem and how you solved it?' },
      { role: 'user', content: 'In my e-commerce project, the product listing page only needed name, price, and thumbnail, but the REST endpoint returned full descriptions, reviews, and related products. I created a separate lightweight endpoint, but with GraphQL this would have been a simple query change.' },
      { role: 'ai', content: 'How would you handle authentication and authorization in a GraphQL API compared to REST?' },
      { role: 'user', content: 'In REST, I use middleware for auth on route groups. In GraphQL, I\'d use context to inject the user and add authorization checks in resolvers or use directives like @auth on schema fields.' },
      { role: 'ai', content: 'Let\'s switch to system design. How would you design a real-time notification system for a social media platform?' },
      { role: 'user', content: 'I\'d use WebSockets for real-time delivery, with a message queue like Redis Pub/Sub for fan-out. Notifications get stored in a database for persistence, and unread counts are cached. For scale, I\'d partition by user ID and use a load balancer with sticky sessions.' },
      { role: 'ai', content: 'What database would you choose for storing notifications, and how would you handle the read/unread status efficiently at scale?' },
      { role: 'user', content: 'I\'d use PostgreSQL with a notifications table partitioned by user_id and created_at. Read status would be a boolean column with a composite index. For the unread count, I\'d maintain a counter in Redis that decrements on read, avoiding COUNT queries on every page load.' },
    ],
  },
  {
    id: 2,
    user_id: 1,
    resume_id: 1,
    job_role: 'Frontend Developer',
    interview_type: 'Technical',
    difficulty: 'Easy',
    status: 'completed',
    started_at: '2026-07-18T14:00:00Z',
    completed_at: '2026-07-18T14:25:00Z',
    transcript: [
      { role: 'ai', content: 'What is the virtual DOM in React, and why is it useful?' },
      { role: 'user', content: 'The virtual DOM is a lightweight JavaScript representation of the actual DOM. React uses it to batch updates and compute the minimal set of changes needed, which is faster than directly manipulating the real DOM for every state change.' },
      { role: 'ai', content: 'Can you explain the difference between useState and useReducer, and when you\'d pick one over the other?' },
      { role: 'user', content: 'useState is for simple state — a toggle, a counter, a form field. useReducer is better when state logic is complex, involves multiple sub-values, or when the next state depends on the previous one. I used useReducer in my e-commerce cart because add/remove/update-quantity actions all modified the same items array.' },
    ],
  },
  {
    id: 3,
    user_id: 1,
    resume_id: 1,
    job_role: 'Data Scientist',
    interview_type: 'Mixed',
    difficulty: 'Hard',
    status: 'completed',
    started_at: '2026-07-22T11:00:00Z',
    completed_at: '2026-07-22T11:45:00Z',
    transcript: [],
  },
  {
    id: 4,
    user_id: 1,
    resume_id: 1,
    job_role: 'Backend Developer',
    interview_type: 'Technical',
    difficulty: 'Medium',
    status: 'in_progress',
    started_at: '2026-07-23T10:00:00Z',
    completed_at: null,
    transcript: [],
  },
];

const MOCK_REPORTS = [
  {
    id: 1,
    session_id: 1,
    overall_score: 78,
    technical_score: 82,
    communication_score: 75,
    problem_solving_score: 80,
    confidence_score: 71,
    strengths: [
      'Strong understanding of REST vs GraphQL trade-offs with practical examples',
      'Clear and structured communication when explaining system design decisions',
      'Good instinct for caching strategies and database optimization',
    ],
    improvements: [
      'Could explore edge cases more — e.g., WebSocket reconnection, message ordering guarantees',
      'Need more depth on authorization patterns beyond basic middleware',
      'Practice articulating scalability numbers (QPS, latency targets) in system design answers',
    ],
    recommended_topics: ['WebSocket Architecture', 'OAuth 2.0 & JWT Deep Dive', 'System Design Estimation'],
    generated_at: '2026-07-20T09:36:00Z',
  },
  {
    id: 2,
    session_id: 2,
    overall_score: 85,
    technical_score: 88,
    communication_score: 82,
    problem_solving_score: 84,
    confidence_score: 86,
    strengths: [
      'Excellent grasp of React core concepts with real project examples',
      'Clear distinction between useState and useReducer with practical criteria',
      'Confident delivery with well-structured answers',
    ],
    improvements: [
      'Could discuss performance optimization techniques (React.memo, useMemo)',
      'Mention testing strategies for React components',
      'Explore server-side rendering concepts',
    ],
    recommended_topics: ['React Performance', 'Testing with RTL', 'Next.js SSR/SSG'],
    generated_at: '2026-07-18T14:26:00Z',
  },
  {
    id: 3,
    session_id: 3,
    overall_score: 62,
    technical_score: 55,
    communication_score: 70,
    problem_solving_score: 58,
    confidence_score: 64,
    strengths: [
      'Good communication skills when explaining data science concepts',
      'Showed awareness of model evaluation metrics',
      'Honest about knowledge gaps rather than bluffing',
    ],
    improvements: [
      'Strengthen statistical foundations — hypothesis testing, p-values, confidence intervals',
      'Practice explaining ML model selection criteria more precisely',
      'Need deeper understanding of feature engineering for tabular data',
    ],
    recommended_topics: ['Statistical Inference', 'Feature Engineering', 'Model Selection Frameworks'],
    generated_at: '2026-07-22T11:46:00Z',
  },
];

const MOCK_CATEGORIES = [
  { id: 1, job_role: 'Software Engineer', interview_type: 'Technical', difficulty: 'Easy', active: true },
  { id: 2, job_role: 'Software Engineer', interview_type: 'Technical', difficulty: 'Medium', active: true },
  { id: 3, job_role: 'Software Engineer', interview_type: 'Technical', difficulty: 'Hard', active: true },
  { id: 4, job_role: 'Data Scientist', interview_type: 'Technical', difficulty: 'Medium', active: true },
  { id: 5, job_role: 'AI/ML Engineer', interview_type: 'Technical', difficulty: 'Medium', active: true },
  { id: 6, job_role: 'Backend Developer', interview_type: 'Technical', difficulty: 'Medium', active: true },
  { id: 7, job_role: 'Frontend Developer', interview_type: 'Technical', difficulty: 'Medium', active: true },
  { id: 8, job_role: 'Full Stack Developer', interview_type: 'Mixed', difficulty: 'Medium', active: true },
];

// Simulate network delay
const delay = (ms = 600) => new Promise(resolve => setTimeout(resolve, ms));

// --- Public API (mirrors real backend endpoints) ---

export async function loginUser(email, password) {
  await delay(800);
  if (email && password) {
    return { user: MOCK_USER, token: 'mock-jwt-token-' + Date.now() };
  }
  throw new Error('Invalid credentials');
}

export async function registerUser(data) {
  await delay(800);
  return { user: { ...MOCK_USER, ...data, id: 2 }, token: 'mock-jwt-token-' + Date.now() };
}

export async function loginAdmin(email, password) {
  await delay(800);
  if (email && password) {
    return { user: MOCK_ADMIN, token: 'mock-admin-jwt-' + Date.now() };
  }
  throw new Error('Invalid credentials');
}

export async function getUser() {
  await delay(300);
  return MOCK_USER;
}

export async function getResume() {
  await delay(400);
  return MOCK_RESUME;
}

export async function uploadResume(file) {
  await delay(1500);
  return { ...MOCK_RESUME, file_path: `uploads/resumes/${file.name}` };
}

export async function getSessions() {
  await delay(500);
  return MOCK_SESSIONS;
}

export async function getSession(id) {
  await delay(400);
  return MOCK_SESSIONS.find(s => s.id === Number(id)) || MOCK_SESSIONS[0];
}

export async function startInterview({ job_role, interview_type, difficulty }) {
  await delay(1200);
  const newSession = {
    id: Date.now(),
    user_id: 1,
    resume_id: 1,
    job_role,
    interview_type,
    difficulty,
    status: 'in_progress',
    started_at: new Date().toISOString(),
    completed_at: null,
    transcript: [
      { role: 'ai', content: getOpeningQuestion(job_role, interview_type) },
    ],
  };
  return newSession;
}

export async function submitAnswer(sessionId, answer) {
  await delay(1800);
  return {
    question: getFollowUpQuestion(),
  };
}

export async function completeInterview(sessionId) {
  await delay(2000);
  return MOCK_REPORTS[0];
}

export async function getReport(sessionId) {
  await delay(500);
  const report = MOCK_REPORTS.find(r => r.session_id === Number(sessionId));
  return report || MOCK_REPORTS[0];
}

export async function getCategories() {
  await delay(300);
  return MOCK_CATEGORIES;
}

// Admin endpoints
export async function getAdminDashboard() {
  await delay(600);
  return {
    total_users: 147,
    total_interviews: 523,
    avg_score: 72,
    most_selected_roles: [
      { role: 'Software Engineer', count: 189 },
      { role: 'Frontend Developer', count: 112 },
      { role: 'Backend Developer', count: 87 },
      { role: 'Data Scientist', count: 68 },
      { role: 'AI/ML Engineer', count: 42 },
      { role: 'Full Stack Developer', count: 25 },
    ],
    recent_activity: [
      { user: 'Priya Mehta', role: 'Software Engineer', score: 84, date: '2026-07-23' },
      { user: 'Rahul Gupta', role: 'Backend Developer', score: 71, date: '2026-07-23' },
      { user: 'Ananya Singh', role: 'Data Scientist', score: 66, date: '2026-07-22' },
      { user: 'Arjun Patel', role: 'Frontend Developer', score: 89, date: '2026-07-22' },
      { user: 'Sneha Reddy', role: 'AI/ML Engineer', score: 73, date: '2026-07-21' },
    ],
  };
}

export async function getAdminUsers() {
  await delay(500);
  return [
    { id: 1, name: 'Vinod Sharma', email: 'vinod@example.com', interviews: 3, avg_score: 75, joined: '2026-07-15' },
    { id: 2, name: 'Priya Mehta', email: 'priya@example.com', interviews: 5, avg_score: 82, joined: '2026-07-10' },
    { id: 3, name: 'Rahul Gupta', email: 'rahul@example.com', interviews: 2, avg_score: 68, joined: '2026-07-12' },
    { id: 4, name: 'Ananya Singh', email: 'ananya@example.com', interviews: 4, avg_score: 71, joined: '2026-07-08' },
    { id: 5, name: 'Arjun Patel', email: 'arjun@example.com', interviews: 7, avg_score: 86, joined: '2026-07-05' },
  ];
}

// --- Helper functions ---

function getOpeningQuestion(role, type) {
  const questions = {
    'Software Engineer_Technical': 'Tell me about a complex technical challenge you faced in one of your projects. Walk me through your approach to solving it.',
    'Frontend Developer_Technical': 'Can you explain how React\'s reconciliation algorithm works and why it matters for application performance?',
    'Backend Developer_Technical': 'How would you design a rate-limiting system for a REST API that handles 10,000 requests per second?',
    'Data Scientist_Technical': 'Walk me through your process for selecting the right machine learning model for a new prediction task.',
    'AI/ML Engineer_Technical': 'What are the key differences between batch and online learning, and when would you use each approach?',
    'Full Stack Developer_Mixed': 'Describe a project where you owned both the frontend and backend. What were the biggest coordination challenges?',
  };
  return questions[`${role}_${type}`] || 'Tell me about yourself and what draws you to this role.';
}

const followUpQuestions = [
  'That\'s interesting. Can you elaborate on the trade-offs you considered in that decision?',
  'How would you handle this differently if the system needed to scale to 100x the current load?',
  'Can you walk me through the error handling strategy you\'d implement for this scenario?',
  'What testing approach would you take to ensure reliability in this system?',
  'How would you communicate this technical decision to a non-technical stakeholder?',
  'Let\'s explore a different area. How do you approach debugging a production issue you haven\'t seen before?',
  'What\'s your experience with CI/CD pipelines, and how have you used them to improve deployment reliability?',
];

let questionIndex = 0;
function getFollowUpQuestion() {
  const q = followUpQuestions[questionIndex % followUpQuestions.length];
  questionIndex++;
  return q;
}
