/* ═══════════════════════════════════════════════
   ADMIN LIVE MESSAGES
   Neon Database ↔ Admin ↔ Visitor
   ═══════════════════════════════════════════════ */

(() => {

  'use strict';

  const API =
    '/api/messages';

  let messagesCache = [];

  let loading = false;


  /* ═══════════════════════════════
     HELPERS
  ═══════════════════════════════ */

  function escapeHtml(value) {

    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }


  function normalizeMessage(
    message
  ) {

    return {

      id:
        Number(message.id),

      name:
        message.name ||
        'Unknown',

      email:
        message.email ||
        '',

      subject:
        message.subject ||
        '(No subject)',

      message:
        message.message ||
        '',

      read:
        Boolean(
          message.is_read ??
          message.read
        ),

      time:
        message.created_at ||
        message.time ||
        new Date().toISOString(),

      conversationId:
        message.conversation_id ||
        '',

      sender:
        message.sender ||
        ''
    };
  }


  /* ═══════════════════════════════
     LOAD
  ═══════════════════════════════ */

  async function loadMessages(
    showError = true
  ) {

    if (loading) {
      return messagesCache;
    }

    loading = true;

    try {

      const response =
        await fetch(
          API,
          {
            method: 'GET',
            cache: 'no-store',
            headers: {
              Accept:
                'application/json'
            }
          }
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !Array.isArray(
          data.messages
        )
      ) {

        throw new Error(
          data.error ||
          `Messages API returned ${response.status}`
        );
      }

      messagesCache =
        data.messages.map(
          normalizeMessage
        );

      return messagesCache;

    } catch (error) {

      console.error(
        'LOAD MESSAGES ERROR:',
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
                ${escapeHtml(
                  error.message
                )}
              </small>
            </div>
          `;
        }
      }

      return messagesCache;

    } finally {

      loading = false;
    }
  }


  /* ═══════════════════════════════
     RENDER
  ═══════════════════════════════ */

  function renderMessagesLive() {

    const el =
      document.getElementById(
        'messagesAdmin'
      );

    if (!el) return;

    const msgs =
      messagesCache;

    if (!msgs.length) {

      el.innerHTML =
        '<div class="no-messages">📬 No messages yet</div>';

      return;
    }


    el.innerHTML =
      msgs.map(
        message => {

          const email =
            escapeHtml(
              message.email
            );

          const name =
            escapeHtml(
              message.name
            );

          const subject =
            escapeHtml(
              message.subject
            );

          const body =
            escapeHtml(
              message.message
            ).replace(
              /\n/g,
              '<br>'
            );

          const time =
            new Date(
              message.time
            ).toLocaleString();


          /*
           * Live chat visitor message
           * gets Reply box.
           */
          const isLiveChat =
            Boolean(
              message.conversationId
            ) &&
            message.sender !== 'bot';


          const replyBox =
            isLiveChat
              ? `
                <div
                  class="admin-reply-box"
                  style="
                    margin-top:15px;
                    padding-top:15px;
                    border-top:1px solid var(--border);
                  "
                >

                  <textarea
                    id="reply-${message.id}"
                    placeholder="Write a reply to this visitor..."
                    rows="3"
                    style="
                      width:100%;
                      resize:vertical;
                      padding:10px;
                      border-radius:10px;
                      border:1px solid var(--border);
                      background:var(--bg-card);
                      color:var(--text);
                      box-sizing:border-box;
                      font:inherit;
                    "
                  ></textarea>

                  <div
                    style="
                      display:flex;
                      justify-content:flex-end;
                      margin-top:8px;
                    "
                  >

                    <button
                      class="action-btn"
                      type="button"
                      onclick="
                        window.replyToLiveMessage(
                          ${message.id}
                        )
                      "
                    >
                      📤 Reply
                    </button>

                  </div>

                  <div
                    id="reply-status-${message.id}"
                    style="
                      margin-top:6px;
                      font-size:12px;
                      color:var(--text-muted);
                    "
                  ></div>

                </div>
              `
              : '';


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

                  ${
                    email
                      ? `
                        <a
                          href="mailto:${email}"
                          class="msg-admin-email"
                          style="margin-left:10px"
                        >
                          ${email}
                        </a>
                      `
                      : ''
                  }

                  ${
                    message.sender ===
                    'visitor'
                      ? `
                        <span
                          style="
                            margin-left:8px;
                            font-size:11px;
                            opacity:.7;
                          "
                        >
                          LIVE CHAT
                        </span>
                      `
                      : ''
                  }

                </div>

                <div
                  style="
                    display:flex;
                    gap:10px;
                    align-items:center;
                    flex-wrap:wrap;
                  "
                >

                  <span
                    class="msg-admin-time"
                  >
                    ${time}
                  </span>

                  <button
                    class="action-btn"
                    style="
                      flex:none;
                      padding:4px 10px;
                    "
                    type="button"
                    onclick="
                      window.markLiveMessageRead(
                        ${message.id}
                      )
                    "
                    ${
                      message.read
                        ? 'disabled'
                        : ''
                    }
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
                      padding:4px 10px;
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


              ${replyBox}

            </div>
          `;
        }
      ).join('');
  }


  /* ═══════════════════════════════
     REPLY TO VISITOR
  ═══════════════════════════════ */

  async function replyToLiveMessage(
    id
  ) {

    const textarea =
      document.getElementById(
        `reply-${id}`
      );

    const status =
      document.getElementById(
        `reply-status-${id}`
      );

    if (!textarea) return;

    const message =
      textarea.value.trim();

    if (!message) {

      if (status) {
        status.textContent =
          'Please write a reply first.';
      }

      return;
    }

    if (status) {
      status.textContent =
        'Sending...';
    }

    textarea.disabled = true;

    try {

      const response =
        await fetch(
          API,
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',

              Accept:
                'application/json'
            },

            body: JSON.stringify({

              action:
                'reply',

              messageId:
                Number(id),

              message

            })
          }
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.ok
      ) {

        throw new Error(
          data.error ||
          'Reply failed.'
        );
      }

      textarea.value = '';

      if (status) {

        status.textContent =
          '✓ Reply sent to visitor';

        status.style.color =
          'var(--accent)';
      }

      /*
       * Refresh immediately.
       */
      await loadMessages(false);

      renderMessagesLive();

      renderOverviewLive();

    } catch (error) {

      console.error(
        'ADMIN REPLY ERROR:',
        error
      );

      if (status) {

        status.textContent =
          error.message;

        status.style.color =
          'var(--yellow)';
      }

      textarea.disabled = false;
    }
  }


  /* ═══════════════════════════════
     MARK READ
  ═══════════════════════════════ */

  async function markLiveMessageRead(
    id
  ) {

    try {

      const response =
        await fetch(
          API,
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json'
            },

            body: JSON.stringify({

              action:
                'read',

              id:
                Number(id)

            })
          }
        );

      const data =
        await response.json();

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

      alert(
        error.message
      );
    }
  }


  /* ═══════════════════════════════
     DELETE ONE
  ═══════════════════════════════ */

  async function deleteLiveMessage(
    id
  ) {

    if (
      !confirm(
        'Delete this message?'
      )
    ) {
      return;
    }

    try {

      const response =
        await fetch(
          API,
          {
            method: 'DELETE',

            headers: {
              'Content-Type':
                'application/json'
            },

            body: JSON.stringify({
              id:
                Number(id)
            })
          }
        );

      const data =
        await response.json();

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

      alert(
        error.message
      );
    }
  }


  /* ═══════════════════════════════
     DELETE ALL
  ═══════════════════════════════ */

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
        await fetch(
          API,
          {
            method: 'DELETE',

            headers: {
              'Content-Type':
                'application/json'
            },

            body: JSON.stringify({
              all: true
            })
          }
        );

      const data =
        await response.json();

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

      alert(
        error.message
      );
    }
  }


  /* ═══════════════════════════════
     OVERVIEW
  ═══════════════════════════════ */

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
        message =>
          !message.read
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
        .map(
          message => `

            <div
              class="msg-admin-card ${
                message.read
                  ? ''
                  : 'msg-unread'
              }"
            >

              <div
                class="msg-admin-header"
              >

                <div>

                  <span
                    class="msg-admin-from"
                  >
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

                <div
                  class="msg-admin-time"
                >
                  ${
                    new Date(
                      message.time
                    ).toLocaleString()
                  }
                </div>

              </div>


              <div
                class="msg-admin-subject"
              >
                Subject:
                ${escapeHtml(
                  message.subject
                )}
              </div>


              <div
                class="msg-admin-body"
              >
                ${escapeHtml(
                  message.message
                ).replace(
                  /\n/g,
                  '<br>'
                )}
              </div>

            </div>
          `
        )
        .join('');
  }


  /* ═══════════════════════════════
     REFRESH
  ═══════════════════════════════ */

  async function refreshLiveMessages() {

    await loadMessages();

    renderMessagesLive();

    renderOverviewLive();
  }


  /* ═══════════════════════════════
     COMPATIBILITY WITH ADMIN.JS
  ═══════════════════════════════ */

  window.getMsgs = () =>
    messagesCache.slice();


  window.saveMsgs = () => {

    console.warn(
      'Messages are stored in Neon.'
    );
  };


  window.addMsg = () => {

    console.warn(
      'Messages are stored through the API.'
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


  window.replyToLiveMessage =
    replyToLiveMessage;


  /* ═══════════════════════════════
     INIT
  ═══════════════════════════════ */

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

      await loadMessages(
        false
      );

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


  /* ═══════════════════════════════
     AUTO REFRESH
  ═══════════════════════════════ */

  setInterval(
    async () => {

      if (
        document.hidden
      ) {
        return;
      }

      await loadMessages(
        false
      );

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
    3000
  );

})();
