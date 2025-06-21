// Assuming you use plain JS + fetch + vanilla custom elements approach.
// Adapt based on your setup — below is a plain vanilla example.

// Elements references (adjust selectors to your app structure)
const conversationArea = document.querySelector("conversation-area");
const inputAreaTextarea = document.querySelector("input-area textarea");
const sendButton = document.querySelector("#sendButton");
const scrollToBottomBtn = document.querySelector(".scroll-to-bottom-btn");

let loggedInUser = null; // { username: string, isAdmin: bool }
let messages = [];
let editingMessageId = null;
let editingOriginalText = null;
let refreshInterval = null;

// API base URL
const API_BASE = "http://localhost:5000"; // Change as needed

// -------- Helper to create a message DOM element --------
function createMessageElement(msg) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.classList.add(msg.user === loggedInUser?.username ? "sent" : "received");
  div.dataset.messageId = msg.id;

  // If currently editing this message, render edit input and buttons
  if (editingMessageId === msg.id) {
    // Edit mode container
    const editInput = document.createElement("textarea");
    editInput.classList.add("edit-input");
    editInput.value = editingOriginalText;
    editInput.rows = 2;
    editInput.addEventListener("input", () => {
      editingOriginalText = editInput.value;
    });
    editInput.focus();

    const controls = document.createElement("div");
    controls.classList.add("edit-controls");

    const saveBtn = document.createElement("button");
    saveBtn.textContent = "Save";
    saveBtn.classList.add("msg-btn");
    saveBtn.style.backgroundColor = "#28a745"; // green
    saveBtn.onclick = () => saveEditedMessage(msg.id);

    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "Cancel";
    cancelBtn.classList.add("msg-btn");
    cancelBtn.style.backgroundColor = "#dc3545"; // red
    cancelBtn.onclick = cancelEditing;

    controls.appendChild(saveBtn);
    controls.appendChild(cancelBtn);

    div.appendChild(editInput);
    div.appendChild(controls);

    return div;
  }

  // Normal message display
  const textSpan = document.createElement("span");
  textSpan.classList.add("message-text");
  textSpan.textContent = msg.text;
  div.appendChild(textSpan);

  // Buttons container
  const btnsDiv = document.createElement("div");
  btnsDiv.classList.add("message-buttons");

  // Show edit/delete buttons based on permissions
  const canEdit =
    loggedInUser &&
    (loggedInUser.isAdmin || msg.user === loggedInUser.username);
  const canDelete =
    loggedInUser &&
    (loggedInUser.isAdmin || msg.user === loggedInUser.username);

  if (canEdit) {
    const editBtn = document.createElement("button");
    editBtn.classList.add("msg-btn");
    editBtn.textContent = "Edit";
    editBtn.onclick = () => startEditingMessage(msg.id, msg.text);
    btnsDiv.appendChild(editBtn);
  }

  if (canDelete) {
    const delBtn = document.createElement("button");
    delBtn.classList.add("msg-btn");
    delBtn.textContent = "Delete";
    delBtn.onclick = () => deleteMessage(msg.id);
    btnsDiv.appendChild(delBtn);
  }

  if (btnsDiv.childElementCount > 0) {
    div.appendChild(btnsDiv);
  }

  return div;
}

// -------- Render all messages --------
function renderMessages() {
  conversationArea.innerHTML = "";
  messages.forEach((msg) => {
    const el = createMessageElement(msg);
    conversationArea.appendChild(el);
  });
  scrollToBottomIfNearBottom();
}

// -------- Scroll helpers --------
function scrollToBottom() {
  conversationArea.scrollTop = conversationArea.scrollHeight;
}

function isNearBottom() {
  // If user scrolled near bottom (within 100px), consider near bottom
  return (
    conversationArea.scrollHeight - conversationArea.scrollTop - conversationArea.clientHeight <
    100
  );
}

function scrollToBottomIfNearBottom() {
  if (isNearBottom()) scrollToBottom();
}

// -------- Fetch messages --------
async function fetchMessages() {
  try {
    const res = await fetch(`${API_BASE}/messages`);
    if (!res.ok) throw new Error("Failed to fetch messages");
    const data = await res.json();
    messages = data;

    // Only render if not editing — if editing, do not overwrite DOM
    if (editingMessageId === null) {
      renderMessages();
    }
  } catch (err) {
    console.error("Error fetching messages:", err);
  }
}

