/* Visitor ↔ Admin Live Chat */
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
  let polling = null;
  let lastConversationSignature = '';
  let knownMessageIds = new Set();
  let audioContext = null;
  let audioUnlocked = false;

  function getConversationId() {
    const KEY = 'nobin_live_chat_conversation_id';
    let id = localStorage.getItem(KEY);
    if (!id) {
      id = `visitor-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
      localStorage.setItem(KEY, id);
    }
    return id;
  }

  const conversationId = getConversationId();

  /*
   * Browsers block autoplay audio until the visitor interacts with the page.
   * Opening/typing/sending in the chat unlocks a tiny Web Audio context. After
   * that, every newly received admin reply can play a short notification sound.
   */
  function unlockChatAudio() {
    try {
      if (!audioContext) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        audioContext = new AudioCtx();
      }

      if (audioContext.state === 'suspended') {
        audioContext.resume().catch(() => {});
      }

      audioUnlocked = true;
    } catch (error) {
      console.warn('CHAT AUDIO UNLOCK ERROR:', error);
    }
  }

  function playReplySound() {
    if (!audioUnlocked || !audioContext) return;

    try {
      if (audioContext.state === 'suspended') {
        audioContext.resume().catch(() => {});
      }

      const now = audioContext.currentTime;
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, now);
      oscillator.frequency.exponentialRampToValueAtTime(1320, now + 0.11);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.12, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);

      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start(now);
      oscillator.stop(now + 0.25);
    } catch (error) {
      console.warn('CHAT REPLY SOUND ERROR:', error);
    }
  }

  chatToggle?.addEventListener('click', () => {
    unlockChatAudio();

    isOpen = !isOpen;
    chatWindow?.classList.toggle('hidden', !isOpen);
    chatIcon?.classList.toggle('hidden', isOpen);
    chatClose?.classList.toggle('hidden', !isOpen);

    if (isOpen) {
      loadConversation(true);
      setTimeout(() => chatInput?.focus(), 100);
    }
  });

  chatInput?.addEventListener('focus', unlockChatAudio, { passive: true });

  async function sendMessage() {
    unlockChatAudio();

    if (sending) return;
    const text = chatInput?.value?.trim();
    if (!text) return;

    chatInput.value = '';
    sending = true;
    chatSend?.setAttribute('disabled', 'true');
    if (chatSend) chatSend.style.opacity = '0.6';

    const typingId = appendTyping();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, conversationId })
      });
      const data = await response.json().catch(() => ({}));
      removeTyping(typingId);

      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Message could not be sent.');
      }

      await loadConversation(true);
    } catch (error) {
      console.error('CHAT SEND ERROR:', error);
      removeTyping(typingId);
      appendMsg("Your message couldn't be saved right now. Please try again.", 'bot');
    } finally {
      sending = false;
      chatSend?.removeAttribute('disabled');
      if (chatSend) chatSend.style.opacity = '';
      chatInput?.focus();
    }
  }

  chatSend?.addEventListener('click', sendMessage);
  chatInput?.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  });

  function signature(messages) {
    return (messages || []).map(m => `${m.id}:${m.sender}:${m.created_at}`).join('|');
  }

  async function loadConversation(force = false) {
    try {
      const response = await fetch(`/api/messages?conversation_id=${encodeURIComponent(conversationId)}`, {
        method: 'GET',
        cache: 'no-store',
        headers: { Accept: 'application/json' }
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.ok) throw new Error(data.error || 'Unable to load conversation.');

      const messages = Array.isArray(data.messages) ? data.messages : [];
      const nextSignature = signature(messages);

      /* First load establishes the baseline — no sound for old replies. */
      if (!knownMessageIds.size) {
        messages.forEach(message => knownMessageIds.add(Number(message.id)));
      } else {
        let adminReplyReceived = false;

        messages.forEach(message => {
          const id = Number(message.id);
          if (knownMessageIds.has(id)) return;

          knownMessageIds.add(id);

          if (message.sender === 'admin') {
            adminReplyReceived = true;
          }
        });

        if (adminReplyReceived) {
          playReplySound();
        }
      }

      if (!force && nextSignature === lastConversationSignature) return;
      lastConversationSignature = nextSignature;
      renderConversation(messages);
    } catch (error) {
      console.error('CHAT LOAD ERROR:', error);
    }
  }

  function renderConversation(messages) {
    if (!chatMsgs) return;
    chatMsgs.innerHTML = '';

    messages.forEach(message => {
      if (message.sender === 'visitor') {
        appendMsg(message.message, 'user', message.created_at);
      } else if (message.sender === 'bot' || message.sender === 'admin') {
        appendMsg(message.message, 'bot', message.created_at);
      } else if (message.message) {
        appendMsg(message.message, 'user', message.created_at);
      }
    });

    chatMsgs.scrollTop = chatMsgs.scrollHeight;
  }

  function appendMsg(text, type, timestamp) {
    if (!chatMsgs) return null;
    const div = document.createElement('div');
    div.className = `chat-msg ${type}`;

    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble';
    bubble.textContent = text;

    const time = document.createElement('div');
    time.className = 'msg-time';
    const date = timestamp ? new Date(timestamp) : new Date();
    time.textContent = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    div.append(bubble, time);
    chatMsgs.appendChild(div);
    chatMsgs.scrollTop = chatMsgs.scrollHeight;
    return div;
  }

  function appendTyping() {
    if (!chatMsgs) return null;
    const id = `typing-${Date.now()}`;
    const div = document.createElement('div');
    div.className = 'chat-msg bot';
    div.id = id;
    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble';
    bubble.style.color = 'var(--text-muted)';
    bubble.style.fontStyle = 'italic';
    bubble.textContent = 'typing…';
    div.appendChild(bubble);
    chatMsgs.appendChild(div);
    chatMsgs.scrollTop = chatMsgs.scrollHeight;
    return id;
  }

  function removeTyping(id) {
    if (id) document.getElementById(id)?.remove();
  }

  function startPolling() {
    if (polling) clearInterval(polling);
    polling = setInterval(() => {
      if (!document.hidden && isOpen && !sending) loadConversation(false);
    }, 1000);
  }

  startPolling();
});
