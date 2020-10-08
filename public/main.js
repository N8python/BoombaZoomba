const { Engine, Composite, Render, World, Bodies, Body, Detector, Constraint } = Matter;
let ground;
let ceiling;
let engine;
let leftWall;
let rightWall;
let steve;
let steveio;
let boxes = [];
let RIGHT = false;
let LEFT = false;
let DOWN = false;
let dagger;
let sword;
let axe;
let collidedBodies = [];
let gameMode = "load";
let victorDisplayed = false;
let victor;
let socket = io();
let id;
let username;
let lobbyChat = [];
let roomChat = [];
let roomPartner;
let roomName;
let inMultiplayerFight;

function preload() {
    dagger = loadImage("dagger.png");
    sword = loadImage("sword.png");
    axe = loadImage("axe.png");
}

function setup() {
    createCanvas(600, 600);
    engine = Engine.create();
    ground = Bodies.rectangle(width / 2, height + 25, width + 10, 100, {
        isStatic: true,
        collisionFilter: {
            category: 1
        },
        friction: 1
    });
    ceiling = Bodies.rectangle(width / 2, -25, width + 10, 100, {
        isStatic: true,
        collisionFilter: {
            category: 1
        },
        friction: 1
    });
    leftWall = Bodies.rectangle(-25, height / 2, 100, height + 10, {
        isStatic: true,
        collisionFilter: {
            category: 1
        },
        friction: 1
    });
    rightWall = Bodies.rectangle(width + 25, height / 2, 100, height + 10, {
        isStatic: true,
        collisionFilter: {
            category: 1
        },
        friction: 1
    });
    for (let i = 0; i < 0; i++) {
        boxes.push(Bodies.rectangle(random(50, 550), random(50, 550), 25, 25, {
            collisionFilter: {
                category: 1
            },
        }));
    }
    steve = Person({
        x: 500,
        y: 475,
        weapon: dagger,
        category: 4
            //color: genColor()
    });
    steveio = Person({
        x: 100,
        y: 475,
        weapon: axe,
        category: 2
            //color: genColor()
    });
    //start();
}
let doneOnce = false;

function start(difficulty, { side = "left", leftColor, rightColor } = {}) {
    victorDisplayed = false;
    let steveWeapon;
    let steveioWeapon;
    let steveCow;
    switch (difficulty) {
        case "Easy":
            steveCow = 0.99;
            steveWeapon = dagger;
            steveioWeapon = axe;
            break;
        case "Medium":
            steveCow = 0.97;
            steveWeapon = sword;
            steveioWeapon = sword;
            break;
        case "Hard":
            steveCow = 0.95;
            steveWeapon = axe;
            steveioWeapon = sword;
            break;
        case "Master":
            steveCow = 0.9;
            steveWeapon = axe;
            steveioWeapon = dagger;
            break;
        case "Multiplayer":
            steveCow = 0;
            steveWeapon = sword;
            steveioWeapon = sword;
            break;
    }
    if (steve) {
        steve.remove();
    }
    if (steveio) {
        steveio.remove();
    }
    if (difficulty === "Multiplayer") {
        steve = Person({
            x: side === "left" ? 500 : 100,
            y: 475,
            weapon: steveWeapon,
            category: 4,
            cowardice: steveCow,
            puppet: difficulty === "Multiplayer",
            color: side === "left" ? rightColor : leftColor
        });
        steveio = Person({
            x: side === "left" ? 100 : 500,
            y: 475,
            weapon: steveioWeapon,
            category: 2,
            color: side === "left" ? leftColor : rightColor
        });
        inMultiplayerFight = true;
    } else {
        steve = Person({
            x: 500,
            y: 475,
            weapon: steveWeapon,
            category: 4,
            cowardice: steveCow,
            puppet: difficulty === "Multiplayer"
                //color: genColor()
        });
        steveio = Person({
            x: 100,
            y: 475,
            weapon: steveioWeapon,
            category: 2
                //color: genColor()
        });
    }
    if (doneOnce === false) {
        World.add(engine.world, [ground, ceiling, leftWall, rightWall, ...boxes]);
    }
    steveio.add();
    steve.add();
    if (doneOnce === false) {
        Engine.run(engine);
    }
    doneOnce = true;
    gameMode = "play";
}
let effects = [];
let prevCollisions = [];

