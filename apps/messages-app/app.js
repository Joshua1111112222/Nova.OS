export const app_name = "messages-app";

export const app = _component("messages-app", html`
  <link rel="stylesheet" type="text/css" href="./apps/messages-app/styles.css">

  <!-- LOGIN / REGISTER SCREEN -->
  <div id="loginScreen" class="login-container">
    <div class="login-box">
      <h2 id="formTitle">Login</h2>
      <div id="errorMessage"></div>

      <label for="usernameInput">Username</label>
      <input id="usernameInput" type="text" placeholder="Enter username" autocomplete="username" />

      <label for="passwordInput">Password</label>
      <input id="passwordInput" type="password" placeholder="Enter password" autocomplete="current-password" />

      <button id="submitBtn">Login</button>

      <div class="login-toggle" id="toggleForm">
        Don't have an account? <span class="toggle-link">Register here</span>
      </div>
    </div>
  </div>

  <!-- MESSAGES APP -->
  <main-area style="display:none;">
    <header-title>
      Messages
      <button id="logoutButton" title="Logout">Logout</button>
      <button id="adminPanelButton" title="Admin Panel" style="display:none;">Admin</button>
    </header-title>

    <conversation-area></conversation-area>

    <input-area>
      <input id="messageInput" type="text" placeholder="Type a message..." autocomplete="off" />
      <button id="sendButton">Send</button>
    </input-area>

    <div id="progressBar"></div>
  </main-area>
`, boot_up_app);

function boot_up_app(app) {
  // Elements
  const loginScreen = app.querySelector("#loginScreen");
  const formTitle = app.querySelector("#formTitle");
  const errorMessage = app.querySelector("#errorMessage");
  const usernameInput = app.querySelector("#usernameInput");
  const passwordInput = app.querySelector("#passwordInput");
  const submitBtn = app.querySelector("#submitBtn");
  const toggleForm = app.querySelector("#toggleForm");
  const mainArea = app.querySelector("main-area");
  const logoutButton = app.querySelector("#logoutButton");
  const adminPanelButton = app.querySelector("#adminPanelButton");
  const conversationArea = app.querySelector("conversation-area");
  const messageInput = app.querySelector("#messageInput");
  const sendButton = app.querySelector("#sendButton");
  const progressBar = app.querySelector("#progressBar");

  const backendUrl = "https://nova-os-messaging-backend.onrender.com";

  let isLogin = true;
  let user = null;

  // Show error helper
  function showError(text) {
    errorMessage.textContent = text;
  }

  // Toggle Login/Register form
  function toggleLoginRegister() {
    isLogin = !isLogin;
    showError("");
    usernameInput.value = "";
    passwordInput.value = "";
    if (isLogin) {
      formTitle.textContent = "Login";
      submitBtn.textContent = "Login";
      toggleForm.innerHTML = `Don't have an account? <span class="toggle-link">Register here</span>`;
    } else {
      formTitle.textContent = "Register";
      submitBtn.textContent = "Register";
      toggleForm.innerHTML = `Already have an account? <span class="toggle-link">Login here</span>`;
    }
  }

  toggleForm.addEventListener("click", toggleLoginRegister);

  // Render messages in conversation area
  function renderMessages(messages) {
    conversationArea.innerHTML = "";
    messages.forEach((msg) => {
      const messageBubble = document.createElement("div");
      messageBubble.className = msg.user === user ? "message sent" : "message received";
      messageBubble.textContent = `${msg.user}: ${msg.text}`;
      conversationArea.appendChild(messageBubble);
    });
    conversationArea.scrollTop = conversationArea.scrollHeight;
  }

  // Fetch messages (no auth header needed)
  async function fetchMessages() {
    try {
      const response = await fetch(`${backendUrl}/messages`);
      const data = await response.json();
      if (response.ok && data) {
        localStorage.setItem("nova-messages", JSON.stringify(data));
        renderMessages(data);
      } else {
        const cached = localStorage.getItem("nova-messages");
        if (cached) renderMessages(JSON.parse(cached));
      }
    } catch {
      const cached = localStorage.getItem("nova-messages");
      if (cached) renderMessages(JSON.parse(cached));
    }
  }

  // Send message with { user, text }
  async function sendMessage() {
    const text = messageInput.value.trim();
    if (!text || !user) return;

    progressBar.style.width = "30%";

    try {
      const response = await fetch(`${backendUrl}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user, text }),
      });

      progressBar.style.width = "60%";

      if (response.ok) {
        messageInput.value = "";
        await fetchMessages();
        progressBar.style.width = "100%";
        setTimeout(() => (progressBar.style.width = "0%"), 500);
      } else {
        const err = await response.json();
        alert(err.error || "Failed to send message.");
        progressBar.style.width = "0%";
      }
    } catch {
      alert("Connection error.");
      progressBar.style.width = "0%";
    }
  }

  // Login or register user
  async function submitAuth() {
    showError("");
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
      showError("Please enter username and password.");
      return;
    }

    const endpoint = isLogin ? "/login" : "/register";

    try {
      const res = await fetch(`${backendUrl}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (data.success) {
        if (isLogin) {
          user = data.username;
          showApp();
        } else {
          showError("Registration successful! You can now log in.");
          toggleLoginRegister();
        }
      } else {
        showError(data.error || "Operation failed.");
      }
    } catch {
      showError("Network error.");
    }
  }

  submitBtn.addEventListener("click", submitAuth);
  passwordInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") submitAuth();
  });

  sendButton.addEventListener("click", sendMessage);
  messageInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
  });

  logoutButton.addEventListener("click", () => {
    user = null;
    hideApp();
  });

  // Show messages app, hide login
  function showApp() {
    loginScreen.style.display = "none";
    mainArea.style.display = "flex";
    fetchMessages();
    setInterval(fetchMessages, 3000);
  }

  // Show login, hide messages app
  function hideApp() {
    loginScreen.style.display = "flex";
    mainArea.style.display = "none";
    usernameInput.value = "";
    passwordInput.value = "";
    errorMessage.textContent = "";
  }

  // Ensure the keyboard doesn't overlap the input area
function adjustForKeyboard() {
    const inputArea = app.querySelector("input-area");
    const conversationArea = app.querySelector("conversation-area");
  
    // Adjust layout when the keyboard is shown
    window.addEventListener("resize", () => {
      const isKeyboardVisible = window.innerHeight < screen.height * 0.8; // Detect if keyboard is visible
      if (isKeyboardVisible) {
        inputArea.style.position = "absolute";
        inputArea.style.bottom = "0";
        inputArea.style.width = "100%";
        conversationArea.style.paddingBottom = `${inputArea.offsetHeight}px`; // Prevent overlap
      } else {
        inputArea.style.position = "relative";
        inputArea.style.bottom = "unset";
        conversationArea.style.paddingBottom = "0";
      }
    });
  }
  
  // Call the function to handle keyboard adjustments
  adjustForKeyboard();

  // On load, always show login (no session token)
  hideApp();
}
