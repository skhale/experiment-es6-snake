export default class SnakeGame
{
    constructor(canvas, blockSize = 10) {
        if (typeof canvas === "string") canvas = document.getElementById(canvas);

        this.canvas = canvas;
        this.blockSize = blockSize;
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.getAttribute("width");
        this.height = this.canvas.getAttribute("height");

        document.onkeydown = event => { this.handleKeypress(event) };

        this.setup();
    }

    setup() {
        clearTimeout(this.t);
        this.isPaused = true;
        this.isGameOver = false;

        this.player = {
            direction: "right",
            time: 0,
            speed: 1,
            score: 0,
            blocks: []
        };

        this.fruit = {
            value: 1,
            countdown: 0,
            position: { x: -1, y: -1 },
            interval: ((Math.sqrt(this.width * this.height) / 4) * 10) / this.blockSize
        };

        for (let i = 0; i < 5; i++) {
            this.player.blocks.push([this.blockSize, this.blockSize]);
        }

        this.drawBoard();
        this.drawPlayer();
        this.drawFruit();
        this.drawStart();
    }

    loop() {
        if (!this.isPaused && !this.isGameOver) {
            this.drawBoard();
            this.drawScoreboard();
            this.drawPlayer();
            this.drawFruit();
            this.movePlayer();
            this.detectCollision();

            this.t = setTimeout(() => { this.loop(); }, 70);
        }
    }

    handleKeypress(event) {
        switch (event.keyCode) {
            case 32: // spacebar
                if (this.isGameOver) {
                    this.setup();
                } else if (this.isPaused) {
                    this.isPaused = false;
                    this.loop();
                } else {
                    this.isPaused = true;
                    this.drawPause();
                }
                break;
            case 37: // left arrow key
                if (this.player.direction != "right") this.player.direction = "left";
                break;
            case 38: // up arrow key
                if (this.player.direction != "down") this.player.direction = "up";
                break;
            case 39: // right arrow key
                if (this.player.direction != "left") this.player.direction = "right";
                break;
            case 40: // down arrow key
                if (this.player.direction != "up") this.player.direction = "down";
                break;
        }
    }

    drawBoard() {
        this.ctx.fillStyle = "rgb(0, 0, 0)";
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.clearRect(this.blockSize, this.blockSize, this.width - (this.blockSize * 2), this.height - (this.blockSize * 2));
    }

    drawScoreboard() {
        let x = this.width / 2,
            y = (this.height / 2) + 40;

        this.ctx.font = "150pt Lucida Console";
        this.ctx.textAlign = "center";
        this.ctx.fillStyle = "rgba(84, 84, 84, 0.5)";
        this.ctx.fillText(this.player.score, x, y);
    }

    drawPlayer() {
        for (let i in this.player.blocks) {
            let [ x, y ] = this.player.blocks[i];

            this.ctx.fillStyle = "rgb(238, 238, 238)";
            this.ctx.fillRect(x, y, this.blockSize, this.blockSize);

            this.ctx.fillStyle = "rgb(255, 0, 0)";
            this.ctx.fillRect(x + 1, y + 1, this.blockSize - 1, this.blockSize - 2);
        }
    }

    drawFruit() {
        let x = this.fruit.position.x,
            y = this.fruit.position.y;

        if (this.fruit.countdown <= 0) {
            let notDone = true;

            while (notDone) {
                x = this.randomFromTo(1, (this.width / this.blockSize - 2)) * this.blockSize;
                y = this.randomFromTo(1, (this.height / this.blockSize - 2)) * this.blockSize;

                // make sure fruit is not on an occupied position
                for (let i in this.player.blocks) {
                    let [ px, py ] = this.player.blocks[i];

                    if (x != px && y != py) notDone = false;
                }
            }

            this.fruit.position.x = x;
            this.fruit.position.y = y;
            this.fruit.countdown = this.fruit.interval;
        }

        this.fruit.countdown -= 1;
        this.ctx.fillStyle = "rgb(34, 139, 34)";
        this.ctx.fillRect(x, y, this.blockSize, this.blockSize);
    }

    drawCenteredText(text, color = "blue") {
        let x = this.width / 2,
            y = this.height / 2;

        this.ctx.font = (30 * (this.width / 400)) + 'pt Calibri';
        this.ctx.textAlign = "center";
        this.ctx.fillStyle = color;
        this.ctx.fillText(text, x, y);
    }

    drawStart() {
        this.drawCenteredText("Snake!");
    }

    drawPause() {
        this.drawCenteredText("Paused!");
    }

    drawGameOver() {
        this.drawCenteredText("Game Over!");
    }

    movePlayer() {
        switch (this.player.direction) {
            case "left":
                this.player.blocks.unshift([this.player.blocks[0][0] - this.blockSize, this.player.blocks[0][1]]);
                break;
            case "right":
                this.player.blocks.unshift([this.player.blocks[0][0] + this.blockSize, this.player.blocks[0][1]]);
                break;
            case "up":
                this.player.blocks.unshift([this.player.blocks[0][0], this.player.blocks[0][1] - this.blockSize]);
                break;
            case "down":
                this.player.blocks.unshift([this.player.blocks[0][0], this.player.blocks[0][1] + this.blockSize]);
                break;
        }
        this.player.blocks.pop();
    }

    detectCollision() {
        let [ x, y ] = this.player.blocks[0];

        // make sure user is with the bounds
        if (x >= (this.width - this.blockSize)
            || y >= (this.height - this.blockSize)
            || x < this.blockSize
            || y < this.blockSize
        ) {
            this.isGameOver = true;
            this.drawGameOver();
        }

        // check if the player collided with the fruit
        if (x == this.fruit.position.x && y == this.fruit.position.y) {
            this.player.score += this.fruit.value;
            this.fruit.countdown = 0;
            this.player.blocks.push(this.player.blocks[this.player.blocks.length - 1]);
        }

        // check if player collided with self
        for (let i in this.player.blocks) {
            if (i == 0) continue;

            if (this.player.blocks[0][0] == this.player.blocks[i][0] && this.player.blocks[0][1] == this.player.blocks[i][1]) {
                this.isGameOver = true;
                this.drawGameOver();
            }
        }
    }

    randomFromTo(from, to) {
        return Math.floor(Math.random() * (to - from + 1) + from);
    }
}
