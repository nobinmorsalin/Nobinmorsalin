/* =========================================================
   AUTOMATIC SEO — database-driven detail pages + structured data
   Kept separate from portfolio-details so client presentation changes
   cannot accidentally remove the SEO layer.
   ========================================================= */
(function () {
  'use strict';
  const SITE = 'https://nobinmorsalin.vercel.app';
  const esc = (v) => String(v ?? '').replace(/[&<>\"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[c]));
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
    return String(item.description||item.service||item.shortDescription||`Client work and digital solutions delivered by Nobin Morsalin.`).replace(/\s+/g,' ').trim().slice(0,300);
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
    const clientServices=Array.isArray(item.services)?item.services.filter(Boolean):String(item.service||'').split(',').map(x=>x.trim()).filter(Boolean);
    let sections='';
    if(type==='project') sections=`${item.challenge||item.idea?`<section><h2>Project Challenge</h2><p>${esc(item.challenge||item.idea)}</p></section>`:''}${item.solution?`<section><h2>Solution</h2><p>${esc(item.solution)}</p></section>`:''}${item.client?`<section><h2>Client</h2><p>${esc(typeof item.client==='object'?(item.client.name||''):item.client)}</p></section>`:''}`;
    if(type==='service') sections=`${features.length?`<section><h2>What's Included</h2><ul>${features.map(x=>`<li>${esc(typeof x==='object'?(x.name||x.title||''):x)}</li>`).join('')}</ul></section>`:''}${item.price||item.deliveryTime||item.delivery?`<section class="facts">${item.price?`<div><b>Starting at</b><span>${esc(item.price)}</span></div>`:''}${item.deliveryTime||item.delivery?`<div><b>Delivery</b><span>${esc(item.deliveryTime||item.delivery)}</span></div>`:''}</section>`:''}`;
    if(type==='client') sections=`${item.description?`<section><h2>About This Work</h2><p>${esc(item.description)}</p></section>`:''}${clientServices.length?`<section><h2>Services Delivered</h2><ul>${clientServices.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></section>`:''}${item.industry?`<section><h2>Industry</h2><p>${esc(item.industry)}</p></section>`:''}${item.location?`<section><h2>Location</h2><p>${esc(item.location)}</p></section>`:''}${item.testimonial?`<section><h2>Client Testimonial</h2><blockquote>${esc(item.testimonial)}</blockquote></section>`:''}`;
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
