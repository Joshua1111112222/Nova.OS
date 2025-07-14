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
  
    // Clear input on search click
    messageInput.value = "";
  
    startThinking();
  
    // ✅ Do a real web search
    try {
      const searchResponse = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(text)}&format=json&no_html=1&skip_disambig=1`);
      const searchData = await searchResponse.json();
  
      let results = searchData?.AbstractText || "No results found.";
      if (searchData.RelatedTopics && searchData.RelatedTopics.length > 0) {
        results += "\n\nSome related topics:\n";
        results += searchData.RelatedTopics.slice(0, 3).map(t => `- ${t.Text}`).join("\n");
      }
  
      // Optionally ask Gemini to refine
      const finalPrompt = `Here is the user's question: "${text}". Here are some quick web results:\n${results}\n\nPlease give a clear, helpful answer.`;
  
      let finalAnswer = await callGeminiAPI(finalPrompt);
  
      if (!finalAnswer) {
        finalAnswer = `I found this from the web:\n${results}`;
      }
  
      messages.push({ user: "You", text });
      messages.push({ user: "AI", text: finalAnswer });
      renderMessages();
  
    } catch (err) {
      console.error("Search error:", err);
      messages.push({ user: "AI", text: "Sorry, the web search failed. Please try again later." });
      renderMessages();
    }
  
    stopThinking();
    messageCount++;
  });
  
  jarvisOrb.classList.add("idle");
  renderMessages();
}
