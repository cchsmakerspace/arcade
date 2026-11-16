function randInt(min, max, stepSize = 1) {
    if (min > max) {
        max = [min, min = max][0]
        //swaps
    }
    return (Math.floor((Math.random() * max) + min) / stepSize) * stepSize
}

function randRGB(color1, color2, stepSize = 1) {
    //https://stackoverflow.com/questions/10970958/get-a-color-component-from-an-rgb-string-in-javascript
    let rgb1 = color1.substring(4, color1.length-1)
         .replace(/ /g, '')
         .split(',');
    let rgb2 = color2.substring(4, color2.length-1)
         .replace(/ /g, '')
         .split(',');
    //rgb 1 and 2 = ["ff", "ff", "ff"] for example
    r = randInt(Number(rgb1[0]), Number(rgb2[0]))
    g = randInt(Number(rgb1[1]), Number(rgb2[1]))
    b = randInt(Number(rgb1[2]), Number(rgb2[2]))
    return "rgb(" + r + ", " + g + ", " + b + ")"
}





async function init() {
    console.log(game)
    game.width = 1200
    game.height = 800
    if (game.width >= game.height) {
        game.size = game.width
    }
    else {
        game.size = game.height
    }
    ctx = game.getContext("2d")
    console.log(ctx)

    quit = false

    guySprite = new Image()
    guySprite.src = "guy.bmp"

    blocksTiles = new Image()
    blocksTiles.src = "blocks.bmp"

    blockStyle = "color"

    player = {
        "x":600,
        "y":105,
        "frame":0,
        "direction":0, //0 left, 1 right
        "verticalVelocity":0,
        "health":100,
        "level":1
    }
    //                  left   right  up     down
    MovementKeysDown = [false, false, false, false]

    timeOfDay = 0

    blocks = await loadJSONs()

    inventory = buildInventory()

    selectedBlock = 2

    level = buildLevel() 

    lightMap = calculateLighting()

    inventoryScreenIsOpen = false
    inventoryScreenLocations = []

    mouseX = 600
    mouseY = 105

    main()

    return 0
}

async function loadJSONs() {
    let data = await fetch('./blocks.json')
    let blocksdata = await data.json()
    let blocks = blocksdata["blocks"]
    console.log(blocks)
    return blocks
}

function buildInventory() {
    let newInventory = []
    for (let i = 0; i < blocks.length; i++) (
        newInventory.push(0)
    )
    newInventory[10] = 99

    return newInventory
}


window.addEventListener("keydown", doDownKey)
window.addEventListener("keyup", doUpKey)
game.addEventListener("click", doLeftClick)
game.addEventListener('contextmenu', doRightClick)
game.addEventListener('mousemove', doMouseMove)

function doDownKey(e) {
    if (e.code == "KeyI") {
        inventoryScreen()
    }
    if (e.code == "KeyE") {
        if (blockStyle == "image") {blockStyle = "color"}
        else if (blockStyle == "color") {blockStyle = "image"}
    }
    if (e.code == "KeyT") {
        timeOfDay += 100
    }
    if (e.code == "KeyA") {
        MovementKeysDown[0] = true;
    }
    if (e.code == "KeyD") {
        MovementKeysDown[1] = true;
    }
    if (e.code == "KeyW") {
        MovementKeysDown[2] = true;
    }
    if (e.code == "KeyS") {
        MovementKeysDown[3] = true;
    }
    console.log(MovementKeysDown)
    return 0
}

function doUpKey(e) {
    if (e.code == "KeyA") {
        MovementKeysDown[0] = false;
    }
    if (e.code == "KeyD") {
        MovementKeysDown[1] = false;
    }
    if (e.code == "KeyW") {
        MovementKeysDown[2] = false;
    }
    if (e.code == "KeyS") {
        MovementKeysDown[3] = false;
    }
    return 0
}

