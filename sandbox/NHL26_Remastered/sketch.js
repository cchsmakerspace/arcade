// ============================================================================
// NHL 26 3D — ICE HOCKEY CHAMPIONSHIP (p5.js v2.4.0 — Pure sketch.js)
// Paste this entire file into sketch.js on editor.p5js.org/?version=2.4.0
// Controller Bindings:
//   Left Stick / D-Pad      : Skate & Aim
//   RT / R2                 : Pass
//   Right Stick (Flick Up)  : Wrist Shot / One-Timer (Pull Down -> Up: Slap Shot)
//   Right Stick (Left/Right): Toe-Drag Deke (also Y / LB / RB)
//   A / Cross               : Body Check / Hit
//   B / Circle              : Switch Defender
//   RB / R1 (Defending)     : Poke Check
//   LT / L2                 : Hustle
// Keyboard & Mouse Bindings (Unchanged):
//   WASD / Arrows: Skate | Space: Pass / Poke | E: Toe-Drag | J / Click: Shoot
// ============================================================================

const TEAMS = [
  { id: 'CGY', name: 'Calgary Flames',       city: 'CALGARY',     primary: [200, 16, 46],  secondary: [241, 190, 72], accent: [255, 255, 255], hex: '#C8102E', hex2: '#F1BE48' },
  { id: 'EDM', name: 'Edmonton Oilers',      city: 'EDMONTON',    primary: [4, 30, 66],    secondary: [255, 76, 0],   accent: [255, 255, 255], hex: '#041E42', hex2: '#FF4C00' },
  { id: 'TOR', name: 'Toronto Maple Leafs',  city: 'TORONTO',     primary: [0, 32, 91],    secondary: [255, 255, 255],accent: [162, 170, 173], hex: '#00205B', hex2: '#FFFFFF' },
  { id: 'BOS', name: 'Boston Bruins',        city: 'BOSTON',      primary: [252, 181, 20], secondary: [17, 17, 17],   accent: [255, 255, 255], hex: '#FFB81C', hex2: '#111111' },
  { id: 'COL', name: 'Colorado Avalanche',   city: 'COLORADO',    primary: [111, 38, 61],  secondary: [35, 97, 146],  accent: [162, 170, 173], hex: '#6F263D', hex2: '#236192' },
  { id: 'NYR', name: 'New York Rangers',     city: 'NEW YORK',    primary: [0, 56, 168],   secondary: [206, 17, 38],  accent: [255, 255, 255], hex: '#0038A8', hex2: '#CE1126' },
  { id: 'VGK', name: 'Vegas Golden Knights', city: 'VEGAS',       primary: [51, 63, 72],   secondary: [180, 151, 90], accent: [200, 16, 46],   hex: '#333F48', hex2: '#B4975A' },
  { id: 'FLA', name: 'Florida Panthers',     city: 'FLORIDA',     primary: [200, 16, 46],  secondary: [4, 30, 66],    accent: [185, 151, 91],  hex: '#C8102E', hex2: '#B9975B' }
];

const ROSTER_NAMES = {
  CGY: ['HUBERDEAU', 'KADRI', 'WEEGAR', 'ANDERSSON', 'COLEMAN', 'WOLF'],
  EDM: ['MCDAVID', 'DRAISAITL', 'BOUCHARD', 'NUGENT-HOPKINS', 'HYMAN', 'SKINNER'],
  TOR: ['MATTHEWS', 'MARNER', 'NYLANDER', 'TAVARES', 'RIELLY', 'WOLL'],
  BOS: ['PASTRNAK', 'MARCHAND', 'MCAVOY', 'LINDHOLM', 'ZACHA', 'SWAYMAN'],
  COL: ['MACKINNON', 'MAKAR', 'RANTANEN', 'LEHKONEN', 'TOEWS', 'GEORGIEV'],
  NYR: ['PANARIN', 'ZIBANEJAD', 'FOX', 'KREIDER', 'TROCHECK', 'SHESTERKIN'],
  VGK: ['EICHEL', 'STONE', 'PIETRANGELO', 'HERTL', 'THEODORE', 'HILL'],
  FLA: ['BARKOV', 'TKACHUK', 'REINHART', 'FORSLING', 'VERHAEGHE', 'BOBROVSKY']
};

const GOALIE_NUMBERS = {
  CGY: 32, EDM: 74, TOR: 60, BOS: 1, COL: 40, NYR: 31, VGK: 33, FLA: 72
};

// Rink Dimensions (p5 WEBGL units: X = width, Y = vertical [negative is up], Z = length)
const RINK_W = 420;
const RINK_L = 860;
const CORNER_R = 110;
const GOAL_Z = 360;
const NET_W = 54;
const NET_H = 26;
const NET_D = 24;
const BOARD_H = 24;
const GLASS_H = 44;

let cfg = {
  homeIdx: 0,
  awayIdx: 1,
  mode: 'PERIODS',     // 'PERIODS' | 'OT' | 'SHOOTOUT'
  format: '5v5',       // '3v3' | '5v5'
  difficulty: 'PRO'    // 'ROOKIE' | 'PRO' | 'ALLSTAR'
};

let game = {
  phase: 'MENU',       // 'MENU' | 'FACEOFF' | 'PLAYING' | 'GOAL_CELEBRATION' | 'PERIOD_END' | 'GAME_OVER'
  period: 1,
  maxPeriods: 3,
  clock: 120.0,
  homeScore: 0,
  awayScore: 0,
  homeShots: 0,
  awayShots: 0,
  pressure: 0,
  fullPressureTeam: null,
  fullPressureTimer: 0,
  phaseTimer: 0,
  phaseDuration: 4.2,
  cellyDuration: 4.5,
  cameraMode: 'DYNAMIC',
  muted: false,
  lastScorer: null,
  lastScoringTeam: null,
  lastShotMph: 0,
  isHatTrickGoal: false,
  goalLampTimer: 0,
  goalLampTeam: null,
  shootoutRound: 1,
  shootoutTurn: 'HOME',
  shootoutHomeGoals: 0,
  shootoutAwayGoals: 0,
  chargingShot: false,
  shotCharge: 0,
  shotChargeSource: null, // 'KEY' | 'PAD_RS'
  oneTimerWindow: 0,
  oneTimerPlayer: null,
  actionBannerText: '',
  actionBannerTimer: 0,
  threeStars: [],
  starStage: 0,
  starStageTimer: 0
};

let puck = {
  x: 0, y: -2.5, z: 0,
  vx: 0, vy: 0, vz: 0,
  owner: null,
  lastTouchTeam: null,
  lastShooter: null,
  lastPasser: null,
  passTarget: null,
  passTimer: 0,
  trail: []
};

let skaters = [];
let goalies = [];
let hats = [];
let confetti = [];
let fans = [];
let rinkLoop = [];
let iceTexture = null;
let p5CanvasElt = null;

// Keyboard state map
const keysHeld = Object.create(null);

// Plug-in Gamepad Controller state
let padState = {
  connected: false,
  name: '',
  moveX: 0,
  moveZ: 0,
  hustle: false,
  prevButtons: [],
  prevRightX: 0,
  prevRightY: 0
};

// Camera smoothing state
let camPos = { x: 0, y: -260, z: 460 };
let camLook = { x: 0, y: -12, z: 0 };

// Web Audio API procedural sound engine
let audioCtx = null;

// ============================================================================
// P5.JS LIFECYCLE (v2.4.0)
// ============================================================================
function setup() {
  pixelDensity(1);
  let cnv = createCanvas(windowWidth, windowHeight, WEBGL);
  p5CanvasElt = cnv.elt;
  p5CanvasElt.setAttribute('tabindex', '0');
  p5CanvasElt.style.outline = 'none';
  p5CanvasElt.style.display = 'block';

  document.body.style.margin = '0';
  document.body.style.padding = '0';
  document.body.style.overflow = 'hidden';
  document.body.style.background = '#050914';

  perspective(PI / 3.1, width / height, 5, 4200);

  setupNativeInputHandlers();
  buildSmoothRinkLoop();
  buildIceTexture();
  buildCrowdFans();
  injectBroadcastUI();
  setupAttractMode();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  perspective(PI / 3.1, width / height, 5, 4200);
}

function draw() {
  let dt = Math.min(deltaTime / 1000, 0.05);
  if (isNaN(dt) || dt <= 0) dt = 1 / 60;

  pollGamepadController();
  updateSimulation(dt);
  renderArenaScene();
  updateBroadcastHUD();
}

function focusGameCanvas() {
  window.focus();
  if (document.activeElement && document.activeElement.blur) {
    document.activeElement.blur();
  }
  if (p5CanvasElt) {
    p5CanvasElt.focus({ preventScroll: true });
  }
}

// ============================================================================
// PLUG-IN GAMEPAD CONTROLLER SUPPORT
// RT/R2 = Pass | Right Stick = Shoot & Deke | A = Hit | B = Switch | RB = Poke
// ============================================================================
function pollGamepadController() {
  padState.moveX = 0;
  padState.moveZ = 0;
  padState.hustle = false;

  let pads = null;
  try {
    if (navigator && navigator.getGamepads) {
      pads = navigator.getGamepads();
    }
  } catch (e) {
    return;
  }
  if (!pads) return;

  let pad = null;
  for (let i = 0; i < pads.length; i++) {
    if (pads[i] && pads[i].connected) {
      pad = pads[i];
      break;
    }
  }

  if (!pad) {
    padState.connected = false;
    padState.prevButtons = [];
    return;
  }

  padState.connected = true;
  padState.name = pad.id || 'Controller';

  // Left Analog Stick / D-Pad: Skate & Aim
  let lx = pad.axes[0] || 0;
  let ly = pad.axes[1] || 0;
  let mag = Math.hypot(lx, ly);
  if (mag > 0.18) {
    let scaled = Math.min(1, (mag - 0.18) / 0.82);
    padState.moveX = (lx / mag) * scaled;
    padState.moveZ = (ly / mag) * scaled;
  } else {
    let dx = (isPadBtnDown(pad, 15) ? 1 : 0) - (isPadBtnDown(pad, 14) ? 1 : 0);
    let dz = (isPadBtnDown(pad, 13) ? 1 : 0) - (isPadBtnDown(pad, 12) ? 1 : 0);
    if (dx !== 0 || dz !== 0) {
      let dl = Math.hypot(dx, dz);
      padState.moveX = dx / dl;
      padState.moveZ = dz / dl;
    }
  }

  // LT / L2 (button 6) or L3 (button 10): Hustle
  if (isPadBtnDown(pad, 6) || isPadBtnDown(pad, 10)) {
    padState.hustle = true;
  }

  const btnCount = pad.buttons ? pad.buttons.length : 0;
  const justPressed = (idx) => isPadBtnDown(pad, idx) && !padState.prevButtons[idx];

  // Menu & Intermission Navigation
  if (game.phase === 'MENU') {
    if (justPressed(9) || justPressed(0)) {
      let btn = document.getElementById('btn-drop-puck');
      if (btn) btn.click();
    }
    savePadButtons(pad, btnCount);
    return;
  }

  if (game.phase === 'PERIOD_END') {
    if (justPressed(0) || justPressed(9)) {
      advanceFromPeriodEnd();
    }
    savePadButtons(pad, btnCount);
    return;
  }

  if (game.phase === 'GAME_OVER') {
    if (game.starStage < 3) {
      if (justPressed(0) || justPressed(9)) {
        advanceStarPresentation();
      }
    } else if (justPressed(9) || justPressed(0)) {
      let btn = document.getElementById('btn-rematch');
      if (btn) btn.click();
    }
    savePadButtons(pad, btnCount);
    return;
  }

  if (game.phase === 'GOAL_CELEBRATION') {
    if (justPressed(0) || justPressed(9)) {
      finishGoalCelebration();
    }
    savePadButtons(pad, btnCount);
    return;
  }

  if (justPressed(8)) {
    game.cameraMode = game.cameraMode === 'DYNAMIC' ? 'BROADCAST' : 'DYNAMIC';
  }

  if (game.phase !== 'PLAYING') {
    savePadButtons(pad, btnCount);
    return;
  }

  let ctrl = getControlledSkater();
  if (!ctrl) {
    savePadButtons(pad, btnCount);
    return;
  }

  // RT / R2 (Button 7): PASS
  if (justPressed(7)) {
    initAudio();
    if (puck.owner === ctrl && cfg.mode !== 'SHOOTOUT') {
      let mate = findBestPassTarget(ctrl);
      if (mate) passPuck(ctrl, mate);
    }
  }

  // A / Cross (Button 0): BODY CHECK / HIT
  if (justPressed(0)) {
    initAudio();
    if (puck.owner !== ctrl) {
      triggerPlayerBodyCheck();
    }
  }

  // B / Circle (Button 1): Switch Defender
  if (justPressed(1)) {
    initAudio();
    if (puck.owner !== ctrl) {
      switchToNearestDefender(ctrl);
    }
  }

  // Y / Triangle (Button 3): Toe-Drag Deke
  if (justPressed(3)) {
    initAudio();
    triggerToeDragDeke(ctrl, padState.moveX < -0.15 ? -1 : (padState.moveX > 0.15 ? 1 : 0));
  }

  // LB / L1 (Button 4): Left Toe-Drag Deke
  if (justPressed(4)) {
    initAudio();
    triggerToeDragDeke(ctrl, -1);
  }

  // RB / R1 (Button 5): Right Toe-Drag Deke (with puck) OR Poke Check (defending)
  if (justPressed(5)) {
    initAudio();
    if (puck.owner === ctrl) {
      triggerToeDragDeke(ctrl, 1);
    } else {
      triggerPlayerPokeCheck();
    }
  }

  // RIGHT ANALOG STICK (Skill Stick):
  // - Flick Up (ry < -0.60): Wrist Shot or One-Timer
  // - Pull Down (ry > 0.60) -> Flick Up / Release: Slap Shot
  // - Flick Left/Right (|rx| > 0.68): Toe-Drag Deke
  let rx = pad.axes[2] || 0;
  let ry = pad.axes[3] || 0;

  if (game.oneTimerWindow > 0 && game.oneTimerPlayer === ctrl && !puck.owner) {
    if (ry < -0.58 && padState.prevRightY >= -0.58) {
      initAudio();
      let aim = getPlayerShotDirection(ctrl);
      shootPuck(ctrl, aim.x, aim.z, 0.92, true);
    }
  } else if (puck.owner === ctrl) {
    // Wind up slap shot by pulling Right Stick down
    if (ry > 0.60) {
      initAudio();
      if (!game.chargingShot) {
        game.chargingShot = true;
        game.shotCharge = 0.30;
        game.shotChargeSource = 'PAD_RS';
      }
    } else if (game.chargingShot && game.shotChargeSource === 'PAD_RS') {
      // Snap forward or release from slap shot windup
      if (ry < -0.35 || Math.abs(ry) < 0.25) {
        let aim = getPlayerShotDirection(ctrl);
        shootPuck(ctrl, aim.x, aim.z, Math.max(0.45, game.shotCharge), false);
        game.chargingShot = false;
        game.shotCharge = 0;
        game.shotChargeSource = null;
      }
    } else if (ry < -0.60 && padState.prevRightY >= -0.60) {
      // Quick wrist shot flick up
      initAudio();
      let aim = getPlayerShotDirection(ctrl);
      shootPuck(ctrl, aim.x, aim.z, 0.68, false);
    } else if (Math.abs(rx) > 0.68 && Math.abs(padState.prevRightX) <= 0.68 && Math.abs(ry) < 0.5) {
      // Toe-drag deke left/right
      initAudio();
      triggerToeDragDeke(ctrl, rx < 0 ? -1 : 1);
    }
  }

  padState.prevRightX = rx;
  padState.prevRightY = ry;
  savePadButtons(pad, btnCount);
}

function isPadBtnDown(pad, idx) {
  if (!pad.buttons || !pad.buttons[idx]) return false;
  let b = pad.buttons[idx];
  return typeof b === 'object' ? (b.pressed || b.value > 0.45) : (b > 0.45);
}

function savePadButtons(pad, count) {
  for (let i = 0; i < count; i++) {
    padState.prevButtons[i] = isPadBtnDown(pad, i);
  }
}

function switchToNearestDefender(ctrl) {
  let mates = skaters.filter(s => s.team === 'HOME' && s !== ctrl);
  let best = mates[0];
  let bestD = Infinity;
  for (let m of mates) {
    let d = Math.hypot(m.x - puck.x, m.z - puck.z);
    if (d < bestD) { bestD = d; best = m; }
  }
  if (best) setControlledSkater(best);
}

