(function () {
  const initialized = new WeakSet();

  const SUGGESTED = [
    "Why a fit for a Go backend role?",
    "Summarize backend and infra experience",
    "What Kubernetes / platform work has he done?",
    "Why hire him for this JD?",
  ];

  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    if (attrs) {
      for (const [key, value] of Object.entries(attrs)) {
        if (key === "className") node.className = value;
        else if (key === "text") node.textContent = value;
        else if (key.startsWith("on") && typeof value === "function") {
          node.addEventListener(key.slice(2).toLowerCase(), value);
        } else if (value != null) node.setAttribute(key, value);
      }
    }
    for (const child of children || []) node.append(child);
    return node;
  }

  function createWidget(container) {
    const proxy = container.dataset.proxy || "";
    if (!proxy) return;

    const jd = el("textarea", {
      className:
        "border-border bg-background mt-3 w-full rounded-lg border p-3 text-sm",
      rows: "6",
      placeholder: "Paste the job description (optional)",
      "aria-label": "Job description",
    });

    const question = el("textarea", {
      className:
        "border-border bg-background mt-3 w-full rounded-lg border p-3 text-sm",
      rows: "3",
      placeholder: "Ask a question — e.g. why is he a fit?",
      "aria-label": "Question",
    });

    const answer = el("div", {
      className:
        "border-border bg-muted/40 mt-4 hidden min-h-16 rounded-lg border p-3 text-sm whitespace-pre-wrap",
      role: "status",
    });

    const error = el("p", {
      className: "text-accent mt-3 hidden text-sm",
      role: "alert",
    });

    const submit = el("button", {
      type: "button",
      className:
        "bg-accent text-background mt-3 rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90",
      text: "Ask",
    });

    function setBusy(busy) {
      submit.disabled = busy;
      submit.textContent = busy ? "Thinking…" : "Ask";
    }

    function showError(message) {
      error.textContent = message;
      error.classList.remove("hidden");
    }

    function hideError() {
      error.textContent = "";
      error.classList.add("hidden");
    }

    async function ask(text) {
      const q = (text || question.value).trim();
      if (!q) {
        showError("Type a question, or tap a suggested one.");
        return;
      }
      hideError();
      setBusy(true);
      answer.classList.add("hidden");
      try {
        const res = await fetch(proxy, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jd: jd.value.trim(), question: q }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          if (res.status === 429)
            throw new Error("Too many questions. Try again in a minute.");
          if (res.status >= 500)
            throw new Error("Chat is temporarily down. Email instead.");
          throw new Error(data.error || "Request failed.");
        }
        if (!data.answer) throw new Error("Empty reply. Try again.");
        answer.textContent = data.answer;
        answer.classList.remove("hidden");
      } catch (err) {
        showError(err instanceof Error ? err.message : "Chat is unavailable.");
      } finally {
        setBusy(false);
      }
    }

    const chips = el(
      "div",
      { className: "mt-3 flex flex-wrap gap-2" },
      SUGGESTED.map(label =>
        el("button", {
          type: "button",
          className:
            "border-border rounded-full border px-3 py-1 text-xs hover:text-accent",
          text: label,
          onClick: () => {
            question.value = label;
            ask(label);
          },
        })
      )
    );

    submit.addEventListener("click", () => ask());
    question.addEventListener("keydown", e => {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        ask();
      }
    });

    container.replaceChildren(
      el("p", {
        className: "mt-2 text-sm",
        text: "Paste a JD and ask why to hire him. Answers stay inside the listed experience — no invented numbers.",
      }),
      jd,
      question,
      chips,
      submit,
      error,
      answer
    );
  }

  function mount(container) {
    if (!document.body.contains(container)) return;
    if (initialized.has(container)) return;
    initialized.add(container);
    createWidget(container);
  }

  function initAll() {
    document
      .querySelectorAll('.recruiter-chat[data-viz="recruiter-chat"]')
      .forEach(mount);
  }

  initAll();
  document.addEventListener("astro:page-load", initAll);
})();
