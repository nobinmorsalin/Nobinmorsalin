/* ═══════════════════════════════════════════════
   DATA STORE — Portfolio content management

   IMPORTANT:
   - Existing localStorage keys are preserved.
   - Admin changes remain editable.
   - New Clients data is added safely.
   - Existing data will NOT be overwritten automatically.
═══════════════════════════════════════════════ */

const DATA_KEYS = {
  services:  'portfolio_services',
  projects:  'portfolio_projects',
  workflow:  'portfolio_workflow',
  skills:    'portfolio_skills',
  about:     'portfolio_about',
  settings:  'portfolio_settings',
  clients:   'portfolio_clients',
};


/* ═══════════════════════════════════════════════
   DEFAULT DATA
═══════════════════════════════════════════════ */

const DEFAULTS = {

  settings: {
    name: 'Nobin Morsalin',
    tagline: 'Full-Stack Developer & Digital Craftsman',
    email: 'admin@nobin.dev',
    whatsapp: '',
    github: 'https://github.com/nobin',
    linkedin: '',
    smtpConfigured: false,
  },

  about: {
    title: "Hello, I'm Nobin",
    bio1:
      "I'm a passionate web developer and digital craftsman from Bangladesh. I specialize in building complete digital solutions — from pixel-perfect UI/UX to robust backend architectures.",
    bio2:
      "My expertise spans the full stack: beautiful frontends, powerful APIs, webhook integrations, and server-to-server connections. I don't just build websites — I build systems that work.",
  },

  skills: [
    'HTML / CSS',
    'JavaScript',
    'React',
    'Node.js',
    'REST APIs',
    'Webhooks',
    'UI/UX Design',
    'Figma',
    'Server Architecture',
    'SMTP / Email',
    'Postback / Tracking',
    'Git / GitHub'
  ],

  services: [
    {
      id: 's1', icon: '🎨', name: 'UI/UX Design',
      desc: 'Beautiful, intuitive interfaces designed in Figma — pixel-perfect and user-focused. From wireframes to final design handoff.',
    },
    {
      id: 's2', icon: '🌐', name: 'Web Development',
      desc: 'Fast, responsive websites and web apps built with modern technologies. Clean code and optimized performance.',
    },
    {
      id: 's3', icon: '🔗', name: 'API Integration',
      desc: 'Seamless integration of third-party APIs. REST, GraphQL, OAuth and custom API systems.',
    },
    {
      id: 's4', icon: '⚡', name: 'Webhook Systems',
      desc: 'Real-time event-driven architectures, server-to-server communication, postback URLs and tracking systems.',
    },
    {
      id: 's5', icon: '📧', name: 'Email Systems',
      desc: 'SMTP setup, transactional emails, email templates, delivery optimization and monitoring.',
    },
    {
      id: 's6', icon: '🛒', name: 'E-Commerce',
      desc: 'Online stores with payment gateways, inventory management, order tracking and complete backend systems.',
    },
  ],

  projects: [
    {
      id: 'p1', title: 'SaaS Dashboard',
      desc: 'A complete analytics dashboard with real-time data, charts and user management.',
      image: '', tags: ['React', 'Node.js', 'API'], category: 'Web App', live: '#', github: '#',
    },
    {
      id: 'p2', title: 'E-Commerce Platform',
      desc: 'Full-stack online store with payment integration, webhook order tracking and admin panel.',
      image: '', tags: ['JavaScript', 'SMTP', 'Webhooks'], category: 'E-Commerce', live: '#', github: '#',
    },
    {
      id: 'p3', title: 'API Gateway System',
      desc: 'Custom API gateway with rate limiting, authentication, postback logging and server-to-server routing.',
      image: '', tags: ['Node.js', 'REST API', 'Server'], category: 'Backend', live: '#', github: '',
    },
  ],

  clients: [
    { id: 'c1', name: 'CodeBuzz', service: 'Web Development & Digital Solutions', logo: '', website: '', visible: true },
    { id: 'c2', name: 'OfferLutBox', service: 'Offerwall & Affiliate System', logo: '', website: '', visible: true },
    { id: 'c3', name: 'Quick Kart', service: 'E-Commerce Platform Development', logo: '', website: '', visible: true },
    { id: 'c4', name: 'SubscribeMoney', service: 'GPT Reward Platform Development', logo: '', website: '', visible: true },
  ],

  workflow: [
    { id: 'w1', icon: '💬', title: 'Discovery', desc: 'Understanding your goals, audience and requirements through in-depth consultation.' },
    { id: 'w2', icon: '📐', title: 'Design', desc: 'Creating wireframes and high-fidelity mockups in Figma for your approval.' },
    { id: 'w3', icon: '⚙️', title: 'Development', desc: 'Building with clean, scalable code following best practices.' },
    { id: 'w4', icon: '🔗', title: 'Integration', desc: 'Connecting APIs, webhooks, payment gateways and third-party services.' },
    { id: 'w5', icon: '🧪', title: 'Testing', desc: 'Thorough QA across devices and browsers before launch.' },
    { id: 'w6', icon: '🚀', title: 'Launch', desc: 'Deployment, domain setup and ongoing support after go-live.' },
  ],
};