// -------- Send message --------
async function sendMessage() {
  const text = inputAreaTextarea.value.trim();
  if (!text) return;
  try {
    const res = await fetch(`${API_BASE}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user: loggedInUser.username, text }),
    });
    if (!res.ok) throw new Error("Failed to send message");
    inputAreaTextarea.value = "";
    await fetchMessages();
    scrollToBottom();
  } catch (err) {
    alert("Error sending message: " + err.message);
  }
}

// -------- Start editing a message --------
function startEditingMessage(messageId, currentText) {
  editingMessageId = messageId;
  editingOriginalText = currentText;
  renderMessages();
  // Stop auto-refresh during editing
  clearInterval(refreshInterval);
}

// -------- Cancel editing --------
function cancelEditing() {
  editingMessageId = null;
  editingOriginalText = null;
  renderMessages();
  // Restart auto-refresh after editing
  refreshInterval = setInterval(fetchMessages, 3000);
}

// -------- Save edited message --------
async function saveEditedMessage(messageId) {
  if (!editingOriginalText.trim()) {
    alert("Message text cannot be empty.");
    return;
  }

  try {
    // You need username & password to authorize edit
    // For simplicity, prompt for password here.
    // In a real app, better auth flow needed.
    const password = prompt("Enter your password to save changes:");

    if (!password) {
      alert("Password is required to save edits.");
      return;
    }

    const payload = {
      username: loggedInUser.username,
      password,
      message_id: messageId,
      new_text: editingOriginalText,
    };

    const res = await fetch(`${API_BASE}/edit_message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      alert("Failed to save message: " + (data.error || "Unknown error"));
      return;
    }

    editingMessageId = null;
    editingOriginalText = null;
    await fetchMessages();
    scrollToBottom();

    // Restart auto-refresh
    refreshInterval = setInterval(fetchMessages, 3000);
  } catch (err) {
    alert("Error saving message: " + err.message);
  }
}

// -------- Delete message --------
async function deleteMessage(messageId) {
  if (
    !confirm("Are you sure you want to delete this message? This action cannot be undone.")
  )
    return;

  try {
    let url = "";
    let payload = {};

    // If admin, use admin delete endpoint with admin credentials
    if (loggedInUser.isAdmin) {
      const adminPassword = prompt("Enter admin password to delete message:");
      if (!adminPassword) {
        alert("Admin password required.");
        return;
      }
      url = `${API_BASE}/admin/delete_message`;
      payload = {
        admin_username: loggedInUser.username,
        admin_password: adminPassword,
        message_id: messageId,
      };
    } else {
      // Non-admin users cannot delete others messages
      // But can delete their own via a dedicated endpoint (not provided, so disable for now)
      alert("Only admin can delete messages currently.");
      return;
    }

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      alert("Failed to delete message: " + (data.error || "Unknown error"));
      return;
    }

    await fetchMessages();
    scrollToBottom();
  } catch (err) {
    alert("Error deleting message: " + err.message);
  }
}

// -------- Scroll to bottom button --------

function updateScrollButtonVisibility() {
  if (conversationArea.scrollTop < conversationArea.scrollHeight - conversationArea.clientHeight - 100) {
    scrollToBottomBtn.style.display = "flex";
  } else {
    scrollToBottomBtn.style.display = "none";
  }
}

scrollToBottomBtn.addEventListener("click", () => {
  scrollToBottom();
  scrollToBottomBtn.style.display = "none";
});

conversationArea.addEventListener("scroll", updateScrollButtonVisibility);

// -------- Keyboard padding fix for iOS --------
function updateInputAreaPadding() {
  // iOS specific hack to fix keyboard covering input
  // Adds extra bottom padding to input area to avoid being overlapped
  const inputArea = document.querySelector("input-area");
  if (!inputArea) return;

  const viewportHeight = window.innerHeight;
  const inputRect = inputArea.getBoundingClientRect();

  if (inputRect.bottom > viewportHeight) {
    const overlap = inputRect.bottom - viewportHeight;
    inputArea.style.paddingBottom = `calc(env(safe-area-inset-bottom, 0) + ${overlap + 12}px)`;
  } else {
    inputArea.style.paddingBottom = `calc(env(safe-area-inset-bottom, 0) + 12px)`;
  }
}

// Call on resize and input focus (when keyboard appears)
window.addEventListener("resize", updateInputAreaPadding);
inputAreaTextarea.addEventListener("focus", () => {
  setTimeout(updateInputAreaPadding, 300);
});
inputAreaTextarea.addEventListener("blur", () => {
  inputAreaTextarea.style.paddingBottom = "";
  const inputArea = document.querySelector("input-area");
  if (inputArea) inputArea.style.paddingBottom = `calc(env(safe-area-inset-bottom, 0) + 12px)`;
});

// -------- Login / logout --------

async function loginUser(username, password) {
  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      loggedInUser = {
        username: data.username,
        isAdmin: data.admin,
      };
      // Hide login screen and show chat UI here
      // e.g. document.getElementById("loginScreen").style.display = "none";
      // Show main chat UI container
      startApp();
      return true;
    } else {
      alert("Login failed: " + (data.error || "Invalid credentials"));
      return false;
    }
  } catch (err) {
    alert("Login error: " + err.message);
    return false;
  }
}

function logoutUser() {
  loggedInUser = null;
  // Show login screen again and hide chat UI
  // location.reload(); // simple reload for now
  window.location.reload();
}

// -------- Initialization --------

function startApp() {
  // Render UI for logged in user (not included here)
  // Start fetching messages
  fetchMessages();
  refreshInterval = setInterval(() => {
    // Only refresh if not editing
    if (editingMessageId === null) {
      fetchMessages();
    }
  }, 3000);

  // Scroll to bottom initially after a short delay
  setTimeout(scrollToBottom, 300);
}

// -------- Event listeners --------
sendButton.addEventListener("click", sendMessage);
inputAreaTextarea.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// Initial scroll button check on load
updateScrollButtonVisibility();

