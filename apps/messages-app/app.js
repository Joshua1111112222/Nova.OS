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
      <textarea id="messageInput" placeholder="Type a message..." autocomplete="off" rows="1"></textarea>
      <button id="sendButton">Send</button>
    </input-area>

    <div id="progressBar"></div>

    <button class="scroll-to-bottom-btn" id="scrollToBottomBtn" title="Scroll to bottom">&#x25BC;</button>
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
  const scrollToBottomBtn = app.querySelector("#scrollToBottomBtn");

  const adminPanel = app.querySelector("#adminPanel");
  const closeAdminPanel = app.querySelector("#closeAdminPanel");
  const userList = app.querySelector("#userList");
  const deleteAllMessagesBtn = app.querySelector("#deleteAllMessagesBtn");

  const backendUrl = "https://nova-os-messaging-backend.onrender.com";

  let isLogin = true;
  let user = null;
  let isAdmin = false;
  let adminPassword = null;

  // Store latest fetched messages here
  let messages = [];

  function showError(text) {
    errorMessage.textContent = text;
  }

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

  // Render messages with edit/delete buttons
  function renderMessages(msgs) {
    conversationArea.innerHTML = "";

    msgs.forEach((msg) => {
      const messageBubble = document.createElement("div");
      messageBubble.className = msg.user === user ? "message sent" : "message received";

      // Message text container
      const messageText = document.createElement("div");
      messageText.className = "message-text";
      messageText.textContent = `${msg.user}: ${msg.text}`;

      messageBubble.appendChild(messageText);

      // Edit and delete buttons container
      const canEditDelete =
        isAdmin || (msg.user === user);

      if (canEditDelete) {
        const btnContainer = document.createElement("div");
        btnContainer.className = "message-buttons";

        // Edit button
        const editBtn = document.createElement("button");
        editBtn.className = "msg-btn";
        editBtn.textContent = "Edit";
        editBtn.addEventListener("click", () => startEditingMessage(msg, messageBubble, messageText, btnContainer));
        btnContainer.appendChild(editBtn);

        // Delete button
        const deleteBtn = document.createElement("button");
        deleteBtn.className = "msg-btn";
        deleteBtn.textContent = "Delete";
        deleteBtn.addEventListener("click", () => deleteMessage(msg.id));
        btnContainer.appendChild(deleteBtn);

        messageBubble.appendChild(btnContainer);
      }

      conversationArea.appendChild(messageBubble);
    });

    // Scroll to bottom after rendering unless user manually scrolled up
    if (isScrolledNearBottom()) {
      scrollToBottom();
      hideScrollButton();
    }
  }

  // Check if scroll is near bottom (within 50px)
  function isScrolledNearBottom() {
    return conversationArea.scrollHeight - conversationArea.scrollTop - conversationArea.clientHeight < 50;
  }

  function scrollToBottom() {
    conversationArea.scrollTop = conversationArea.scrollHeight;
  }

  function showScrollButton() {
    scrollToBottomBtn.style.display = "flex";
  }

  function hideScrollButton() {
    scrollToBottomBtn.style.display = "none";
  }

  // Fetch messages from backend
  async function fetchMessages() {
    try {
      const response = await fetch(`${backendUrl}/messages`);
      const data = await response.json();
      if (response.ok && data) {
        messages = data;
        localStorage.setItem("nova-messages", JSON.stringify(data));
        renderMessages(data);
      } else {
        const cached = localStorage.getItem("nova-messages");
        if (cached) {
          messages = JSON.parse(cached);
          renderMessages(messages);
        }
      }
    } catch {
      const cached = localStorage.getItem("nova-messages");
      if (cached) {
        messages = JSON.parse(cached);
        renderMessages(messages);
      }
    }
  }

  // Send new message
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

  // Start editing a message
  function startEditingMessage(msg, messageBubble, messageText, btnContainer) {
    // Hide text and buttons
    messageText.style.display = "none";
    btnContainer.style.display = "none";

    // Create edit textarea
    const editTextarea = document.createElement("textarea");
    editTextarea.className = "edit-input";
    editTextarea.value = msg.text;
    editTextarea.rows = 2;

    // Create save and cancel buttons
    const controls = document.createElement("div");
    controls.className = "edit-controls";

    const saveBtn = document.createElement("button");
    saveBtn.className = "msg-btn";
    saveBtn.textContent = "Save";

    const cancelBtn = document.createElement("button");
    cancelBtn.className = "msg-btn";
    cancelBtn.textContent = "Cancel";

    controls.appendChild(saveBtn);
    controls.appendChild(cancelBtn);

    messageBubble.appendChild(editTextarea);
    messageBubble.appendChild(controls);

    saveBtn.addEventListener("click", async () => {
      const newText = editTextarea.value.trim();
      if (!newText) {
        alert("Message cannot be empty.");
        return;
      }
      const authUsername = user;
      const authPassword = isAdmin ? adminPassword : passwordInput.value;
      if (!authPassword && !isAdmin) {
        alert("Password required to edit message.");
        return;
      }
      try {
        const res = await fetch(`${backendUrl}/edit_message`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: authUsername,
            password: authPassword,
            message_id: msg.id,
            new_text: newText,
          }),
        });
        const data = await res.json();
        if (data.success) {
          msg.text = newText;
          renderMessages(messages);
        } else {
          alert(data.error || "Failed to edit message.");
        }
      } catch {
        alert("Network error.");
      }
    });

    cancelBtn.addEventListener("click", () => {
      editTextarea.remove();
      controls.remove();
      messageText.style.display = "";
      btnContainer.style.display = "";
    });
  }

  // Add a flag to track whether editing is in progress