function doLeftClick(e) {
    //https://stackoverflow.com/a/18053642
    const rect = game.getBoundingClientRect()
    const x = Math.floor((e.clientX - rect.left - 5) / 10)
    const y = Math.floor((e.clientY - rect.top - 5) / 10) 

    let distanceToMouse = Math.abs(x - Math.floor(player["x"] /10)) + Math.abs(y - Math.floor(player["y"] /10) -1)


    if (inventoryScreenIsOpen == false) {
        
        if (blocks[level[y][x]]["breakable"] == true && distanceToMouse <= 10) {
            inventory[blocks[level[y][x]]["drops"]] += 1
            level[y][x] = 0
        }
    }


    //(location % 9) * 60 + 330, Math.floor(location / 9) * 80 + 90
    if (inventoryScreenIsOpen == true) {
        inventoryScreenIsOpen = false
        for (let i = 0; i < inventoryScreenLocations.length; i++) {
            if (x*10 >= (i % 9) * 60 + 330 && x*10 <= (i % 9) * 60 + 380 && y*10 >= Math.floor(i / 9) * 80 + 90 && y*10 <= Math.floor(i / 9) * 80 + 140) {
                selectedBlock = inventoryScreenLocations[i]
            }
        }
    }

    lightMap = calculateLighting()
    
    return 0
}

function doRightClick(e) {

    //https://stackoverflow.com/a/18053642
    e.preventDefault()
    const rect = game.getBoundingClientRect()
    const x = Math.floor((e.clientX - rect.left - 5) / 10)
    const y = Math.floor((e.clientY - rect.top - 5) / 10) 

    let distanceToMouse = Math.abs(x - Math.floor(player["x"] /10)) + Math.abs(y - Math.floor(player["y"] /10) -1)


    if (inventoryScreenIsOpen == false) {
        if (blocks[level[y][x]]["replaceable"] == true && inventory[selectedBlock] > 0 && distanceToMouse <= 10) {
            inventory[selectedBlock] += -1
            level[y][x] = selectedBlock
        }
    }

    lightMap = calculateLighting()
    
    return 0
}

function doMouseMove(e) {
    mouseX = e.clientX
    mouseY = e.clientY
}

function move(xCurent, yCurent, xChange, yChange) {
    //can only handle moving either x or y
    let newPos = [xCurent, yCurent]
    if (yCurent + yChange >= level.length * 10 || yCurent + yChange <= 0) {
        console.log('to far y')
        return [xCurent, yCurent]
    }
    if ((xCurent + xChange) >= level[1].length * 10  || (xCurent + xChange) <= 0) {
        console.log('to far x')
        return [xCurent, yCurent]
    }

    let xDir
    let yDir
    let xDistance = 0
    let yDistance = 0 

    if (xChange == 0) {
        xDir = 0
    }
    else if (xChange == Math.abs(xChange)) {
        xDir = 1
    }
    else {
        xDir = -1
    }
    if (yChange == 0) {
        yDir = 0
    }
    else if (yChange == Math.abs(yChange)) {
        yDir = 1
    }
    else {
        yDir = -1
    }
   
    console.log(yDir)

    for (let i = 0; i < Math.abs(xChange); i++) {
        xDistance += moveOnceX(xCurent, yCurent, xDir)
    }

    for (let i = 0; i < Math.abs(yChange); i++) {
        if (yDir == 1) {yDistance += moveOnceY(xCurent, yCurent, yDir)}
        if (yDir == -1) {yDistance += moveOnceY(xCurent, yCurent - 25, yDir)}
    }

    newPos[0] = xCurent + xDistance
    newPos[1] = yCurent + yDistance


    return newPos
}

function moveOnceX(xCurent, yCurent, dir) {
    let xOverlap = false
    if (blocks[level[Math.floor(yCurent / 10)][Math.floor((xCurent + dir) / 10)]]["collision"] == true || blocks[level[Math.floor(yCurent / 10)+2][Math.floor((xCurent + dir) / 10)]]["collision"] || blocks[level[Math.floor(yCurent / 10)+1][Math.floor((xCurent + dir) / 10)]]["collision"]) {
        xOverlap = true
    }
    if (xOverlap == false) {
        return dir
    }
    else {
        return 0
    }
}

