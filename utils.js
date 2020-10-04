function genColor() {
    let color = [0, 0, 0];
    let cpool = random(255, 255 * 3);
    let idxs = [0, 1, 2].sort(() => Math.random() - 0.5);
    idxs.forEach(i => {
        let c = random(0.3, 0.7);
        color[i] = min(cpool * c, 255);
        cpool *= (1 - c);
    });
    return color;
}