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

    // Canvas
    const canvas = document.createElement("canvas");
    canvas.id = "flappyCanvas";
    canvas.width = 400;
    canvas.height = 600;
    gameArea.appendChild(canvas);

    app.appendChild(mainArea);

    const ctx = canvas.getContext("2d");

    // Load all images
    const imagesToLoad = {
        birdDown: "yellowbird-downflap.png",
        birdMid: "yellowbird-midflap.png",
        birdUp: "yellowbird-upflap.png",
        pipe: "pipe-green.png",
        backgroundDay: "background-day.png",
        backgroundNight: "background-night.png",
        base: "base.png"
    };

    const images = {};
    let imagesLoaded = 0;
    const totalImages = Object.keys(imagesToLoad).length;

    function loadImages(callback) {
        for (const key in imagesToLoad) {
            images[key] = new Image();
            images[key].src = imagesToLoad[key];
            images[key].onload = () => {
                imagesLoaded++;
                if (imagesLoaded === totalImages) callback();
            };
            images[key].onerror = () => {
                console.error(`Failed to load image: ${imagesToLoad[key]}`);
            };
        }
    }

    // Game variables
    const state = {
        gameStarted: false,
        gameOver: false,
        score: 0,
        highScore: localStorage.getItem("flappyHighScore") || 0,
        gravity: 0.25,
        jumpForce: -4.5,
        speed: 2,
        frame: 0,
        dayTime: true // toggle for day/night background
    };

    // Bird properties
    const bird = {
        x: 60,
        y: canvas.height / 2,
        width: 34,
        height: 24,
        velocity: 0,
        frame: 0,
        animationFrames: [],
        draw() {
            const img = this.animationFrames[this.frame];
            ctx.drawImage(img, this.x, this.y, this.width, this.height);
        },
        update() {
            this.velocity += state.gravity;
            this.y += this.velocity;

            if (this.y + this.height >= canvas.height - base.height) {
                this.y = canvas.height - base.height - this.height;
                state.gameOver = true;
            }

            if (this.y <= 0) {
                this.y = 0;
                this.velocity = 0;
            }

            // Animate flap every 5 frames
            if (state.gameStarted && !state.gameOver) {
                if (state.frame % 5 === 0) {
                    this.frame = (this.frame + 1) % this.animationFrames.length;
                }
            } else {
                this.frame = 1; // mid flap when not started or game over
            }
        },
        jump() {
            this.velocity = state.jumpForce;
        }
    };

    // Pipes properties
    const pipeWidth = 52;
    const pipeGap = 120;
    const pipeVelocity = 2;

    const pipes = {
        list: [],
        frequency: 1500,
        lastTime: 0,
        addPipe() {
            // Pipe top height random between 50 and canvas.height - base.height - pipeGap - 50
            const maxTopHeight = canvas.height - base.height - pipeGap - 50;
            const topHeight = 50 + Math.random() * (maxTopHeight - 50);

            this.list.push({
                x: canvas.width,
                topHeight: topHeight,
                passed: false
            });
        },
        update(deltaTime) {
            if (!state.gameOver && state.gameStarted) {
                if (performance.now() - this.lastTime > this.frequency) {
                    this.addPipe();
                    this.lastTime = performance.now();
                }
            }

            this.list.forEach(pipe => {
                pipe.x -= pipeVelocity;

                // Scoring
                if (!pipe.passed && pipe.x + pipeWidth < bird.x) {
                    pipe.passed = true;
                    state.score++;
                    if (state.score > state.highScore) {
                        state.highScore = state.score;
                        localStorage.setItem("flappyHighScore", state.highScore);
                    }
                }

                // Collision detection
                if (
                    bird.x + bird.width > pipe.x &&
                    bird.x < pipe.x + pipeWidth &&
                    (bird.y < pipe.topHeight || bird.y + bird.height > pipe.topHeight + pipeGap)
                ) {
                    state.gameOver = true;
                }
            });

            // Remove pipes that are off screen
            this.list = this.list.filter(pipe => pipe.x + pipeWidth > 0);
        },
        draw() {
            this.list.forEach(pipe => {
                // Top pipe (flip vertically)
                ctx.save();
                ctx.translate(pipe.x + pipeWidth / 2, pipe.topHeight / 2);
                ctx.scale(1, -1);
                ctx.drawImage(images.pipe, -pipeWidth / 2, -pipe.topHeight / 2, pipeWidth, pipe.topHeight);
                ctx.restore();

                // Bottom pipe
                const bottomY = pipe.topHeight + pipeGap;
                const bottomHeight = canvas.height - base.height - bottomY;
                ctx.drawImage(images.pipe, pipe.x, bottomY, pipeWidth, bottomHeight);
            });
        },
        reset() {
            this.list = [];
            this.lastTime = 0;
        }
    };

    // Base properties (ground)
    const base = {
        height: 112,
        y: canvas.height - 112,
        draw() {
            ctx.drawImage(images.base, 0, this.y, canvas.width, this.height);
        },
        height: 112
    };

    // Background draw
    function drawBackground() {
        if (state.dayTime) {
            ctx.drawImage(images.backgroundDay, 0, 0, canvas.width, canvas.height);
        } else {
            ctx.drawImage(images.backgroundNight, 0, 0, canvas.width, canvas.height);
        }
    }

    // Draw score
    function drawScore() {
        ctx.fillStyle = "#FFF";
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 3;
        ctx.font = "40px 'Arial', sans-serif";
        ctx.textAlign = "center";

        ctx.strokeText(state.score, canvas.width / 2, 80);
        ctx.fillText(state.score, canvas.width / 2, 80);

        if (state.gameOver) {
            ctx.font = "20px 'Arial', sans-serif";
            ctx.fillText(`High Score: ${state.highScore}`, canvas.width / 2, 120);
        }
    }

    // Draw instructions before game start
    function drawInstructions() {
        ctx.fillStyle = "#FFF";
        ctx.font = "20px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Click, tap, or press SPACE to start", canvas.width / 2, canvas.height / 2);
    }

    // Handle input
    function handleInput(e) {
        if (
            (e.type === "keydown" && e.code === "Space") ||
            e.type === "click" ||
            e.type === "touchstart"
        ) {
            if (!state.gameStarted) {
                state.gameStarted = true;
                state.gameOver = false;
                pipes.reset();
                bird.y = canvas.height / 2;
                bird.velocity = 0;
                state.score = 0;
            }
            if (!state.gameOver) {
                bird.jump();
            } else {
                // Reset on restart
                state.gameStarted = false;
            }
            e.preventDefault();
        }
    }

    document.addEventListener("keydown", handleInput);
    canvas.addEventListener("click", handleInput);
    canvas.addEventListener("touchstart", handleInput);

    // Game loop
    function gameLoop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        drawBackground();

        pipes.update();
        pipes.draw();

        base.draw();

        bird.update();
        bird.draw();

        drawScore();

        if (!state.gameStarted) {
            drawInstructions();
        }

        if (state.gameOver) {
            ctx.fillStyle = "#FFF";
            ctx.font = "40px Arial";
            ctx.textAlign = "center";
            ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2 - 40);
            ctx.font = "20px Arial";
            ctx.fillText("Click, tap, or press SPACE to restart", canvas.width / 2, canvas.height / 2);
        }

        requestAnimationFrame(gameLoop);
    }

    // Initialize bird animation frames once images load
    function startGame() {
        bird.animationFrames = [images.birdDown, images.birdMid, images.birdUp];
        bird.frame = 0;

        gameLoop();
    }

    loadImages(() => {
        startGame();
    });

    // Responsive canvas sizing
    function resizeCanvas() {
        const ratio = canvas.width / canvas.height;
        const windowRatio = window.innerWidth / window.innerHeight;

        if (windowRatio > ratio) {
            canvas.style.height = `${window.innerHeight}px`;
            canvas.style.width = `${window.innerHeight * ratio}px`;
        } else {
            canvas.style.width = `${window.innerWidth}px`;
            canvas.style.height = `${window.innerWidth / ratio}px`;
        }
    }

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
}
