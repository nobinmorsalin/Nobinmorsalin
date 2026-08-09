/* ═══════════════════════════════════════════════
   CHAT WIDGET — Live message system
   ═══════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  const chatToggle  = document.getElementById('chatToggle');
  const chatWindow  = document.getElementById('chatWindow');
  const chatIcon    = chatToggle?.querySelector('.chat-icon');
  const chatClose   = chatToggle?.querySelector('.chat-close');
  const chatInput   = document.getElementById('chatInput');
  const chatSend    = document.getElementById('chatSend');
  const chatMsgs    = document.getElementById('chatMessages');

  let isOpen = false;

  /* Toggle */
  chatToggle?.addEventListener('click', () => {
    isOpen = !isOpen;
    chatWindow.classList.toggle('hidden', !isOpen);
    chatIcon.classList.toggle('hidden', isOpen);
    chatClose.classList.toggle('hidden', !isOpen);
    if (isOpen) chatInput?.focus();
  });

  /* Send message */
  async function sendMessage() {
    const text = chatInput?.value?.trim();
    if (!text) return;

    appendMsg(text, 'user');
    chatInput.value = '';

    /* Show typing indicator */
    const typingId = appendTyping();

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      removeTyping(typingId);
      appendMsg(data.reply || "Thanks for your message! I'll get back to you soon.", 'bot');
    } catch {
      removeTyping(typingId);
      appendMsg("Thanks for your message! I'll reply as soon as possible. 📧", 'bot');
    }
  }

  chatSend?.addEventListener('click', sendMessage);
  chatInput?.addEventListener('keydown', e => { if (e.key === 'Enter') sendMessage(); });

  function appendMsg(text, type) {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const div = document.createElement('div');
    div.className = `chat-msg ${type}`;
    div.innerHTML = `
      <div class="msg-bubble">${text}</div>
      <div class="msg-time">${now}</div>
    `;
    chatMsgs?.appendChild(div);
    chatMsgs.scrollTop = chatMsgs.scrollHeight;
    return div;
  }

  function appendTyping() {
    const id = 'typing-' + Date.now();
    const div = document.createElement('div');
    div.className = 'chat-msg bot';
    div.id = id;
    div.innerHTML = `<div class="msg-bubble" style="color:var(--text-muted);font-style:italic">typing…</div>`;
    chatMsgs?.appendChild(div);
    chatMsgs.scrollTop = chatMsgs.scrollHeight;
    return id;
  }

  function removeTyping(id) {
    document.getElementById(id)?.remove();
  }
});
