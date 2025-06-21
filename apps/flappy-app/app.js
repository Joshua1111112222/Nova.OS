export const app_name = "flappy-app";

export const app = _component("flappy-app", html``, boot_up_app);

function boot_up_app(app) {
    // Dynamically create the main container
    const mainArea = document.createElement("div");
    mainArea.className = "main-area";

    // Create the header
    const headerTitle = document.createElement("div");
    headerTitle.className = "header-title";
    headerTitle.textContent = "Flappy Bird";
    mainArea.appendChild(headerTitle);

    // Create the game area
    const gameArea = document.createElement("div");
    gameArea.className = "game-area";
    mainArea.appendChild(gameArea);

    // Create the canvas
    const canvas = document.createElement("canvas");
    canvas.id = "flappyCanvas";
    canvas.width = 400;
    canvas.height = 600;
    gameArea.appendChild(canvas);

    // Append the main area to the app
    app.appendChild(mainArea);

    const ctx = canvas.getContext("2d");

    // Game state
    const state = {
        gameStarted: false,
        gameOver: false,
        score: 0,
        highScore: localStorage.getItem("flappyHighScore") || 0,
        gravity: 0.5,
        jumpForce: -10,
        speed: 2
    };

    // Bird properties
    const bird = {
        x: 100,
        y: canvas.height / 2,
        width: 40,
        height: 30,
        velocity: 0,
        color: "#FFD700",
        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.ellipse(this.x, this.y, this.width / 2, this.height / 2, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "#000";
            ctx.beginPath();
            ctx.arc(this.x + 10, this.y - 5, 3, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "#FF8C00";
            ctx.beginPath();
            ctx.moveTo(this.x + 20, this.y);
            ctx.lineTo(this.x + 30, this.y - 5);
            ctx.lineTo(this.x + 30, this.y + 5);
            ctx.closePath();
            ctx.fill();
        },
        update() {
            this.velocity += state.gravity;
            this.y += this.velocity;

            if (this.y + this.height / 2 > canvas.height || this.y - this.height / 2 < 0) {
                state.gameOver = true;
            }
        },
        jump() {
            this.velocity = state.jumpForce;
        }
    };

    // Pipes
    const pipes = {
        width: 60,
        gap: 150,
        list: [],
        frequency: 1500,
        lastPipe: 0,
        draw() {
            ctx.fillStyle = "#2ECC40";
            this.list.forEach(pipe => {
                ctx.fillRect(pipe.x, 0, this.width, pipe.topHeight);
                ctx.fillRect(pipe.x, pipe.topHeight + this.gap, this.width, canvas.height - pipe.topHeight - this.gap);
            });
        },
        update(currentTime) {
            if (!state.gameOver && currentTime - this.lastPipe > this.frequency) {
                this.addPipe();
                this.lastPipe = currentTime;
            }

            this.list.forEach(pipe => {
                pipe.x -= state.speed;

                if (pipe.x + this.width < bird.x && !pipe.passed) {
                    pipe.passed = true;
                    state.score++;
                    if (state.score > state.highScore) {
                        state.highScore = state.score;
                        localStorage.setItem("flappyHighScore", state.highScore);
                    }
                }

                if (
                    bird.x + bird.width / 2 > pipe.x &&
                    bird.x - bird.width / 2 < pipe.x + this.width &&
                    (bird.y - bird.height / 2 < pipe.topHeight ||
                        bird.y + bird.height / 2 > pipe.topHeight + this.gap)
                ) {
                    state.gameOver = true;
                }
            });

            this.list = this.list.filter(pipe => pipe.x + this.width > 0);
        },
        addPipe() {
            const minHeight = 50;
            const maxHeight = canvas.height - this.gap - minHeight;
            const topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;

            this.list.push({
                x: canvas.width,
                topHeight,
                passed: false
            });
        },
        reset() {
            this.list = [];
            this.lastPipe = 0;
        }
    };

    // Background
    const background = {
        color1: "#87CEEB",
        color2: "#1E90FF",
        draw() {
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, this.color1);
            gradient.addColorStop(1, this.color2);
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = "#8B4513";
            ctx.fillRect(0, canvas.height - 20, canvas.width, 20);

            ctx.fillStyle = "#2E8B57";
            for (let i = 0; i < canvas.width; i += 20) {
                ctx.beginPath();
                ctx.moveTo(i, canvas.height - 20);
                ctx.lineTo(i + 10, canvas.height - 30);
                ctx.lineTo(i + 20, canvas.height - 20);
                ctx.fill();
            }
        }
    };

    // Game controls
    function handleInput(e) {
        if (e.type === "keydown" && e.code === "Space" || e.type === "click" || e.type === "touchstart") {
            if (!state.gameStarted) {
                state.gameStarted = true;
                gameLoop();
            }

            if (!state.gameOver) {
                bird.jump();
            } else {
                resetGame();
            }

            e.preventDefault();
        }
    }

    document.addEventListener("keydown", handleInput);
    canvas.addEventListener("click", handleInput);
    canvas.addEventListener("touchstart", handleInput);

    function resetGame() {
        state.gameStarted = false;
        state.gameOver = false;
        state.score = 0;
        state.speed = 2;

        bird.y = canvas.height / 2;
        bird.velocity = 0;

        pipes.reset();
    }

    function drawText() {
        ctx.fillStyle = "#000";
        ctx.font = "24px Arial";

        if (!state.gameStarted) {
            ctx.textAlign = "center";
            ctx.fillText("FLAPPY-APP", canvas.width / 2, 100);
            ctx.font = "16px Arial";
            ctx.fillText("Click, tap, or press SPACE to start", canvas.width / 2, 150);
            ctx.fillText(`High Score: ${state.highScore}`, canvas.width / 2, 180);
        } else {
            ctx.textAlign = "left";
            ctx.fillText(`Score: ${state.score}`, 20, 30);
            ctx.fillText(`High Score: ${state.highScore}`, 20, 60);

            if (state.gameOver) {
                ctx.textAlign = "center";
                ctx.font = "30px Arial";
                ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 30);
                ctx.font = "16px Arial";
                ctx.fillText("Click, tap, or press SPACE to play again", canvas.width / 2, canvas.height / 2 + 20);
            }
        }
    }

    function gameLoop(timestamp = 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        background.draw();

        if (state.gameStarted && !state.gameOver) {
            bird.update();
            pipes.update(timestamp);

            state.speed = 2 + Math.floor(state.score / 5) * 0.5;
        }

        pipes.draw();
        bird.draw();
        drawText();

        if (!state.gameOver || !state.gameStarted) {
            requestAnimationFrame(gameLoop);
        }
    }

    gameLoop();

    function resizeCanvas() {
        const ratio = canvas.width / canvas.height;
        const windowRatio = window.innerWidth / window.innerHeight;

        if (windowRatio > ratio) {
            canvas.style.width = `${window.innerHeight * ratio}px`;
            canvas.style.height = `${window.innerHeight}px`;
        } else {
            canvas.style.width = `${window.innerWidth}px`;
            canvas.style.height = `${window.innerWidth / ratio}px`;
        }
    }

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
}