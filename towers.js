class Tower {
    constructor(column, row) {
        this.column = column;
        this.row = row;
        this.position = {
            x: (column + 0.5) * grid.sizeElems,
            y: (row + 0.5) * grid.sizeElems
        };
        this.range = 135;
        this.fireInterval = 650;
        this.cooldown = 0;
        this.damage = 18;
        this.level = 1;
    }

    get upgradeCost() {
        return 40 + (this.level - 1) * 30;
    }

    upgrade() {
        if (this.level >= 4 || playerGold < this.upgradeCost) return false;

        playerGold -= this.upgradeCost;
        this.level += 1;
        this.damage += 10;
        this.range += 15;
        this.fireInterval = Math.max(250, this.fireInterval - 90);
        return true;
    }

    update() {
        this.cooldown = Math.max(0, this.cooldown - deltaTime);
        if (this.cooldown > 0) return;

        const target = monsters.find((monster) =>
            monster.hp > 0 &&
            dist(this.position.x, this.position.y, monster.position.x, monster.position.y) <= this.range
        );

        if (!target) return;

        projectiles.push(new Projectile(this.position, target, this.damage));
        this.cooldown = this.fireInterval;
    }

    draw() {
        if (this === selectedTower) {
            noFill();
            stroke(245, 225, 166, 90);
            circle(this.position.x, this.position.y, this.range * 2);
        }

        noStroke();
        fill(38, 51, 42);
        circle(this.position.x, this.position.y, 27 + this.level * 2);
        fill(222, 184, 91);
        rectMode(CENTER);
        rect(this.position.x, this.position.y, 12 + this.level, 18 + this.level, 2);
        rectMode(CORNER);
        fill(245, 225, 166);
        circle(this.position.x, this.position.y - 3, 7);
    }
}

class Projectile {
    constructor(origin, target, damage) {
        this.position = { x: origin.x, y: origin.y };
        this.target = target;
        this.damage = damage;
        this.speed = 360;
        this.radius = 4;
    }

    update() {
        if (!monsters.includes(this.target) || this.target.hp <= 0) return true;

        const dx = this.target.position.x - this.position.x;
        const dy = this.target.position.y - this.position.y;
        const distance = Math.hypot(dx, dy);
        const step = (this.speed * deltaTime) / 1000;

        if (distance <= step + this.target.radius) {
            this.target.takeDamage(this.damage);
            return true;
        }

        this.position.x += (dx / distance) * step;
        this.position.y += (dy / distance) * step;
        return false;
    }

    draw() {
        noStroke();
        fill(255, 236, 139);
        circle(this.position.x, this.position.y, this.radius * 2);
    }
}