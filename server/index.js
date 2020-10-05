const path = require("path");
const http = require("http");
const express = require("express");
const socketIO = require("socket.io");
const publicPath = path.join(__dirname, "../public");
const port = process.env.PORT || 3000;
let app = express();
app.use(express.static(publicPath));
let server = http.createServer(app);
let io = socketIO(server);
let lobbyChat = [];
io.on("connection", socket => {
    console.log("New user connected.");
    let id = +Math.random().toString().split(".")[1];
    socket.emit("idSent", {
        id
    });
    socket.emit("messageRecord", lobbyChat);
    socket.on("messageSend", ({ username, message }) => {
        lobbyChat.push(`${username}: ${message}`);
        if (lobbyChat.length > 100) {
            lobbyChat.shift();
        }
        io.emit("messageRecord", lobbyChat);
    })
});
server.listen(port, () => {
    console.log(`Server is up on port ${port}`);
});