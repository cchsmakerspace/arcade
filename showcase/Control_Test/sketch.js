let imgFront, imgTop;

function preload() {
  imgFront = loadImage("front.jpg");
  imgTop = loadImage("top.png");
}

function setup() {
  createCanvas(960, 620);
}

function draw() {
  background(15, 19, 28);

  // --- TOP HEADER ---
  fill(255);
  noStroke();
  textAlign(CENTER);
  textSize(20);
  textStyle(BOLD);
  text("8BitDo Ultimate 2C — Interactive Controller & Keyboard Map", width / 2, 28);
  textStyle(NORMAL);

  let padStatus = "No Controller Active — Press any button to wake";
  let statusCol = color(239, 68, 68);
  let gps = navigator.getGamepads ? navigator.getGamepads() : [];
  for (let gp of gps) {
    if (gp) {
      padStatus = `Connected: ${gp.id}`;
      statusCol = color(46, 204, 113);
      break;
    }
  }
  textSize(12);
  fill(statusCol);
  text(padStatus, width / 2, 48);

  // =================================================================
  // LEFT PANEL: FRONT FACE PHOTO OVERLAY (x: 20..520, y: 68..548)
  // =================================================================
  drawCard(20, 68, 500, 480, "FRONT VIEW");
  
  let fX = 45, fY = 100, fW = 450, fH = 420;
  image(imgFront, fX, fY, fW, fH);

  // --- Center System Buttons (Dialed in to match physical buttons) ---
  drawOverlayPin(fX + fW * 0.362, fY + fH * 0.352, 32, input.select(), "(-)\nEsc");
  drawOverlayPin(fX + fW * 0.638, fY + fH * 0.352, 32, input.start(),  "(+)\nEnter");
  drawOverlayPin(fX + fW * 0.500, fY + fH * 0.358, 38, input.home(),   "HOME\n[16] / H");

  // Hardware-Only Buttons (Square Profile & Star Mapping)
  drawHardwareNote(fX + fW * 0.433, fY + fH * 0.432, "■\nHW");
  drawHardwareNote(fX + fW * 0.567, fY + fH * 0.432, "★\nMap");

  // --- ABXY Face Buttons ---
  drawOverlayPin(fX + fW * 0.793, fY + fH * 0.362, 38, input.y(), "Y\n(I)");        // Top
  drawOverlayPin(fX + fW * 0.722, fY + fH * 0.448, 38, input.x(), "X\n(J)");        // Left
  drawOverlayPin(fX + fW * 0.866, fY + fH * 0.448, 38, input.b(), "B\n(L)");        // Right
  drawOverlayPin(fX + fW * 0.795, fY + fH * 0.532, 38, input.a(), "A\nSpace/K");    // Bottom

  // --- D-Pad ---
  drawOverlayPin(fX + fW * 0.352, fY + fH * 0.558, 28, input.up(),    "▲\nW");
  drawOverlayPin(fX + fW * 0.352, fY + fH * 0.688, 28, input.down(),  "▼\nS");
  drawOverlayPin(fX + fW * 0.285, fY + fH * 0.623, 28, input.left(),  "◄\nA");
  drawOverlayPin(fX + fW * 0.418, fY + fH * 0.623, 28, input.right(), "►\nD");

  // --- Analog Sticks (Live movement + L3/R3 click) ---
  let lStick = input.leftStick();
  drawStickOverlay(fX + fW * 0.192, fY + fH * 0.432, 64, lStick.x, lStick.y, input.l3(), "L3 (F)");

  let rStick = input.rightStick();
  drawStickOverlay(fX + fW * 0.635, fY + fH * 0.632, 64, rStick.x, rStick.y, input.r3(), "R3 (R)");

  // =================================================================
  // RIGHT PANEL: TOP EDGE PHOTO OVERLAY (ROTATED 180°) & LEGEND
  // =================================================================
  drawCard(540, 68, 400, 260, "TOP EDGE VIEW");

  let tX = 560, tY = 110, tW = 360, tH = 155;
  image(imgTop, tX, tY, tW, tH);

  // With top.png rotated 180°, Left is on Left and Right is on Right:
  // Triggers (LT/RT) sit along the upper edge; Bumpers (LB/RB) & L4/R4 sit below them.
  // Left Shoulder Cluster (Left side of rotated image)
  drawOverlayRect(tX + tW * 0.165, tY + tH * 0.32, 54, 40, input.lt(), "LT (Shift)");
  drawOverlayRect(tX + tW * 0.205, tY + tH * 0.57, 74, 34, input.lb(), "LB (Q)");
  drawOverlayRect(tX + tW * 0.275, tY + tH * 0.38, 34, 28, input.l4(), "L4\n(Z)");

  // Right Shoulder Cluster (Right side of rotated image)
  drawOverlayRect(tX + tW * 0.835, tY + tH * 0.32, 54, 40, input.rt(), "RT (Ctrl)");
  drawOverlayRect(tX + tW * 0.795, tY + tH * 0.57, 74, 34, input.rb(), "RB (E)");
  drawOverlayRect(tX + tW * 0.725, tY + tH * 0.38, 34, 28, input.r4(), "R4\n(C)");

  // --- LEGEND / NOTES CARD (Bottom Right) ---
  drawCard(540, 344, 400, 204, "ARCADE & HARDWARE NOTES");
  fill(210);
  noStroke();
  textAlign(LEFT, TOP);
  textSize(12);
  let notes = [
    "• Exit Game: Press (-) SELECT [8] or ESC.",
    "• Star (★) Button: Hardware-only macro mapper.",
    "   Hold L4/R4 + any button, then press ★ to bind.",
    "• Square (■) Button: Switches onboard profiles.",
    "   (Does not send a signal to the browser).",
    "• Keyboard Fallback: WASD = D-Pad, IJKL/Space = ABXY,",
    "   Q/E = Bumpers, Shift/Ctrl = Triggers, Z/C = L4/R4."
  ];
  for (let i = 0; i < notes.length; i++) {
    text(notes[i], 556, 376 + i * 22);
  }
}

