export const app_name = "messages-app";

export const app = _component("messages-app", html`
  <link rel="stylesheet" type="text/css" href="./apps/messages-app/styles.css">
  <!-- LOGIN, MESSAGES, ADMIN PANEL omitted for brevity (same structure) -->
`, boot_up_app);

function boot_up_app(app) {
  const loginScreen = app.querySelector("#loginScreen");
  const mainArea = app.querySelector("main-area");
  const adminPanel = app.querySelector("#adminPanel");
  const conversationArea = app.querySelector("conversation-area");
  const inputArea = app.querySelector("input-area");
  const messageInput = app.querySelector("#messageInput");
  const sendButton = app.querySelector("#sendButton");
  const progressBar = app.querySelector("#progressBar");
  const adminPanelButton = app.querySelector("#adminPanelButton");
  const closeAdminPanel = app.querySelector("#closeAdminPanel");
  const deleteAllMessagesBtn = app.querySelector("#deleteAllMessagesBtn");
  const userList = app.querySelector("#userList");
  const logoutButton = app.querySelector("#logoutButton");

  let user = null;
  let isAdmin = false;
  let adminPassword = null;
  const backendUrl = "https://nova-os-messaging-backend.onrender.com";

  function renderMessages(msgs) {
    conversationArea.innerHTML = "";
    msgs.forEach(msg => {
      const div = document.createElement("div");
      div.className = msg.user === user ? "message sent" : "message received";
      div.textContent = `${msg.user}: ${msg.text}`;
      if (isAdmin || msg.user === user) {
        const editBtn = document.createElement("button");
        editBtn.textContent = "✎"; editBtn.className = "msg-btn";
        editBtn.onclick = () => editMessage(msg.id, msg.text);
        const delBtn = document.createElement("button");
        delBtn.textContent = "🗑"; delBtn.className = "msg-btn";
        delBtn.onclick = () => deleteMessage(msg.id);
        div.append(editBtn, delBtn);
      }
      conversationArea.append(div);
    });
    conversationArea.scrollTop = conversationArea.scrollHeight;
  }

  async function fetchMessages() {
    const r = await fetch(`${backendUrl}/messages`);
    if (!r.ok) return console.error("failed fetch");
    const data = await r.json();
    localStorage.setItem("nova-messages", JSON.stringify(data));
    renderMessages(data);
  }

  async function sendMessage() {
    const text = messageInput.value.trim();
    if (!text || !user) return;
    progressBar.style.width = "30%";
    const r = await fetch(`${backendUrl}/messages`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({user, text})
    });
    progressBar.style.width = "60%";
    if (r.ok) {
      messageInput.value = "";
      await fetchMessages();
      progressBar.style.width = "100%";
      setTimeout(() => (progressBar.style.width = "0%"), 500);
    } else {
      alert((await r.json()).error || "Failed");
      progressBar.style.width = "0%";
    }
  }

  async function editMessage(id, oldText) {
    const newText = prompt("Edit:", oldText);
    if (newText == null) return;
    const r = await fetch(`${backendUrl}/messages/${id}`, {
      method: "PUT",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({user, text: newText, admin: isAdmin})
    });
    if (r.ok) fetchMessages();
    else alert((await r.json()).error);
  }

  async function deleteMessage(id) {
    if (!confirm("Delete this message?")) return;
    const r = await fetch(`${backendUrl}/messages/${id}`, {
      method: "DELETE",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({user, admin: isAdmin})
    });
    if (r.ok) fetchMessages();
    else alert((await r.json()).error);
  }

  function startKeyboardHandler() {
    messageInput.addEventListener("input", () => {
      messageInput.style.height = "auto";
      messageInput.style.height = messageInput.scrollHeight + "px";
    });
    window.addEventListener("resize", () => {
      const isKb = window.innerHeight < screen.height * 0.75;
      inputArea.style.position = "fixed";
      inputArea.style.bottom = isKb ? "0" : "unset";
      conversationArea.style.paddingBottom = isKb ? inputArea.offsetHeight + "px" : "0";
    });
  }

  function showApp() {
    loginScreen.style.display = "none";
    mainArea.style.display = "flex";
    fetchMessages();
    startKeyboardHandler();
    setInterval(fetchMessages, 3000);
  }

  function hideApp() {
    loginScreen.style.display = "flex";
    mainArea.style.display = "none";
  }

  async function loginOrRegister(isLogin) {
    const u = loginScreen.querySelector("#usernameInput").value.trim();
    const p = loginScreen.querySelector("#passwordInput").value.trim();
    if (!u || !p) return alert("Fill in both.");
    const r = await fetch(`${backendUrl}/${isLogin?"login":"register"}`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({username: u, password: p})
    });
    const d = await r.json();
    if (!d.success) return alert(d.error);
    user = d.username;
    isAdmin = !!d.admin;
    if (isAdmin) {
      adminPassword = p;
      adminPanelButton.style.display = "inline-block";
    }
    showApp();
  }

  // Admin panel
  adminPanelButton.onclick = () => {
    userList.innerHTML = "<li>Loading...</li>";
    fetch(`${backendUrl}/admin/list_users?admin_username=admin&admin_password=${encodeURIComponent(adminPassword)}`)
      .then(r => r.json())
      .then(data => {
        userList.innerHTML = "";
        data.forEach(u => {
          if (u === "admin") return;
          const li = document.createElement("li");
          const del = document.createElement("button");
          del.textContent = "Delete ";
          del.onclick = () => {
            fetch(`${backendUrl}/admin/delete_user`, {
              method: "POST",
              headers: {"Content-Type": "application/json"},
              body: JSON.stringify({admin_username: "admin", admin_password: adminPassword, username: u})
            }).then(() => fetchMessages());
          };
          li.textContent = u;
          li.append(del);
          userList.append(li);
        });
      });
    adminPanel.style.display = "block";
  };

  closeAdminPanel.onclick = () => adminPanel.style.display = "none";

  deleteAllMessagesBtn.onclick = () => {
    if (!confirm("Delete all messages?")) return;
    fetch(`${backendUrl}/admin/delete_all_messages`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({admin_username: "admin", admin_password: adminPassword})
    }).then(() => {
      adminPanel.style.display = "none";
      fetchMessages();
    });
  };

  // Event listeners
  loginScreen.querySelector("#submitBtn").onclick = () => loginOrRegister(true);
  loginScreen.querySelector("#toggleForm").onclick = () => {
    const isLogin = loginScreen.querySelector("#submitBtn").textContent !== "Register";
    loginScreen.querySelector("#formTitle").textContent = isLogin ? "Register" : "Login";
    loginScreen.querySelector("#submitBtn").textContent = isLogin ? "Register" : "Login";
  };
  sendButton.onclick = sendMessage;
  messageInput.addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  });
  logoutButton.onclick = () => {
    user = null; isAdmin = false; adminPassword = null;
    adminPanelButton.style.display = "none";
    hideApp();
  };

  hideApp();
}