// ============================================================================
// RELIABLE NATIVE KEYBOARD & MOUSE INPUTS (Unchanged)
// ============================================================================
function setupNativeInputHandlers() {
  const preventCodes = new Set([
    'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
    'Space', 'Tab', 'KeyW', 'KeyA', 'KeyS', 'KeyD',
    'KeyJ', 'KeyK', 'KeyL', 'KeyF', 'KeyG', 'KeyQ', 'KeyE',
    'KeyH', 'KeyC', 'KeyM', 'Enter', 'ShiftLeft', 'ShiftRight'
  ]);

  window.addEventListener('keydown', (e) => {
    if (document.activeElement && document.activeElement.tagName === 'SELECT') return;

    if (preventCodes.has(e.code)) {
      e.preventDefault();
    }

    const wasDown = !!keysHeld[e.code];
    keysHeld[e.code] = true;

    if (!wasDown) {
      handleActionKeyDown(e.code);
    }
  }, { passive: false });

  window.addEventListener('keyup', (e) => {
    keysHeld[e.code] = false;
    handleActionKeyUp(e.code);
  });

  window.addEventListener('blur', () => {
    for (let k in keysHeld) keysHeld[k] = false;
    game.chargingShot = false;
    game.shotCharge = 0;
    game.shotChargeSource = null;
  });

  p5CanvasElt.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    initAudio();
    focusGameCanvas();
    if (game.phase === 'PLAYING') {
      triggerPlayerPokeCheck();
    }
  });
}

function handleActionKeyDown(code) {
  initAudio();

  if (game.phase === 'GOAL_CELEBRATION') {
    if (code === 'Space' || code === 'Enter') {
      finishGoalCelebration();
    }
    return;
  }

  if (game.phase === 'PERIOD_END') {
    if (code === 'Space' || code === 'Enter') {
      advanceFromPeriodEnd();
    }
    return;
  }

  if (game.phase === 'GAME_OVER') {
    if ((code === 'Space' || code === 'Enter') && game.starStage < 3) {
      advanceStarPresentation();
    }
    return;
  }

  if (code === 'KeyC') {
    game.cameraMode = game.cameraMode === 'DYNAMIC' ? 'BROADCAST' : 'DYNAMIC';
    return;
  }

  if (code === 'KeyM') {
    game.muted = !game.muted;
    return;
  }

  if (game.phase !== 'PLAYING') return;

  let ctrl = getControlledSkater();
  if (!ctrl) return;

  // SPACEBAR: Pass (when holding puck) OR Poke Check (when without puck)
  if (code === 'Space') {
    if (puck.owner === ctrl) {
      if (cfg.mode !== 'SHOOTOUT') {
        let mate = findBestPassTarget(ctrl);
        if (mate) passPuck(ctrl, mate);
      }
    } else {
      triggerPlayerPokeCheck();
    }
    return;
  }

  // G: Keyboard Body Check / Hit
  if (code === 'KeyG') {
    if (puck.owner !== ctrl) {
      triggerPlayerBodyCheck();
    }
    return;
  }

  // F or Tab: Switch Controlled Defender
  if (code === 'KeyF' || code === 'Tab') {
    if (puck.owner !== ctrl) {
      switchToNearestDefender(ctrl);
    }
    return;
  }

  // J or Enter: Shoot / Charge Slap Shot / One-Timer
  if (code === 'KeyJ' || code === 'Enter') {
    if (game.oneTimerWindow > 0 && game.oneTimerPlayer === ctrl && !puck.owner) {
      let aim = getPlayerShotDirection(ctrl);
      shootPuck(ctrl, aim.x, aim.z, 0.92, true);
      return;
    }
    if (puck.owner === ctrl) {
      game.chargingShot = true;
      game.shotCharge = 0.22;
      game.shotChargeSource = 'KEY';
    }
    return;
  }

  // L: Alternate Poke Check key
  if (code === 'KeyL') {
    triggerPlayerPokeCheck();
    return;
  }

  // E (plus K / Q): Toe-Drag Deke
  if (code === 'KeyE' || code === 'KeyK' || code === 'KeyQ') {
    let dir = 0;
    if (code === 'KeyQ' || keysHeld['KeyA'] || keysHeld['ArrowLeft']) dir = -1;
    else if (keysHeld['KeyD'] || keysHeld['ArrowRight']) dir = 1;
    triggerToeDragDeke(ctrl, dir);
  }
}

function handleActionKeyUp(code) {
  if ((code === 'KeyJ' || code === 'Enter') && game.chargingShot && game.shotChargeSource === 'KEY') {
    let ctrl = getControlledSkater();
    if (ctrl && puck.owner === ctrl) {
      let aim = getPlayerShotDirection(ctrl);
      shootPuck(ctrl, aim.x, aim.z, game.shotCharge, false);
    }
    game.chargingShot = false;
    game.shotCharge = 0;
    game.shotChargeSource = null;
  }
}

function mousePressed() {
  initAudio();
  if (game.phase === 'MENU') return;
  if (game.phase === 'GAME_OVER') {
    if (game.starStage < 3) advanceStarPresentation();
    return;
  }
  focusGameCanvas();

  if (game.phase === 'GOAL_CELEBRATION') {
    finishGoalCelebration();
    return;
  }
  if (game.phase === 'PERIOD_END') {
    advanceFromPeriodEnd();
    return;
  }
  if (game.phase === 'PLAYING') {
    if (mouseButton === RIGHT) {
      triggerPlayerPokeCheck();
      return;
    }
    let ctrl = getControlledSkater();
    if (ctrl && game.oneTimerWindow > 0 && game.oneTimerPlayer === ctrl && !puck.owner) {
      let aim = getPlayerShotDirection(ctrl);
      shootPuck(ctrl, aim.x, aim.z, 0.92, true);
      return;
    }
    if (ctrl && puck.owner === ctrl) {
      game.chargingShot = true;
      game.shotCharge = 0.24;
      game.shotChargeSource = 'KEY';
    } else if (ctrl && puck.owner !== ctrl) {
      triggerPlayerPokeCheck();
    }
  }
}

function mouseReleased() {
  if (game.chargingShot && game.shotChargeSource === 'KEY') {
    let ctrl = getControlledSkater();
    if (ctrl && puck.owner === ctrl) {
      let aim = getPlayerShotDirection(ctrl);
      shootPuck(ctrl, aim.x, aim.z, game.shotCharge, false);
    }
    game.chargingShot = false;
    game.shotCharge = 0;
    game.shotChargeSource = null;
  }
}

function triggerToeDragDeke(skater, forcedDir = 0) {
  if (!skater || puck.owner !== skater || skater.dekeTimer > 0) return;
  skater.dekeTimer = 0.48;
  if (forcedDir !== 0) {
    skater.dekeDir = forcedDir;
  } else {
    skater.lastDekeDir = -(skater.lastDekeDir || -1);
    skater.dekeDir = skater.lastDekeDir;
  }
  playStickImpact(0.35);
  if (skater.team === 'HOME') {
    game.actionBannerText = 'TOE-DRAG DEKE!';
    game.actionBannerTimer = 0.75;
  }
}

// ============================================================================
// BODY CHECK / HIT MECHANIC (Controller A Button)
// ============================================================================
function triggerPlayerBodyCheck() {
  let ctrl = getControlledSkater();
  if (!ctrl || puck.owner === ctrl) return;
  if (ctrl.hitCooldown > 0) return;

  performBodyCheck(ctrl);
}

function performBodyCheck(skater) {
  skater.hitTimer = 0.34;
  skater.hitCooldown = (skater.team === 'HOME' && skater.isControlled) ? 0.52 : 1.6;

  let fwdX = Math.sin(skater.facing);
  let fwdZ = Math.cos(skater.facing);

  // Forward shoulder lunge
  skater.vx += fwdX * 135;
  skater.vz += fwdZ * 135;

  let hitX = skater.x + fwdX * 15;
  let hitZ = skater.z + fwdZ * 15;
  let reach = (skater.team === 'HOME' && skater.isControlled) ? 26 : 20;

  let landedHit = false;
  for (let opp of skaters) {
    if (opp.team === skater.team || opp.stunTimer > 0) continue;
    let d = Math.hypot(opp.x - hitX, opp.z - hitZ);
    if (d < reach) {
      landedHit = true;
      skater.hits++;
      opp.stunTimer = 1.15;
      opp.pickupLockout = 1.15;
      opp.vx = fwdX * 235 + random(-35, 35);
      opp.vz = fwdZ * 235 + random(-35, 35);

      if (puck.owner === opp) {
        puck.owner = null;
        puck.passTarget = null;
        puck.passTimer = 0;
        puck.lastTouchTeam = skater.team;
        puck.vx = fwdX * 115 + random(-65, 65);
        puck.vz = fwdZ * 115 + random(-65, 65);
        puck.vy = -8;
        if (skater.team === 'HOME') {
          game.actionBannerText = 'BIG HIT! PUCK LOOSE!';
          game.actionBannerTimer = 1.35;
        }
      } else if (skater.team === 'HOME') {
        game.actionBannerText = 'BODY CHECK!';
        game.actionBannerTimer = 1.05;
      }
      break;
    }
  }

  if (landedHit) {
    playBodyCheckSound();
  } else {
    playPokeCheckSound();
  }
  return landedHit;
}

// ============================================================================
// POKE CHECK MECHANIC (Spacebar on Defense / RB on Controller)
// ============================================================================
function triggerPlayerPokeCheck() {
  let ctrl = getControlledSkater();
  if (!ctrl || puck.owner === ctrl) return;
  if (ctrl.pokeCooldown > 0) return;

  performPokeCheck(ctrl);
}

function performPokeCheck(skater) {
  skater.pokeTimer = 0.28;
  skater.pokeCooldown = (skater.team === 'HOME' && skater.isControlled) ? 0.36 : 1.35;
  playPokeCheckSound();

  let fwdX = Math.sin(skater.facing);
  let fwdZ = Math.cos(skater.facing);
  let pokeTipX = skater.x + fwdX * 23;
  let pokeTipZ = skater.z + fwdZ * 23;
  let reach = (skater.team === 'HOME' && skater.isControlled) ? 26 : 18;

  if (puck.owner && puck.owner.team !== skater.team) {
    let carrier = puck.owner;
    let dBody = Math.hypot(carrier.x - pokeTipX, carrier.z - pokeTipZ);
    let dPuck = Math.hypot(puck.x - pokeTipX, puck.z - pokeTipZ);

    if ((dBody < reach || dPuck < reach) && carrier.dekeTimer <= 0) {
      puck.owner = null;
      puck.passTarget = null;
      puck.passTimer = 0;
      puck.lastTouchTeam = skater.team;
      carrier.pickupLockout = 0.65;

      puck.vx = fwdX * 145 + random(-55, 55);
      puck.vz = fwdZ * 145 + random(-55, 55);
      puck.vy = -6;

      playStickImpact(0.75);
      if (skater.team === 'HOME') {
        setControlledSkater(skater);
        game.actionBannerText = 'POKE CHECK! PUCK LOOSE!';
        game.actionBannerTimer = 1.25;
      }
      return true;
    }
  }

  if (!puck.owner) {
    let dLoose = Math.hypot(puck.x - pokeTipX, puck.z - pokeTipZ);
    if (dLoose < reach + 5 && puck.y > -12) {
      puck.passTarget = null;
      puck.passTimer = 0;
      puck.lastTouchTeam = skater.team;
      puck.vx = fwdX * 225 + skater.vx * 0.4;
      puck.vz = fwdZ * 225 + skater.vz * 0.4;
      puck.vy = -5;
      playStickImpact(0.55);
      if (skater.team === 'HOME') {
        game.actionBannerText = 'POKE CLEAR!';
        game.actionBannerTimer = 0.9;
      }
      return true;
    }
  }

  return false;
}

// ============================================================================
// JERSEY BACK NAME & NUMBER TEXTURE GENERATOR (Cached for 60 FPS)
// ============================================================================
function createJerseyBackTexture(team, playerName, playerNumber) {
  const g = createGraphics(128, 128);
  g.pixelDensity(1);

  g.background(team.primary[0], team.primary[1], team.primary[2]);

  g.noStroke();
  g.fill(team.secondary[0], team.secondary[1], team.secondary[2], 70);
  g.rect(0, 0, 128, 16);

  g.fill(team.secondary[0], team.secondary[1], team.secondary[2]);
  g.rect(0, 96, 128, 22);
  g.fill(team.accent[0], team.accent[1], team.accent[2]);
  g.rect(0, 93, 128, 3);
  g.rect(0, 118, 128, 3);

  g.textAlign(CENTER, CENTER);
  g.textStyle(BOLD);
  let displayName = (playerName || 'PLAYER').toUpperCase();
  let nameFontSize = displayName.length > 11 ? 12 : (displayName.length > 8 ? 14 : 16);
  g.textSize(nameFontSize);

  g.fill(10, 14, 24, 210);
  for (let ox of [-1.5, 1.5]) {
    for (let oy of [-1.5, 1.5]) {
      g.text(displayName, 64 + ox, 24 + oy);
    }
  }
  g.fill(255, 255, 255);
  g.text(displayName, 64, 24);

  let numStr = String(playerNumber);
  g.textSize(56);
  g.strokeJoin(ROUND);

  g.stroke(10, 14, 24, 230);
  g.strokeWeight(8);
  g.fill(team.secondary[0], team.secondary[1], team.secondary[2]);
  g.text(numStr, 64, 64);

  g.stroke(team.secondary[0], team.secondary[1], team.secondary[2]);
  g.strokeWeight(3);
  g.fill(255, 255, 255);
  g.text(numStr, 64, 64);

  return g;
}

function disposeRosterTextures() {
  for (let s of skaters) {
    if (s.jerseyTex && s.jerseyTex.remove) {
      s.jerseyTex.remove();
    }
  }
  for (let g of goalies) {
    if (g.jerseyTex && g.jerseyTex.remove) {
      g.jerseyTex.remove();
    }
  }
}

// ============================================================================
// SEAMLESS ROUND RINK LOOP & HIGH-RES ROUNDED ICE TEXTURE
// ============================================================================
function buildSmoothRinkLoop() {
  const halfW = RINK_W / 2;
  const halfL = RINK_L / 2;
  const r = CORNER_R;
  const segsPerCorner = 28;

  const corners = [
    { cx: halfW - r,  cz: halfL - r,  a0: 0,           a1: HALF_PI },
    { cx: -halfW + r, cz: halfL - r,  a0: HALF_PI,     a1: PI },
    { cx: -halfW + r, cz: -halfL + r, a0: PI,          a1: PI + HALF_PI },
    { cx: halfW - r,  cz: -halfL + r, a0: PI + HALF_PI, a1: TWO_PI }
  ];

  rinkLoop = [];
  for (let c of corners) {
    for (let i = 0; i <= segsPerCorner; i++) {
      let a = c.a0 + (c.a1 - c.a0) * (i / segsPerCorner);
      let nx = Math.cos(a);
      let nz = Math.sin(a);
      rinkLoop.push({
        x: c.cx + nx * r,
        z: c.cz + nz * r,
        nx: nx,
        nz: nz
      });
    }
  }
}

