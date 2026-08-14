/* Admin Live Chat Reply Composer v1.0.0
 * Additive UI: uses the existing /api/messages reply action and never replaces
 * the existing message renderer or live refresh logic.
 */
(() => {
  'use strict';

  const STYLE_ID = 'admin-live-chat-reply-style-v1';
  const processed = new WeakSet();

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .live-chat-reply-box {
        margin-top: 16px;
        padding-top: 14px;
        border-top: 1px solid rgba(255,255,255,.08);
      }
      .live-chat-reply-label {
        display:block;
        margin-bottom:8px;
        color:rgba(230,237,243,.62);
        font:600 12px/1.2 Inter,system-ui,sans-serif;
      }
      .live-chat-reply-row {
        display:flex;
        gap:10px;
        align-items:flex-end;
      }
      .live-chat-reply-input {
        flex:1 1 auto;
        min-width:0;
        min-height:46px;
        max-height:150px;
        resize:vertical;
        padding:12px 14px;
        border:1px solid rgba(255,255,255,.1);
        border-radius:12px;
        background:rgba(255,255,255,.025);
        color:#e6edf3;
        font:14px/1.45 Inter,system-ui,sans-serif;
        outline:none;
        box-sizing:border-box;
      }
      .live-chat-reply-input:focus {
        border-color:rgba(0,245,160,.42);
        box-shadow:0 0 0 3px rgba(0,245,160,.07);
      }
      .live-chat-reply-input::placeholder { color:rgba(139,148,158,.65); }
      .live-chat-reply-send {
        flex:0 0 auto;
        min-height:46px;
        padding:0 18px;
        border:0;
        border-radius:12px;
        background:linear-gradient(135deg,#00f5a0,#00d9ff);
        color:#06100c;
        font:700 13px/1 Inter,system-ui,sans-serif;
        cursor:pointer;
        transition:transform .18s ease,opacity .18s ease,filter .18s ease;
      }
      .live-chat-reply-send:hover { filter:brightness(1.06); transform:translateY(-1px); }
      .live-chat-reply-send:disabled { opacity:.55; cursor:not-allowed; transform:none; }
      .live-chat-reply-status {
        min-height:18px;
        margin-top:7px;
        color:rgba(139,148,158,.72);
        font:12px/1.4 Inter,system-ui,sans-serif;
      }
      .live-chat-reply-status.success { color:#00f5a0; }
      .live-chat-reply-status.error { color:#ff7b72; }
      @media(max-width:680px) {
        .live-chat-reply-row { flex-direction:column; align-items:stretch; }
        .live-chat-reply-send { width:100%; }
      }
    `;
    document.head.appendChild(style);
  }

  function addReplyBox(card) {
    if (!card || processed.has(card) || !card.id.startsWith('msg-')) return;
    processed.add(card);

    const messageId = Number(card.id.replace('msg-', ''));
    if (!Number.isFinite(messageId) || messageId <= 0) return;

    const body = card.querySelector('.msg-admin-body');
    if (!body) return;

    const box = document.createElement('div');
    box.className = 'live-chat-reply-box';
    box.innerHTML = `
      <label class="live-chat-reply-label" for="reply-${messageId}">Reply to this visitor</label>
      <div class="live-chat-reply-row">
        <textarea
          class="live-chat-reply-input"
          id="reply-${messageId}"
          rows="2"
          maxlength="4000"
          placeholder="Write your reply…"
          autocomplete="off"
        ></textarea>
        <button class="live-chat-reply-send" type="button">Send Reply</button>
      </div>
      <div class="live-chat-reply-status" aria-live="polite"></div>
    `;

    body.insertAdjacentElement('afterend', box);

    const input = box.querySelector('.live-chat-reply-input');
    const send = box.querySelector('.live-chat-reply-send');
    const status = box.querySelector('.live-chat-reply-status');

    const setStatus = (text, type = '') => {
      status.textContent = text;
      status.className = `live-chat-reply-status${type ? ` ${type}` : ''}`;
    };

    const submit = async () => {
      const message = input.value.trim();
      if (!message || send.disabled) return;

      send.disabled = true;
      input.disabled = true;
      setStatus('Sending…');

      try {
        const response = await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'reply',
            messageId,
            message
          })
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data.ok) {
          throw new Error(data.error || `Reply failed (${response.status})`);
        }

        input.value = '';
        setStatus('✓ Reply sent', 'success');

        if (typeof window.loadMessagesFromAPI === 'function') {
          await window.loadMessagesFromAPI();
        }
        if (typeof window.renderMessagesAdmin === 'function') {
          await window.renderMessagesAdmin();
        }
        if (typeof window.renderOverview === 'function') {
          window.renderOverview();
        }
      } catch (error) {
        console.error('ADMIN LIVE CHAT REPLY ERROR:', error);
        input.disabled = false;
        send.disabled = false;
        setStatus(error.message || 'Could not send reply.', 'error');
        return;
      }

      input.disabled = false;
      send.disabled = false;
      input.focus();
    };

    send.addEventListener('click', submit);
    input.addEventListener('keydown', event => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        submit();
      }
    });
  }

  function scan() {
    installStyles();
    document.querySelectorAll('#messagesAdmin .msg-admin-card[id^="msg-"]').forEach(addReplyBox);
  }

  function init() {
    scan();
    const observer = new MutationObserver(scan);
    const target = document.getElementById('messagesAdmin') || document.body;
    observer.observe(target, { childList:true, subtree:true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once:true });
  } else {
    init();
  }
})();
