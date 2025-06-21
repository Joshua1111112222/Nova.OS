export const app_name = "flappy-app";

export const app = _component("flappy-app", html``, boot_up_app);

function boot_up_app(app) {
  // Create main container and UI
  const mainArea = document.createElement("div");
  mainArea.className = "main-area";
  
  const headerTitle = document.createElement("div");
  headerTitle.className = "header-title";
  headerTitle.textContent = "Flappy Bird";
  mainArea.appendChild(headerTitle);

  const gameArea = document.createElement("div");
  gameArea.className = "game-area";
  mainArea.appendChild(gameArea);

  const canvas = document.createElement("canvas");
  canvas.id = "flappyCanvas";
  canvas.width = 400;
  canvas.height = 600;
  gameArea.appendChild(canvas);

  app.appendChild(mainArea);

  const ctx = canvas.getContext("2d");

  // Load images
  const assets = {};
  const assetPaths = {
    birdUp: "./apps/flappy-app/yellowbird-upflap.png",
    birdMid: "./apps/flappy-app/yellowbird-midflap.png",
    birdDown: "./apps/flappy-app/yellowbird-downflap.png",
    pipe: "./apps/flappy-app/pipe-green.png",
    backgroundDay: "./apps/flappy-app/background-day.png",
    backgroundNight: "./apps/flappy-app/background-night.png",
    base: "./apps/flappy-app/base.png"
  };

  let assetsLoaded = 0;
  const totalAssets = Object.keys(assetPaths).length;

  function loadAssets(callback) {
    for (const key in assetPaths) {
      assets[key] = new Image();
      assets[key].src = assetPaths[key];
      assets[key].onload = () => {
        assetsLoaded++;
        if (assetsLoaded === totalAssets) callback();
      };
      assets[key].onerror = () => {
        console.error(`Failed to load image: ${assetPaths[key]}`);
      };
    }
  }

  // Game state and constants
  const GRAVITY = 0.25;
  const JUMP_STRENGTH = -4.6;
  const PIPE_SPEED = 2;
  const PIPE_GAP = 120;
  const PIPE_INTERVAL = 1500; // milliseconds between pipes
  const BASE_HEIGHT = 112;

  let bird = {
    x: 60,
    y: canvas.height / 2,
    width: 34,
    height: 24,
    velocity: 0,
    rotation: 0,
    frame: 0,
    frameTick: 0,
    frameRate: 5 // frames per animation change
  };

  let pipes = [];
  let lastPipeTime = 0;

  let score = 0;
  let highScore = parseInt(localStorage.getItem("flappyHighScore") || "0");
  let gameStarted = false;
  let gameOver = false;
  let animationFrameId;

  // Bird flap frames in order
  const birdFrames = [assets.birdDown, assets.birdMid, assets.birdUp];

  // Draw everything
  function draw() {
    // Background
    ctx.drawImage(assets.backgroundDay, 0, 0, canvas.width, canvas.height);

    // Pipes
    pipes.forEach(pipe => {
      // top pipe
      ctx.drawImage(
        assets.pipe,
        pipe.x,
        pipe.topY,
        pipe.width,
        pipe.topHeight
      );
      // bottom pipe (flipped)
      ctx.save();
      ctx.translate(pipe.x + pipe.width / 2, pipe.bottomY + pipe.bottomHeight / 2);
      ctx.rotate(Math.PI);
      ctx.drawImage(
        assets.pipe,
        -pipe.width / 2,
        -pipe.bottomHeight / 2,
        pipe.width,
        pipe.bottomHeight
      );
      ctx.restore();
    });

    // Base
    ctx.drawImage(
      assets.base,
      0,
      canvas.height - BASE_HEIGHT,
      canvas.width,
      BASE_HEIGHT
    );

    // Bird with rotation and animation frame
    ctx.save();
    ctx.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
    ctx.rotate(bird.rotation);
    ctx.drawImage(
      birdFrames[bird.frame],
      -bird.width / 2,
      -bird.height / 2,
      bird.width,
      bird.height
    );
    ctx.restore();

    // Score
    ctx.fillStyle = "#FFF";
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.font = "40px 'Arial'";
    ctx.textAlign = "center";
    ctx.fillText(score, canvas.width / 2, 100);
    ctx.strokeText(score, canvas.width / 2, 100);

    // Game over text
    if (gameOver) {
      ctx.font = "30px 'Arial'";
      ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2);
      ctx.strokeText("Game Over", canvas.width / 2, canvas.height / 2);
      ctx.font = "20px 'Arial'";
      ctx.fillText("Click or press SPACE to restart", canvas.width / 2, canvas.height / 2 + 40);
      ctx.strokeText("Click or press SPACE to restart", canvas.width / 2, canvas.height / 2 + 40);
    }
  }

  // Update bird position, physics, and animation
  function update(deltaTime) {
    if (!gameStarted) return;

    bird.velocity += GRAVITY;
    bird.y += bird.velocity;

    // Rotate bird while falling/flying
    if (bird.velocity >= 0) {
      bird.rotation = Math.min(Math.PI / 2, bird.rotation + 0.03);
    } else {
      bird.rotation = -0.3;
    }

    // Animate flap frames
    bird.frameTick++;
    if (bird.frameTick >= bird.frameRate) {
      bird.frame = (bird.frame + 1) % birdFrames.length;
      bird.frameTick = 0;
    }

    // Hit ground
    if (bird.y + bird.height / 2 >= canvas.height - BASE_HEIGHT) {
      bird.y = canvas.height - BASE_HEIGHT - bird.height / 2;
      gameOver = true;
    }

    // Hit top of screen
    if (bird.y - bird.height / 2 <= 0) {
      bird.y = bird.height / 2;
      bird.velocity = 0;
    }

    // Update pipes
    for (let i = pipes.length - 1; i >= 0; i--) {
      let pipe = pipes[i];
      pipe.x -= PIPE_SPEED;

      // Score if bird passes pipe
      if (!pipe.passed && pipe.x + pipe.width < bird.x) {
        pipe.passed = true;
        score++;
        if (score > highScore) {
          highScore = score;
          localStorage.setItem("flappyHighScore", highScore);
        }
      }

      // Remove off-screen pipes
      if (pipe.x + pipe.width < 0) {
        pipes.splice(i, 1);
      }

      // Collision detection
      if (
        bird.x + bird.width / 2 > pipe.x &&
        bird.x - bird.width / 2 < pipe.x + pipe.width &&
        (bird.y - bird.height / 2 < pipe.topHeight ||
          bird.y + bird.height / 2 > pipe.topHeight + PIPE_GAP)
      ) {
        gameOver = true;
      }
    }

    // Add new pipes periodically
    if (performance.now() - lastPipeTime > PIPE_INTERVAL) {
      addPipe();
      lastPipeTime = performance.now();
    }
  }

  function addPipe() {
    const minPipeHeight = 50;
    const maxPipeHeight = canvas.height - BASE_HEIGHT - PIPE_GAP - minPipeHeight;
    const topHeight = minPipeHeight + Math.random() * (maxPipeHeight - minPipeHeight);

    pipes.push({
      x: canvas.width,
      width: 52, // pipe image width
      topHeight: topHeight,
      bottomHeight: canvas.height - BASE_HEIGHT - topHeight - PIPE_GAP,
      topY: 0,
      bottomY: topHeight + PIPE_GAP,
      passed: false
    });
  }

  // Reset game to start over
  function resetGame() {
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    bird.rotation = 0;
    bird.frame = 0;
    bird.frameTick = 0;
    pipes = [];
    score = 0;
    gameOver = false;
    gameStarted = false;
    lastPipeTime = 0;
  }

  // Game loop
  let lastTimestamp = 0;
  function gameLoop(timestamp = 0) {
    const deltaTime = timestamp - lastTimestamp;
    lastTimestamp = timestamp;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    update(deltaTime);
    draw();

    if (!gameOver) {
      animationFrameId = requestAnimationFrame(gameLoop);
    }
  }

  // Input handling
  function onInput() {
    if (!gameStarted) {
      gameStarted = true;
      gameLoop();
    }
    if (!gameOver) {
      bird.velocity = JUMP_STRENGTH;
    } else {
      resetGame();
      draw();
    }
  }

  // Setup input listeners
  document.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
      onInput();
      e.preventDefault();
    }
  });
  canvas.addEventListener("click", onInput);
  canvas.addEventListener("touchstart", (e) => {
    onInput();
    e.preventDefault();
  });

  loadAssets(() => {
    resetGame();
    draw();
  });
}
