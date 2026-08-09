/* ═══════════════════════════════════════════════
   DATA STORE — Portfolio content management
   All data is stored in localStorage so the
   admin panel can update it live.
   ═══════════════════════════════════════════════ */

const DATA_KEYS = {
  services:  'portfolio_services',
  projects:  'portfolio_projects',
  workflow:  'portfolio_workflow',
  skills:    'portfolio_skills',
  about:     'portfolio_about',
  settings:  'portfolio_settings',
};

/* ── DEFAULT DATA ── */
const DEFAULTS = {
  settings: {
    name: 'Nobin',
    tagline: 'Web Developer & Digital Craftsman',
    email: 'admin@nobin.dev',
    whatsapp: '',
    github: 'https://github.com/nobin',
    linkedin: '',
    smtpConfigured: false,
  },

  about: {
    title: "Hello, I'm Nobin",
    bio1: "I'm a passionate web developer and digital craftsman from Bangladesh. I specialize in building complete digital solutions — from pixel-perfect UI/UX to robust backend architectures.",
    bio2: "My expertise spans the full stack: beautiful frontends, powerful APIs, webhook integrations, and server-to-server connections. I don't just build websites — I build systems that work.",
  },

  skills: [
    'HTML / CSS', 'JavaScript', 'React', 'Node.js',
    'REST APIs', 'Webhooks', 'UI/UX Design',
    'Figma', 'Server Architecture', 'SMTP / Email',
    'Postback / Tracking', 'Git / GitHub'
  ],

  services: [
    {
      id: 's1',
      icon: '🎨',
      name: 'UI/UX Design',
      desc: 'Beautiful, intuitive interfaces designed in Figma — pixel-perfect and user-focused. From wireframes to final design handoff.',
    },
    {
      id: 's2',
      icon: '🌐',
      name: 'Web Development',
      desc: 'Fast, responsive websites and web apps built with modern technologies. Clean code, optimized performance.',
    },
    {
      id: 's3',
      icon: '🔗',
      name: 'API Integration',
      desc: 'Seamless integration of third-party APIs. REST, GraphQL, OAuth — I connect systems that need to talk to each other.',
    },
    {
      id: 's4',
      icon: '⚡',
      name: 'Webhook Systems',
      desc: 'Real-time event-driven architectures. Server-to-server communication, postback URLs, tracking pixels — all handled.',
    },
    {
      id: 's5',
      icon: '📧',
      name: 'Email Systems',
      desc: 'SMTP setup, transactional emails, email templates, delivery optimization and monitoring.',
    },
    {
      id: 's6',
      icon: '🛒',
      name: 'E-Commerce',
      desc: 'Online stores with payment gateways, inventory management, order tracking and complete backend systems.',
    },
  ],

  projects: [
    {
      id: 'p1',
      title: 'SaaS Dashboard',
      desc: 'A complete analytics dashboard with real-time data, charts, and user management.',
      image: '',
      tags: ['React', 'Node.js', 'API'],
      category: 'Web App',
      live: '#',
      github: '#',
    },
    {
      id: 'p2',
      title: 'E-Commerce Platform',
      desc: 'Full-stack online store with payment integration, webhook order tracking and admin panel.',
      image: '',
      tags: ['JavaScript', 'SMTP', 'Webhooks'],
      category: 'E-Commerce',
      live: '#',
      github: '#',
    },
    {
      id: 'p3',
      title: 'API Gateway System',
      desc: 'Custom API gateway with rate limiting, auth, postback logging and server-to-server routing.',
      image: '',
      tags: ['Node.js', 'REST API', 'Server'],
      category: 'Backend',
      live: '#',
      github: '',
    },
  ],

  workflow: [
    { id: 'w1', icon: '💬', title: 'Discovery', desc: 'Understanding your goals, audience, and requirements through in-depth consultation.' },
    { id: 'w2', icon: '📐', title: 'Design', desc: 'Creating wireframes and high-fidelity mockups in Figma for your approval.' },
    { id: 'w3', icon: '⚙️', title: 'Development', desc: 'Building with clean, scalable code following best practices.' },
    { id: 'w4', icon: '🔗', title: 'Integration', desc: 'Connecting APIs, webhooks, payment gateways and third-party services.' },
    { id: 'w5', icon: '🧪', title: 'Testing', desc: 'Thorough QA across devices and browsers before launch.' },
    { id: 'w6', icon: '🚀', title: 'Launch', desc: 'Deployment, domain setup, and ongoing support after go-live.' },
  ],
};

/* ── DATA ACCESS FUNCTIONS ── */
const PortfolioData = {
  get(key) {
    try {
      const raw = localStorage.getItem(DATA_KEYS[key]);
      return raw ? JSON.parse(raw) : DEFAULTS[key];
    } catch { return DEFAULTS[key]; }
  },
  set(key, value) {
    try {
      localStorage.setItem(DATA_KEYS[key], JSON.stringify(value));
      return true;
    } catch { return false; }
  },
  reset(key) {
    localStorage.removeItem(DATA_KEYS[key]);
  },
  resetAll() {
    Object.values(DATA_KEYS).forEach(k => localStorage.removeItem(k));
  }
};

/* Auth */
const AUTH = {
  username: 'admin@nobin',
  password: '77441122',
  key: 'portfolio_admin_session',
  login(u, p) {
    if (u === this.username && p === this.password) {
      sessionStorage.setItem(this.key, btoa(Date.now().toString()));
      return true;
    }
    return false;
  },
  check() {
    return !!sessionStorage.getItem(this.key);
  },
  logout() {
    sessionStorage.removeItem(this.key);
  }
};