let isEditingMessage = false;

// Start editing a message
function startEditingMessage(msg, messageBubble, messageText, btnContainer) {
  // Set the editing flag to true
  isEditingMessage = true;

  // Hide text and buttons
  messageText.style.display = "none";
  btnContainer.style.display = "none";

  // Create edit textarea
  const editTextarea = document.createElement("textarea");
  editTextarea.className = "edit-input";
  editTextarea.value = msg.text;
  editTextarea.rows = 2;

  // Create save and cancel buttons
  const controls = document.createElement("div");
  controls.className = "edit-controls";

  const saveBtn = document.createElement("button");
  saveBtn.className = "msg-btn";
  saveBtn.textContent = "Save";

  const cancelBtn = document.createElement("button");
  cancelBtn.className = "msg-btn";
  cancelBtn.textContent = "Cancel";

  controls.appendChild(saveBtn);
  controls.appendChild(cancelBtn);

  messageBubble.appendChild(editTextarea);
  messageBubble.appendChild(controls);

  saveBtn.addEventListener("click", async () => {
    const newText = editTextarea.value.trim();
    if (!newText) {
      alert("Message cannot be empty.");
      return;
    }
    const authUsername = user;
    const authPassword = isAdmin ? adminPassword : passwordInput.value;
    if (!authPassword && !isAdmin) {
      alert("Password required to edit message.");
      return;
    }
    try {
      const res = await fetch(`${backendUrl}/edit_message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: authUsername,
          password: authPassword,
          message_id: msg.id,
          new_text: newText,
        }),
      });
      const data = await res.json();
      if (data.success) {
        msg.text = newText;
        renderMessages(messages);
      } else {
        alert(data.error || "Failed to edit message.");
      }
    } catch {
      alert("Network error.");
    } finally {
      // Reset the editing flag and resume refreshing
      isEditingMessage = false;
    }
  });

  cancelBtn.addEventListener("click", () => {
    editTextarea.remove();
    controls.remove();
    messageText.style.display = "";
    btnContainer.style.display = "";
    // Reset the editing flag and resume refreshing
    isEditingMessage = false;
  });
}

// Update the fetchMessages function to respect the editing flag
async function fetchMessages() {
  if (isEditingMessage) return; // Skip refreshing if editing is in progress

  try {
    const response = await fetch(`${backendUrl}/messages`);
    const data = await response.json();
    if (response.ok && data) {
      messages = data;
      localStorage.setItem("nova-messages", JSON.stringify(data));
      renderMessages(data);
    } else {
      const cached = localStorage.getItem("nova-messages");
      if (cached) {
        messages = JSON.parse(cached);
        renderMessages(messages);
      }
    }
  } catch {
    const cached = localStorage.getItem("nova-messages");
    if (cached) {
      messages = JSON.parse(cached);
      renderMessages(messages);
    }
  }
}

  // Delete a message
  async function deleteMessage(messageId) {
    const isOwnMessage = messages.find((m) => m.id === messageId)?.user === user;

    if (isAdmin) {
      if (!confirm("Are you sure you want to delete this message?")) return;
      try {
        const response = await fetch(`${backendUrl}/admin/delete_message`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            admin_username: "admin",
            admin_password: adminPassword,
            message_id: messageId,
          }),
        });
        const data = await response.json();
        if (data.success) {
          messages = messages.filter((m) => m.id !== messageId);
          renderMessages(messages);
        } else {
          alert(data.error || "Failed to delete message.");
        }
      } catch {
        alert("Network error.");
      }
    } else if (isOwnMessage) {
      if (!confirm("Are you sure you want to delete your message?")) return;
      // Non-admin users cannot delete messages via API in backend currently
      // So you might want to add an endpoint for that, or disallow here
      alert("You do not have permission to delete messages. Ask admin.");
    } else {
      alert("You can only delete your own messages.");
    }
  }

  // Submit login or register
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
          isAdmin = data.admin === true;
          if (isAdmin) {
            adminPassword = password; // store admin password for admin API calls
            adminPanelButton.style.display = "inline-block";
          } else {
            adminPanelButton.style.display = "none";
          }
          localStorage.setItem("nova-user", user);
          localStorage.setItem("nova-is-admin", isAdmin ? "true" : "false");
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
    localStorage.removeItem("nova-user");
    localStorage.removeItem("nova-is-admin");
    hideApp();
  });

  adminPanelButton.addEventListener("click", () => {
    loadUsers();
    adminPanel.style.display = "block";
  });

  if (closeAdminPanel) {
    closeAdminPanel.onclick = () => {
      adminPanel.style.display = "none";
    };
  }

  async function loadUsers() {
    if (!userList) return;
    userList.innerHTML = "<li>Loading...</li>";
    try {
      const response = await fetch(
        `${backendUrl}/admin/list_users?admin_username=admin&admin_password=${encodeURIComponent(
          adminPassword
        )}`
      );
      const data = await response.json();
      if (!Array.isArray(data)) {
        userList.innerHTML = `<li>Error: ${data.error || "Failed to load users"}</li>`;
        return;
      }
      userList.innerHTML = "";
      data.forEach((username) => {
        if (username === "admin") return; // don't show admin
        const li = document.createElement("li");
        li.style.marginBottom = "6px";
        li.textContent = username + " ";
        const delBtn = document.createElement("button");
        delBtn.textContent = "Delete";
        delBtn.style.marginLeft = "10px";
        delBtn.style.background = "#b22222";
        delBtn.style.color = "white";
        delBtn.style.border = "none";
        delBtn.style.cursor = "pointer";
        delBtn.addEventListener("click", () => deleteUser(username));
        li.appendChild(delBtn);
        userList.appendChild(li);
      });
    } catch (e) {
      userList.innerHTML = `<li>Error loading users</li>`;
      console.error("Error loading users:", e);
    }
  }

  async function deleteUser(usernameToDelete) {
    if (!confirm(`Are you sure you want to delete user "${usernameToDelete}"? This will delete all their messages.`)) return;
    try {
      const response = await fetch(`${backendUrl}/admin/delete_user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          admin_username: "admin",
          admin_password: adminPassword,
          username: usernameToDelete,
        }),
      });
      const data = await response.json();
      if (data.success) {
        alert(`User "${usernameToDelete}" deleted.`);
        loadUsers();
        fetchMessages();
      } else {
        alert(data.error || "Failed to delete user.");
      }
    } catch {
      alert("Network error.");
    }
  }

  if (deleteAllMessagesBtn) {
    deleteAllMessagesBtn.addEventListener("click", async () => {
      if (!confirm("Are you sure you want to delete ALL messages? This cannot be undone.")) return;
      try {
        const response = await fetch(`${backendUrl}/admin/delete_all_messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            admin_username: "admin",
            admin_password: adminPassword,
          }),
        });
        const data = await response.json();
        if (data.success) {
          messages = [];
          renderMessages(messages);
          alert("All messages deleted.");
        } else {
          alert(data.error || "Failed to delete messages.");
        }
      } catch {
        alert("Network error.");
      }
    });
  }

  // Scroll to bottom button logic
  conversationArea.addEventListener("scroll", () => {
    if (isScrolledNearBottom()) {
      hideScrollButton();
    } else {
      showScrollButton();
    }
  });

  scrollToBottomBtn.addEventListener("click", () => {
    scrollToBottom();
    hideScrollButton();
  });

  // Show the main app UI and fetch messages
  function showApp() {
    loginScreen.style.display = "none";
    mainArea.style.display = "flex";
    fetchMessages();
    startPolling();
  }

  // Hide the main app UI and show login screen
  function hideApp() {
    loginScreen.style.display = "flex";
    mainArea.style.display = "none";
    messages = [];
    renderMessages([]);
    stopPolling();
  }

  // Poll messages every 5 seconds
  let pollInterval = null;
  function startPolling() {
    if (pollInterval) clearInterval(pollInterval);
    pollInterval = setInterval(fetchMessages, 5000);
  }
  function stopPolling() {
    if (pollInterval) clearInterval(pollInterval);
    pollInterval = null;
  }

  // Auto-login if stored creds exist
  (function tryAutoLogin() {
    const savedUser = localStorage.getItem("nova-user");
    const savedAdmin = localStorage.getItem("nova-is-admin") === "true";
    if (savedUser) {
      user = savedUser;
      isAdmin = savedAdmin;
      if (isAdmin) {
        // Admin password cannot be saved for security reasons, so admin must login again
        showError("Please login as admin again for admin access.");
        user = null;
        isAdmin = false;
        adminPassword = null;
        hideApp();
        return;
      }
      adminPanelButton.style.display = "none";
      showApp();
    } else {
      hideApp();
    }
  })();

  // Auto-expand textarea height on input
  messageInput.addEventListener("input", () => {
    messageInput.style.height = "auto";
    messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + "px";
  });
}
