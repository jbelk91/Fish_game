// Fishing Game with Boat and Ocean
// Player controls a man in a boat (Kevin) who can deploy and control an ROV in the ocean.

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;
document.body.appendChild(canvas);

// Game variables
let boat = { x: 325, y: 100, width: 130, height: 40, speed: 5, waveOffset: 0 };
let oceanHeight = 120;
let waves = [];
let fishArray = [];
let rov = { x: boat.x + boat.width / 2, y: boat.y + 20, width: 15, height: 10, speed: 2, tetherLength: 300 };
let fishTower = { x: canvas.width / 2 - 50, y: oceanHeight + 300, width: 100, height: 40 }; // Tower lowered
let gameOver = false;
let showIntroMessage = true;
let introMessageTimer = 0;
let kevinDiving = false; // Flag for when Kevin dives

// Controls
document.addEventListener('keydown', (e) => {
  if (!gameOver) {
    if (e.code === 'ArrowLeft') boat.x -= boat.speed;
    if (e.code === 'ArrowRight') boat.x += boat.speed;
    if (e.code === 'ArrowUp') rov.y -= rov.speed;
    if (e.code === 'ArrowDown') rov.y += rov.speed;
  }
});

// Ensure the boat and ROV stay within canvas bounds
function clampBoatPosition() {
  boat.x = Math.max(0, Math.min(canvas.width - boat.width, boat.x));
  rov.x = boat.x + boat.width / 2; // This keeps the ROV in the middle of the boat
  rov.y = Math.min(oceanHeight + rov.tetherLength, Math.max(boat.y + 20, rov.y)); // ROV tether constraint
}

// Generate wave effect
function createWaves() {
  for (let i = 0; i < canvas.width; i += 20) {
    waves.push({ x: i, y: oceanHeight + Math.sin(i / 20) * 5 });
  }
}

function updateWaves() {
  for (let wave of waves) {
    wave.y = oceanHeight + Math.sin((wave.x + boat.waveOffset) / 20) * 8;
  }
  boat.waveOffset += 0.05;
  boat.y = 100 + Math.sin(boat.waveOffset) * 2;
}

// Fish generator
function createFish() {
  if (Math.random() < 0.01) { // 1% chance to create a fish per frame
    fishArray.push({
      x: Math.random() * canvas.width,
      y: oceanHeight + 50 + Math.random() * (canvas.height - oceanHeight - 100),
      speed: 1 + Math.random() * 2,
      size: 10 + Math.random() * 10
    });
  }
}

function updateFish() {
  for (let fish of fishArray) {
    fish.x += fish.speed;
    if (fish.x > canvas.width) fish.x = -fish.size; // Loop fish back to the left

    // Check for collision between the ROV and the fish tower (winning condition)
    if (
      rov.x + rov.width / 2 > fishTower.x &&
      rov.x - rov.width / 2 < fishTower.x + fishTower.width &&
      rov.y + rov.height > fishTower.y &&
      rov.y < fishTower.y + fishTower.height
    ) {
      gameOver = true;
    }

    // Check for collision between the ROV and a fish (Kevin is unhappy)
    if (
      rov.x + rov.width / 2 > fish.x - fish.size / 2 &&
      rov.x - rov.width / 2 < fish.x + fish.size / 2 &&
      rov.y + rov.height > fish.y - fish.size / 2 &&
      rov.y < fish.y + fish.size / 2
    ) {
      kevinDiving = true; // Trigger Kevin diving over the boat
      gameOver = true; // End game
    }
  }
}

