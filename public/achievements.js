function displayAchievement({ title, desc, opacity }) {
    fill(150, 150, 150, opacity * 255);
    rect(400, 0, 201, 100);
    fill(255, 255, 255, opacity * 255);
    textAlign(CENTER);
    textSize(30);
    text(title, 500, 30);
    textSize(13);
    text(desc, 500, 50);
}
const pieceOfCake = { title: "Piece of Cake", desc: "Beat easy difficulty. \n Easiest achievement of all time." };
const fightScene = { title: "Fight Scene", desc: "Beat medium difficulty. \n A decent challenge." };
const axeTheHead = { title: "Axe the Head", desc: "Beat hard difficulty. \n Only true legends make it this far." };
const undying = { title: "Undying", desc: "Beat insane difficulty. \n How long have you been playing?" };
const achievementList = [pieceOfCake, fightScene, axeTheHead, undying];
const achievements = {
    currAchievements: [],
    add({ title, desc }) {
        if (!localProxy.achievements.includes(title)) {
            localProxy.achievements = localProxy.achievements.concat(title);
            this.currAchievements.push({ title, desc, step: 0 });
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
            displayAchievement({ title: a.title, desc: a.desc, opacity });
            a.step++;
            if (a.step > 240) {
                this.currAchievements.splice(i, 1);
            }
        })
    }
}