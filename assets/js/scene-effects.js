/* NOBIN PORTFOLIO — 3D ambient background + subtle interaction sounds + navigation compatibility */
(function(){
  'use strict';
  function injectStyles(){
    if(document.getElementById('scene-effects-css'))return;
    var s=document.createElement('style');s.id='scene-effects-css';
    s.textContent=`
      #scene3d{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden;isolation:isolate;--mx:0px;--my:0px;background:radial-gradient(circle at 50% 8%,rgba(0,245,160,.055),transparent 32%),linear-gradient(180deg,rgba(3,7,10,.72),rgba(3,7,10,.97))}
      .nav,.hero,.section,.footer{position:relative;z-index:1}
      .live-chat{position:fixed!important;right:28px;bottom:28px;z-index:10000!important}
      .scene-grid{position:absolute;left:-20%;width:140%;height:70%;bottom:-20%;transform:perspective(700px) rotateX(62deg) translate3d(var(--mx),var(--my),0);transform-origin:center bottom;background-image:linear-gradient(rgba(0,245,160,.085) 1px,transparent 1px),linear-gradient(90deg,rgba(0,245,160,.085) 1px,transparent 1px);background-size:58px 58px;mask-image:linear-gradient(to top,rgba(0,0,0,.95),transparent 88%);animation:scene-grid-drift 18s linear infinite}
      .scene-grid-b{bottom:-34%;opacity:.35;filter:blur(.4px);background-size:92px 92px;animation-duration:28s}
      .scene-orb{position:absolute;border-radius:50%;filter:blur(38px);opacity:.28;transform:translate3d(var(--mx),var(--my),0);will-change:transform}
      .scene-orb-a{width:420px;height:420px;left:-120px;top:18%;background:radial-gradient(circle,rgba(0,245,160,.24),transparent 68%);animation:scene-orb-a 12s ease-in-out infinite}
      .scene-orb-b{width:520px;height:520px;right:-160px;top:8%;background:radial-gradient(circle,rgba(0,212,255,.18),transparent 70%);animation:scene-orb-b 16s ease-in-out infinite}
      .scene-orb-c{width:340px;height:340px;left:38%;bottom:2%;background:radial-gradient(circle,rgba(124,92,255,.14),transparent 70%);animation:scene-orb-c 14s ease-in-out infinite}
      .scene-stars{position:absolute;inset:0;opacity:.28;background-image:radial-gradient(circle at 12% 22%,rgba(255,255,255,.9) 0 1px,transparent 1.5px),radial-gradient(circle at 74% 18%,rgba(0,245,160,.9) 0 1px,transparent 1.5px),radial-gradient(circle at 47% 68%,rgba(0,212,255,.75) 0 1px,transparent 1.5px),radial-gradient(circle at 88% 76%,rgba(255,255,255,.7) 0 1px,transparent 1.5px);background-size:240px 240px,300px 300px,420px 420px,520px 520px;animation:scene-stars-drift 22s linear infinite}
      .hero .container{isolation:isolate}.hero-visual,.code-card{position:relative;z-index:2}.code-card{box-shadow:0 24px 70px rgba(0,0,0,.38),0 0 60px rgba(0,245,160,.06),inset 0 1px 0 rgba(255,255,255,.06)}
      /* main.js uses .active while the responsive stylesheet uses .open; support both */
      @media(max-width:680px){.nav-links.active{display:flex;flex-direction:column;position:fixed;inset:0;background:rgba(8,12,16,.97);backdrop-filter:blur(20px);z-index:99;align-items:center;justify-content:center;gap:20px;padding:40px}.nav-links.active a{font-size:1.25rem}.nav-toggle.active{position:relative;z-index:101}.nav-toggle.active span:nth-child(1){transform:translateY(7px) rotate(45deg)}.nav-toggle.active span:nth-child(2){opacity:0}.nav-toggle.active span:nth-child(3){transform:translateY(-7px) rotate(-45deg)}}
      @keyframes scene-grid-drift{from{background-position:0 0,0 0}to{background-position:0 58px,58px 0}}
      @keyframes scene-stars-drift{from{transform:translate3d(0,0,0)}to{transform:translate3d(0,-40px,0)}}
      @keyframes scene-orb-a{50%{transform:translate3d(calc(var(--mx) + 28px),calc(var(--my) - 22px),0)}}
      @keyframes scene-orb-b{50%{transform:translate3d(calc(var(--mx) - 34px),calc(var(--my) + 26px),0)}}
      @keyframes scene-orb-c{50%{transform:translate3d(calc(var(--mx) + 18px),calc(var(--my) + 20px),0)}}
      @media(max-width:680px){#scene3d{background:radial-gradient(circle at 70% 12%,rgba(0,245,160,.045),transparent 34%),#05090c}.scene-grid{left:-70%;width:240%;height:62%;bottom:-14%;background-size:42px 42px;opacity:.65}.scene-grid-b{background-size:74px 74px;opacity:.22}.scene-orb{filter:blur(48px);opacity:.2}.scene-orb-a{width:250px;height:250px;left:-100px;top:25%}.scene-orb-b{width:300px;height:300px;right:-120px;top:8%}.scene-orb-c{width:220px;height:220px;left:30%;bottom:6%}.scene-stars{opacity:.20}.live-chat{right:16px!important;bottom:16px!important}}
      @media(prefers-reduced-motion:reduce){#scene3d .scene-grid,#scene3d .scene-stars,#scene3d .scene-orb{animation:none}#scene3d{--mx:0px;--my:0px}}
    `;
    document.head.appendChild(s);
  }
  function init(){
    injectStyles();
    if(document.getElementById('scene3d')) return;
    var scene=document.createElement('div');scene.id='scene3d';scene.setAttribute('aria-hidden','true');
    scene.innerHTML='<div class="scene-grid scene-grid-a"></div><div class="scene-grid scene-grid-b"></div><div class="scene-orb scene-orb-a"></div><div class="scene-orb scene-orb-b"></div><div class="scene-orb scene-orb-c"></div><div class="scene-stars"></div>';
    document.body.prepend(scene);
    var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(!reduce){
      var x=0,y=0,tx=0,ty=0;
      window.addEventListener('pointermove',function(e){tx=(e.clientX/window.innerWidth-.5)*10;ty=(e.clientY/window.innerHeight-.5)*8},{passive:true});
      function frame(){x+=(tx-x)*.045;y+=(ty-y)*.045;scene.style.setProperty('--mx',x.toFixed(2)+'px');scene.style.setProperty('--my',y.toFixed(2)+'px');requestAnimationFrame(frame)}
      requestAnimationFrame(frame);
    }
    /* Navigation compatibility: main.js toggles .active, while the original mobile CSS expects .open. */
    var toggle=document.getElementById('navToggle');
    var links=document.getElementById('navLinks');
    if(toggle&&links){
      toggle.addEventListener('click',function(){
        links.classList.toggle('open',links.classList.contains('active'));
      });
      links.addEventListener('click',function(e){
        if(e.target.closest('a')){links.classList.remove('open');}
      });
      window.addEventListener('resize',function(){if(window.innerWidth>680)links.classList.remove('open');},{passive:true});
    }
    var ctx=null,master=null;
    function sound(type){try{var AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;if(!ctx){ctx=new AC();master=ctx.createGain();master.gain.value=.035;master.connect(ctx.destination)}if(ctx.state==='suspended')ctx.resume();var o=ctx.createOscillator(),g=ctx.createGain(),now=ctx.currentTime;o.type=type==='nav'?'triangle':'sine';o.frequency.setValueAtTime(type==='nav'?420:560,now);o.frequency.exponentialRampToValueAtTime(type==='nav'?260:780,now+.09);g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(1,now+.008);g.gain.exponentialRampToValueAtTime(.0001,now+.11);o.connect(g);g.connect(master);o.start(now);o.stop(now+.12)}catch(_){}}
    document.addEventListener('pointerdown',function(e){var el=e.target.closest('a,button,.service-card,.project-card,.client-card');if(!el)return;sound(el.classList.contains('nav-toggle')||el.closest('.nav-links')?'nav':'ui')},{passive:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