function draw() {
    background(0);
    if (gameMode === "play") {
        fill(200);
        noStroke();
        /*boxes.forEach(box => {
            drawVertices(box.vertices);
            const gravity = engine.world.gravity;
            Body.applyForce(box, box.position, {
                x: -gravity.x * gravity.scale * box.mass,
                y: -gravity.y * gravity.scale * box.mass
            });
        })*/
        drawVertices(ground.vertices);
        drawVertices(ceiling.vertices);
        drawVertices(leftWall.vertices);
        drawVertices(rightWall.vertices);
        stroke(0);
        steve.draw();
        steveio.draw();
        steve.takeDamage();
        steveio.takeDamage();
        strokeWeight(2);
        rect(1, 1, 102, 10);
        strokeWeight(0);
        fill(255 * (1 - steveio.getHealth()), 255 * steveio.getHealth(), 0)
        rect(2, 2, 100 * steveio.getHealth(), 8);
        strokeWeight(1);
        [...steveio.collisionPoints(), ...steve.collisionPoints()].forEach((point) => {
            if (point && point.length !== 0) {
                fill(255, 0, 0);
                noStroke();
                //circle(point.x, point.y, 5);
                if (!collidedBodies.some((body) => body === point.body)) {
                    collidedBodies.push(point.body);
                    const s = new ParticleSystem(createVector(point.x, point.y));
                    for (let i = 0; i < 5; i++) {
                        s.addParticle();
                    }
                    effects.push(s);
                }
            }
        });
        collidedBodies.forEach((body, i) => {
                if (Math.random() < 0.01) {
                    collidedBodies.splice(i, 1);
                }
            })
            //prevCollisions = [...steve.collisionPoints(), ...steveio.collisionPoints()];
        effects.forEach(system => {
            system.run();
            strokeWeight(1);
        })
        if (RIGHT && steveio.speed < 5) {
            steveio.speed += 0.25;
        } else
        if (LEFT && steveio.speed > -5) {
            steveio.speed -= 0.25;
        } else if (steveio.touchingGround()) {
            steveio.speed *= 0.8;
        }
        if (DOWN) {
            steveio.down();
        }
        if (steveio.touchingGround()) {
            steveio.speed *= 0.9;
        } else {
            steveio.speed *= 0.99;
        }
        if (inMultiplayerFight) {
            socket.emit("sendBodyData", { roomName, bodyData: steveio.getVelocities(), bodyPosData: steveio.getPositions(), bodyAngData: steveio.getAngles(), bodyAngVData: steveio.getAngleVels(), health: steveio.getHealth() });
        }
    }
}

function drawCircle(body) {
    circle(body.position.x, body.position.y, body.circleRadius * 2);
}

function drawVertices(vertices) {
    beginShape();
    for (var i = 0; i < vertices.length; i++) {
        vertex(vertices[i].x, vertices[i].y);
    }
    endShape(CLOSE);
}

function drawConstraint(c) {
    line(c.bodyA.position.x + c.pointA.x, c.bodyA.position.y + c.pointA.y, c.bodyB.position.x + c.pointB.x, c.bodyB.position.y + c.pointB.y);
}

function keyPressed() {
    if (gameMode === "play") {
        if (key === " ") {
            steveio.jump();
        }
        if (key === "ArrowRight") {
            RIGHT = true;
        }
        if (key === "ArrowLeft") {
            LEFT = true;
        }
        if (key === "ArrowDown") {
            DOWN = true;
        }
    }
}

function keyReleased() {
    if (gameMode === "play") {
        if (key === "ArrowUp") {
            steveio.jump();
        }
        if (key === "ArrowRight") {
            RIGHT = false;
        }
        if (key === "ArrowLeft") {
            LEFT = false;
        }
        if (key === "ArrowDown") {
            DOWN = false;
        }
    }
}
const menu = document.getElementById("menu");

