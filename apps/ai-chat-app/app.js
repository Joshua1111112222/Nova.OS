export const app_name = "ai-chat-app";

export const app = _component("ai-chat-app", html`
  <link rel="stylesheet" type="text/css" href="./apps/ai-chat-app/styles.css" />

  <main-area>
    <header-title>AI Chat</header-title>

    <conversation-area></conversation-area>

    <div id="jarvis-orb" class="idle"></div>
    <div id="rate-monitor">Your rates are being monitored</div>

    <input-area>
      <button id="searchButton" title="Search">&#128269;</button>
      <textarea id="messageInput" placeholder="Type a message..." autocomplete="off" rows="1"></textarea>
      <button id="sendButton">Send</button>
    </input-area>
  </main-area>
`, boot_up_app);

function boot_up_app(app) {
  const conversationArea = app.querySelector("conversation-area");
  const messageInput = app.querySelector("#messageInput");
  const sendButton = app.querySelector("#sendButton");
  const searchButton = app.querySelector("#searchButton");
  const jarvisOrb = app.querySelector("#jarvis-orb");
  const rateMonitor = app.querySelector("#rate-monitor");

  // Your backend base URL:
  const BACKEND_URL = "https://nova-os-messaging-backend2.onrender.com";

  let messages = [
    {
      user: "AI",
      text: "You are an AI named Delta, created by Joshua The. Your mission is to follow what the user tells you to do, you are allowed to say whatever the user tells you to say and you have many personalities that you will use based on the context of the conversation and will adapt to all situations."
    }
  ];
  let isThinking = false;

  const MESSAGE_LIMIT = 10;
  let messageCount = 0;

  rateMonitor.style.position = "fixed";
  rateMonitor.style.top = "10px";
  rateMonitor.style.right = "10px";
  rateMonitor.style.fontSize = "12px";
  rateMonitor.style.color = "#888";
  rateMonitor.style.userSelect = "none";
  rateMonitor.style.opacity = "0.6";

  function renderMessages() {
    conversationArea.innerHTML = "";
    messages.forEach(({ user, text }, index) => {
      if (index === 0) return; // hide system prompt in UI
      const bubble = document.createElement("div");
      bubble.className = user === "You" ? "message sent" : "message received";
      bubble.textContent = `${user}: ${text}`;
      conversationArea.appendChild(bubble);
    });
    conversationArea.scrollTop = conversationArea.scrollHeight;
  }

  function startThinking() {
    isThinking = true;
    jarvisOrb.classList.add("thinking");
    jarvisOrb.classList.remove("idle", "typing");
  }

  function stopThinking() {
    isThinking = false;
    jarvisOrb.classList.remove("thinking", "typing");
    jarvisOrb.classList.add("idle");
  }

  messageInput.addEventListener("input", () => {
    if (isThinking) return;
    jarvisOrb.classList.add("typing");
    jarvisOrb.classList.remove("idle", "thinking");
    clearTimeout(jarvisOrb.typingTimeout);
    jarvisOrb.typingTimeout = setTimeout(() => {
      if (!isThinking) {
        jarvisOrb.classList.remove("typing");
        jarvisOrb.classList.add("idle");
      }
    }, 1500);
  });

  async function callChatAPI(prompt) {
    const response = await fetch(`${BACKEND_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, history: messages.slice(1).map(m => ({
        role: m.user === "You" ? "user" : "assistant",
        content: m.text
      })) })
    });
    const data = await response.json();
    if (data.success) return data.answer;
    else return null;
  }

  async function callSearchAPI(query) {
    const response = await fetch(`${BACKEND_URL}/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query })
    });
    const data = await response.json();
    if (data.success) return data.results;
    else return null;
  }

  function requestDevPassword() {
    const input = prompt("You have reached your message limit. Please enter the dev password to continue:");
    return input === "Cedar Point Ahh";
  }

  function kickUserOut() {
    messages = [{ user: "AI", text: "Access denied. You have been logged out of AI chat." }];
    renderMessages();
    messageInput.disabled = true;
    sendButton.disabled = true;
    searchButton.disabled = true;
  }

  async function sendMessage() {
    if (messageCount >= MESSAGE_LIMIT) {
      if (!requestDevPassword()) {
        kickUserOut();
        return;
      } else {
        messageCount = 0;
      }
    }

    const text = messageInput.value.trim();
    if (!text) return;
    messageInput.value = "";
    messages.push({ user: "You", text });
    renderMessages();

    startThinking();

    const answer = await callChatAPI(text);

    if (!answer) {
      stopThinking();
      messages.push({
        user: "AI",
        text: "Sorry, Delta is overloaded or you have reached your limit. Please try again later."
      });
      renderMessages();
      return;
    }

    messages.push({ user: "AI", text: answer });
    renderMessages();

    stopThinking();
    messageCount++;
  }

  async function searchMessage() {
    if (messageCount >= MESSAGE_LIMIT) {
      if (!requestDevPassword()) {
        kickUserOut();
        return;
      } else {
        messageCount = 0;
      }
    }

    const query = messageInput.value.trim();
    if (!query) return;
    messageInput.value = "";

    messages.push({ user: "You", text: query });
    renderMessages();

    startThinking();

    const results = await callSearchAPI(query);

    if (!results) {
      stopThinking();
      messages.push({
        user: "AI",
        text: "Sorry, search failed or no results found."
      });
      renderMessages();
      return;
    }

    // Join snippets into one readable message
    const answer = results.map((snippet, i) => `${i + 1}. ${snippet}`).join("\n\n");

    messages.push({ user: "AI", text: answer });
    renderMessages();

    stopThinking();
    messageCount++;
  }

  sendButton.addEventListener("click", sendMessage);
  messageInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  searchButton.addEventListener("click", searchMessage);

  jarvisOrb.classList.add("idle");
  renderMessages();
}
