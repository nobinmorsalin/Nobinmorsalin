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
      const body=card.querySelector('.msg-admin-body');
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
