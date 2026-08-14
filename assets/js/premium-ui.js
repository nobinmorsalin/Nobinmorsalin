/* NOBIN MORSALIN — PREMIUM UX LAYER v1.2
   Additive only: does not replace existing portfolio functionality. */
(function(){'use strict';
  const $=(s,p=document)=>p.querySelector(s); const $$=(s,p=document)=>Array.from(p.querySelectorAll(s));
  const reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile=()=>window.innerWidth<=760;

  function uxWriting(){
    const replacements=[
      ['#services .section-title','What I build'],['#services .section-sub','Practical digital products, integrations and systems designed to be fast, clear and easy to use.'],
      ['#projects .section-title','Selected work'],['#projects .section-sub','A few real builds showing how I turn requirements into working digital products.'],
      ['#clients .section-title','Trusted work'],['#clients .section-sub','Projects and systems built for brands, creators and growing businesses.'],
      ['#workflow .section-title','How I work'],['#workflow .section-sub','A simple process: understand the goal, design the experience, build carefully, test thoroughly, then launch.'],
      ['#contact .section-title','Let’s build something useful.'],['#contact .contact-desc','Tell me what you are trying to build, improve or automate. I’ll help turn the idea into a clear next step.'],
      ['#projects .filter-btn[data-filter="all"]','All work'],['#contactForm label[for="contactName"]','Your name'],['#contactForm label[for="contactEmailInput"]','Work email'],['#contactForm label[for="contactSubject"]','What do you need?'],['#contactForm label[for="contactMessage"]','Project details']
    ];
    replacements.forEach(([selector,text])=>{const el=$(selector);if(el)el.textContent=text});
    const placeholders={contactName:'Your name',contactEmailInput:'you@company.com',contactSubject:'Website, web app, API, automation…',contactMessage:'A short description of your goal, timeline and anything you already have.'};
    Object.entries(placeholders).forEach(([id,text])=>{const el=document.getElementById(id);if(el)el.placeholder=text});
    const primary=$('.hero-actions .btn-primary');if(primary)primary.textContent='Explore my work';const ghost=$('.hero-actions .btn-ghost');if(ghost)ghost.textContent='Start a conversation →';const formBtn=$('#submitBtn .btn-text');if(formBtn)formBtn.textContent='Send inquiry';
  }

  function scrollProgress(){let bar=$('.premium-scroll-progress');if(!bar){bar=document.createElement('div');bar.className='premium-scroll-progress';document.body.appendChild(bar)}let back=$('.premium-backtop');if(!back){back=document.createElement('button');back.className='premium-backtop';back.type='button';back.setAttribute('aria-label','Back to top');back.innerHTML='↑';document.body.appendChild(back);back.addEventListener('click',()=>scrollTo({top:0,behavior:reduce?'auto':'smooth'}))}const update=()=>{const max=document.documentElement.scrollHeight-innerHeight;const p=max>0?Math.min(1,Math.max(0,scrollY/max)):0;bar.style.width=p*100+'%';back.classList.toggle('is-visible',scrollY>700)};addEventListener('scroll',update,{passive:true});update()}

  function prepareRevealElement(el,delay){if(!el||el.dataset.premiumPrepared==='1')return;el.dataset.premiumPrepared='1';el.classList.add('premium-reveal');el.dataset.revealDelay=String(delay||0)}
  function prepareStagger(el){if(!el||el.dataset.premiumStagger==='1')return;el.dataset.premiumStagger='1';el.classList.add('premium-stagger')}

  function reveal(){
    const prepare=()=>$$('.section').forEach((section,i)=>{prepareRevealElement(section,Math.min(i%4,3));const grid=section.querySelector('.services-track,.projects-grid,.workflow-steps,.skills-grid,.contact-grid');if(grid)prepareStagger(grid)});
    prepare();const elements=$$('.premium-reveal,.premium-stagger');
    if(reduce){elements.forEach(el=>el.classList.add('is-visible'));return}
    const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');io.unobserve(e.target)}}),{threshold:.12,rootMargin:'0px 0px -7% 0px'});
    elements.forEach(el=>{if(!el.classList.contains('is-visible'))io.observe(el)});
    const observer=new MutationObserver(mutations=>{if(!mutations.some(m=>m.type==='childList'&&m.addedNodes.length))return;prepare();$$('.premium-reveal,.premium-stagger').forEach(el=>{if(!el.classList.contains('is-visible'))io.observe(el)});pointerGlow();});observer.observe(document.body,{childList:true,subtree:true});
  }

  function activeSection(){const links=$$('.nav-links a[href^="#"]');const sections=links.map(a=>$(a.getAttribute('href'))).filter(Boolean);if(!sections.length)return;const io=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting)return;links.forEach(a=>a.classList.remove('is-current'));const link=links.find(a=>a.getAttribute('href')==='#'+entry.target.id);if(link)link.classList.add('is-current')}),{rootMargin:'-38% 0px -52% 0px',threshold:0});sections.forEach(s=>io.observe(s))}

  function pointerGlow(){if(reduce||!matchMedia('(hover:hover)').matches)return;$$('.service-card,.project-card,.workflow-step,.client-card').forEach(card=>{if(card.dataset.pointerGlow==='1')return;card.dataset.pointerGlow='1';card.addEventListener('pointermove',e=>{const r=card.getBoundingClientRect();card.style.setProperty('--mx',((e.clientX-r.left)/r.width*100)+'%');card.style.setProperty('--my',((e.clientY-r.top)/r.height*100)+'%')})})}

  function addSectionMarkers(){$$('.section .container > .section-label').forEach((label,i)=>{if(label.querySelector('.premium-section-marker'))return;const m=document.createElement('span');m.className='premium-section-marker';m.textContent=String(i+1).padStart(2,'0');label.appendChild(m)})}

  function hardenMenu(){
    const toggle=$('#navToggle'),links=$('#navLinks'),nav=$('#nav');if(!toggle||!links)return;
    const close=()=>{links.classList.remove('active');toggle.classList.remove('active');toggle.setAttribute('aria-expanded','false')};
    document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
    document.addEventListener('click',e=>{if(!mobile()||!links.classList.contains('active'))return;if(!nav.contains(e.target))close()});
    $$('.nav-links a',links).forEach(a=>a.addEventListener('click',close,{passive:true}));
    addEventListener('popstate',close);addEventListener('hashchange',close);
  }

  function animateStats(){
    const stats=$$('.hero-stats .stat');if(!stats.length)return;
    const animate=()=>stats.forEach(stat=>{const node=$('.stat-num',stat);if(!node)return;const raw=node.textContent.trim();const match=raw.match(/(\d+)/);if(!match)return;const target=parseInt(match[1],10);if(reduce){node.textContent=target+'+';return}node.textContent='0';const start=performance.now();const duration=700;const tick=now=>{const p=Math.min(1,(now-start)/duration);const eased=1-Math.pow(1-p,3);node.textContent=Math.round(target*eased)+'+';if(p<1)requestAnimationFrame(tick)};requestAnimationFrame(tick)});
    const hero=$('#hero');if(!hero)return;let lastVisible=false;const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting&&!lastVisible){animate();lastVisible=true}else if(!e.isIntersecting){lastVisible=false}}),{threshold:.25});io.observe(hero);
  }

  function mobilePolish(){if(!mobile())return;const chat=$('#liveChat');if(chat)chat.style.setProperty('--mobile-safe-bottom','env(safe-area-inset-bottom'))}
  function init(){uxWriting();scrollProgress();reveal();activeSection();pointerGlow();addSectionMarkers();hardenMenu();animateStats();mobilePolish();addEventListener('resize',mobilePolish,{passive:true})}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
