function startGame() {
  const canvas = document.createElement("canvas");

  canvas.setAttribute('width', 600);
  canvas.setAttribute('height', 500);
  canvas.setAttribute('id', "myCanvas");
  var ctx = canvas.getContext("2d");

  const container = document.querySelector("div.container")
  container.innerHTML = ""
  container.append(canvas)

  const scoreWrap = document.querySelector("div.scoreWrap")

  fetch('http://localhost:3000/users')
  .then(x => x.json())
  .then(json => display(json))

  function display(json){
    scoreWrap.innerHTML = (`<label>Top Scores</label>`)
    json.data.forEach(function(x){
    scoreWrap.innerHTML += (`
      <ul>
      <li id='${x.id}'>${x.attributes.name}: </li>
      </ul>`)
    });
    topScores()
  }

function topScores(){
  fetch('http://localhost:3000/scores')
  .then(x => x.json())
  .then(function(json){
    json.data.forEach(function(x){
      let test = document.getElementById(`${x.id}`)
        test.innerHTML += (`<span>${x.attributes.score}</span>`)
    })
  })
}

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
  var brickRowCount = 7;
  var brickColumnCount = 6;
  var brickWidth = 75;
  var brickHeight = 20;
  var brickPadding = 10;
  var brickOffsetTop = 60;
  var brickOffsetLeft = 8;
  var score = 0;
  var lives = 3;

  var bricks = [];
  for(var c=0; c<brickColumnCount; c++) {
    bricks[c] = [];
    for(var r=0; r<brickRowCount; r++) {
      bricks[c][r] = { x: 0, y: 0, status: 1 };
    }
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
              alert(`YOU WIN, CONGRATS! your score was ${score}`);
              fetch("http://localhost:3000/scores", {
                method: 'POST',
                headers: {
                  "Accept": "application/json",
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  score: parseInt(score),
                  user_id: parseInt(localStorage.getItem("user_id")) })
              })
              document.location.reload();
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
    for(var c=0; c<brickColumnCount; c++) {
      for(var r=0; r<brickRowCount; r++) {
        if(bricks[c][r].status == 1) {
          var brickX = (r*(brickWidth+brickPadding))+brickOffsetLeft;
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
        //  alert('YOU LOSE BITCH');
      console.log(localStorage.getItem("user_id"))
          fetch("http://localhost:3000/scores", {
            method: 'POST',
            headers: {
              "Accept": "application/json",
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              score: score,
              user_id: parseInt(localStorage.getItem("user_id"))
            })
          })
      document.location.reload();
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

  draw();
}