function buildIceTexture() {
  const tw = 1024;
  const th = 2048;
  iceTexture = createGraphics(tw, th);
  const g = iceTexture;

  g.background(22, 30, 48);

  const mapX = (rx) => ((rx + RINK_W / 2) / RINK_W) * tw;
  const mapY = (rz) => ((rz + RINK_L / 2) / RINK_L) * th;

  g.drawingContext.save();
  g.drawingContext.beginPath();
  for (let i = 0; i < rinkLoop.length; i++) {
    let pt = rinkLoop[i];
    let cx = mapX(pt.x);
    let cy = mapY(pt.z);
    if (i === 0) g.drawingContext.moveTo(cx, cy);
    else g.drawingContext.lineTo(cx, cy);
  }
  g.drawingContext.closePath();
  g.drawingContext.clip();

  g.fill(236, 246, 253);
  g.noStroke();
  g.rect(0, 0, tw, th);

  g.noFill();
  for (let i = 0; i < 260; i++) {
    let sx = random(40, tw - 40);
    let sy = random(40, th - 40);
    g.stroke(214, 230, 244, random(30, 75));
    g.strokeWeight(random(1, 2.2));
    g.arc(sx, sy, random(30, 130), random(12, 60), random(TWO_PI), random(TWO_PI));
  }

  const goalYTop = mapY(-GOAL_Z);
  const goalYBot = mapY(GOAL_Z);
  const blueYTop = mapY(-135);
  const blueYBot = mapY(135);
  const centerY = mapY(0);

  g.stroke(205, 22, 42);
  g.strokeWeight(6);
  g.line(0, goalYTop, tw, goalYTop);
  g.line(0, goalYBot, tw, goalYBot);

  g.strokeWeight(5);
  g.line(mapX(-34), goalYTop, mapX(-52), 0);
  g.line(mapX(34), goalYTop, mapX(52), 0);
  g.line(mapX(-34), goalYBot, mapX(-52), th);
  g.line(mapX(34), goalYBot, mapX(52), th);

  const creaseR = (36 / RINK_W) * tw;
  g.fill(130, 198, 242, 185);
  g.stroke(205, 22, 42);
  g.strokeWeight(5);
  g.arc(tw / 2, goalYTop, creaseR * 2, creaseR * 1.85, 0, PI, CHORD);
  g.arc(tw / 2, goalYBot, creaseR * 2, creaseR * 1.85, PI, TWO_PI, CHORD);

  g.noStroke();
  g.fill(16, 78, 172);
  g.rect(0, blueYTop - 11, tw, 22);
  g.rect(0, blueYBot - 11, tw, 22);

  g.fill(205, 22, 42);
  g.rect(0, centerY - 11, tw, 22);
  g.fill(242, 249, 255);
  for (let x = 16; x < tw; x += 48) {
    g.rect(x, centerY - 4, 24, 8);
  }

  const circleR = (68 / RINK_W) * tw;
  g.noFill();
  g.stroke(16, 78, 172);
  g.strokeWeight(7);
  g.ellipse(tw / 2, centerY, circleR * 2, circleR * 2);

  g.fill(12, 28, 56, 215);
  g.noStroke();
  g.ellipse(tw / 2, centerY, 74, 74);
  g.fill(255);
  g.textAlign(CENTER, CENTER);
  g.textStyle(BOLD);
  g.textSize(22);
  g.text('NHL', tw / 2, centerY - 10);
  g.fill(241, 190, 72);
  g.textSize(24);
  g.text('26', tw / 2, centerY + 13);

  const foSpots = [
    { x: -108, z: -265 }, { x: 108, z: -265 },
    { x: -108, z:  265 }, { x: 108, z:  265 }
  ];
  for (let sp of foSpots) {
    let fx = mapX(sp.x);
    let fy = mapY(sp.z);
    g.noFill();
    g.stroke(205, 22, 42);
    g.strokeWeight(6);
    g.ellipse(fx, fy, circleR * 1.85, circleR * 1.85);
    g.fill(205, 22, 42);
    g.noStroke();
    g.ellipse(fx, fy, 18, 18);
  }

  const nzDots = [
    { x: -108, z: -95 }, { x: 108, z: -95 },
    { x: -108, z:  95 }, { x: 108, z:  95 }
  ];
  g.fill(205, 22, 42);
  g.noStroke();
  for (let d of nzDots) {
    g.ellipse(mapX(d.x), mapY(d.z), 16, 16);
  }

  g.drawingContext.restore();
}

function buildCrowdFans() {
  fans = [];
  for (let side of [-1, 1]) {
    for (let row = 0; row < 2; row++) {
      let distOut = RINK_W / 2 + 44 + row * 34;
      let yBase = -BOARD_H - 18 - row * 24;
      for (let z = -340; z <= 340; z += 75) {
        fans.push({
          x: side * distOut,
          y: yBase,
          z: z,
          phase: random(TWO_PI),
          colorType: random()
        });
      }
    }
  }
}

// ============================================================================
// MATCH SETUP & ROSTER SPAWNING
// ============================================================================
function setupAttractMode() {
  spawnTeams();
  game.phase = 'MENU';
}

function startNewMatch() {
  initAudio();
  focusGameCanvas();
  playRefereeWhistle();

  game.homeScore = 0;
  game.awayScore = 0;
  game.homeShots = 0;
  game.awayShots = 0;
  game.pressure = 0;
  game.fullPressureTeam = null;
  game.fullPressureTimer = 0;
  game.goalLampTimer = 0;
  game.isHatTrickGoal = false;
  game.actionBannerText = '';
  game.actionBannerTimer = 0;
  game.threeStars = [];
  game.starStage = 0;
  game.starStageTimer = 0;
  clearIceHats();
  confetti = [];

  if (cfg.mode === 'PERIODS') {
    game.period = 1;
    game.maxPeriods = 3;
    game.clock = 120.0;
  } else if (cfg.mode === 'OT') {
    game.period = 4;
    game.maxPeriods = 4;
    game.clock = 180.0;
  } else {
    game.period = 5;
    game.maxPeriods = 5;
    game.clock = 0;
    game.shootoutRound = 1;
    game.shootoutTurn = 'HOME';
    game.shootoutHomeGoals = 0;
    game.shootoutAwayGoals = 0;
  }

  spawnTeams();
  resetForFaceoff();
}

function spawnTeams() {
  disposeRosterTextures();
  skaters = [];
  goalies = [];

  const homeTeam = TEAMS[cfg.homeIdx];
  const awayTeam = TEAMS[cfg.awayIdx];
  const homeNames = ROSTER_NAMES[homeTeam.id];
  const awayNames = ROSTER_NAMES[awayTeam.id];
  const homeGoalieNum = GOALIE_NUMBERS[homeTeam.id] || 31;
  const awayGoalieNum = GOALIE_NUMBERS[awayTeam.id] || 35;

  goalies.push({
    id: 'HG',
    isGoalie: true,
    team: 'HOME',
    name: homeNames[5],
    number: homeGoalieNum,
    jerseyTex: createJerseyBackTexture(homeTeam, homeNames[5], homeGoalieNum),
    x: 0, y: 0, z: GOAL_Z - 14,
    vx: 0, vz: 0,
    facing: PI,
    saveTimer: 0,
    saveDir: 0,
    goals: 0,
    assists: 0,
    shots: 0,
    saves: 0,
    hits: 0,
    cellyTimer: 0,
    stridePhase: 0
  });
  goalies.push({
    id: 'AG',
    isGoalie: true,
    team: 'AWAY',
    name: awayNames[5],
    number: awayGoalieNum,
    jerseyTex: createJerseyBackTexture(awayTeam, awayNames[5], awayGoalieNum),
    x: 0, y: 0, z: -GOAL_Z + 14,
    vx: 0, vz: 0,
    facing: 0,
    saveTimer: 0,
    saveDir: 0,
    goals: 0,
    assists: 0,
    shots: 0,
    saves: 0,
    hits: 0,
    cellyTimer: 0,
    stridePhase: 0
  });

  const numSkaters = cfg.format === '3v3' ? 3 : 5;
  const homeForm = numSkaters === 3
    ? [{ x: 0, z: 22, role: 'C' }, { x: -95, z: 75, role: 'LW' }, { x: 95, z: 75, role: 'RW' }]
    : [{ x: 0, z: 22, role: 'C' }, { x: -115, z: 32, role: 'LW' }, { x: 115, z: 32, role: 'RW' }, { x: -75, z: 145, role: 'LD' }, { x: 75, z: 145, role: 'RD' }];

  const awayForm = numSkaters === 3
    ? [{ x: 0, z: -22, role: 'C' }, { x: -95, z: -75, role: 'LW' }, { x: 95, z: -75, role: 'RW' }]
    : [{ x: 0, z: -22, role: 'C' }, { x: -115, z: -32, role: 'LW' }, { x: 115, z: -32, role: 'RW' }, { x: -75, z: -145, role: 'LD' }, { x: 75, z: -145, role: 'RD' }];

  const homeNums = [11, 91, 4, 88, 20];
  const awayNums = [97, 29, 2, 93, 18];

  for (let i = 0; i < numSkaters; i++) {
    let pName = homeNames[i];
    let pNum = homeNums[i];
    skaters.push({
      id: 'H' + i,
      isGoalie: false,
      team: 'HOME',
      name: pName,
      number: pNum,
      jerseyTex: createJerseyBackTexture(homeTeam, pName, pNum),
      role: homeForm[i].role,
      homePos: { x: homeForm[i].x, z: homeForm[i].z },
      x: homeForm[i].x,
      y: 0,
      z: homeForm[i].z,
      vx: 0,
      vz: 0,
      facing: PI,
      isControlled: i === 0,
      goals: 0,
      assists: 0,
      shots: 0,
      saves: 0,
      hits: 0,
      stridePhase: random(TWO_PI),
      shotAnim: 0,
      pokeTimer: 0,
      pokeCooldown: 0,
      hitTimer: 0,
      hitCooldown: 0,
      stunTimer: 0,
      pickupLockout: 0,
      dekeTimer: 0,
      dekeDir: 1,
      lastDekeDir: -1,
      cellyTimer: 0,
      reactionTimer: 0
    });
  }

  for (let i = 0; i < numSkaters; i++) {
    let pName = awayNames[i];
    let pNum = awayNums[i];
    skaters.push({
      id: 'A' + i,
      isGoalie: false,
      team: 'AWAY',
      name: pName,
      number: pNum,
      jerseyTex: createJerseyBackTexture(awayTeam, pName, pNum),
      role: awayForm[i].role,
      homePos: { x: awayForm[i].x, z: awayForm[i].z },
      x: awayForm[i].x,
      y: 0,
      z: awayForm[i].z,
      vx: 0,
      vz: 0,
      facing: 0,
      isControlled: false,
      goals: 0,
      assists: 0,
      shots: 0,
      saves: 0,
      hits: 0,
      stridePhase: random(TWO_PI),
      shotAnim: 0,
      pokeTimer: 0,
      pokeCooldown: 0,
      hitTimer: 0,
      hitCooldown: 0,
      stunTimer: 0,
      pickupLockout: 0,
      dekeTimer: 0,
      dekeDir: 1,
      lastDekeDir: -1,
      cellyTimer: 0,
      reactionTimer: random(0.25, 0.5)
    });
  }
}

function resetForFaceoff() {
  clearIceHats();
  game.chargingShot = false;
  game.shotCharge = 0;
  game.shotChargeSource = null;
  game.oneTimerWindow = 0;
  game.oneTimerPlayer = null;
  game.isHatTrickGoal = false;

  puck.x = 0;
  puck.y = -2.5;
  puck.z = 0;
  puck.vx = 0;
  puck.vy = 0;
  puck.vz = 0;
  puck.owner = null;
  puck.passTarget = null;
  puck.passTimer = 0;
  puck.trail = [];

  for (let g of goalies) {
    g.x = 0;
    g.z = g.team === 'HOME' ? GOAL_Z - 14 : -GOAL_Z + 14;
    g.vx = 0;
    g.vz = 0;
    g.saveTimer = 0;
    g.cellyTimer = 0;
  }

  if (cfg.mode === 'SHOOTOUT') {
    for (let s of skaters) {
      s.vx = 0;
      s.vz = 0;
      s.cellyTimer = 0;
      s.dekeTimer = 0;
      s.shotAnim = 0;
      s.pokeTimer = 0;
      s.hitTimer = 0;
      s.stunTimer = 0;
      s.pickupLockout = 0;
      s.isControlled = false;
      if (game.shootoutTurn === 'HOME') {
        if (s.id === 'H0') {
          s.x = 0; s.z = 25; s.facing = PI; s.isControlled = true;
          puck.owner = s;
        } else {
          s.x = s.team === 'HOME' ? -185 : 185;
          s.z = 0;
        }
      } else {
        if (s.id === 'A0') {
          s.x = 0; s.z = -25; s.facing = 0;
          puck.owner = s;
        } else {
          s.x = s.team === 'HOME' ? -185 : 185;
          s.z = 0;
        }
      }
    }
    game.phase = 'PLAYING';
    return;
  }

  for (let s of skaters) {
    s.x = s.homePos.x;
    s.z = s.homePos.z;
    s.vx = 0;
    s.vz = 0;
    s.facing = s.team === 'HOME' ? PI : 0;
    s.cellyTimer = 0;
    s.dekeTimer = 0;
    s.shotAnim = 0;
    s.pokeTimer = 0;
    s.hitTimer = 0;
    s.stunTimer = 0;
    s.pickupLockout = 0;
    s.isControlled = (s.id === 'H0');
  }

  game.phase = 'FACEOFF';
  game.phaseTimer = 1.05;
}

// ============================================================================
// MAIN SIMULATION LOOP
// ============================================================================
function updateSimulation(dt) {
  if (game.goalLampTimer > 0) game.goalLampTimer -= dt;
  if (game.actionBannerTimer > 0) game.actionBannerTimer -= dt;

  updateConfetti(dt);
  updateHats(dt);

  if (game.phase === 'MENU') {
    updateAttractSkaters(dt);
    updateCamera(dt);
    return;
  }

  if (game.phase === 'FACEOFF') {
    game.phaseTimer -= dt;
    updateCamera(dt);
    if (game.phaseTimer <= 0) {
      playRefereeWhistle();
      let centers = skaters.filter(s => s.role === 'C');
      let winner = random() < 0.64 ? centers.find(s => s.team === 'HOME') : centers.find(s => s.team === 'AWAY');
      if (winner) {
        puck.owner = winner;
        puck.lastTouchTeam = winner.team;
        if (winner.team === 'HOME') setControlledSkater(winner);
      }
      game.phase = 'PLAYING';
    }
    return;
  }

  if (game.phase === 'GOAL_CELEBRATION') {
    game.phaseTimer -= dt;
    updateCelebrationSkaters(dt);
    updatePuckInNet(dt);
    updateCamera(dt);
    if (game.phaseTimer <= 0) {
      finishGoalCelebration();
    }
    return;
  }

  if (game.phase === 'PERIOD_END') {
    game.phaseTimer -= dt;
    updatePeriodEndAnimation(dt);
    updateCamera(dt);
    if (game.phaseTimer <= 0) {
      advanceFromPeriodEnd();
    }
    return;
  }

  if (game.phase === 'GAME_OVER') {
    updateThreeStarsPresentation(dt);
    updateCamera(dt);
    return;
  }

  // PLAYING STATE
  if (cfg.mode !== 'SHOOTOUT') {
    game.clock -= dt;
    if (game.clock <= 0) {
      game.clock = 0;
      handlePeriodHorn();
      return;
    }
  }

  if (game.chargingShot && puck.owner && puck.owner.isControlled) {
    game.shotCharge = Math.min(1.0, game.shotCharge + dt * 1.65);
  } else if (!puck.owner || !puck.owner.isControlled) {
    game.chargingShot = false;
    game.shotCharge = 0;
    game.shotChargeSource = null;
  }

  if (game.oneTimerWindow > 0) {
    game.oneTimerWindow -= dt;
    if (game.oneTimerWindow <= 0) game.oneTimerPlayer = null;
  }

  if (puck.passTimer > 0) {
    puck.passTimer -= dt;
    if (puck.passTimer <= 0) {
      puck.passTarget = null;
    }
  }

  updateZonePressure(dt);
  updateSkaters(dt);
  updateGoalies(dt);
  updatePuckPhysics(dt);
  updateCamera(dt);
}

function updateAttractSkaters(dt) {
  let t = millis() * 0.001;
  for (let i = 0; i < skaters.length; i++) {
    let s = skaters[i];
    let ang = t * 0.7 + i * 1.1;
    let tx = Math.sin(ang) * 140;
    let tz = Math.cos(ang * 0.8) * 240;
    s.vx = (tx - s.x) * 1.4;
    s.vz = (tz - s.z) * 1.4;
    s.x += s.vx * dt;
    s.z += s.vz * dt;
    s.facing = Math.atan2(s.vx, s.vz);
    s.stridePhase += dt * 9;
  }
  if (skaters.length > 0) {
    puck.x = skaters[0].x + Math.sin(skaters[0].facing) * 14;
    puck.z = skaters[0].z + Math.cos(skaters[0].facing) * 14;
    puck.y = -2.5;
  }
}

function updateZonePressure(dt) {
  if (cfg.mode === 'SHOOTOUT') return;

  if (game.fullPressureTimer > 0) {
    game.fullPressureTimer -= dt;
    if (game.fullPressureTimer <= 0) {
      game.fullPressureTeam = null;
      game.pressure = 0;
    }
    return;
  }

  if (puck.z < -135 && (puck.lastTouchTeam === 'HOME' || (puck.owner && puck.owner.team === 'HOME'))) {
    game.pressure = Math.min(100, game.pressure + dt * 11);
    if (game.pressure >= 100) {
      game.fullPressureTeam = 'HOME';
      game.fullPressureTimer = 14.0;
    }
  } else if (puck.z > 135 && (puck.lastTouchTeam === 'AWAY' || (puck.owner && puck.owner.team === 'AWAY'))) {
    game.pressure = Math.max(-100, game.pressure - dt * 11);
    if (game.pressure <= -100) {
      game.fullPressureTeam = 'AWAY';
      game.fullPressureTimer = 14.0;
    }
  } else {
    game.pressure *= Math.pow(0.65, dt);
  }
}

