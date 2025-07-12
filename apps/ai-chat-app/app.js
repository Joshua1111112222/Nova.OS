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

  // Jarvis orb controls
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
    if (isThinking) return; // if AI is thinking, keep thinking state
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

  async function sendMessage() {
    const text = messageInput.value.trim();
    if (!text) return;
    messageInput.value = "";
    messages.push({ user: "You", text });
    renderMessages();

    startThinking();

    try {
      const response = await fetch("https://nova-os-messaging-backend.onrender.com/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: text,
          history: [
            {
              role: "system",
              content: "You are an AI named Delta, created by Joshua The. Your mission is to follow what the user tells you to your extent and to be helpful and never harmful."
            },
            ...messages.map(({ user, text }) => ({
              role: user === "You" ? "user" : "assistant",
              content: text,
            })),
          ],
        }),
      });
      const data = await response.json();

      if (data.success) {
        messages.push({ user: "AI", text: data.answer });
      } else {
        messages.push({ user: "AI", text: "Sorry, I couldn't process that." });
      }
    } catch (err) {
      messages.push({ user: "AI", text: "Network error or backend unavailable." });
    }

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

  // Initialize orb idle animation
  jarvisOrb.classList.add("idle");

  renderMessages(); // Show the initial AI message on load
}
