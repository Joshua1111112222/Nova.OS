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

  const GEMINI_API_KEY = "AIzaSyBmvvOHdCEkqg8UYVh2tVoe2EFEV5rLYvE"; // Replace with your real Gemini API key

  let messages = [
    {
      user: "AI",
      text: "You are an AI named Delta, created by Joshua The. Your mission is to follow what the user tells you to your extent and to be helpful and never harmful."
    }
  ];
  let isThinking = false;

  function renderMessages() {
    conversationArea.innerHTML = "";
    messages.forEach(({ user, text }) => {
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

  async function callGeminiAPI(prompt, history) {
    // Gemini API expects a POST request with { messages: [...] }
    const messagesForGemini = [
      {
        role: "system",
        content: "You are an AI named Delta, created by Joshua The. Your mission is to follow what the user tells you to your extent and to be helpful and never harmful."
      },
      ...history.map(({ user, text }) => ({
        role: user === "You" ? "user" : "assistant",
        content: text,
      })),
      {
        role: "user",
        content: prompt,
      },
    ];

    try {
      const response = await fetch("https://generativeai.googleapis.com/v1beta2/models/chat-bison-001:generateMessage?key=" + GEMINI_API_KEY, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          "messages": messagesForGemini,
          "temperature": 0.7,
          "candidateCount": 1,
        }),
      });

      const data = await response.json();

      // Extract answer text from Gemini response
      let answer = data?.candidates?.[0]?.content || "";

      return answer.trim();
    } catch (err) {
      console.error("Gemini API error:", err);
      return "";
    }
  }

  async function callBackendFallback(prompt, history) {
    try {
      const response = await fetch("https://nova-os-messaging-backend.onrender.com", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          history: history.map(({ user, text }) => ({
            role: user === "You" ? "user" : "assistant",
            content: text,
          })),
        }),
      });

      const data = await response.json();
      if (data.success && data.answer) {
        return data.answer;
      } else {
        return "Sorry, I couldn't process that.";
      }
    } catch (err) {
      console.error("Backend fallback error:", err);
      return "Network error or backend unavailable.";
    }
  }

  async function sendMessage() {
    const text = messageInput.value.trim();
    if (!text) return;
    messageInput.value = "";
    messages.push({ user: "You", text });
    renderMessages();

    startThinking();

    // Call Gemini API first
    let answer = await callGeminiAPI(text, messages);

    // Check for generic/empty answer and fallback if needed
    if (
      !answer ||
      answer.length < 5 ||
      answer.toLowerCase().includes("i don't know") ||
      answer.toLowerCase().includes("as an ai") ||
      answer.toLowerCase().includes("sorry") ||
      answer.toLowerCase().includes("unable")
    ) {
      // fallback to backend scraping search
      answer = await callBackendFallback(text, messages);
    }

    messages.push({ user: "AI", text: answer });
    renderMessages();

    stopThinking();
  }

  sendButton.addEventListener("click", sendMessage);
  messageInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  jarvisOrb.classList.add("idle");
  renderMessages();
}
