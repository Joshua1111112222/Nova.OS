export const app_name = "flappy-app";

export const app = _component("flappy-app", html``, boot_up_app);

function boot_up_app(app) {
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
    gameArea.appendChild(canvas);

    app.appendChild(mainArea);
    const ctx = canvas.getContext("2d");

    const state = {
        gameStarted: false,
        gameOver: false,
        score: 0,
        highScore: localStorage.getItem("flappyHighScore") || 0,
        gravity: 0.4,
        jumpForce: -8,
        speed: 2
    };

    const bird = {
        x: 100,
        y: 0,
        width: 40,
        height: 30,
        velocity: 0,
        draw() {
            ctx.fillStyle = "#FFD700";
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

    const pipes = {
        width: 60,
        gap: 160,
        list: [],
        frequency: 1400,
        lastPipe: 0,
        draw() {
            ctx.fillStyle = "#2ECC40";
            this.list.forEach(p => {
                ctx.fillRect(p.x, 0, this.width, p.topHeight);
                ctx.fillRect(p.x, p.topHeight + this.gap, this.width, canvas.height - p.topHeight - this.gap);
            });
        },
        update(time) {
            if (!state.gameOver && time - this.lastPipe > this.frequency) {
                this.addPipe();
                this.lastPipe = time;
            }

            this.list.forEach(p => {
                p.x -= state.speed;

                if (p.x + this.width < bird.x && !p.passed) {
                    p.passed = true;
                    state.score++;
                    if (state.score > state.highScore) {
                        state.highScore = state.score;
                        localStorage.setItem("flappyHighScore", state.highScore);
                    }
                }

                if (
                    bird.x + bird.width / 2 > p.x &&
                    bird.x - bird.width / 2 < p.x + this.width &&
                    (bird.y - bird.height / 2 < p.topHeight ||
                     bird.y + bird.height / 2 > p.topHeight + this.gap)
                ) {
                    state.gameOver = true;
                }
            });

            this.list = this.list.filter(p => p.x + this.width > 0);
        },
        addPipe() {
            const buffer = 80;
            const minHeight = 80;
            const maxHeight = canvas.height - this.gap - buffer;
            let topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;

            const last = this.list.at(-1);
            if (last && Math.abs(topHeight - last.topHeight) > 120) {
                topHeight = last.topHeight + Math.sign(topHeight - last.topHeight) * 100;
            }

            this.list.push({ x: canvas.width, topHeight, passed: false });
        },
        reset() {
            this.list = [];
            this.lastPipe = 0;
        }
    };

    const background = {
        color1: "#87CEEB", color2: "#1E90FF",
        draw() {
            const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
            g.addColorStop(0, this.color1);
            g.addColorStop(1, this.color2);
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    };

    function resetGame() {
        state.gameStarted = false;
        state.gameOver = false;
        state.score = 0;
        state.speed = 2;
        bird.y = canvas.height / 2;
        bird.velocity = 0;
        pipes.reset();
    }

    function handleInput(e) {
        if (e.type === "keydown" && e.code !== "Space") return;
        if (!state.gameStarted) {
            state.gameStarted = true;
            gameLoop();
        }

        if (!state.gameOver) bird.jump();
        else resetGame();

        e.preventDefault();
    }

    document.addEventListener("keydown", handleInput);
    canvas.addEventListener("click", handleInput);
    canvas.addEventListener("touchstart", handleInput);

    function drawText() {
        ctx.fillStyle = "#000";
        ctx.font = "24px Arial";
        if (!state.gameStarted) {
            ctx.textAlign = "center";
            ctx.fillText("FLAPPY-APP", canvas.width / 2, 100);
            ctx.font = "16px Arial";
            ctx.fillText("Tap or press SPACE to start", canvas.width / 2, 140);
            ctx.fillText(`High Score: ${state.highScore}`, canvas.width / 2, 170);
        } else {
            ctx.textAlign = "left";
            ctx.fillText(`Score: ${state.score}`, 20, 30);
            ctx.fillText(`High Score: ${state.highScore}`, 20, 60);
            if (state.gameOver) {
                ctx.textAlign = "center";
                ctx.font = "30px Arial";
                ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 30);
                ctx.font = "16px Arial";
                ctx.fillText("Tap or press SPACE to play again", canvas.width / 2, canvas.height / 2 + 20);
            }
        }
    }

    function gameLoop(timestamp = 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        background.draw();

        if (state.gameStarted && !state.gameOver) {
            bird.update();
            pipes.update(timestamp);
            state.speed = 2 + state.score * 0.05;
        }

        pipes.draw();
        bird.draw();
        drawText();

        if (!state.gameOver || !state.gameStarted) requestAnimationFrame(gameLoop);
    }

    function resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = 400;
        canvas.height = 700;

        const aspect = canvas.width / canvas.height;
        const screenRatio = window.innerWidth / window.innerHeight;

        if (screenRatio > aspect) {
            canvas.style.height = `${window.innerHeight}px`;
            canvas.style.width = `${window.innerHeight * aspect}px`;
        } else {
            canvas.style.width = `${window.innerWidth}px`;
            canvas.style.height = `${window.innerWidth / aspect}px`;
        }

        bird.y = canvas.height / 2;
    }

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
}
