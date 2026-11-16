function setup() {
  createCanvas(800, 500);
}

function draw() {
  background(30);

  // --- HEADER & INSTRUCTIONS ---
  fill(255);
  noStroke();
  textAlign(CENTER);
  textSize(22);
  text("Joypad & Keyboard Input Diagnostic Test", width / 2, 40);

  textSize(13);
  fill(160);
  text(
    "Press buttons on your Controller or Keyboard (WASD / IJKL / Space / Shift / Ctrl / Enter / Esc)\n*Note: Click inside this window and press a controller button to connect it.",
    width / 2,
    65
  );

  // --- DRAW CONTROLLER BODY ---
  stroke(80);
  strokeWeight(2);
  fill(50);
  rect(150, 100, 500, 320, 40);

  // --- 1. D-PAD & DIRECTIONALS ---
  drawIndicator(230, 210, 24, 24, input.up(), "▲\n(W/Up)");
  drawIndicator(230, 260, 24, 24, input.down(), "▼\n(S/Dn)");
  drawIndicator(205, 235, 24, 24, input.left(), "◄ (A)");
  drawIndicator(255, 235, 24, 24, input.right(), "► (D)");

  // --- 2. ABXY FACE BUTTONS ---
  drawIndicator(590, 260, 32, 32, input.a(), "A [0]\nSpace/K", true);
  drawIndicator(630, 225, 32, 32, input.b(), "B [1]\nL", true);
  drawIndicator(550, 225, 32, 32, input.x(), "X [2]\nJ", true);
  drawIndicator(590, 190, 32, 32, input.y(), "Y [3]\nI", true);

  // --- 3. CENTER / SYSTEM BUTTONS ---
  drawIndicator(350, 220, 26, 18, input.select(), "(-)\n[8]\nEsc");
  drawIndicator(450, 220, 26, 18, input.start(), "(+)\n[9]\nEnter");

  // --- 4. SHOULDERS & TRIGGERS ---
  drawIndicator(220, 120, 80, 20, input.lb(), "LB / L1 [4] (Q)");
  drawIndicator(580, 120, 80, 20, input.rb(), "RB / R1 [5] (E)");
  drawIndicator(220, 95, 80, 20, input.lt(), "LT / L2 [6] (Shift)");
  drawIndicator(580, 95, 80, 20, input.rt(), "RT / R2 [7] (Ctrl)");

  // --- 5. ANALOG THUMBSTICKS (Includes L3 / R3 Clicks) ---
  let lStick = input.leftStick();
  let rStick = input.rightStick();

  drawStick(320, 310, lStick.x, lStick.y, input.l3(), "Left Stick (L3 [10] / F)");
  drawStick(480, 310, rStick.x, rStick.y, input.r3(), "Right Stick (R3 [11] / R)");
}

// --- HELPER FUNCTION: DRAW BUTTON INDICATOR ---
function drawIndicator(x, y, w, h, isPressed, label, isCircle = false) {
  push();
  rectMode(CENTER);
  ellipseMode(CENTER);

  if (isPressed) {
    fill(46, 204, 113); // Bright Green when active
    stroke(255);
    strokeWeight(2);
  } else {
    fill(70);
    stroke(100);
    strokeWeight(1);
  }

  if (isCircle) {
    ellipse(x, y, w, h);
  } else {
    rect(x, y, w, h, 6);
  }

  fill(isPressed ? 0 : 220);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(8);
  text(label, x, y);
  pop();
}

// --- HELPER FUNCTION: DRAW ANALOG STICK WITH CLICK INDICATOR ---
function drawStick(centerX, centerY, axisX, axisY, isClicked, label) {
  push();
  ellipseMode(CENTER);

  // Outer ring
  fill(40);
  stroke(100);
  ellipse(centerX, centerY, 60, 60);

  // Inner stick position
  let posX = centerX + axisX * 22;
  let posY = centerY + axisY * 22;

  let isDeflected = Math.abs(axisX) > 0 || Math.abs(axisY) > 0;

  // Change color: Green if clicked, teal if deflected, dark gray if neutral
  if (isClicked) {
    fill(46, 204, 113); // Bright green when L3/R3 pressed
    stroke(255);
    strokeWeight(2);
  } else if (isDeflected) {
    fill(52, 152, 219); // Blue when moved
    noStroke();
  } else {
    fill(100);
    noStroke();
  }

  ellipse(posX, posY, 28, 28);

  // Text inside the stick head
  fill(isClicked ? 0 : 255);
  textAlign(CENTER, CENTER);
  textSize(8);
  text(isClicked ? "CLICK!" : "", posX, posY);

  // Text label & numerical readouts below stick
  fill(180);
  textAlign(CENTER);
  textSize(10);
  text(label, centerX, centerY + 45);
  textSize(9);
  text(`X:${axisX.toFixed(2)} Y:${axisY.toFixed(2)}`, centerX, centerY + 58);
  pop();
}