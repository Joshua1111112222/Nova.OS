export const app_name = "flappy-app";

export const app = _component("flappy-app", html`
  <canvas id="flappyCanvas" width="360" height="640"></canvas>
  <link rel="stylesheet" href="./apps/flappy-app/styles.css">
`, startFlappyGame);

function startFlappyGame(app) {
  const canvas = app.querySelector("#flappyCanvas");
  const ctx = canvas.getContext("2d");

  // Game constants
  const GRAVITY = 0.5;
  const JUMP = -8;
  const PIPE_WIDTH = 52;
  const PIPE_GAP = 120;
  const BIRD_SIZE = 24;
  const FLOOR_HEIGHT = 80;

  // Game state
  let birdY = canvas.height / 2;
  let birdV = 0;
  let pipes = [];
  let score = 0;
  let bestScore = parseInt(localStorage.getItem("flappyHighScore")) || 0;
  let gameOver = false;
  let started = false;
  let tick = 0;

  function drawBackground() {
    ctx.fillStyle = "#70c5ce";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function drawGround() {
    ctx.fillStyle = "#ded895";
    ctx.fillRect(0, canvas.height - FLOOR_HEIGHT, canvas.width, FLOOR_HEIGHT);
  }

  function drawBird() {
    ctx.fillStyle = "#FFD700";
    ctx.beginPath();
    ctx.arc(80, birdY, BIRD_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#000";
    ctx.stroke();
  }

  function drawPipes() {
    ctx.fillStyle = "#228B22";
    pipes.forEach(pipe => {
      ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.top);
      ctx.fillRect(pipe.x, pipe.top + PIPE_GAP, PIPE_WIDTH, canvas.height - FLOOR_HEIGHT - pipe.top - PIPE_GAP);
    });
  }

  function drawText() {
    ctx.fillStyle = "#fff";
    ctx.font = "bold 24px sans-serif";
    ctx.fillText("Score: " + score, 20, 40);

    if (!started) {
      ctx.textAlign = "center";
      ctx.fillText("Click or Tap to Start", canvas.width / 2, canvas.height / 2 - 30);
    }

    if (gameOver) {
      ctx.textAlign = "center";
      ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2);
      ctx.fillText("Best: " + bestScore, canvas.width / 2, canvas.height / 2 + 40);
      ctx.fillText("Click to Restart", canvas.width / 2, canvas.height / 2 + 80);
    }
  }

  function resetGame() {
    birdY = canvas.height / 2;
    birdV = 0;
    pipes = [];
    score = 0;
    tick = 0;
    gameOver = false;
    started = false;
  }

  function update() {
    if (!started) return;

    birdV += GRAVITY;
    birdY += birdV;

    if (birdY + BIRD_SIZE / 2 > canvas.height - FLOOR_HEIGHT || birdY - BIRD_SIZE / 2 < 0) {
      gameOver = true;
    }

    if (tick % 90 === 0) {
      const top = Math.floor(Math.random() * (canvas.height - PIPE_GAP - FLOOR_HEIGHT - 60)) + 30;
      pipes.push({ x: canvas.width, top, passed: false });
    }

    pipes.forEach(pipe => {
      pipe.x -= 2;

      // Collision
      if (
        80 + BIRD_SIZE / 2 > pipe.x &&
        80 - BIRD_SIZE / 2 < pipe.x + PIPE_WIDTH &&
        (birdY - BIRD_SIZE / 2 < pipe.top || birdY + BIRD_SIZE / 2 > pipe.top + PIPE_GAP)
      ) {
        gameOver = true;
      }

      if (!pipe.passed && pipe.x + PIPE_WIDTH < 80) {
        score++;
        pipe.passed = true;
        if (score > bestScore) {
          bestScore = score;
          localStorage.setItem("flappyHighScore", bestScore);
        }
      }
    });

    pipes = pipes.filter(p => p.x + PIPE_WIDTH > 0);
    tick++;
  }

  function render() {
    drawBackground();
    drawPipes();
    drawGround();
    drawBird();
    drawText();
  }

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    update();
    render();
    if (!gameOver) requestAnimationFrame(loop);
  }

  function handleInput() {
    if (!started) {
      started = true;
      requestAnimationFrame(loop);
    }

    if (gameOver) {
      resetGame();
      return;
    }

    birdV = JUMP;
  }

  canvas.addEventListener("pointerdown", handleInput);
  canvas.addEventListener("touchstart", handleInput);
  document.addEventListener("keydown", (e) => {
    if (e.code === "Space") handleInput();
  });

  render(); // Initial render
}
