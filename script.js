class Game {
    constructor() {
        this.svg = document.getElementById('game');
        this.scoreEl = document.getElementById('score');
        this.livesContainer = document.getElementById('lives-container');
        this.winMessageEl = document.getElementById('win-message');
        this.loveLetterEl = document.getElementById('love-letter');
        this.gameOverScreenEl = document.getElementById('game-over-screen');
        this.finalScoreInfoEl = document.getElementById('final-score-info');
        
        this.startScreen = document.getElementById('start-screen');
        this.startButton = document.getElementById('start-button');
        this.restartGameButton = document.getElementById('restart-game-button');

        this.heartSymbolId = '#heart';
        this.lifeHeartSymbolId = '#life-heart';

        this.hearts = [];
        this.confettiPieces = [];
        this.score = 0;
        this.remainingLives = 3;
        this.gameOver = true;
        
        this.loop = this.loop.bind(this);
        this.startGame = this.startGame.bind(this);
        this.resetGame = this.resetGame.bind(this);
        
        this.startButton.addEventListener('click', this.startGame);
        this.restartGameButton.addEventListener('click', this.resetGame);
    }

    startGame() {
        this.startScreen.style.display = 'none';
        this.startNewGameRound();
    }
    
    resetGame() {
        
        this.hearts.forEach(heart => heart.el.remove());
        this.hearts = [];

        this.restartGameButton.style.display = 'none';
        this.gameOverScreenEl.setAttribute('visibility', 'hidden');
        this.winMessageEl.setAttribute('visibility', 'hidden');
        this.loveLetterEl.setAttribute('visibility', 'hidden');

        this.scoreEl.setAttribute('visibility', 'visible');
        this.livesContainer.setAttribute('visibility', 'visible');

        this.confettiPieces.forEach(p => p.el.remove());
        this.confettiPieces = [];

        this.score = 0;
        this.remainingLives = 3;
        
        this.startNewGameRound();
    }
    
    startNewGameRound() {
        this.gameOver = false;
        this.gameStartTime = performance.now();
        this.updateScore();
        this.updateLives();
        this.startSpawning();
        requestAnimationFrame(this.loop);
    }

    endGame(isWin) {
        this.gameOver = true;
        clearTimeout(this.spawnTimer);

        this.hearts.forEach(heart => heart.el.remove());
        this.hearts = [];

        if (isWin) {
            this.scoreEl.setAttribute('visibility', 'hidden');
            this.livesContainer.setAttribute('visibility', 'hidden');
            this.winMessageEl.setAttribute('visibility', 'visible');
            this.loveLetterEl.setAttribute('visibility', 'visible');
            this.startConfettiAnimation();
        } else {
            this.gameOverScreenEl.setAttribute('visibility', 'visible');
            this.finalScoreInfoEl.textContent = `Puntuación: ${this.score}`;
        }
        
        this.restartGameButton.style.display = 'block';
    }

    startSpawning() {
        if (this.gameOver) { if (this.spawnTimer) clearTimeout(this.spawnTimer); return; }
        const gameTimeSeconds = (performance.now() - this.gameStartTime) / 1000;
        const currentInterval = Math.max(250, 500 - Math.floor(gameTimeSeconds / 5) * 125);
        this.spawnHeart();
        this.spawnTimer = setTimeout(() => this.startSpawning(), currentInterval);
    }

    spawnHeart() {
        if (this.gameOver) return;
        const startX = Math.random() * 350 + 25;
        const endX = Math.random() * 350 + 25;
        const peakY = 150 + Math.random() * 100;
        const heart = document.createElementNS('http://www.w3.org/2000/svg', 'use');
        heart.setAttribute('href', this.heartSymbolId);
        heart.setAttribute('class', 'heart');
        heart.setAttribute('width', '100');
        heart.setAttribute('height', '70');
        heart.setAttribute('x', startX);
        heart.setAttribute('y', 680);
        this.svg.appendChild(heart);
        const heartObj = { el: heart, startX, endX, startY: 680, peakY, startTime: performance.now(), duration: 2500 + Math.random() * 1000, clicked: false, upwardSpeed: -10, reachedBottom: false };
        heart.addEventListener('pointerdown', () => {
            if (!this.gameOver && !heartObj.clicked) {
                this.score += 1;
                this.updateScore();
                heartObj.clicked = true;
                if (this.score >= 20) {
                    this.endGame(true);
                }
            }
        });
        this.hearts.push(heartObj);
    }

    updateScore() { this.scoreEl.textContent = this.score.toString().padStart(2, '0'); }

    updateLives() {
        while (this.livesContainer.firstChild) { this.livesContainer.removeChild(this.livesContainer.firstChild); }
        for (let i = 0; i < this.remainingLives; i++) {
            const lifeHeart = document.createElementNS('http://www.w3.org/2000/svg', 'use');
            lifeHeart.setAttribute('href', this.lifeHeartSymbolId);
            lifeHeart.setAttribute('width', '30');
            lifeHeart.setAttribute('height', '30');
            lifeHeart.setAttribute('x', 410 - i * 35);
            lifeHeart.setAttribute('y', 22);
            this.livesContainer.appendChild(lifeHeart);
        }
    }

    startConfettiAnimation() {
        const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#ffeb3b', '#ffc107', '#ff9800', '#4caf50', '#00bcd4', '#ff5722', '#795548'];
        const confettiCount = 150;
        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('span');
            const size = Math.random() * 10 + 5;
            const fallDuration = Math.random() * 3 + 2;
            const delay = Math.random() * 5;
            confetti.style.position = 'fixed';
            confetti.style.width = `${size}px`;
            confetti.style.height = `${size}px`;
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.borderRadius = '50%';
            confetti.style.zIndex = '100';
            confetti.style.opacity = '0';
            confetti.style.left = `${Math.random() * window.innerWidth}px`;
            confetti.style.top = `${-50}px`;
            confetti.style.transition = `top ${fallDuration}s ${delay}s linear, opacity 0.5s ${delay}s ease-in`;
            document.body.appendChild(confetti);
            this.confettiPieces.push({ el: confetti });
            setTimeout(() => {
                confetti.style.top = `${window.innerHeight + 50}px`;
                confetti.style.opacity = '1';
                setTimeout(() => { confetti.remove(); }, (fallDuration + delay + 1) * 1000);
            }, 50);
        }
    }

    loop(timestamp) {
        if (this.gameOver) return;
        this.hearts = this.hearts.filter(heart => {
            const t = (timestamp - heart.startTime) / heart.duration;
            if (heart.clicked) {
                const newY = parseFloat(heart.el.getAttribute('y')) + heart.upwardSpeed;
                heart.el.setAttribute('y', newY);
                heart.el.setAttribute('pointer-events', 'none');
                if (newY < -80) { heart.el.remove(); return false; }
            } else {
                if (t > 1) {
                    if (!heart.reachedBottom) {
                        this.remainingLives--;
                        this.updateLives();
                        if (this.remainingLives <= 0) { this.endGame(false); }
                        heart.reachedBottom = true;
                    }
                    heart.el.remove();
                    return false;
                }
                const x = heart.startX + (heart.endX - heart.startX) * t;
                const y = heart.startY - (4 * t * (1 - t)) * (heart.startY - heart.peakY);
                heart.el.setAttribute('x', x);
                heart.el.setAttribute('y', y);
            }
            return true;
        });
        requestAnimationFrame(this.loop);
    }
}

const game = new Game();