/* ═══════════════════════════════════════════════
   DATABASE-BACKED DATA ACCESS
═══════════════════════════════════════════════ */

const PortfolioData = {
  _data: null,
  _version: 0,
  _loaded: false,

  async load() {
    try {
      const response = await fetch('/api/portfolio', { cache: 'no-store' });
      if (!response.ok) throw new Error(`Portfolio API returned ${response.status}`);

      const payload = await response.json();
      const incoming = payload && payload.data ? payload.data : null;

      if (incoming && typeof incoming === 'object') {
        this._data = {
          ...DEFAULTS,
          ...incoming,
        };
        this._version = Number(payload.version) || 0;
        this._loaded = true;
        return this._data;
      }
    } catch (error) {
      console.warn('PortfolioData.load() failed:', error);
    }

    this._data = { ...DEFAULTS };
    this._version = 0;
    this._loaded = false;
    return this._data;
  },

  get(key) {
    if (this._data && Object.prototype.hasOwnProperty.call(this._data, key)) {
      return this._data[key];
    }

    return DEFAULTS[key];
  },

  async save(key, value) {
    const nextData = {
      ...(this._data || DEFAULTS),
      [key]: value,
    };

    const response = await fetch('/api/portfolio', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: nextData,
        version: this._version,
      }),
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(payload.error || `Portfolio save failed (${response.status})`);
      error.status = response.status;
      throw error;
    }

    this._data = payload.data || nextData;
    this._version = Number(payload.version) || this._version + 1;
    this._loaded = true;
    return this._data;
  },

  async saveAll(data) {
    const nextData = {
      ...(this._data || DEFAULTS),
      ...(data || {}),
    };

    const response = await fetch('/api/portfolio', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: nextData,
        version: this._version,
      }),
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(payload.error || `Portfolio save failed (${response.status})`);
      error.status = response.status;
      throw error;
    }

    this._data = payload.data || nextData;
    this._version = Number(payload.version) || this._version + 1;
    this._loaded = true;
    return this._data;
  },

  set(key, value) {
    // Legacy compatibility only. New admin persistence must use await PortfolioData.save().
    try {
      if (!this._data) this._data = { ...DEFAULTS };
      this._data[key] = value;
      return true;
    } catch (error) {
      console.warn(`PortfolioData.set("${key}") failed:`, error);
      return false;
    }
  },

  reset(key) {
    try {
      if (!this._data) this._data = { ...DEFAULTS };
      this._data[key] = DEFAULTS[key];
      return true;
    } catch {
      return false;
    }
  },

  resetAll() {
    try {
      this._data = { ...DEFAULTS };
      return true;
    } catch {
      return false;
    }
  },
};


/* ═══════════════════════════════════════════════
   ADMIN AUTH — legacy client-side gate only
   NOTE: server-side authentication hardening is a separate step.
═══════════════════════════════════════════════ */

const AUTH = {
  username: 'admin@nobin',
  password: '77441122',
  key: 'portfolio_admin_session',

  login(username, password) {
    if (username === this.username && password === this.password) {
      try {
        sessionStorage.setItem(this.key, btoa(`${Date.now()}_${Math.random()}`));
        return true;
      } catch {
        return false;
      }
    }
    return false;
  },

  check() {
    try {
      return Boolean(sessionStorage.getItem(this.key));
    } catch {
      return false;
    }
  },

  logout() {
    try {
      sessionStorage.removeItem(this.key);
    } catch {
      /* ignore */
    }
  },
};

window.PortfolioData = PortfolioData;
window.DEFAULTS = DEFAULTS;
window.AUTH = AUTH;
window.DATA_KEYS = DATA_KEYS;
