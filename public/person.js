function vecTo(x1, y1, x2, y2, mag = 1) {
    const xDist = x2 - x1;
    const yDist = y2 - y1;
    let direction;
    if (xDist > 0 && yDist > 0) {
        direction = degrees(Math.atan(yDist / xDist));
    } else if (xDist > 0 && yDist < 0) {
        direction = 360 + degrees(Math.atan(yDist / xDist));
    } else {
        direction = 180 + degrees(Math.atan(yDist / xDist));
    }
    return { x: Math.cos(radians(direction)) * mag, y: Math.sin(radians(direction)) * mag };
}

function Person({
    x,
    y,
    color = [225, 225, 225],
    weapon,
    category,
    cowardice = 0,
    puppet = false
}) {
    const weaponWidth = 10;
    const weaponHeight = 30;
    const myGroup = Body.nextGroup(false);
    const myMask = 7 - category;
    const myCategory = category;
    let deadBodyParts = [];
    const torso = Bodies.rectangle(x, y, 10, 40, {
        collisionFilter: {
            mask: myMask,
            group: myGroup,
            category: myCategory
        },
        restitution: 0.5,
        friction: 1,
        frictionAir: 0
    });
    const head = Bodies.circle(x, y - 25, 15, {
        collisionFilter: {
            mask: myMask,
            group: Body.nextGroup(false),
            category: myCategory
        },
    });
    const distanceFromCenter = 0;
    const legWidth = 10;
    const l3 = Body.nextGroup(false);
    const l4 = Body.nextGroup(false);
    const upperArm1 = Bodies.rectangle(x, y - 5, legWidth, 20, {
        collisionFilter: {
            mask: myMask,
            group: l3,
            category: myCategory
        },
        /*frictionAir: 0.1,*/
    });
    const upperArm2 = Bodies.rectangle(x, y - 5, legWidth, 20, {
        collisionFilter: {
            mask: myMask,
            group: l4,
            category: myCategory
        },
        /*frictionAir: 0.1,*/
    });
    const lowerArm1 = Bodies.rectangle(x, y + 5, legWidth, 30, {
        collisionFilter: {
            mask: myMask,
            group: l3,
            category: myCategory
        },
        /*frictionAir: 0.1,*/
    });
    const lowerArm2 = Bodies.rectangle(x, y + 5, legWidth, 30, {
        collisionFilter: {
            mask: myMask,
            group: l4,
            category: myCategory
        },
        /*frictionAir: 0.1,*/
    });
    const weaponBox = Bodies.rectangle(x, y + 5, weaponWidth, weaponHeight + 40, {
        collisionFilter: {
            mask: myMask,
            group: Body.nextGroup(false),
            category: myCategory
        },
        density: (() => {
            switch (weapon) {
                case axe:
                    return 0.005;
                case sword:
                    return 0.0025;
                case dagger:
                    return 0.001;
            }
        })()
    });
    const l1 = Body.nextGroup(false);
    const l2 = Body.nextGroup(false);
    const upperLeg1 = Bodies.rectangle(x + distanceFromCenter, y + 45, legWidth, 30, {
        collisionFilter: {
            mask: myMask,
            group: l1,
            category: myCategory
        },
        /*frictionAir: 0.1,*/
    });
    const upperLeg2 = Bodies.rectangle(x - distanceFromCenter, y + 45, legWidth, 30, {
        collisionFilter: {
            mask: myMask,
            group: l2,
            category: myCategory
        }
        /*frictionAir: 0.1,*/
    });
    let death = false;
    let healthLost = 0;
    const s = 1;
    const u = 2.5;
    const l = 2.5;
    const shoulder1 = Constraint.create({
        bodyA: torso,
        bodyB: upperArm1,
        length: 0,
        pointA: {
            x: distanceFromCenter,
            y: -10
        },
        pointB: {
            x: 0,
            y: -10
        },
        /*angleAStiffness: s,
        angleAMin: -Math.PI / u,
        angleAMax: Math.PI / u,*/
        /*angleBMin: -Math.PI / u,
        angleBMax: Math.PI / u,
        angleBStiffness: s,
        damping: 0.1*/
    })
    const shoulder2 = Constraint.create({
        bodyA: torso,
        bodyB: upperArm2,
        length: 0,
        pointA: {
            x: -distanceFromCenter,
            y: -10
        },
        pointB: {
            x: 0,
            y: -10
        },
        /*angleAStiffness: s,
        angleAMin: -Math.PI / u,
        angleAMax: Math.PI / u,*/
        /*angleBMin: -Math.PI / u,
        angleBMax: Math.PI / u,
        angleBStiffness: s,
        damping: 0.1*/
    });
    const elbow1 = Constraint.create({
        bodyA: upperArm1,
        bodyB: lowerArm1,
        length: 0,
        pointA: {
            x: distanceFromCenter,
            y: 10
        },
        pointB: {
            x: 0,
            y: -15
        },
        /*angleAStiffness: s,
        angleAMin: -Math.PI / u,
        angleAMax: Math.PI / u,*/
        angleBMin: -Math.PI / u,
        angleBMax: Math.PI / u,
        angleBStiffness: s,
        damping: 0.1
    })
    const elbow2 = Constraint.create({
        bodyA: upperArm2,
        bodyB: lowerArm2,
        length: 0,
        pointA: {
            x: distanceFromCenter,
            y: 10
        },
        pointB: {
            x: 0,
            y: -15
        },
        /*angleAStiffness: s,
        angleAMin: -Math.PI / u,
        angleAMax: Math.PI / u,*/
        angleBMin: -Math.PI / u,
        angleBMax: Math.PI / u,
        angleBStiffness: s,
        damping: 0.1
    });
    const weaponAttachment = Constraint.create({
        bodyA: lowerArm1,
        bodyB: weaponBox,
        length: 0,
        pointA: {
            x: distanceFromCenter,
            y: 10
        },
        pointB: {
            x: 0,
            y: -weaponHeight / 2
        },
        /*angleAStiffness: s,
        angleAMin: -Math.PI / u,
        angleAMax: Math.PI / u,*/
        /*angleBMin: -Math.PI / u,
        angleBMax: Math.PI / u,
        angleBStiffness: s,
        damping: 0.1*/
    });
    const hipJoint1 = Constraint.create({
        bodyA: torso,
        bodyB: upperLeg1,
        length: 0,
        pointA: {
            x: distanceFromCenter,
            y: 20
        },
        pointB: {
            x: 0,
            y: -15
        },
        /*angleAStiffness: s,
        angleAMin: -Math.PI / (u * 2),
        angleAMax: Math.PI / (u * 2),*/
        angleBMin: -Math.PI / u,
        angleBMax: Math.PI / u,
        angleBStiffness: s,
        damping: 0.1
    })
    const hipJoint2 = Constraint.create({
        bodyA: torso,
        bodyB: upperLeg2,
        length: 0,
        pointA: {
            x: -distanceFromCenter,
            y: 20
        },
        pointB: {
            x: 0,
            y: -15
        },
        /*angleAStiffness: s,
        angleAMin: -Math.PI / (u * 2),
        angleAMax: Math.PI / (u * 2),*/
        angleBMin: -Math.PI / u,
        angleBMax: Math.PI / u,
        angleBStiffness: s,
        damping: 0.1
    })
    const lowerLeg1 = Bodies.rectangle(x + distanceFromCenter, y + 75, legWidth, 30, {
        collisionFilter: {
            mask: myMask,
            group: l1,
            category: myCategory
        },
        restitution: 1
            /*angleAStiffness: s,
            angleAMin: -Math.PI / l,
            angleAMax: Math.PI / l,*/
    });
    const lowerLeg2 = Bodies.rectangle(x - distanceFromCenter, y + 75, legWidth, 30, {
        collisionFilter: {
            mask: myMask,
            group: l2,
            category: myCategory
        },
        restitution: 1
            /*angleAStiffness: s,
            angleAMin: -Math.PI / l,
            angleAMax: Math.PI / l,*/
    });
    const foot1 = Bodies.rectangle(x - 10, y + 85, 12, 10, {
        collisionFilter: {
            mask: myMask,
            group: myGroup,
            category: myCategory
        }
    })
    const foot2 = Bodies.rectangle(x + 10, y + 85, 12, 10, {
        collisionFilter: {
            mask: myMask,
            group: myGroup,
            category: myCategory
        }
    })
    const ankle1 = Constraint.create({
        bodyA: lowerLeg1,
        bodyB: foot1,
        pointA: {
            x: 0,
            y: 15
        },
        pointB: {
            x: 0,
            y: -5
        },
        length: 0
    })
    const ankle2 = Constraint.create({
        bodyA: lowerLeg2,
        bodyB: foot2,
        pointA: {
            x: 0,
            y: 15
        },
        pointB: {
            x: 0,
            y: -5
        },
        length: 0
    })
    const knee1 = Constraint.create({
        bodyA: upperLeg1,
        bodyB: lowerLeg1,
        length: 0,
        pointA: {
            x: 0,
            y: 15
        },
        pointB: {
            x: 0,
            y: -15
        },
        angleBMin: -Math.PI / l,
        angleBMax: Math.PI / l,
        angleBStiffness: s,
    })
    const knee2 = Constraint.create({
        bodyA: upperLeg2,
        bodyB: lowerLeg2,
        length: 0,
        pointA: {
            x: 0,
            y: 15
        },
        pointB: {
            x: 0,
            y: -15
        },
        angleBMin: -Math.PI / l,
        angleBMax: Math.PI / l,
        angleBStiffness: s,
    })

    const neck = Constraint.create({
        bodyA: torso,
        bodyB: head,
        pointA: {
            x: 0,
            y: -20
        },
        pointB: {
            x: 0,
            y: 15
        },
        length: 0,
        angleBMax: 0,
        angleBMin: 0,
        angleBStiffness: 1
    });
    const r = 25;
    const hipConstraint1 = Constraint.create({
        bodyA: torso,
        pointA: { x: -r, y: 0 },
        bodyB: upperLeg1,
        pointB: { x: -r, y: 0 },
        stiffness: 0,
        length: r
    });
    const hipConstraint2 = Constraint.create({
        bodyA: torso,
        pointA: { x: r, y: 0 },
        bodyB: upperLeg2,
        pointB: { x: r, y: 0 },
        stiffness: 0,
        length: r
    });
    const ankleConstraint1 = Constraint.create({
        bodyA: upperLeg1,
        pointA: { x: -r, y: 0 },
        bodyB: lowerLeg1,
        pointB: { x: -r, y: 0 },
        stiffness: 0,
        length: r
    });
    const ankleConstraint2 = Constraint.create({
        bodyA: upperLeg2,
        pointA: { x: r, y: 0 },
        bodyB: lowerLeg2,
        pointB: { x: r, y: 0 },
        stiffness: 0,
        length: r
    });
    head.health = 50;
    head.maxHealth = 50;
    torso.health = 100;
    torso.maxHealth = 100;
    [upperArm1, lowerArm1, upperArm2, lowerArm2, upperLeg1, lowerLeg1, upperLeg2, lowerLeg2].forEach(x => {
        x.health = 30;
        x.maxHealth = 30;
    })
    let inGame = false;
    let timeSurvived = 0;
    let torsoHeight = 0;
    let anklePenalty = 0;
    let movingLegs = 0;
    let step = 0;
    let speed = 0;

    function setVelocity(body, vec) {
        if (!deadBodyParts.includes(body)) {
            Body.setVelocity(body, vec);
        }
    }
    let puppetHealth = 1;
    return {
        get inGame() {
            return inGame;
        },
        get score() {
            return max((torso.position.x) ** 5, 0); //max(head.position.x ** 3 + timeSurvived ** 1.5 + movingLegs ** 1.5 + max(torsoHeight, 0) ** 1.2 - anklePenalty ** 1.3, 0);
        },
        add() {
            inGame = true;
            World.add(engine.world, [head, neck, torso, /*arm1, arm2,*/ upperLeg1, upperLeg2, lowerLeg1, lowerLeg2, hipJoint1, hipJoint2, knee1, knee2, upperArm1, upperArm2, shoulder1, shoulder2, lowerArm1, lowerArm2, elbow1, elbow2, weaponBox, weaponAttachment /*foot1, foot2, ankle1, ankle2 hipConstraint1, hipConstraint2, ankleConstraint1, ankleConstraint2*/ ]);
        },
        remove() {
            inGame = false;
            World.remove(engine.world, [head, neck, torso, /* arm1, arm2,*/ upperLeg1, upperLeg2, lowerLeg1, lowerLeg2, hipJoint1, hipJoint2, knee1, knee2, upperArm1, upperArm2, shoulder1, shoulder2, lowerArm1, lowerArm2, elbow1, elbow2, weaponBox, weaponAttachment /*foot1, foot2, ankle1, ankle2*/ /*hipConstraint1, hipConstraint2, ankleConstraint1, ankleConstraint2*/ ]);
        },
        draw() {
            this.bodyParts.forEach(part => {
                if (deadBodyParts.includes(part)) {
                    part.restitution = 0;
                }
            })
            if (inGame) {
                if (speed > 0.025) {
                    if (step % 60 < 30) {
                        setVelocity(lowerLeg1, vecTo(lowerLeg1.position.x, lowerLeg1.position.y, torso.position.x + 50, torso.position.y + 75, 2));
                        if (!deadBodyParts.includes(lowerLeg1)) {
                            lowerLeg1.velocity.x += 1;
                        }
                        if (step > 30) {
                            setVelocity(lowerLeg2, vecTo(lowerLeg1.position.x, lowerLeg1.position.y, torso.position.x - 50, torso.position.y + 75, 2));
                        }
                        setVelocity(lowerLeg1, { x: lowerLeg1.velocity.x + speed, y: lowerLeg1.velocity.y })
                    } else {
                        setVelocity(lowerLeg1, vecTo(lowerLeg1.position.x, lowerLeg1.position.y, torso.position.x - 50, torso.position.y + 75, 2));
                        setVelocity(lowerLeg2, vecTo(lowerLeg1.position.x, lowerLeg1.position.y, torso.position.x + 50, torso.position.y + 75, 2));
                        setVelocity(lowerLeg2, { x: lowerLeg2.velocity.x + speed, y: lowerLeg2.velocity.y })
                    }
                    if (abs(torso.velocity.y) < 9) {
                        setVelocity(torso, vecTo(torso.position.x, torso.position.y, torso.position.x + 0.001, torso.position.y - 15, 2));
                    }
                } else if (speed < -0.025) {
                    if (step % 60 < 30) {
                        setVelocity(lowerLeg1, vecTo(lowerLeg1.position.x, lowerLeg1.position.y, torso.position.x - 50, torso.position.y + 75, 2));
                        if (!deadBodyParts.includes(lowerLeg1)) {
                            lowerLeg1.velocity.x += 1;
                        }
                        if (step > 30) {
                            setVelocity(lowerLeg2, vecTo(lowerLeg1.position.x, lowerLeg1.position.y, torso.position.x + 50, torso.position.y + 75, 2));
                        }
                        setVelocity(lowerLeg1, { x: lowerLeg1.velocity.x + speed, y: lowerLeg1.velocity.y })
                    } else {
                        setVelocity(lowerLeg1, vecTo(lowerLeg1.position.x, lowerLeg1.position.y, torso.position.x + 50, torso.position.y + 75, 2));
                        setVelocity(lowerLeg2, vecTo(lowerLeg1.position.x, lowerLeg1.position.y, torso.position.x - 50, torso.position.y + 75, 2));
                        setVelocity(lowerLeg2, { x: lowerLeg2.velocity.x + speed, y: lowerLeg2.velocity.y })
                    }
                    if (abs(torso.velocity.y) < 9) {
                        setVelocity(torso, vecTo(torso.position.x, torso.position.y, torso.position.x + 0.001, torso.position.y - 15, 2));
                    }
                } else {
                    setVelocity(lowerLeg1, vecTo(lowerLeg1.position.x, lowerLeg1.position.y, torso.position.x + 0.01, torso.position.y + 75, 2));
                    setVelocity(lowerLeg2, vecTo(lowerLeg2.position.x, lowerLeg2.position.y, torso.position.x + 0.01, torso.position.y + 75, 2));
                    if (abs(torso.velocity.y) < 9) {
                        setVelocity(torso, vecTo(torso.position.x, torso.position.y, torso.position.x + 0.001, torso.position.y - 15, 2));
                    }
                }
                healthLost *= cowardice;
                if (keyIsPressed && key === " " && this === steveio) {
                    const toMouse1 = vecTo(lowerArm1.position.x, lowerArm1.position.y, mouseX, mouseY, 1);
                    const toMouse2 = vecTo(lowerArm2.position.x, lowerArm2.position.y, mouseX, mouseY, 1);
                    const toMouseWeapon = vecTo(weaponBox.position.x, weaponBox.position.y, mouseX, mouseY, 0.7);
                    setVelocity(lowerArm1, { x: lowerArm1.velocity.x + toMouse1.x, y: lowerArm1.velocity.y + toMouse1.y });
                    setVelocity(lowerArm2, { x: lowerArm2.velocity.x + toMouse2.x, y: lowerArm2.velocity.y + toMouse2.y });
                    setVelocity(weaponBox, { x: weaponBox.velocity.x + toMouseWeapon.x, y: weaponBox.velocity.y + toMouseWeapon.y })
                    speed += toMouse1.x * 0.1;
                }
                if (this === steve && this.opponent && !this.opponent.deadBodyParts.includes(this.opponent.head) && !puppet) {
                    if (!this.deadBodyParts.includes(lowerArm1)) {
                        const c = healthLost > 10 ? -1 : 1;
                        const toMouse1 = vecTo(lowerArm1.position.x, lowerArm1.position.y, this.opponent.head.position.x, this.opponent.head.position.y, c);
                        const toMouse2 = vecTo(lowerArm2.position.x, lowerArm2.position.y, this.opponent.head.position.x, this.opponent.head.position.y, c);
                        const toMouseWeapon = vecTo(weaponBox.position.x, weaponBox.position.y, this.opponent.head.position.x, this.opponent.head.position.y, c);
                        setVelocity(lowerArm1, { x: lowerArm1.velocity.x + toMouse1.x, y: lowerArm1.velocity.y + toMouse1.y });
                        setVelocity(lowerArm2, { x: lowerArm2.velocity.x + toMouse2.x, y: lowerArm2.velocity.y + toMouse2.y });
                        setVelocity(weaponBox, { x: weaponBox.velocity.x + toMouseWeapon.x, y: weaponBox.velocity.y + toMouseWeapon.y })
                    } else {
                        if (x < this.opponent.x) {
                            speed = -5;
                        }
                        if (x > this.opponent.x) {
                            speed = 5;
                        }
                        if (y > this.opponent.y && y < 300) {
                            this.down();
                        }
                        if (y < this.opponent.y && y > 100) {
                            if (Math.random() < 0.2) {
                                this.jump();
                            }
                        }
                    }
                }
                //Body.setAngularVelocity(lowerLeg2, -0.1)
                if (!deadBodyParts.includes(torso)) {
                    Body.setAngularVelocity(torso, -torso.angle / 10);
                }
                setVelocity(torso, { x: torso.velocity.x + speed, y: torso.velocity.y - 0.2 });
                setVelocity(torso, { x: min(max(-10, torso.velocity.x), 10), y: torso.velocity.y });
                //Body.setAngle(weaponBox, lowerLeg1.angle);
                fill(...color);
                drawVertices(torso.vertices);
                /*drawVertices(arm1.vertices);
                drawVertices(arm2.vertices);*/
                drawVertices(upperLeg1.vertices);
                drawVertices(upperLeg2.vertices);
                drawVertices(lowerLeg1.vertices);
                drawVertices(lowerLeg2.vertices);
                drawVertices(upperArm1.vertices);
                drawVertices(upperArm2.vertices);
                drawVertices(lowerArm1.vertices);
                drawVertices(lowerArm2.vertices);
                /*fill(255, 0, 0);
                drawVertices(weaponBox.vertices);*/
                push();
                translate(weaponBox.position.x, weaponBox.position.y);
                rotate(Math.PI / 2 + weaponBox.angle);
                imageMode(CENTER);
                image(weapon, 0, 0, weaponHeight * 10, weaponWidth * 10);
                pop();
                /*drawVertices(foot1.vertices);
                drawVertices(foot2.vertices);*/
                fill(255);
                drawCircle(head);
                push();
                noFill();
                const headX = head.position.x;
                const headY = head.position.y;
                const xOffset = constrain(head.velocity.x, -2, 2);
                const yOffset = constrain(head.velocity.y, -2, 2);
                translate(headX, headY);
                rotate(head.angle);
                fill(255);
                circle(-7, -2, 10);
                circle(7, -2, 10);
                fill(0);
                circle(-7 + xOffset, -2 + yOffset, 5);
                circle(7 + xOffset, -2 + yOffset, 5);
                pop();
                /*stroke(255, 0, 0);
                drawConstraint(neck);
                drawConstraint(hipJoint1);
                drawConstraint(hipJoint2);
                drawConstraint(knee1);
                drawConstraint(knee2);
                stroke(0);*/
                /*stroke(255);
                drawConstraint(hipConstraint1);
                stroke(0);*/
                step += 1;
                //image(weapon, x, y, 300, 100);
            }
        },
        get x() {
            return torso.position.x;
        },
        get y() {
            return torso.position.y;
        },
        get speed() {
            return speed;
        },
        set speed(val) {
            speed = val;
        },
        get weapon() {
            return weaponBox;
        },
        get opponent() {
            return this === steve ? steveio : steve;
        },
        jump() {
            setVelocity(torso, { x: torso.velocity.x, y: torso.velocity.y - 10 });
        },
        down() {
            setVelocity(torso, { x: torso.velocity.x, y: torso.velocity.y + 10 });
        },
        touchingGround() {
            return Detector.collisions([
                [lowerLeg1, ground],
                [lowerLeg2, ground],
                [upperLeg1, ground],
                [upperLeg2, ground],
                [torso, ground],
                [head, ground]
            ], engine).length !== 0;
        },
        getHealth() {
            if (puppet) {
                return puppetHealth;
            }
            const healths = this.bodyParts.slice(0, -1).map(x => (x.health / x.maxHealth) * x.maxHealth ** (x === head ? 2.5 : 2));
            const maxes = this.bodyParts.slice(0, -1).map(x => x.maxHealth ** (x === head ? 2.5 : 2));
            return max(min(healths.reduce((t, v) => t + v) / maxes.reduce((t, v) => t + v), 1), 0) ** 2;
        },
        get bodyParts() {
            return [head, torso, upperArm1, lowerArm1, upperArm2, lowerArm2, upperLeg1, lowerLeg1, upperLeg2, lowerLeg2, weaponBox];
        },
        get head() {
            return head;
        },
        get torso() {
            return torso;
        },
        get deadBodyParts() {
            return deadBodyParts;
        },
        collisionPoints() {
            return Detector.collisions(this.opponent.bodyParts.map(x => [x, this.weapon]).concat(this.bodyParts.map(x => [this.weapon, x])), engine).map(x => x.bodyA === this.weapon ? ({...x.bodyB.position, body: x.bodyB }) : ({...x.bodyA.position, body: x.bodyA }));
        },
        takeDamage() {
            Detector.collisions(this.bodyParts.map(x => [this.opponent.weapon, x]).concat(this.bodyParts.map(x => [x, this.opponent.weapon])), engine).forEach(x => {
                const body = x.bodyA === this.opponent.weapon ? x.bodyB : x.bodyA;
                body.health -= this.opponent.weapon.angularSpeed * 5;
                healthLost += this.opponent.weapon.angularSpeed * 5;
                if (body.health < 0) {
                    deadBodyParts.push(body);
                    switch (body) {
                        case head:
                            if (!puppet) {
                                victor = this.opponent;
                                displayVictor();
                                socket.emit("playerDeath", { roomName });
                            }
                            if (!puppet) {
                                World.remove(engine.world, [neck]);
                            }
                            deadBodyParts.push(torso);
                        case torso:
                            if (!puppet) {
                                victor = this.opponent;
                                displayVictor();
                                socket.emit("playerDeath", { roomName });
                            }
                            deadBodyParts.push(head);
                            deadBodyParts.push(upperArm1);
                            deadBodyParts.push(upperArm2);
                            deadBodyParts.push(upperLeg1);
                            deadBodyParts.push(upperLeg2);
                            deadBodyParts.push(lowerArm1);
                            deadBodyParts.push(lowerArm2);
                            deadBodyParts.push(lowerLeg1);
                            deadBodyParts.push(lowerLeg2);
                            deadBodyParts.push(weaponBox);
                            if (!puppet) {
                                World.remove(engine.world, [neck, shoulder1, shoulder2, elbow1, elbow2, hipJoint1, hipJoint2, knee1, knee2, weaponAttachment]);
                            }
                            break;
                        case upperArm1:
                            deadBodyParts.push(lowerArm1);
                            deadBodyParts.push(weaponBox);
                            if (!puppet) {
                                World.remove(engine.world, [shoulder1, elbow1]);
                            }
                            break;
                        case upperArm2:
                            deadBodyParts.push(lowerArm2);
                            if (!puppet) {
                                World.remove(engine.world, [shoulder2, elbow2]);
                            }
                            break;
                        case lowerArm1:
                            deadBodyParts.push(weaponBox);
                            if (!puppet) {
                                World.remove(engine.world, [elbow1]);
                            }
                            break;
                        case lowerArm2:
                            if (!puppet) {
                                World.remove(engine.world, [elbow2]);
                            }
                            break;
                        case upperLeg1:
                            deadBodyParts.push(lowerLeg1);
                            if (!puppet) {
                                World.remove(engine.world, [hipJoint1, knee1]);
                            }
                            break;
                        case upperLeg2:
                            deadBodyParts.push(lowerLeg2);
                            if (!puppet) {
                                World.remove(engine.world, [hipJoint2, knee2]);
                            }
                            break;
                        case lowerLeg1:
                            if (!puppet) {
                                World.remove(engine.world, [knee1]);
                            }
                            break;
                        case lowerLeg2:
                            if (!puppet) {
                                World.remove(engine.world, [knee2]);
                            }
                            break;
                    }
                }
            })
        },
        getVelocities() {
            return this.bodyParts.map(part => ({ x: part.velocity.x, y: part.velocity.y }));
        },
        getPositions() {
            return this.bodyParts.map(part => ({ x: part.position.x, y: part.position.y }));
        },
        getAngles() {
            return this.bodyParts.map(part => part.angle);
        },
        getAngleVels() {
            return this.bodyParts.map(part => part.angularVelocity);
        },
        setVelocities(data) {
            this.bodyParts.forEach((part, i) => {
                Body.setVelocity(part, data[i])
            });
        },
        setPositions(data) {
            this.bodyParts.forEach((part, i) => {
                Body.setPosition(part, data[i])
            });
        },
        setAngles(data) {
            this.bodyParts.forEach((part, i) => {
                Body.setAngle(part, data[i]);
            });
        },
        setAngleVels(data) {
            this.bodyParts.forEach((part, i) => {
                Body.setAngularVelocity(part, data[i]);
            });
        },
        setHealth(hp) {
            puppetHealth = hp;
        }
    }
}
document.getElementById("instructions").onclick = () => {
    document.getElementById("inModal").style.display = "block";
}