// ============================================================================
// END OF PERIOD ANIMATION & TRANSITION
// ============================================================================
function updatePeriodEndAnimation(dt) {
  for (let i = 0; i < skaters.length; i++) {
    let s = skaters[i];
    let benchZ = s.team === 'HOME' ? 95 + (i % 5) * 14 - 28 : -95 + (i % 5) * 14 - 28;
    let benchX = RINK_W / 2 - 26 - (i % 2) * 14;
    let dx = benchX - s.x;
    let dz = benchZ - s.z;
    let dist = Math.hypot(dx, dz);
    if (dist > 10) {
      s.vx += ((dx / dist) * 115 - s.vx) * Math.min(1, 5 * dt);
      s.vz += ((dz / dist) * 115 - s.vz) * Math.min(1, 5 * dt);
      s.x += s.vx * dt;
      s.z += s.vz * dt;
      s.facing = Math.atan2(s.vx, s.vz);
      s.stridePhase += dt * 7.5;
    } else {
      s.vx *= Math.pow(0.15, dt);
      s.vz *= Math.pow(0.15, dt);
      let faceCenter = Math.atan2(-s.x, -s.z);
      s.facing += normalizeAngle(faceCenter - s.facing) * Math.min(1, 4 * dt);
    }
    keepInsideBoards(s, 16);
  }

  for (let g of goalies) {
    let targetZ = g.team === 'HOME' ? 140 : -140;
    let targetX = RINK_W / 2 - 42;
    let dx = targetX - g.x;
    let dz = targetZ - g.z;
    let dist = Math.hypot(dx, dz);
    if (dist > 10) {
      g.vx = (dx / dist) * 95;
      g.vz = (dz / dist) * 95;
      g.x += g.vx * dt;
      g.z += g.vz * dt;
      g.facing = Math.atan2(g.vx, g.vz);
    }
  }
}

function advanceFromPeriodEnd() {
  game.period++;
  game.clock = game.period === 4 ? 180.0 : 120.0;
  playRefereeWhistle();
  resetForFaceoff();
}

// ============================================================================
// SKATER & AI CONTROLS
// ============================================================================
function getControlledSkater() {
  return skaters.find(s => s.team === 'HOME' && s.isControlled) || skaters.find(s => s.team === 'HOME');
}

function setControlledSkater(target) {
  if (!target || target.team !== 'HOME') return;
  for (let s of skaters) {
    if (s.team === 'HOME') s.isControlled = (s === target);
  }
}

function updateSkaters(dt) {
  const aiDiffScale = cfg.difficulty === 'ROOKIE' ? 0.62 : (cfg.difficulty === 'PRO' ? 0.74 : 0.86);

  for (let s of skaters) {
    if (s.shotAnim > 0) s.shotAnim = Math.max(0, s.shotAnim - dt * 3.5);
    if (s.pokeTimer > 0) s.pokeTimer = Math.max(0, s.pokeTimer - dt);
    if (s.pokeCooldown > 0) s.pokeCooldown = Math.max(0, s.pokeCooldown - dt);
    if (s.hitTimer > 0) s.hitTimer = Math.max(0, s.hitTimer - dt);
    if (s.hitCooldown > 0) s.hitCooldown = Math.max(0, s.hitCooldown - dt);
    if (s.stunTimer > 0) s.stunTimer = Math.max(0, s.stunTimer - dt);
    if (s.pickupLockout > 0) s.pickupLockout = Math.max(0, s.pickupLockout - dt);
    if (s.dekeTimer > 0) s.dekeTimer = Math.max(0, s.dekeTimer - dt);

    if (cfg.mode === 'SHOOTOUT' && !puck.owner && s.id !== (game.shootoutTurn === 'HOME' ? 'H0' : 'A0')) {
      continue;
    }

    // Stunned from a body check
    if (s.stunTimer > 0) {
      s.vx *= Math.pow(0.18, dt);
      s.vz *= Math.pow(0.18, dt);
      s.x += s.vx * dt;
      s.z += s.vz * dt;
      keepInsideBoards(s, 14);
      continue;
    }

    let moveX = 0;
    let moveZ = 0;
    let maxSpeed = 160;
    let hustle = false;

    if (s.team === 'HOME' && s.isControlled) {
      if (keysHeld['KeyW'] || keysHeld['ArrowUp'])    moveZ -= 1;
      if (keysHeld['KeyS'] || keysHeld['ArrowDown'])  moveZ += 1;
      if (keysHeld['KeyA'] || keysHeld['ArrowLeft'])  moveX -= 1;
      if (keysHeld['KeyD'] || keysHeld['ArrowRight']) moveX += 1;
      if (keysHeld['KeyH'] || keysHeld['ShiftLeft'] || keysHeld['ShiftRight']) hustle = true;

      if (Math.hypot(padState.moveX, padState.moveZ) > 0.01) {
        moveX = padState.moveX;
        moveZ = padState.moveZ;
      } else {
        let len = Math.hypot(moveX, moveZ);
        if (len > 0) {
          moveX /= len;
          moveZ /= len;
        }
      }
      if (padState.hustle) hustle = true;

      maxSpeed = hustle ? 198 : 166;
      if (game.fullPressureTeam === 'HOME') maxSpeed *= 1.07;
      if (game.fullPressureTeam === 'AWAY') maxSpeed *= 0.91;
    } else {
      if (s.reactionTimer > 0) s.reactionTimer -= dt;
      let target = computeAITarget(s);
      let dx = target.x - s.x;
      let dz = target.z - s.z;
      let dist = Math.hypot(dx, dz);
      if (dist > 8) {
        moveX = dx / dist;
        moveZ = dz / dist;
      }

      let baseAI = s.team === 'HOME' ? 154 : 154 * aiDiffScale;
      if (game.fullPressureTeam === s.team) baseAI *= 1.06;
      if (game.fullPressureTeam && game.fullPressureTeam !== s.team) baseAI *= 0.88;
      maxSpeed = baseAI;

      if (puck.owner === s && s.reactionTimer <= 0) {
        let enemyGoalZ = s.team === 'HOME' ? -GOAL_Z : GOAL_Z;
        let distToGoal = Math.hypot(s.x, enemyGoalZ - s.z);

        if (distToGoal < 195 && Math.abs(s.x) < 135 && random() < dt * (s.team === 'AWAY' ? aiDiffScale * 1.65 : 1.5)) {
          let aimX = random(-NET_W * 0.44, NET_W * 0.44);
          let sdx = aimX - s.x;
          let sdz = enemyGoalZ - s.z;
          let slen = Math.hypot(sdx, sdz) || 1;
          shootPuck(s, sdx / slen, sdz / slen, random(0.45, 0.85));
        } else if (cfg.mode !== 'SHOOTOUT' && random() < dt * 0.65) {
          let mate = findBestPassTarget(s);
          if (mate && ((s.team === 'HOME' && mate.z < s.z - 40) || (s.team === 'AWAY' && mate.z > s.z + 40))) {
            passPuck(s, mate);
          }
        }
      } else if (puck.owner && puck.owner.team !== s.team && s.pokeCooldown <= 0) {
        let dCarrier = Math.hypot(puck.owner.x - s.x, puck.owner.z - s.z);
        if (dCarrier < 21 && random() < dt * (cfg.difficulty === 'ROOKIE' ? 0.65 : (cfg.difficulty === 'PRO' ? 1.1 : 1.7))) {
          performPokeCheck(s);
        }
      }
    }

    let accel = (s.team === 'HOME' && s.isControlled) ? 10.0 : 6.8;
    s.vx += (moveX * maxSpeed - s.vx) * Math.min(1, accel * dt);
    s.vz += (moveZ * maxSpeed - s.vz) * Math.min(1, accel * dt);

    s.x += s.vx * dt;
    s.z += s.vz * dt;
    keepInsideBoards(s, 14);

    let spd = Math.hypot(s.vx, s.vz);
    if (spd > 8) {
      let desiredFacing = Math.atan2(s.vx, s.vz);
      let diff = normalizeAngle(desiredFacing - s.facing);
      s.facing += diff * Math.min(1, 12.5 * dt);
      s.stridePhase += dt * (spd * 0.075);
    }

    if (puck.owner === s) {
      let dekeOffset = s.dekeTimer > 0 ? Math.sin((0.48 - s.dekeTimer) * 13) * 17 * s.dekeDir : 0;
      let fwdX = Math.sin(s.facing);
      let fwdZ = Math.cos(s.facing);
      let rightX = Math.cos(s.facing);
      let rightZ = -Math.sin(s.facing);

      puck.x = s.x + fwdX * 15 + rightX * (6 + dekeOffset);
      puck.z = s.z + fwdZ * 15 + rightZ * (6 + dekeOffset);
      puck.y = -2.5;
      puck.vx = s.vx;
      puck.vz = s.vz;
      puck.vy = 0;
      puck.lastTouchTeam = s.team;
    } else if (!puck.owner && s.pickupLockout <= 0) {
      let distToPuck = Math.hypot(puck.x - s.x, puck.z - s.z);
      let puckSpeed = Math.hypot(puck.vx, puck.vz);
      let isDesignatedReceiver = (puck.passTimer > 0 && puck.passTarget === s);
      let pickupRadius = isDesignatedReceiver ? 28 : 18;
      let maxCatchSpeed = isDesignatedReceiver ? 540 : 390;

      if (distToPuck < pickupRadius && puck.y > -12 && puckSpeed < maxCatchSpeed) {
        if (cfg.mode === 'SHOOTOUT') {
          let activeShooterId = game.shootoutTurn === 'HOME' ? 'H0' : 'A0';
          if (s.id !== activeShooterId) continue;
        }
        puck.owner = s;
        puck.lastTouchTeam = s.team;
        if (isDesignatedReceiver) {
          playStickImpact(0.3);
        }
        puck.passTarget = null;
        puck.passTimer = 0;
        s.reactionTimer = 0.25;
        if (s.team === 'HOME') setControlledSkater(s);
      }
    }
  }
}

function computeAITarget(s) {
  let attackDir = s.team === 'HOME' ? -1 : 1;

  if (puck.owner === s) {
    let laneX = s.role === 'LW' ? -55 : (s.role === 'RW' ? 55 : Math.sin(millis() * 0.002 + s.number) * 35);
    return { x: laneX, z: attackDir * 255 };
  }

  if (puck.owner && puck.owner.team === s.team) {
    let carrier = puck.owner;
    let zLead = Math.max(-310, Math.min(310, carrier.z + attackDir * 85));
    let xSpread = s.role === 'LW' ? -115 : (s.role === 'RW' ? 115 : (s.role === 'LD' ? -75 : (s.role === 'RD' ? 75 : 0)));
    return { x: xSpread, z: zLead };
  }

  let teammates = skaters.filter(m => m.team === s.team && m.stunTimer <= 0);
  let targetObj = puck.owner || puck;
  let closest = teammates[0] || s;
  let bestD = Infinity;
  for (let m of teammates) {
    let d = Math.hypot(m.x - targetObj.x, m.z - targetObj.z);
    if (d < bestD) { bestD = d; closest = m; }
  }

  if (s === closest) {
    return { x: targetObj.x, z: targetObj.z };
  }

  let defZ = s.team === 'HOME' ? Math.max(40, targetObj.z + 95) : Math.min(-40, targetObj.z - 95);
  defZ = Math.max(-320, Math.min(320, defZ));
  let xLane = s.homePos.x * 0.75 + targetObj.x * 0.25;
  return { x: xLane, z: defZ };
}

function updateGoalies(dt) {
  const goalieSpeed = cfg.difficulty === 'ROOKIE' ? 68 : (cfg.difficulty === 'PRO' ? 84 : 102);

  for (let g of goalies) {
    if (g.saveTimer > 0) g.saveTimer = Math.max(0, g.saveTimer - dt);

    let creaseZ = g.team === 'HOME' ? GOAL_Z - 14 : -GOAL_Z + 14;
    let targetX = Math.max(-24, Math.min(24, puck.x * 0.36));
    let dx = targetX - g.x;
    let dz = creaseZ - g.z;

    g.vx = Math.max(-goalieSpeed, Math.min(goalieSpeed, dx * 4.2));
    g.vz = dz * 4.0;
    g.x += g.vx * dt;
    g.z += g.vz * dt;
    g.facing = Math.atan2(puck.x - g.x, puck.z - g.z);
  }
}

// ============================================================================
// PASSING, SHOOTING & ONE-TIMERS
// ============================================================================
function findBestPassTarget(passer) {
  let mates = skaters.filter(s => s.team === passer.team && s !== passer);
  if (mates.length === 0) return null;

  let aimX = Math.sin(passer.facing);
  let aimZ = Math.cos(passer.facing);
  let hasDirectionalInput = false;

  if (passer.team === 'HOME' && passer.isControlled) {
    if (Math.hypot(padState.moveX, padState.moveZ) > 0.1) {
      let l = Math.hypot(padState.moveX, padState.moveZ);
      aimX = padState.moveX / l;
      aimZ = padState.moveZ / l;
      hasDirectionalInput = true;
    } else {
      let ix = (keysHeld['KeyD'] || keysHeld['ArrowRight'] ? 1 : 0) - (keysHeld['KeyA'] || keysHeld['ArrowLeft'] ? 1 : 0);
      let iz = (keysHeld['KeyS'] || keysHeld['ArrowDown'] ? 1 : 0) - (keysHeld['KeyW'] || keysHeld['ArrowUp'] ? 1 : 0);
      if (ix !== 0 || iz !== 0) {
        let l = Math.hypot(ix, iz);
        aimX = ix / l;
        aimZ = iz / l;
        hasDirectionalInput = true;
      }
    }
  }

  let best = mates[0];
  let bestScore = -Infinity;
  for (let m of mates) {
    let dx = m.x - passer.x;
    let dz = m.z - passer.z;
    let dist = Math.hypot(dx, dz) || 1;
    let dot = (dx / dist) * aimX + (dz / dist) * aimZ;
    let dirWeight = hasDirectionalInput ? 180 : 95;
    let forwardBonus = passer.team === 'HOME' ? (-dz * 0.12) : (dz * 0.12);
    let score = dot * dirWeight + forwardBonus - dist * 0.08;
    if (score > bestScore) {
      bestScore = score;
      best = m;
    }
  }
  return best;
}

function passPuck(passer, target) {
  if (!passer || !target) return;
  let leadX = target.x + target.vx * 0.22;
  let leadZ = target.z + target.vz * 0.22;
  let dx = leadX - passer.x;
  let dz = leadZ - passer.z;
  let dist = Math.hypot(dx, dz) || 1;
  let dirX = dx / dist;
  let dirZ = dz / dist;
  let speed = Math.min(460, Math.max(295, dist * 1.65));

  passer.pickupLockout = 0.35;
  passer.shotAnim = 0.55;

  puck.owner = null;
  puck.passTarget = target;
  puck.passTimer = 1.25;
  puck.lastPasser = passer;
  puck.lastTouchTeam = passer.team;

  puck.x = passer.x + dirX * 16;
  puck.z = passer.z + dirZ * 16;
  puck.y = -2.5;
  puck.vx = dirX * speed;
  puck.vz = dirZ * speed;
  puck.vy = -2;

  playStickImpact(0.45);

  if (target.team === 'HOME') {
    setControlledSkater(target);
    game.oneTimerWindow = 1.05;
    game.oneTimerPlayer = target;
    game.actionBannerText = `PASS → #${target.number} ${target.name}`;
    game.actionBannerTimer = 0.95;
  }
}

function shootPuck(shooter, dirX, dirZ, power01, isOneTimer = false) {
  if (!shooter) return;
  let boost = 1.0;
  if (game.fullPressureTeam === shooter.team) boost *= 1.14;
  if (isOneTimer) boost *= 1.22;

  let speed = (395 + power01 * 240) * boost;

  puck.owner = null;
  puck.passTarget = null;
  puck.passTimer = 0;
  puck.lastShooter = shooter;
  puck.lastTouchTeam = shooter.team;
  puck.vx = dirX * speed;
  puck.vz = dirZ * speed;
  puck.vy = -(16 + power01 * 24);

  shooter.shots++;
  shooter.shotAnim = 1.0;
  if (shooter.team === 'HOME') game.homeShots++;
  else game.awayShots++;

  game.chargingShot = false;
  game.shotCharge = 0;
  game.shotChargeSource = null;
  game.oneTimerWindow = 0;

  playShotSound(power01 > 0.55 || isOneTimer);
}

function getPlayerShotDirection(shooter) {
  let aimX = 0;
  if (Math.abs(padState.moveX) > 0.15) {
    aimX = padState.moveX * (NET_W * 0.44);
  } else {
    if (keysHeld['KeyA'] || keysHeld['ArrowLeft'])  aimX -= NET_W * 0.42;
    if (keysHeld['KeyD'] || keysHeld['ArrowRight']) aimX += NET_W * 0.42;
  }
  if (aimX === 0) aimX = random(-NET_W * 0.34, NET_W * 0.34);

  let dx = aimX - shooter.x;
  let dz = -GOAL_Z - shooter.z;
  let len = Math.hypot(dx, dz) || 1;
  return { x: dx / len, z: dz / len };
}

