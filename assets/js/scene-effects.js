/* NOBIN PORTFOLIO — 3D ambient background + subtle interaction sounds */
(function(){
  'use strict';
  function init(){
    if(document.getElementById('scene3d')) return;
    var scene=document.createElement('div');
    scene.id='scene3d';
    scene.setAttribute('aria-hidden','true');
    scene.innerHTML='<div class="scene-grid scene-grid-a"></div><div class="scene-grid scene-grid-b"></div><div class="scene-orb scene-orb-a"></div><div class="scene-orb scene-orb-b"></div><div class="scene-orb scene-orb-c"></div><div class="scene-stars"></div>';
    document.body.prepend(scene);

    var reduce=window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(!reduce){
      var x=0,y=0,tx=0,ty=0;
      window.addEventListener('pointermove',function(e){
        tx=(e.clientX/window.innerWidth-.5)*10;
        ty=(e.clientY/window.innerHeight-.5)*8;
      },{passive:true});
      function frame(){x+=(tx-x)*.045;y+=(ty-y)*.045;scene.style.setProperty('--mx',x.toFixed(2)+'px');scene.style.setProperty('--my',y.toFixed(2)+'px');requestAnimationFrame(frame)}
      requestAnimationFrame(frame);
    }

    var ctx=null, master=null;
    function sound(type){
      try{
        var AC=window.AudioContext||window.webkitAudioContext;
        if(!AC) return;
        if(!ctx){ctx=new AC();master=ctx.createGain();master.gain.value=.035;master.connect(ctx.destination)}
        if(ctx.state==='suspended') ctx.resume();
        var o=ctx.createOscillator(),g=ctx.createGain();
        var now=ctx.currentTime;
        o.type=type==='nav'?'triangle':'sine';
        o.frequency.setValueAtTime(type==='nav'?420:560,now);
        o.frequency.exponentialRampToValueAtTime(type==='nav'?260:780,now+.09);
        g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(1,now+.008);g.gain.exponentialRampToValueAtTime(.0001,now+.11);
        o.connect(g);g.connect(master);o.start(now);o.stop(now+.12);
      }catch(_){ }
    }
    document.addEventListener('pointerdown',function(e){
      var el=e.target.closest('a,button,.service-card,.project-card,.client-card');
      if(!el) return;
      sound(el.classList.contains('nav-toggle')||el.closest('.nav-links')?'nav':'ui');
    },{passive:true});
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