// --- DRAWING HELPERS ---

function drawCard(x, y, w, h, title) {
  push();
  fill(24, 30, 44);
  stroke(55, 68, 95);
  strokeWeight(1.5);
  rect(x, y, w, h, 12);
  fill(0, 243, 255);
  noStroke();
  textAlign(LEFT, CENTER);
  textSize(11);
  textStyle(BOLD);
  text(title, x + 14, y + 16);
  pop();
}

function drawOverlayPin(x, y, size, isPressed, label) {
  push();
  if (isPressed) {
    fill(46, 204, 113, 235);
    stroke(255);
    strokeWeight(2.5);
  } else {
    fill(15, 20, 32, 195);
    stroke(0, 243, 255, 180);
    strokeWeight(1.5);
  }
  ellipse(x, y, size, size);

  fill(isPressed ? 0 : 255);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(8);
  textStyle(BOLD);
  text(label, x, y);
  pop();
}

function drawOverlayRect(x, y, w, h, isPressed, label) {
  push();
  rectMode(CENTER);
  if (isPressed) {
    fill(46, 204, 113, 235);
    stroke(255);
    strokeWeight(2.5);
  } else {
    fill(15, 20, 32, 195);
    stroke(0, 243, 255, 180);
    strokeWeight(1.5);
  }
  rect(x, y, w, h, 6);

  fill(isPressed ? 0 : 255);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(8.5);
  textStyle(BOLD);
  text(label, x, y);
  pop();
}

function drawHardwareNote(x, y, label) {
  push();
  fill(30, 30, 40, 175);
  stroke(140, 140, 160, 150);
  strokeWeight(1);
  ellipse(x, y, 26, 26);
  fill(180);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(7.5);
  text(label, x, y);
  pop();
}

function drawStickOverlay(cx, cy, diameter, ax, ay, isClicked, label) {
  push();
  noFill();
  stroke(0, 243, 255, 160);
  strokeWeight(1.5);
  ellipse(cx, cy, diameter, diameter);

  let px = cx + ax * 18;
  let py = cy + ay * 18;
  let moved = Math.abs(ax) > 0 || Math.abs(ay) > 0;

  if (isClicked) {
    fill(46, 204, 113, 235);
    stroke(255);
    strokeWeight(2);
  } else if (moved) {
    fill(0, 243, 255, 220);
    noStroke();
  } else {
    fill(15, 20, 32, 195);
    stroke(255, 150);
    strokeWeight(1);
  }
  ellipse(px, py, 34, 34);

  fill(isClicked || moved ? 0 : 255);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(8);
  textStyle(BOLD);
  text(isClicked ? "CLICK!" : label, px, py);
  pop();
}