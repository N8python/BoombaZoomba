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
const randomWaitingRoom = [];
const matchRooms = [];
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
    socket.on("roomMessageSend", ({ username, message, roomName }) => {
        const room = matchRooms.find(({ roomName: rn }) => rn === roomName);
        if (room) {
            room.chat.push(`${username}: ${message}`)
            if (room.chat.length > 100) {
                room.chat.shift();
            }
            io.to(roomName).emit("roomMessageRecord", room.chat);
        }
    })
    socket.on("addToRWaiting", ({ username, id }) => {
        randomWaitingRoom.push({
            socket,
            username,
            id
        });
        if (randomWaitingRoom.length > 1) {
            const peeps = [randomWaitingRoom.shift(), randomWaitingRoom.shift()];
            const roomName = Math.random().toString().slice(2);
            peeps[0].socket.emit("partnerFound", { username: peeps[1].username, id: peeps[1].id, roomName });
            peeps[1].socket.emit("partnerFound", { username: peeps[0].username, id: peeps[0].id, roomName });
            peeps[0].socket.join(roomName);
            peeps[1].socket.join(roomName);
            matchRooms.push({ roomName, people: peeps, chat: [] });
        }
    });
    socket.on("startFightMessage", ({ roomName }) => {
        //io.to(roomName).emit("startFight", {});
        const room = matchRooms.find(({ roomName: rn }) => rn === roomName);
        let side = "left"
        room.people.forEach(({ socket }) => {
            socket.emit("startFight", { side });
            side = "right";
        })
    });
    socket.on("sendBodyData", ({ roomName, bodyData, bodyPosData, bodyAngData, bodyAngVData }) => {
        socket.broadcast.to(roomName).emit("receiveBodyData", { bodyData, bodyPosData, bodyAngData, bodyAngVData });
    })
});
server.listen(port, () => {
    console.log(`Server is up on port ${port}`);
});