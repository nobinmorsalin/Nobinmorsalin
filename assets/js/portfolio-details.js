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
    const s=document.createElement('style');s.id='portfolio-details-mobile-fix';s.textContent=`body.details-modal-open{overflow:hidden}.portfolio-details-dialog{-webkit-overflow-scrolling:touch;overscroll-behavior:contain}.details-client-hero{align-items:center}.details-client-image{width:160px;height:120px;object-fit:contain;object-position:center;background:rgba(255,255,255,.025);border-radius:16px;padding:14px;box-sizing:border-box}.client-card{cursor:pointer}.client-card .client-visual{height:120px;min-height:120px;display:flex;align-items:center;justify-content:center;padding:18px;box-sizing:border-box;overflow:hidden}.client-card .client-visual img{width:100%;height:100%;max-width:180px;object-fit:contain;object-position:center;display:block}.clients-track{touch-action:pan-y;will-change:transform}@media(max-width:600px){.client-card .client-visual{height:105px;min-height:105px;padding:14px}.client-card .client-visual img{max-width:150px}.details-client-image{width:120px;height:95px}}`;document.head.appendChild(s);
  }
  document.addEventListener('keydown',(e)=>{if(e.key==='Escape')close();});
  window.addEventListener('portfolio:data-ready',()=>setTimeout(bind,0));
  window.addEventListener('load',()=>setTimeout(bind,100));
  premiumCSS(); bind(); setTimeout(bind,300); setTimeout(bind,1000); setTimeout(bind,2000);
})();
