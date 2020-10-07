function random(min, max) {
    return min + (max - min) * Math.random();
}

function genColor() {
    let color = [0, 0, 0];
    let cpool = random(255, 255 * 3);
    let idxs = [0, 1, 2].sort(() => Math.random() - 0.5);
    idxs.forEach(i => {
        let c = random(0.3, 0.7);
        color[i] = Math.min(cpool * c, 255);
        cpool *= (1 - c);
    });
    return color;
}
const path = require("path");
const http = require("http");
const express = require("express");
const socketIO = require("socket.io");
const { match } = require("assert");
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
        let side = "left";
        let leftColor = genColor();
        let rightColor = genColor();
        room.people.forEach(({ socket }) => {
            socket.emit("startFight", { side, leftColor, rightColor });
            side = "right";
        })
    });
    socket.on("sendBodyData", ({ roomName, bodyData, bodyPosData, bodyAngData, bodyAngVData, health }) => {
        socket.broadcast.to(roomName).emit("receiveBodyData", { bodyData, bodyPosData, bodyAngData, bodyAngVData, health });
    })
    socket.on("playerDeath", ({ roomName }) => {
        socket.broadcast.to(roomName).emit("win", {});
    });
    socket.on("takeDownRoom", ({ roomName }) => {
        const room = matchRooms.find(({ roomName: rn }) => rn === roomName);
        room.people.forEach(({ socket }) => {
            socket.emit("leaveRoom", {});
            socket.leave(roomName);
        });
        matchRooms.splice(matchRooms.indexOf(room), 1);
    })
});
server.listen(port, () => {
    console.log(`Server is up on port ${port}`);
});