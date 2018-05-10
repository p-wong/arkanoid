function startGame() {

  const canvas = document.createElement("canvas");
  canvas.setAttribute('width', 600);
  canvas.setAttribute('height', 500);
  canvas.setAttribute('id', "myCanvas");
  var ctx = canvas.getContext("2d");

  const container = document.querySelector("div.container")
  container.innerHTML = ""
  container.append(canvas)

  var ballRadius = 10;
  var x = canvas.width/2;
  var y = canvas.height-30;
  var dx = 5;
  var dy = -5;
  var paddleHeight = 10;
  var paddleWidth = 70;
  var paddleX = (canvas.width-paddleWidth)/2;
  var rightPressed = false;
  var leftPressed = false;
  var brickRowCount = 2;
  var brickColumnCount = 13;
  var brickWidth = 75;
  var brickHeight = 15;
  var brickPadding = 10;
  var brickOffsetTop = 40;
  var brickOffsetLeft = canvas.width/2.3;
  var score = 0;
  var lives = 3;

  var bricks = [];
  for(var c=0; c<brickColumnCount; c++) {
    bricks[c] = [];
    for(var r=0; r<brickRowCount; r++) {
      bricks[c][r] = { x: 0, y: 0, status: 1 };
    }
  }

  const endGameCanvas = document.createElement("canvas");
  endGameCanvas.setAttribute('width', 600);
  endGameCanvas.setAttribute('height', 400);

  const playAgainButton = document.createElement('button')
  playAgainButton.setAttribute("class", "submit")
  playAgainButton.innerText = 'Play Again'

  const lineBreak = document.createElement('br')

  function showEndGame() {
    container.innerHTML = ""
    container.append(endGameCanvas)
    container.append(lineBreak)
    container.append(playAgainButton)

    playAgainButton.addEventListener('click', function (){
      countdown();
    })
  }

  document.addEventListener("keydown", keyDownHandler, false);
  document.addEventListener("keyup", keyUpHandler, false);
  document.addEventListener("mousemove", mouseMoveHandler, false);

  function keyDownHandler(e) {
    if(e.keyCode == 39) {
      rightPressed = true;
    }
    else if(e.keyCode == 37) {
      leftPressed = true;
    }
  }
  function keyUpHandler(e) {
    if(e.keyCode == 39) {
      rightPressed = false;
    }
    else if(e.keyCode == 37) {
      leftPressed = false;
    }
  }
  function mouseMoveHandler(e) {
    var relativeX = e.clientX - canvas.offsetLeft;
    if(relativeX > 0 && relativeX < canvas.width) {
      paddleX = relativeX - paddleWidth/2;
    }
  }
  function collisionDetection() {
    for(var c=0; c<brickColumnCount; c++) {
      for(var r=0; r<brickRowCount; r++) {
        var b = bricks[c][r];
        if(b.status == 1) {
          if(x > b.x && x < b.x+brickWidth && y > b.y && y < b.y+brickHeight) {
            dy = -dy;
            b.status = 0;
            score++;
            if(score == brickRowCount*brickColumnCount) {
              fetch("http://localhost:3000/scores", {
                method: 'POST',
                headers: {
                  "Accept": "application/json",
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  user_score: parseInt(score),
                  user_id: localStorage.getItem("user_id")
                })
              })
              const youWinText = endGameCanvas.getContext("2d");
              youWinText.font = "50px Audiowide";
              youWinText.fillStyle = "white";
              youWinText.textAlign = "center";
              youWinText.fillText("You Win!", endGameCanvas.width/2, endGameCanvas.height/2);

              const yourScore = endGameCanvas.getContext("2d");
              yourScore.font = "25px Audiowide";
              yourScore.fillStyle = "white";
              yourScore.textAlign = "center";
              yourScore.fillText(`Score: ${score}`, endGameCanvas.width/2, endGameCanvas.height/2 + 35);

              showEndGame();
              break;
            }
          }
        }
      }
    }
  }
  function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI*2);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.closePath();
  }
  function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height-paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.closePath();
  }
  function drawBricks() {
    let counter = 0
    for(var c=0; c<brickColumnCount; c++) {
      counter = counter - 10
      for(var r=0; r<brickRowCount; r++) {
        if(bricks[c][r].status == 1) {
          var brickX = (r*(brickWidth+(5*brickPadding)))+counter+brickOffsetLeft;
          var brickY = (c*(brickHeight+brickPadding))+brickOffsetTop;
          bricks[c][r].x = brickX;
          bricks[c][r].y = brickY;
          ctx.beginPath();
          ctx.rect(brickX, brickY, brickWidth, brickHeight);
          ctx.fillStyle = "white";
          ctx.fill();
          ctx.closePath();
        }
      }
    }
  }
  function drawScore() {
    ctx.font = "18px Audiowide";
    ctx.fillStyle = "white";
    ctx.fillText("Score: "+score, 8, 20);
  }
  function drawLives() {
    ctx.font = "18px Audiowide";
    ctx.fillStyle = "white";
    ctx.fillText("Lives: "+lives, canvas.width-85, 20);
  }

  function draw() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBall();
    drawPaddle();
    drawScore();
    drawLives();
    collisionDetection();

    if(x + dx > canvas.width-ballRadius || x + dx < ballRadius) {
      dx = -dx;
    }
    if(y + dy < ballRadius) {
      dy = -dy;
    }
    else if(y + dy > canvas.height-ballRadius) {
      if(x > paddleX && x < paddleX + paddleWidth) {
        dy = -dy;
      }
      else {
        lives--;
        if(!lives) {
          fetch("http://localhost:3000/scores", {
            method: 'POST',
            headers: {
              "Accept": "application/json",
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              user_score: parseInt(score),
              user_id: localStorage.getItem("user_id")
            })
          })
          const gameOver = endGameCanvas.getContext("2d");
          gameOver.font = "50px Audiowide";
          gameOver.fillStyle = "white";
          gameOver.textAlign = "center";
          gameOver.fillText("GAME OVER", endGameCanvas.width/2, endGameCanvas.height/2);

          const yourScore = endGameCanvas.getContext("2d");
          yourScore.font = "25px Audiowide";
          yourScore.fillStyle = "white";
          yourScore.textAlign = "center";
          yourScore.fillText(`Score: ${score}`, endGameCanvas.width/2, endGameCanvas.height/2 + 35);

          showEndGame();
        }
        else {
          x = canvas.width/2;
          y = canvas.height-30;
          dx = 5;
          dy = -5;
          paddleX = (canvas.width-paddleWidth)/2;
        }
      }
    }

    if(rightPressed && paddleX < canvas.width-paddleWidth) {
      paddleX += 10;
    }
    else if(leftPressed && paddleX > 0) {
      paddleX -= 10;
    }

    x += dx;
    y += dy;
    requestAnimationFrame(draw);

  }


  let count = 3;
  const countdown = setInterval(function(){
    console.log(count)

    const timerCanvas = document.createElement("canvas");
    timerCanvas.setAttribute('width', 600);
    timerCanvas.setAttribute('height', 500);
    timerCanvas.setAttribute('id', "myCanvas");

    const timerThree = timerCanvas.getContext("2d");
    timerThree.font = "80px Audiowide";
    timerThree.fillStyle = "white";
    timerThree.textAlign = "center";
    timerThree.fillText(count, canvas.width/2, canvas.height/2);

    count--

    container.innerHTML = ""
    container.append(timerCanvas)

    if (count === -1) {
      clearInterval(countdown);
      container.innerHTML = ""
      container.append(canvas)
      draw();
    }
  }, 1000)
}

