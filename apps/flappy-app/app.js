// app.js - Flappy-App Game
document.addEventListener('DOMContentLoaded', () => {
    // Game canvas setup
    const canvas = document.createElement('canvas');
    canvas.id = 'flappyCanvas';
    canvas.width = 400;
    canvas.height = 600;
    document.body.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    
    // Game state
    const state = {
        gameStarted: false,
        gameOver: false,
        score: 0,
        highScore: localStorage.getItem('flappyHighScore') || 0,
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
        color: '#FFD700',
        draw() {
            ctx.fillStyle = this.color;
            // Draw bird body
            ctx.beginPath();
            ctx.ellipse(this.x, this.y, this.width / 2, this.height / 2, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw bird eye
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(this.x + 10, this.y - 5, 3, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw bird beak
            ctx.fillStyle = '#FF8C00';
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
            
            // Check if bird hits the ground or ceiling
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
        frequency: 1500, // milliseconds
        lastPipe: 0,
        draw() {
            ctx.fillStyle = '#2ECC40';
            this.list.forEach(pipe => {
                // Top pipe
                ctx.fillRect(pipe.x, 0, this.width, pipe.topHeight);
                // Bottom pipe
                ctx.fillRect(pipe.x, pipe.topHeight + this.gap, this.width, canvas.height - pipe.topHeight - this.gap);
            });
        },
        update(currentTime) {
            // Add new pipes
            if (!state.gameOver && currentTime - this.lastPipe > this.frequency) {
                this.addPipe();
                this.lastPipe = currentTime;
            }
            
            // Move pipes
            this.list.forEach((pipe, index) => {
                pipe.x -= state.speed;
                
                // Check if bird passes pipe
                if (pipe.x + this.width < bird.x && !pipe.passed) {
                    pipe.passed = true;
                    state.score++;
                    if (state.score > state.highScore) {
                        state.highScore = state.score;
                        localStorage.setItem('flappyHighScore', state.highScore);
                    }
                }
                
                // Check collision with bird
                if (
                    bird.x + bird.width / 2 > pipe.x && 
                    bird.x - bird.width / 2 < pipe.x + this.width && 
                    (bird.y - bird.height / 2 < pipe.topHeight || 
                     bird.y + bird.height / 2 > pipe.topHeight + this.gap)
                ) {
                    state.gameOver = true;
                }
            });
            
            // Remove off-screen pipes
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
        color1: '#87CEEB',
        color2: '#1E90FF',
        draw() {
            // Gradient sky
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, this.color1);
            gradient.addColorStop(1, this.color2);
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Ground
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(0, canvas.height - 20, canvas.width, 20);
            
            // Grass
            ctx.fillStyle = '#2E8B57';
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
        if (e.type === 'keydown' && e.code === 'Space' || e.type === 'click' || e.type === 'touchstart') {
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
    
    // Event listeners
    document.addEventListener('keydown', handleInput);
    canvas.addEventListener('click', handleInput);
    canvas.addEventListener('touchstart', handleInput);
    
    // Game reset
    function resetGame() {
        state.gameStarted = false;
        state.gameOver = false;
        state.score = 0;
        state.speed = 2;
        
        bird.y = canvas.height / 2;
        bird.velocity = 0;
        
        pipes.reset();
    }
    
    // Draw UI text
    function drawText() {
        ctx.fillStyle = '#000';
        ctx.font = '24px Arial';
        
        if (!state.gameStarted) {
            ctx.textAlign = 'center';
            ctx.fillText('FLAPPY-APP', canvas.width / 2, 100);
            ctx.font = '16px Arial';
            ctx.fillText('Click, tap, or press SPACE to start', canvas.width / 2, 150);
            ctx.fillText(`High Score: ${state.highScore}`, canvas.width / 2, 180);
        } else {
            ctx.textAlign = 'left';
            ctx.fillText(`Score: ${state.score}`, 20, 30);
            ctx.fillText(`High Score: ${state.highScore}`, 20, 60);
            
            if (state.gameOver) {
                ctx.textAlign = 'center';
                ctx.font = '30px Arial';
                ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 30);
                ctx.font = '16px Arial';
                ctx.fillText('Click, tap, or press SPACE to play again', canvas.width / 2, canvas.height / 2 + 20);
            }
        }
    }
    
    // Main game loop
    function gameLoop(timestamp = 0) {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw background
        background.draw();
        
        if (state.gameStarted && !state.gameOver) {
            // Update game elements
            bird.update();
            pipes.update(timestamp);
            
            // Increase difficulty
            state.speed = 2 + Math.floor(state.score / 5) * 0.5;
        }
        
        // Draw pipes
        pipes.draw();
        
        // Draw bird
        bird.draw();
        
        // Draw UI text
        drawText();
        
        // Continue loop if game is running
        if (!state.gameOver || !state.gameStarted) {
            requestAnimationFrame(gameLoop);
        }
    }
    
    // Initial render
    gameLoop();
    
    // Responsive canvas
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
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
});