function moveOnceY(xCurent, yCurent, dir) {
    let yOverlap = false
    if (blocks[level[Math.floor((yCurent + dir - 3) / 10)][Math.floor(xCurent / 10)]]["collision"] == true) {
        yOverlap = true
    }
    if (yOverlap == false) {
        return dir
    }
    else {
        return 0
    }
}

function buildLevel() {
    const newLevel = []
    let waves = [randInt(16,6), randInt(6,3), randInt(8,5)]
    const waveHeights = []
    for (let j = 0; j < 120; j++) {
        waveHeights.push(Math.round(Math.sin(j/waves[0])*8+randInt(-1,1)* + Math.sin(j/waves[1])*4+randInt(-1,1)*Math.sin(j/waves[2])*3+randInt(-1,1) + 30 + randInt(-1, 1)))
    }
    for (let i = 0; i < 80; i++) {
        newLevel.push([])
        for (let j = 0; j < 120; j++) {
            let waveHeight = waveHeights[j]
            if (waveHeight < i) {
                newLevel[i][j] = 2
                if (waveHeight > i-2) {
                    newLevel[i][j] = 3
                }
                else if (randInt(0,30) == 0) {
                    newLevel[i][j] = 8
                }
                if (waveHeight == i-1 && randInt(0, 10) == 0) { 
                    //TREE
                    newLevel[i-1][j] = 4
                    newLevel[i-2][j] = 4
                    newLevel[i-3][j] = 4
                    newLevel[i-4][j] = 4
                    newLevel[i-4][j-2] = 5
                    newLevel[i-4][j-1] = 5
                    newLevel[i-4][j+1] = 5
                    newLevel[i-4][j+2] = 5
                    newLevel[i-5][j-2] = 5
                    newLevel[i-5][j-1] = 5
                    newLevel[i-5][j] =   5                    
                    newLevel[i-5][j+1] = 5
                    newLevel[i-5][j+2] = 5
                    newLevel[i-6][j-1] = 5
                    newLevel[i-6][j] =   5                  
                    newLevel[i-6][j+1] = 5
                }
            }
            //else if (i > 30) {
            //    newLevel[i][j] = 9
            //}
            else {
                newLevel[i][j] = 0
            }
        }
    }
    return newLevel
}

function printLevelToScreen() {
    ctx.clearRect(0, 0, game.width, game.height)
    if (blockStyle == "image") {
        for (let i = 0; i < level.length; i++) {
            for (let j = 0; j < level[0].length; j++) {
                if (blocks[level[i][j]]["tile"] != 0) {
                    drawBlockByImage(i, j, blocks[level[i][j]]["tile"])
                }
                else {
                    drawBlockByColor(i, j, blocks[level[i][j]]["color"])
                }
            }
        }
    }
    if (blockStyle == "color") {
        for (let i = 0; i < level.length; i++) {
            for (let j = 0; j < level[0].length; j++) {
                if (blocks[level[i][j]]["tags"]["alwaysImage"] != true) {
                    drawBlockByColor(i, j, blocks[level[i][j]]["color"])
                }
                else {
                    drawBlockByImage(i, j, blocks[level[i][j]]["tile"])
                }
            }
        }
    }

}

function drawCornerBlock() {
    if (blockStyle == "color" && blocks[selectedBlock]["tags"]["alwaysImage"] != true) {
        ctx.fillStyle = blocks[selectedBlock]["color"]
        ctx.beginPath()
        ctx.rect(1130, 20, 50, 50)
        ctx.fill()
        ctx.font = "22px serif";
        ctx.fillText(inventory[selectedBlock], 1130, 93)
    }
    else {
        let tileIndexX = blocks[selectedBlock]["tile"] % 10
        let tileIndexY = Math.floor(blocks[selectedBlock]["tile"] / 10)
        ctx.drawImage(blocksTiles, 10 * tileIndexX, 10 * tileIndexY, 10, 10, 1130, 20, 50, 50)
    }
}