//   function drawBricks() {
//     let counter = 0
//     for(var c=0; c<(brickColumnCount*.5); c++) {
//       counter = counter - 13
//       for(var r=0; r<1; r++) {
//         if(bricks[c][r].status == 1) {
//           var brickX = (r*(brickWidth+(10*brickPadding)))+counter+brickOffsetLeft;
//           var brickY = (c*(brickHeight+brickPadding))+brickOffsetTop;
//           bricks[c][r].x = brickX;
//           bricks[c][r].y = brickY;
//           ctx.beginPath();
//           ctx.rect(brickX, brickY, brickWidth, brickHeight);
//           ctx.fillStyle = "white";
//           ctx.fill();
//           ctx.closePath();
//         }
//       }
//     }
//     for(var c=0; c<brickColumnCount; c++) {
//       for(var r=0; r<1; r++) {
//         if(bricks[c][r].status == 1) {
//           var brickX = (r*(brickWidth+(5*brickPadding)))+counter+(1.548*brickOffsetLeft);
//           var brickY = (c*(brickHeight+brickPadding))+brickOffsetTop;
//           bricks[c][r].x = brickX;
//           bricks[c][r].y = brickY;
//           ctx.beginPath();
//           ctx.rect(brickX, brickY, brickWidth, brickHeight);
//           ctx.fillStyle = "white";
//           ctx.fill();
//           ctx.closePath();
//         }
//       }
//     }
//     for(var c=0; c<(brickColumnCount*.5); c++) {
//       counter = counter - 13
//       for(var r=0; r<1; r++) {
//         if(bricks[c][r].status == 1) {
//           var brickX = (r*(brickWidth+(10*brickPadding)))+counter+(2.2*brickOffsetLeft);
//           var brickY = (c*(brickHeight+brickPadding))+(7.67*brickOffsetTop);
//           bricks[c][r].x = brickX;
//           bricks[c][r].y = brickY;
//           ctx.beginPath();
//           ctx.rect(brickX, brickY, brickWidth, brickHeight);
//           ctx.fillStyle = "white";
//           ctx.fill();
//           ctx.closePath();
//         }
//       }
//     }
//     for(var c=0; c<1; c++) {
//       // counter = counter - 10
//       for(var r=0; r<brickRowCount; r++) {
//         if(bricks[c][r].status == 1) {
//           var brickX = (r*(brickWidth+(.75*brickPadding)))+115;
//           var brickY = (c*(brickHeight+brickPadding))+(7.67*brickOffsetTop);
//           bricks[c][r].x = brickX;
//           bricks[c][r].y = brickY;
//           ctx.beginPath();
//           ctx.rect(brickX, brickY, brickWidth, brickHeight);
//           ctx.fillStyle = "white";
//           ctx.fill();
//           ctx.closePath();
//         }
//       }
//     }
//   }
