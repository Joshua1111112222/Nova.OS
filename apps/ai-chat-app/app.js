export const app_name = "ai-chat-app";

export const app = _component("ai-chat-app", html`
  <link rel="stylesheet" type="text/css" href="./apps/ai-chat-app/styles.css" />
  <style>
    /* Animation Styles */
    @keyframes pulse {
      0% { opacity: 0.6; }
      50% { opacity: 1; }
      100% { opacity: 0.6; }
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    /* Element Styles */
    #searchToggle.active {
      background: rgba(0, 120, 255, 0.1);
      color: #0078ff;
      animation: pulse 2s infinite;
    }
    #searchToggle.searching {
      background: rgba(0, 200, 100, 0.1);
      color: #00c864;
    }
    #jarvis-orb.thinking {
      animation: spin 1.5s linear infinite;
    }
    .message.system {
      color: #888;
      font-size: 0.9em;
      font-style: italic;
    }
  </style>

  <main-area>
    <header-title>AI Chat</header-title>

    <conversation-area></conversation-area>

    <div id="jarvis-orb" class="idle"></div>
    <div id="rate-monitor">Your rates are being monitored</div>

    <input-area>
      <button id="searchToggle" title="Enable web search">🌐</button>
      <textarea id="messageInput" placeholder="Type a message..." autocomplete="off" rows="1"></textarea>
      <button id="sendButton">Send</button>
    </input-area>
  </main-area>
`, boot_up_app);

function boot_up_app(app) {
  // DOM Elements
  const conversationArea = app.querySelector("conversation-area");
  const messageInput = app.querySelector("#messageInput");
  const sendButton = app.querySelector("#sendButton");
  const searchToggle = app.querySelector("#searchToggle");
  const jarvisOrb = app.querySelector("#jarvis-orb");
  const rateMonitor = app.querySelector("#rate-monitor");

  // Configuration
  const BACKEND_URL = "https://delta-backend-223m.onrender.com";
  const MESSAGE_LIMIT = 10;
  let messageCount = 0;
  let isSearchMode = false;
  let isThinking = false;

  // Chat History
  let messages = [{
    user: "AI",
    text: "You are Delta, an AI created by Joshua The. Your mission is to follow what the user tells you to your full capability, adapting to any situation while remaining helpful and never harmful."
  }];

  // UI Functions
  function renderMessages() {
    conversationArea.innerHTML = "";
    messages.forEach((msg, index) => {
      if (index === 0) return; // Skip system message
      
      const bubble = document.createElement("div");
      bubble.className = `message ${msg.user.toLowerCase()} ${msg.user === "System" ? "system" : ""}`;
      bubble.innerHTML = `
        <strong>${msg.user}:</strong> ${msg.text}
        ${msg.sources ? `<div class="sources">Sources: ${msg.sources.map(s => s.link).join(', ')}</div>` : ''}
      `;
      conversationArea.appendChild(bubble);
    });
    conversationArea.scrollTop = conversationArea.scrollHeight;
  }

  function setThinking(state) {
    isThinking = state;
    jarvisOrb.className = state ? "thinking" : "idle";
  }

  // API Functions
  async function callBackend(prompt) {
    const endpoint = isSearchMode ? "/api/gemini-with-search" : "/api/gemini";
    
    try {
      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });
      
      return await response.json();
    } catch (error) {
      console.error("API Error:", error);
      return { answer: "Connection failed", sources: [] };
    }
  }

  // Message Handling
  async function sendMessage() {
    // Rate limiting
    if (messageCount >= MESSAGE_LIMIT && !confirm("You've reached the message limit. Continue?")) {
      return;
    }

    const text = messageInput.value.trim();
    if (!text) return;

    // Prepare UI
    messageInput.value = "";
    messages.push({ user: "You", text });
    renderMessages();
    setThinking(true);

    // Add searching indicator if needed
    if (isSearchMode) {
      searchToggle.classList.add("searching");
      messages.push({ 
        user: "System", 
        text: "🔍 Searching for current information..." 
      });
      renderMessages();
    }

    // Get response
    const { answer, sources } = await callBackend(text);
    messages.push({ user: "AI", text: answer, sources });
    
    // Clean up
    setThinking(false);
    searchToggle.classList.remove("active", "searching");
    isSearchMode = false;
    messageCount++;
    renderMessages();
  }

  // Event Listeners
  searchToggle.addEventListener("click", () => {
    isSearchMode = !isSearchMode;
    searchToggle.classList.toggle("active", isSearchMode);
    messageInput.focus();
  });

  sendButton.addEventListener("click", sendMessage);
  messageInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // Initialize
  renderMessages();
}