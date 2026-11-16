let playerX = 400;
let playerY = 540;
let playerSize = 30; // Radius of player ship
let speed = 7;

let obstacles = [];
let score = 0;
let gameState = "START"; // "START", "PLAYING", "GAMEOVER"

function setup() {
  let canvas = createCanvas(800, 600);
  
  // Auto-focus canvas so keyboard controls work instantly
  canvas.elt.tabIndex = 0;
  canvas.elt.focus();
}

function resetGame() {
  playerX = width / 2;
  obstacles = [];
  score = 0;
  gameState = "PLAYING";
}

function draw() {
  background(10, 10, 20); // Deep space

  if (gameState === "START") {
    // --- START SCREEN ---
    drawText("ASTEROID DODGER", width / 2, height / 2 - 40, 42, "#00F3FF");
    drawText("Navigate with Stick, D-Pad, or WASD", width / 2, height / 2 + 10, 18, "#AAAAAA");
    drawText("Press (A) or START to Play", width / 2, height / 2 + 50, 22, "#FFFFFF");

    if (input.aPressed() || input.startPressed()) {
      resetGame();
    }

  } else if (gameState === "PLAYING") {
    // --- 1. MOVE PLAYER ---
    if (input.left())  playerX -= speed;
    if (input.right()) playerX += speed;

    // Analog stick precision movement
    let stick = input.leftStick();
    if (Math.abs(stick.x) > 0) {
      playerX += stick.x * speed;
    }

    // Keep ship within canvas boundaries
    playerX = constrain(playerX, playerSize, width - playerSize);

    // --- 2. SPAWN ASTEROIDS ---
    if (frameCount % 20 === 0) {
      obstacles.push({
        x: random(20, width - 20),
        y: -30,
        radius: random(15, 30),
        speed: random(4, 8)
      });
    }

    // --- 3. UPDATE & DRAW OBSTACLES ---
    for (let i = obstacles.length - 1; i >= 0; i--) {
      let ast = obstacles[i];
      ast.y += ast.speed;

      // Draw asteroid
      fill(180, 70, 70);
      noStroke();
      ellipse(ast.x, ast.y, ast.radius * 2);

      // Collision Check using helper: hitsCircle(x1, y1, r1, x2, y2, r2)
      if (hitsCircle(playerX, playerY, playerSize / 2, ast.x, ast.y, ast.radius)) {
        gameState = "GAMEOVER";
      }

      // Cleanup off-screen asteroids & increase score
      if (ast.y > height + ast.radius) {
        obstacles.splice(i, 1);
        score += 1;
      }
    }

    // --- 4. DRAW PLAYER SHIP ---
    fill(0, 255, 100);
    noStroke();
    triangle(
      playerX, playerY - 20,       // Top nose
      playerX - 18, playerY + 15,  // Bottom left wing
      playerX + 18, playerY + 15   // Bottom right wing
    );

    // --- 5. DRAW HUD ---
    drawText(`Score: ${score}`, 80, 30, 20, "#FFFFFF");

  } else if (gameState === "GAMEOVER") {
    // --- GAME OVER SCREEN ---
    drawText("ASTEROID COLLISION!", width / 2, height / 2 - 40, 44, "#E74C3C");
    drawText(`Final Score: ${score}`, width / 2, height / 2 + 15, 24, "#FFFFFF");
    drawText("Press (A) or START to Retry", width / 2, height / 2 + 60, 20, "#AAAAAA");

    if (input.aPressed() || input.startPressed()) {
      resetGame();
    }
  }
}