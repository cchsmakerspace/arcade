let playerX = 400;
let obstacles = [];
let score = 0;
let gameActive = true;
let playerSize = 30;
let speed = 7;

function setup() {
  let canvas = createCanvas(800, 600);
}

function draw() {
  background(10, 10, 20); // Deep space

  if (gameActive) {
    // --- 1. MOVE PLAYER (D-Pad, WASD, Arrow Keys & Left Analog Stick) ---
    if (input.left())  playerX -= speed;
    if (input.right()) playerX += speed;

    // Analog Stick precision movement
    let stick = input.leftStick();
    if (Math.abs(stick.x) > 0) {
      playerX += stick.x * speed;
    }

    playerX = constrain(playerX, playerSize / 2, width - playerSize / 2);

    // --- 2. SPAWN OBSTACLES ---
    if (frameCount % 20 === 0) {
      obstacles.push({
        x: random(0, width),
        y: -30,
        size: random(20, 50),
        speed: random(4, 9)
      });
    }

    // --- 3. UPDATE/DRAW OBSTACLES & DETECT COLLISIONS ---
    for (let i = obstacles.length - 1; i >= 0; i--) {
      obstacles[i].y += obstacles[i].speed;

      // Draw obstacle (reddish asteroid)
      fill(180, 70, 70);
      noStroke();
      ellipse(obstacles[i].x, obstacles[i].y, obstacles[i].size, obstacles[i].size);

      // Collision Check
      let d = dist(playerX, height - 50, obstacles[i].x, obstacles[i].y);
      if (d < playerSize / 2 + obstacles[i].size / 2) {
        gameActive = false;
      }

      // Cleanup obstacles off-screen
      if (obstacles[i].y > height + obstacles[i].size) {
        obstacles.splice(i, 1);
        score += 1;
      }
    }

    // --- 4. DRAW PLAYER SHIP ---
    fill(0, 255, 100); // Green ship
    triangle(
      playerX, height - 70,       // Top point
      playerX - 20, height - 30, // Bottom-left
      playerX + 20, height - 30  // Bottom-right
    );

    // --- 5. DRAW HUD ---
    fill(255);
    textSize(24);
    textAlign(LEFT, TOP);
    text(`Asteroids Dodged: ${score}`, 20, 20);

  } else {
    // --- GAME OVER SCREEN ---
    fill(255, 0, 0);
    textSize(60);
    textAlign(CENTER, CENTER);
    text("ASTEROID COLLISION!", width / 2, height / 2 - 40);

    fill(255);
    textSize(24);
    text(`Final Score: ${score}`, width / 2, height / 2 + 30);
    text("Press A / Space / Start to Retry", width / 2, height / 2 + 70);

    // Restart via A button, Spacebar, or Start (+) button
    if (input.a() || input.start()) {
      resetGame();
    }
  }
}

function resetGame() {
  playerX = 400;
  obstacles = [];
  score = 0;
  gameActive = true;
}