// ============================================================================
// 4-SUBSTEP PUCK PHYSICS, GOALPOSTS, SAVES & SWEPT GOAL-LINE DETECTION
// ============================================================================
function updatePuckPhysics(dt) {
  puck.trail.push({ x: puck.x, y: puck.y, z: puck.z });
  if (puck.trail.length > 10) puck.trail.shift();

  if (puck.owner) return;

  const substeps = 4;
  const subDt = dt / substeps;

  for (let step = 0; step < substeps; step++) {
    let prevX = puck.x;
    let prevZ = puck.z;

    puck.x += puck.vx * subDt;
    puck.z += puck.vz * subDt;
    puck.y += puck.vy * subDt;

    if (puck.y < -2.5) {
      puck.vy += 120 * subDt;
    } else {
      puck.y = -2.5;
      puck.vy = puck.vy > 12 ? -puck.vy * 0.35 : 0;
      let friction = Math.pow(0.76, subDt);
      puck.vx *= friction;
      puck.vz *= friction;
    }

    if (checkSweptGoalLine(prevX, prevZ, puck.x, puck.z)) return;
    collidePuckWithNets();
    if (checkGoalieSaves()) return;
    collidePuckWithBoards();
  }
}

function checkSweptGoalLine(x0, z0, x1, z1) {
  const halfOpening = NET_W / 2 - 2.5;

  if (z0 >= -GOAL_Z && z1 < -GOAL_Z && puck.y > -NET_H) {
    let t = (-GOAL_Z - z0) / (z1 - z0 || -0.0001);
    let crossX = x0 + (x1 - x0) * t;
    if (Math.abs(crossX) <= halfOpening) {
      puck.x = Math.max(-halfOpening + 4, Math.min(halfOpening - 4, crossX));
      puck.z = -GOAL_Z - 11;
      puck.y = -2.5;
      puck.vx *= 0.15;
      puck.vz = -18;
      handleGoalScored('HOME');
      return true;
    }
  }

  if (z0 <= GOAL_Z && z1 > GOAL_Z && puck.y > -NET_H) {
    let t = (GOAL_Z - z0) / (z1 - z0 || -0.0001);
    let crossX = x0 + (x1 - x0) * t;
    if (Math.abs(crossX) <= halfOpening) {
      puck.x = Math.max(-halfOpening + 4, Math.min(halfOpening - 4, crossX));
      puck.z = GOAL_Z + 11;
      puck.y = -2.5;
      puck.vx *= 0.15;
      puck.vz = 18;
      handleGoalScored('AWAY');
      return true;
    }
  }

  return false;
}

function collidePuckWithNets() {
  const postX = NET_W / 2;
  const nets = [{ z: -GOAL_Z, dir: -1 }, { z: GOAL_Z, dir: 1 }];

  for (let n of nets) {
    for (let sx of [-1, 1]) {
      let px = sx * postX;
      let pz = n.z;
      let dx = puck.x - px;
      let dz = puck.z - pz;
      let dist = Math.hypot(dx, dz);
      if (dist < 5.5 && puck.y > -NET_H) {
        let nx = dx / (dist || 1);
        let nz = dz / (dist || 1);
        puck.x = px + nx * 6.0;
        puck.z = pz + nz * 6.0;
        let dot = puck.vx * nx + puck.vz * nz;
        if (dot < 0) {
          puck.vx -= 1.85 * dot * nx;
          puck.vz -= 1.85 * dot * nz;
          playPostPing();
        }
      }
    }

    let minZ = n.dir === -1 ? n.z - NET_D : n.z;
    let maxZ = n.dir === -1 ? n.z : n.z + NET_D;
    if (puck.z >= minZ - 3 && puck.z <= maxZ + 3 && Math.abs(puck.x) <= postX + 3 && puck.y > -NET_H) {
      let backZ = n.z + n.dir * NET_D;
      if (Math.abs(puck.z - backZ) < 5) {
        puck.z = backZ + n.dir * 5.5;
        puck.vz = -puck.vz * 0.25;
        puck.vx *= 0.4;
      }
      if (Math.abs(Math.abs(puck.x) - postX) < 4.5 && Math.abs(puck.z - n.z) > 4) {
        let signX = puck.x >= 0 ? 1 : -1;
        puck.x = signX * (postX + 5.0);
        puck.vx = -puck.vx * 0.35;
      }
    }
  }
}

function checkGoalieSaves() {
  for (let g of goalies) {
    let dx = puck.x - g.x;
    let dz = puck.z - g.z;
    let dist = Math.hypot(dx, dz);
    let puckSpd = Math.hypot(puck.vx, puck.vz);

    let padRadius = cfg.difficulty === 'ROOKIE' ? 14.5 : (cfg.difficulty === 'PRO' ? 16.5 : 18.5);
    if (dist < padRadius && puck.y > -23 && puckSpd > 90) {
      let headingTowardNet = (g.team === 'AWAY' && puck.vz < 0) || (g.team === 'HOME' && puck.vz > 0);
      if (!headingTowardNet) continue;

      g.saves++;
      g.saveTimer = 0.65;
      g.saveDir = dx >= 0 ? 1 : -1;
      puck.passTarget = null;
      puck.passTimer = 0;
      playGoaliePadSave();

      if (puckSpd < 260 && random() < 0.25 && cfg.mode !== 'SHOOTOUT') {
        let def = skaters.find(s => s.team === g.team);
        if (def) {
          puck.x = g.x + (dx >= 0 ? 18 : -18);
          puck.z = g.z + (g.team === 'HOME' ? -18 : 18);
          puck.vx = (def.x - puck.x) * 1.6;
          puck.vz = (def.z - puck.z) * 1.6;
        }
      } else {
        let outZ = g.team === 'HOME' ? -1 : 1;
        let reboundAngle = (dx / padRadius) * 0.85 + random(-0.35, 0.35);
        let reboundSpd = puckSpd * 0.48;
        puck.vx = Math.sin(reboundAngle) * reboundSpd;
        puck.vz = outZ * Math.cos(reboundAngle) * reboundSpd;
        puck.vy = -8;
        puck.z = g.z + outZ * (padRadius + 4);
      }

      if (cfg.mode === 'SHOOTOUT') {
        advanceShootoutTurn();
        return true;
      }
      return false;
    }
  }
  return false;
}

function collidePuckWithBoards() {
  const halfW = RINK_W / 2 - 4;
  const halfL = RINK_L / 2 - 4;
  const r = CORNER_R - 4;

  let cx = Math.max(-(halfW - r), Math.min(halfW - r, puck.x));
  let cz = Math.max(-(halfL - r), Math.min(halfL - r, puck.z));
  let dx = puck.x - cx;
  let dz = puck.z - cz;
  let dist = Math.hypot(dx, dz);

  if (dist > r && dist > 0.001) {
    let nx = dx / dist;
    let nz = dz / dist;
    puck.x = cx + nx * r;
    puck.z = cz + nz * r;
    let dot = puck.vx * nx + puck.vz * nz;
    if (dot > 0) {
      puck.vx = (puck.vx - 1.65 * dot * nx) * 0.88;
      puck.vz = (puck.vz - 1.65 * dot * nz) * 0.88;
      if (Math.abs(dot) > 110) playBoardThump();
    }
  }
}

function keepInsideBoards(entity, margin) {
  const halfW = RINK_W / 2 - margin;
  const halfL = RINK_L / 2 - margin;
  const r = CORNER_R - margin;

  let cx = Math.max(-(halfW - r), Math.min(halfW - r, entity.x));
  let cz = Math.max(-(halfL - r), Math.min(halfL - r, entity.z));
  let dx = entity.x - cx;
  let dz = entity.z - cz;
  let dist = Math.hypot(dx, dz);

  if (dist > r && dist > 0.001) {
    let nx = dx / dist;
    let nz = dz / dist;
    entity.x = cx + nx * r;
    entity.z = cz + nz * r;
    let dot = entity.vx * nx + entity.vz * nz;
    if (dot > 0) {
      entity.vx -= dot * nx;
      entity.vz -= dot * nz;
    }
  }
}

function updatePuckInNet(dt) {
  puck.vx *= Math.pow(0.05, dt);
  puck.vz *= Math.pow(0.05, dt);
  puck.x += puck.vx * dt;
  puck.z += puck.vz * dt;
  puck.y = -2.5;
}

// ============================================================================
// IMMEDIATE "GOAL!" STOPPAGE, 3D CELLY & 85-CAP HAT TRICK CELEBRATION
// ============================================================================
function handleGoalScored(scoringTeam) {
  if (game.phase === 'GOAL_CELEBRATION') return;

  game.phase = 'GOAL_CELEBRATION';
  game.chargingShot = false;
  game.shotCharge = 0;
  game.shotChargeSource = null;
  game.pressure = 0;
  game.fullPressureTeam = null;
  game.fullPressureTimer = 0;

  let speedUnits = Math.hypot(puck.vx, puck.vz);
  game.lastShotMph = Math.round(Math.max(68, Math.min(108, 66 + speedUnits * 0.085)));

  if (scoringTeam === 'HOME') game.homeScore++;
  else game.awayScore++;

  if (cfg.mode === 'SHOOTOUT') {
    if (scoringTeam === 'HOME') game.shootoutHomeGoals++;
    else game.shootoutAwayGoals++;
  }

  let scorer = puck.lastShooter;
  if (!scorer || scorer.team !== scoringTeam) {
    scorer = skaters.find(s => s.team === scoringTeam);
  }
  scorer.goals++;

  if (puck.lastPasser && puck.lastPasser !== scorer && puck.lastPasser.team === scoringTeam) {
    puck.lastPasser.assists++;
  }

  game.lastScorer = scorer;
  game.lastScoringTeam = scoringTeam;
  game.goalLampTeam = scoringTeam;
  game.goalLampTimer = 5.5;

  game.isHatTrickGoal = (scorer.goals === 3);
  game.cellyDuration = game.isHatTrickGoal ? 6.0 : 4.5;
  game.phaseTimer = game.cellyDuration;

  scorer.cellyTimer = game.cellyDuration;
  let slideDirX = scorer.x > 0 ? -0.45 : 0.45;
  let slideDirZ = scoringTeam === 'HOME' ? 0.85 : -0.85;
  scorer.vx = slideDirX * 115;
  scorer.vz = slideDirZ * 115;
  scorer.facing = Math.atan2(scorer.vx, scorer.vz);

  spawnConfettiBurst(scorer.x, -45, scorer.z, scoringTeam, game.isHatTrickGoal ? 90 : 50);
  playGoalHornAndOrgan(game.isHatTrickGoal);

  if (game.isHatTrickGoal) {
    launchHatTrickHats(scoringTeam);
  }
}

function updateCelebrationSkaters(dt) {
  let scorer = game.lastScorer;
  if (!scorer) return;

  for (let s of skaters) {
    s.stunTimer = 0;
    s.hitTimer = 0;
    if (s === scorer) {
      s.cellyTimer = Math.max(0, s.cellyTimer - dt);
      s.vx *= Math.pow(0.28, dt);
      s.vz *= Math.pow(0.28, dt);
      s.x += s.vx * dt;
      s.z += s.vz * dt;
      keepInsideBoards(s, 18);
    } else if (s.team === scorer.team) {
      let idx = skaters.indexOf(s);
      let angle = idx * 1.4 + millis() * 0.001;
      let tx = scorer.x + Math.cos(angle) * 28;
      let tz = scorer.z + Math.sin(angle) * 28;
      let dx = tx - s.x;
      let dz = tz - s.z;
      let dist = Math.hypot(dx, dz);
      if (dist > 6) {
        s.vx = (dx / dist) * 145;
        s.vz = (dz / dist) * 145;
      } else {
        s.vx *= 0.85;
        s.vz *= 0.85;
      }
      s.x += s.vx * dt;
      s.z += s.vz * dt;
      s.facing = Math.atan2(scorer.x - s.x, scorer.z - s.z);
      s.stridePhase += dt * 10;
    } else {
      s.vx *= Math.pow(0.15, dt);
      s.vz *= Math.pow(0.15, dt);
      s.x += s.vx * dt;
      s.z += s.vz * dt;
    }
  }
}

function finishGoalCelebration() {
  if (cfg.mode === 'OT') { endGame(); return; }
  if (cfg.mode === 'SHOOTOUT') { advanceShootoutTurn(); return; }
  resetForFaceoff();
}

function handlePeriodHorn() {
  playGoalHorn(0.95);
  puck.owner = null;
  puck.vx *= 0.2;
  puck.vz *= 0.2;

  if (game.period < game.maxPeriods) {
    game.phase = 'PERIOD_END';
    game.phaseDuration = 4.2;
    game.phaseTimer = game.phaseDuration;
  } else if (game.homeScore === game.awayScore) {
    game.period = 4;
    game.maxPeriods = 4;
    game.clock = 120.0;
    game.phase = 'PERIOD_END';
    game.phaseDuration = 4.2;
    game.phaseTimer = game.phaseDuration;
  } else {
    endGame();
  }
}

function advanceShootoutTurn() {
  if (game.shootoutTurn === 'HOME') {
    game.shootoutTurn = 'AWAY';
    resetForFaceoff();
  } else if (game.shootoutRound >= 3 && game.shootoutHomeGoals !== game.shootoutAwayGoals) {
    endGame();
  } else {
    game.shootoutRound++;
    game.shootoutTurn = 'HOME';
    resetForFaceoff();
  }
}

// ============================================================================
// END OF GAME: THREE STARS OF THE GAME PRESENTATION
// ============================================================================
function endGame() {
  game.phase = 'GAME_OVER';
  puck.owner = null;
  puck.vx = 0;
  puck.vz = 0;

  const homeWon = game.homeScore >= game.awayScore;
  const allPlayers = [...skaters, ...goalies];

  const ranked = allPlayers.map(p => {
    let wonBonus = ((p.team === 'HOME' && homeWon) || (p.team === 'AWAY' && !homeWon)) ? 0.6 : 0;
    let score = 0;
    if (p.isGoalie) {
      let ga = p.team === 'HOME' ? game.awayScore : game.homeScore;
      let sa = p.team === 'HOME' ? game.awayShots : game.homeShots;
      let shutoutBonus = (ga === 0 && sa > 0) ? 3.5 : 0;
      score = p.saves * 0.24 + shutoutBonus + wonBonus;
    } else {
      score = p.goals * 3.0 + p.assists * 1.8 + p.shots * 0.22 + (p.hits || 0) * 0.15 + wonBonus;
    }
    return { player: p, score: score };
  }).sort((a, b) => b.score - a.score);

  const top3 = ranked.slice(0, 3).map(r => r.player);
  game.threeStars = [top3[2], top3[1], top3[0]];
  game.starStage = 0;
  game.starStageTimer = 2.8;

  for (let i = 0; i < allPlayers.length; i++) {
    let p = allPlayers[i];
    p.cellyTimer = 0;
    p.stunTimer = 0;
    p.hitTimer = 0;
    p.vx = 0;
    p.vz = 0;
    p.x = RINK_W / 2 - 22;
    p.z = (p.team === 'HOME' ? 75 : -75) + (i % 6) * 16 - 40;
    p.facing = -HALF_PI;
  }

  playGoalHornAndOrgan(false);
  spawnConfettiBurst(0, -60, 0, homeWon ? 'HOME' : 'AWAY', 75);
}

function advanceStarPresentation() {
  if (game.starStage < 3) {
    game.starStage++;
    game.starStageTimer = 3.0;
    if (game.starStage <= 2) {
      playStickImpact(0.65);
      let star = game.threeStars[game.starStage];
      if (star) {
        spawnConfettiBurst(star.x, -45, star.z, star.team, game.starStage === 2 ? 70 : 35);
      }
    }
  }
}

function updateThreeStarsPresentation(dt) {
  if (game.threeStars.length < 3) return;

  if (game.starStage < 3) {
    game.starStageTimer -= dt;
    if (game.starStageTimer <= 0) {
      advanceStarPresentation();
    }
  }

  const podiumSpots = [
    { x: -58, z: -12 }, // 3rd Star
    { x:  58, z: -12 }, // 2nd Star
    { x:   0, z:  16 }  // 1st Star
  ];

  for (let idx = 0; idx < 3; idx++) {
    let star = game.threeStars[idx];
    if (!star) continue;

    if (idx <= game.starStage) {
      let spot = podiumSpots[idx];
      let dx = spot.x - star.x;
      let dz = spot.z - star.z;
      let dist = Math.hypot(dx, dz);

      if (dist > 5) {
        star.vx = (dx / dist) * 135;
        star.vz = (dz / dist) * 135;
        star.x += star.vx * dt;
        star.z += star.vz * dt;
        star.facing = Math.atan2(star.vx, star.vz);
        star.stridePhase += dt * 9.5;
        star.cellyTimer = 0;
      } else {
        star.vx = 0;
        star.vz = 0;
        let diff = normalizeAngle(0 - star.facing);
        star.facing += diff * Math.min(1, 8 * dt);
        star.cellyTimer = 2.0;
      }
    }
  }
}

