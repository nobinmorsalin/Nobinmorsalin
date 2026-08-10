/* ═══════════════════════════════════════════════
   CHAT WIDGET — Live Chat
   Sends visitor messages to /api/chat
   which saves them to Neon DB.
   ═══════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  const chatToggle = document.getElementById('chatToggle');
  const chatWindow = document.getElementById('chatWindow');

  const chatIcon = chatToggle?.querySelector('.chat-icon');
  const chatClose = chatToggle?.querySelector('.chat-close');

  const chatInput = document.getElementById('chatInput');
  const chatSend = document.getElementById('chatSend');
  const chatMsgs = document.getElementById('chatMessages');

  let isOpen = false;
  let sending = false;

  /* ─────────────────────────────
     OPEN / CLOSE CHAT
  ───────────────────────────── */

  chatToggle?.addEventListener('click', () => {

    isOpen = !isOpen;

    chatWindow?.classList.toggle(
      'hidden',
      !isOpen
    );

    chatIcon?.classList.toggle(
      'hidden',
      isOpen
    );

    chatClose?.classList.toggle(
      'hidden',
      !isOpen
    );

    if (isOpen) {
      setTimeout(() => {
        chatInput?.focus();
      }, 100);
    }
  });


  /* ─────────────────────────────
     SEND MESSAGE
  ───────────────────────────── */

  async function sendMessage() {

    if (sending) return;

    const text = chatInput?.value?.trim();

    if (!text) return;

    /* Show visitor message immediately */
    appendMsg(text, 'user');

    /* Clear input */
    chatInput.value = '';

    /* Disable send while processing */
    sending = true;

    if (chatSend) {
      chatSend.disabled = true;
      chatSend.style.opacity = '0.6';
    }

    /* Typing indicator */
    const typingId = appendTyping();

    try {

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: text
        })
      });

      const data = await response.json();

      removeTyping(typingId);

      if (!response.ok || !data.ok) {

        throw new Error(
          data.error || 'Message could not be sent.'
        );
      }

      /* Auto reply */
      appendMsg(
        data.reply ||
        "Thanks for your message! I'll get back to you soon.",
        'bot'
      );

    } catch (error) {

      console.error('CHAT SEND ERROR:', error);

      removeTyping(typingId);

      appendMsg(
        "Your message couldn't be saved right now. Please try again.",
        'bot'
      );

    } finally {

      sending = false;

      if (chatSend) {
        chatSend.disabled = false;
        chatSend.style.opacity = '';
      }

      chatInput?.focus();
    }
  }


  /* ─────────────────────────────
     SEND BUTTON
  ───────────────────────────── */

  chatSend?.addEventListener(
    'click',
    sendMessage
  );


  /* ─────────────────────────────
     ENTER KEY
  ───────────────────────────── */

  chatInput?.addEventListener(
    'keydown',
    event => {

      if (
        event.key === 'Enter' &&
        !event.shiftKey
      ) {
        event.preventDefault();
        sendMessage();
      }

    }
  );


  /* ─────────────────────────────
     ADD MESSAGE TO UI
  ───────────────────────────── */

  function appendMsg(text, type) {

    if (!chatMsgs) return null;

    const now =
      new Date().toLocaleTimeString(
        [],
        {
          hour: '2-digit',
          minute: '2-digit'
        }
      );

    const div =
      document.createElement('div');

    div.className =
      `chat-msg ${type}`;

    const bubble =
      document.createElement('div');

    bubble.className = 'msg-bubble';

    /*
     * textContent prevents HTML injection.
     */
    bubble.textContent = text;

    const time =
      document.createElement('div');

    time.className = 'msg-time';
    time.textContent = now;

    div.appendChild(bubble);
    div.appendChild(time);

    chatMsgs.appendChild(div);

    chatMsgs.scrollTop =
      chatMsgs.scrollHeight;

    return div;
  }


  /* ─────────────────────────────
     TYPING INDICATOR
  ───────────────────────────── */

  function appendTyping() {

    if (!chatMsgs) return null;

    const id =
      'typing-' + Date.now();

    const div =
      document.createElement('div');

    div.className = 'chat-msg bot';
    div.id = id;

    div.innerHTML =
      `<div class="msg-bubble"
        style="color:var(--text-muted);font-style:italic">
        typing…
      </div>`;

    chatMsgs.appendChild(div);

    chatMsgs.scrollTop =
      chatMsgs.scrollHeight;

    return id;
  }


  /* ─────────────────────────────
     REMOVE TYPING
  ───────────────────────────── */

  function removeTyping(id) {

    if (!id) return;

    document
      .getElementById(id)
      ?.remove();
  }

});
