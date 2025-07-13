export const app_name = "ai-chat-app";

export const app = _component("ai-chat-app", html`
  <link rel="stylesheet" type="text/css" href="./apps/ai-chat-app/styles.css" />

  <main-area>
    <header-title>AI Chat</header-title>

    <conversation-area></conversation-area>

    <div id="jarvis-orb" class="idle"></div>

    <input-area>
      <textarea id="messageInput" placeholder="Type a message..." autocomplete="off" rows="1"></textarea>
      <button id="sendButton">Send</button>
    </input-area>
  </main-area>
`, boot_up_app);

function boot_up_app(app) {
  const conversationArea = app.querySelector("conversation-area");
  const messageInput = app.querySelector("#messageInput");
  const sendButton = app.querySelector("#sendButton");
  const jarvisOrb = app.querySelector("#jarvis-orb");

  const GEMINI_API_KEY = "AIzaSyBmvvOHdCEkqg8UYVh2tVoe2EFEV5rLYvE";
  const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

  let messages = [
    {
      user: "AI",
      text: "You are an AI named Delta, created by Joshua The. Your mission is to follow what the user tells you to your extent and to be helpful and never harmful."
    }
  ];
  let isThinking = false;

  function renderMessages() {
    conversationArea.innerHTML = "";
    messages.forEach(({ user, text }, index) => {
      if (index === 0) return; // Hide first system message
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

  async function fetchScrape(url) {
    try {
      const resp = await fetch('https://nova-os-messaging-backend2.onrender.com/apify-scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await resp.json();
      if (data.success) {
        // Return the scraped text or structured data you want
        return data.results.map(item => item.text || item.content).join('\n');
      }
      return "Sorry, couldn't scrape the page.";
    } catch (e) {
      console.error('Scraping failed:', e);
      return "Error scraping page.";
    }
  }
  

  async function callGeminiAPI(prompt) {
    try {
      const resp = await fetch("https://nova-os-messaging-backend2.onrender.com/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt,
          history: messages
            .filter(m => m.user !== "System")
            .map(m => ({
              role: m.user === "You" ? "user" : "assistant",
              content: m.text
            }))
        }),
      });
      const data = await resp.json();
      if (data.success && data.answer) return data.answer;
      return "Sorry, something went wrong.";
    } catch (err) {
      console.error("Backend error:", err);
      return "Error calling backend.";
    }
  }
  

  async function sendMessage() {
    const text = messageInput.value.trim();
    if (!text) return;
    messageInput.value = "";
    messages.push({ user: "You", text });
    renderMessages();
  
    startThinking();
  
    const answer = await callGeminiAPI(text);
    messages.push({ user: "AI", text: answer });
    renderMessages();
  
    stopThinking();
  }
  

  jarvisOrb.classList.add("idle");
  renderMessages();
}
