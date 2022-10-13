title = "JUMPER";

description = `
[Tap]
 Jump / Double jump / Descent
`;

characters = [
    `
llllll
llgggl
llgggl
llllll
ll  ll
ll  ll
  `,
    `
llllll
llbbbl
llbbbl
llllll
ll  ll
ll  ll
  `,
    `
llllll
llbbbl
llbbbl
llllll
llccll
llccll
`,
    `
llllll
llbbbl
llbbbl
llllll
llccll
llccll
`
];

options = {
    viewSize: { x: 200, y: 100 },
    isPlayingBgm: true,
    isReplayEnabled: true,
    isDrawingScoreFront: true,
    theme: "shapeDark",
    seed: 3,
};

const floorHeight = 90;
const maxJumpCount = 2;

/**
 * @type {{
 * pos: Vector, vy: number, jumpCount: number, isOnFloor: boolean,
 * multiplier: number, shots: Vector[], nextShotTicks: number
 * }}
 */
let player;
/** @type {{ pos: Vector, vx: number, isFlying: boolean }[]} */
let enemies;
let nextEnemyTicks;
let nextWallTicks;
let floorX;
let animTicks;

function update() {
    if (!ticks) {
        player = {
            pos: vec(20, 50),
            vy: 0,
            jumpCount: 9,
            isOnFloor: false,
            multiplier: 1,
            shots: [],
            nextShotTicks: 0,
        };
        enemies = [];
        nextEnemyTicks = 0;
        nextWallTicks = rnd(300, 400);
        floorX = 0;
        animTicks = 0;
    }
    const df = sqrt(difficulty);
    animTicks += df;
    rect(floorX, 0, 210, 7);
    rect(floorX, floorHeight, 210, 9);
    if (!player.isOnFloor) {
        player.vy += (input.isPressed ? 0.1 : 0.3) * df;
        player.pos.y += player.vy;
        if (player.pos.y > floorHeight) {
            play("hit");
            player.pos.y = floorHeight;
            player.isOnFloor = true;
            player.jumpCount = 0;
            player.multiplier = 1;
        }
    }
    if (input.isJustPressed) {
        if (player.jumpCount === maxJumpCount) {
            player.vy += 9 * sqrt(df);
        } else if (player.jumpCount < maxJumpCount) {
            play("jump");
            player.vy = -2.8 * sqrt(df);
            player.isOnFloor = false;
        }
        player.jumpCount++;
    }
    color("black");
    char(
        addWithCharCode("a", floor(animTicks / 15) % 2),
        player.pos.x + 3,
        player.pos.y - 3
    );
    nextEnemyTicks--;
    nextWallTicks--;
    if (nextEnemyTicks < 0) {
        const vx = -rnd(1, 2) * df;
        enemies.push({ pos: vec(200, floorHeight), vx, isFlying: false });
        nextEnemyTicks = rnd(30, 60) / difficulty;
        addScore(1);


    }
    if (nextWallTicks < 0) {
        const vx = -rnd(1, 2) * df;
        const c = rndi(3, 6);
        times(c, (i) => {
            enemies.push({ pos: vec(200, floorHeight - i * 6), vx, isFlying: false });
        });
        nextWallTicks = rnd(100, 600) / difficulty;
        nextEnemyTicks += 9 / difficulty;
        addScore(1);
    }
    color("red");
    remove(enemies, (e) => {
        e.pos.x += e.vx;
        const c = char(
            addWithCharCode(e.isFlying ? "c" : "c", floor(animTicks / 20) % 2),
            e.pos.x + 3,
            e.pos.y - 3,
            { mirror: { x: -1 } }
        ).isColliding;
        if (c.rect.light_blue) {
            play("coin");
            addScore(player.multiplier, e.pos.x + player.multiplier * 2, e.pos.y);
            player.multiplier++;
            return true;
        } else if (c.char.a || c.char.b) {
            play("explosion");
            rewind();
        }
        return e.pos.x < -6;
    });
}