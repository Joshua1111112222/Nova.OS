export const app_name = "ai-chat-app";

export const app = _component("ai-chat-app", html`
  <link rel="stylesheet" type="text/css" href="./apps/ai-chat-app/styles.css">

  <main-area>
    <header-title>
      Ready when you are, <span id="userNamePlaceholder"></span>!
    </header-title>

    <ai-conversation-area id="aiConversationArea"></ai-conversation-area>

    <input-area>
      <textarea id="aiPromptInput" placeholder="Ask me anything..." rows="2"></textarea>
      <button id="askAiButton">Ask</button>
    </input-area>

    <div id="aiProgressBar"></div>
  </main-area>
`, boot_up_app);

function boot_up_app(app) {
  const conversationArea = app.querySelector("#aiConversationArea");
  const aiPromptInput = app.querySelector("#aiPromptInput");
  const askAiButton = app.querySelector("#askAiButton");
  const progressBar = app.querySelector("#aiProgressBar");
  const userNamePlaceholder = app.querySelector("#userNamePlaceholder");

  const backendUrl = "https://nova-os-messaging-backend.onrender.com"; // replace this
  const username = localStorage.getItem("nova-user") || "Friend";
  userNamePlaceholder.textContent = username;

  let conversationHistory = [
    { role: "system", content: `You are a helpful AI assistant talking to ${username}.` }
  ];

  async function askAI() {
    const prompt = aiPromptInput.value.trim();
    if (!prompt) return;

    // Add user message
    conversationHistory.push({ role: "user", content: prompt });

    appendMessage(username, prompt);

    aiPromptInput.value = "";
    askAiButton.disabled = true;
    progressBar.style.width = "30%";

    appendMessage("AI", "Thinking...");

    try {
      const response = await fetch(`${backendUrl}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history: conversationHistory })
      });

      progressBar.style.width = "70%";

      const data = await response.json();

      // Remove placeholder "Thinking..."
      conversationArea.removeChild(conversationArea.lastChild);

      if (data.success) {
        conversationHistory.push({ role: "assistant", content: data.answer });
        appendMessage("AI", data.answer);
      } else {
        appendMessage("AI", "Error: " + (data.error || "Unknown error"));
      }

    } catch {
      appendMessage("AI", "Network error.");
    } finally {
      askAiButton.disabled = false;
      progressBar.style.width = "100%";
      setTimeout(() => progressBar.style.width = "0%", 500);
    }
  }

  function appendMessage(sender, text) {
    const bubble = document.createElement("div");
    bubble.className = sender === username ? "ai-message user" : "ai-message ai";
    bubble.textContent = `${sender}: ${text}`;
    conversationArea.appendChild(bubble);
    conversationArea.scrollTop = conversationArea.scrollHeight;
  }

  askAiButton.addEventListener("click", askAI);
  aiPromptInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      askAI();
    }
  });
}
