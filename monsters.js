const MONSTER_TYPES = {
    scout: {
        name: "Scout",
        hp: 30,
        speed: 0.8,
        reward: 10,
        radius: 8,
        color: [120, 200, 255]
    },
    runner: {
        name: "Runner",
        hp: 20,
        speed: 1.25,
        reward: 12,
        radius: 7,
        color: [120, 250, 180]
    },
    brute: {
        name: "Brute",
        hp: 80,
        speed: 0.45,
        reward: 20,
        radius: 12,
        color: [255, 120, 120]
    },
    boss: {
        name: "Boss",
        hp: 180,
        speed: 0.35,
        reward: 40,
        radius: 18,
        color: [255, 200, 80]
    }
};

class Monster {
    constructor(type, path, spawnDelay = 0) {
        const config = MONSTER_TYPES[type] || MONSTER_TYPES.scout;

        this.type = type;
        this.name = config.name;
        this.maxHp = config.hp;
        this.hp = config.hp;
        this.speed = config.speed;
        this.radius = config.radius;
        this.color = config.color;
        this.reward = config.reward;
        this.path = path.map((point) => createVector(
            (point.x + 0.5) * grid.sizeElems,
            (point.y + 0.5) * grid.sizeElems
        ));
        this.segmentIndex = 0;
        this.position = this.path[0].copy();
        this.direction = createVector(0, 0);
        this.hasReachedGoal = false;
        this.spawnDelay = spawnDelay;
    }

    update() {
        if (this.hasReachedGoal) {
            return;
        }

        if (this.segmentIndex >= this.path.length - 1) {
            this.hasReachedGoal = true;
            return;
        }

        const currentTarget = this.path[this.segmentIndex + 1];
        const desired = p5.Vector.sub(currentTarget, this.position);
        const distanceToTarget = desired.mag();

        if (distanceToTarget < 0.5) {
            this.segmentIndex += 1;
            return;
        }

        const moveStep = Math.min(this.speed, distanceToTarget);
        desired.normalize();
        this.direction = desired.copy();
        this.position.add(desired.mult(moveStep));

        if (distanceToTarget <= this.speed) {
            this.segmentIndex += 1;
        }
    }

    draw() {
        if (this.hasReachedGoal) {
            return;
        }

        push();
        translate(this.position.x, this.position.y);

        fill(this.color);
        noStroke();
        ellipse(0, 0, this.radius * 2, this.radius * 2);

        stroke(0, 0, 0, 150);
        strokeWeight(1);
        noFill();
        rect(-this.radius, -this.radius - 12, this.radius * 2, 5);

        noStroke();
        fill(130, 220, 130);
        const healthWidth = map(this.hp, 0, this.maxHp, 0, this.radius * 2);
        rect(-this.radius, -this.radius - 12, healthWidth, 5);

        pop();
    }

    takeDamage(amount) {
        this.hp -= amount;
        if (this.hp <= 0) {
            this.hp = 0;
            this.hasReachedGoal = false;
        }
    }
}
