function setup() {
  createCanvas(860, 620);
}

function draw() {
  background(18, 22, 33);

  // --- HEADER & LIVE GAMEPAD STATUS ---
  fill(255);
  noStroke();
  textAlign(CENTER);
  textSize(22);
  textStyle(BOLD);
  text("8BitDo Ultimate 2C — Input & Keyboard Diagnostic", width / 2, 34);
  textStyle(NORMAL);

  // Check active gamepad name
  let padName = "No Gamepad Detected (Press any controller button to wake)";
  let padColor = color(239, 68, 68);
  let gps = navigator.getGamepads ? navigator.getGamepads() : [];
  for (let gp of gps) {
    if (gp) {
      padName = `Connected: ${gp.id}`;
      padColor = color(46, 204, 113);
      break;
    }
  }

  textSize(12);
  fill(padColor);
  text(padName, width / 2, 56);

  fill(148, 163, 184);
  text("8BitDo Symbols shown with [Gamepad Index] and (Keyboard Equivalent)", width / 2, 74);

  // =================================================================
  // PANEL 1: TOP VIEW (SHOULDERS, TRIGGERS & L4/R4 BUMPERS)
  // =================================================================
  drawSectionFrame(80, 92, 700, 128, "TOP VIEW — SHOULDERS & EXTRA BUMPERS (L4 / R4)");

  // Controller Top Silhouette
  fill(38, 44, 62);
  stroke(75, 85, 110);
  strokeWeight(2);
  rect(130, 122, 600, 82, 24);

  // Center USB-C & Status LEDs
  fill(25, 29, 42);
  stroke(90);
  rect(width / 2 - 22, 122, 44, 14, 4);
  noStroke();
  fill(140);
  textSize(9);
  text("USB-C", width / 2, 147);
  // 8BitDo Star & Profile buttons (Hardware-only)
  fill(70);
  ellipse(width / 2 - 18, 175, 14, 14);
  ellipse(width / 2 + 18, 175, 14, 14);
  fill(150);
  textSize(8);
  text("★", width / 2 - 18, 175);
  text("⊞", width / 2 + 18, 175);

  // Left Shoulder Cluster (LT back, LB front-outer, L4 front-inner)
  drawIndicator(215, 142, 115, 26, input.lt(), "LT [6]  (Shift)");
  drawIndicator(195, 178, 95, 28, input.lb(), "LB [4]  (Q)");
  drawIndicator(282, 178, 65, 28, input.l4(), "L4 [16] (Z)");

  // Right Shoulder Cluster (RT back, RB front-outer, R4 front-inner)
  drawIndicator(645, 142, 115, 26, input.rt(), "RT [7]  (Ctrl)");
  drawIndicator(665, 178, 95, 28, input.rb(), "RB [5]  (E)");
  drawIndicator(578, 178, 65, 28, input.r4(), "R4 [17] (C)");

  // =================================================================
  // PANEL 2: FRONT VIEW (ASYMMETRIC STICKS, D-PAD, +/- & ABXY)
  // =================================================================
  drawSectionFrame(80, 234, 700, 366, "FRONT VIEW — FACE CONTROLS & ANALOG STICKS");

  // Controller Main Body + Grips Silhouette
  push();
  fill(38, 44, 62);
  stroke(75, 85, 110);
  strokeWeight(2);
  // Left & Right Angled Grips
  rect(155, 360, 115, 210, 45);
  rect(590, 360, 115, 210, 45);
  // Main Center Chassis
  rect(165, 270, 530, 235, 55);
  pop();

  // --- UPPER LEFT: LEFT ANALOG STICK (Asymmetric Xbox Layout) ---
  let lStick = input.leftStick();
  drawStick(255, 355, lStick.x, lStick.y, input.l3(), "Left Stick\nL3 [10] (F)");

  // --- LOWER LEFT: D-PAD ---
  // D-Pad Cross Backing
  fill(28, 33, 48);
  noStroke();
  rectMode(CENTER);
  rect(330, 462, 34, 92, 6);
  rect(330, 462, 92, 34, 6);
  rectMode(CORNER);

  drawIndicator(330, 430, 30, 28, input.up(),    "▲\nW / ↑");
  drawIndicator(330, 494, 30, 28, input.down(),  "▼\nS / ↓");
  drawIndicator(298, 462, 28, 30, input.left(),  "◄\nA / ←");
  drawIndicator(362, 462, 28, 30, input.right(), "►\nD / →");

  // --- CENTER SYSTEM BUTTONS: (-) VIEW & (+) MENU ---
  drawIndicator(390, 348, 36, 26, input.select(), "(-)\n[8] Esc", true);
  drawIndicator(470, 348, 36, 26, input.start(),  "(+)\n[9] Enter", true);

  // Center 8BitDo Home Logo (Visual reference)
  fill(28, 33, 48);
  stroke(80);
  ellipse(430, 388, 30, 30);
  noStroke();
  fill(120);
  textSize(8);
  text("HOME", 430, 388);

  // --- LOWER RIGHT: RIGHT ANALOG STICK ---
  let rStick = input.rightStick();
  drawStick(530, 462, rStick.x, rStick.y, input.r3(), "Right Stick\nR3 [11] (R)");

  // --- UPPER RIGHT: ABXY FACE BUTTONS (8BitDo Xbox Layout) ---
  // Subtle ring around face buttons
  noFill();
  stroke(60, 70, 95);
  ellipse(605, 355, 128, 128);

  drawIndicator(605, 397, 38, 38, input.a(), "A [0]\nSpace/K", true, color(46, 204, 113));  // Bottom (Green accent)
  drawIndicator(647, 355, 38, 38, input.b(), "B [1]\n(L)",     true, color(231, 76, 60));   // Right  (Red accent)
  drawIndicator(563, 355, 38, 38, input.x(), "X [2]\n(J)",     true, color(52, 152, 219));  // Left   (Blue accent)
  drawIndicator(605, 313, 38, 38, input.y(), "Y [3]\n(I)",     true, color(241, 196, 15));  // Top    (Yellow accent)
}

