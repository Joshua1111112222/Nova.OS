export const app_name = "flappy-app";

export const app = _component("flappy-app", html``, boot_up_app);

function boot_up_app(app) {
    // Create main container
    const mainArea = document.createElement("div");
    mainArea.className = "main-area";

    // Header
    const headerTitle = document.createElement("div");
    headerTitle.className = "header-title";
    headerTitle.textContent = "Flappy Bird";
    mainArea.appendChild(headerTitle);

    // Game area
    const gameArea = document.createElement("div");
    gameArea.className = "game-area";
    mainArea.appendChild(gameArea);

    // Canvas setup
    const canvas = document.createElement("canvas");
    canvas.id = "flappyCanvas";
    canvas.width = 288;  // Original Flappy Bird canvas size width
    canvas.height = 512; // Height including base
    gameArea.appendChild(canvas);

    app.appendChild(mainArea);

    const ctx = canvas.getContext("2d");

    // Load images
    const images = {};
    let imagesLoaded = 0;
    const imageFiles = {
        background: "background-day.png",
        base: "base.png",
        pipeTop: "pipe-green.png",
        pipeBottom: "pipe-green.png",
        birdFrames: [
            "yellowbird-downflap.png",
            "yellowbird-midflap.png",
            "yellowbird-upflap.png",
        ],
    };

    function loadImage(src) {
        return new Promise((res) => {
            const img = new Image();
            img.src = src;
            img.onload = () => res(img);
        });
    }

    async function loadAllImages() {
        images.background = await loadImage(imageFiles.background);
        images.base = await loadImage(imageFiles.base);

        // Pipe top and bottom use same image but bottom is flipped
        images.pipeTop = await loadImage(imageFiles.pipeTop);
        images.pipeBottom = images.pipeTop;

        images.birdFrames = [];
        for (const src of imageFiles.birdFrames) {
            const img = await loadImage(src);
            images.birdFrames.push(img);
        }
    }

    // Game state
    const state = {
        gameStarted: false,
        gameOver: false,
        score: 0,
        highScore: parseInt(localStorage.getItem("flappyHighScore")) || 0,
        gravity: 0.25,
        jumpForce: -4.6,
        speed: 2,
        baseHeight: 112, // base.png height in px
    };

    // Bird object
    const bird = {
        x: 50,
        y: canvas.height / 2,
        width: 34,
        height: 24,
        velocity: 0,
        frameIndex: 0,
        frameTimer: 0,
        frameInterval: 200, // ms per frame flap animation
        rotation: 0,
        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);

            const frame = images.birdFrames[this.frameIndex];
            ctx.drawImage(
                frame,
                -this.width / 2,
                -this.height / 2,
                this.width,
                this.height
            );
            ctx.restore();
        },
        update(deltaTime) {
            this.velocity += state.gravity;
            this.y += this.velocity;

            // Update rotation based on velocity
            if (this.velocity >= 0) {
                this.rotation = Math.min(Math.PI / 2, this.rotation + 0.03);
            } else {
                this.rotation = -0.3;
            }

            // Animate bird flapping only when game not over
            if (!state.gameOver) {
                this.frameTimer += deltaTime;
                if (this.frameTimer > this.frameInterval) {
                    this.frameIndex = (this.frameIndex + 1) % images.birdFrames.length;
                    this.frameTimer = 0;
                }
            }
        },
        jump() {
            this.velocity = state.jumpForce;
        },
        getBounds() {
            return {
                left: this.x - this.width / 2,
                right: this.x + this.width / 2,
                top: this.y - this.height / 2,
                bottom: this.y + this.height / 2,
            };
        },
    };

    // Pipes manager
    const pipes = {
        width: 52,
        gap: 110,
        list: [],
        spawnX: canvas.width,
        spawnDistance: 200,
        lastSpawnX: canvas.width,
        speed: state.speed,
        draw() {
            this.list.forEach((pipe) => {
                // Top pipe
                ctx.drawImage(
                    images.pipeTop,
                    pipe.x,
                    pipe.topY,
                    this.width,
                    pipe.topHeight
                );
                // Bottom pipe - flip vertically
                ctx.save();
                ctx.translate(pipe.x + this.width / 2, pipe.bottomY + pipe.bottomHeight / 2);
                ctx.scale(1, -1);
                ctx.drawImage(
                    images.pipeBottom,
                    -this.width / 2,
                    -pipe.bottomHeight / 2,
                    this.width,
                    pipe.bottomHeight
                );
                ctx.restore();
            });
        },
        update(deltaTime) {
            if (!state.gameOver && state.gameStarted) {
                // Spawn pipes when last pipe is 200px to left
                if (
                    this.list.length === 0 ||
                    canvas.width - this.list[this.list.length - 1].x >= this.spawnDistance
                ) {
                    this.addPipe();
                }

                this.list.forEach((pipe) => {
                    pipe.x -= this.speed;

                    // Check if passed bird
                    if (!pipe.passed && pipe.x + this.width < bird.x) {
                        pipe.passed = true;
                        state.score++;
                        if (state.score > state.highScore) {
                            state.highScore = state.score;
                            localStorage.setItem("flappyHighScore", state.highScore);
                        }
                        // Speed up every 5 points
                        if (state.score % 5 === 0) {
                            this.speed += 0.2;
                        }
                    }
                });

                // Remove pipes off screen
                this.list = this.list.filter((pipe) => pipe.x + this.width > 0);
            }
        },
        addPipe() {
            const minPipeHeight = 50;
            const maxPipeHeight = canvas.height - state.baseHeight - this.gap - minPipeHeight;

            const topHeight =
                Math.floor(Math.random() * (maxPipeHeight - minPipeHeight + 1)) + minPipeHeight;
            const bottomY = topHeight + this.gap;
            const bottomHeight = canvas.height - state.baseHeight - bottomY;

            this.list.push({
                x: this.spawnX,
                topY: 0,
                topHeight: topHeight,
                bottomY: bottomY,
                bottomHeight: bottomHeight,
                passed: false,
            });
        },
        reset() {
            this.list = [];
            this.speed = state.speed;
        },
    };

    // Background drawing
    function drawBackground() {
        ctx.drawImage(images.background, 0, 0, canvas.width, canvas.height);
    }

    // Base drawing
    function drawBase() {
        ctx.drawImage(
            images.base,
            0,
            canvas.height - state.baseHeight,
            canvas.width,
            state.baseHeight
        );
    }

    // Draw score top center
    function drawScore() {
        ctx.fillStyle = "white";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 3;
        ctx.font = "40px Arial";
        ctx.textAlign = "center";
        ctx.fillText(state.score, canvas.width / 2, 70);
        ctx.strokeText(state.score, canvas.width / 2, 70);
    }

    // Collision detection between bird and pipes or base
    function checkCollision() {
        const b = bird.getBounds();

        // Hit base
        if (b.bottom >= canvas.height - state.baseHeight) {
            return true;
        }

        // Hit pipes
        for (const pipe of pipes.list) {
            // Pipe rectangles
            const pipeTopRect = {
                left: pipe.x,
                right: pipe.x + pipes.width,
                top: pipe.topY,
                bottom: pipe.topHeight,
            };
            const pipeBottomRect = {
                left: pipe.x,
                right: pipe.x + pipes.width,
                top: pipe.bottomY,
                bottom: pipe.bottomY + pipe.bottomHeight,
            };

            // Simple AABB collision
            if (
                b.right > pipeTopRect.left &&
                b.left < pipeTopRect.right &&
                b.top < pipeTopRect.bottom &&
                b.bottom > pipeTopRect.top
            ) {
                return true;
            }

            if (
                b.right > pipeBottomRect.left &&
                b.left < pipeBottomRect.right &&
                b.top < pipeBottomRect.bottom &&
                b.bottom > pipeBottomRect.top
            ) {
                return true;
            }
        }
        return false;
    }

    // Game over screen
    function drawGameOver() {
        ctx.fillStyle = "white";
        ctx.font = "40px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2 - 50);

        ctx.font = "20px Arial";
        ctx.fillText("Click or press SPACE to restart", canvas.width / 2, canvas.height / 2);
    }

    // Game loop variables
    let lastTime = 0;

    function gameLoop(timestamp = 0) {
        const deltaTime = timestamp - lastTime;
        lastTime = timestamp;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        drawBackground();
        pipes.draw();
        drawBase();
        bird.draw();
        drawScore();

        if (state.gameStarted && !state.gameOver) {
            bird.update(deltaTime);
            pipes.update(deltaTime);

            if (checkCollision()) {
                state.gameOver = true;
            }
        } else if (!state.gameStarted) {
            // Instruction text
            ctx.fillStyle = "white";
            ctx.font = "24px Arial";
            ctx.textAlign = "center";
            ctx.fillText("Press SPACE or Click to start", canvas.width / 2, canvas.height / 2);
        } else if (state.gameOver) {
            drawGameOver();
        }

        requestAnimationFrame(gameLoop);
    }

    // Handle input
    function handleInput(e) {
        if (
            (e.type === "keydown" && e.code === "Space") ||
            e.type === "click" ||
            e.type === "touchstart"
        ) {
            e.preventDefault();

            if (!state.gameStarted) {
                state.gameStarted = true;
            }

            if (!state.gameOver) {
                bird.jump();
            } else {
                resetGame();
            }
        }
    }

    function resetGame() {
        state.gameStarted = false;
        state.gameOver = false;
        state.score = 0;
        pipes.reset();
        bird.y = canvas.height / 2;
        bird.velocity = 0;
        bird.rotation = 0;
        pipes.speed = state.speed;
    }

    // Event listeners
    document.addEventListener("keydown", handleInput);
    canvas.addEventListener("click", handleInput);
    canvas.addEventListener("touchstart", handleInput);

    // Start after images load
    loadAllImages().then(() => {
        resetGame();
        requestAnimationFrame(gameLoop);
    });

    // Responsive canvas scaling - keep original aspect ratio 288x512
    function resizeCanvas() {
        const aspectRatio = 288 / 512;
        let width = window.innerWidth;
        let height = window.innerHeight;

        if (width / height > aspectRatio) {
            // Window wider than aspect ratio
            width = height * aspectRatio;
        } else {
            // Window taller than aspect ratio
            height = width / aspectRatio;
        }

        canvas.style.width = width + "px";
        canvas.style.height = height + "px";
    }
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
}
