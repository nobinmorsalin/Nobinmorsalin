/* Premium full-stack capability pipeline — visual redesign only. */
(() => {
  'use strict';

  const HERO_ID = 'hero';
  const SECTION_ID = 'fullstack-ecosystem';
  const ICON_BASE = 'https://cdn.simpleicons.org/';
  const ICON_COLORS = {
    html5:'E34F26',
    css:'663399',
    javascript:'F7DF1E',
    tailwindcss:'06B6D4',
    figma:'F24E1E',
    framer:'0055FF',
    nodejs:'5FA04E',
    laravel:'FF2D20',
    php:'777BB4',
    mysql:'4479A1',
    swagger:'85EA2D',
    postman:'FF6C37',
    woocommerce:'96588A',
    stripe:'635BFF',
    google:'4285F4',
    meta:'0866FF',
    n8n:'EA4B71'
  };

  const groups = [
    { key:'frontend', num:'01', label:'FRONTEND', title:'Interfaces & experience', text:'Responsive interfaces, interaction and motion.', items:[['HTML5','html5'],['CSS','css'],['JavaScript','javascript'],['Tailwind CSS','tailwindcss'],['Responsive UI',null],['UI / UX','figma'],['Motion','framer']] },
    { key:'backend', num:'02', label:'BACKEND', title:'Application logic', text:'Server-side systems, auth and architecture.', items:[['Node.js','nodejs'],['Laravel','laravel'],['PHP','php'],['Authentication',null],['Server Architecture',null]] },
    { key:'database', num:'03', label:'DATABASE', title:'Data foundations', text:'Structured storage built for real products.', items:[['MySQL','mysql'],['Database Design',null],['Data Management',null]] },
    { key:'integration', num:'04', label:'API + INTEGRATION', title:'Connected systems', text:'APIs, callbacks and service-to-service flows.', items:[['REST API','swagger'],['API Integration','postman'],['Webhooks',null],['S2S Callback',null],['Postback Systems',null],['Third-party APIs',null]] },
    { key:'commerce', num:'05', label:'BUSINESS SYSTEMS', title:'Commerce & operations', text:'Customer, order and administration workflows.', items:[['E-commerce','woocommerce'],['Payment Integration','stripe'],['Courier Integration',null],['Order Systems',null],['Admin Systems',null],['Customer Systems',null]] },
    { key:'automation', num:'06', label:'MARKETING + AUTOMATION', title:'Growth infrastructure', text:'Tracking, conversion and automated communication.', items:[['SEO','google'],['Meta Pixel','meta'],['Meta CAPI','meta'],['SMTP / Email',null],['Email Automation',null],['Conversion Tracking',null],['Workflow Automation','n8n']] },
    { key:'advanced', num:'07', label:'ADVANCED SYSTEMS', title:'Custom systems', text:'Real-time apps, reward platforms and automation.', items:[['GPT / Reward Platforms',null],['Real-time Systems',null],['Custom Web Apps',null],['Automation',null],['Server Architecture',null]] }
  ];

  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'})[c]);

  function icon(name, slug) {
    if (!slug) return '<span class="fse-chip-dot" aria-hidden="true"></span>';
    const color = ICON_COLORS[slug] || '00F5A0';
    return `<img src="${ICON_BASE}${slug}/${color}" alt="${esc(name)} logo" loading="lazy" decoding="async" onerror="this.closest('.fse-chip')?.classList.add('fse-no-icon')">`;
  }

  function node(group, index) {
    const next = index < groups.length - 1;
    return `<article class="fse-node fse-reveal" data-fse-index="${index}">
      <span class="fse-node-port fse-in" aria-hidden="true"></span><span class="fse-node-port fse-out" aria-hidden="true"></span>
      <div class="fse-node-head"><span class="fse-node-num">${group.num}</span><span class="fse-node-label">${esc(group.label)}</span></div>
      <h3>${esc(group.title)}</h3><p>${esc(group.text)}</p>
      <div class="fse-chips">${group.items.map(([name,slug]) => `<span class="fse-chip" title="${esc(name)}">${icon(name,slug)}<b>${esc(name)}</b></span>`).join('')}</div>
      ${next ? '<span class="fse-stage-arrow" aria-hidden="true">→</span>' : ''}
    </article>`;
  }

  function markup() {
    return `<section class="fse-section" id="${SECTION_ID}" aria-labelledby="fse-title">
      <div class="container fse-container">
        <div class="fse-heading fse-reveal">
          <div class="section-label">// What I work with</div>
          <div class="fse-heading-row"><div><h2 class="section-title" id="fse-title">One stack. <span>Many connected layers.</span></h2><p class="section-sub">A visual map of how I move from interface to infrastructure — building, integrating and automating complete digital systems.</p></div><div class="fse-readout"><span class="fse-live-dot"></span><div><b>FULL-STACK ENGINE</b><small>BUILD → INTEGRATE → AUTOMATE</small></div></div></div>
        </div>

        <div class="fse-architecture">
          <div class="fse-core fse-reveal" aria-label="Full-stack development core">
            <div class="fse-core-orbit orbit-a"></div><div class="fse-core-orbit orbit-b"></div><div class="fse-core-halo"></div>
            <div class="fse-core-inner"><span>CAPABILITY ENGINE</span><strong>FULL-STACK</strong><em>DEVELOPMENT</em><small>Frontend · Backend · Systems</small></div>
          </div>
          <div class="fse-flow-caption"><span>01</span><i></i><b>ENGINEERING PIPELINE</b><i></i><span>07</span></div>
          <div class="fse-pipeline">${groups.map(node).join('')}</div>
          <div class="fse-flow-line" aria-hidden="true"><span class="fse-flow-track"></span><span class="fse-flow-pulse p1"></span><span class="fse-flow-pulse p2"></span><span class="fse-flow-pulse p3"></span></div>
        </div>
        <div class="fse-foot fse-reveal"><span>FULL-STACK CAPABILITY MAP</span><b>INTERFACE → LOGIC → DATA → INTEGRATION → BUSINESS → AUTOMATION → SYSTEMS</b></div>
      </div>
    </section>`;
  }

  function styles() {
    if (document.getElementById('fse-styles')) return;
    const style = document.createElement('style');
    style.id = 'fse-styles';
    style.textContent = `
      .fse-section{position:relative;padding:88px 0 104px;overflow:hidden;background:radial-gradient(circle at 50% 28%,rgba(0,245,160,.065),transparent 30%),linear-gradient(180deg,rgba(255,255,255,.012),transparent 35%)}
      .fse-section:before{content:"";position:absolute;inset:0;pointer-events:none;background-image:linear-gradient(rgba(0,245,160,.022) 1px,transparent 1px),linear-gradient(90deg,rgba(0,245,160,.022) 1px,transparent 1px);background-size:64px 64px;mask-image:linear-gradient(to bottom,#000 0%,transparent 92%)}
      .fse-container{position:relative;z-index:1}.fse-heading{margin-bottom:34px}.fse-heading-row{display:flex;justify-content:space-between;align-items:flex-end;gap:30px}.fse-heading .section-title{max-width:760px}.fse-heading .section-title span{background:linear-gradient(135deg,var(--accent),var(--accent-2));-webkit-background-clip:text;background-clip:text;color:transparent}.fse-heading .section-sub{max-width:680px;margin-bottom:0}
      .fse-readout{flex:0 0 auto;display:flex;gap:11px;align-items:center;padding:11px 14px;border:1px solid rgba(0,245,160,.17);border-radius:12px;background:rgba(5,10,12,.58);box-shadow:inset 0 0 28px rgba(0,245,160,.025)}.fse-live-dot{width:7px;height:7px;border-radius:50%;background:var(--accent);box-shadow:0 0 14px var(--accent);animation:fseLive 2s ease-in-out infinite}.fse-readout b{display:block;font:700 .63rem var(--font-mono);letter-spacing:.1em;color:var(--accent)}.fse-readout small{display:block;margin-top:3px;color:var(--text-dim);font:500 .54rem var(--font-mono);letter-spacing:.05em}
      .fse-architecture{position:relative;margin-top:30px;padding:28px 0 4px}.fse-core{position:relative;z-index:5;width:190px;height:190px;margin:0 auto 20px;display:grid;place-items:center}.fse-core-halo{position:absolute;width:125px;height:125px;border-radius:50%;background:radial-gradient(circle,rgba(0,245,160,.2),rgba(0,212,255,.06) 48%,transparent 72%);filter:blur(12px);animation:fseHalo 4s ease-in-out infinite}.fse-core-orbit{position:absolute;border:1px solid rgba(0,245,160,.2);border-radius:50%}.orbit-a{inset:12px;animation:fseOrbit 18s linear infinite}.orbit-b{inset:0;border-color:rgba(0,212,255,.13);border-style:dashed;animation:fseOrbit 27s linear infinite reverse}.fse-core-inner{width:122px;height:122px;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;background:rgba(7,12,16,.95);border:1px solid rgba(0,245,160,.3);box-shadow:0 0 0 1px rgba(255,255,255,.025),0 0 45px rgba(0,245,160,.1),inset 0 0 28px rgba(0,245,160,.045);backdrop-filter:blur(12px)}.fse-core-inner span{font:500 .47rem var(--font-mono);letter-spacing:.12em;color:var(--text-dim)}.fse-core-inner strong{font:800 1.08rem var(--font-head);line-height:1;margin-top:5px}.fse-core-inner em{font:700 .58rem var(--font-mono);font-style:normal;color:var(--accent);letter-spacing:.15em;margin-top:4px}.fse-core-inner small{font-size:.52rem;color:var(--text-muted);margin-top:9px}
      .fse-flow-caption{display:flex;align-items:center;gap:10px;max-width:1180px;margin:0 auto 14px;color:var(--text-dim);font:600 .52rem var(--font-mono);letter-spacing:.12em}.fse-flow-caption i{height:1px;flex:1;background:linear-gradient(90deg,transparent,rgba(0,245,160,.18),transparent)}.fse-flow-caption span{color:var(--accent);opacity:.7}
      .fse-pipeline{position:relative;display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:12px;align-items:stretch;max-width:1260px;margin:auto}.fse-node{position:relative;min-height:238px;padding:19px 16px 17px;border:1px solid rgba(255,255,255,.08);border-radius:16px;background:linear-gradient(155deg,rgba(14,19,25,.96),rgba(9,14,19,.82));box-shadow:0 18px 42px rgba(0,0,0,.2),inset 0 1px rgba(255,255,255,.025);overflow:visible;transition:transform .35s cubic-bezier(.22,1,.36,1),border-color .35s,box-shadow .35s}.fse-node:before{content:"";position:absolute;inset:0;border-radius:inherit;background:radial-gradient(circle at 30% 0,rgba(0,245,160,.065),transparent 45%);pointer-events:none}.fse-node:hover{transform:translateY(-5px);border-color:rgba(0,245,160,.28);box-shadow:0 24px 52px rgba(0,0,0,.28),0 0 28px rgba(0,245,160,.045)}.fse-node-head{display:flex;align-items:center;gap:8px;margin-bottom:17px}.fse-node-num{font:700 .6rem var(--font-mono);color:var(--accent);padding:4px 6px;border-radius:6px;background:rgba(0,245,160,.06);border:1px solid rgba(0,245,160,.13)}.fse-node-label{font:600 .53rem var(--font-mono);letter-spacing:.08em;color:var(--text-dim)}.fse-node h3{font:700 .95rem var(--font-head);line-height:1.15;margin:0 0 8px}.fse-node p{font-size:.68rem;line-height:1.55;color:var(--text-muted);margin:0 0 15px;min-height:42px}.fse-chips{display:flex;flex-wrap:wrap;gap:6px}.fse-chip{display:inline-flex;align-items:center;gap:6px;min-height:27px;padding:5px 7px;border:1px solid rgba(255,255,255,.065);border-radius:7px;background:rgba(255,255,255,.022);color:#cbd5df;font-size:.57rem;line-height:1.1;transition:border-color .25s,background .25s,transform .25s}.fse-chip:hover{transform:translateY(-2px);border-color:rgba(0,245,160,.2);background:rgba(0,245,160,.035)}.fse-chip img{width:15px;height:15px;object-fit:contain;filter:none;opacity:1;flex:none}.fse-chip-dot{width:6px;height:6px;border-radius:50%;background:linear-gradient(135deg,var(--accent),var(--accent-2));box-shadow:0 0 8px rgba(0,245,160,.35);flex:none}.fse-no-icon img{display:none}.fse-stage-arrow{position:absolute;right:-16px;top:50%;z-index:8;width:20px;height:20px;display:grid;place-items:center;border-radius:50%;color:var(--accent);font:700 .65rem var(--font-mono);background:#0a1115;border:1px solid rgba(0,245,160,.22);box-shadow:0 0 15px rgba(0,245,160,.1)}
      .fse-flow-line{position:absolute;left:0;right:0;top:50%;height:1px;pointer-events:none;z-index:2}.fse-flow-track{position:absolute;left:4%;right:4%;height:1px;background:linear-gradient(90deg,transparent,rgba(0,245,160,.2) 7%,rgba(0,245,160,.2) 93%,transparent)}.fse-flow-pulse{position:absolute;top:-2px;width:5px;height:5px;border-radius:50%;background:var(--accent);box-shadow:0 0 13px var(--accent);animation:fseTravel 4.8s linear infinite}.p1{left:5%}.p2{left:5%;animation-delay:1.6s}.p3{left:5%;animation-delay:3.2s}
      .fse-node-port{position:absolute;top:50%;width:6px;height:6px;border-radius:50%;transform:translateY(-50%);background:#0a1115;border:1px solid rgba(0,245,160,.3);z-index:9}.fse-in{left:-4px}.fse-out{right:-4px}.fse-foot{display:flex;justify-content:space-between;gap:20px;margin-top:24px;padding-top:17px;border-top:1px solid var(--border);font:600 .58rem var(--font-mono);letter-spacing:.08em;color:var(--text-dim)}.fse-foot b{font-weight:500;color:var(--text-muted)}
      .fse-reveal{opacity:0;transform:translate3d(0,24px,0) scale(.99);filter:blur(3px);transition:opacity .65s cubic-bezier(.22,1,.36,1),transform .65s cubic-bezier(.22,1,.36,1),filter .65s cubic-bezier(.22,1,.36,1);transition-delay:var(--fse-delay,0ms)}.fse-reveal.fse-visible{opacity:1;transform:none;filter:none}.fse-node[data-fse-index="1"]{--fse-delay:70ms}.fse-node[data-fse-index="2"]{--fse-delay:140ms}.fse-node[data-fse-index="3"]{--fse-delay:210ms}.fse-node[data-fse-index="4"]{--fse-delay:280ms}.fse-node[data-fse-index="5"]{--fse-delay:350ms}.fse-node[data-fse-index="6"]{--fse-delay:420ms}
      @keyframes fseLive{50%{opacity:.45;box-shadow:0 0 5px rgba(0,245,160,.3)}}@keyframes fseHalo{50%{transform:scale(1.1);opacity:.72}}@keyframes fseOrbit{to{transform:rotate(360deg)}}@keyframes fseTravel{0%{transform:translateX(0);opacity:0}10%{opacity:1}90%{opacity:1}100%{transform:translateX(900px);opacity:0}}
      @media(max-width:1100px){.fse-pipeline{grid-template-columns:repeat(4,minmax(0,1fr));max-width:900px}.fse-node:nth-child(1),.fse-node:nth-child(2),.fse-node:nth-child(3){grid-row:1}.fse-node:nth-child(4),.fse-node:nth-child(5),.fse-node:nth-child(6),.fse-node:nth-child(7){grid-row:2}.fse-stage-arrow{display:none}.fse-flow-line{display:none}}
      @media(max-width:900px){.fse-heading-row{align-items:flex-start;flex-direction:column}.fse-readout{margin-top:2px}.fse-pipeline{grid-template-columns:repeat(2,minmax(0,1fr));max-width:680px}.fse-node{min-height:220px}.fse-node p{min-height:0}}
      @media(max-width:620px){.fse-section{padding:70px 0 78px}.fse-heading{margin-bottom:24px}.fse-heading .section-title{font-size:clamp(1.9rem,9vw,2.5rem)}.fse-heading .section-sub{font-size:.9rem}.fse-readout{width:100%}.fse-architecture{padding-top:18px}.fse-core{width:174px;height:174px;margin-bottom:18px}.fse-core-inner{width:114px;height:114px}.fse-core-inner strong{font-size:.98rem}.fse-flow-caption{margin-bottom:12px}.fse-pipeline{grid-template-columns:1fr;gap:0;max-width:430px}.fse-node{min-height:0;margin-left:18px;padding:18px 16px;border-radius:14px}.fse-node:not(:last-child){margin-bottom:28px}.fse-node:after{content:"";position:absolute;left:50%;bottom:-29px;width:1px;height:28px;background:linear-gradient(var(--accent),transparent);opacity:.45}.fse-node:last-child:after{display:none}.fse-node-port{display:none}.fse-stage-arrow{display:grid;right:auto;left:50%;top:auto;bottom:-36px;transform:translateX(-50%) rotate(90deg)}.fse-flow-line{display:none}.fse-foot{flex-direction:column;gap:8px;font-size:.53rem}.fse-foot b{line-height:1.7}.fse-chip{font-size:.57rem}}
      @media(prefers-reduced-motion:reduce){.fse-reveal{opacity:1!important;transform:none!important;filter:none!important;transition:none!important}.fse-core-halo,.fse-core-orbit,.fse-live-dot,.fse-flow-pulse{animation:none!important}.fse-node{transition:none!important}}
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
    if (!('IntersectionObserver' in window)) { nodes.forEach(node => node.classList.add('fse-visible')); return; }
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('fse-visible');
        else entry.target.classList.remove('fse-visible');
      });
    }, { threshold:.12, rootMargin:'0px 0px -7% 0px' });
    nodes.forEach(node => io.observe(node));
  }

  mount();
})();