function drawPlayer() {
    ctx.drawImage(guySprite, 16 * Math.floor(player["frame"]), 30 * player["direction"], 16, 30, player["x"], player["y"], 16, 30)
}

function drawArm(e) {
    const rect = game.getBoundingClientRect()
    const x = Math.floor((mouseX - rect.left - 5) / 10)
    const y = Math.floor((mouseY - rect.top - 5) / 10) 

    let distanceToMouse = Math.abs(x - Math.floor(player["x"] /10)) + Math.abs(y - Math.floor(player["y"] /10) -1)
    
    ctx.strokeStyle = "rgb(180, 60, 60)"
    if (distanceToMouse >= 11) {
        ctx.strokeStyle = "rgb(53, 10, 10)"
    }
    ctx.lineWidth = 3
    ctx.lineCap = "square"
    ctx.beginPath()
    ctx.moveTo(player['x'] + 8, player["y"] + 10)
    ctx.lineTo(mouseX - 6, mouseY -63)
    ctx.stroke()
}

function inventoryScreen() {
    console.log(inventory)
    inventoryScreenIsOpen = true

    ctx.fillStyle = "rgba(217, 217, 217, 0.9)"
    ctx.beginPath()
    ctx.rect(310, 70, 570, 650)
    ctx.fill()

    let location = 0
    inventoryScreenLocations = []

    for (let i = 0; i < blocks.length; i++) {
        if (inventory[i] > 0) {
            ctx.fillStyle = blocks[i]["color"]
            ctx.beginPath()
            ctx.rect((location % 9) * 60 + 330, Math.floor(location / 9) * 80 + 90, 50, 50)
            ctx.fill()
            ctx.font = "22px serif";
            ctx.fillText(inventory[i], (location % 9) * 60 + 330, Math.floor(location / 9) * 80 + 163);
            inventoryScreenLocations.push(i)
            location++
        }
    }
}

function drawBlockByImage(y, x, tileIndex) {
    let tileIndexX = tileIndex % 10
    let tileIndexY = Math.floor(tileIndex / 10)
    ctx.drawImage(blocksTiles, 10 * tileIndexX, 10 * tileIndexY, 10, 10, 10 * x + 5, 10 * y +5, 10, 10)
}

function drawBlockByColor(y, x, color) {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.rect(5+(x*10), 5+(y*10), 10, 10)
    ctx.fill()
}

function drawLighting() {
    for (let i = 0; i < 80; i++) {
        for (let j = 0; j < 120; j++) {
            drawBlockByColor(i, j, 'rgba(0,0,0,' + (1 - ((lightMap[i][j]) / 7)) + ')')
        }
    }
}

function calculateLighting() {
    
    let newLightMap = []

    ambientLight = 7
    if (timeOfDay > 18000) {
        ambientLight = 6
    }
    if (timeOfDay > 18300) {
        ambientLight = 5
    }
    if (timeOfDay > 18600) {
        ambientLight = 4
    }
    if (timeOfDay > 18900) {
        ambientLight = 3
    }
    if (timeOfDay > 19200) {
        ambientLight = 2
    }
    if (timeOfDay > 19500) {
        ambientLight = 1
    }

    if (timeOfDay < 1500) {
        ambientLight = 6
    }
    if (timeOfDay < 1200) {
        ambientLight = 5
    }
    if (timeOfDay < 900) {
        ambientLight = 4
    }
    if (timeOfDay < 600) {
        ambientLight = 3
    }
    if (timeOfDay < 300) {
        ambientLight = 2
    }
    
    
    
    

   

    for (let i = 0; i < 80; i++) {
        newLightMap.push([])
        for (let j = 0; j < 120; j++) {
            newLightMap[i].push(0)
        }
    }

    

    for (let c = 0; c < level[1].length; c++) {
        for (let r = 0; r < level.length; r++) {
            newLightMap[r][c] = ambientLight
            if (blocks[level[r][c]]["blocksLight"] == true) {
                break
            }
        }   
    }

    for (let c = 0; c < level[1].length; c++) {
        for (let r = 0; r < level.length; r++) {
            if (blocks[level[r][c]]["tags"]["lightLevel"]) {
                newLightMap[r][c] = blocks[level[r][c]]["tags"]["lightLevel"]
            }
        }
    }

    for (let _ = 0; _ < 7; _++) {
        for (let i = 0; i < 80; i++) {
            let tempNewLightMap = newLightMap
            for (let j = 0; j < 120; j++) { 
                if (blocks[level[i][j]]["blocksLight"] == false && newLightMap[i][j] > 0) { 
                    if (i > 0) {tempNewLightMap[i-1][j] = newLightMap[i][j]-1 > newLightMap[i-1][j] ? newLightMap[i][j]-1 : newLightMap[i-1][j]}
                    if (i < 120) {tempNewLightMap[i+1][j] = newLightMap[i][j]-1 > newLightMap[i+1][j] ? newLightMap[i][j]-1 : newLightMap[i+1][j]}
                    if (j > 0) {tempNewLightMap[i][j-1] = newLightMap[i][j]-1 > newLightMap[i][j-1] ? newLightMap[i][j]-1 : newLightMap[i][j-1]}
                    if (j < 120) {tempNewLightMap[i][j+1] = newLightMap[i][j]-1 > newLightMap[i][j+1] ? newLightMap[i][j]-1 : newLightMap[i][j+1]}
                }
            }
            newLightMap = tempNewLightMap
        }
    }

    return newLightMap
}

