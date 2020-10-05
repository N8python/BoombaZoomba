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

function start(difficulty) {
    victorDisplayed = false;
    let steveWeapon;
    let stevioWeapon;
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
    }
    steve = Person({
        x: 500,
        y: 475,
        weapon: steveWeapon,
        category: 4,
        cowardice: steveCow
            //color: genColor()
    });
    steveio = Person({
        x: 100,
        y: 475,
        weapon: steveioWeapon,
        category: 2
            //color: genColor()
    });
    World.add(engine.world, [ground, ceiling, leftWall, rightWall, ...boxes]);
    steveio.add();
    steve.add();
    Engine.run(engine);
    gameMode = "play";
}
let effects = [];
let prevCollisions = [];

function draw() {
    background(0);
    if (gameMode === "play") {
        fill(200);
        noStroke();
        boxes.forEach(box => {
            drawVertices(box.vertices);
            const gravity = engine.world.gravity;
            Body.applyForce(box, box.position, {
                x: -gravity.x * gravity.scale * box.mass,
                y: -gravity.y * gravity.scale * box.mass
            });
        })
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
        const winner = victor === steveio ? "You" : "The AI";
        menu.innerHTML = `<h1 style="font-size: 60px; margin-left: ${winner === "You" ? 108 : 78}px" class="w3-text-white w3-animate-opacity">${winner} won</h1>`;
        const restartButton = document.createElement("button");
        restartButton.innerHTML = "Restart";
        restartButton.style.marginLeft = "100px";
        restartButton.classList.add(...
            "w3-button w3-gray w3-xlarge w3-text-white w3-round".split(" "));
        restartButton.onclick = singlePlayerSelection;
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
document.getElementById("singleplayer").onclick = singlePlayerSelection;