// --- HELPER: DRAW PANEL CONTAINER ---
function drawSectionFrame(x, y, w, h, title) {
  push();
  fill(24, 29, 44);
  stroke(50, 60, 85);
  strokeWeight(1.5);
  rect(x, y, w, h, 12);

  fill(0, 243, 255);
  noStroke();
  textAlign(LEFT, CENTER);
  textSize(10);
  textStyle(BOLD);
  text(title, x + 14, y + 14);
  pop();
}

// --- HELPER: DRAW BUTTON INDICATOR ---
function drawIndicator(x, y, w, h, isPressed, label, isCircle = false, accentColor = null) {
  push();
  rectMode(CENTER);
  ellipseMode(CENTER);

  if (isPressed) {
    fill(46, 204, 113); // Bright Green when pressed
    stroke(255);
    strokeWeight(2.5);
  } else {
    fill(55, 64, 88);
    stroke(accentColor ? accentColor : color(110, 125, 155));
    strokeWeight(accentColor ? 2 : 1.2);
  }

  if (isCircle) {
    ellipse(x, y, w, h);
  } else {
    rect(x, y, w, h, 7);
  }

  fill(isPressed ? 0 : 240);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(8.5);
  textStyle(isPressed ? BOLD : NORMAL);
  text(label, x, y);
  pop();
}

// --- HELPER: DRAW ANALOG STICK WITH CLICK INDICATOR ---
function drawStick(centerX, centerY, axisX, axisY, isClicked, label) {
  push();
  ellipseMode(CENTER);

  // Outer housing ring
  fill(28, 33, 48);
  stroke(90, 105, 135);
  strokeWeight(1.5);
  ellipse(centerX, centerY, 68, 68);

  // Inner thumbstick cap position
  let posX = centerX + axisX * 22;
  let posY = centerY + axisY * 22;
  let isDeflected = Math.abs(axisX) > 0 || Math.abs(axisY) > 0;

  if (isClicked) {
    fill(46, 204, 113);
    stroke(255);
    strokeWeight(2);
  } else if (isDeflected) {
    fill(0, 243, 255);
    noStroke();
  } else {
    fill(85, 96, 125);
    stroke(120);
    strokeWeight(1);
  }

  ellipse(posX, posY, 32, 32);

  fill(isClicked || isDeflected ? 0 : 255);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(8);
  textStyle(BOLD);
  text(isClicked ? "CLICK!" : "", posX, posY);

  // Label & live X/Y coordinates below stick
  fill(210);
  textStyle(NORMAL);
  textAlign(CENTER);
  textSize(9.5);
  text(label, centerX, centerY + 46);
  fill(140);
  textSize(8.5);
  text(`X:${axisX.toFixed(2)}  Y:${axisY.toFixed(2)}`, centerX, centerY + 69);
  pop();
}