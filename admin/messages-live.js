/* ═══════════════════════════════════════════════
   MESSAGES LIVE BRIDGE
   Neon Database ↔ Admin Messages
   ═══════════════════════════════════════════════ */

(() => {
  'use strict';

  const API = '/api/messages';

  let messagesCache = [];
  let loading = false;

  /* ─────────────────────────────────────────────
     HELPERS
  ───────────────────────────────────────────── */

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function normalizeMessage(message) {
    return {
      id: Number(message.id),
      name: message.name || 'Unknown',
      email: message.email || '',
      subject: message.subject || '(No subject)',
      message: message.message || '',
      read: Boolean(message.is_read ?? message.read),
      time:
        message.created_at ||
        message.time ||
        new Date().toISOString()
    };
  }

  /* ─────────────────────────────────────────────
     LOAD FROM DATABASE
  ───────────────────────────────────────────── */

  async function loadMessages(showError = true) {
    if (loading) return messagesCache;

    loading = true;

    try {
      const response = await fetch(API, {
        method: 'GET',
        headers: {
          Accept: 'application/json'
        },
        cache: 'no-store'
      });

      const data = await response
        .json()
        .catch(() => ({}));

      if (
        !response.ok ||
        !Array.isArray(data.messages)
      ) {
        throw new Error(
          data.error ||
          `Messages API returned ${response.status}`
        );
      }

      messagesCache = data.messages.map(
        normalizeMessage
      );

      return messagesCache;

    } catch (error) {

      console.error(
        'LIVE MESSAGES LOAD ERROR:',
        error
      );

      if (showError) {
        const el =
          document.getElementById(
            'messagesAdmin'
          );

        if (el) {
          el.innerHTML = `
            <div class="no-messages">
              ⚠️ Unable to load messages.
              <br>
              <small>
                ${escapeHtml(error.message)}
              </small>
              <br><br>
              <button
                class="action-btn"
                type="button"
                onclick="window.refreshLiveMessages()"
              >
                Retry
              </button>
            </div>
          `;
        }
      }

      return messagesCache;

    } finally {

      loading = false;

    }
  }

  /* ─────────────────────────────────────────────
     RENDER MESSAGES
  ───────────────────────────────────────────── */

  function renderMessagesLive() {

    const el =
      document.getElementById(
        'messagesAdmin'
      );

    if (!el) return;

    const msgs = messagesCache;

    if (!msgs.length) {

      el.innerHTML =
        '<div class="no-messages">📬 No messages yet</div>';

      return;
    }

    el.innerHTML = msgs.map(message => {

      const email =
        escapeHtml(message.email);

      const name =
        escapeHtml(message.name);

      const subject =
        escapeHtml(message.subject);

      const body =
        escapeHtml(message.message)
          .replace(/\n/g, '<br>');

      const time =
        new Date(message.time)
          .toLocaleString();

      return `
        <div
          class="msg-admin-card ${
            message.read
              ? ''
              : 'msg-unread'
          }"
          id="msg-${message.id}"
        >

          <div class="msg-admin-header">

            <div>

              <span class="msg-admin-from">
                ${name}
              </span>

              <a
                href="mailto:${email}"
                class="msg-admin-email"
                style="margin-left:10px"
              >
                ${email}
              </a>

            </div>

            <div
              style="
                display:flex;
                gap:10px;
                align-items:center;
                flex-wrap:wrap
              "
            >

              <span class="msg-admin-time">
                ${time}
              </span>

              <button
                class="action-btn"
                style="
                  flex:none;
                  padding:4px 10px
                "
                type="button"
                onclick="
                  window.markLiveMessageRead(
                    ${message.id}
                  )
                "
              >
                ${
                  message.read
                    ? '✓ Read'
                    : 'Mark read'
                }
              </button>

              <button
                class="action-btn delete"
                style="
                  flex:none;
                  padding:4px 10px
                "
                type="button"
                onclick="
                  window.deleteLiveMessage(
                    ${message.id}
                  )
                "
              >
                🗑️
              </button>

            </div>

          </div>

          <div class="msg-admin-subject">

            <strong>
              Subject:
            </strong>

            ${subject}

          </div>

          <div class="msg-admin-body">
            ${body}
          </div>

        </div>
      `;

    }).join('');
  }

  /* ─────────────────────────────────────────────
     OVERVIEW
  ───────────────────────────────────────────── */

  function renderOverviewLive() {

    const services =
      window.PortfolioData?.get(
        'services'
      ) || [];

    const projects =
      window.PortfolioData?.get(
        'projects'
      ) || [];

    const msgs =
      messagesCache;

    const unread =
      msgs.filter(
        message => !message.read
      ).length;

    const stats =
      document.getElementById(
        'overviewStats'
      );

    if (stats) {

      stats.innerHTML = `
        <div class="stat-card">

          <div class="stat-card-num">
            ${services.length}
          </div>

          <div class="stat-card-label">
            Services
          </div>

        </div>

        <div class="stat-card">

          <div class="stat-card-num">
            ${projects.length}
          </div>

          <div class="stat-card-label">
            Projects
          </div>

        </div>

        <div class="stat-card">

          <div class="stat-card-num">
            ${msgs.length}
          </div>

          <div class="stat-card-label">
            Total Messages
          </div>

        </div>

        <div class="stat-card">

          <div
            class="stat-card-num"
            style="
              color:${
                unread
                  ? 'var(--yellow)'
                  : 'var(--accent)'
              }
            "
          >
            ${unread}
          </div>

          <div class="stat-card-label">
            Unread
          </div>

        </div>
      `;
    }

    const recent =
      document.getElementById(
        'recentMessages'
      );

    if (!recent) return;

    if (!msgs.length) {

      recent.innerHTML =
        '<div class="no-messages">📬 No messages yet</div>';

      return;
    }

    recent.innerHTML =
      msgs.slice(0, 5)
        .map(message => {

          return `
            <div
              class="msg-admin-card ${
                message.read
                  ? ''
                  : 'msg-unread'
              }"
            >

              <div class="msg-admin-header">

                <div>

                  <span class="msg-admin-from">
                    ${escapeHtml(
                      message.name
                    )}
                  </span>

                  <span
                    class="msg-admin-email"
                    style="margin-left:10px"
                  >
                    ${escapeHtml(
                      message.email
                    )}
                  </span>

                </div>

                <div class="msg-admin-time">
                  ${
                    new Date(
                      message.time
                    ).toLocaleString()
                  }
                </div>

              </div>

              <div class="msg-admin-subject">
                Subject:
                ${escapeHtml(
                  message.subject
                )}
              </div>

              <div class="msg-admin-body">
                ${
                  escapeHtml(
                    message.message
                  ).replace(
                    /\n/g,
                    '<br>'
                  )
                }
              </div>

            </div>
          `;

        })
        .join('');
  }

  /* ─────────────────────────────────────────────
     MARK AS READ
  ───────────────────────────────────────────── */

  async function markLiveMessageRead(id) {

    try {

      const response =
        await fetch(API, {

          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',

            Accept:
              'application/json'
          },

          body: JSON.stringify({
            action: 'read',
            id: Number(id)
          })

        });

      const data =
        await response
          .json()
          .catch(() => ({}));

      if (
        !response.ok ||
        !data.ok
      ) {
        throw new Error(
          data.error ||
          'Failed to mark message as read.'
        );
      }

      await loadMessages(false);

      renderMessagesLive();
      renderOverviewLive();

    } catch (error) {

      console.error(
        'MARK READ ERROR:',
        error
      );

      alert(error.message);
    }
  }

  /* ─────────────────────────────────────────────
     DELETE ONE MESSAGE
  ───────────────────────────────────────────── */

  async function deleteLiveMessage(id) {

    if (
      !confirm(
        'Delete this message?'
      )
    ) {
      return;
    }

    try {

      const response =
        await fetch(API, {

          method: 'DELETE',

          headers: {
            'Content-Type':
              'application/json',

            Accept:
              'application/json'
          },

          body: JSON.stringify({
            id: Number(id)
          })

        });

      const data =
        await response
          .json()
          .catch(() => ({}));

      if (
        !response.ok ||
        !data.ok
      ) {
        throw new Error(
          data.error ||
          'Failed to delete message.'
        );
      }

      await loadMessages(false);

      renderMessagesLive();
      renderOverviewLive();

    } catch (error) {

      console.error(
        'DELETE MESSAGE ERROR:',
        error
      );

      alert(error.message);
    }
  }

  /* ─────────────────────────────────────────────
     DELETE ALL
  ───────────────────────────────────────────── */

  async function clearLiveMessages() {

    if (
      !confirm(
        'Delete ALL messages?'
      )
    ) {
      return;
    }

    try {

      const response =
        await fetch(API, {

          method: 'DELETE',

          headers: {
            'Content-Type':
              'application/json',

            Accept:
              'application/json'
          },

          body: JSON.stringify({
            all: true
          })

        });

      const data =
        await response
          .json()
          .catch(() => ({}));

      if (
        !response.ok ||
        !data.ok
      ) {
        throw new Error(
          data.error ||
          'Failed to delete messages.'
        );
      }

      await loadMessages(false);

      renderMessagesLive();
      renderOverviewLive();

    } catch (error) {

      console.error(
        'CLEAR MESSAGES ERROR:',
        error
      );

      alert(error.message);
    }
  }

  /* ─────────────────────────────────────────────
     REFRESH
  ───────────────────────────────────────────── */

  async function refreshLiveMessages() {

    await loadMessages();

    renderMessagesLive();
    renderOverviewLive();
  }

  /* ─────────────────────────────────────────────
     OVERRIDE OLD LOCAL STORAGE FUNCTIONS
  ───────────────────────────────────────────── */

  window.getMsgs = () =>
    messagesCache.slice();

  window.saveMsgs = () => {

    console.warn(
      'LocalStorage message saving disabled. ' +
      'Messages are stored in Neon.'
    );

  };

  window.addMsg = () => {

    console.warn(
      'addMsg disabled. ' +
      'Messages are saved by /api/contact.'
    );

  };

  window.renderMessagesAdmin =
    renderMessagesLive;

  window.renderOverview =
    renderOverviewLive;

  window.markRead =
    markLiveMessageRead;

  window.deleteMsg =
    deleteLiveMessage;

  window.refreshLiveMessages =
    refreshLiveMessages;

  window.markLiveMessageRead =
    markLiveMessageRead;

  window.deleteLiveMessage =
    deleteLiveMessage;

  /* ─────────────────────────────────────────────
     INIT
  ───────────────────────────────────────────── */

  document.addEventListener(
    'DOMContentLoaded',
    async () => {

      const clearBtn =
        document.getElementById(
          'clearMsgsBtn'
        );

      if (clearBtn) {

        clearBtn.onclick =
          clearLiveMessages;

      }

      await loadMessages();

      renderOverviewLive();

      const messageNav =
        document.querySelector(
          '.sb-btn[data-panel="messages"]'
        );

      if (messageNav) {

        messageNav.addEventListener(
          'click',
          () => {

            setTimeout(
              renderMessagesLive,
              0
            );

          }
        );

      }

    }
  );

  /* ─────────────────────────────────────────────
     AUTO REFRESH — 15 SECONDS
  ───────────────────────────────────────────── */

  setInterval(
    async () => {

      if (document.hidden) {
        return;
      }

      await loadMessages(false);

      renderOverviewLive();

      const panel =
        document.getElementById(
          'panel-messages'
        );

      if (
        panel &&
        !panel.classList.contains(
          'hidden'
        )
      ) {

        renderMessagesLive();

      }

    },
    15000
  );

})();
