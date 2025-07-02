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
  let messages = [];
  let isEditingMessage = false;

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

  function renderMessages(msgs) {
    conversationArea.innerHTML = "";

    msgs.forEach((msg) => {
      const messageBubble = document.createElement("div");
      messageBubble.className = msg.user === user ? "message sent" : "message received";

      const messageText = document.createElement("div");
      messageText.className = "message-text";
      messageText.textContent = `${msg.user}: ${msg.text}`;

      messageBubble.appendChild(messageText);

      const canEditDelete = isAdmin || (msg.user === user);

      if (canEditDelete) {
        const btnContainer = document.createElement("div");
        btnContainer.className = "message-buttons";

        const editBtn = document.createElement("button");
        editBtn.className = "msg-btn";
        editBtn.textContent = "Edit";
        editBtn.addEventListener("click", () => startEditingMessage(msg, messageBubble, messageText, btnContainer));
        btnContainer.appendChild(editBtn);

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "msg-btn";
        deleteBtn.textContent = "Delete";
        deleteBtn.addEventListener("click", () => deleteMessage(msg.id));
        btnContainer.appendChild(deleteBtn);

        messageBubble.appendChild(btnContainer);
      }

      conversationArea.appendChild(messageBubble);
    });

    if (isScrolledNearBottom()) {
      scrollToBottom();
      hideScrollButton();
    }
  }

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

  async function fetchMessages() {
    if (isEditingMessage) return;

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
  
        // Send notification to all users
        await fetch(`${backendUrl}/send-notification`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: "New Message",
            body: `${user}: ${text}`,
          }),
        });
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

  async function subscribeToPushNotifications() {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      const registration = await navigator.serviceWorker.ready;
  
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: "BOnz0DjCCHAcB6oFJ4uE_w6YomqD4pywL-lKISysBN9_puPG8Ybb5T1ZyCxlbXZJcF0VhkAfKPXh59mnGCLeNGk" // Replace with your VAPID public key
      });
  
      // Send subscription to backend
      await fetch(`${backendUrl}/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription),
      });
  
      console.log("Subscribed to push notifications:", subscription);
    } else {
      console.error("Push notifications are not supported in this browser.");
    }
  }
  
  // Call this function after login
  submitBtn.addEventListener("click", async () => {
    await subscribeToPushNotifications();
    submitAuth();
  });

  function startEditingMessage(msg, messageBubble, messageText, btnContainer) {
    isEditingMessage = true;
    messageText.style.display = "none";
    btnContainer.style.display = "none";

    const editTextarea = document.createElement("textarea");
    editTextarea.className = "edit-input";
    editTextarea.value = msg.text;
    editTextarea.rows = 2;

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
        isEditingMessage = false;
      }
    });

    cancelBtn.addEventListener("click", () => {
      editTextarea.remove();
      controls.remove();
      messageText.style.display = "";
      btnContainer.style.display = "";
      isEditingMessage = false;
    });
  }

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
      alert("You do not have permission to delete messages. Ask admin.");
    } else {
      alert("You can only delete your own messages.");
    }
  }

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
            adminPassword = password;
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
        `${backendUrl}/admin/list_users?admin_username=admin&admin_password=${encodeURIComponent(adminPassword)}`
      );
      const data = await response.json();
      if (!Array.isArray(data)) {
        userList.innerHTML = `<li>Error: ${data.error || "Failed to load users"}</li>`;
        return;
      }
      userList.innerHTML = "";
      data.forEach((username) => {
        if (username === "admin") return;
        const li = document.createElement("li");
        li.style.marginBottom = "12px";
        li.style.paddingBottom = "12px";
        li.style.borderBottom = "1px solid #444";
        
        const usernameSpan = document.createElement("span");
        usernameSpan.textContent = username;
        usernameSpan.style.fontWeight = "bold";
        usernameSpan.style.marginRight = "10px";
        li.appendChild(usernameSpan);

        const btnContainer = document.createElement("div");
        btnContainer.style.display = "flex";
        btnContainer.style.flexDirection = "column";
        btnContainer.style.gap = "6px";
        btnContainer.style.marginTop = "6px";

        // Delete User Button
        const delBtn = document.createElement("button");
        delBtn.textContent = "Delete User";
        delBtn.style.background = "#b22222";
        delBtn.style.color = "white";
        delBtn.style.border = "none";
        delBtn.style.padding = "6px 12px";
        delBtn.style.borderRadius = "4px";
        delBtn.addEventListener("click", () => deleteUser(username));

        // View Password Button
        const viewPasswordBtn = document.createElement("button");
        viewPasswordBtn.textContent = "View Password";
        viewPasswordBtn.style.background = "#6c757d";
        viewPasswordBtn.style.color = "white";
        viewPasswordBtn.style.border = "none";
        viewPasswordBtn.style.padding = "6px 12px";
        viewPasswordBtn.style.borderRadius = "4px";
        viewPasswordBtn.addEventListener("click", async () => {
          try {
            const response = await fetch(
              `${backendUrl}/admin/view_passwords?admin_username=admin&admin_password=${encodeURIComponent(adminPassword)}`
            );
            const data = await response.json();
            if (!Array.isArray(data)) {
              alert(data.error || "Failed to load password.");
              return;
            }
            const userData = data.find(u => u.username === username);
            if (userData) {
              alert(`Password for ${username}: ${userData.password}`);
            } else {
              alert("Password not found for this user.");
            }
          } catch (e) {
            alert("Error loading password.");
            console.error("Error loading password:", e);
          }
        });

        // Change Password Button
        const changePasswordBtn = document.createElement("button");
        changePasswordBtn.textContent = "Change Password";
        changePasswordBtn.style.background = "#007bff";
        changePasswordBtn.style.color = "white";
        changePasswordBtn.style.border = "none";
        changePasswordBtn.style.padding = "6px 12px";
        changePasswordBtn.style.borderRadius = "4px";
        changePasswordBtn.addEventListener("click", () => changePassword(username));

        btnContainer.appendChild(delBtn);
        btnContainer.appendChild(viewPasswordBtn);
        btnContainer.appendChild(changePasswordBtn);

        li.appendChild(btnContainer);
        userList.appendChild(li);
      });
    } catch {
      userList.innerHTML = "<li>Failed to load users.</li>";
    }
  }

  async function deleteUser(username) {
    if (!confirm(`Are you sure you want to delete user ${username}?`)) return;
    try {
      const response = await fetch(`${backendUrl}/admin/delete_user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          admin_username: "admin",
          admin_password: adminPassword,
          username,
        }),
      });
      const data = await response.json();
      if (data.success) {
        alert(`Deleted user: ${username}`);
        loadUsers();
      } else {
        alert(data.error || "Failed to delete user.");
      }
    } catch {
      alert("Network error.");
    }
  }

  async function changePassword(username) {
    const newPassword = prompt(`Enter new password for ${username}:`);
    if (!newPassword) {
      alert("Password cannot be empty.");
      return;
    }
    try {
      const response = await fetch(`${backendUrl}/admin/change_password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          admin_username: "admin",
          admin_password: adminPassword,
          username,
          new_password: newPassword,
        }),
      });
      const data = await response.json();
      if (data.success) {
        alert(`Password changed for user: ${username}`);
      } else {
        alert(data.error || "Failed to change password.");
      }
    } catch {
      alert("Network error.");
    }
  }

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
        alert(data.error || "Failed to delete all messages.");
      }
    } catch {
      alert("Network error.");
    }
  });

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

  function showApp() {
    loginScreen.style.display = "none";
    mainArea.style.display = "flex";
    fetchMessages();
    scrollToBottom();
  }

  function hideApp() {
    loginScreen.style.display = "flex";
    mainArea.style.display = "none";
    renderMessages([]);
  }

  // Try auto-login
  (async () => {
    const storedUser = localStorage.getItem("nova-user");
    const storedAdmin = localStorage.getItem("nova-is-admin");
    if (storedUser) {
      user = storedUser;
      isAdmin = storedAdmin === "true";
      if (isAdmin) {
        const pw = prompt("Enter admin password to continue:");
        if (!pw) {
          alert("Admin password required.");
          localStorage.removeItem("nova-user");
          localStorage.removeItem("nova-is-admin");
          hideApp();
          return;
        }
        adminPassword = pw;
        adminPanelButton.style.display = "inline-block";
      } else {
        adminPanelButton.style.display = "none";
      }
      showApp();
      await fetchMessages();
    }
  })();

  // Poll for messages every 4 seconds
  setInterval(fetchMessages, 4000);
}
