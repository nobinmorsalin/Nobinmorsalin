/* =========================================================
   PORTFOLIO DETAILS — Clients / Services / Projects
   Mobile-safe dynamic binding + premium client presentation.
   ========================================================= */
(function () {
  'use strict';
  const $ = (s, p = document) => p.querySelector(s);
  const $$ = (s, p = document) => Array.from(p.querySelectorAll(s));
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const url = (v) => { if (!v) return '#'; const s=String(v).trim(); return /^(https?:\/\/|mailto:|\/|#)/i.test(s) ? s : '#'; };
  const data = (key) => { try { return window.PortfolioData?.get?.(key) || []; } catch (_) { return []; } };

  function ensureModal() {
    if ($('#portfolioDetailsModal')) return;
    document.body.insertAdjacentHTML('beforeend', `<div class="portfolio-details-modal" id="portfolioDetailsModal" aria-hidden="true"><div class="portfolio-details-backdrop" data-details-close></div><section class="portfolio-details-dialog" role="dialog" aria-modal="true" aria-labelledby="detailsTitle"><button class="portfolio-details-close" type="button" data-details-close aria-label="Close">×</button><div id="detailsContent"></div></section></div>`);
    $$('#portfolioDetailsModal [data-details-close]').forEach(el => el.addEventListener('click', close));
  }

  function open(item, type) {
    ensureModal();
    const modal=$('#portfolioDetailsModal'), content=$('#detailsContent');
    const title=item.title||item.name||'Details', image=item.image||item.thumbnail||item.logo||item.imageUrl||'';
    const tags=Array.isArray(item.tags)?item.tags:(Array.isArray(item.technologies)?item.technologies:[]);
    const features=Array.isArray(item.features)?item.features:(Array.isArray(item.included)?item.included:[]);
    const technologies=Array.isArray(item.technologies)?item.technologies:[];
    const live=url(item.live||item.liveUrl||item.url||item.demo||item.website), github=url(item.github||item.githubUrl), service=item.service||item.services||'';
    let body='';
    if(type==='client') body=`<div class="details-hero details-client-hero">${image?`<img src="${esc(url(image))}" alt="${esc(title)} logo" class="details-main-image details-client-image">`:`<div class="details-image-fallback">${esc(title.charAt(0))}</div>`}<div><span class="details-kicker">Client</span><h2 id="detailsTitle">${esc(title)}</h2><p>${esc(item.shortDescription||item.description||service||'Client partnership')}</p></div></div><div class="details-grid">${item.industry?`<div><b>Industry</b><span>${esc(item.industry)}</span></div>`:''}${service?`<div><b>Service</b><span>${esc(service)}</span></div>`:''}${item.location?`<div><b>Location</b><span>${esc(item.location)}</span></div>`:''}${item.testimonial?`<div class="details-wide"><b>Testimonial</b><span>${esc(item.testimonial)}</span></div>`:''}</div>${live!=='#'?`<div class="details-actions"><a class="details-primary" href="${esc(live)}" target="_blank" rel="noopener noreferrer">Visit Website ↗</a></div>`:''}`;
    else if(type==='service') body=`${image?`<img src="${esc(url(image))}" alt="${esc(title)}" class="details-cover-image">`:''}<span class="details-kicker">${esc(item.category||'Service')}</span><h2 id="detailsTitle">${esc(title)}</h2><p class="details-lead">${esc(item.longDescription||item.detailedDescription||item.description||item.desc||'')}</p>${technologies.length?`<div class="details-section"><h3>Technologies & Tools</h3><div class="details-tags">${technologies.map(x=>`<span>${esc(typeof x==='object'?(x.name||x.title||''):x)}</span>`).join('')}</div></div>`:''}${features.length?`<div class="details-section"><h3>What's Included</h3><ul class="details-list">${features.map(x=>`<li>${esc(typeof x==='object'?(x.name||x.title||''):x)}</li>`).join('')}</ul></div>`:''}<div class="details-meta">${item.price?`<span><b>Starting at</b>${esc(item.price)}</span>`:''}${item.deliveryTime||item.delivery?`<span><b>Delivery</b>${esc(item.deliveryTime||item.delivery)}</span>`:''}</div>${live!=='#'?`<div class="details-actions"><a class="details-primary" href="${esc(live)}" target="_blank" rel="noopener noreferrer">View Service ↗</a></div>`:`<div class="details-actions"><a class="details-primary" href="#contact" data-details-close>Get This Service →</a></div>`}`;
    else body=`${image?`<img src="${esc(url(image))}" alt="${esc(title)}" class="details-cover-image">`:''}<span class="details-kicker">${esc(item.category||'Project')}</span><h2 id="detailsTitle">${esc(title)}</h2><p class="details-lead">${esc(item.fullDescription||item.longDescription||item.description||item.desc||'')}</p>${item.challenge||item.idea?`<div class="details-section"><h3>Project Idea / Challenge</h3><p>${esc(item.challenge||item.idea)}</p></div>`:''}${item.solution?`<div class="details-section"><h3>Solution</h3><p>${esc(item.solution)}</p></div>`:''}${item.client?`<div class="details-section"><h3>Client</h3><p>${esc(typeof item.client==='object'?(item.client.name||''):item.client)}</p></div>`:''}${tags.length?`<div class="details-section"><h3>Technologies</h3><div class="details-tags">${tags.map(x=>`<span>${esc(typeof x==='object'?(x.name||x.title||''):x)}</span>`).join('')}</div></div>`:''}${item.completionDate||item.date?`<div class="details-meta"><span><b>Completed</b>${esc(item.completionDate||item.date)}</span></div>`:''}<div class="details-actions">${live!=='#'?`<a class="details-primary" href="${esc(live)}" target="_blank" rel="noopener noreferrer">Visit Live Website ↗</a>`:''}${github!=='#'?`<a class="details-secondary" href="${esc(github)}" target="_blank" rel="noopener noreferrer">View Source Code ↗</a>`:''}</div>`;
    content.innerHTML=body; modal.classList.add('is-open'); modal.setAttribute('aria-hidden','false'); document.body.classList.add('details-modal-open');
  }
  function close(){const modal=$('#portfolioDetailsModal');if(!modal)return;modal.classList.remove('is-open');modal.setAttribute('aria-hidden','true');document.body.classList.remove('details-modal-open');}

  function bind(){
    const maps=[['servicesGrid','services','service'],['projectsGrid','projects','project'],['clientsGrid','clients','client']];
    maps.forEach(([id,key,type])=>{
      const root=document.getElementById(id); if(!root||root.dataset.detailsDelegated==='1')return;
      root.dataset.detailsDelegated='1';
      root.addEventListener('click',(e)=>{
        const card=e.target.closest('.service-card,.project-card,.client-card,[data-item-id],[data-id]'); if(!card||!root.contains(card))return;
        if(e.target.closest('a,button'))return;
        const id=card.dataset.itemId||card.dataset.id;
        const items=data(key); let item=Array.isArray(items)?items.find(x=>String(x.id)===String(id)):null;
        if(!item){const text=card.querySelector('.project-title,.service-title,.client-name')?.textContent?.trim();if(text&&Array.isArray(items))item=items.find(x=>(x.title||x.name||'').trim()===text);}
        if(!item)return; e.preventDefault(); open(item,type);
      },{passive:false});
    });
  }

  function premiumCSS(){
    if($('#portfolio-details-mobile-fix'))return;
    const s=document.createElement('style');s.id='portfolio-details-mobile-fix';s.textContent=`body.details-modal-open{overflow:hidden}.portfolio-details-dialog{-webkit-overflow-scrolling:touch;overscroll-behavior:contain}.details-client-hero{align-items:center}.details-client-image{width:160px;height:120px;object-fit:contain;object-position:center;background:rgba(255,255,255,.025);border-radius:16px;padding:14px;box-sizing:border-box}.client-card{cursor:pointer}.client-card .client-visual{height:120px;min-height:120px;display:flex;align-items:center;justify-content:center;padding:18px;box-sizing:border-box;overflow:hidden}.client-card .client-visual img{width:100%;height:100%;max-width:180px;object-fit:contain;object-position:center;display:block}.clients-track{touch-action:pan-y;will-change:transform}@media(max-width:600px){.client-card .client-visual{height:105px;min-height:105px;padding:14px}.client-card .client-visual img{max-width:150px}.details-client-image{width:120px;height:95px}}`;
    document.head.appendChild(s);
  }

  document.addEventListener('keydown',(e)=>{if(e.key==='Escape')close();});
  window.addEventListener('portfolio:data-ready',()=>setTimeout(bind,0));
  window.addEventListener('load',()=>setTimeout(bind,100));
  premiumCSS(); bind(); setTimeout(bind,300); setTimeout(bind,1000); setTimeout(bind,2000);
})();

/* =========================================================
   AUTOMATIC SEO — database-driven detail pages + structured data
   Every Service / Project / Client added from Admin gets a crawlable
   clean URL, unique title/description/canonical and JSON-LD.
   ========================================================= */
(function () {
  'use strict';
  const SITE = 'https://nobinmorsalin.vercel.app';
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const safeUrl = (v) => { const s=String(v||'').trim(); return /^https?:\/\//i.test(s) ? s : ''; };
  const slugify = (v) => String(v||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'') || 'item';
  const get = (key) => { try { return window.PortfolioData?.get?.(key) || []; } catch (_) { return []; } };

  function meta(name, content) {
    let el = document.querySelector(`meta[name="${name}"]`);
    if (!el) { el=document.createElement('meta'); el.name=name; document.head.appendChild(el); }
    el.content=content;
  }
  function prop(property, content) {
    let el=document.querySelector(`meta[property="${property}"]`);
    if(!el){el=document.createElement('meta');el.setAttribute('property',property);document.head.appendChild(el);}
    el.content=content;
  }
  function canonical(href) {
    let el=document.querySelector('link[rel="canonical"]');
    if(!el){el=document.createElement('link');el.rel='canonical';document.head.appendChild(el);}
    el.href=href;
  }
  function jsonld(value) {
    const old=document.getElementById('automatic-seo-jsonld'); if(old) old.remove();
    const script=document.createElement('script'); script.type='application/ld+json'; script.id='automatic-seo-jsonld'; script.textContent=JSON.stringify(value); document.head.appendChild(script);
  }
  function setSEO(title, description, canonicalUrl, image, schema) {
    document.title=title;
    meta('description', description);
    meta('robots','index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1');
    prop('og:title',title); prop('og:description',description); prop('og:url',canonicalUrl); prop('og:type','website');
    if(image) prop('og:image',image);
    meta('twitter:card','summary_large_image'); meta('twitter:title',title); meta('twitter:description',description);
    canonical(canonicalUrl); jsonld(schema);
  }

  function findBySlug(type, slug) {
    const key = type==='project'?'projects':type==='service'?'services':'clients';
    const items=get(key);
    return Array.isArray(items) ? items.find(item => slugify(item.title||item.name)===slug) : null;
  }

  function detailDescription(item,type) {
    if(type==='service') return String(item.longDescription||item.detailedDescription||item.description||item.desc||`Professional ${item.name||'web development'} service by Nobin Morsalin.`).replace(/\s+/g,' ').trim().slice(0,300);
    if(type==='project') return String(item.fullDescription||item.longDescription||item.description||item.desc||`A project developed by Nobin Morsalin.`).replace(/\s+/g,' ').trim().slice(0,300);
    return String(item.shortDescription||item.description||item.service||`Client work and digital solutions delivered by Nobin Morsalin.`).replace(/\s+/g,' ').trim().slice(0,300);
  }

  function renderDetail(item,type,slug) {
    const title=item.title||item.name||'Portfolio Detail';
    const description=detailDescription(item,type);
    const canonicalUrl=`${SITE}/${type==='project'?'projects':type==='service'?'services':'clients'}/${slug}`;
    const image=safeUrl(item.image||item.thumbnail||item.logo||item.imageUrl);
    const live=safeUrl(item.live||item.liveUrl||item.url||item.demo||item.website);
    const github=safeUrl(item.github||item.githubUrl);
    const tags=Array.isArray(item.tags)?item.tags:(Array.isArray(item.technologies)?item.technologies:[]);
    const features=Array.isArray(item.features)?item.features:(Array.isArray(item.included)?item.included:[]);
    let sections='';
    if(type==='project') sections=`${item.challenge||item.idea?`<section><h2>Project Challenge</h2><p>${esc(item.challenge||item.idea)}</p></section>`:''}${item.solution?`<section><h2>Solution</h2><p>${esc(item.solution)}</p></section>`:''}${item.client?`<section><h2>Client</h2><p>${esc(typeof item.client==='object'?(item.client.name||''):item.client)}</p></section>`:''}`;
    if(type==='service') sections=`${features.length?`<section><h2>What's Included</h2><ul>${features.map(x=>`<li>${esc(typeof x==='object'?(x.name||x.title||''):x)}</li>`).join('')}</ul></section>`:''}${item.price||item.deliveryTime||item.delivery?`<section class="facts">${item.price?`<div><b>Starting at</b><span>${esc(item.price)}</span></div>`:''}${item.deliveryTime||item.delivery?`<div><b>Delivery</b><span>${esc(item.deliveryTime||item.delivery)}</span></div>`:''}</section>`:''}`;
    if(type==='client') sections=`${item.industry?`<section><h2>Industry</h2><p>${esc(item.industry)}</p></section>`:''}${item.service||item.services?`<section><h2>Services Delivered</h2><p>${esc(item.service||item.services)}</p></section>`:''}${item.location?`<section><h2>Location</h2><p>${esc(item.location)}</p></section>`:''}${item.testimonial?`<section><h2>Client Testimonial</h2><blockquote>${esc(item.testimonial)}</blockquote></section>`:''}`;
    const tech=tags.length?`<section><h2>Technologies & Tools</h2><div class="tags">${tags.map(x=>`<span>${esc(typeof x==='object'?(x.name||x.title||''):x)}</span>`).join('')}</div></section>`:'';
    document.body.innerHTML=`<main class="seo-detail"><nav><a href="${SITE}/">[Nobin Morsalin]</a><a href="${SITE}/#contact">Start a Project →</a></nav><article><div class="kicker">${esc(type==='project'?'Featured Project':type==='service'?'Professional Service':'Client Partnership')}</div>${image?`<img class="cover" src="${esc(image)}" alt="${esc(title)}" />`:''}<h1>${esc(title)}</h1><p class="lead">${esc(description)}</p>${sections}${tech}<div class="actions">${live?`<a class="primary" href="${esc(live)}" target="_blank" rel="noopener noreferrer">${type==='client'?'Visit Website':'View Live Website'} ↗</a>`:''}${github?`<a class="secondary" href="${esc(github)}" target="_blank" rel="noopener noreferrer">View Source Code ↗</a>`:''}<a class="secondary" href="${SITE}/#contact">Work With Nobin →</a></div></article><footer>© 2026 Nobin Morsalin · Full-Stack Developer · Bangladesh</footer></main><style>
body{margin:0;background:#05090c;color:#f4f7fa;font-family:Inter,system-ui,sans-serif}.seo-detail{min-height:100vh;max-width:1000px;margin:auto;padding:24px}.seo-detail nav{display:flex;justify-content:space-between;gap:20px;padding:12px 0 50px}.seo-detail nav a,.seo-detail a{color:#00f5a0;text-decoration:none}.seo-detail article{background:rgba(13,18,24,.92);border:1px solid rgba(255,255,255,.1);border-radius:28px;padding:clamp(24px,5vw,64px);box-shadow:0 30px 80px rgba(0,0,0,.35)}.kicker{color:#00f5a0;font-family:monospace;text-transform:uppercase;letter-spacing:.12em}.seo-detail h1{font-size:clamp(42px,7vw,82px);line-height:.98;margin:18px 0}.lead{font-size:clamp(18px,2vw,23px);line-height:1.7;color:#a9b2bd;max-width:780px}.seo-detail section{margin-top:40px;padding-top:28px;border-top:1px solid rgba(255,255,255,.08)}.seo-detail section h2{font-size:24px}.seo-detail section p,.seo-detail li,.seo-detail blockquote{color:#c5ccd5;line-height:1.8}.seo-detail .cover{width:100%;max-height:480px;object-fit:cover;border-radius:20px;margin:25px 0}.tags{display:flex;flex-wrap:wrap;gap:10px}.tags span{padding:9px 14px;border:1px solid rgba(0,245,160,.25);border-radius:999px;color:#00f5a0}.facts{display:flex;flex-wrap:wrap;gap:18px}.facts div{display:flex;flex-direction:column;gap:6px}.facts span{color:#00f5a0}.actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:42px}.actions a{padding:14px 20px;border-radius:12px;border:1px solid rgba(0,245,160,.3)}.actions .primary{background:#00f5a0;color:#06100d;font-weight:700}.seo-detail footer{text-align:center;color:#77818c;padding:40px 0}@media(max-width:600px){.seo-detail{padding:16px}.seo-detail nav{padding-bottom:28px}.seo-detail nav a:last-child{font-size:13px}.seo-detail article{border-radius:20px}.actions a{width:100%;text-align:center;box-sizing:border-box}}
</style>`;
    setSEO(`${title} | Nobin Morsalin`,description,canonicalUrl,image,{"@context":"https://schema.org","@type":type==='service'?'Service':type==='project'?'CreativeWork':'Organization',"name":title,"description":description,"url":canonicalUrl,...(image?{image}:{}),...(type==='service'?{"provider":{"@type":"Person","name":"Nobin Morsalin","url":SITE}}:{}),...(type==='project'?{"creator":{"@type":"Person","name":"Nobin Morsalin","url":SITE}}:{}),...(type==='client'?{"member":{"@type":"Person","name":"Nobin Morsalin","url":SITE}}:{})});
  }

  function homepageSEO() {
    const settings=get('settings')||{}; const about=get('about')||{};
    const name=settings.name||'Nobin Morsalin';
    const desc=`${name} is a Full-Stack Developer from Bangladesh specializing in web development, UI/UX, Node.js, Laravel, APIs, webhooks, automation and complete digital systems.`;
    setSEO(`${name} — Full-Stack Developer | Web Development, APIs & Automation`,desc,SITE+'/',safeUrl(settings.profileImage||settings.image||'') ,{"@context":"https://schema.org","@type":"ProfilePage","mainEntity":{"@type":"Person","@id":`${SITE}/#person`,"name":name,"alternateName":"Nobin Morsalin","description":String(about.bio1||desc).slice(0,300),"url":SITE+'/',"jobTitle":"Full-Stack Developer","address":{"@type":"PostalAddress","addressCountry":"BD"},"sameAs":[settings.linkedin,settings.github].filter(Boolean)},"isPartOf":{"@type":"WebSite","name":name+' Portfolio',"url":SITE+'/'}});
  }

  async function run() {
    try { if(window.__portfolioInitialLoad) await window.__portfolioInitialLoad; } catch (_) {}
    const parts=location.pathname.split('/').filter(Boolean);
    if(parts.length===2 && ['projects','services','clients'].includes(parts[0])) {
      const type=parts[0]==='projects'?'project':parts[0]==='services'?'service':'client';
      const item=findBySlug(type,parts[1]);
      if(item) return renderDetail(item,type,parts[1]);
    }
    homepageSEO();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',run); else run();
})();
