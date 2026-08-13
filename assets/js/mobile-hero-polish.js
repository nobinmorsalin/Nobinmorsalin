/* Mobile Hero Polish — continuous typing + replayable stats */
(function(){
  'use strict';

  function addStyles(){
    if(document.getElementById('mobile-hero-polish-css')) return;
    var style=document.createElement('style');
    style.id='mobile-hero-polish-css';
    style.textContent=`
      .hero-sub.hero-typing{position:relative;min-height:3.7em;padding-left:14px;border-left:2px solid rgba(0,245,160,.35);display:flex;align-items:flex-start}
      .hero-sub.hero-typing::before{content:'>';position:absolute;left:-7px;top:0;color:var(--accent);font-family:var(--font-mono);font-size:.8em;background:var(--bg);padding:0 3px}
      .hero-typing-text{display:block;min-height:1.7em}
      .hero-typing-cursor{display:inline-block;width:7px;height:1.05em;margin-left:3px;vertical-align:-.18em;background:var(--accent);animation:hero-type-cursor .72s steps(1,end) infinite}
      @keyframes hero-type-cursor{50%{opacity:0}}
      .hero-stats .stat{position:relative;min-width:72px;padding:10px 12px;border:1px solid rgba(255,255,255,.07);border-radius:16px;background:linear-gradient(145deg,rgba(255,255,255,.035),rgba(255,255,255,.012));box-shadow:inset 0 1px 0 rgba(255,255,255,.05);transition:transform .35s ease,border-color .35s ease,box-shadow .35s ease}
      .hero-stats .stat.stat-counting{transform:translateY(-4px);border-color:rgba(0,245,160,.3);box-shadow:0 10px 28px rgba(0,245,160,.08),inset 0 1px 0 rgba(255,255,255,.07)}
      .hero-stats .stat-num{font-variant-numeric:tabular-nums;letter-spacing:-.04em}
      @media(max-width:680px){
        .hero-content{display:flex;flex-direction:column;align-items:stretch}
        .hero-eyebrow{align-self:flex-start;margin-bottom:18px}
        .hero-title{font-size:clamp(2.35rem,11.2vw,3.55rem);letter-spacing:-.045em;text-wrap:balance;margin-bottom:20px}
        .hero-title .title-accent{display:inline-block;filter:drop-shadow(0 0 18px rgba(0,245,160,.08))}
        .hero-typing{font-size:.86rem!important;line-height:1.75!important;margin-bottom:30px!important;color:#a8b2bd!important}
        .hero-actions{margin-bottom:30px!important}
        .hero-actions .btn{min-height:52px;border-radius:15px}
        .hero-stats{gap:8px!important;align-items:stretch}
        .hero-stats .stat{flex:1;min-width:0;padding:11px 6px 10px;border-radius:15px}
        .hero-stats .stat-num{font-size:1.5rem}
        .hero-stats .stat-label{font-size:.61rem;letter-spacing:.08em}
        .hero-stats .stat-divider{height:auto;width:0;border:0}
        .code-card{box-shadow:0 18px 45px rgba(0,0,0,.42),0 0 34px rgba(0,245,160,.05),inset 0 1px 0 rgba(255,255,255,.06)}
      }
      @media(max-width:390px){.hero-title{font-size:2.2rem}.hero-typing{font-size:.8rem!important}.hero-stats .stat-num{font-size:1.35rem}.hero-stats .stat-label{font-size:.57rem}}
      @media(prefers-reduced-motion:reduce){.hero-typing-cursor{animation:none}.hero-stats .stat{transition:none}}
    `;
    document.head.appendChild(style);
  }

  function setupTyping(){
    var el=document.querySelector('.hero-sub');
    if(!el || el.dataset.heroTyping==='1') return;
    el.dataset.heroTyping='1';
    el.classList.add('hero-typing');
    var original=el.textContent.trim();
    var phrases=[
      'Web Development · UI/UX Design · API Integration',
      'Node.js · Laravel · JavaScript · REST APIs',
      'Webhooks · Automation · Server Architecture',
      'End-to-End Digital Systems That Work.'
    ];
    if(original && phrases.indexOf(original)<0) phrases.unshift(original);
    el.innerHTML='<span class="hero-typing-text"></span><span class="hero-typing-cursor" aria-hidden="true"></span>';
    var target=el.querySelector('.hero-typing-text');
    var index=0,char=0,deleting=false;
    var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(reduce){target.textContent=phrases[0];return;}
    function tick(){
      var phrase=phrases[index];
      if(!deleting){
        char++;target.textContent=phrase.slice(0,char);
        if(char>=phrase.length){deleting=true;setTimeout(tick,1700);return;}
        setTimeout(tick,42);
      }else{
        char--;target.textContent=phrase.slice(0,char);
        if(char<=0){deleting=false;index=(index+1)%phrases.length;setTimeout(tick,300);return;}
        setTimeout(tick,24);
      }
    }
    tick();
  }

  function setupStats(){
    var stats=document.querySelector('.hero-stats');
    if(!stats || stats.dataset.replayStats==='1') return;
    stats.dataset.replayStats='1';
    var items=[
      stats.querySelector('#stat-projects .stat-num'),
      stats.querySelector('#stat-services .stat-num'),
      stats.querySelector('#stat-clients .stat-num')
    ];
    if(items.some(function(x){return !x;})) return;
    var values=items.map(function(el){
      var n=parseInt((el.textContent||'').replace(/[^0-9]/g,''),10);
      return Number.isFinite(n)?n:0;
    });
    var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var running=false;
    function setValue(el,value){el.textContent=value+'+';}
    function reset(){
      if(running)return;
      items.forEach(function(el){setValue(el,0);var s=el.closest('.stat');if(s)s.classList.remove('stat-counting');});
    }
    function animate(){
      if(running)return;
      running=true;
      var start=performance.now(),duration=1100;
      items.forEach(function(el){var s=el.closest('.stat');if(s)s.classList.add('stat-counting');});
      if(reduce){
        items.forEach(function(el,i){setValue(el,values[i]);var s=el.closest('.stat');if(s)s.classList.remove('stat-counting');});
        running=false;return;
      }
      function frame(now){
        var p=Math.min(1,(now-start)/duration);
        var eased=1-Math.pow(1-p,3);
        items.forEach(function(el,i){setValue(el,Math.floor(values[i]*eased));});
        if(p<1){requestAnimationFrame(frame);}else{
          items.forEach(function(el,i){setValue(el,values[i]);var s=el.closest('.stat');if(s)s.classList.remove('stat-counting');});
          running=false;
        }
      }
      requestAnimationFrame(frame);
    }
    reset();
    if('IntersectionObserver' in window){
      var observer=new IntersectionObserver(function(entries){
        entries.forEach(function(entry){if(entry.isIntersecting)animate();else reset();});
      },{threshold:.55});
      observer.observe(stats);
    }else animate();
  }

  function init(){addStyles();setupTyping();setupStats();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(init,80);});
  else setTimeout(init,80);
})();
