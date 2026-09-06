(function () {
  if (window.__recruiterChatBooted) return;
  window.__recruiterChatBooted = true;

  const initialized = new WeakSet();
  const STYLE_ID = "recruiter-chat-styles";
  const ROOT_ID = "rc-widget-root";
  const AVATAR_SRC = "/recruiter-avatar.jpg";
  const AVATAR_FALLBACK = "/dp.jpg";
  const FALLBACK_ERROR = "Please try again.";
  const MAX_QUESTION = 2000;
  const MAX_JD = 12000;

  const GREETING =
    "Hi — I’m an AI assistant speaking on behalf of Vasu. Ask about his experience, stack, or paste a JD and I’ll help with fit.";
  const CHIPS = [
    { label: "Previous experience", q: "Previous experience" },
    { label: "Tech stack", q: "Tech stack" },
    {
      label: "How can I schedule a meeting?",
      q: "How can I schedule a meeting?",
    },
  ];

  const ICON_CHAT =
    '<svg class="rc-fab-icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 4h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H8.4L4 20.4V6a2 2 0 0 1 2-2zm2 4v2h12V8H6zm0 4v2h8v-2H6z"/></svg>';
  const ICON_CLOSE =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6.7 6.7a1 1 0 0 1 1.4 0L12 10.6l3.9-3.9a1 1 0 1 1 1.4 1.4L13.4 12l3.9 3.9a1 1 0 1 1-1.4 1.4L12 13.4l-3.9 3.9a1 1 0 1 1-1.4-1.4L10.6 12 6.7 8.1a1 1 0 0 1 0-1.4z"/></svg>';
  const STYLES = `
#${ROOT_ID} {
  position: fixed;
  inset: 0;
  z-index: 80;
  pointer-events: none;
  font-family: inherit;
}
#${ROOT_ID} .rc-fab,
#${ROOT_ID} .rc-panel {
  pointer-events: auto;
}
#${ROOT_ID} .rc-fab {
  position: fixed;
  right: 1.25rem;
  bottom: 1.25rem;
  z-index: 81;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  height: 2.75rem;
  padding: 0 1rem;
  border: none;
  border-radius: 9999px;
  background: var(--accent);
  color: var(--background);
  box-shadow: 0 8px 22px color-mix(in srgb, var(--foreground) 20%, transparent);
  cursor: pointer;
}
#${ROOT_ID} .rc-fab:hover {
  opacity: 0.92;
}
#${ROOT_ID} .rc-fab:focus-visible,
#${ROOT_ID} .rc-icon-btn:focus-visible,
#${ROOT_ID} .rc-send:focus-visible,
#${ROOT_ID} .rc-jd-toggle:focus-visible,
#${ROOT_ID} .rc-chip:focus-visible,
#${ROOT_ID} .rc-input:focus-visible,
#${ROOT_ID} .rc-jd-field:focus-visible {
  outline: 2px dashed var(--accent);
  outline-offset: 2px;
}
#${ROOT_ID} .rc-fab-icon {
  width: 1.15rem;
  height: 1.15rem;
  display: block;
}
#${ROOT_ID} .rc-fab-label {
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 0.01em;
}
#${ROOT_ID} .rc-panel {
  position: fixed;
  right: 1.25rem;
  bottom: 1.25rem;
  z-index: 81;
  display: flex;
  flex-direction: column;
  width: 384px;
  height: min(560px, 72vh);
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 0.9rem;
  background: var(--background);
  color: var(--foreground);
  box-shadow: 0 16px 40px color-mix(in srgb, var(--foreground) 16%, transparent);
  transform-origin: bottom right;
}
#${ROOT_ID} .rc-panel:not([hidden]) {
  animation: rc-in 140ms ease-out;
}
@keyframes rc-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: none; }
}
#${ROOT_ID} .rc-panel[hidden] {
  display: none;
}
#${ROOT_ID} .rc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex: 0 0 auto;
  min-height: 2.75rem;
  padding: 0.45rem 0.55rem 0.45rem 0.95rem;
  border-bottom: 1px solid var(--border);
}
#${ROOT_ID} .rc-title {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  line-height: 1.2;
}
#${ROOT_ID} .rc-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  padding: 0;
  border: none;
  border-radius: 0.4rem;
  background: transparent;
  color: var(--foreground);
  cursor: pointer;
}
#${ROOT_ID} .rc-icon-btn:hover {
  background: var(--muted);
}
#${ROOT_ID} .rc-icon-btn svg {
  width: 1.05rem;
  height: 1.05rem;
}
#${ROOT_ID} .rc-thread {
  flex: 1 1 auto;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 0.85rem 0.8rem 0.6rem;
  scrollbar-width: thin;
  scrollbar-color: var(--muted) transparent;
}
#${ROOT_ID} .rc-row {
  display: flex;
  align-items: flex-end;
  gap: 0.45rem;
  margin-bottom: 0.65rem;
}
#${ROOT_ID} .rc-row-user {
  justify-content: flex-end;
}
#${ROOT_ID} .rc-row-assistant {
  justify-content: flex-start;
}
#${ROOT_ID} .rc-avatar {
  flex: 0 0 auto;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid var(--border);
  background: var(--muted);
}
#${ROOT_ID} .rc-bubble {
  max-width: 82%;
  padding: 0.5rem 0.7rem;
  font-size: 0.8125rem;
  line-height: 1.45;
  white-space: pre-wrap;
  word-break: break-word;
}
#${ROOT_ID} .rc-bubble a {
  color: var(--accent);
  text-decoration: underline;
  text-underline-offset: 0.12em;
  word-break: break-all;
}
#${ROOT_ID} .rc-bubble a:hover {
  opacity: 0.85;
}
#${ROOT_ID} .rc-bubble-user a {
  color: inherit;
}
#${ROOT_ID} .rc-bubble-assistant {
  border: 1px solid var(--border);
  border-radius: 0.95rem 0.95rem 0.95rem 0.3rem;
  background: var(--muted);
  color: var(--foreground);
}
#${ROOT_ID} .rc-bubble-user {
  border: 1px solid var(--accent);
  border-radius: 0.95rem 0.95rem 0.3rem 0.95rem;
  background: var(--accent);
  color: var(--background);
}
#${ROOT_ID} .rc-bubble-typing {
  display: inline-flex;
  align-items: center;
  gap: 0.28rem;
  min-width: 2.4rem;
  min-height: 1.15rem;
}
#${ROOT_ID} .rc-dot {
  width: 0.32rem;
  height: 0.32rem;
  border-radius: 50%;
  background: var(--foreground);
  opacity: 0.35;
  animation: rc-dot 1s ease-in-out infinite;
}
#${ROOT_ID} .rc-dot:nth-child(2) { animation-delay: 0.15s; }
#${ROOT_ID} .rc-dot:nth-child(3) { animation-delay: 0.3s; }
@keyframes rc-dot {
  0%, 80%, 100% { opacity: 0.28; transform: translateY(0); }
  40% { opacity: 0.85; transform: translateY(-2px); }
}
#${ROOT_ID} .rc-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin: 0.15rem 0 0.15rem 2.2rem;
}
#${ROOT_ID} .rc-chips[hidden] {
  display: none;
}
#${ROOT_ID} .rc-chip {
  max-width: 100%;
  padding: 0.18rem 0.55rem;
  border: 1px solid var(--border);
  border-radius: 9999px;
  background: var(--background);
  color: var(--foreground);
  font-size: 0.7rem;
  line-height: 1.25;
  cursor: pointer;
}
#${ROOT_ID} .rc-chip:hover:not(:disabled) {
  background: var(--muted);
}
#${ROOT_ID} .rc-chip:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
#${ROOT_ID} .rc-dock {
  flex: 0 0 auto;
  border-top: 1px solid var(--border);
  padding: 0.45rem 0.65rem 0.6rem;
  background: var(--background);
}
#${ROOT_ID} .rc-jd-row {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  margin-bottom: 0.4rem;
}
#${ROOT_ID} .rc-jd-toggle {
  padding: 0;
  border: none;
  background: none;
  color: var(--foreground);
  font-size: 0.72rem;
  font-weight: 600;
  opacity: 0.72;
  cursor: pointer;
}
#${ROOT_ID} .rc-jd-toggle:hover {
  opacity: 1;
  color: var(--accent);
}
#${ROOT_ID} .rc-jd-toggle[data-attached="true"] {
  opacity: 1;
}
#${ROOT_ID} .rc-jd-clear {
  width: 1.35rem;
  height: 1.35rem;
}
#${ROOT_ID} .rc-jd-clear[hidden] {
  display: none;
}
#${ROOT_ID} .rc-jd-field {
  display: block;
  width: 100%;
  margin-bottom: 0.45rem;
  padding: 0.4rem 0.5rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  background: var(--muted);
  color: var(--foreground);
  font: inherit;
  font-size: 0.75rem;
  line-height: 1.4;
  resize: none;
}
#${ROOT_ID} .rc-jd-field[hidden] {
  display: none;
}
#${ROOT_ID} .rc-composer {
  display: flex;
  align-items: flex-end;
  gap: 0.4rem;
}
#${ROOT_ID} .rc-input {
  flex: 1 1 auto;
  min-width: 0;
  min-height: 2.25rem;
  max-height: 4.5rem;
  padding: 0.45rem 0.6rem;
  border: 1px solid var(--border);
  border-radius: 0.65rem;
  background: var(--muted);
  color: var(--foreground);
  font: inherit;
  font-size: 0.8125rem;
  line-height: 1.35;
  resize: none;
}
#${ROOT_ID} .rc-input::placeholder,
#${ROOT_ID} .rc-jd-field::placeholder {
  color: var(--foreground);
  opacity: 0.5;
}
#${ROOT_ID} .rc-send {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  min-width: 3.4rem;
  height: 2.25rem;
  padding: 0 0.7rem;
  border: none;
  border-radius: 0.65rem;
  background: var(--accent);
  color: var(--background);
  font: inherit;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
}
#${ROOT_ID} .rc-send:hover:not(:disabled) {
  opacity: 0.92;
}
#${ROOT_ID} .rc-send:disabled,
#${ROOT_ID} .rc-input:disabled,
#${ROOT_ID} .rc-jd-field:disabled,
#${ROOT_ID} .rc-jd-toggle:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
#${ROOT_ID} .rc-send[data-busy="true"] {
  min-width: 5.6rem;
}
@media (max-width: 480px) {
  #${ROOT_ID} .rc-fab {
    right: 0.85rem;
    bottom: 0.85rem;
  }
  #${ROOT_ID} .rc-panel {
    left: 0.65rem;
    right: 0.65rem;
    bottom: 0.65rem;
    width: auto;
    height: min(72vh, calc(100dvh - 1.3rem));
  }
}
@media (max-width: 767px) {
  body:has(#${ROOT_ID}) #btt-btn-container {
    inset-inline-end: 5.25rem;
  }
}
`;

  let widgetAbort = null;

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = STYLES;
    document.head.appendChild(style);
  }

  function teardown() {
    widgetAbort?.abort();
    widgetAbort = null;
    document.getElementById(ROOT_ID)?.remove();
  }

  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    if (attrs) {
      for (const [key, value] of Object.entries(attrs)) {
        if (key === "className") node.className = value;
        else if (key === "text") node.textContent = value;
        else if (key === "html") node.innerHTML = value;
        else if (key.startsWith("on") && typeof value === "function") {
          node.addEventListener(key.slice(2).toLowerCase(), value);
        } else if (value === false || value == null) {
          /* skip */
        } else if (value === true) {
          node.setAttribute(key, "");
        } else {
          node.setAttribute(key, value);
        }
      }
    }
    for (const child of children || []) node.append(child);
    return node;
  }

  const LINK_RE =
    /(?:https?:\/\/[^\s<>"']+|mailto:[^\s<>"']+|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi;
  const MD_LINK_RE =
    /\[([^\]]+)\]\((https?:\/\/[^)\s<>"']+|mailto:[^)\s<>"']+)\)/gi;

  function stripUrlTrail(raw) {
    return String(raw).replace(/[)\].,!?;:]+$/g, "");
  }

  function safeHref(raw) {
    const href = String(raw || "").trim();
    const lower = href.toLowerCase();
    if (
      lower.startsWith("javascript:") ||
      lower.startsWith("data:") ||
      lower.startsWith("vbscript:")
    ) {
      return "";
    }
    if (
      lower.startsWith("https://") ||
      lower.startsWith("http://") ||
      lower.startsWith("mailto:")
    ) {
      return href;
    }
    if (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(href)) {
      return `mailto:${href}`;
    }
    return "";
  }

  function appendAnchor(node, href, label) {
    node.append(
      el("a", {
        href,
        target: "_blank",
        rel: "noopener noreferrer",
        text: label,
      })
    );
  }

  function appendAutolinked(node, text) {
    const src = String(text ?? "");
    const re = new RegExp(LINK_RE.source, LINK_RE.flags);
    let last = 0;
    let match;
    while ((match = re.exec(src))) {
      const raw = match[0];
      const cleaned = stripUrlTrail(raw);
      const trail = raw.slice(cleaned.length);
      if (match.index > last) node.append(src.slice(last, match.index));
      const href = safeHref(cleaned);
      if (href) {
        appendAnchor(node, href, cleaned);
        if (trail) node.append(trail);
      } else {
        node.append(raw);
      }
      last = match.index + raw.length;
    }
    if (last < src.length) node.append(src.slice(last));
  }

  function setLinkedText(node, text) {
    node.replaceChildren();
    const src = String(text ?? "");
    const re = new RegExp(MD_LINK_RE.source, MD_LINK_RE.flags);
    let last = 0;
    let match;
    while ((match = re.exec(src))) {
      if (match.index > last)
        appendAutolinked(node, src.slice(last, match.index));
      const href = safeHref(match[2]);
      if (href) {
        appendAnchor(node, href, match[1]);
      } else {
        appendAutolinked(node, match[0]);
      }
      last = match.index + match[0].length;
    }
    if (last < src.length) appendAutolinked(node, src.slice(last));
  }

  function politeError(payload) {
    const msg =
      payload && typeof payload.error === "string" ? payload.error.trim() : "";
    if (!msg || msg.length > 280) return FALLBACK_ERROR;
    if (/traceback|exception|stack\s*trace|file \"|at \//i.test(msg)) {
      return FALLBACK_ERROR;
    }
    return msg;
  }

  function streamUrl(proxy) {
    const trimmed = String(proxy || "").replace(/\/+$/, "");
    if (trimmed.endsWith("/chat")) return `${trimmed}/stream`;
    return `${trimmed}/chat/stream`;
  }

  function applySseBlock(block, onEvent) {
    const dataLines = [];
    for (const line of block.split("\n")) {
      if (line.startsWith("data:")) dataLines.push(line.slice(5).trimStart());
    }
    if (!dataLines.length) return;
    const raw = dataLines.join("\n").trim();
    if (!raw || raw === "[DONE]") {
      if (raw === "[DONE]") onEvent({ done: true });
      return;
    }
    try {
      onEvent(JSON.parse(raw));
    } catch {
      /* ignore keep-alives / non-JSON */
    }
  }

  async function readSse(res, onEvent) {
    if (!res.body) return;
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = "";
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const parts = buf.split("\n\n");
      buf = parts.pop() || "";
      for (const part of parts) applySseBlock(part, onEvent);
    }
    if (buf.trim()) applySseBlock(buf, onEvent);
  }

  function setAvatarSrc(img) {
    img.addEventListener("error", () => {
      if (img.dataset.fallback) return;
      img.dataset.fallback = "1";
      img.src = AVATAR_FALLBACK;
    });
    img.src = AVATAR_SRC;
    return img;
  }

  function createWidget(container) {
    const proxy = (container.dataset.proxy || "").trim();
    if (!proxy) return;

    teardown();
    ensureStyles();
    widgetAbort = new AbortController();
    const { signal } = widgetAbort;

    let open = false;
    let busy = false;
    let jdOpen = false;
    let chatAbort = null;

    const thread = el("div", {
      className: "rc-thread",
      "aria-live": "polite",
    });

    const chips = el(
      "div",
      { className: "rc-chips" },
      CHIPS.map(chip =>
        el("button", {
          type: "button",
          className: "rc-chip",
          text: chip.label,
        })
      )
    );

    const greetingRow = el("div", { className: "rc-row rc-row-assistant" }, [
      setAvatarSrc(
        el("img", {
          className: "rc-avatar",
          alt: "",
          width: "28",
          height: "28",
        })
      ),
      el("div", { className: "rc-bubble rc-bubble-assistant", text: GREETING }),
    ]);
    thread.append(greetingRow, chips);

    const jdToggle = el("button", {
      type: "button",
      className: "rc-jd-toggle",
      text: "Paste JD",
      "aria-expanded": "false",
    });
    const jdClear = el("button", {
      type: "button",
      className: "rc-icon-btn rc-jd-clear",
      "aria-label": "Clear job description",
      html: ICON_CLOSE,
      hidden: "",
    });
    const jdField = el("textarea", {
      className: "rc-jd-field",
      rows: "3",
      maxlength: String(MAX_JD),
      placeholder: "Paste the job description (optional)",
      hidden: "",
    });

    const input = el("textarea", {
      className: "rc-input",
      rows: "1",
      maxlength: String(MAX_QUESTION),
      placeholder: "Ask about fit…",
      autocomplete: "off",
      enterkeyhint: "send",
    });
    const sendBtn = el("button", {
      type: "button",
      className: "rc-send",
      "aria-label": "Send",
      text: "Send",
    });

    const closeBtn = el("button", {
      type: "button",
      className: "rc-icon-btn",
      "aria-label": "Close chat",
      html: ICON_CLOSE,
    });

    const panel = el(
      "div",
      {
        className: "rc-panel",
        id: "rc-panel",
        role: "dialog",
        "aria-labelledby": "rc-title",
        hidden: "",
      },
      [
        el("div", { className: "rc-header" }, [
          el("p", {
            className: "rc-title",
            id: "rc-title",
            text: "Ask about fit",
          }),
          closeBtn,
        ]),
        thread,
        el("div", { className: "rc-dock" }, [
          el("div", { className: "rc-jd-row" }, [jdToggle, jdClear]),
          jdField,
          el("div", { className: "rc-composer" }, [input, sendBtn]),
        ]),
      ]
    );

    const fab = el("button", {
      type: "button",
      className: "rc-fab",
      "aria-expanded": "false",
      "aria-controls": "rc-panel",
      "aria-label": "Ask about fit",
      html: ICON_CHAT + '<span class="rc-fab-label">Ask</span>',
    });

    function scrollThread() {
      thread.scrollTop = thread.scrollHeight;
    }

    function syncJdLabel() {
      const attached = Boolean(jdField.value.trim());
      jdToggle.textContent = attached ? "JD attached" : "Paste JD";
      jdToggle.dataset.attached = String(attached);
      jdClear.hidden = !attached;
    }

    function setJdOpen(next) {
      jdOpen = next;
      jdField.hidden = !next;
      jdToggle.setAttribute("aria-expanded", String(next));
      if (next) jdField.focus();
    }

    function setBusy(next) {
      busy = next;
      input.disabled = next;
      jdField.disabled = next;
      jdToggle.disabled = next;
      jdClear.disabled = next;
      sendBtn.disabled = next;
      sendBtn.dataset.busy = String(next);
      sendBtn.setAttribute("aria-label", next ? "Thinking…" : "Send");
      sendBtn.textContent = next ? "Thinking…" : "Send";
      chips.querySelectorAll("button").forEach(btn => {
        btn.disabled = next;
      });
    }

    function appendBubble(role, text) {
      const row = el("div", { className: `rc-row rc-row-${role}` });
      if (role === "assistant") {
        row.append(
          setAvatarSrc(
            el("img", {
              className: "rc-avatar",
              alt: "",
              width: "28",
              height: "28",
            })
          )
        );
      }
      const bubble = el("div", { className: `rc-bubble rc-bubble-${role}` });
      setLinkedText(bubble, text);
      row.append(bubble);
      thread.append(row);
      scrollThread();
      return row;
    }

    function appendTyping() {
      const dots = el(
        "div",
        { className: "rc-bubble rc-bubble-assistant rc-bubble-typing" },
        [
          el("span", { className: "rc-dot" }),
          el("span", { className: "rc-dot" }),
          el("span", { className: "rc-dot" }),
        ]
      );
      const row = el("div", { className: "rc-row rc-row-assistant" }, [
        setAvatarSrc(
          el("img", {
            className: "rc-avatar",
            alt: "",
            width: "28",
            height: "28",
          })
        ),
        dots,
      ]);
      thread.append(row);
      scrollThread();
      return row;
    }

    function resizeInput() {
      input.style.height = "auto";
      input.style.height = `${Math.min(input.scrollHeight, 72)}px`;
    }

    function setOpen(next) {
      open = next;
      panel.hidden = !next;
      fab.hidden = next;
      fab.setAttribute("aria-expanded", String(next));
      if (next) {
        scrollThread();
        requestAnimationFrame(() => input.focus());
      } else {
        fab.focus();
      }
    }

    function finishAssistant(row, text) {
      const bubble = row.querySelector(".rc-bubble");
      if (bubble) {
        bubble.classList.remove("rc-bubble-typing");
        setLinkedText(bubble, text);
      } else {
        const next = el("div", { className: "rc-bubble rc-bubble-assistant" });
        setLinkedText(next, text);
        row.append(next);
      }
      scrollThread();
    }

    async function askJson(body, signal) {
      const res = await fetch(proxy, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal,
      });
      let payload = null;
      try {
        payload = await res.json();
      } catch {
        payload = null;
      }
      if (
        payload &&
        typeof payload.answer === "string" &&
        payload.answer.trim()
      ) {
        return { ok: true, text: payload.answer.trim() };
      }
      return { ok: false, text: politeError(payload) };
    }

    async function askStream(body, signal, typing) {
      const res = await fetch(streamUrl(proxy), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify(body),
        signal,
      });
      const ctype = (res.headers.get("content-type") || "").toLowerCase();
      if (res.status === 404 || res.status === 405) return null;
      if (!res.ok || !ctype.includes("text/event-stream") || !res.body) {
        let payload = null;
        try {
          payload = await res.json();
        } catch {
          payload = null;
        }
        return { ok: false, text: politeError(payload) };
      }

      let lastText = "";
      let done = false;
      let errText = "";
      await readSse(res, ev => {
        if (!ev || typeof ev !== "object") return;
        if (typeof ev.error === "string" && ev.error.trim()) {
          errText = politeError(ev);
          return;
        }
        if (ev.done) {
          done = true;
          return;
        }
        if (typeof ev.text === "string" && ev.text) {
          lastText = ev.text;
          finishAssistant(typing, lastText);
        }
      });
      if (errText) return { ok: false, text: errText };
      if (done && lastText.trim()) return { ok: true, text: lastText.trim() };
      if (done) return { ok: false, text: FALLBACK_ERROR };
      if (lastText.trim()) return { ok: true, text: lastText.trim() };
      return { ok: false, text: FALLBACK_ERROR };
    }

    async function ask(question) {
      const q = String(question || "").trim();
      if (!q || busy) return;
      chips.hidden = true;
      appendBubble("user", q);
      input.value = "";
      resizeInput();
      setBusy(true);
      const typing = appendTyping();
      chatAbort?.abort();
      chatAbort = new AbortController();
      const body = {
        jd: jdField.value.trim(),
        question: q.slice(0, MAX_QUESTION),
      };
      try {
        let result = null;
        try {
          result = await askStream(body, chatAbort.signal, typing);
        } catch (err) {
          if (err && err.name === "AbortError") throw err;
          result = null;
        }
        if (!result) {
          result = await askJson(body, chatAbort.signal);
        }
        finishAssistant(typing, result.text);
      } catch (err) {
        if (err && err.name === "AbortError") {
          typing.remove();
          return;
        }
        finishAssistant(typing, FALLBACK_ERROR);
      } finally {
        setBusy(false);
        requestAnimationFrame(() => {
          if (open) input.focus();
        });
      }
    }

    function submitComposer() {
      ask(input.value);
    }

    fab.addEventListener("click", () => setOpen(true));
    closeBtn.addEventListener("click", () => setOpen(false));
    sendBtn.addEventListener("click", submitComposer);
    chips.querySelectorAll("button").forEach((btn, i) => {
      btn.addEventListener("click", () => ask(CHIPS[i].q));
    });
    jdToggle.addEventListener("click", () => setJdOpen(!jdOpen));
    jdClear.addEventListener("click", () => {
      jdField.value = "";
      syncJdLabel();
      if (jdOpen) jdField.focus();
    });
    jdField.addEventListener("input", syncJdLabel);
    input.addEventListener("input", resizeInput);
    input.addEventListener("keydown", e => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        submitComposer();
      }
    });

    document.addEventListener(
      "keydown",
      e => {
        if (e.key === "Escape" && open) {
          e.preventDefault();
          setOpen(false);
        }
      },
      { signal }
    );

    signal.addEventListener("abort", () => {
      chatAbort?.abort();
    });

    const root = el("div", { id: ROOT_ID }, [panel, fab]);
    document.body.append(root);
  }

  function mount(container) {
    if (!document.body.contains(container)) {
      teardown();
      return;
    }
    if (initialized.has(container)) {
      if (!document.getElementById(ROOT_ID)) {
        initialized.delete(container);
      } else {
        return;
      }
    }
    initialized.add(container);
    createWidget(container);
  }

  function initAll() {
    const mounts = document.querySelectorAll(
      '.recruiter-chat[data-viz="recruiter-chat"]'
    );
    if (!mounts.length) {
      teardown();
      return;
    }
    mounts.forEach(mount);
  }

  initAll();
  document.addEventListener("astro:page-load", initAll);
})();
