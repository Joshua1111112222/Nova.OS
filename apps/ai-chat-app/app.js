export const app_name = "ai-chat-app";

export const app = _component("ai-chat-app", html`
  <style>
    /* Entire styles.css inlined for simplicity */
    :host {
      display: block;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #eee;
      background: #121212;
      height: 100vh;
      position: relative;
      overflow: hidden;
    }

    .jarvis-orb {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 200px;
      height: 200px;
      border-radius: 50%;
      background: radial-gradient(circle at center, #6200ee 0%, #2a2a2a 70%);
      box-shadow:
        0 0 30px #6200ee,
        0 0 60px #bb86fc,
        0 0 90px #6200ee;
      opacity: 0.12;
      animation: pulse 3s infinite ease-in-out;
      pointer-events: none;
      z-index: 900;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 0.12;
        box-shadow:
          0 0 30px #6200ee,
          0 0 60px #bb86fc,
          0 0 90px #6200ee;
      }
      50% {
        opacity: 0.3;
        box-shadow:
          0 0 50px #bb86fc,
          0 0 80px #6200ee,
          0 0 110px #bb86fc;
      }
    }

    .chat-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 350px;
      max-height: 500px;
      background: rgba(30, 30, 30, 0.95);
      border-radius: 12px;
      box-shadow: 0 0 30px #6200ee;
      display: flex;
      flex-direction: column;
      padding: 10px;
      overflow-y: auto;
      gap: 8px;
      z-index: 1000;
    }

    .chat {
      display: flex;
      gap: 10px;
      max-width: 80%;
      align-items: flex-end;
      user-select: text;
    }

    .chat.outgoing {
      margin-left: auto;
      justify-content: flex-end;
    }

    .chat.outgoing p {
      background: linear-gradient(45deg, #6200ee, #3700b3);
      color: #fff;
      padding: 10px 14px;
      border-radius: 18px 18px 0 18px;
      font-size: 15px;
      word-wrap: break-word;
    }

    .chat.incoming {
      justify-content: flex-start;
    }

    .chat.incoming p {
      background: #2a2a2a;
      color: #bb86fc;
      padding: 10px 14px;
      border-radius: 18px 18px 18px 0;
      font-size: 15px;
      word-wrap: break-word;
    }

    .chat.incoming span {
      color: #bb86fc;
      font-size: 22px;
    }

    .chat p.error {
      color: #ff5555;
      font-style: italic;
    }

    .chat-input {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 350px;
      display: flex;
      gap: 10px;
      align-items: center;
      background: rgba(40, 40, 40, 0.95);
      padding: 12px 16px;
      border-radius: 30px;
      box-shadow: 0 0 15px #6200ee;
      z-index: 1001;
    }

    .chat-input textarea {
      flex-grow: 1;
      resize: none;
      border: none;
      background: transparent;
      color: #eee;
      font-size: 16px;
      height: 40px;
      line-height: 20px;
      padding: 8px 12px;
      border-radius: 20px;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      outline: none;
      overflow-y: auto;
    }

    .chat-input span.send-btn {
      cursor: pointer;
      color: #6200ee;
      font-size: 30px;
      user-select: none;
      transition: color 0.2s ease;
    }

    .chat-input span.send-btn:hover {
      color: #3700b3;
    }
  </style>

  <div class="jarvis-orb"></div>

  <ul class="chat-container"></ul>

  <div class="chat-input">
    <textarea placeholder="Type your message..." rows="1"></textarea>
    <span class="material-symbols-outlined send-btn">send</span>
  </div>
`);

let messageHistory = [];
let chatContainer;
let chatInput;
let sendBtn;

function createChatLi(message, className) {
  const li = document.createElement("li");
  li.className = `chat ${className}`;
  li.innerHTML =
    className === "outgoing"
      ? `<p>${message}</p>`
      : `<span class="material-symbols-outlined">smart_toy</span><p>${message}</p>`;
  return li;
}

function setup() {
  chatContainer = app.shadowRoot.querySelector(".chat-container");
  chatInput = app.shadowRoot.querySelector(".chat-input textarea");
  sendBtn = app.shadowRoot.querySelector(".chat-input span.send-btn");

  const inputInitHeight = chatInput.scrollHeight;

  chatInput.addEventListener("input", () => {
    chatInput.style.height = inputInitHeight + "px";
    chatInput.style.height = chatInput.scrollHeight + "px";
  });

  chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleChat();
    }
  });

  sendBtn.addEventListener("click", handleChat);
}

async function generateResponse(incomingChatLi) {
  const messageElement = incomingChatLi.querySelector("p");
  try {
    const lastUserMessage = chatContainer.querySelector(
      "li.chat.outgoing:last-child p"
    ).textContent;

    const payload = {
      prompt: lastUserMessage,
      history: messageHistory,
    };

    const res = await fetch("https://nova-os-messaging-backend.onrender.com", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (data.success) {
      messageElement.textContent = data.answer;

      messageHistory.push({ role: "user", content: lastUserMessage });
      messageHistory.push({ role: "assistant", content: data.answer });
    } else {
      messageElement.textContent = `Error: ${data.error}`;
      messageElement.classList.add("error");
    }
  } catch (e) {
    messageElement.textContent = "Error connecting to server.";
    messageElement.classList.add("error");
  } finally {
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }
}

function handleChat() {
  const userMessage = chatInput.value.trim();
  if (!userMessage) return;

  chatInput.value = "";
  chatInput.style.height = "40px";

  chatContainer.appendChild(createChatLi(userMessage, "outgoing"));
  chatContainer.scrollTop = chatContainer.scrollHeight;

  const incomingChatLi = createChatLi("Thinking...", "incoming");
  chatContainer.appendChild(incomingChatLi);
  chatContainer.scrollTop = chatContainer.scrollHeight;

  generateResponse(incomingChatLi);
}

// Wait for DOM or component to mount
setTimeout(setup, 50);
