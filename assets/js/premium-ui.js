/* NOBIN MORSALIN — PREMIUM UX LAYER v1.0 */
(function(){'use strict';
  const $=(s,p=document)=>p.querySelector(s); const $$=(s,p=document)=>Array.from(p.querySelectorAll(s));
  const reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function uxWriting(){
    const replacements=[
      ['#services .section-title','What I build'],
      ['#services .section-sub','Practical digital products, integrations and systems designed to be fast, clear and easy to use.'],
      ['#projects .section-title','Selected work'],
      ['#projects .section-sub','A few real builds showing how I turn requirements into working digital products.'],
      ['#clients .section-title','Trusted work'],
      ['#clients .section-sub','Projects and systems built for brands, creators and growing businesses.'],
      ['#workflow .section-title','How I work'],
      ['#workflow .section-sub','A simple process: understand the goal, design the experience, build carefully, test thoroughly, then launch.'],
      ['#contact .section-title','Let’s build something useful.'],
      ['#contact .contact-desc','Tell me what you are trying to build, improve or automate. I’ll help turn the idea into a clear next step.'],
      ['#projects .filter-btn[data-filter="all"]','All work'],
      ['#contactForm label[for="contactName"]','Your name'],
      ['#contactForm label[for="contactEmailInput"]','Work email'],
      ['#contactForm label[for="contactSubject"]','What do you need?'],
      ['#contactForm label[for="contactMessage"]','Project details'],
      ['#contactName',''],
      ['#contactEmailInput',''],
      ['#contactSubject',''],
      ['#contactMessage','']
    ];
    replacements.forEach(([selector,text])=>{const el=$(selector);if(!el)return;if(selector.startsWith('#contact')&&el.tagName==='INPUT'||el.tagName==='TEXTAREA'){if(selector==='#contactName')el.placeholder='Your name';if(selector==='#contactEmailInput')el.placeholder='you@company.com';if(selector==='#contactSubject')el.placeholder='Website, web app, API, automation…';if(selector==='#contactMessage')el.placeholder='A short description of your goal, timeline and anything you already have.';return}el.textContent=text});
    const primary=$('.hero-actions .btn-primary'); if(primary)primary.textContent='Explore my work';
    const ghost=$('.hero-actions .btn-ghost'); if(ghost)ghost.textContent='Start a conversation →';
    const formBtn=$('#submitBtn .btn-text'); if(formBtn)formBtn.textContent='Send inquiry';
  }

  function scrollProgress(){
    const bar=document.createElement('div');bar.className='premium-scroll-progress';document.body.appendChild(bar);
    const back=document.createElement('button');back.className='premium-backtop';back.type='button';back.setAttribute('aria-label','Back to top');back.innerHTML='↑';document.body.appendChild(back);
    const update=()=>{const max=document.documentElement.scrollHeight-innerHeight;const p=max>0?Math.min(1,Math.max(0,scrollY/max)):0;bar.style.width=(p*100)+'%';back.classList.toggle('is-visible',scrollY>700)};
    addEventListener('scroll',update,{passive:true});back.addEventListener('click',()=>scrollTo({top:0,behavior:reduce?'auto':'smooth'}));update();
  }

  function reveal(){
    const sections=$$('.section');
    sections.forEach((section,i)=>{section.classList.add('premium-reveal');section.dataset.revealDelay=String(Math.min(i%4,3));
      const grid=section.querySelector('.services-track,.projects-grid,.workflow-steps,.skills-grid,.contact-grid'); if(grid)grid.classList.add('premium-stagger');
    });
    if(reduce){$$('.premium-reveal,.premium-stagger').forEach(el=>el.classList.add('is-visible'));return}
    const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');io.unobserve(e.target)}}),{threshold:.12,rootMargin:'0px 0px -7% 0px'});
    $$('.premium-reveal,.premium-stagger').forEach(el=>io.observe(el));
  }

  function activeSection(){
    const links=$$('.nav-links a[href^="#"]'); const sections=links.map(a=>$(a.getAttribute('href'))).filter(Boolean); if(!sections.length)return;
    const io=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting)return;links.forEach(a=>a.classList.remove('is-current'));const link=links.find(a=>a.getAttribute('href')==='#'+entry.target.id);if(link)link.classList.add('is-current')}),{rootMargin:'-38% 0px -52% 0px',threshold:0});
    sections.forEach(s=>io.observe(s));
  }

  function pointerGlow(){
    if(reduce||!matchMedia('(hover:hover)').matches)return;
    $$('.service-card,.project-card,.workflow-step,.client-card').forEach(card=>{
      card.addEventListener('pointermove',e=>{const r=card.getBoundingClientRect();card.style.setProperty('--mx',((e.clientX-r.left)/r.width*100)+'%');card.style.setProperty('--my',((e.clientY-r.top)/r.height*100)+'%')});
    });
  }

  function addSectionMarkers(){
    $$('.section .container > .section-label').forEach((label,i)=>{if(label.querySelector('.premium-section-marker'))return;const m=document.createElement('span');m.className='premium-section-marker';m.textContent=String(i+1).padStart(2,'0');label.appendChild(m)});
  }

  function init(){uxWriting();scrollProgress();reveal();activeSection();pointerGlow();addSectionMarkers();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