// Draw game elements
function draw() {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw sky background
  ctx.fillStyle = '#87CEEB'; // Sky blue
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw ocean
  ctx.fillStyle = '#4682B4'; // Ocean blue
  ctx.fillRect(0, oceanHeight, canvas.width, canvas.height - oceanHeight);

  // Draw waves
  ctx.beginPath();
  ctx.moveTo(0, oceanHeight);
  for (let wave of waves) {
    ctx.lineTo(wave.x, wave.y);
  }
  ctx.lineTo(canvas.width, canvas.height);
  ctx.lineTo(0, canvas.height);
  ctx.closePath();
  ctx.fillStyle = '#1E90FF';
  ctx.fill();

  // Draw boat (stylized hull)
  ctx.fillStyle = 'brown';
  ctx.beginPath();
  ctx.moveTo(boat.x, boat.y);
  ctx.lineTo(boat.x + boat.width, boat.y);
  ctx.lineTo(boat.x + boat.width - 20, boat.y + 20);
  ctx.lineTo(boat.x + 20, boat.y + 20);
  ctx.closePath();
  ctx.fill();

  // Draw "OOA" on the boat
  ctx.fillStyle = 'black';
  ctx.font = '20px Arial';
  ctx.fillText('OOA', boat.x + boat.width / 2 - 20, boat.y + 10);

  // Draw man in the boat (Kevin)
  ctx.fillStyle = '#D2B48C'; // Caucasian skin tone
  // Head
  ctx.beginPath();
  ctx.arc(boat.x + boat.width / 2, boat.y - 40, 12, 0, Math.PI * 2);
  ctx.fill();

  // Glasses
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(boat.x + boat.width / 2 - 6, boat.y - 40, 4, 0, Math.PI * 2);
  ctx.arc(boat.x + boat.width / 2 + 6, boat.y - 40, 4, 0, Math.PI * 2);
  ctx.moveTo(boat.x + boat.width / 2 - 2, boat.y - 40);
  ctx.lineTo(boat.x + boat.width / 2 + 2, boat.y - 40);
  ctx.stroke();

  // Beard
  ctx.fillStyle = 'brown';
  ctx.beginPath();
  ctx.arc(boat.x + boat.width / 2, boat.y - 32, 8, 0, Math.PI, true);
  ctx.fill();

  // Body
  ctx.fillStyle = 'black';
  ctx.fillRect(boat.x + boat.width / 2 - 8, boat.y - 28, 16, 28);

  // Arms
  ctx.strokeStyle = '#D2B48C';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(boat.x + boat.width / 2 - 12, boat.y - 20);
  ctx.lineTo(boat.x + boat.width / 2 - 20, boat.y - 5);
  ctx.moveTo(boat.x + boat.width / 2 + 12, boat.y - 20);
  ctx.lineTo(boat.x + boat.width / 2 + 20, boat.y - 5);
  ctx.stroke();

  // Legs
  ctx.beginPath();
  ctx.moveTo(boat.x + boat.width / 2 - 6, boat.y);
  ctx.lineTo(boat.x + boat.width / 2 - 12, boat.y + 15);
  ctx.moveTo(boat.x + boat.width / 2 + 6, boat.y);
  ctx.lineTo(boat.x + boat.width / 2 + 12, boat.y + 15);
  ctx.stroke();

  // Draw ROV (now blue)
  ctx.fillStyle = 'blue'; // ROV is now blue
  ctx.fillRect(rov.x - rov.width / 2, rov.y, rov.width, rov.height);

  // Draw tether
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(boat.x + boat.width / 2, boat.y);
  ctx.lineTo(rov.x, rov.y);
  ctx.stroke();

  // Draw fish with fins and eyes
  ctx.fillStyle = 'orange';
  for (let fish of fishArray) {
    ctx.beginPath();
    ctx.arc(fish.x, fish.y, fish.size, 0, Math.PI * 2);  // Fish body
    ctx.fill();

    // Draw fish tail
    ctx.beginPath();
    ctx.moveTo(fish.x - fish.size, fish.y);
    ctx.lineTo(fish.x - fish.size - 10, fish.y - 5);
    ctx.lineTo(fish.x - fish.size - 10, fish.y + 5);
    ctx.closePath();
    ctx.fill();

    // Draw fish fins (facing backward)
    ctx.fillStyle = '#FF6347'; // Fin color
    ctx.beginPath();
    ctx.moveTo(fish.x + fish.size / 2, fish.y - 5);
    ctx.lineTo(fish.x + fish.size / 4, fish.y - 10);
    ctx.lineTo(fish.x + fish.size / 2, fish.y);
    ctx.closePath();
    ctx.fill();

    // Draw eyes
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(fish.x - 3, fish.y - 3, 3, 0, Math.PI * 2); // Left eye
    ctx.arc(fish.x + 3, fish.y - 3, 3, 0, Math.PI * 2); // Right eye
    ctx.fill();

    // Draw black pupils
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(fish.x - 3, fish.y - 3, 1, 0, Math.PI * 2); // Left pupil
    ctx.arc(fish.x + 3, fish.y - 3, 1, 0, Math.PI * 2); // Right pupil
    ctx.fill();
  }

  // Draw fish tower (lowered)
  ctx.fillStyle = 'silver'; // Stainless steel color
  ctx.fillRect(fishTower.x, fishTower.y, fishTower.width, fishTower.height);

  // Show victory message
  if (gameOver && !kevinDiving) {
    ctx.fillStyle = 'green';
    ctx.font = '30px Arial';
    ctx.fillText('You won! Kevin is Happy!', canvas.width / 2 - 160, canvas.height / 2);
  }

  // Show "Kevin is unhappy" message when he dives
  if (kevinDiving) {
    ctx.fillStyle = 'red';
    ctx.font = '30px Arial';
    ctx.fillText('Kevin is unhappy! You made Kevin unhappy!', canvas.width / 2 - 240, canvas.height / 2);

    // Simulate Kevin diving over the boat
    boat.y += 5; // Kevin dives down
    if (boat.y > canvas.height) boat.y = 100; // Reset after diving
  }

  // Show intro message at the start
  if (showIntroMessage) {
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText('Help Kevin rescue the sunken fish tower with the ROV! Dont touch the snapper or Kingies', canvas.width / 2 - 180, 30);

    // Timer to hide intro message
    introMessageTimer++;
    if (introMessageTimer > 200) showIntroMessage = false;
  }
}

// Main game loop
function gameLoop() {
  if (!gameOver) {
    createWaves();
    createFish();
    updateWaves();
    updateFish();
  }

  clampBoatPosition();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
