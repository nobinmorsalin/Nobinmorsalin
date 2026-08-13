(() => {
  'use strict';

  async function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
  }

  async function registerAdminPush() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
      return { ok:false, reason:'unsupported' };
    }
    const configResponse = await fetch('/api/push-config', { cache:'no-store' });
    if (!configResponse.ok) return { ok:false, reason:'not-configured', detail:`push-config HTTP ${configResponse.status}` };
    const config = await configResponse.json();
    if (!config.configured || !config.publicKey) return { ok:false, reason:'not-configured' };

    const permission = Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission();
    if (permission !== 'granted') return { ok:false, reason:'permission-denied' };

    const registration = await navigator.serviceWorker.register('/admin/sw.js', { scope:'/admin/' });
    await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly:true,
        applicationServerKey:await urlBase64ToUint8Array(config.publicKey)
      });
    }

    const response = await fetch('/api/push-subscribe', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({ subscription:subscription.toJSON(), adminId:'default' })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || `push-subscribe returned HTTP ${response.status}`);
    }

    localStorage.setItem('adminPushEnabled','1');
    localStorage.setItem('adminPushEnabledAt', new Date().toISOString());
    return { ok:true };
  }

  window.enableAdminNotifications = registerAdminPush;

  function setEnabledState(btn, status) {
    btn.textContent = '🔔 Notifications Enabled';
    btn.classList.add('is-enabled');
    btn.disabled = false;
    if (status) {
      status.textContent = 'Push active';
      status.style.display = 'inline';
    }
  }

  function setNeedsEnableState(btn, status) {
    btn.textContent = '🔔 Enable Notifications';
    btn.classList.remove('is-enabled');
    btn.disabled = false;
    if (status) status.style.display = 'none';
  }

  function addButton() {
    if (document.getElementById('enablePushBtn')) return;
    const header = document.querySelector('#panel-overview .panel-header');
    if (!header) return;

    const wrap = document.createElement('div');
    wrap.id = 'pushControls';
    wrap.style.cssText = 'margin-left:auto;display:flex;align-items:center;gap:8px;position:relative;z-index:10';

    const btn = document.createElement('button');
    btn.id = 'enablePushBtn';
    btn.className = 'btn btn-primary';
    btn.type = 'button';
    btn.textContent = '🔔 Enable Notifications';

    const status = document.createElement('span');
    status.id = 'pushStatus';
    status.style.cssText = 'font-size:.78rem;opacity:.72;display:none';

    btn.addEventListener('click', async () => {
      btn.disabled = true;
      try {
        const result = await registerAdminPush();
        if (result.ok) {
          setEnabledState(btn, status);
        } else if (result.reason === 'permission-denied') {
          alert('Notification permission was denied. Please allow notifications for this site in browser settings.');
          setNeedsEnableState(btn, status);
        } else if (result.reason === 'not-configured') {
          alert(result.detail || 'Push notifications are not configured. Check Vercel environment variables and redeploy.');
          setNeedsEnableState(btn, status);
        } else {
          alert('This browser does not support push notifications.');
          setNeedsEnableState(btn, status);
        }
      } catch (error) {
        console.error('ADMIN PUSH ERROR:', error);
        alert(`Could not enable notifications.\n\n${error.message}`);
        setNeedsEnableState(btn, status);
      }
    });

    wrap.append(btn, status);
    header.appendChild(wrap);

    /* Keep the UI state after reload on the same admin origin. */
    if (localStorage.getItem('adminPushEnabled') === '1' && Notification.permission === 'granted') {
      setEnabledState(btn, status);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addButton);
  } else {
    addButton();
  }
})();
