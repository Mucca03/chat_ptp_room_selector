# 💬 P2P Chat with WebRTC and Socket.IO

This project is a real-time chat application that enables direct communication between two users using **WebRTC**, with the help of **Socket.IO** and **Express** for the initial connection setup.

---

## 🚀 Features

- **Peer-to-peer (P2P)** communication using WebRTC  
- **Node.js** server powered by **Express** and **Socket.IO**  
- System for creating and joining private rooms  
- Real-time message exchange between two clients  
- Simple and clean interface built with HTML, CSS, and JavaScript  

---

## ⚙️ Installation and Execution

Clone the repository  
```bash
git clone https://github.com/Mucca03/chat_ptp_room_selector.git
cd chat_ptp_room_selector
```

Install dependencies
```bash
npm install
```

Run the server
```bash
node server.js
```

open your browser and go to:
```
http://localhost:3000
```

---

## 🧠 How the Chat Works

1. A user creates a room (e.g., `Room1`).    
2. Another user joins the same room.
3. Both clients establish a **WebRTC** peer-to-peer connection.
4. Messages are sent directly between clients — not through the server.
5. If the room already has two people, the message “Room full” is shown.