function doPlayerMovement() {
    let x = Math.floor((player["x"] + 8) / 10)
    let y = Math.floor((player["y"] + 32) / 10)

    if (MovementKeysDown[2] == true && (blocks[level[Math.floor((player["y"] + 25) / 10)][Math.floor((player["x"] +4) / 10)]]["collision"] == true || blocks[level[Math.floor((player["y"] + 25) / 10)][Math.floor((player["x"] -4) / 10)]]["collision"] == true) && player['verticalVelocity'] == 0) {
        player["verticalVelocity"] += 12
        let newPos = move(player["x"], player["y"], 0, 4)
        player["x"] = newPos[0]
        player["y"] = newPos[1] -25
    }

    if (MovementKeysDown[0] == true) {
        let newPos = move(player["x"], player["y"], -2, 0)
        player["x"] = newPos[0]
        player["y"] = newPos[1]
        player["direction"] = 0
    }
    if (MovementKeysDown[1] == true) {
        let newPos = move(player["x"] + 6, player["y"], 2, 0)
        player["x"] = newPos[0] - 6
        player["y"] = newPos[1]
        

        player["direction"] = 1
    }
    
        
    if (player["verticalVelocity"] != 0) {
        let newPos = move(player["x"], player["y"] + 27, 0, player["verticalVelocity"] * -1)
        player["x"] = newPos[0]
        player["y"] = newPos[1] - 27
    }
    
    if (MovementKeysDown[0] == false && MovementKeysDown[1] == false) {
        player["frame"] = 0
    }
    else {
        player["frame"] += 0.2 //there might be a better way to do this
        player["frame"] = player["frame"] % 4
    }
}

function gravity() {
    const x = Math.floor((player["x"] + 4) / 10)
    const y = Math.floor((player["y"] + 25) / 10)

    if (blocks[level[y][x]]["collision"] == false) {
        player["verticalVelocity"] += -1
        if (player["verticalVelocity"] <= -5) {
            player["verticalVelocity"] = -5
        }
    }
    else {
        player["verticalVelocity"] = 0
    }
}

function main() {
    
        printLevelToScreen()
        drawCornerBlock()
        drawPlayer()
        drawArm()
        drawLighting()
        if (inventoryScreenIsOpen == true) {
            inventoryScreen()
        }
        
        doPlayerMovement()
        gravity()
        timeOfDay++
        console.log(timeOfDay)
        timeOfDay = timeOfDay > 36000 ? 0 : timeOfDay
        if (timeOfDay % 100 == 0) {
            lightMap = calculateLighting()
            console.log("light")
        }
    
    requestAnimationFrame(main)
}



init()
