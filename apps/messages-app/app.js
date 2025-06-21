export const app_name = "messages-app";

export const app = _component("messagesapp", html`
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
      <textarea id="messageInput" placeholder="Type a message..." autocomplete="off" rows="1"></textarea>
      <button id="sendButton">Send</button>
    </input-area>

    <div id="progressBar"></div>
  </main-area>

  <!-- ADMIN PANEL MODAL -->
  <div id="adminPanel" style="display:none; position: fixed; top:10%; left: 50%; transform: translateX(-50%); background:#222; color:#eee; padding: 20px; border-radius: 8px; max-width:90vw; max-height:80vh; overflow-y:auto; z-index:10000;">
    <h3>Admin Panel</h3>
    <button id="closeAdminPanel" style="float:right; background:#f44336; border:none; color:#fff; font-weight:bold; cursor:pointer;">X</button>
    <h4>Users</h4>
    <ul id="userList" style="list-style:none; padding:0;"></ul>
    <button id="deleteAllMessagesBtn" style="margin-top:10px; background:#b22222; color:white; border:none; padding:8px 12px; cursor:pointer;">Delete All Messages</button>
  </div>
`, boot_up_app);

function boot_up_app(app) {
  // Elements inside component
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

  // ** Now fixing the scope: global DOM queries for admin panel **
  const adminPanel = document.getElementById("adminPanel");
  const closeAdminPanel = document.getElementById("closeAdminPanel");
  const userList = document.getElementById("userList");
  const deleteAllMessagesBtn = document.getElementById("deleteAllMessagesBtn");

  const backendUrl = "https://nova-os-messaging-backend.onrender.com";

  let isLogin = true;
  let user = null;
  let isAdmin = false;
  let adminPassword = null;

  function showError(text) { errorMessage.textContent = text; }

  function toggleLoginRegister() {
    isLogin = !isLogin;
    showError("");
    usernameInput.value = "";
    passwordInput.value = "";
    formTitle.textContent = isLogin ? "Login" : "Register";
    submitBtn.textContent = isLogin ? "Login" : "Register";
    toggleForm.innerHTML = isLogin
      ? `Don't have an account? <span class="toggle-link">Register here</span>`
      : `Already have an account? <span class="toggle-link">Login here</span>`;
  }
  toggleForm.addEventListener("click", toggleLoginRegister);

  function renderMessages(messages) {
    conversationArea.innerHTML = "";
    messages.forEach(msg => {
      const div = document.createElement("div");
      div.className = msg.user === user ? "message sent" : "message received";
      div.textContent = `${msg.user}: ${msg.text}`;
      conversationArea.appendChild(div);
    });
    conversationArea.scrollTop = conversationArea.scrollHeight;
  }

  async function fetchMessages() {
    try {
      const res = await fetch(`${backendUrl}/messages`);
      const data = await res.json();
      renderMessages(data);
    } catch {
      const cached = localStorage.getItem("nova-messages");
      if (cached) renderMessages(JSON.parse(cached));
    }
  }

  async function sendMessage() {
    const text = messageInput.value.trim();
    if (!text || !user) return;

    progressBar.style.width = "30%";
    try {
      const res = await fetch(`${backendUrl}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user, text }),
      });
      progressBar.style.width = "60%";
      if (res.ok) {
        messageInput.value = "";
        await fetchMessages();
        progressBar.style.width = "100%";
        setTimeout(() => progressBar.style.width = "0%", 500);
      }
    } catch {
      alert("Connection error.");
      progressBar.style.width = "0%";
    }
  }

  async function submitAuth() {
    showError("");
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    if (!username || !password) { showError("Username and password required"); return; }

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
          isAdmin = data.admin === true;
          adminPassword = isAdmin ? password : null;
          adminPanelButton.style.display = isAdmin ? "inline-block" : "none";
          showApp();
        } else {
          showError("Registration successful, please login.");
          toggleLoginRegister();
        }
      } else showError(data.error || "Operation failed.");
    } catch {
      showError("Network error.");
    }
  }

  submitBtn.addEventListener("click", submitAuth);
  passwordInput.addEventListener("keydown", e => { if (e.key === "Enter") submitAuth(); });

  sendButton.addEventListener("click", sendMessage);
  messageInput.addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  logoutButton.addEventListener("click", () => {
    user = null;
    isAdmin = false;
    adminPassword = null;
    adminPanelButton.style.display = "none";
    hideApp();
  });

  adminPanelButton.addEventListener("click", () => {
    loadUsers();
    adminPanel.style.display = "block";
  });
  closeAdminPanel.addEventListener("click", () => adminPanel.style.display = "none");

  async function loadUsers() {
    userList.innerHTML = "<li>Loading...</li>";
    try {
      const res = await fetch(`${backendUrl}/admin/list_users?admin_username=admin&admin_password=${encodeURIComponent(adminPassword)}`);
      const data = await res.json();
      if (!Array.isArray(data)) {
        userList.innerHTML = `<li>Error: ${data.error}</li>`;
        return;
      }
      userList.innerHTML = "";
      data
        .filter(u => u !== "admin")
        .forEach(u => {
          const li = document.createElement("li");
          li.textContent = u + " ";
          const btn = document.createElement("button");
          btn.textContent = "Delete";
          btn.addEventListener("click", () => deleteUser(u));
          li.appendChild(btn);
          userList.appendChild(li);
        });
    } catch {
      userList.innerHTML = "<li>Failed to load users</li>";
    }
  }

  async function deleteUser(u) {
    if (!confirm(`Delete user "${u}"?`)) return;
    await fetch(`${backendUrl}/admin/delete_user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ admin_username: "admin", admin_password: adminPassword, username: u }),
    });
    loadUsers();
    fetchMessages();
  }

  deleteAllMessagesBtn.addEventListener("click", async () => {
    if (!confirm("Delete ALL messages?")) return;
    await fetch(`${backendUrl}/admin/delete_all_messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ admin_username: "admin", admin_password: adminPassword }),
    });
    fetchMessages();
  });

  function showApp() {
    loginScreen.style.display = "none";
    mainArea.style.display = "flex";
    fetchMessages();
    setInterval(fetchMessages, 3000);
  }

  function hideApp() {
    loginScreen.style.display = "flex";
    mainArea.style.display = "none";
    usernameInput.value = "";
    passwordInput.value = "";
    errorMessage.textContent = "";
  }

  function adjustForKeyboardAndExpand() {
    const inputArea = app.querySelector("input-area");
    messageInput.style.height = "auto";
    messageInput.addEventListener("input", () => {
      messageInput.style.height = "auto";
      messageInput.style.height = `${messageInput.scrollHeight}px`;
    });
    window.addEventListener("resize", () => {
      const kb = window.innerHeight < screen.height * 0.75;
      inputArea.style.position = "fixed";
      inputArea.style.bottom = "0";
      conversationArea.style.paddingBottom = kb ? `${inputArea.offsetHeight}px` : "0";
    });
  }
  adjustForKeyboardAndExpand();

  hideApp();
}
