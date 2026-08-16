(() => {
  'use strict';

  async function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
  }

  async function registerAdminPush() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) return {ok:false,reason:'unsupported'};
    const configResponse=await fetch('/api/push-config',{cache:'no-store'});
    if(!configResponse.ok)return {ok:false,reason:'not-configured'};
    const config=await configResponse.json();
    if(!config.configured||!config.publicKey)return {ok:false,reason:'not-configured'};
    const permission=Notification.permission==='granted'?'granted':await Notification.requestPermission();
    if(permission!=='granted')return {ok:false,reason:'permission-denied'};
    const registration=await navigator.serviceWorker.register('/admin/sw.js',{scope:'/admin/'});
    await navigator.serviceWorker.ready;
    let subscription=await registration.pushManager.getSubscription();
    if(!subscription)subscription=await registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:await urlBase64ToUint8Array(config.publicKey)});
    const response=await fetch('/api/push-subscribe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({subscription:subscription.toJSON(),adminId:'default'})});
    const data=await response.json().catch(()=>({}));
    if(!response.ok)throw new Error(data.error||`push-subscribe returned HTTP ${response.status}`);
    localStorage.setItem('adminPushEnabled','1');
    localStorage.setItem('adminPushEnabledAt',new Date().toISOString());
    return {ok:true};
  }

  window.enableAdminNotifications=registerAdminPush;

  function setEnabledState(btn,status){btn.textContent='🔔 Notifications Enabled';btn.classList.add('is-enabled');btn.disabled=false;if(status){status.textContent='Push active';status.style.display='inline';}}
  function setNeedsEnableState(btn,status){btn.textContent='🔔 Enable Notifications';btn.classList.remove('is-enabled');btn.disabled=false;if(status)status.style.display='none';}

  function addButton(){
    if(document.getElementById('enablePushBtn'))return;
    const header=document.querySelector('#panel-overview .panel-header');
    if(!header)return;
    const wrap=document.createElement('div');wrap.id='pushControls';wrap.style.cssText='margin-left:auto;display:flex;align-items:center;gap:8px;position:relative;z-index:10';
    const btn=document.createElement('button');btn.id='enablePushBtn';btn.className='btn btn-primary';btn.type='button';btn.textContent='🔔 Enable Notifications';
    const status=document.createElement('span');status.id='pushStatus';status.style.cssText='font-size:.78rem;opacity:.72;display:none';
    btn.addEventListener('click',async()=>{btn.disabled=true;try{const result=await registerAdminPush();if(result.ok)setEnabledState(btn,status);else{alert(result.reason==='permission-denied'?'Notification permission was denied.':'Push notifications could not be enabled.');setNeedsEnableState(btn,status);}}catch(error){console.error('ADMIN PUSH ERROR:',error);alert(`Could not enable notifications.\n\n${error.message}`);setNeedsEnableState(btn,status);}});
    wrap.append(btn,status);header.appendChild(wrap);
    if(localStorage.getItem('adminPushEnabled')==='1'&&Notification.permission==='granted')setEnabledState(btn,status);
  }

  /* Live-chat reply UI: augment the existing Messages panel without replacing admin.js. */
  function enhanceLiveChatMessages(){
    const root=document.getElementById('messagesAdmin');
    if(!root)return;
    root.querySelectorAll('.msg-admin-card').forEach(card=>{
      if(card.dataset.liveChatEnhanced==='1')return;
      const text=card.textContent||'';
      const subject=(card.querySelector('.msg-admin-subject')?.textContent||'').toLowerCase();
      const isLive=subject.includes('live chat')||text.includes('livechat@visitor.local');
      if(!isLive)return;
      card.dataset.liveChatEnhanced='1';
      const email=card.querySelector('.msg-admin-email');
      if(email){email.textContent='💬 Live Chat';email.removeAttribute('href');email.style.color='var(--accent)';}
      const replyBox=document.createElement('div');
      replyBox.style.cssText='margin-top:14px;padding-top:14px;border-top:1px solid rgba(255,255,255,.08)';
      replyBox.innerHTML=`<div style="display:flex;gap:8px;align-items:flex-end;flex-wrap:wrap"><textarea class="admin-input live-reply-input" rows="2" placeholder="Reply to this live chat..."></textarea><button type="button" class="btn btn-primary live-reply-btn">Send Reply</button></div><div class="live-reply-status" style="font-size:.78rem;opacity:.7;margin-top:6px"></div>`;
      card.appendChild(replyBox);
      const send=replyBox.querySelector('.live-reply-btn');
      const input=replyBox.querySelector('.live-reply-input');
      const status=replyBox.querySelector('.live-reply-status');
      send.addEventListener('click',async()=>{
        const messageId=card.id.replace('msg-','');
        const message=input.value.trim();
        if(!message)return;
        send.disabled=true;status.textContent='Sending...';
        try{
          const response=await fetch('/api/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'reply',messageId:Number(messageId),message})});
          const data=await response.json().catch(()=>({}));
          if(!response.ok||!data.ok)throw new Error(data.error||'Reply failed');
          input.value='';status.textContent='✓ Reply saved to this conversation';
        }catch(error){console.error('LIVE CHAT REPLY ERROR:',error);status.textContent=`✕ ${error.message}`;}
        finally{send.disabled=false;}
      });
    });
  }

  function observeMessages(){
    const root=document.getElementById('messagesAdmin');
    if(!root)return;
    const observer=new MutationObserver(()=>enhanceLiveChatMessages());
    observer.observe(root,{childList:true,subtree:true});
    enhanceLiveChatMessages();
  }

  function init(){
    addButton();
    observeMessages();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();

/* Production admin session + navigation state fixes. */
(() => {
  'use strict';

  const SESSION_KEY = 'portfolio_admin_session';
  const SESSION_TTL = 7 * 24 * 60 * 60 * 1000;
  const ROUTES = new Set(['overview','services','projects','clients','skills','workflow','messages','settings']);

  function createSession() {
    const token = `${Date.now()}_${window.crypto?.randomUUID?.() || Math.random().toString(36).slice(2)}`;
    localStorage.setItem(SESSION_KEY, JSON.stringify({ token, expiresAt: Date.now() + SESSION_TTL }));
    try { sessionStorage.setItem(SESSION_KEY, token); } catch (_) {}
  }

  if (window.AUTH) {
    const originalLogin = window.AUTH.login.bind(window.AUTH);
    const originalLogout = window.AUTH.logout.bind(window.AUTH);

    window.AUTH.login = (username, password) => {
      const ok = originalLogin(username, password);
      if (ok) createSession();
      return ok;
    };

    window.AUTH.check = () => {
      try {
        const raw = localStorage.getItem(SESSION_KEY);
        if (raw) {
          const session = JSON.parse(raw);
          if (session?.token && Number(session.expiresAt) > Date.now()) return true;
          localStorage.removeItem(SESSION_KEY);
        }
      } catch (_) {
        localStorage.removeItem(SESSION_KEY);
      }
      try { return Boolean(sessionStorage.getItem(SESSION_KEY)); } catch (_) { return false; }
    };

    window.AUTH.logout = () => {
      localStorage.removeItem(SESSION_KEY);
      originalLogout();
    };
  }

  function currentRoute() {
    const value = String(location.hash || '').replace(/^#/, '').split('?')[0];
    return ROUTES.has(value) ? value : 'overview';
  }

  function writeRoute(route, replace = false) {
    const target = ROUTES.has(route) ? route : 'overview';
    const hash = `#${target}`;
    if (location.hash === hash) return;
    if (replace) history.replaceState(null, '', hash);
    else history.pushState(null, '', hash);
  }

  function activateRoute(route) {
    const button = Array.from(document.querySelectorAll('.sidebar .sb-btn'))
      .find(item => item.dataset.panel === route);
    if (button && !button.classList.contains('active')) button.click();
  }

  function setupNavigationState() {
    document.querySelectorAll('.sidebar .sb-btn').forEach(button => {
      if (button.dataset.routeStateBound === '1') return;
      button.dataset.routeStateBound = '1';
      button.addEventListener('click', () => writeRoute(button.dataset.panel));
    });

    const route = currentRoute();
    if (!location.hash) writeRoute(route, true);
    window.setTimeout(() => activateRoute(route), 0);
    window.addEventListener('hashchange', () => activateRoute(currentRoute()));
  }

  function showPushOnboarding() {
    if (!('Notification' in window) || !('PushManager' in window) || !('serviceWorker' in navigator)) return;
    if (Notification.permission !== 'default') return;
    if (localStorage.getItem('adminPushOnboardingSeen') === '1') return;
    const wrap = document.getElementById('adminWrap');
    const host = document.querySelector('#panel-overview .panel-header');
    if (!wrap || wrap.classList.contains('hidden') || !host || document.getElementById('pushOnboarding')) return;

    const box = document.createElement('div');
    box.id = 'pushOnboarding';
    box.style.cssText = 'margin-top:14px;padding:12px 14px;border:1px solid rgba(0,245,160,.18);border-radius:12px;background:rgba(0,245,160,.04);display:flex;align-items:center;gap:12px;flex-wrap:wrap';
    box.innerHTML = '<div style="flex:1;min-width:220px"><strong>New live-chat notifications</strong><div style="font-size:.82rem;opacity:.72;margin-top:3px">Enable device notifications to be alerted when visitors send new live-chat messages.</div></div><button type="button" class="btn btn-primary" id="pushOnboardingEnable">Enable Notifications</button><button type="button" class="btn btn-ghost" id="pushOnboardingLater">Later</button>';
    host.parentNode.insertBefore(box, host.nextSibling);

    box.querySelector('#pushOnboardingEnable').addEventListener('click', async () => {
      const button = box.querySelector('#pushOnboardingEnable');
      button.disabled = true;
      try {
        const result = await window.enableAdminNotifications?.();
        if (result?.ok) box.remove();
        else button.disabled = false;
      } catch (error) {
        console.error('PUSH ONBOARDING ERROR:', error);
        button.disabled = false;
      }
      localStorage.setItem('adminPushOnboardingSeen', '1');
    });

    box.querySelector('#pushOnboardingLater').addEventListener('click', () => {
      localStorage.setItem('adminPushOnboardingSeen', '1');
      box.remove();
    });
  }

  async function syncGrantedPush() {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    try {
      const result = await window.enableAdminNotifications?.();
      if (!result?.ok) console.warn('Granted push permission is not synchronized:', result?.reason);
    } catch (error) {
      console.warn('Push subscription synchronization failed:', error);
    }
  }

  function init() {
    setupNavigationState();
    window.setTimeout(() => {
      if ('Notification' in window && Notification.permission === 'granted') syncGrantedPush();
      else showPushOnboarding();
    }, 500);
  }

  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
