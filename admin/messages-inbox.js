/* Admin Messages Inbox
 * Adds a selectable conversation inbox without changing the existing API,
 * authentication, push notifications, realtime polling, reply or read handlers.
 */
(() => {
  'use strict';

  let selectedConversationId = null;

  function esc(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function getConversationKey(message) {
    return message?.conversation_id
      ? `conversation:${message.conversation_id}`
      : `message:${message?.id}`;
  }

  function getMessages() {
    if (typeof window.getMsgs === 'function') return window.getMsgs() || [];
    return [];
  }

  function isConversation(message) {
    return Boolean(message?.conversation_id);
  }

  function shortId(id) {
    const value = String(id || '');
    if (!value) return 'Message';
    return value.length > 16 ? `${value.slice(0, 8)}…${value.slice(-6)}` : value;
  }

  function preview(message) {
    const text = String(message?.message || '').replace(/\s+/g, ' ').trim();
    return text.length > 82 ? `${text.slice(0, 82)}…` : text || 'No message preview';
  }

  function displayName(message) {
    if (isConversation(message)) return message.name || 'Live Visitor';
    return message.name || message.email || 'Contact inquiry';
  }

  function renderInbox(items) {
    return `
      <aside class="messages-inbox" aria-label="Message inbox">
        <div class="messages-inbox-head">
          <div>
            <div class="messages-inbox-title">Inbox</div>
            <div class="messages-inbox-count">${items.length} conversation${items.length === 1 ? '' : 's'}</div>
          </div>
          <span class="messages-inbox-live"><i></i> Live</span>
        </div>
        <div class="messages-inbox-list">
          ${items.map((message) => {
            const key = getConversationKey(message);
            const active = key === selectedConversationId;
            const unread = !Boolean(message.is_read ?? message.read);
            const subject = String(message.subject || 'Live Chat');
            const time = message.created_at || message.time;
            const meta = isConversation(message)
              ? `${message.country_name || 'Unknown'} · ${message.message_count || 1} message${Number(message.message_count) === 1 ? '' : 's'}`
              : (message.email || 'Contact inquiry');
            return `
              <button
                type="button"
                class="message-inbox-item ${active ? 'is-active' : ''} ${unread ? 'is-unread' : ''}"
                data-message-key="${esc(key)}"
                onclick="window.selectAdminConversation('${esc(key)}')"
              >
                <span class="message-inbox-avatar">${esc((displayName(message).trim()[0] || 'M').toUpperCase())}</span>
                <span class="message-inbox-main">
                  <span class="message-inbox-row">
                    <strong>${esc(displayName(message))}</strong>
                    <time>${time ? esc(new Date(time).toLocaleString()) : ''}</time>
                  </span>
                  <span class="message-inbox-subject">${esc(subject)}</span>
                  <span class="message-inbox-preview">${esc(preview(message))}</span>
                  <span class="message-inbox-meta">${esc(meta)}${isConversation(message) ? ` · <span class="message-inbox-id">#${esc(shortId(message.conversation_id))}</span>` : ''}</span>
                </span>
                ${unread ? '<span class="message-inbox-dot" aria-label="Unread"></span>' : ''}
              </button>
            `;
          }).join('')}
        </div>
      </aside>
    `;
  }

  function renderEmptyConversation() {
    return `
      <section class="messages-conversation messages-conversation-empty">
        <div class="messages-empty-icon">✉</div>
        <h3>Select a conversation</h3>
        <p>Choose a message from your inbox to view the full conversation.</p>
      </section>
    `;
  }

  function renderConversation(message) {
    if (!message) return renderEmptyConversation();

    const id = Number(message.id);
    const read = Boolean(message.is_read ?? message.read);
    const created = message.created_at || message.time || new Date().toISOString();
    const conversation = isConversation(message);
    const title = displayName(message);
    const subtitle = conversation
      ? `${message.country_name || 'Unknown'} · ${message.message_count || 1} message${Number(message.message_count) === 1 ? '' : 's'}`
      : (message.email || 'Contact inquiry');

    return `
      <section class="messages-conversation ${read ? '' : 'conversation-unread'}" data-selected-message="${esc(getConversationKey(message))}">
        <div class="messages-conversation-head">
          <button type="button" class="messages-back-btn" onclick="window.closeAdminConversation()" aria-label="Back to inbox">← <span>Inbox</span></button>
          <div class="messages-conversation-person">
            <span class="messages-conversation-avatar">${esc((title.trim()[0] || 'M').toUpperCase())}</span>
            <div>
              <h3>${esc(title)}</h3>
              <p>${esc(subtitle)}</p>
              ${conversation ? `<small>Conversation #${esc(shortId(message.conversation_id))}</small>` : ''}
            </div>
          </div>
          <div class="messages-conversation-actions">
            <time>${esc(new Date(created).toLocaleString())}</time>
            <button
              type="button"
              class="action-btn"
              onclick="markRead(${id})"
              ${read ? 'disabled' : ''}
            >${read ? '✓ Read' : 'Mark read'}</button>
            <button type="button" class="action-btn delete" onclick="deleteMsg(${id})">🗑️</button>
          </div>
        </div>
        <div class="messages-conversation-subject">
          <strong>${esc(message.subject || (conversation ? 'Live Chat' : 'Message'))}</strong>
        </div>
        <div class="msg-admin-body messages-conversation-body">
          ${esc(message.message || '')}
        </div>
      </section>
    `;
  }

  async function renderInboxView() {
    const el = document.getElementById('messagesAdmin');
    if (!el) return;

    if (typeof window.loadMessagesFromAPI === 'function') {
      await window.loadMessagesFromAPI();
    }

    const messages = getMessages();
    if (!messages.length) {
      selectedConversationId = null;
      el.innerHTML = '<div class="no-messages">📬 No messages yet</div>';
      return;
    }

    const currentExists = messages.some(message => getConversationKey(message) === selectedConversationId);
    if (!currentExists) {
      selectedConversationId = getConversationKey(messages[0]);
    }

    const selected = messages.find(message => getConversationKey(message) === selectedConversationId) || messages[0];

    el.classList.add('messages-inbox-layout');
    el.innerHTML = `${renderInbox(messages)}${renderConversation(selected)}`;

    // Keep the existing visual polish/reply enhancements working on the selected thread.
    requestAnimationFrame(() => {
      document.dispatchEvent(new CustomEvent('admin:messages-rendered'));
    });
  }

  window.selectAdminConversation = (key) => {
    selectedConversationId = key;
    const messages = getMessages();
    const selected = messages.find(message => getConversationKey(message) === key);
    if (!selected) return;

    const el = document.getElementById('messagesAdmin');
    if (!el) return;
    el.classList.add('messages-inbox-layout');
    el.innerHTML = `${renderInbox(messages)}${renderConversation(selected)}`;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 90, behavior: 'smooth' });
    document.dispatchEvent(new CustomEvent('admin:messages-rendered'));
  };

  window.closeAdminConversation = () => {
    selectedConversationId = null;
    const messages = getMessages();
    if (!messages.length) return;
    selectedConversationId = getConversationKey(messages[0]);
    const el = document.getElementById('messagesAdmin');
    if (!el) return;
    el.innerHTML = `${renderInbox(messages)}${renderConversation(messages[0])}`;
  };

  const originalRender = window.renderMessagesAdmin;
  if (typeof originalRender !== 'function') return;

  window.renderMessagesAdmin = async function adminMessagesInboxRenderer() {
    try {
      await renderInboxView();
    } catch (error) {
      console.error('ADMIN MESSAGE INBOX RENDER ERROR:', error);
      // Fall back to the existing renderer if the inbox enhancement ever fails.
      try {
        await originalRender();
      } catch (fallbackError) {
        console.error('ADMIN MESSAGE FALLBACK RENDER ERROR:', fallbackError);
      }
    }
  };

  // The existing realtime script calls the global renderer when new messages arrive.
  // No polling or notification behavior is changed here.
})();
