/* Premium Live Chat message-thread presentation.
 * Visual-only enhancement: does not change message data, API calls, reply/delete handlers,
 * or the existing realtime transport.
 */
(() => {
  'use strict';

  const STYLE_ID = 'admin-messages-polish-v1';
  const CARD_SELECTOR = '#messagesAdmin .msg-admin-card';

  function addStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #messagesAdmin { max-width:1180px; gap:18px; }
      #messagesAdmin .msg-admin-card {
        border-radius:22px;
        border:1px solid rgba(255,255,255,.085);
        background:linear-gradient(145deg,rgba(18,24,29,.94),rgba(8,12,16,.97));
        box-shadow:0 18px 55px rgba(0,0,0,.22), inset 0 1px 0 rgba(255,255,255,.025);
        overflow:hidden;
      }
      #messagesAdmin .msg-admin-card:hover {
        transform:translateY(-2px);
        border-color:rgba(0,245,160,.22);
        box-shadow:0 24px 65px rgba(0,0,0,.28),0 0 0 1px rgba(0,245,160,.025);
      }
      #messagesAdmin .msg-admin-header {
        min-height:68px;
        padding:14px 18px;
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:14px;
        background:linear-gradient(180deg,rgba(255,255,255,.025),rgba(255,255,255,.008));
      }
      #messagesAdmin .msg-admin-header > div:first-child { gap:10px; }
      #messagesAdmin .msg-admin-from { font-size:.98rem; letter-spacing:-.015em; }
      #messagesAdmin .msg-admin-email { display:none !important; }
      #messagesAdmin .msg-admin-time { font-family:var(--font-mono); font-size:.64rem; opacity:.65; }
      #messagesAdmin .msg-admin-subject {
        padding:15px 18px 10px;
        font-size:.76rem;
        color:var(--text-muted);
        border-top:1px solid rgba(255,255,255,.045);
      }
      #messagesAdmin .msg-admin-subject strong { color:var(--text); }
      #messagesAdmin .msg-admin-body {
        padding:8px 18px 20px;
        font-size:.9rem;
        line-height:1.72;
        color:#b8c1c9;
      }
      #messagesAdmin .chat-thread {
        display:flex;
        flex-direction:column;
        gap:10px;
        padding-top:4px;
      }
      #messagesAdmin .chat-bubble-row { display:flex; width:100%; }
      #messagesAdmin .chat-bubble-row.visitor { justify-content:flex-start; }
      #messagesAdmin .chat-bubble-row.admin { justify-content:flex-end; }
      #messagesAdmin .chat-bubble-row.auto { justify-content:center; }
      #messagesAdmin .chat-bubble {
        max-width:min(78%,760px);
        padding:11px 14px;
        border:1px solid rgba(255,255,255,.07);
        border-radius:16px 16px 16px 5px;
        background:rgba(255,255,255,.035);
        color:#d6dde3;
        box-shadow:0 7px 22px rgba(0,0,0,.12);
      }
      #messagesAdmin .admin .chat-bubble {
        border-radius:16px 16px 5px 16px;
        background:linear-gradient(135deg,rgba(0,245,160,.13),rgba(0,212,255,.07));
        border-color:rgba(0,245,160,.17);
        color:#e5fff6;
      }
      #messagesAdmin .auto .chat-bubble {
        max-width:88%;
        border-radius:13px;
        background:rgba(0,212,255,.045);
        border-color:rgba(0,212,255,.11);
        color:#9eabb5;
        font-size:.82rem;
      }
      #messagesAdmin .chat-bubble-label {
        display:block;
        margin-bottom:4px;
        font:700 .59rem/1 var(--font-mono,monospace);
        letter-spacing:.08em;
        text-transform:uppercase;
        color:rgba(0,245,160,.72);
      }
      #messagesAdmin .auto .chat-bubble-label { color:rgba(0,212,255,.62); }
      #messagesAdmin .chat-bubble-text { overflow-wrap:anywhere; white-space:pre-wrap; }
      #messagesAdmin .admin-reply-box {
        margin-top:4px !important;
        padding:16px 18px 18px !important;
        background:rgba(3,7,10,.42) !important;
      }
      #messagesAdmin .admin-reply-box textarea {
        min-height:96px !important;
        border-radius:15px !important;
        padding:13px 15px !important;
        font-size:.88rem !important;
        resize:vertical;
      }
      #messagesAdmin .admin-reply-box .action-btn {
        min-height:42px;
        padding:10px 18px;
        border-radius:12px;
        background:linear-gradient(135deg,rgba(0,245,160,.16),rgba(0,212,255,.11));
        border-color:rgba(0,245,160,.25);
      }
      #messagesAdmin .msg-admin-header .action-btn { border-radius:10px; }
      #messagesAdmin .msg-admin-header .action-btn.delete { opacity:.7; }
      #messagesAdmin .msg-admin-header .action-btn.delete:hover { opacity:1; }
      @media(max-width:768px){
        #messagesAdmin { gap:13px; }
        #messagesAdmin .msg-admin-card { border-radius:18px; }
        #messagesAdmin .msg-admin-header { padding:13px 14px; min-height:62px; }
        #messagesAdmin .msg-admin-subject { padding:13px 14px 8px; }
        #messagesAdmin .msg-admin-body { padding:7px 14px 16px; }
        #messagesAdmin .chat-bubble { max-width:88%; }
        #messagesAdmin .auto .chat-bubble { max-width:96%; }
        #messagesAdmin .admin-reply-box { padding:14px !important; }
      }
    `;
    document.head.appendChild(style);
  }

  function decodeText(text) {
    const box = document.createElement('textarea');
    box.innerHTML = text;
    return box.value;
  }

  function escapeHtml(text) {
    return String(text).replace(/[&<>\"]/g, ch => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[ch]));
  }

  function makeBubble(label, text, type) {
    return `<div class="chat-bubble-row ${type}"><div class="chat-bubble"><span class="chat-bubble-label">${label}</span><span class="chat-bubble-text">${escapeHtml(text)}</span></div></div>`;
  }

  function formatCard(card) {
    if (card.dataset.messagesPolished === '1') return;
    const body = card.querySelector('.msg-admin-body');
    if (!body) return;

    const raw = decodeText(body.innerHTML).trim();
    if (!raw) return;

    // Existing conversation records may contain a compact transcript such as:
    // [Visitor · time] hello [Auto-reply · time] thanks [Admin · time] hi
    const pattern = /\[(Visitor|Admin|Auto-reply)\s*[·•-]\s*([^\]]+)\]\s*/gi;
    const matches = [...raw.matchAll(pattern)];
    if (!matches.length) return;

    const thread = document.createElement('div');
    thread.className = 'chat-thread';
    let cursor = 0;
    matches.forEach((match, index) => {
      const text = raw.slice(match.index + match[0].length, index + 1 < matches.length ? matches[index + 1].index : raw.length).trim();
      if (!text) return;
      const kind = match[1].toLowerCase();
      const type = kind === 'visitor' ? 'visitor' : kind === 'admin' ? 'admin' : 'auto';
      const label = kind === 'visitor' ? 'Visitor' : kind === 'admin' ? 'Admin' : 'Auto reply';
      thread.insertAdjacentHTML('beforeend', makeBubble(label, text, type));
      cursor = match.index + match[0].length + text.length;
    });

    if (thread.children.length) {
      body.replaceChildren(thread);
      card.dataset.messagesPolished = '1';
    }
  }

  function formatCards() {
    addStyles();
    document.querySelectorAll(CARD_SELECTOR).forEach(formatCard);
  }

  function init() {
    formatCards();
    const target = document.getElementById('messagesAdmin');
    if (!target) return;
    const observer = new MutationObserver(() => formatCards());
    observer.observe(target, { childList:true, subtree:true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once:true });
  else init();
})();
