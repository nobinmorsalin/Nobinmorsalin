/* Premium client presentation layer.
 * Keeps Admin/PortfolioData as source of truth.
 * Client cards open the existing detail modal instead of navigating away.
 */
(() => {
  'use strict';

  const STYLE_ID = 'premium-client-presentation-v2';

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #clients .clients-marquee { overflow:hidden; padding:12px 0 26px; }
      #clients .client-card.premium-client-card {
        position:relative; display:flex; flex-direction:column; justify-content:space-between;
        flex:0 0 clamp(250px,24vw,310px); width:clamp(250px,24vw,310px); min-height:190px;
        padding:0; overflow:hidden; cursor:pointer; color:inherit; text-decoration:none;
        border:1px solid rgba(255,255,255,.10); border-radius:22px;
        background:radial-gradient(circle at 85% 10%,rgba(0,255,196,.09),transparent 34%),linear-gradient(145deg,rgba(18,25,31,.96),rgba(8,12,17,.96));
        box-shadow:inset 0 1px rgba(255,255,255,.045),0 18px 42px rgba(0,0,0,.18);
        transition:transform .35s ease,border-color .35s ease,box-shadow .35s ease; outline:none;
      }
      #clients .client-card.premium-client-card::after {
        content:''; position:absolute; inset:0; border-radius:inherit; pointer-events:none;
        background:linear-gradient(135deg,rgba(255,255,255,.045),transparent 38%,rgba(0,255,196,.035));
      }
      #clients .client-card.premium-client-card:hover,
      #clients .client-card.premium-client-card:focus-visible {
        transform:translateY(-5px); border-color:rgba(0,255,196,.34);
        box-shadow:0 20px 50px rgba(0,0,0,.30),0 0 24px rgba(0,255,196,.08);
      }
      #clients .client-card.premium-client-card .client-visual {
        position:relative; display:flex; align-items:center; justify-content:center;
        width:100%; height:118px; padding:24px 24px 16px; box-sizing:border-box;
      }
      #clients .client-card.premium-client-card .client-visual::before {
        content:''; position:absolute; width:110px; height:110px; border-radius:50%;
        background:radial-gradient(circle,rgba(255,255,255,.08),rgba(0,255,196,.035) 44%,transparent 70%); filter:blur(2px);
      }
      #clients .client-card.premium-client-card .client-logo {
        position:relative; z-index:1; display:block; width:100%; height:100%;
        max-width:190px; max-height:66px; object-fit:contain; object-position:center;
        filter:none !important; opacity:.98;
        mix-blend-mode:normal;
        transition:opacity .35s ease,transform .35s ease,filter .35s ease;
      }
      #clients .client-card.premium-client-card:hover .client-logo,
      #clients .client-card.premium-client-card:focus-visible .client-logo {
        filter:drop-shadow(0 8px 20px rgba(0,255,196,.12)) !important;
        opacity:1; transform:scale(1.035);
      }
      #clients .client-card.premium-client-card .client-logo-fallback {
        position:relative; z-index:1; width:60px; height:60px; display:grid; place-items:center;
        border-radius:18px; color:#fff; background:linear-gradient(145deg,rgba(255,255,255,.12),rgba(0,255,196,.08));
        border:1px solid rgba(255,255,255,.12); font:800 1.35rem/1 var(--font-head,Inter,sans-serif);
        box-shadow:0 10px 25px rgba(0,0,0,.20);
      }
      #clients .client-card.premium-client-card .client-info {
        position:relative; z-index:2; padding:18px 20px 20px; border-top:1px solid rgba(255,255,255,.07);
        background:linear-gradient(180deg,rgba(255,255,255,.018),rgba(0,0,0,.12));
      }
      #clients .client-card.premium-client-card .client-name {
        color:#f3f7f8; font:700 1.02rem/1.25 var(--font-head,Inter,sans-serif); letter-spacing:-.01em;
      }
      #clients .client-card.premium-client-card .client-service {
        margin-top:6px; color:rgba(220,230,233,.64); font:500 .78rem/1.45 var(--font-body,Inter,sans-serif);
      }
      @media(max-width:680px){
        #clients .client-card.premium-client-card{flex-basis:min(82vw,300px);width:min(82vw,300px);min-height:178px;border-radius:19px}
        #clients .client-card.premium-client-card .client-visual{height:105px;padding:20px 20px 14px}
        #clients .client-card.premium-client-card .client-logo{max-width:165px;max-height:56px}
        #clients .client-card.premium-client-card .client-info{padding:15px 16px 17px}
      }
      @media(prefers-reduced-motion:reduce){#clients .client-card.premium-client-card{transition:none}.premium-client-card .client-logo{transition:none}}
    `;
    document.head.appendChild(style);
  }

  function normalizeCards() {
    const root=document.getElementById('clientsGrid');
    if(!root) return;
    root.querySelectorAll('.client-card').forEach(card=>{
      if(card.tagName==='A'){
        const replacement=document.createElement('article');
        for(const attr of Array.from(card.attributes)) replacement.setAttribute(attr.name,attr.value);
        replacement.removeAttribute('href'); replacement.removeAttribute('target'); replacement.removeAttribute('rel');
        replacement.innerHTML=card.innerHTML; replacement.classList.add('premium-client-card');
        replacement.setAttribute('tabindex','0'); replacement.setAttribute('role','button');
        replacement.setAttribute('aria-label',`View ${replacement.querySelector('.client-name')?.textContent?.trim()||'client'} details`);
        card.replaceWith(replacement);
      } else {
        card.classList.add('premium-client-card');
        if(!card.hasAttribute('tabindex')) card.setAttribute('tabindex','0');
        if(!card.hasAttribute('role')) card.setAttribute('role','button');
      }
    });
  }

  function bind(){installStyles();normalizeCards()}
  window.addEventListener('portfolio:data-ready',()=>setTimeout(bind,0));
  window.addEventListener('load',()=>setTimeout(bind,80));
  setTimeout(bind,150); setTimeout(bind,500); setTimeout(bind,1200);
  const observer=new MutationObserver(()=>bind());
  const startObserver=()=>{const root=document.getElementById('clientsGrid');if(root)observer.observe(root,{childList:true,subtree:true})};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',startObserver,{once:true});else startObserver();
})();
