// Updated Nova.OS Messages App Frontend
export const app_name = "messages-app";

export const app = _component("messages-app", html`
    <link rel="stylesheet" type="text/css" href="./apps/messages-app/styles.css">
    <main-area>
        <header-title>Messages</header-title>
        <conversation-area></conversation-area>
        <input-area>
            <input id="messageInput" type="text" placeholder="Type a message...">
            <button id="sendButton">Send</button>
        </input-area>
        <div id="progressBar" style="height: 4px; background: #007aff; width: 0%; transition: width 0.3s;"></div>
    </main-area>
`, boot_up_app);

function boot_up_app(app) {
    const conversationArea = app.querySelector("conversation-area");
    const messageInput = app.querySelector("#messageInput");
    const sendButton = app.querySelector("#sendButton");
    const progressBar = app.querySelector("#progressBar");

    const backendUrl = "https://nova-os-messaging-backend.onrender.com/messages";

    let user = JSON.parse(localStorage.getItem("nova-user"));

    if (!user) {
        user = prompt("Enter your username:");
        const password = prompt("Enter your password:");
        if (!user || !password) return alert("Login required to use messages.");
        localStorage.setItem("nova-user", JSON.stringify({ username: user, password }));
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
            const response = await fetch(backendUrl);
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
            text,
            sent: true
        };

        showProgress(30);

        try {
            const response = await fetch(backendUrl, {
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
                console.error("Message failed:", await response.json());
                alert("Failed to send message.");
                showProgress(0);
            }
        } catch (err) {
            console.error("Send error:", err);
            alert("Connection error.");
            showProgress(0);
        }
    }

    sendButton.addEventListener("pointerup", sendMessage);
    messageInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") sendMessage();
    });

    fetchMessages();
    setInterval(fetchMessages, 3000);
}