// ============================================================================
// 85-CAP 3D HAT TRICK SYSTEM
// ============================================================================
function launchHatTrickHats(scoringTeam) {
  const team = scoringTeam === 'HOME' ? TEAMS[cfg.homeIdx] : TEAMS[cfg.awayIdx];
  const palette = [team.primary, team.secondary, team.accent, [25, 28, 36], [245, 245, 245], [215, 38, 56]];

  for (let i = 0; i < 85; i++) {
    let fromLeftStand = random() < 0.5;
    let startX = fromLeftStand ? -(RINK_W / 2 + random(25, 85)) : (RINK_W / 2 + random(25, 85));
    let startY = -BOARD_H - random(35, 115);
    let startZ = random(-310, 310);

    let targetX = random(-155, 155);
    let targetZ = random(-275, 275);
    let flightTime = random(0.85, 1.45);
    let gravity = 310;

    hats.push({
      x: startX, y: startY, z: startZ,
      vx: (targetX - startX) / flightTime,
      vy: (-2.2 - startY - 0.5 * gravity * flightTime * flightTime) / flightTime,
      vz: (targetZ - startZ) / flightTime,
      rx: random(TWO_PI), ry: random(TWO_PI), rz: random(TWO_PI),
      vrx: random(-9, 9), vry: random(-9, 9), vrz: random(-9, 9),
      color: palette[Math.floor(random(palette.length))],
      brimColor: palette[Math.floor(random(palette.length))],
      settled: false
    });
  }
}

function updateHats(dt) {
  const gravity = 310;
  for (let h of hats) {
    if (h.settled) continue;
    h.vy += gravity * dt;
    h.x += h.vx * dt;
    h.y += h.vy * dt;
    h.z += h.vz * dt;
    h.rx += h.vrx * dt;
    h.ry += h.vry * dt;
    h.rz += h.vrz * dt;

    if (h.y > -BOARD_H) keepInsideBoards(h, 12);

    if (h.y >= -2.2) {
      h.y = -2.2;
      if (h.vy > 48) {
        h.vy = -h.vy * 0.28;
        h.vx *= 0.65;
        h.vz *= 0.65;
        h.vrx *= 0.4;
        h.vrz *= 0.4;
      } else {
        h.vy = 0;
        h.rx = 0;
        h.rz = 0;
        h.vrx = 0;
        h.vrz = 0;
        h.vx *= Math.pow(0.18, dt);
        h.vz *= Math.pow(0.18, dt);
        h.vry *= Math.pow(0.25, dt);
        if (Math.hypot(h.vx, h.vz) < 2) h.settled = true;
      }
    }
  }
}

function clearIceHats() {
  hats = [];
}

function spawnConfettiBurst(cx, cy, cz, teamKey, count) {
  const team = teamKey === 'HOME' ? TEAMS[cfg.homeIdx] : TEAMS[cfg.awayIdx];
  const cols = [team.primary, team.secondary, [255, 215, 0], [255, 255, 255]];
  for (let i = 0; i < count; i++) {
    confetti.push({
      x: cx + random(-35, 35),
      y: cy - random(20, 95),
      z: cz + random(-35, 35),
      vx: random(-85, 85),
      vy: random(-95, -15),
      vz: random(-85, 85),
      rot: random(TWO_PI),
      vrot: random(-8, 8),
      color: cols[Math.floor(random(cols.length))],
      life: random(2.4, 4.2)
    });
  }
}

function updateConfetti(dt) {
  for (let i = confetti.length - 1; i >= 0; i--) {
    let c = confetti[i];
    c.life -= dt;
    if (c.life <= 0) { confetti.splice(i, 1); continue; }
    c.vy += 95 * dt;
    c.x += c.vx * dt;
    c.y += c.vy * dt;
    c.z += c.vz * dt;
    c.rot += c.vrot * dt;
    if (c.y > -2) { c.y = -2; c.vx *= 0.6; c.vz *= 0.6; }
  }
}

// ============================================================================
// CAMERA CONTROLLER
// ============================================================================
function updateCamera(dt) {
  let tx, ty, tz, lx, ly, lz;

  if (game.phase === 'MENU') {
    let a = millis() * 0.00025;
    tx = Math.sin(a) * 380;
    ty = -255;
    tz = Math.cos(a) * 540;
    lx = 0; ly = -15; lz = 0;
  } else if (game.phase === 'GOAL_CELEBRATION' && game.lastScorer) {
    let elapsed = game.cellyDuration - game.phaseTimer;
    let orbitAngle = elapsed * 1.15 + 0.4;
    let radius = game.isHatTrickGoal ? 115 : 88;
    tx = game.lastScorer.x + Math.sin(orbitAngle) * radius;
    ty = -36;
    tz = game.lastScorer.z + Math.cos(orbitAngle) * radius;
    lx = game.lastScorer.x;
    ly = -18;
    lz = game.lastScorer.z;
  } else if (game.phase === 'PERIOD_END') {
    let progress = 1 - Math.max(0, game.phaseTimer / (game.phaseDuration || 4.2));
    let sweepAngle = -0.55 + progress * 1.1;
    tx = Math.sin(sweepAngle) * 260;
    ty = -145;
    tz = Math.cos(sweepAngle) * 290;
    lx = 55;
    ly = -16;
    lz = 0;
  } else if (game.phase === 'GAME_OVER') {
    if (game.starStage <= 1 && game.threeStars[game.starStage]) {
      let star = game.threeStars[game.starStage];
      tx = star.x * 0.65;
      ty = -44;
      tz = star.z + 115;
      lx = star.x;
      ly = -20;
      lz = star.z;
    } else {
      tx = 0;
      ty = -56;
      tz = 155;
      lx = 0;
      ly = -20;
      lz = 0;
    }
  } else if (game.cameraMode === 'BROADCAST') {
    tx = 295; ty = -250; tz = puck.z * 0.55;
    lx = puck.x * 0.35; ly = -10; lz = puck.z * 0.72;
  } else {
    tx = puck.x * 0.52; ty = -255; tz = puck.z * 0.68 + 275;
    lx = puck.x * 0.45; ly = -12; lz = puck.z * 0.85 - 55;
  }

  let smooth = Math.min(1, 6.8 * dt);
  camPos.x += (tx - camPos.x) * smooth;
  camPos.y += (ty - camPos.y) * smooth;
  camPos.z += (tz - camPos.z) * smooth;
  camLook.x += (lx - camLook.x) * smooth;
  camLook.y += (ly - camLook.y) * smooth;
  camLook.z += (lz - camLook.z) * smooth;

  camera(camPos.x, camPos.y, camPos.z, camLook.x, camLook.y, camLook.z, 0, 1, 0);
}

// ============================================================================
// SEAMLESS CONTINUOUS ROUND BOARDS & 3D ARENA RENDERING
// ============================================================================
function renderArenaScene() {
  background(7, 13, 28);

  ambientLight(135, 146, 165);
  directionalLight(245, 250, 255, 0.25, 0.9, -0.35);

  if (game.goalLampTimer > 0 && Math.sin(millis() * 0.025) > 0) {
    let lampZ = game.goalLampTeam === 'HOME' ? -GOAL_Z : GOAL_Z;
    pointLight(255, 25, 35, 0, -90, lampZ);
  }

  drawArenaBowlAndFans();

  push();
  rotateX(HALF_PI);
  noStroke();
  texture(iceTexture);
  plane(RINK_W, RINK_L);
  pop();

  drawDasherBoards();
  drawHockeyNet(-GOAL_Z, -1, game.goalLampTimer > 0 && game.goalLampTeam === 'HOME');
  drawHockeyNet(GOAL_Z, 1, game.goalLampTimer > 0 && game.goalLampTeam === 'AWAY');

  if (game.phase !== 'GAME_OVER') {
    drawPuckAndTrail();
  }

  if (game.phase === 'GAME_OVER') {
    drawThreeStarsSpotlights();
  }

  for (let g of goalies) drawGoalie(g);
  for (let s of skaters) drawSkater(s);

  drawIceHats();
  drawConfetti();
  drawProtectiveGlass();
}

function drawThreeStarsSpotlights() {
  if (game.threeStars.length < 3) return;
  noStroke();
  for (let idx = 0; idx < 3; idx++) {
    if (idx > game.starStage) continue;
    let star = game.threeStars[idx];
    if (!star) continue;
    let isFirstStar = (idx === 2);
    let r = isFirstStar ? 255 : 100;
    let g = isFirstStar ? 215 : 215;
    let b = isFirstStar ? 65 : 255;

    push();
    translate(star.x, -0.6, star.z);
    rotateX(HALF_PI);
    fill(r, g, b, 135);
    ellipse(0, 0, isFirstStar ? 34 : 26, isFirstStar ? 34 : 26);
    pop();

    push();
    translate(star.x, -95, star.z);
    fill(r, g, b, isFirstStar ? 36 : 24);
    cylinder(isFirstStar ? 18 : 13, 190, 12, 1);
    pop();
  }
}

function drawArenaBowlAndFans() {
  const homeTeam = TEAMS[cfg.homeIdx];
  const awayTeam = TEAMS[cfg.awayIdx];

  push();
  translate(0, 6, 0);
  noStroke();
  fill(22, 30, 48);
  box(RINK_W + 440, 10, RINK_L + 440);
  pop();

  for (let side of [-1, 1]) {
    for (let tier = 0; tier < 3; tier++) {
      push();
      translate(side * (RINK_W / 2 + 54 + tier * 42), -14 - tier * 14, 0);
      noStroke();
      fill(28 + tier * 5, 38 + tier * 6, 58 + tier * 7);
      box(40, 28 + tier * 28, RINK_L + 60);
      pop();
    }
  }

  for (let b = 0; b < 2; b++) {
    let bz = b === 0 ? -95 : 95;
    let bTeam = b === 0 ? awayTeam : homeTeam;
    push();
    translate(RINK_W / 2 + 18, -14, bz);
    noStroke();
    fill(bTeam.primary[0], bTeam.primary[1], bTeam.primary[2]);
    box(26, 26, 130);
    pop();
  }

  let cheerBoost = (game.phase === 'GOAL_CELEBRATION' || game.phase === 'GAME_OVER') ? 10 : 2.5;
  let t = millis() * 0.008;
  noStroke();
  for (let f of fans) {
    let bounce = Math.abs(Math.sin(t + f.phase)) * cheerBoost;
    let col = f.colorType < 0.55 ? homeTeam.primary : (f.colorType < 0.8 ? homeTeam.secondary : awayTeam.primary);
    push();
    translate(f.x, f.y - bounce, f.z);
    fill(col[0], col[1], col[2]);
    box(13, 18, 13);
    pop();
  }
}

function drawContinuousRibbon(offsetOut, yBottom, yTop) {
  beginShape(TRIANGLE_STRIP);
  for (let i = 0; i <= rinkLoop.length; i++) {
    let pt = rinkLoop[i % rinkLoop.length];
    let x = pt.x + pt.nx * offsetOut;
    let z = pt.z + pt.nz * offsetOut;
    vertex(x, yTop, z);
    vertex(x, yBottom, z);
  }
  endShape();
}

function drawDasherBoards() {
  const boardThick = 5.5;
  noStroke();

  fill(244, 247, 252);
  drawContinuousRibbon(0, 0, -BOARD_H);
  fill(222, 228, 238);
  drawContinuousRibbon(boardThick, 0, -BOARD_H);

  fill(242, 194, 48);
  drawContinuousRibbon(-0.15, 0, -4.2);

  fill(205, 22, 42);
  beginShape(TRIANGLE_STRIP);
  for (let i = 0; i <= rinkLoop.length; i++) {
    let pt = rinkLoop[i % rinkLoop.length];
    vertex(pt.x - pt.nx * 0.3, -BOARD_H - 0.6, pt.z - pt.nz * 0.3);
    vertex(pt.x + pt.nx * (boardThick + 0.3), -BOARD_H - 0.6, pt.z + pt.nz * (boardThick + 0.3));
  }
  endShape();
}

function drawProtectiveGlass() {
  noStroke();
  fill(185, 228, 255, 50);
  drawContinuousRibbon(2.75, -BOARD_H, -BOARD_H - GLASS_H);
}

function drawHockeyNet(zLine, backDir, lampFlashing) {
  const halfW = NET_W / 2;
  const backZ = zLine + backDir * NET_D;

  push();
  noStroke();
  fill(215, 20, 38);

  for (let sx of [-1, 1]) {
    push();
    translate(sx * halfW, -NET_H / 2, zLine);
    cylinder(2.2, NET_H, 8, 1);
    pop();
  }

  push();
  translate(0, -NET_H, zLine);
  rotateZ(HALF_PI);
  cylinder(2.2, NET_W + 3, 8, 1);
  pop();

  push();
  translate(0, -1.5, backZ);
  rotateZ(HALF_PI);
  cylinder(1.8, NET_W * 0.88, 8, 1);
  pop();

  fill(245, 250, 255, 110);
  push();
  translate(0, -NET_H / 2, backZ);
  box(NET_W * 0.92, NET_H, 1.5);
  pop();
  push();
  translate(0, -NET_H, zLine + backDir * (NET_D * 0.45));
  box(NET_W * 0.94, 1.5, NET_D * 0.85);
  pop();
  for (let sx of [-1, 1]) {
    push();
    translate(sx * halfW * 0.95, -NET_H / 2, zLine + backDir * (NET_D * 0.5));
    box(1.5, NET_H, NET_D);
    pop();
  }

  let lampActive = lampFlashing && Math.sin(millis() * 0.03) > 0;
  push();
  translate(0, -BOARD_H - 12, zLine + backDir * 44);
  if (lampActive) {
    emissiveMaterial(255, 25, 35);
    fill(255, 45, 55);
  } else {
    fill(110, 18, 25);
  }
  cylinder(4.5, 10, 8, 1);
  pop();

  pop();
}

function drawPuckAndTrail() {
  let spd = Math.hypot(puck.vx, puck.vz);
  if (spd > 240 && puck.trail.length > 2) {
    noStroke();
    for (let i = 0; i < puck.trail.length - 1; i++) {
      let pt = puck.trail[i];
      push();
      translate(pt.x, pt.y, pt.z);
      fill(65, 185, 255, (i / puck.trail.length) * 110);
      box(4.2, 1.6, 4.2);
      pop();
    }
  }

  push();
  translate(puck.x, puck.y, puck.z);
  noStroke();
  fill(16, 18, 24);
  cylinder(3.8, 2.2, 10, 1);
  pop();
}

function drawGoalie(g) {
  const team = g.team === 'HOME' ? TEAMS[cfg.homeIdx] : TEAMS[cfg.awayIdx];
  let slideLean = g.saveTimer > 0 ? g.saveDir * 0.35 : 0;
  let isStarSalute = (g.cellyTimer > 0);

  push();
  translate(g.x, g.y, g.z);
  rotateY(g.facing);
  rotateZ(slideLean);
  noStroke();

  for (let sx of [-1, 1]) {
    push();
    translate(sx * 5.2, -9, 1.5);
    fill(245, 248, 252);
    box(5.6, 17, 5.2);
    pop();
  }

  push();
  translate(0, -23, 0);
  fill(team.primary[0], team.primary[1], team.primary[2]);
  box(15, 14, 9);
  translate(0, 2, 0);
  fill(team.secondary[0], team.secondary[1], team.secondary[2]);
  box(15.4, 3.2, 9.4);
  pop();

  if (g.jerseyTex) {
    push();
    translate(0, -23, -4.8);
    rotateY(PI);
    texture(g.jerseyTex);
    plane(14.2, 13.4);
    pop();
  }

  push();
  translate(0, -33.5, 0.5);
  fill(248, 250, 255);
  sphere(5.2, 8, 6);
  pop();

  push();
  translate(-9, -12, 6);
  if (isStarSalute) {
    translate(0, -10, 0);
    rotateZ(-0.65 + Math.sin(millis() * 0.015) * 0.25);
  } else {
    rotateZ(0.35);
  }
  fill(210, 170, 115);
  box(2.2, 16, 4.5);
  pop();

  pop();
}

