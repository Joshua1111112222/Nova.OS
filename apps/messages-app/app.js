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
  // Wrap all code in DOMContentLoaded to ensure elements exist
  document.addEventListener("DOMContentLoaded", () => {
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

    // Admin panel elements (inside component scope)
    const adminPanel = app.querySelector("#adminPanel");
    const closeAdminPanel = app.querySelector("#closeAdminPanel");
    const userList = app.querySelector("#userList");
    const deleteAllMessagesBtn = app.querySelector("#deleteAllMessagesBtn");

    const backendUrl = "https://nova-os-messaging-backend.onrender.com";

    let isLogin = true;
    let user = null;
    let isAdmin = false;
    let adminPassword = null;

    let currentEditingMessageId = null;
    let currentEditingTextarea = null;

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

    // Render messages with edit/delete buttons for owner/admin
    function renderMessages(messages) {
      conversationArea.innerHTML = ""; // Clear existing messages

      messages.forEach((msg) => {
        const messageBubble = document.createElement("div");
        messageBubble.className = msg.user === user ? "message sent" : "message received";
        messageBubble.dataset.messageId = msg.id;

        // If editing this message, show textarea + save/cancel buttons
        if (currentEditingMessageId === msg.id) {
          const editTextarea = document.createElement("textarea");
          editTextarea.className = "edit-input";
          editTextarea.value = msg.text;
          editTextarea.rows = 3;
          editTextarea.style.width = "100%";
          editTextarea.style.resize = "vertical";
          currentEditingTextarea = editTextarea;

          const saveBtn = document.createElement("button");
          saveBtn.className = "msg-btn";
          saveBtn.textContent = "Save";

          const cancelBtn = document.createElement("button");
          cancelBtn.className = "msg-btn";
          cancelBtn.textContent = "Cancel";

          saveBtn.addEventListener("click", async () => {
            const newText = editTextarea.value.trim();
            if (!newText) {
              alert("Message cannot be empty.");
              return;
            }
            await editMessageApi(msg.id, newText);
          });

          cancelBtn.addEventListener("click", () => {
            currentEditingMessageId = null;
            currentEditingTextarea = null;
            // re-render messages without editing mode
            fetchMessages(false);
          });

          messageBubble.appendChild(editTextarea);
          const controls = document.createElement("div");
          controls.className = "edit-controls";
          controls.appendChild(saveBtn);
          controls.appendChild(cancelBtn);
          messageBubble.appendChild(controls);
        } else {
          // Normal message text
          const messageTextDiv = document.createElement("div");
          messageTextDiv.className = "message-text";
          messageTextDiv.textContent = `${msg.user}: ${msg.text}`;
          messageBubble.appendChild(messageTextDiv);

          // If user owns the message or admin, show edit/delete buttons
          if (isAdmin || msg.user === user) {
            const btnContainer = document.createElement("div");
            btnContainer.className = "message-buttons";

            const editBtn = document.createElement("button");
            editBtn.className = "msg-btn";
            editBtn.textContent = "Edit";
            editBtn.addEventListener("click", () => {
              currentEditingMessageId = msg.id;
              fetchMessages(false); // re-render messages with editing mode
            });

            const deleteBtn = document.createElement("button");
            deleteBtn.className = "msg-btn";
            deleteBtn.textContent = "Delete";
            deleteBtn.addEventListener("click", () => {
              deleteMessageApi(msg.id);
            });

            btnContainer.appendChild(editBtn);
            btnContainer.appendChild(deleteBtn);
            messageBubble.appendChild(btnContainer);
          }
        }

        conversationArea.appendChild(messageBubble);
      });

      // Scroll down if not editing (to avoid jump during editing)
      if (!currentEditingMessageId) {
        conversationArea.scrollTop = conversationArea.scrollHeight;
      }
    }

    async function fetchMessages(setTimer = true) {
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
      // Only set interval if requested
      if (setTimer && !currentEditingMessageId) {
        clearInterval(fetchMessages.interval);
        fetchMessages.interval = setInterval(() => fetchMessages(true), 3000);
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
          await fetchMessages(false);
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
      clearInterval(fetchMessages.interval);
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
          fetchMessages(false);
        } else {
          alert(data.error || "Failed to delete user.");
        }
      } catch {
        alert("Network error.");
      }
    }

    async function deleteMessageApi(messageId) {
      if (!confirm("Are you sure you want to delete this message?")) return;
      try {
        // Admin can delete any message, normal users cannot delete others' messages (no UI shown anyway)
        if (isAdmin) {
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
            alert("Message deleted.");
            fetchMessages(false);
          } else {
            alert(data.error || "Failed to delete message.");
          }
        } else {
          alert("You are not authorized to delete this message.");
        }
      } catch {
        alert("Network error.");
      }
    }

    async function editMessageApi(messageId, newText) {
      try {
        const response = await fetch(`${backendUrl}/edit_message`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: user,
            password: isAdmin ? adminPassword : null,
            message_id: messageId,
            new_text: newText,
          }),
        });
        const data = await response.json();
        if (data.success) {
          currentEditingMessageId = null;
          currentEditingTextarea = null;
          await fetchMessages(false);
        } else {
          alert(data.error || "Failed to edit message.");
        }
      } catch {
        alert("Network error.");
      }
    }

    deleteAllMessagesBtn.addEventListener("click", async () => {
      if (!confirm("Delete ALL messages? This cannot be undone.")) return;
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
          alert("All messages deleted.");
          fetchMessages(false);
        } else {
          alert(data.error || "Failed to delete messages.");
        }
      } catch {
        alert("Network error.");
      }
    });

    function showApp() {
      loginScreen.style.display = "none";
      mainArea.style.display = "flex";
      fetchMessages();
      usernameInput.value = "";
      passwordInput.value = "";
      messageInput.focus();
    }

    function hideApp() {
      mainArea.style.display = "none";
      loginScreen.style.display = "flex";
      showError("");
      usernameInput.focus();
    }

    // Auto login if stored
    (function autoLogin() {
      const storedUser = localStorage.getItem("nova-user");
      const storedAdmin = localStorage.getItem("nova-is-admin") === "true";
      if (storedUser) {
        user = storedUser;
        isAdmin = storedAdmin;
        if (isAdmin) {
          adminPanelButton.style.display = "inline-block";
          adminPassword = prompt("Please enter admin password to access admin features:");
          if (!adminPassword) {
            isAdmin = false;
            adminPanelButton.style.display = "none";
          }
        } else {
          adminPanelButton.style.display = "none";
        }
        showApp();
      } else {
        hideApp();
      }
    })();

    // Adjust textarea height automatically
    messageInput.addEventListener("input", () => {
      messageInput.style.height = "auto";
      messageInput.style.height = messageInput.scrollHeight + "px";
    });

    // Keyboard fix for iPhone / virtual keyboard avoiding input area coverage
    window.addEventListener("resize", () => {
      setTimeout(() => {
        conversationArea.style.paddingBottom = messageInput.offsetHeight + 30 + "px";
        conversationArea.scrollTop = conversationArea.scrollHeight;
      }, 100);
    });

    // Initial padding bottom set to avoid last message being covered
    conversationArea.style.paddingBottom = messageInput.offsetHeight + 30 + "px";
  });
}
