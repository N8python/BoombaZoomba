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
const randomWords = require('random-words');
const publicPath = path.join(__dirname, "../public");
const port = process.env.PORT || 3000;
let app = express();
app.use(express.static(publicPath));
if (process.env.NODE_ENV === 'production') {
    app.use((req, res, next) => {
        if (req.header('x-forwarded-proto') !== 'https')
            res.redirect(`https://${req.header('host')}${req.url}`)
        else
            next()
    })
}
let server = http.createServer(app);
let io = socketIO(server);
let lobbyChat = [];
const randomWaitingRoom = [];
const matchRooms = [];
io.on("connection", socket => {
    let currRoom;
    let lastMessage = Date.now();
    let heartbeatInterval = setInterval(() => {
        const timeDiff = Date.now() - lastMessage;
        if (timeDiff > 2000) {
            if (currRoom) {
                const room = matchRooms.find(({ roomName: rn }) => rn === currRoom.roomName);
                if (room) {
                    room.people.forEach(({ socket }) => {
                        socket.emit("leaveRoom", { disconnected: true });
                        socket.leave(currRoom.roomName);
                    });
                    matchRooms.splice(matchRooms.indexOf(room), 1);
                }
            }
            if (randomWaitingRoom.length === 1) {
                if (randomWaitingRoom[0].socket === socket) {
                    randomWaitingRoom.pop();
                }
            }
            clearInterval(heartbeatInterval);
        }
    }, 1000);
    console.log("New user connected.");
    let id = +Math.random().toString().split(".")[1];
    socket.setCurrRoom = (rm) => {
        currRoom = rm;
    }
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
            currRoom = { roomName, people: peeps, chat: [] };
            peeps[0].socket.setCurrRoom(currRoom);
            peeps[1].socket.setCurrRoom(currRoom);
            matchRooms.push({ roomName, people: peeps, chat: [] });
        }
    });
    socket.on("createCustomRoom", ({ username, id }) => {
        const roomName = randomWords({ exactly: 3, join: ' ', maxLength: 5 });
        socket.join(roomName);
        currRoom = { roomName, people: [{ username, id, socket }], chat: [] };
        socket.setCurrRoom(currRoom);
        matchRooms.push({ roomName, people: [{ username, id, socket }], chat: [] });
        socket.emit("roomCreated", { roomName });
    });
    socket.on("attemptRoomJoin", ({ roomName, username, id }) => {
        const room = matchRooms.find(({ roomName: rn }) => rn === roomName);
        if (room) {
            socket.join(roomName);
            currRoom = room;
            socket.setCurrRoom(room);
            room.people[0].socket.emit("partnerFound", { username, id, roomName });
            socket.emit("partnerFound", { username: room.people[0].username, id: room.people[0].id, roomName })
            room.people.push({ socket, username, id });
        } else {
            socket.emit("roomJoinFail", {});
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
        room.people.forEach(({ socket: s }) => {
            s.emit("leaveRoom", { displayMessage: s !== socket });
            s.leave(roomName);
        });
        matchRooms.splice(matchRooms.indexOf(room), 1);
        currRoom = undefined;
    });
    socket.on("removeConstraintPuppet", ({ remove, roomName }) => {
        socket.broadcast.to(roomName).emit("rmCPuppet", remove);
    })
    socket.on("heartbeat", (newStamp) => {
        lastMessage = newStamp;
    });
});
server.listen(port, () => {
    console.log(`Server is up on port ${port}`);
});