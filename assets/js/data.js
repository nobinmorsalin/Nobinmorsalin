/* ═══════════════════════════════════════════════
   DATA STORE — Portfolio content management

   IMPORTANT:
   - Existing localStorage keys are preserved.
   - Admin changes are persisted through /api/portfolio.
   - Existing localStorage content is never silently overwritten or deleted.
   - DEFAULTS remain available as a safe fallback.
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
    bio1: "I'm a passionate web developer and digital craftsman from Bangladesh. I specialize in building complete digital solutions — from pixel-perfect UI/UX to robust backend architectures.",
    bio2: "My expertise spans the full stack: beautiful frontends, powerful APIs, webhook integrations, and server-to-server connections. I don't just build websites — I build systems that work.",
  },
  skills: [
    'HTML / CSS', 'JavaScript', 'React', 'Node.js', 'REST APIs', 'Webhooks',
    'UI/UX Design', 'Figma', 'Server Architecture', 'SMTP / Email',
    'Postback / Tracking', 'Git / GitHub'
  ],
  services: [
    { id: 's1', icon: '🎨', name: 'UI/UX Design', desc: 'Beautiful, intuitive interfaces designed in Figma — pixel-perfect and user-focused. From wireframes to final design handoff.' },
    { id: 's2', icon: '🌐', name: 'Web Development', desc: 'Fast, responsive websites and web apps built with modern technologies. Clean code and optimized performance.' },
    { id: 's3', icon: '🔗', name: 'API Integration', desc: 'Seamless integration of third-party APIs. REST, GraphQL, OAuth and custom API systems.' },
    { id: 's4', icon: '⚡', name: 'Webhook Systems', desc: 'Real-time event-driven architectures, server-to-server communication, postback URLs and tracking systems.' },
    { id: 's5', icon: '📧', name: 'Email Systems', desc: 'SMTP setup, transactional emails, email templates, delivery optimization and monitoring.' },
    { id: 's6', icon: '🛒', name: 'E-Commerce', desc: 'Online stores with payment gateways, inventory management, order tracking and complete backend systems.' },
  ],
  projects: [
    { id: 'p1', title: 'SaaS Dashboard', desc: 'A complete analytics dashboard with real-time data, charts and user management.', image: '', tags: ['React', 'Node.js', 'API'], category: 'Web App', live: '#', github: '#' },
    { id: 'p2', title: 'E-Commerce Platform', desc: 'Full-stack online store with payment integration, webhook order tracking and admin panel.', image: '', tags: ['JavaScript', 'SMTP', 'Webhooks'], category: 'E-Commerce', live: '#', github: '#' },
    { id: 'p3', title: 'API Gateway System', desc: 'Custom API gateway with rate limiting, authentication, postback logging and server-to-server routing.', image: '', tags: ['Node.js', 'REST API', 'Server'], category: 'Backend', live: '#', github: '' },
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

const PortfolioData = {
  _remote: null,
  _version: 0,
  _loaded: false,
  _conflict: false,

  async load() {
    try {
      const response = await fetch('/api/portfolio', {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        cache: 'no-store'
      });

      if (response.ok) {
        const payload = await response.json();
        this._remote = payload?.data && typeof payload.data === 'object' ? payload.data : null;
        this._version = Number.isSafeInteger(Number(payload?.version)) ? Number(payload.version) : 1;
        this._loaded = Boolean(this._remote);
        this._conflict = this.hasLocalStorageData();
        return { ok: true, data: this._remote, version: this._version, conflict: this._conflict };
      }

      if (response.status === 404) {
        this._remote = this.cloneDefaults();
        this._version = 0;
        this._loaded = false;
        this._conflict = this.hasLocalStorageData();
        return { ok: false, initialized: false, data: this._remote, version: 0, conflict: this._conflict };
      }

      throw new Error(`Portfolio API returned ${response.status}`);
    } catch (error) {
      console.warn('PortfolioData.load() failed:', error);
      this._remote = null;
      this._version = 0;
      this._loaded = false;
      this._conflict = this.hasLocalStorageData();
      return { ok: false, data: this.cloneDefaults(), version: 0, conflict: this._conflict, error };
    }
  },

  async save(key, value) {
    if (!Object.prototype.hasOwnProperty.call(DEFAULTS, key)) {
      throw new Error(`Invalid portfolio section: ${key}`);
    }

    if (!this._remote) this._remote = this.cloneDefaults();
    this._remote[key] = value;

    const payload = { section: key, data: value, version: this._version };

    if (this._version === 0) {
      payload.section = null;
      payload.data = this._remote;
    }

    const response = await fetch('/api/portfolio', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (response.status === 409) this._version = Number(result?.version || this._version);
      throw new Error(result?.error || `Portfolio save failed (${response.status})`);
    }

    this._remote = result?.data || this._remote;
    this._version = Number(result?.version || this._version + 1);
    this._loaded = true;
    this._conflict = false;

    return { ok: true, data: this._remote, version: this._version };
  },

  get(key) {
    if (this._remote && Object.prototype.hasOwnProperty.call(this._remote, key)) return this._remote[key];

    try {
      const raw = localStorage.getItem(DATA_KEYS[key]);
      if (raw !== null) {
        const parsed = JSON.parse(raw);
        if (parsed !== null && parsed !== undefined) return parsed;
      }
    } catch (error) {
      console.warn(`PortfolioData.get("${key}") legacy cache read failed:`, error);
    }

    return DEFAULTS[key];
  },

  set(key, value) {
    try {
      localStorage.setItem(DATA_KEYS[key], JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`PortfolioData.set("${key}") failed:`, error);
      return false;
    }
  },

  reset(key) {
    try {
      localStorage.removeItem(DATA_KEYS[key]);
      return true;
    } catch {
      return false;
    }
  },

  resetAll() {
    try {
      Object.values(DATA_KEYS).forEach(key => localStorage.removeItem(key));
      return true;
    } catch {
      return false;
    }
  },

  cloneDefaults() {
    return JSON.parse(JSON.stringify(DEFAULTS));
  },

  hasLocalStorageData() {
    try {
      return Object.values(DATA_KEYS).some(key => localStorage.getItem(key) !== null);
    } catch {
      return false;
    }
  }
};

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
    try { sessionStorage.removeItem(this.key); } catch { /* ignore */ }
  },
};

window.PortfolioData = PortfolioData;
window.DEFAULTS = DEFAULTS;
window.AUTH = AUTH;
window.DATA_KEYS = DATA_KEYS;
