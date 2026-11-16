const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const pipes = [];
var birdY = 300;
var birdVelY = 0;
var quit = true;
var frame = 0;
var jumpButtonDown = false;
var score = 0;
let ctx;
let dt = 16;
var last = 0 ;
var spawnTimer = 2000;


function playButton() {
    
    ctx.beginPath();
    ctx.fillStyle = 'rgb(55, 168, 35)';
    ctx.strokeStyle = 'rgb(0,0,0)';
    ctx.rect(250, 150, 300, 300);
    ctx.fill();
    ctx.stroke();
    ctx.font = "100px serif";
    ctx.fillStyle = 'rgb(0,0,0)';
    ctx.fillText("PLAY", 270, 350);

}

function setup() {
    console.log(game);
    game.width = 800;
    game.height = 600;
    if (game.width >= game.height) {
        game.size = game.width;
    }
    else {
        game.size = game.height;
    }
    ctx = game.getContext("2d");
    console.log(ctx);

    playButton();
}

function startGame() {
    quit = false;
    pipes.length = 0;
    birdY = 300;
    birdVelY = 0;
    frame = 0;
    jumpButtonDown = false;
    score = 0;
    spawnTimer = 2000;
    dt = 16;
    last = performance.now();
    main(0);
}

function createPipe() {
    let y = Math.floor(Math.random() * 400 + 100); 
    pipes.push([800, y]);
}

function movePipes() {
    for (let i = 0; i < pipes.length; i++) {
        pipes[i][0] += dt/-14;
        if (pipes[i][0] < 5) {
            pipes.splice(i, 1);
            score += 1;
            console.log(score);
        }
    }
}

function drawPipes() {
    ctx.clearRect(0, 0, game.width, game.height);
    ctx.beginPath();
    ctx.fillStyle = 'rgb(240, 245, 245)';
    ctx.rect(0,0,800,600);
    ctx.fill();
    for (let i = 0; i < pipes.length; i++) {
        ctx.fillStyle = 'rgb(55, 168, 35)';
        ctx.strokeStyle = 'rgb(0,0,0)';
        ctx.beginPath();
        ctx.rect(pipes[i][0], pipes[i][1] + 60, 60, 550);
        ctx.rect(pipes[i][0], pipes[i][1] - 60, 60, -550);
        ctx.fill();
        ctx.stroke();
        
    }
}

function drawBird() {
    ctx.fillStyle = 'rgb(55, 168, 35)';
    ctx.strokeStyle = 'rgb(0,0,0)'
    ctx.beginPath();
    ctx.rect(100, birdY, 50, 50);
    ctx.fill();
    ctx.stroke();
}

function birdPhysics() {
    birdVelY = birdVelY * (0.057 * dt)
    birdVelY += -0.03 * dt;
    birdY += -1 * birdVelY;
    if (birdY < 0 || birdY > 550) {
        quit = true;
    }
}

window.addEventListener("keydown", doDownKey);
window.addEventListener("keyup", doUpKey);
game.addEventListener("click", doLeftClick);

function doDownKey(e) {
    if (e.code == "Space") {
        jumpButtonDown = true;
    }
}

function doUpKey(e) {
    if (e.code == "Space") {
        jumpButtonDown = false;
    }
}


function doLeftClick(e) {
    if (e.clientX > 250 && e.clientX < 550 && e.clientY > 150 && e.clientY < 450 && quit == true) {
        startGame();
    }
}

function detectPipe() {
    for (let i = 0; i < pipes.length; i++) {
        if (pipes[i][0] >= 40 && pipes[i][0] <= 150 && (birdY > pipes[i][1] + 10 || birdY < pipes[i][1] - 60)) {
            quit = true;
        }
    }
}

function main(currentTime) {
    dt = currentTime - last;
    spawnTimer += dt;

    last = currentTime;
    
    

    movePipes();
    drawPipes();
    ctx.beginPath();
    ctx.font = "50px serif";
    ctx.fillStyle = 'rgb(0,0,0)';
    ctx.fillText(score, 700, 100);
    
    
    if (spawnTimer > 3000) { // broken here
        createPipe();
        spawnTimer += -3000;
    }
    console.log(spawnTimer)

    frame += 1;

    if (jumpButtonDown) {
        birdVelY += dt / 14;
    }
    birdPhysics();
    drawBird();
    detectPipe();
    //console.lo(gbirdY);
    if (quit == true) {
        playButton();
        return;
    }

  //  console.log(dt);
    
    requestAnimationFrame(main);
}


setup();