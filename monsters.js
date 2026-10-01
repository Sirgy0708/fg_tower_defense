class Monster {
    static templates = {
        scout: {
            hp: 30,
            speed: 66,
            radius: 9,
            reward: 10,
            color: [120, 190, 90]
        },
        runner: {
            hp: 20,
            speed: 108,
            radius: 7,
            reward: 12,
            color: [240, 170, 60]
        },
        brute: {
            hp: 75,
            speed: 42,
            radius: 13,
            reward: 25,
            color: [180, 80, 80]
        },
        boss: {
            hp: 180,
            speed: 27,
            radius: 18,
            reward: 60,
            color: [170, 110, 220]
        }
    };

    constructor(type, path, healthScale = 1, speedScale = 1) {
        const stats = Monster.templates[type] ?? Monster.templates.scout;

        this.type = type;
        this.path = path;
        this.pathIndex = 0;
        this.hp = Math.round(stats.hp * healthScale);
        this.maxHp = this.hp;
        this.speed = stats.speed * speedScale;
        this.radius = stats.radius;
        this.reward = stats.reward;
        this.color = stats.color;

        const start = this.path[0];
        this.position = {
            x: (start.x + 0.5) * grid.sizeElems,
            y: (start.y + 0.5) * grid.sizeElems
        };

        this.hasReachedGoal = false;
    }

    update() {
        if (this.hasReachedGoal) return;

        let remaining = (this.speed * deltaTime) / 1000;

        while (remaining > 0 && this.pathIndex < this.path.length - 1) {
            const nextPoint = this.path[this.pathIndex + 1];
            const targetX = (nextPoint.x + 0.5) * grid.sizeElems;
            const targetY = (nextPoint.y + 0.5) * grid.sizeElems;
            const dx = targetX - this.position.x;
            const dy = targetY - this.position.y;
            const distance = Math.hypot(dx, dy);

            if (distance <= remaining) {
                this.position.x = targetX;
                this.position.y = targetY;
                remaining -= distance;
                this.pathIndex += 1;
            } else {
                this.position.x += (dx / distance) * remaining;
                this.position.y += (dy / distance) * remaining;
                remaining = 0;
            }
        }

        this.hasReachedGoal = this.pathIndex >= this.path.length - 1;
    }

    draw() {
        noStroke();
        fill(this.color[0], this.color[1], this.color[2]);
        circle(this.position.x, this.position.y, this.radius * 2);

        const healthBarWidth = this.radius * 2.2;
        const healthRatio = Math.max(0, this.hp / this.maxHp);

        fill(30, 30, 30, 180);
        rect(
            this.position.x - healthBarWidth / 2,
            this.position.y - this.radius - 12,
            healthBarWidth,
            5
        );

        fill(110, 220, 120);
        rect(
            this.position.x - healthBarWidth / 2,
            this.position.y - this.radius - 12,
            healthBarWidth * healthRatio,
            5
        );
    }

    takeDamage(amount) {
        this.hp = Math.max(0, this.hp - amount);
    }
}
