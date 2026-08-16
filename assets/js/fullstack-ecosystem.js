/* Premium full-stack capability ecosystem — additive section only. */
(() => {
  'use strict';

  const HERO_ID = 'hero';
  const SECTION_ID = 'fullstack-ecosystem';
  const ICON_BASE = 'https://cdn.jsdelivr.net/npm/simple-icons@16.27.1/icons/';

  const groups = [
    {
      key: 'frontend', label: '01 / FRONTEND', title: 'Interfaces that feel alive',
      text: 'Responsive, interactive experiences with a strong focus on clarity, motion and usability.',
      items: [
        ['HTML5','html5'], ['CSS','css'], ['JavaScript','javascript'], ['Tailwind CSS','tailwindcss'],
        ['Responsive UI',null], ['UI / UX','figma'], ['Motion','framer']
      ]
    },
    {
      key: 'backend', label: '02 / BACKEND', title: 'Systems behind the interface',
      text: 'Scalable server-side applications, authentication and backend architecture built for real use.',
      items: [['Node.js','nodejs'], ['Laravel','laravel'], ['PHP','php'], ['Authentication',null], ['Server Architecture',null]]
    },
    {
      key: 'database', label: '03 / DATABASE', title: 'Structured data, ready to scale',
      text: 'Reliable data models and storage foundations for products, dashboards and business systems.',
      items: [['MySQL','mysql'], ['Database Design',null], ['Data Management',null]]
    },
    {
      key: 'integration', label: '04 / API + INTEGRATION', title: 'Connect every moving part',
      text: 'APIs, callbacks and event-driven integrations that keep external services talking to your product.',
      items: [['REST API','swagger'], ['API Integration','postman'], ['Webhooks',null], ['S2S Callback',null], ['Postback Systems',null], ['Third-party APIs',null]]
    },
    {
      key: 'commerce', label: '05 / BUSINESS SYSTEMS', title: 'From storefront to operations',
      text: 'End-to-end commerce and admin systems designed around real workflows and customer journeys.',
      items: [['E-commerce', 'woocommerce'], ['Payment Integration', 'stripe'], ['Courier Integration',null], ['Order Systems',null], ['Admin Systems',null], ['Customer Systems',null]]
    },
    {
      key: 'automation', label: '06 / MARKETING + AUTOMATION', title: 'Measure, automate, improve',
      text: 'Tracking, conversion infrastructure and automated communication that turn traffic into action.',
      items: [['SEO', 'google'], ['Meta Pixel', 'meta'], ['Meta CAPI', 'meta'], ['SMTP / Email',null], ['Email Automation',null], ['Conversion Tracking',null], ['Workflow Automation','n8n']]
    },
    {
      key: 'advanced', label: '07 / ADVANCED SYSTEMS', title: 'Custom systems beyond the page',
      text: 'Complex web applications, real-time flows, reward platforms and automation built around the brief.',
      items: [['GPT / Reward Platforms',null], ['Real-time Systems',null], ['Custom Web Apps',null], ['Automation',null], ['Server Architecture',null]]
    }
  ];

  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;' })[c]);

  function icon(name, slug) {
    if (!slug) return '<span class="fse-chip-symbol" aria-hidden="true"></span>';
    return `<img src="${ICON_BASE}${slug}.svg" alt="" loading="lazy" decoding="async" onerror="this.closest('.fse-chip')?.classList.add('fse-no-icon')">`;
  }

  function card(group, index) {
    return `<article class="fse-card fse-reveal" data-fse-index="${index}">
      <div class="fse-card-top"><span class="fse-card-label">${esc(group.label)}</span><span class="fse-card-index">${String(index + 1).padStart(2,'0')}</span></div>
      <h3>${esc(group.title)}</h3>
      <p>${esc(group.text)}</p>
      <div class="fse-chips">${group.items.map(([name, slug]) => `<span class="fse-chip" title="${esc(name)}">${icon(name, slug)}<b>${esc(name)}</b></span>`).join('')}</div>
    </article>`;
  }

  function markup() {
    return `<section class="fse-section" id="${SECTION_ID}" aria-labelledby="fse-title">
      <div class="container fse-container">
        <div class="fse-heading fse-reveal">
          <div class="section-label">// What I work with</div>
          <div class="fse-heading-row">
            <div><h2 class="section-title" id="fse-title">A full-stack <span>capability map.</span></h2><p class="section-sub">From the first interface to the systems underneath it — I work across the stack to build digital products that connect, scale and perform.</p></div>
            <div class="fse-status"><span></span><div><b>FULL-STACK</b><small>Frontend → Backend → Systems</small></div></div>
          </div>
        </div>
        <div class="fse-core fse-reveal" aria-label="Full-stack development core">
          <div class="fse-core-glow"></div><div class="fse-core-ring fse-ring-a"></div><div class="fse-core-ring fse-ring-b"></div>
          <div class="fse-core-inner"><span class="fse-core-kicker">CAPABILITY CORE</span><strong>FULL-STACK</strong><em>DEVELOPMENT</em><span class="fse-core-line"></span><small>Build · Integrate · Automate</small></div>
        </div>
        <div class="fse-connectors" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
        <div class="fse-grid">${groups.map(card).join('')}</div>
        <div class="fse-foot fse-reveal"><span>ONE STACK · MANY LAYERS</span><b>UI → LOGIC → DATA → INTEGRATION → AUTOMATION</b></div>
      </div>
    </section>`;
  }

  function styles() {
    if (document.getElementById('fse-styles')) return;
    const style = document.createElement('style');
    style.id = 'fse-styles';
    style.textContent = `
      .fse-section{position:relative;padding:92px 0 105px;overflow:hidden;background:radial-gradient(circle at 50% 30%,rgba(0,245,160,.055),transparent 34%),linear-gradient(180deg,rgba(255,255,255,.012),transparent 26%)}
      .fse-section:before{content:"";position:absolute;inset:0;pointer-events:none;background-image:linear-gradient(rgba(0,245,160,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(0,245,160,.025) 1px,transparent 1px);background-size:72px 72px;mask-image:linear-gradient(to bottom,#000,transparent 92%)}
      .fse-container{position:relative;z-index:1}.fse-heading{margin-bottom:44px}.fse-heading-row{display:flex;justify-content:space-between;align-items:flex-end;gap:32px}.fse-heading .section-sub{margin-bottom:0;max-width:650px}.fse-heading .section-title{max-width:720px}.fse-heading .section-title span{background:linear-gradient(135deg,var(--accent),var(--accent-2));-webkit-background-clip:text;background-clip:text;color:transparent}
      .fse-status{flex:0 0 auto;display:flex;align-items:center;gap:12px;padding:10px 14px;border:1px solid rgba(0,245,160,.18);border-radius:12px;background:rgba(0,245,160,.035);box-shadow:inset 0 0 24px rgba(0,245,160,.025)}.fse-status>span{width:8px;height:8px;border-radius:50%;background:var(--accent);box-shadow:0 0 16px rgba(0,245,160,.75);animation:fsePulse 2.4s infinite}.fse-status b{display:block;font:700 .67rem var(--font-mono);letter-spacing:.12em;color:var(--accent)}.fse-status small{display:block;color:var(--text-muted);font-size:.7rem;margin-top:2px}
      .fse-core{position:relative;width:230px;height:230px;margin:0 auto 44px;display:grid;place-items:center}.fse-core-glow{position:absolute;width:150px;height:150px;border-radius:50%;background:radial-gradient(circle,rgba(0,245,160,.19),rgba(0,212,255,.06) 45%,transparent 72%);filter:blur(12px);animation:fseGlow 4s ease-in-out infinite}.fse-core-ring{position:absolute;border:1px solid rgba(0,245,160,.22);border-radius:50%}.fse-ring-a{inset:20px;animation:fseSpin 18s linear infinite}.fse-ring-b{inset:0;border-color:rgba(0,212,255,.13);border-style:dashed;animation:fseSpin 28s linear infinite reverse}.fse-core-inner{width:142px;height:142px;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;background:rgba(8,12,16,.92);border:1px solid rgba(0,245,160,.3);box-shadow:0 0 0 1px rgba(255,255,255,.02),0 0 50px rgba(0,245,160,.1),inset 0 0 34px rgba(0,245,160,.04);backdrop-filter:blur(14px)}.fse-core-kicker{font:500 .54rem var(--font-mono);color:var(--text-muted);letter-spacing:.1em}.fse-core-inner strong{font:800 1.18rem var(--font-head);letter-spacing:.03em;line-height:1.05;margin-top:5px}.fse-core-inner em{font:700 .6rem var(--font-mono);font-style:normal;color:var(--accent);letter-spacing:.16em;margin-top:4px}.fse-core-line{width:32px;height:1px;background:linear-gradient(90deg,transparent,var(--accent),transparent);margin:8px 0 6px}.fse-core-inner small{font-size:.58rem;color:var(--text-muted)}
      .fse-connectors{height:28px;position:relative;max-width:760px;margin:-44px auto 16px;display:flex;justify-content:space-around;overflow:hidden}.fse-connectors i{width:1px;height:28px;background:linear-gradient(var(--accent),transparent);opacity:.3;position:relative}.fse-connectors i:after{content:"";position:absolute;top:0;left:-2px;width:5px;height:5px;border-radius:50%;background:var(--accent);box-shadow:0 0 12px var(--accent);animation:fseNode 2.6s ease-in-out infinite}.fse-connectors i:nth-child(2):after{animation-delay:.5s}.fse-connectors i:nth-child(3):after{animation-delay:1s}.fse-connectors i:nth-child(4):after{animation-delay:1.5s}
      .fse-grid{display:grid;grid-template-columns:repeat(12,1fr);gap:14px}.fse-card{grid-column:span 4;position:relative;padding:24px;border:1px solid var(--border);border-radius:18px;background:linear-gradient(145deg,rgba(13,17,23,.94),rgba(13,17,23,.7));box-shadow:0 18px 50px rgba(0,0,0,.18);overflow:hidden;transition:transform .35s cubic-bezier(.22,1,.36,1),border-color .35s,box-shadow .35s}.fse-card:nth-child(4){grid-column:2/span 4}.fse-card:nth-child(5){grid-column:6/span 4}.fse-card:before{content:"";position:absolute;inset:-40%;background:radial-gradient(circle,rgba(0,245,160,.07),transparent 52%);opacity:0;transition:opacity .35s}.fse-card:hover{transform:translateY(-5px);border-color:rgba(0,245,160,.28);box-shadow:0 24px 60px rgba(0,0,0,.28),0 0 32px rgba(0,245,160,.05)}.fse-card:hover:before{opacity:1}.fse-card>*{position:relative;z-index:1}.fse-card-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:18px}.fse-card-label{font:600 .62rem var(--font-mono);letter-spacing:.1em;color:var(--accent)}.fse-card-index{font:500 .62rem var(--font-mono);color:var(--text-dim)}.fse-card h3{font:700 1.05rem var(--font-head);margin-bottom:8px}.fse-card p{font-size:.82rem;line-height:1.65;color:var(--text-muted);min-height:54px;margin-bottom:18px}.fse-chips{display:flex;flex-wrap:wrap;gap:7px}.fse-chip{display:inline-flex;align-items:center;gap:7px;min-height:31px;padding:6px 9px;border-radius:9px;background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.06);color:#cbd5df;font-size:.68rem;transition:transform .25s,border-color .25s,background .25s}.fse-chip:hover{transform:translateY(-2px);border-color:rgba(0,245,160,.2);background:rgba(0,245,160,.04)}.fse-chip img{width:15px;height:15px;object-fit:contain;filter:grayscale(1) brightness(1.55);opacity:.85}.fse-chip-symbol{width:7px;height:7px;border-radius:50%;background:linear-gradient(135deg,var(--accent),var(--accent-2));box-shadow:0 0 8px rgba(0,245,160,.35)}.fse-no-icon img{display:none}.fse-foot{display:flex;justify-content:space-between;gap:20px;margin-top:24px;padding-top:18px;border-top:1px solid var(--border);font:600 .62rem var(--font-mono);letter-spacing:.08em;color:var(--text-dim)}.fse-foot b{color:var(--text-muted);font-weight:500}
      .fse-reveal{opacity:0;transform:translate3d(0,28px,0) scale(.985);filter:blur(4px);transition:opacity .72s cubic-bezier(.22,1,.36,1),transform .72s cubic-bezier(.22,1,.36,1),filter .72s cubic-bezier(.22,1,.36,1);transition-delay:var(--fse-delay,0ms)}.fse-reveal.fse-visible{opacity:1;transform:none;filter:none}.fse-card[data-fse-index="1"]{--fse-delay:70ms}.fse-card[data-fse-index="2"]{--fse-delay:140ms}.fse-card[data-fse-index="3"]{--fse-delay:210ms}.fse-card[data-fse-index="4"]{--fse-delay:280ms}.fse-card[data-fse-index="5"]{--fse-delay:350ms}.fse-card[data-fse-index="6"]{--fse-delay:420ms}
      @keyframes fsePulse{50%{opacity:.45;box-shadow:0 0 5px rgba(0,245,160,.35)}}@keyframes fseGlow{50%{transform:scale(1.12);opacity:.7}}@keyframes fseSpin{to{transform:rotate(360deg)}}@keyframes fseNode{50%{transform:translateY(20px);opacity:0}}
      @media(max-width:900px){.fse-heading-row{align-items:flex-start;flex-direction:column}.fse-status{margin-top:2px}.fse-card{grid-column:span 6!important}.fse-card:nth-child(4){grid-column:span 6!important}.fse-card:nth-child(5){grid-column:span 6!important}}
      @media(max-width:620px){.fse-section{padding:72px 0 78px}.fse-heading{margin-bottom:30px}.fse-heading .section-title{font-size:clamp(1.9rem,9vw,2.5rem)}.fse-heading .section-sub{font-size:.92rem;margin-bottom:0}.fse-status{width:100%}.fse-core{width:190px;height:190px;margin-bottom:30px}.fse-core-inner{width:124px;height:124px}.fse-core-inner strong{font-size:1rem}.fse-connectors{display:none}.fse-grid{grid-template-columns:1fr;gap:12px}.fse-card,.fse-card:nth-child(4),.fse-card:nth-child(5){grid-column:1!important;padding:20px}.fse-card p{min-height:0}.fse-foot{flex-direction:column;gap:8px;font-size:.55rem}.fse-foot b{line-height:1.7}.fse-chip{font-size:.65rem}}
      @media(prefers-reduced-motion:reduce){.fse-reveal{opacity:1!important;transform:none!important;filter:none!important;transition:none!important}.fse-core-glow,.fse-core-ring,.fse-status>span,.fse-connectors i:after{animation:none!important}.fse-card{transition:none!important}}
    `;
    document.head.appendChild(style);
  }

  function mount() {
    if (document.getElementById(SECTION_ID)) return;
    const hero = document.getElementById(HERO_ID);
    if (!hero || !hero.parentNode) return;
    styles();
    hero.insertAdjacentHTML('afterend', markup());
    observe();
  }

  function observe() {
    const nodes = document.querySelectorAll(`#${SECTION_ID} .fse-reveal`);
    if (!nodes.length) return;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced) { nodes.forEach(node => node.classList.add('fse-visible')); return; }
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('fse-visible');
        else entry.target.classList.remove('fse-visible');
      });
    }, { threshold: .12, rootMargin: '0px 0px -7% 0px' });
    nodes.forEach(node => io.observe(node));
  }

  mount();
})();