function drawSkater(s) {
  const team = s.team === 'HOME' ? TEAMS[cfg.homeIdx] : TEAMS[cfg.awayIdx];
  let isKneeSlide = (s.cellyTimer > 0 && game.phase === 'GOAL_CELEBRATION' && (game.cellyDuration - s.cellyTimer) < 1.65);
  let isStickPump = (s.cellyTimer > 0 && !isKneeSlide);
  let stride = Math.sin(s.stridePhase) * 0.52;

  push();
  translate(s.x, s.y + (isKneeSlide ? 7 : 0), s.z);
  rotateY(s.facing);

  // Body check lunge lean or stunned stumble tilt
  if (s.stunTimer > 0) {
    rotateX(-0.55 * (s.stunTimer / 1.15));
  } else if (s.hitTimer > 0) {
    rotateX(0.32);
    rotateY(0.28);
  }

  if (s.team === 'HOME' && s.isControlled && game.phase === 'PLAYING') {
    push();
    translate(0, -0.5, 0);
    rotateX(HALF_PI);
    noFill();
    stroke(60, 215, 255, 215);
    strokeWeight(2.5);
    ellipse(0, 0, 24, 24);
    pop();
  }

  noStroke();

  for (let side of [-1, 1]) {
    push();
    let legRot = isKneeSlide ? (side === -1 ? 1.15 : -0.95) : side * stride;
    translate(side * 3.4, -14, 0);
    rotateX(legRot);
    translate(0, 5.5, 0);
    fill(team.primary[0], team.primary[1], team.primary[2]);
    box(3.8, 11, 4.2);
    translate(0, 6.8, 0.8);
    fill(22, 24, 30);
    box(3.6, 3.4, 7.0);
    pop();
  }

  push();
  translate(0, -16.5, 0);
  fill(20, 22, 30);
  box(10.8, 6.5, 7.4);
  pop();

  push();
  translate(0, -24.5, 0);
  fill(team.primary[0], team.primary[1], team.primary[2]);
  box(11.6, 11.5, 7.6);
  translate(0, 1.5, 0);
  fill(team.secondary[0], team.secondary[1], team.secondary[2]);
  box(12.0, 2.6, 8.0);
  pop();

  if (s.jerseyTex) {
    push();
    translate(0, -24.5, -4.1);
    rotateY(PI);
    texture(s.jerseyTex);
    plane(11.2, 11.2);
    pop();
  }

  push();
  translate(0, -34, 0);
  fill(team.primary[0], team.primary[1], team.primary[2]);
  sphere(4.6, 8, 6);
  pop();

  let pokeReachZ = s.pokeTimer > 0 ? Math.sin((0.28 - s.pokeTimer) / 0.28 * PI) * 14 : 0;
  let stickLift = isStickPump ? -1.45 + Math.sin(millis() * 0.018) * 0.35 : (isKneeSlide ? -1.1 : -s.shotAnim * 0.9);

  push();
  translate(6.2, -26, 2 + pokeReachZ);
  rotateX(stickLift + (s.pokeTimer > 0 ? 0.35 : 0));

  translate(-1.5, 11, 7.5);
  rotateX(0.58);
  fill(34, 38, 46);
  box(1.3, 25, 1.5);
  translate(-2.2, 12.5, 2.2);
  rotateY(0.45);
  fill(18, 20, 25);
  box(6.8, 2.4, 1.2);
  pop();

  if (s.pokeTimer > 0) {
    push();
    translate(0, -2, 22 + pokeReachZ * 0.6);
    rotateX(HALF_PI);
    fill(140, 230, 255, 160);
    ellipse(0, 0, 18, 10);
    pop();
  }

  if (s.hitTimer > 0) {
    push();
    translate(0, -18, 14);
    rotateX(HALF_PI);
    fill(251, 191, 36, 150);
    ellipse(0, 0, 22, 14);
    pop();
  }

  pop();
}

function drawIceHats() {
  if (hats.length === 0) return;
  noStroke();
  for (let h of hats) {
    push();
    translate(h.x, h.y, h.z);
    rotateX(h.rx);
    rotateY(h.ry);
    rotateZ(h.rz);
    fill(h.color[0], h.color[1], h.color[2]);
    sphere(3.6, 6, 5);
    translate(0, 1.5, 3.2);
    fill(h.brimColor[0], h.brimColor[1], h.brimColor[2]);
    box(5.4, 0.7, 3.6);
    pop();
  }
}

function drawConfetti() {
  if (confetti.length === 0) return;
  noStroke();
  for (let c of confetti) {
    push();
    translate(c.x, c.y, c.z);
    rotateY(c.rot);
    fill(c.color[0], c.color[1], c.color[2]);
    box(3.2, 0.6, 2.0);
    pop();
  }
}

function normalizeAngle(a) {
  while (a > PI) a -= TWO_PI;
  while (a < -PI) a += TWO_PI;
  return a;
}

// ============================================================================
// PROCEDURAL WEB AUDIO API SOUND ENGINE
// ============================================================================
function initAudio() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) audioCtx = new AC();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function playBodyCheckSound() {
  if (game.muted || !audioCtx) return;
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(125, now);
  osc.frequency.exponentialRampToValueAtTime(34, now + 0.19);
  gain.gain.setValueAtTime(0.32, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.21);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + 0.22);
}

function playPokeCheckSound() {
  if (game.muted || !audioCtx) return;
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(580, now);
  osc.frequency.exponentialRampToValueAtTime(190, now + 0.09);
  gain.gain.setValueAtTime(0.18, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + 0.11);
}

function playRefereeWhistle() {
  if (game.muted || !audioCtx) return;
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const lfo = audioCtx.createOscillator();
  const lfoGain = audioCtx.createGain();
  const gain = audioCtx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(2850, now);
  lfo.frequency.setValueAtTime(34, now);
  lfoGain.gain.setValueAtTime(95, now);

  lfo.connect(lfoGain);
  lfoGain.connect(osc.frequency);

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.exponentialRampToValueAtTime(0.14, now + 0.04);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.48);

  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(now);
  lfo.start(now);
  osc.stop(now + 0.5);
  lfo.stop(now + 0.5);
}

function playStickImpact(vol = 0.5) {
  if (game.muted || !audioCtx) return;
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(320, now);
  osc.frequency.exponentialRampToValueAtTime(75, now + 0.08);
  gain.gain.setValueAtTime(vol * 0.25, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + 0.1);
}

function playShotSound(isSlapshot) {
  if (game.muted || !audioCtx) return;
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = isSlapshot ? 'sawtooth' : 'triangle';
  osc.frequency.setValueAtTime(isSlapshot ? 210 : 340, now);
  osc.frequency.exponentialRampToValueAtTime(55, now + (isSlapshot ? 0.22 : 0.12));
  gain.gain.setValueAtTime(isSlapshot ? 0.34 : 0.22, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + (isSlapshot ? 0.24 : 0.13));
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + 0.25);
}

function playPostPing() {
  if (game.muted || !audioCtx) return;
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(1680, now);
  osc.frequency.exponentialRampToValueAtTime(1590, now + 0.55);
  gain.gain.setValueAtTime(0.28, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.58);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + 0.6);
}

function playGoaliePadSave() {
  if (game.muted || !audioCtx) return;
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(140, now);
  osc.frequency.exponentialRampToValueAtTime(48, now + 0.14);
  gain.gain.setValueAtTime(0.26, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + 0.16);
}

function playBoardThump() {
  if (game.muted || !audioCtx) return;
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(110, now);
  osc.frequency.exponentialRampToValueAtTime(42, now + 0.11);
  gain.gain.setValueAtTime(0.18, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + 0.13);
}

function playGoalHorn(duration = 1.6) {
  if (game.muted || !audioCtx) return;
  const now = audioCtx.currentTime;
  const freqs = [146.83, 185.00, 220.00];
  for (let f of freqs) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(f, now);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.11, now + 0.08);
    gain.gain.setValueAtTime(0.11, now + duration - 0.18);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.05);
  }
}

function playGoalHornAndOrgan(isHatTrick) {
  playRefereeWhistle();
  setTimeout(() => playGoalHorn(isHatTrick ? 2.1 : 1.5), 240);
  if (game.muted || !audioCtx) return;

  const notes = [293.66, 369.99, 440.00, 587.33, 440.00, 587.33];
  const times = [1.85, 2.02, 2.19, 2.38, 2.65, 2.86];
  const now = audioCtx.currentTime;
  for (let i = 0; i < notes.length; i++) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(notes[i], now + times[i]);
    gain.gain.setValueAtTime(0.06, now + times[i]);
    gain.gain.exponentialRampToValueAtTime(0.001, now + times[i] + 0.18);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now + times[i]);
    osc.stop(now + times[i] + 0.2);
  }
}

// ============================================================================
// DYNAMIC TV BROADCAST UI & SETUP OVERLAYS
// ============================================================================
function injectBroadcastUI() {
  const oldStyle = document.getElementById('nhl26-style');
  if (oldStyle) oldStyle.remove();
  const oldRoot = document.getElementById('nhl26-ui-root');
  if (oldRoot) oldRoot.remove();

  const style = document.createElement('style');
  style.id = 'nhl26-style';
  style.textContent = `
    #nhl26-ui-root {
      position: fixed; inset: 0; pointer-events: none;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #fff; user-select: none; z-index: 20;
    }
    .nhl-scorebug {
      position: absolute; top: 14px; left: 16px;
      display: flex; align-items: stretch;
      background: rgba(10, 16, 32, 0.92);
      border: 1px solid rgba(255,255,255,0.18);
      border-radius: 8px; overflow: hidden;
      box-shadow: 0 8px 24px rgba(0,0,0,0.5);
    }
    .nhl-sb-team {
      display: flex; align-items: center; gap: 10px;
      padding: 7px 13px; font-weight: 800; font-size: 15px; letter-spacing: 0.6px;
    }
    .nhl-sb-score { font-size: 21px; font-weight: 900; }
    .nhl-sb-clock {
      padding: 7px 13px; background: #141e38;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      border-left: 1px solid rgba(255,255,255,0.12);
      border-right: 1px solid rgba(255,255,255,0.12);
    }
    .nhl-sb-period { font-size: 10px; font-weight: 800; color: #f1be48; letter-spacing: 1px; }
    .nhl-sb-time { font-size: 17px; font-weight: 900; font-variant-numeric: tabular-nums; }
    .nhl-pressure-box {
      position: absolute; top: 14px; left: 50%; transform: translateX(-50%);
      background: rgba(10, 16, 32, 0.88);
      border: 1px solid rgba(255,255,255,0.16);
      border-radius: 999px; padding: 6px 14px;
      display: flex; align-items: center; gap: 10px;
      font-size: 11px; font-weight: 800; letter-spacing: 0.8px;
    }
    .nhl-pressure-bar {
      width: 110px; height: 7px; background: rgba(255,255,255,0.15);
      border-radius: 999px; overflow: hidden;
    }
    .nhl-pressure-fill {
      height: 100%; width: 0%; background: linear-gradient(90deg, #38bdf8, #f59e0b);
    }
    .nhl-top-controls {
      position: absolute; top: 14px; right: 16px;
      display: flex; gap: 8px; pointer-events: auto;
    }
    .nhl-pill-btn {
      background: rgba(10, 16, 32, 0.88); color: #e2e8f0;
      border: 1px solid rgba(255,255,255,0.22); border-radius: 6px;
      padding: 6px 11px; font-size: 11px; font-weight: 700; cursor: pointer;
    }
    .nhl-pill-btn:hover { background: rgba(30, 45, 82, 0.96); color: #fff; }
    .nhl-pad-badge {
      background: rgba(16, 185, 129, 0.2); color: #6ee7b7;
      border: 1px solid rgba(16, 185, 129, 0.45); border-radius: 6px;
      padding: 6px 10px; font-size: 11px; font-weight: 800;
      display: none;
    }
    .nhl-player-card {
      position: absolute; bottom: 16px; left: 16px;
      background: rgba(10, 16, 32, 0.9);
      border-left: 4px solid #38bdf8;
      border-radius: 6px; padding: 9px 14px;
    }
    .nhl-controls-hint {
      position: absolute; bottom: 16px; right: 16px;
      background: rgba(10, 16, 32, 0.82);
      border: 1px solid rgba(255,255,255,0.14);
      border-radius: 6px; padding: 7px 11px;
      font-size: 11px; color: #cbd5e1; line-height: 1.5; text-align: right;
    }
    .nhl-goal-banner {
      position: absolute; top: 24%; left: 50%; transform: translate(-50%, -50%);
      background: linear-gradient(135deg, rgba(12, 18, 36, 0.96), rgba(24, 34, 64, 0.96));
      border: 2px solid #f1be48; border-radius: 14px;
      padding: 20px 42px; text-align: center;
      box-shadow: 0 20px 60px rgba(0,0,0,0.75);
      display: none; pointer-events: auto;
    }
    .nhl-goal-title {
      font-size: 52px; font-weight: 950; letter-spacing: 3px;
      color: #fff; text-shadow: 0 4px 18px rgba(241, 190, 72, 0.65);
      line-height: 1.05;
    }
    .nhl-hat-badge {
      display: inline-block; margin-bottom: 6px; padding: 4px 14px;
      background: linear-gradient(90deg, #f59e0b, #fde047);
      color: #111827; font-weight: 900; font-size: 13px; letter-spacing: 1.4px;
      border-radius: 999px;
    }
    .nhl-period-banner {
      position: absolute; top: 22%; left: 50%; transform: translate(-50%, -50%);
      background: linear-gradient(135deg, rgba(10, 16, 34, 0.95), rgba(22, 33, 62, 0.95));
      border: 2px solid #38bdf8; border-radius: 14px;
      padding: 18px 38px; text-align: center;
      box-shadow: 0 20px 55px rgba(0,0,0,0.75);
      display: none; pointer-events: auto;
    }
    .nhl-stars-lowerthird {
      position: absolute; bottom: 84px; left: 50%; transform: translateX(-50%);
      width: min(560px, 90vw);
      background: linear-gradient(135deg, rgba(10, 16, 34, 0.96), rgba(26, 38, 70, 0.96));
      border: 2px solid #f1be48; border-radius: 12px;
      padding: 16px 26px; text-align: center;
      box-shadow: 0 18px 50px rgba(0,0,0,0.8);
      display: none; pointer-events: auto;
    }
    .nhl-modal-backdrop {
      position: absolute; inset: 0;
      background: radial-gradient(circle at center, rgba(10, 18, 38, 0.78), rgba(4, 8, 20, 0.92));
      display: flex; align-items: center; justify-content: center;
      pointer-events: auto;
    }
    .nhl-card {
      width: min(660px, 92vw);
      background: rgba(13, 21, 42, 0.96);
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 14px; padding: 24px 28px;
      box-shadow: 0 24px 64px rgba(0,0,0,0.75);
    }
    .nhl-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 14px; }
    .nhl-label { font-size: 11px; font-weight: 800; color: #94a3b8; letter-spacing: 1px; margin-bottom: 5px; }
    .nhl-select {
      width: 100%; padding: 10px 12px; border-radius: 8px;
      background: #1e293b; color: #fff; border: 1px solid rgba(255,255,255,0.2);
      font-weight: 700; font-size: 14px;
    }
    .nhl-start-btn {
      margin-top: 18px; width: 100%; padding: 14px;
      background: linear-gradient(90deg, #c8102e, #f1be48);
      color: #fff; font-size: 17px; font-weight: 900; letter-spacing: 1.2px;
      border: none; border-radius: 10px; cursor: pointer;
      text-shadow: 0 1px 3px rgba(0,0,0,0.5);
    }
    .nhl-start-btn:hover { filter: brightness(1.08); }
  `;
  document.head.appendChild(style);

  const root = document.createElement('div');
  root.id = 'nhl26-ui-root';
  root.innerHTML = `
    <div id="nhl-hud" style="display:none;">
      <div class="nhl-scorebug">
        <div class="nhl-sb-team" id="sb-away-box">
          <span id="sb-away-id">EDM</span>
          <span class="nhl-sb-score" id="sb-away-score">0</span>
        </div>
        <div class="nhl-sb-clock">
          <span class="nhl-sb-period" id="sb-period">1ST</span>
          <span class="nhl-sb-time" id="sb-time">2:00</span>
        </div>
        <div class="nhl-sb-team" id="sb-home-box">
          <span class="nhl-sb-score" id="sb-home-score">0</span>
          <span id="sb-home-id">CGY</span>
        </div>
      </div>

      <div class="nhl-pressure-box">
        <span id="nhl-pressure-label">ZONE PRESSURE</span>
        <div class="nhl-pressure-bar"><div class="nhl-pressure-fill" id="nhl-pressure-fill"></div></div>
      </div>

      <div class="nhl-top-controls">
        <div class="nhl-pad-badge" id="hud-pad-badge">🎮 PAD CONNECTED</div>
        <button class="nhl-pill-btn" id="btn-cam">CAM: DYNAMIC (C)</button>
        <button class="nhl-pill-btn" id="btn-mute">AUDIO: ON (M)</button>
        <button class="nhl-pill-btn" id="btn-menu">MENU</button>
      </div>

      <div class="nhl-player-card" id="nhl-player-card">
        <div style="font-size:11px;font-weight:800;color:#94a3b8;letter-spacing:0.8px;">ON ICE • <span id="hud-shots">SOG: 0 - 0</span></div>
        <div style="font-size:17px;font-weight:900;margin-top:2px;" id="hud-player-name">#11 HUBERDEAU</div>
        <div style="font-size:12px;color:#38bdf8;font-weight:700;margin-top:2px;" id="hud-shot-meter">READY</div>
      </div>

      <div class="nhl-controls-hint">
        <b>Pad:</b> L-Stick: Skate &nbsp;•&nbsp; <b>RT/R2:</b> Pass &nbsp;•&nbsp; <b>R-Stick:</b> Shoot / Deke &nbsp;•&nbsp; <b>A:</b> Hit &nbsp;•&nbsp; <b>B:</b> Switch &nbsp;•&nbsp; <b>RB:</b> Poke<br>
        <b>Keys:</b> WASD/Arrows: Skate &nbsp;•&nbsp; <b>Space:</b> Pass / Poke &nbsp;•&nbsp; <b>E:</b> Toe-Drag &nbsp;•&nbsp; <b>J/Click:</b> Shoot &nbsp;•&nbsp; <b>F:</b> Switch
      </div>
    </div>

    <div class="nhl-goal-banner" id="nhl-goal-banner">
      <div id="nhl-hat-badge" class="nhl-hat-badge" style="display:none;">🧢 HAT TRICK! • 3RD GOAL!</div>
      <div class="nhl-goal-title" id="nhl-goal-title">GOAL!</div>
      <div style="font-size:17px;font-weight:800;color:#f1be48;margin-top:6px;" id="nhl-goal-sub">#11 HUBERDEAU • 94 MPH</div>
      <div style="font-size:14px;color:#cbd5e1;margin-top:6px;" id="nhl-goal-scoreline">CGY 1 — 0 EDM</div>
      <div style="font-size:11px;color:#94a3b8;margin-top:10px;">Press SPACE / ENTER / CLICK / A to drop puck</div>
    </div>

    <div class="nhl-period-banner" id="nhl-period-banner">
      <div style="font-size:11px;font-weight:900;color:#38bdf8;letter-spacing:2px;">NHL 26 BROADCAST INTERMISSION</div>
      <div style="font-size:32px;font-weight:950;margin-top:4px;letter-spacing:1px;" id="nhl-period-title">END OF 1ST PERIOD</div>
      <div style="font-size:20px;font-weight:900;color:#f1be48;margin-top:6px;" id="nhl-period-score">EDM 0 — 1 CGY</div>
      <div style="font-size:12px;color:#cbd5e1;margin-top:6px;" id="nhl-period-sog">SHOTS ON GOAL: EDM 4 — 6 CGY</div>
      <div style="font-size:11px;color:#94a3b8;margin-top:10px;">Skating to benches • Press SPACE / A / CLICK to start next period</div>
    </div>

    <div class="nhl-stars-lowerthird" id="nhl-stars-lowerthird">
      <div style="font-size:12px;font-weight:900;color:#f1be48;letter-spacing:2px;" id="star-lt-rank">⭐ 3RD STAR OF THE GAME</div>
      <div style="font-size:28px;font-weight:950;margin-top:3px;letter-spacing:0.6px;" id="star-lt-name">#91 NAZEM KADRI (CGY)</div>
      <div style="font-size:14px;font-weight:700;color:#38bdf8;margin-top:4px;" id="star-lt-stats">1 GOAL, 1 ASSIST • 4 SOG</div>
      <div style="font-size:11px;color:#94a3b8;margin-top:8px;">Press SPACE / A / CLICK for next star</div>
    </div>

    <div class="nhl-modal-backdrop" id="nhl-setup-modal">
      <div class="nhl-card">
        <div style="font-size:12px;font-weight:900;color:#f1be48;letter-spacing:2px;">EA SPORTS INSPIRED • P5.JS WEBGL</div>
        <div style="font-size:30px;font-weight:950;letter-spacing:0.5px;margin-top:2px;">NHL 26 3D HOCKEY</div>

        <div class="nhl-grid-2">
          <div>
            <div class="nhl-label">HOME TEAM (YOU)</div>
            <select class="nhl-select" id="sel-home"></select>
          </div>
          <div>
            <div class="nhl-label">AWAY TEAM (CPU)</div>
            <select class="nhl-select" id="sel-away"></select>
          </div>
          <div>
            <div class="nhl-label">GAME MODE</div>
            <select class="nhl-select" id="sel-mode">
              <option value="PERIODS">3 Periods (Full Game)</option>
              <option value="OT">Sudden Death Overtime</option>
              <option value="SHOOTOUT">Penalty Shootout</option>
            </select>
          </div>
          <div>
            <div class="nhl-label">FORMAT & AI DIFFICULTY</div>
            <div style="display:flex;gap:8px;">
              <select class="nhl-select" id="sel-format">
                <option value="5v5">5v5 Classic</option>
                <option value="3v3">3v3 Fast</option>
              </select>
              <select class="nhl-select" id="sel-diff">
                <option value="ROOKIE">Rookie</option>
                <option value="PRO" selected>Pro</option>
                <option value="ALLSTAR">All-Star</option>
              </select>
            </div>
          </div>
        </div>

        <div id="setup-pad-status" style="font-size:12px;color:#94a3b8;margin-top:12px;">
          Keyboard + Mouse &amp; Plug-in USB/Bluetooth Controllers Supported
        </div>

        <button class="nhl-start-btn" id="btn-drop-puck">DROP THE PUCK</button>
      </div>
    </div>

    <div class="nhl-modal-backdrop" id="nhl-gameover-modal" style="display:none;">
      <div class="nhl-card" style="text-align:center;">
        <div style="font-size:12px;font-weight:900;color:#f1be48;letter-spacing:2px;">FINAL HORN • THREE STARS OF THE GAME</div>
        <div style="font-size:34px;font-weight:950;margin-top:4px;" id="go-winner">CALGARY WINS!</div>
        <div style="font-size:26px;font-weight:900;color:#38bdf8;margin:10px 0;" id="go-score">CGY 3 — 1 EDM</div>
        <div style="font-size:13px;color:#cbd5e1;line-height:1.8;margin-top:10px;" id="go-stars"></div>
        <button class="nhl-start-btn" id="btn-rematch">PLAY REMATCH</button>
      </div>
    </div>
  `;
  document.body.appendChild(root);

  const selHome = document.getElementById('sel-home');
  const selAway = document.getElementById('sel-away');
  TEAMS.forEach((t, idx) => {
    selHome.add(new Option(`${t.id} — ${t.name}`, idx, idx === cfg.homeIdx, idx === cfg.homeIdx));
    selAway.add(new Option(`${t.id} — ${t.name}`, idx, idx === cfg.awayIdx, idx === cfg.awayIdx));
  });

  document.getElementById('btn-drop-puck').onclick = () => {
    cfg.homeIdx = parseInt(selHome.value, 10);
    cfg.awayIdx = parseInt(selAway.value, 10);
    if (cfg.awayIdx === cfg.homeIdx) cfg.awayIdx = (cfg.homeIdx + 1) % TEAMS.length;
    cfg.mode = document.getElementById('sel-mode').value;
    cfg.format = document.getElementById('sel-format').value;
    cfg.difficulty = document.getElementById('sel-diff').value;
    document.getElementById('nhl-setup-modal').style.display = 'none';
    document.getElementById('nhl-gameover-modal').style.display = 'none';
    document.getElementById('nhl-stars-lowerthird').style.display = 'none';
    document.getElementById('nhl-hud').style.display = 'block';
    startNewMatch();
  };

  document.getElementById('btn-rematch').onclick = () => {
    document.getElementById('nhl-gameover-modal').style.display = 'none';
    document.getElementById('nhl-stars-lowerthird').style.display = 'none';
    startNewMatch();
  };

  document.getElementById('btn-menu').onclick = () => {
    game.phase = 'MENU';
    document.getElementById('nhl-hud').style.display = 'none';
    document.getElementById('nhl-goal-banner').style.display = 'none';
    document.getElementById('nhl-period-banner').style.display = 'none';
    document.getElementById('nhl-stars-lowerthird').style.display = 'none';
    document.getElementById('nhl-gameover-modal').style.display = 'none';
    document.getElementById('nhl-setup-modal').style.display = 'flex';
  };

  document.getElementById('btn-cam').onclick = () => {
    game.cameraMode = game.cameraMode === 'DYNAMIC' ? 'BROADCAST' : 'DYNAMIC';
    focusGameCanvas();
  };

  document.getElementById('btn-mute').onclick = () => {
    game.muted = !game.muted;
    focusGameCanvas();
  };
}

