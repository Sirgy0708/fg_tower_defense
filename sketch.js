let canvasSize = 500;
let numGridElems = 10;

let grid = {
    numElems: numGridElems,
    sizeElems: canvasSize / numGridElems,
    data: [
        [],
        [],
        [],
        [1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 1, 0, 0, 1, 1, 1, 1],
        [0, 0, 0, 1, 0, 0, 1, 0, 0, 0],
        [0, 0, 0, 1, 0, 0, 1, 0, 0, 0],
        [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
        [],
        []
    ]
};

const path = [
    { x: 0, y: 4 },
    { x: 1, y: 4 },
    { x: 1, y: 2 },
    { x: 4, y: 2 },
    { x: 4, y: 6 },
    { x: 7, y: 6 },
    { x: 7, y: 1 },
    { x: 9, y: 1 },
    { x: 9, y: 8 }
];

let monsters = [];
let towers = [];
let projectiles = [];
let selectedTower = null;
let playerHealth = 10;
let score = 0;
let playerGold = 100;

const towerCost = 50;
const pathTiles = new Set();

for (let segment = 0; segment < path.length - 1; segment++) {
    const start = path[segment];
    const end = path[segment + 1];
    const steps = Math.max(Math.abs(end.x - start.x), Math.abs(end.y - start.y));

    for (let step = 0; step <= steps; step++) {
        const x = start.x + Math.sign(end.x - start.x) * step;
        const y = start.y + Math.sign(end.y - start.y) * step;
        pathTiles.add(`${x},${y}`);
    }
}

let currentWave = 0;
let waveActive = false;
let waveSpawnIndex = 0;
let waveSpawnCount = 0;
let waveSpawnCooldown = 0;

function setup() {
    createCanvas(canvasSize, canvasSize);
    frameRate(60);
}

function draw() {
    background(95, 135, 49);

    drawGrid();
    updateWave();
    updateMonsters();
    updateTowers();
    updateProjectiles();
    drawTowers();
    drawProjectiles();
    drawMonsters();
    drawPlacementPreview();
    drawHud();
}

function drawGrid() {
    noStroke();
    for (let i = 0; i < grid.numElems; i++) {
        for (let j = 0; j < grid.numElems; j++) {
            fill(pathTiles.has(`${j},${i}`) ? [176, 136, 93] : [95, 135, 49]);
            rect(j * grid.sizeElems, i * grid.sizeElems, grid.sizeElems);
        }
    }

    stroke(38, 62, 30, 110);
    strokeWeight(1);
    for (let i = 0; i <= grid.numElems; i++) {
        line(0, i * grid.sizeElems, canvasSize, i * grid.sizeElems);
        line(i * grid.sizeElems, 0, i * grid.sizeElems, canvasSize);
    }
    noStroke();
}

function updateWave() {
    if (!waveActive) return;

    waveSpawnCooldown -= deltaTime;
    if (waveSpawnIndex < waveSpawnCount && waveSpawnCooldown <= 0) {
        const type = getWaveMonsterType(waveSpawnIndex);
        const healthScale = 1 + (currentWave - 1) * 0.2;
        const speedScale = 1 + (currentWave - 1) * 0.035;
        monsters.push(new Monster(type, path, healthScale, speedScale));
        waveSpawnIndex += 1;
        waveSpawnCooldown = Math.max(300, 900 - currentWave * 35);
    }

    if (waveSpawnIndex >= waveSpawnCount && monsters.length === 0) {
        waveActive = false;
    }
}

function getWaveMonsterType(index) {
    if (currentWave >= 3 && index === waveSpawnCount - 1) return "boss";
    if (currentWave >= 2 && (index + currentWave) % 5 === 0) return "brute";
    if ((index + currentWave) % 3 === 0) return "runner";
    return "scout";
}

function startWave() {
    if (waveActive || monsters.length > 0 || playerHealth <= 0) return;

    currentWave += 1;
    waveActive = true;
    waveSpawnIndex = 0;
    waveSpawnCount = 5 + (currentWave - 1) * 2;
    waveSpawnCooldown = 0;
}

function updateMonsters() {
    for (let i = monsters.length - 1; i >= 0; i--) {
        const monster = monsters[i];

        monster.update();

        if (monster.hp <= 0) {
            score += monster.reward;
            playerGold += monster.reward;
            monsters.splice(i, 1);
            continue;
        }

        if (monster.hasReachedGoal) {
            playerHealth -= 1;
            monsters.splice(i, 1);
        }
    }
}

function updateTowers() {
    for (const tower of towers) {
        tower.update();
    }
}

function updateProjectiles() {
    for (let i = projectiles.length - 1; i >= 0; i--) {
        if (projectiles[i].update()) {
            projectiles.splice(i, 1);
        }
    }
}

function drawTowers() {
    for (const tower of towers) {
        tower.draw();
    }
}

function drawProjectiles() {
    for (const projectile of projectiles) {
        projectile.draw();
    }
}

function drawPlacementPreview() {
    const column = Math.floor(mouseX / grid.sizeElems);
    const row = Math.floor(mouseY / grid.sizeElems);
    if (column < 0 || column >= grid.numElems || row < 0 || row >= grid.numElems) return;

    const centerX = (column + 0.5) * grid.sizeElems;
    const centerY = (row + 0.5) * grid.sizeElems;
    const valid = !pathTiles.has(`${column},${row}`) &&
        !towers.some((tower) => tower.column === column && tower.row === row) &&
        playerGold >= towerCost;

    noFill();
    stroke(valid ? [235, 242, 193, 130] : [220, 80, 70, 150]);
    circle(centerX, centerY, 28);
    noStroke();
}

function drawMonsters() {
    for (const monster of monsters) {
        monster.draw();
    }
}

function drawHud() {
    fill(30, 30, 30, 180);
    rect(10, 10, 220, selectedTower ? 100 : 68, 8);

    fill(255);
    textSize(14);
    text(`Health: ${playerHealth}   Gold: ${playerGold}`, 20, 32);
    text(`Score: ${score}   Tower: ${towerCost}`, 20, 55);

    if (selectedTower) {
        const canUpgrade = selectedTower.level < 4 && playerGold >= selectedTower.upgradeCost;
        fill(canUpgrade ? [190, 145, 55] : [95, 95, 85]);
        rect(20, 66, 195, 32, 5);
        fill(255);
        textSize(12);
        const upgradeLabel = selectedTower.level >= 4
            ? `Tower Lv.${selectedTower.level} MAX`
            : `Upgrade Lv.${selectedTower.level} > ${selectedTower.level + 1}  ($${selectedTower.upgradeCost})`;
        text(upgradeLabel, 28, 86);
    }

    fill(waveActive || playerHealth <= 0 ? [90, 90, 80] : [70, 118, 56]);
    rect(canvasSize - 150, 10, 140, 42, 6);
    fill(255);
    textSize(13);
    const waveLabel = playerHealth <= 0
        ? "GAME OVER"
        : waveActive
            ? `WAVE ${currentWave}: ${waveSpawnCount - waveSpawnIndex + monsters.length} LEFT`
            : `START WAVE ${currentWave + 1}`;
    text(waveLabel, canvasSize - 140, 36);
}

function mousePressed() {
    if (mouseX >= canvasSize - 150 && mouseX <= canvasSize - 10 && mouseY >= 10 && mouseY <= 52) {
        startWave();
        return;
    }

    if (selectedTower && mouseX >= 20 && mouseX <= 215 && mouseY >= 66 && mouseY <= 98) {
        selectedTower.upgrade();
        return;
    }

    const column = Math.floor(mouseX / grid.sizeElems);
    const row = Math.floor(mouseY / grid.sizeElems);
    if (column < 0 || column >= grid.numElems || row < 0 || row >= grid.numElems) return;

    const clickedTower = towers.find((tower) => tower.column === column && tower.row === row);
    if (clickedTower) {
        selectedTower = clickedTower;
        return;
    }

    selectedTower = null;
    const tileKey = `${column},${row}`;
    if (pathTiles.has(tileKey) || playerGold < towerCost) return;

    towers.push(new Tower(column, row));
    playerGold -= towerCost;
}
