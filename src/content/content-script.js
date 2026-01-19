(() => {
  const PANEL_ID = "ocn-nav";
  const NAV_CLASS = "ocn-panel";
  const ACTIVE_CLASS = "ocn-active";
  const MESSAGE_ID_ATTR = "data-ocn-id";

  // 状态管理
  const state = {
    items: [],
    observer: null,
    refreshTimer: null,
    mutationObserver: null,
    lastUrl: location.href,
    debugMode: false, // 生产环境关闭日志
    isRefreshing: false
  };

  const log = (...args) => {
    if (state.debugMode) console.log("[OCN]", ...args);
  };

  const getHostKey = () => {
    const host = location.host;
    if (host.includes("chatgpt.com") || host.includes("chat.openai.com")) return "chatgpt";
    if (host.includes("gemini.google.com")) return "gemini";
    return null;
  };

  const normalizeNodes = (nodes) => {
    const unique = Array.from(new Set(nodes));
    return unique.sort((a, b) => {
      const pos = a.compareDocumentPosition(b);
      return pos & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
    });
  };

  const collectChatGptMessages = () => {
    const selectors = [
      '[data-message-author-role="user"]',
      'article[data-testid^="conversation-turn-"] [data-message-author-role="user"]'
    ];
    for (const s of selectors) {
      const elms = document.querySelectorAll(s);
      if (elms.length > 0) return Array.from(elms);
    }
    return [];
  };

  const collectGeminiMessages = () => {
    // 优先使用 user-query 标签，这是 Gemini 最稳定的用户消息容器
    const queries = document.querySelectorAll('user-query');
    if (queries.length > 0) return Array.from(queries);

    // 如果没有，尝试通用的容器结构
    return Array.from(document.querySelectorAll('.conversation-container user-query, .query-text'));
  };

  const getUserMessages = () => {
    const host = getHostKey();
    let msgs = host === "chatgpt" ? collectChatGptMessages() : host === "gemini" ? collectGeminiMessages() : [];
    return normalizeNodes(msgs);
  };

  const ensurePanel = () => {
    let panel = document.getElementById(PANEL_ID);
    if (panel) return panel;

    panel = document.createElement("div");
    panel.id = PANEL_ID;
    panel.className = NAV_CLASS;
    panel.innerHTML = `
      <div class="ocn-scroll-content"></div>
    `;

    document.body.appendChild(panel);
    return panel;
  };

  const ensureId = (node, index) => {
    let id = node.getAttribute(MESSAGE_ID_ATTR);
    if (!id) {
      const container = node.closest('.conversation-container') || node.closest('article');
      id = container?.id ? `ocn-id-${container.id}` : `ocn-idx-${index}-${Math.random().toString(36).substr(2, 5)}`;
      node.setAttribute(MESSAGE_ID_ATTR, id);
    }
    return id;
  };

  const extractLabel = (node) => {
    const textEl = node.querySelector('.query-text') || node;
    const text = (textEl.innerText || "").trim().replace(/\s+/g, " ");
    return text || "(Empty Message)";
  };

  const setActive = (id) => {
    const panel = document.getElementById(PANEL_ID);
    if (!panel) return;
    panel.querySelectorAll(`.ocn-item`).forEach(item => {
      const isActive = item.getAttribute("data-ocn-id") === id;
      item.classList.toggle(ACTIVE_CLASS, isActive);
    });
  };

  const observeMessages = (messages) => {
    if (state.observer) state.observer.disconnect();

    const visibility = new Map();
    state.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const id = entry.target.getAttribute(MESSAGE_ID_ATTR);
        if (!id) return;
        if (entry.isIntersecting) {
          visibility.set(id, entry.boundingClientRect);
        } else {
          visibility.delete(id);
        }
      });

      if (visibility.size > 0) {
        const entries = Array.from(visibility.entries()).sort((a, b) => a[1].top - b[1].top);
        // 找到屏幕中间偏上的消息
        const best = entries.find(([, rect]) => rect.top >= 0) || entries[0];
        if (best) setActive(best[0]);
      }
    }, { threshold: 0.5, rootMargin: "-10% 0px -40% 0px" });

    messages.forEach(node => state.observer.observe(node));
  };

  const renderList = (messages) => {
    const panel = ensurePanel();
    const list = panel.querySelector(".ocn-scroll-content");
    if (!list) return;

    list.innerHTML = "";
    messages.forEach((node, index) => {
      const id = ensureId(node, index);
      const labelText = extractLabel(node);

      const item = document.createElement("button");
      item.className = "ocn-item";
      item.setAttribute("data-ocn-id", id);
      item.title = labelText; // 点击项的原生提示

      const indicator = document.createElement("div");
      indicator.className = "ocn-indicator";

      const label = document.createElement("span");
      label.className = "ocn-label";
      label.textContent = labelText;

      item.appendChild(indicator);
      item.appendChild(label);

      item.addEventListener("click", () => {
        const target = node.closest('.conversation-container') || node.closest('article') || node;
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        setActive(id);
      });

      list.appendChild(item);
    });

    log(`Rendered ${messages.length} items`);
  };

  const refreshNavigation = () => {
    if (state.isRefreshing) return;
    state.isRefreshing = true;

    requestAnimationFrame(() => {
      const messages = getUserMessages();
      const messageIds = messages.map((node, index) => ensureId(node, index));
      const hasChanged = messageIds.length !== state.items.length ||
        messageIds.some((id, idx) => id !== state.items[idx]);

      if (hasChanged) {
        state.items = messageIds;
        if (messages.length > 0) {
          renderList(messages);
          observeMessages(messages);
        } else {
          const panel = document.getElementById(PANEL_ID);
          if (panel) panel.remove();
        }
      }
      state.isRefreshing = false;
    });
  };

  const scheduleRefresh = () => {
    if (state.refreshTimer) clearTimeout(state.refreshTimer);
    state.refreshTimer = setTimeout(refreshNavigation, 500);
  };

  const init = () => {
    if (!getHostKey()) return;

    state.mutationObserver = new MutationObserver((mutations) => {
      const hasMeaningfulChange = mutations.some(m => m.addedNodes.length > 0 || m.removedNodes.length > 0);
      if (hasMeaningfulChange) scheduleRefresh();
    });

    state.mutationObserver.observe(document.body, { childList: true, subtree: true });

    // 处理 SPA 导航
    let lastUrl = location.href;
    setInterval(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        state.items = []; // 重置
        setTimeout(refreshNavigation, 1000);
      }
    }, 1000);

    refreshNavigation();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