function formatStarStats(p) {
  if (p.isGoalie) {
    return `${p.saves} SAVES${p.goals > 0 ? `, ${p.goals}G` : ''}`;
  }
  return `${p.goals}G, ${p.assists}A • ${p.shots} SOG`;
}

function updateBroadcastHUD() {
  const setupPad = document.getElementById('setup-pad-status');
  if (setupPad) {
    if (padState.connected) {
      setupPad.style.color = '#6ee7b7';
      setupPad.textContent = `🎮 Controller Connected — Press START or A to Drop the Puck!`;
    } else {
      setupPad.style.color = '#94a3b8';
      setupPad.textContent = `Keyboard + Mouse & Plug-in USB/Bluetooth Controllers Supported (Press any controller button to activate)`;
    }
  }

  if (game.phase === 'MENU') return;

  const padBadge = document.getElementById('hud-pad-badge');
  if (padBadge) {
    padBadge.style.display = padState.connected ? 'block' : 'none';
  }

  const homeTeam = TEAMS[cfg.homeIdx];
  const awayTeam = TEAMS[cfg.awayIdx];

  document.getElementById('sb-home-id').textContent = homeTeam.id;
  document.getElementById('sb-away-id').textContent = awayTeam.id;
  document.getElementById('sb-home-score').textContent = game.homeScore;
  document.getElementById('sb-away-score').textContent = game.awayScore;
  document.getElementById('sb-home-box').style.borderBottom = `3px solid ${homeTeam.hex}`;
  document.getElementById('sb-away-box').style.borderBottom = `3px solid ${awayTeam.hex}`;

  let perTxt = cfg.mode === 'SHOOTOUT' ? `SO RD ${game.shootoutRound}` :
               (game.period === 4 ? 'OT' : (game.period === 1 ? '1ST' : (game.period === 2 ? '2ND' : '3RD')));
  document.getElementById('sb-period').textContent = perTxt;

  if (cfg.mode === 'SHOOTOUT') {
    document.getElementById('sb-time').textContent = game.shootoutTurn;
  } else {
    let mins = Math.floor(game.clock / 60);
    let secs = Math.floor(game.clock % 60);
    document.getElementById('sb-time').textContent = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  const pFill = document.getElementById('nhl-pressure-fill');
  const pLabel = document.getElementById('nhl-pressure-label');
  if (game.fullPressureTeam) {
    pLabel.textContent = `FULL PRESSURE (${game.fullPressureTeam})!`;
    pLabel.style.color = '#fde047';
    pFill.style.width = `${(game.fullPressureTimer / 14) * 100}%`;
  } else {
    pLabel.textContent = 'ZONE PRESSURE';
    pLabel.style.color = '#e2e8f0';
    pFill.style.width = `${Math.abs(game.pressure)}%`;
  }

  document.getElementById('btn-cam').textContent = `CAM: ${game.cameraMode} (C)`;
  document.getElementById('btn-mute').textContent = `AUDIO: ${game.muted ? 'OFF' : 'ON'} (M)`;

  let ctrl = getControlledSkater();
  if (ctrl) {
    let htBadge = ctrl.goals >= 3 ? ' 🧢 HAT TRICK' : '';
    document.getElementById('hud-player-name').textContent = `#${ctrl.number} ${ctrl.name}${htBadge}`;
    document.getElementById('hud-shots').textContent = `SOG: ${awayTeam.id} ${game.awayShots} - ${game.homeShots} ${homeTeam.id}`;

    let status = padState.connected
      ? 'DEFENDING • A: HIT | RB: POKE | B: SWITCH'
      : 'DEFENDING • SPACE: POKE CHECK | F: SWITCH';
    if (game.actionBannerTimer > 0) status = `🔥 ${game.actionBannerText}`;
    else if (game.chargingShot) status = `SLAP SHOT CHARGE: ${Math.round(game.shotCharge * 100)}%`;
    else if (game.oneTimerWindow > 0 && game.oneTimerPlayer === ctrl) {
      status = padState.connected ? '⚡ ONE-TIMER READY (FLICK R-STICK UP)!' : '⚡ ONE-TIMER READY (PRESS J / ENTER / CLICK)!';
    } else if (puck.owner === ctrl) {
      status = padState.connected
        ? 'PUCK CARRIER • RT: PASS | R-STICK: SHOOT / DEKE'
        : 'PUCK CARRIER • SPACE: PASS | E: TOE-DRAG | J: SHOOT';
    }
    document.getElementById('hud-shot-meter').textContent = status;
  }

  const goalBanner = document.getElementById('nhl-goal-banner');
  if (game.phase === 'GOAL_CELEBRATION' && game.lastScorer) {
    goalBanner.style.display = 'block';
    const scTeam = game.lastScoringTeam === 'HOME' ? homeTeam : awayTeam;
    document.getElementById('nhl-hat-badge').style.display = game.isHatTrickGoal ? 'inline-block' : 'none';
    document.getElementById('nhl-goal-title').textContent = `${scTeam.city} GOAL!`;
    document.getElementById('nhl-goal-sub').textContent = `#${game.lastScorer.number} ${game.lastScorer.name} (${game.lastScorer.goals}G) • ${game.lastShotMph} MPH`;
    document.getElementById('nhl-goal-scoreline').textContent = `${awayTeam.id} ${game.awayScore}  —  ${game.homeScore} ${homeTeam.id}`;
  } else {
    goalBanner.style.display = 'none';
  }

  const periodBanner = document.getElementById('nhl-period-banner');
  if (game.phase === 'PERIOD_END') {
    periodBanner.style.display = 'block';
    let titleTxt = game.period === 1 ? 'END OF 1ST PERIOD' :
                   (game.period === 2 ? 'END OF 2ND PERIOD' : 'END OF REGULATION — OVERTIME NEXT');
    document.getElementById('nhl-period-title').textContent = titleTxt;
    document.getElementById('nhl-period-score').textContent = `${awayTeam.id} ${game.awayScore}  —  ${game.homeScore} ${homeTeam.id}`;
    document.getElementById('nhl-period-sog').textContent = `SHOTS ON GOAL: ${awayTeam.id} ${game.awayShots}  —  ${game.homeShots} ${homeTeam.id}`;
  } else {
    periodBanner.style.display = 'none';
  }

  const starsLT = document.getElementById('nhl-stars-lowerthird');
  const goModal = document.getElementById('nhl-gameover-modal');

  if (game.phase === 'GAME_OVER') {
    if (game.starStage < 3 && game.threeStars[game.starStage]) {
      starsLT.style.display = 'block';
      goModal.style.display = 'none';

      let star = game.threeStars[game.starStage];
      let tId = star.team === 'HOME' ? homeTeam.id : awayTeam.id;
      let rankTxt = game.starStage === 0 ? '⭐ 3RD STAR OF THE GAME' :
                    (game.starStage === 1 ? '⭐⭐ 2ND STAR OF THE GAME' : '⭐⭐⭐ 1ST STAR OF THE GAME');
      let ht = star.goals >= 3 ? ' 🧢 HAT TRICK' : '';
      document.getElementById('star-lt-rank').textContent = rankTxt;
      document.getElementById('star-lt-name').textContent = `#${star.number} ${star.name} (${tId})${ht}`;
      document.getElementById('star-lt-stats').textContent = formatStarStats(star);
    } else {
      starsLT.style.display = 'none';
      goModal.style.display = 'flex';

      let winTeam = game.homeScore >= game.awayScore ? homeTeam : awayTeam;
      document.getElementById('go-winner').textContent = `${winTeam.name.toUpperCase()} WIN!`;
      document.getElementById('go-score').textContent = `${awayTeam.id} ${game.awayScore}  —  ${game.homeScore} ${homeTeam.id}`;

      const displayOrder = [game.threeStars[2], game.threeStars[1], game.threeStars[0]].filter(Boolean);
      let starsHtml = displayOrder.map((p, idx) => {
        let tId = p.team === 'HOME' ? homeTeam.id : awayTeam.id;
        let ht = p.goals >= 3 ? ' 🧢 HAT TRICK' : '';
        let label = idx === 0 ? '1ST' : (idx === 1 ? '2ND' : '3RD');
        return `⭐ ${label} STAR: <b>#${p.number} ${p.name}</b> (${tId}) — ${formatStarStats(p)}${ht}`;
      }).join('<br>');
      document.getElementById('go-stars').innerHTML = starsHtml;
    }
  } else {
    starsLT.style.display = 'none';
    goModal.style.display = 'none';
  }
}