function displayVictor() {
    if (!victorDisplayed) {
        let winner = (victor === steveio) ? "You" : "The AI";
        if (inMultiplayerFight) {
            winner = "You";
        }
        const winMessage = (victor === steve && inMultiplayerFight) ? "Lost" : "Won"
        menu.innerHTML = `<h1 style="font-size: 60px; margin-left: ${winner === "You" ? 108 : 78}px" class="w3-text-white w3-animate-opacity">${winner} ${winMessage}</h1>`;
        const restartButton = document.createElement("button");
        restartButton.innerHTML = inMultiplayerFight ? "Return To Lobby" : "Restart";
        restartButton.style.marginLeft = "100px";
        restartButton.classList.add(...
            "w3-button w3-gray w3-xlarge w3-text-white w3-round".split(" "));
        restartButton.onclick = inMultiplayerFight ? (() => {
            gameMode = "load";
            displayRoomLobby(roomPartner);
            displayRoomChat();
        }) : singlePlayerSelection;
        menu.appendChild(restartButton);
        victorDisplayed = true;
    }
}
const singlePlayerSelection = () => {
    gameMode = "load";
    menu.innerHTML = `<h1 style="font-size: 60px; margin-left: 64px;" class="w3-text-white">Singleplayer</h1>
    <p style="margin-left: 32px" class="w3-xlarge w3-text-white">Difficulty:</p>`
        /*
        <select id="difficulty" style="margin-left: 24px" class="w3-select">
        <option>Easy</option>
        <option>Medium</option>
        <option>Hard</option>
        <option>Master</option>
        </select>
        */
    const difficulty = document.createElement("select");
    difficulty.innerHTML = `<option>Easy</option>
   <option>Medium</option>
   <option>Hard</option>
   <option>Master</option>`;
    difficulty.style.marginLeft = "24px";
    difficulty.classList.add("w3-select");
    menu.appendChild(difficulty);
    menu.appendChild(document.createElement("br"));
    menu.appendChild(document.createElement("br"));
    const startButton = document.createElement("button");
    startButton.innerHTML = "Start";
    startButton.style.marginLeft = "32px";
    startButton.classList.add(...
        "w3-button w3-gray w3-xlarge w3-text-white w3-round".split(" "));
    startButton.onclick = () => {
        menu.innerHTML = "";
        const diffVal = difficulty.value;
        start(diffVal);
    }
    menu.appendChild(startButton);
}
const askUsername = () => {
    gameMode = "load";
    menu.innerHTML = `<h1 style="font-size: 60px; margin-left: 64px;" class="w3-text-white">Multiplayer</h1>`;
    const usernameBox = document.createElement("input");
    usernameBox.setAttribute("placeholder", "Enter a username...");
    usernameBox.classList.add("w3-xlarge");
    usernameBox.style.marginLeft = "48px";
    usernameBox.onkeyup = (e) => {
        if (e.key === "Enter") {
            username = usernameBox.value;
            openLobby();
        }
    }
    menu.appendChild(usernameBox);
}
const openLobby = () => {
    gameMode = "load";
    menu.innerHTML = `<h1 style="font-size: 60px; margin-left: 64px;" class="w3-text-white">Multiplayer</h1>`;
    const chatLog = document.createElement("div");
    chatLog.classList.add("w3-white", "w3-round-xlarge");
    chatLog.style.padding = "4px";
    chatLog.style.width = "200px";
    chatLog.style.height = "200px";
    chatLog.style.fontFamily = "'Ubuntu', sans-serif";
    chatLog.style.marginLeft = "110px";
    chatLog.style.textAlign = "left";
    chatLog.style.overflowY = "scroll";
    chatLog.style.wordWrap = "break-word";
    chatLog.innerHTML = "Chat Log:<br>";
    chatLog.id = "chatLog";
    const chatInput = document.createElement("input");
    chatInput.classList.add("w3-round-xlarge")
    chatInput.style.marginLeft = "110px";
    chatInput.placeholder = `Message Here...`;
    chatInput.style.width = "200px";
    chatInput.style.fontFamily = "'Ubuntu', sans-serif";
    chatInput.onkeyup = (e) => {
        if (e.key === "Enter") {
            sendMessage(chatInput.value);
            chatInput.value = "";
        }
    }
    const randomMatch = document.createElement("button");
    randomMatch.classList.add(...
        "w3-button w3-gray w3-xlarge w3-text-white w3-round".split(" "));
    randomMatch.innerHTML = "Random Match";
    randomMatch.style.marginLeft = "105px";
    randomMatch.onclick = () => {
        menu.innerHTML = `<h1 style="font-size: 60px; margin-left: 100px;" class="w3-text-white">Waiting...</h1>`;
        socket.emit("addToRWaiting", {
            username,
            id
        });
    }
    const createMatch = document.createElement("button");
    createMatch.classList.add(...
        "w3-button w3-gray w3-xlarge w3-text-white w3-round".split(" "));
    createMatch.innerHTML = "Create Match";
    createMatch.style.marginLeft = "35px";
    createMatch.onclick = () => {
        socket.emit("createCustomRoom", { username, id });
    }
    const joinMatch = document.createElement("button");
    joinMatch.classList.add(...
        "w3-button w3-gray w3-xlarge w3-text-white w3-round".split(" "));
    joinMatch.innerHTML = "Join Match";
    joinMatch.style.marginLeft = "20px";
    joinMatch.onclick = () => {
        Swal.fire({
            title: "Enter Room Code",
            input: "text",
            showCancelButton: true
        }).then(({ value }) => {
            if (value) {
                socket.emit("attemptRoomJoin", { roomName: value, username, id });
            }
        })
    }
    menu.appendChild(chatLog);
    const group = document.createElement("div");
    group.style.textAlign = "left";
    group.appendChild(chatInput);
    group.appendChild(document.createElement("br"));
    group.appendChild(document.createElement("br"));
    group.appendChild(randomMatch);
    group.appendChild(document.createElement("br"));
    group.appendChild(document.createElement("br"));
    group.appendChild(createMatch);
    group.appendChild(joinMatch);
    menu.appendChild(group);
    displayLobbyChat();
}
const displayLobbyChat = () => {
    const chatLog = document.getElementById("chatLog")
    if (chatLog) {
        chatLog.innerHTML = " Chat Log:<br>";
        lobbyChat.forEach(message => {
            chatLog.innerHTML += message;
            chatLog.innerHTML += "<br>";
        });
        chatLog.scrollTop = chatLog.scrollHeight;
    }
}
const displayRoomChat = () => {
    const chatLog = document.getElementById("chatLogRoom")
    if (chatLog) {
        chatLog.innerHTML = " Chat Log:<br>";
        roomChat.forEach(message => {
            chatLog.innerHTML += message;
            chatLog.innerHTML += "<br>";
        });
        chatLog.scrollTop = chatLog.scrollHeight;
    }
}
const displayRoomLobby = (partner) => {
    roomName = partner.roomName;
    menu.innerHTML = "";
    const title = document.createElement("h1");
    title.classList.add("w3-text-white");
    title.innerHTML = partner.username !== undefined ? `Partner Found: ${partner.username}` : `Room Code: ${roomName}`;
    const chatLog = document.createElement("div");
    chatLog.classList.add("w3-white", "w3-round-xlarge");
    chatLog.style.padding = "4px";
    chatLog.style.width = "200px";
    chatLog.style.height = "200px";
    chatLog.style.fontFamily = "'Ubuntu', sans-serif";
    chatLog.style.marginLeft = "110px";
    chatLog.style.textAlign = "left";
    chatLog.style.overflowY = "scroll";
    chatLog.style.wordWrap = "break-word";
    chatLog.innerHTML = "Chat Log:<br>";
    chatLog.id = "chatLogRoom";
    const chatInput = document.createElement("input");
    chatInput.classList.add("w3-round-xlarge")
    chatInput.style.marginLeft = "110px";
    chatInput.placeholder = `Message Here...`;
    chatInput.style.width = "200px";
    chatInput.style.fontFamily = "'Ubuntu', sans-serif";
    chatInput.onkeyup = (e) => {
        if (e.key === "Enter") {
            sendRoomMessage(chatInput.value);
            chatInput.value = "";
        }
    }
    const fightButton = document.createElement("button");
    fightButton.innerHTML = "Fight";
    fightButton.style.marginLeft = "150px";
    fightButton.classList.add(...
        "w3-button w3-gray w3-xlarge w3-text-white w3-round".split(" "));
    fightButton.onclick = () => {
        socket.emit("startFightMessage", { roomName });
    }
    const leaveButton = document.createElement("button");
    leaveButton.innerHTML = "Leave";
    leaveButton.style.marginLeft = "150px";
    leaveButton.classList.add(...
        "w3-button w3-gray w3-xlarge w3-text-white w3-round".split(" "));
    leaveButton.onclick = () => {
        openLobby();
        socket.emit("takeDownRoom", { roomName });
    }
    menu.appendChild(title);
    menu.appendChild(chatLog);
    const group = document.createElement("div");
    group.style.textAlign = "left";
    group.appendChild(chatInput);
    group.appendChild(document.createElement("br"));
    group.appendChild(document.createElement("br"));
    group.appendChild(fightButton);
    group.appendChild(document.createElement("br"));
    group.appendChild(document.createElement("br"));
    group.appendChild(leaveButton);
    menu.appendChild(group);
}
document.getElementById("singleplayer").onclick = singlePlayerSelection;
document.getElementById("multiplayer").onclick = askUsername;
socket.on("connect", () => {
    console.log("Connected to server!");
})
socket.on("idSent", data => {
    id = data.id;
});
socket.on("messageRecord", messages => {
    lobbyChat = messages;
    displayLobbyChat();
});
socket.on("roomMessageRecord", messages => {
    roomChat = messages;
    displayRoomChat();
})
socket.on("partnerFound", partner => {
    displayRoomLobby(partner);
    roomPartner = partner;
})
socket.on("roomCreated", ({ roomName }) => {
    displayRoomLobby({ roomName });
})
socket.on("startFight", ({ side, leftColor, rightColor }) => {
    menu.innerHTML = "";
    start("Multiplayer", { side, leftColor, rightColor });
})
socket.on("receiveBodyData", ({ bodyData, bodyPosData, bodyAngData, bodyAngVData, health }) => {
    steve.setPositions(bodyPosData);
    steve.setAngles(bodyAngData);
    steve.setVelocities(bodyData);
    steve.setAngleVels(bodyAngVData);
    steve.setHealth(health);
});
socket.on("win", () => {
    victor = steveio;
    displayVictor();
});
socket.on("leaveRoom", ({ disconnected, displayMessage }) => {
    if (disconnected) {
        Swal.fire({
            title: 'Your partner disconnected!',
            text: 'You have been returned to the main lobby.',
            icon: 'error',
            confirmButtonText: 'Ok.'
        })
    }
    if (displayMessage) {
        Swal.fire({
            title: "Your partner left the room!",
            text: "You have been returned to the main lobby.",
            icon: "error",
            confirmButtonText: 'Ok.'
        })
    }
    openLobby();
});
socket.on("roomJoinFail", () => {
    Swal.fire({
        title: 'Invalid Room Code!',
        text: 'No room with that code exists.',
        icon: 'error',
        confirmButtonText: 'Ok.'
    })
})
socket.on("rmCPuppet", remove => {
    steve.removeJoints(remove);
})
setInterval(() => {
    socket.emit("heartbeat", Date.now());
}, 1000)

function sendMessage(message) {
    socket.emit("messageSend", {
        username,
        message,
        id
    })
}

function sendRoomMessage(message) {
    socket.emit("roomMessageSend", {
        username,
        message,
        id,
        roomName
    });
}