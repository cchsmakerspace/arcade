// =================================================================
// MAKERSPACE ARCADE ENGINE & INPUT HELPER FOR P5.JS
// Configured for 8BitDo Ultimate 2C Wired Controller
// =================================================================

const _prevState = {};

const input = {
  // --- D-PAD ---
  up()    { return keyIsDown(UP_ARROW)    || keyIsDown(87) || this._btn(12); }, // W / Up
  down()  { return keyIsDown(DOWN_ARROW)  || keyIsDown(83) || this._btn(13); }, // S / Down
  left()  { return keyIsDown(LEFT_ARROW)  || keyIsDown(65) || this._btn(14); }, // A / Left
  right() { return keyIsDown(RIGHT_ARROW) || keyIsDown(68) || this._btn(15); }, // D / Right

  // --- FACE BUTTONS (8BitDo Ultimate 2C Xbox Layout) ---
  a() { return keyIsDown(32) || keyIsDown(75) || this._btn(0); }, // Bottom (A) -> Space / K
  b() { return keyIsDown(76) || this._btn(1); },                  // Right  (B) -> L
  x() { return keyIsDown(74) || this._btn(2); },                  // Left   (X) -> J
  y() { return keyIsDown(73) || this._btn(3); },                  // Top    (Y) -> I

  // --- SHOULDERS, TRIGGERS & EXTRA BUMPERS (L4 / R4) ---
  lb() { return keyIsDown(81)      || this._btn(4); },  // Left Bumper   -> Q
  rb() { return keyIsDown(69)      || this._btn(5); },  // Right Bumper  -> E
  lt() { return keyIsDown(SHIFT)   || this._btn(6); },  // Left Trigger  -> Shift
  rt() { return keyIsDown(CONTROL) || this._btn(7); },  // Right Trigger -> Ctrl
  l4() { return keyIsDown(90)      || this._btn(16); }, // Extra L4      -> Z
  r4() { return keyIsDown(67)      || this._btn(17); }, // Extra R4      -> C

  // --- ANALOG STICK CLICKS ---
  l3() { return keyIsDown(70) || this._btn(10); }, // Left Stick Click  -> F
  r3() { return keyIsDown(82) || this._btn(11); }, // Right Stick Click -> R

  // --- SYSTEM / MENU ---
  select() { return keyIsDown(ESCAPE) || keyIsDown(BACKSPACE) || this._btn(8); }, // View (-) -> Esc
  start()  { return keyIsDown(ENTER)  || keyIsDown(80)        || this._btn(9); }, // Menu (+) -> Enter / P

  // --- SINGLE-PRESS TAP DETECTORS ---
  aPressed()      { return this._wasTapped('a', this.a()); },
  bPressed()      { return this._wasTapped('b', this.b()); },
  xPressed()      { return this._wasTapped('x', this.x()); },
  yPressed()      { return this._wasTapped('y', this.y()); },
  l4Pressed()     { return this._wasTapped('l4', this.l4()); },
  r4Pressed()     { return this._wasTapped('r4', this.r4()); },
  startPressed()  { return this._wasTapped('start', this.start()); },
  selectPressed() { return this._wasTapped('select', this.select()); },

  // --- ANALOG THUMBSTICKS (-1.0 to 1.0) ---
  leftStick()  { return { x: this._axis(0), y: this._axis(1) }; },
  rightStick() { return { x: this._axis(2), y: this._axis(3) }; },

  // --- INTERNAL HELPERS ---
  _wasTapped(key, isDown) {
    let pressed = isDown && !_prevState[key];
    _prevState[key] = isDown;
    return pressed;
  },
  _btn(btnIndex) {
    let gps = navigator.getGamepads ? navigator.getGamepads() : [];
    for (let gp of gps) {
      if (gp && gp.buttons[btnIndex]?.pressed) return true;
    }
    return false;
  },
  _axis(axisIndex) {
    let gps = navigator.getGamepads ? navigator.getGamepads() : [];
    for (let gp of gps) {
      if (gp && gp.axes[axisIndex] !== undefined) {
        let val = gp.axes[axisIndex];
        return Math.abs(val) > 0.15 ? val : 0;
      }
    }
    return 0;
  }
};

// =================================================================
// GAME DEVELOPMENT HELPER FUNCTIONS
// =================================================================

function hitsRect(x1, y1, w1, h1, x2, y2, w2, h2) {
  return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
}

function hitsCircle(x1, y1, r1, x2, y2, r2) {
  return dist(x1, y1, x2, y2) < (r1 + r2);
}

function drawText(txt, x, y, size = 24, col = "#FFFFFF") {
  push();
  textAlign(CENTER, CENTER);
  textSize(size);
  stroke(0);
  strokeWeight(4);
  fill(col);
  text(txt, x, y);
  pop();
}