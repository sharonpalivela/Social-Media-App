// ✅ Set Backend URL (Update this when deployed)
console.log("Script.js is connected!");

const BACKEND_URL = "https://social-media-app-production-5c22.up.railway.app";

// ✅ Connect to the backend Socket.io server
const socket = io(BACKEND_URL, { transports: ['websocket', 'polling'] });

// ✅ Handle login form submission
document.getElementById("loginForm")?.addEventListener("submit", async function (event) {
    event.preventDefault();

    const emailOrPhone = document.getElementById("emailOrPhone").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!emailOrPhone || !password) {
        alert("Please enter both email/phone and password.");
        return;
    }

    try {
        const response = await fetch(`${BACKEND_URL}/users/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ emailOrPhone, password }),
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem("token", data.token);
            window.location.href = `${BACKEND_URL}/homepage.html`;  
  
        }else {
            alert(data.message || "Login failed. Please try again.");
        }
    } catch (error) {
        console.error("Error during login:", error);
        alert("An error occurred. Please try again later.");
    }
});

// ✅ Handle signup form validation
document.querySelector(".signup-form form")?.addEventListener("submit", (event) => {
    const contact = document.getElementById("contact").value.trim();
    const name = document.getElementById("name").value.trim();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("signup-password").value.trim();
    const confirmPassword = document.getElementById("confirm-password").value.trim();

    if (!contact || !name || !username || !password || !confirmPassword) {
        event.preventDefault();
        alert("Please fill out all fields to sign up.");
    } else if (password !== confirmPassword) {
        event.preventDefault();
        alert("Passwords do not match. Please re-enter.");
    }
});

// ✅ Post functionality
function postMessage() {
    const message = document.getElementById("new-post").value.trim();
    if (!message) {
        alert("Please write something to post.");
        return;
    }

    const postFeed = document.querySelector(".post-feed");
    const newPost = document.createElement("div");
    newPost.classList.add("post");
    newPost.innerHTML = `
        <div class="post-header">
            <img src="images/profilepic.jpg" alt="Profile" class="post-pic">
            <h4>Sharon Palivela</h4>
        </div>
        <p>${message}</p>
    `;

    postFeed.prepend(newPost);
    document.getElementById("new-post").value = "";
}

// ✅ Chat functionality
function openChat(contactName) {
    document.getElementById("chat-name").textContent = contactName;
    document.getElementById("chat-box").innerHTML = "";
    loadChatMessages(contactName);
}

async function loadChatMessages(contactName) {
    try {
        const response = await fetch(`${BACKEND_URL}/api/chats/${contactName}`);
        const messages = await response.json();

        messages.forEach((msg) => {
            displayMessage(msg, msg.sender === "You");
        });
    } catch (error) {
        console.error("Error fetching chat history:", error);
    }
}

function displayMessage(messageData, isSentByUser) {
    const chatBox = document.getElementById("chat-box");
    const messageElement = document.createElement("div");

    messageElement.classList.add("message", isSentByUser ? "sent" : "received");
    messageElement.innerHTML = `<p>${messageData.message}</p><span class="timestamp">${messageData.time || "Just Now"}</span>`;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function sendMessage() {
    const messageInput = document.getElementById("message-input");
    const messageText = messageInput.value.trim();

    if (messageText) {
        const messageData = { sender: "You", message: messageText, time: new Date().toLocaleTimeString() };
        displayMessage(messageData, true);
        socket.emit("send_message", messageData);
        messageInput.value = "";
    }
}

// ✅ Listen for new messages
socket.on("receive_message", (messageData) => {
    displayMessage(messageData, false);
});

// ✅ Handle notifications
socket.on("notification", (notification) => {
    const notificationElement = document.createElement("div");
    notificationElement.classList.add("notification");
    notificationElement.textContent = notification;

    document.body.appendChild(notificationElement);

    setTimeout(() => {
        notificationElement.remove();
    }, 5000);
});
