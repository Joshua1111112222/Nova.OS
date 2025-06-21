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
    </main-area>
`, boot_up_app);

function boot_up_app(app) {
    const conversationArea = app.querySelector("conversation-area");
    const messageInput = app.querySelector("#messageInput");
    const sendButton = app.querySelector("#sendButton");

    // Backend URL (replace with your Render URL)
    const backendUrl = "https://nova-os-messaging-backend.onrender.com";

    // Function to render messages
    function renderMessages(messages) {
        conversationArea.innerHTML = ""; // Clear existing messages
        messages.forEach((msg) => {
            const messageBubble = document.createElement("div");
            messageBubble.className = msg.sent ? "message sent" : "message received";
            messageBubble.textContent = msg.text;
            conversationArea.appendChild(messageBubble);
        });
    }

    // Function to fetch messages from the backend
    async function fetchMessages() {
        try {
            const response = await fetch(backendUrl);
            const messages = await response.json();
            renderMessages(messages);
        } catch (error) {
            console.error("Failed to fetch messages:", error);
        }
    }

    // Function to send a message to the backend
    async function sendMessage() {
        const text = messageInput.value.trim();
        if (text) {
            const message = { text, sent: true };
            try {
                const response = await fetch(backendUrl, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(message)
                });
                if (response.ok) {
                    messageInput.value = ""; // Clear input
                    fetchMessages(); // Refresh messages
                } else {
                    console.error("Failed to send message:", await response.json());
                }
            } catch (error) {
                console.error("Failed to send message:", error);
            }
        }
    }

    // Event listener for send button
    sendButton.addEventListener("pointerup", sendMessage);

    // Event listener for Enter key
    messageInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            sendMessage();
        }
    });

    // Initial fetch of messages
    fetchMessages();
}