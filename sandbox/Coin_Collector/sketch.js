let playerX = 300, playerY = 300;
let coinX, coinY;
let score = 0;
let speed = 5;

function setup() {
  createCanvas(800, 600);
  spawnCoin();
}

function spawnCoin()
{
  coinX = random(50, width - 50);
  coinY = random(50, height - 50);
}

function draw() {
  background(255, 105, 180); // Retro dark blue

  // Read Gamepad Input
  let gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
  let pad = gamepads[0]; // First controller

  if (pad) {
    // Joystick / D-Pad Movement (Axis 0 = X, Axis 1 = Y)
    if (pad.axes[0] < -0.3 || pad.buttons[14]?.pressed) playerX += speed; // Left
    if (pad.axes[0] > 0.3  || pad.buttons[15]?.pressed) playerX -= speed; // Right
    if (pad.axes[1] < -0.3 || pad.buttons[12]?.pressed) playerY += speed; // Up
    if (pad.axes[1] > 0.3  || pad.buttons[13]?.pressed) playerY -= speed; // Down
  }

  // Fallback Keyboard Controls (Arrow Keys or WASD)
  if (keyIsDown(LEFT_ARROW)  || keyIsDown(65)) playerX += speed;
  if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) playerX -= speed;
  if (keyIsDown(UP_ARROW)    || keyIsDown(87)) playerY += speed;
  if (keyIsDown(DOWN_ARROW)  || keyIsDown(83)) playerY -= speed;

  // Keep player inside screen boundaries
  playerX = constrain(playerX, 20, width - 20);
  playerY = constrain(playerY, 20, height - 20);

  // Check collision with coin
  let d = dist(playerX, playerY, coinX, coinY);
  if (d < 30) {
    score += 10;
      spawnCoin();
  }

  // Draw Coin
  fill(250, 204, 21); // Yellow
  ellipse(coinX, coinY, 24, 24);

  // Draw Player Character
  fill(56, 189, 248); // Cyan
  ellipse(playerX, playerY, 40, 40);

  // HUD Display
  fill(255);
  textSize(24);
  textAlign(LEFT, TOP);
  text(`Score: ${score}`, 20, 20);
  
  textSize(14);
  fill(148, 163, 184);
  text("Use Joystick / D-Pad or Arrow Keys to Move", 20, 560);
}