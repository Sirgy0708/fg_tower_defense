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
let playerHealth = 10;
let score = 0;

const waveTypes = ["scout", "runner", "scout", "brute", "runner", "scout", "boss"];
let spawnIndex = 0;
let spawnCooldown = 0;

function setup() {
    createCanvas(canvasSize, canvasSize);
    frameRate(60);
}

function draw() {
    background(95, 135, 49);

    drawGrid();
    drawPath();
    updateWave();
    updateMonsters();
    drawMonsters();
    drawHud();
}

function drawGrid() {
    for (let i = 0; i < grid.numElems; i++) {
        line(0, i * grid.sizeElems, width, i * grid.sizeElems);
        line(i * grid.sizeElems, 0, i * grid.sizeElems, canvasSize);
    }

    for (let i = 0; i < grid.numElems; i++) {
        if (grid.data[i].length > 0) {
            for (let j = 0; j < grid.numElems; j++) {
                if (grid.data[i][j] === 1) {
                    fill(176, 136, 93);
                    rect(j * grid.sizeElems, i * grid.sizeElems, grid.sizeElems);
                }
            }
        }
    }
}

function drawPath() {
    noFill();
    stroke(255, 255, 255, 170);
    strokeWeight(4);
    beginShape();
    for (let i = 0; i < path.length; i++) {
        const px = (path[i].x + 0.5) * grid.sizeElems;
        const py = (path[i].y + 0.5) * grid.sizeElems;
        vertex(px, py);
    }
    endShape();
    noStroke();
}

function updateWave() {
    spawnCooldown -= deltaTime;

    if (spawnIndex < waveTypes.length && spawnCooldown <= 0) {
        monsters.push(new Monster(waveTypes[spawnIndex], path));
        spawnIndex += 1;
        spawnCooldown = 900;
    }
}

function updateMonsters() {
    for (let i = monsters.length - 1; i >= 0; i--) {
        const monster = monsters[i];

        monster.update();

        if (monster.hp <= 0) {
            score += monster.reward;
            monsters.splice(i, 1);
            continue;
        }

        if (monster.hasReachedGoal) {
            playerHealth -= 1;
            monsters.splice(i, 1);
        }
    }
}

function drawMonsters() {
    for (const monster of monsters) {
        monster.draw();
    }
}

function drawHud() {
    fill(30, 30, 30, 180);
    rect(10, 10, 140, 52, 8);

    fill(255);
    textSize(14);
    text("Health: " + playerHealth, 20, 32);
    text("Score: " + score, 20, 50);
}

function mousePressed() {
    const hit = monsters.find((monster) => {
        const distance = dist(mouseX, mouseY, monster.position.x, monster.position.y);
        return distance < monster.radius + 8;
    });

    if (hit) {
        hit.takeDamage(20);
    }
}
