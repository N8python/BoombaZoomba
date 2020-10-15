function displayAchievement({ title, desc, opacity, index }) {
    fill(150, 150, 150, opacity * 255);
    rect(400 - (index % 3) * 200, 0 + floor(index / 3) * 100, 201, 100);
    fill(255, 255, 255, opacity * 255);
    textAlign(CENTER);
    textSize(25);
    text(title, 500 - (index % 3) * 200, 30 + floor(index / 3) * 100);
    textSize(13);
    text(desc, 500 - (index % 3) * 200, 50 + floor(index / 3) * 100);
}

function displayHatUnlock({ hat, opacity, index }) {
    fill(150, 150, 150, opacity * 255);
    rect(400 - (index % 3) * 200, 500 - floor(index / 3) * 100, 201, 100);
    fill(255, 255, 255, opacity * 255);
    textAlign(CENTER);
    textSize(25);
    text(hat + "\nUnlocked!", 500 - (index % 3) * 200, 550 - floor(index / 3) * 100);
}
const pieceOfCake = { title: "Piece of Cake", desc: "Beat easy difficulty. \n Easiest achievement of all time.", hatsUnlocked: ["cake"] };
const fightScene = { title: "Fight Scene", desc: "Beat medium difficulty. \n A decent challenge.", hatsUnlocked: ["cap"] };
const axeTheHead = { title: "Axe the Head", desc: "Beat hard difficulty. \n Only true legends make it this far.", hatsUnlocked: ["axe"] };
const undying = { title: "Undying", desc: "Beat insane difficulty. \n How long have you been playing?", hatsUnlocked: ["voidhat"] };
const headsUp = { title: "Heads Up", desc: "Hit someone’s decapitated head.", hatsUnlocked: ["head"] };
const strangerDanger = { title: "Stranger Danger", desc: "Win a multiplayer duel." };
const gg = { title: "GG", desc: "Win a game in thirty seconds \nor less." }
const ggNoob = { title: "GG Noob", desc: "Win a game in fifteen seconds \nor less." };
const lolGGEz = { title: "Lol GG Ez", desc: "Win a game in ten seconds \nor less." };
const gitGud = { title: "Git Gud", desc: "Lose a game after fighting \nten seconds or less." };
const lastStand = { title: "Last Stand", desc: "Lose a game after fighting \nfor a minute or more." };
const hatTrick = { title: "Hat Trick", desc: "Win three games in a row.", hatsUnlocked: ["ball"] };
const fiver = { title: "Fiver", desc: "Win five games in a row." };
const hamilton = { title: "Hamilton", desc: "Win ten games in a row.", hatsUnlocked: ["hamilton"] };
const benFranklin = { title: "Ben Franklin", desc: "Win a hundred games in a row.", hatsUnlocked: ["ben"] };
const technoblade = { title: "Technoblade", desc: "Win a thousand games in a row.", hatsUnlocked: ["techno"] };
const hacker = { title: "Hacker", desc: "Cheat to get this achievement.", hatsUnlocked: ["sunglasses"] };
const displayHats = {
    "sunglasses": "Sunglasses",
    "cake": "Cake Hat",
    "voidhat": "Void Hat",
    "axe": "Axe Hat",
    "cap": "Baseball Cap",
    "head": "Second Head",
    "ball": "Bowling Ball",
    "hamilton": "Hamilton Head",
    "ben": "Ben Franklin Head",
    "techno": "Technoblade Head"
}
const achievementList = [pieceOfCake, fightScene, axeTheHead, undying, headsUp, strangerDanger, gg, ggNoob, lolGGEz, gitGud, lastStand, hatTrick, fiver, hamilton, benFranklin, technoblade, hacker];
const achievements = {
    currAchievements: [],
    currHatsUnlocked: [],
    add({ title, desc, hatsUnlocked }) {
        if (hatsUnlocked) {
            localProxy.unlockedHats = localProxy.unlockedHats.concat(...hatsUnlocked);
        }
        if (!localProxy.achievements.includes(title)) {
            localProxy.achievements = localProxy.achievements.concat(title);
            this.currAchievements.push({ title, desc, step: 0 });
            if (hatsUnlocked) {
                this.currHatsUnlocked.push(...hatsUnlocked.map(x => ({ hat: displayHats[x], step: 0 })));
            }
        }
    },
    render() {
        this.currAchievements.forEach((a, i) => {
            let opacity;
            if (a.step < 60) {
                opacity = a.step / 60;
            } else if (a.step < 180) {
                opacity = 1;
            } else {
                opacity = (240 - a.step) / 60;
            }
            displayAchievement({ title: a.title, desc: a.desc, opacity, index: i });
            a.step++;
            if (a.step > 240) {
                this.currAchievements.splice(i, 1);
            }
        });
        this.currHatsUnlocked.forEach((h, i) => {
            let opacity;
            if (h.step < 60) {
                opacity = h.step / 60;
            } else if (h.step < 180) {
                opacity = 1;
            } else {
                opacity = (240 - h.step) / 60;
            }
            displayHatUnlock({ hat: h.hat, opacity, index: i });
            h.step++;
            if (h.step > 240) {
                this.currHatsUnlocked.splice(i, 1);
            }
        })
    }
}