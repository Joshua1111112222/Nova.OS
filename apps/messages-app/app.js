// Updated Nova.OS Messages App Frontend with Auth + Smooth Loading + Logout
export const app_name = "messages-app";

export const app = _component("messages-app", html`
    <link rel="stylesheet" type="text/css" href="./apps/messages-app/styles.css">
    <main-area>
        <header-title>
            Messages
            <button id="logoutButton" style="float: right; font-size: 14px; background: transparent; border: none; color: #aaa; cursor: pointer;">Logout</button>
        </header-title>
        <conversation-area></conversation-area>
        <input-area>
            <input id="messageInput" type="text" placeholder="Type a message...">
            <button id="sendButton">Send</button>
        </input-area>
        <div id="progressBar" style="height: 4px; background: #007aff; width: 0%; transition: width 0.5s ease;"></div>
    </main-area>
`, boot_up_app);

function boot_up_app(app) {
    const conversationArea = app.querySelector("conversation-area");
    const messageInput = app.querySelector("#messageInput");
    const sendButton = app.querySelector("#sendButton");
    const progressBar = app.querySelector("#progressBar");
    const logoutButton = app.querySelector("#logoutButton");

    const backendBase = "https://nova-os-messaging-backend.onrender.com";
    const backendMessages = `${backendBase}/messages`;
    const backendLogin = `${backendBase}/login`;
    const backendRegister = `${backendBase}/register`;

    let user = JSON.parse(localStorage.getItem("nova-user"));

    async function promptLogin() {
        const username = prompt("Enter your username:");
        const password = prompt("Enter your password:");
        if (!username || !password) return alert("Login required.");

        // Try login
        const loginResp = await fetch(backendLogin, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        if (loginResp.ok) {
            user = { username, password };
            localStorage.setItem("nova-user", JSON.stringify(user));
        } else {
            // Try register
            const registerResp = await fetch(backendRegister, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });
            if (registerResp.ok) {
                user = { username, password };
                localStorage.setItem("nova-user", JSON.stringify(user));
            } else {
                alert("Invalid login and registration failed.");
                return location.reload();
            }
        }
    }

    async function validateLogin() {
        if (!user) await promptLogin();
    }

    function showProgress(percent) {
        progressBar.style.width = percent + "%";
    }

    function renderMessages(messages) {
        conversationArea.innerHTML = "";
        messages.forEach((msg) => {
            const messageBubble = document.createElement("div");
            messageBubble.className = msg.user === user.username ? "message sent" : "message received";
            messageBubble.textContent = `${msg.user}: ${msg.text}`;
            conversationArea.appendChild(messageBubble);
        });
        conversationArea.scrollTop = conversationArea.scrollHeight;
    }

    async function fetchMessages() {
        try {
            const response = await fetch(backendMessages);
            const messages = await response.json();
            localStorage.setItem("nova-messages", JSON.stringify(messages));
            renderMessages(messages);
        } catch (error) {
            console.error("Fetch failed, loading from localStorage:", error);
            const cached = localStorage.getItem("nova-messages");
            if (cached) renderMessages(JSON.parse(cached));
        }
    }

    async function sendMessage() {
        const text = messageInput.value.trim();
        if (!text) return;

        const message = {
            user: user.username,
            password: user.password,
            text
        };

        showProgress(30);

        try {
            const response = await fetch(backendMessages, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(message)
            });

            showProgress(60);

            if (response.ok) {
                messageInput.value = "";
                fetchMessages();
                showProgress(100);
                setTimeout(() => showProgress(0), 500);
            } else {
                const err = await response.json();
                alert("Error: " + (err.error || "Unknown"));
                showProgress(0);
            }
        } catch (err) {
            alert("Network error.");
            showProgress(0);
        }
    }

    sendButton.addEventListener("pointerup", sendMessage);
    messageInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") sendMessage();
    });

    logoutButton.addEventListener("click", () => {
        localStorage.removeItem("nova-user");
        location.reload();
    });

    validateLogin().then(() => {
        fetchMessages();
        setInterval(fetchMessages, 3000);
    });
} 