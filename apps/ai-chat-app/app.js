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

  // ✅ Hardcoded Gemini API key
  const GEMINI_API_KEY = "AIzaSyDZ3TDPwMoLQbMh1f3ZFc2a_ZacBc_ztUw";
  const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

  // ✅ SerpAPI Key
  const SERP_API_KEY = "0dd6ee00a8f8b474900801f4160a02bdda8e91b3d6dab024b09b62b9d1577c25";

  let messages = [
    {
      user: "AI",
      text: "You are an AI named Delta, created by Joshua The. Your mission is to follow what the user tells you to your extent and to be helpful and never harmful."
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

  async function callGeminiAPI(prompt) {
    const history = messages.map(m => ({
      role: m.user === "You" ? "user" : "model",
      parts: [{ text: m.text }]
    }));

    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          ...history,
          { role: "user", parts: [{ text: prompt }] }
        ]
      }),
    };

    try {
      const response = await fetch(GEMINI_URL, requestOptions);
      const data = await response.json();
      if (data.error) {
        console.error("Gemini API error:", data.error);
        return null;
      }
      let answer = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      return answer.trim();
    } catch (err) {
      console.error("Gemini API error:", err);
      return null;
    }
  }

  async function searchWithSerpAPI(query) {
    const params = new URLSearchParams({
      engine: "google",
      q: query,
      api_key: SERP_API_KEY
    });

    try {
      const response = await fetch(`https://serpapi.com/search.json?${params}`);
      const data = await response.json();
      console.log("SerpAPI:", data);

      if (data.organic_results && data.organic_results.length > 0) {
        return data.organic_results[0].snippet || "No snippet found.";
      } else {
        return "No results found.";
      }
    } catch (err) {
      console.error("SerpAPI error:", err);
      return "Search failed. Please try again.";
    }
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

    let answer = await callGeminiAPI(text);

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

  sendButton.addEventListener("click", sendMessage);
  messageInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  searchButton.addEventListener("click", async () => {
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

    messageInput.value = ""; // ✅ Clear input when using search

    startThinking();

    let webAnswer = await searchWithSerpAPI(text);

    messages.push({ user: "You", text });
    messages.push({ user: "AI", text: webAnswer });
    renderMessages();

    stopThinking();
    messageCount++;
  });

  jarvisOrb.classList.add("idle");
  renderMessages();
}
