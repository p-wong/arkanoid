//Posts the user's login name to the backend for populating the high-scores board
function firstPost(){
  fetch("http://localhost:3000/scores", {
    method: 'POST',
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      score: 0,
      user_id: parseInt(localStorage.getItem("user_id"))
    })
  })
}

//Draws the initial canvas for the game & high scores board
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

  //Fetches the users' names from the backend
  fetch('http://localhost:3000/users')
  .then(x => x.json())
  .then(json => topScores(json))

  //Fetches the scores from the backend, according to the username, and sorts it from highest to lowest
  function topScores(userData){
    fetch('http://localhost:3000/scores')
    .then(x => x.json())
    .then(json=>json.data.sort((a,b) => b.attributes.score - a.attributes.score))
    .then(function(json){
        scoreWrap.innerHTML = (`<label>Top Scores</label>`)
        json.forEach(function(x){
        let user = userData.data.find(player => parseInt(player.id) === x.attributes['user-id'])
        scoreWrap.innerHTML += (`
          <ul>
          <li id='${user.id}'>${user.attributes.name}:<span>${x.attributes.score}</span></li>
          </ul>`)
        });
    })
}

//Declare variables needed for ball movement, paddle, bricks design, and score / lives.
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
var brickRowCount = 20;
var brickColumnCount = 20;
var brickWidth = 25;
var brickHeight = 17.5;
var brickPadding = 2.5;
var brickOffsetTop = 50;
var brickOffsetLeft = 25;
var score = 0;
var lives = 3;

var bricks = makeConfig()


//Creates the canvas when the game is over
const endGameCanvas = document.createElement("canvas");
endGameCanvas.setAttribute('width', 600);
endGameCanvas.setAttribute('height', 500);

//Creates the canvas when the game is won
const winGameCanvas = document.createElement("canvas");
winGameCanvas.setAttribute('width', 600);
winGameCanvas.setAttribute('height', 500);

//Creates the 'Play Again' button for when the game is over (win or lose)
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
   startGame();
 })
}

function showWinGame() {
 container.innerHTML = ""
 container.append(winGameCanvas)
 container.append(lineBreak)
 container.append(playAgainButton)

 playAgainButton.addEventListener('click', function (){
   startGame();
 })
}

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener("mousemove", mouseMoveHandler, false);

//Event listeners for keyboard up movement
function keyDownHandler(e) {
 if(e.keyCode == 39) {
   rightPressed = true;
 }
 else if(e.keyCode == 37) {
   leftPressed = true;
 }
}

//Event listeners for keyboard down movement
function keyUpHandler(e) {
 if(e.keyCode == 39) {
   rightPressed = false;
 }
 else if(e.keyCode == 37) {
   leftPressed = false;
 }
}

//Event listeners for mouse movement
function mouseMoveHandler(e) {
 var relativeX = e.clientX - canvas.offsetLeft;
 if(relativeX > 0 && relativeX < canvas.width) {
   paddleX = relativeX - paddleWidth/2;
 }
}

//Function for when the ball hits the walls or one of the bricks
function collisionDetection() {
 for(var c=0; c<brickColumnCount; c++) {
   for(var r=0; r<brickRowCount; r++) {
     var b = bricks[c][r];

     if(b.status == 1) {
       if(x > b.x && x < b.x+brickWidth && y > b.y && y < b.y+brickHeight) {

         //Every time the ball hits the brick, it will reverse the direction
         dy = -dy;

         //the brick will disappear
         b.status = 0;

         //the score will increase by one
         score++;

         //If the score is equal to the number of bricks on the layout, the user has won and their score will be posted to the backend
         if(score == brickRowCount*brickColumnCount) {
           fetch(`http://localhost:3000/scores${parseInt(localStorage.getItem("user_id"))}`, {
             method: 'PATCH',
             headers: {
               "Accept": "application/json",
               "Content-Type": "application/json"
             },
             body: JSON.stringify({
               score: score,
               user_id: parseInt(localStorage.getItem("user_id"))
             })
           })

           //Winning screen will be displayed
           const youWinText = winGameCanvas.getContext("2d");
           youWinText.font = "50px Audiowide";
           youWinText.fillStyle = "white";
           youWinText.textAlign = "center";
           youWinText.fillText("You Win!", winGameCanvas.width/2, winGameCanvas.height/2);

           //Their score will be displayed
           const yourScore = winGameCanvas.getContext("2d");
           yourScore.font = "25px Audiowide";
           yourScore.fillStyle = "white";
           yourScore.textAlign = "center";
           yourScore.fillText(`Score: ${score}`, winGameCanvas.width/2, winGameCanvas.height/2 + 35);

           showWinGame();
           break;
         }
       }
     }
   }
 }
}

//Draw the ball on the canvas (circular white ball)
function drawBall() {
 ctx.beginPath();
 ctx.arc(x, y, ballRadius, 0, Math.PI*2);
 ctx.fillStyle = "white";
 ctx.fill();
 ctx.closePath();
}

//Draw the paddle on the canvas (variables declared near top of page)
function drawPaddle() {
 ctx.beginPath();
 ctx.rect(paddleX, canvas.height-paddleHeight, paddleWidth, paddleHeight);
 ctx.fillStyle = "white";
 ctx.fill();
 ctx.closePath();
}

//Draw the bricks - the status is defined in the design below
function drawBricksFromBoard() {
 for(let x=0; x<bricks.length; x++){
   for(let y=0; y<bricks[x].length; y++) {
     if (bricks[x][y].status == 1) {
       ctx.beginPath();
       var brickX = brickOffsetTop+(x*25)+brickPadding
       var brickY = brickOffsetLeft+(y*17.5)+brickPadding
       bricks[x][y].x = brickX;
       bricks[x][y].y = brickY;
       ctx.rect(brickX, brickY, brickWidth-5, brickHeight-5);
       ctx.fillStyle = "white";
       ctx.fill();
       ctx.closePath();
     }
   }
 }
}
function makeConfig() {
 config = []
 design = [
  [0,0,0,0,1,1,0,0,0,1,1,0,0,0,1,1,0,0,0,0],
  [0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0],
  [0,0,1,1,0,0,0,0,1,1,1,0,0,0,0,0,1,1,0,0],
  [0,1,1,0,0,0,0,0,1,1,1,0,0,0,0,0,0,1,1,0],
  [1,1,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,1,1],
  [1,0,0,0,0,0,0,1,0,1,1,0,0,0,0,0,0,0,0,1],
  [0,0,0,0,0,0,1,1,0,1,1,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,1,0,0,1,1,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,1,1,0,0,1,1,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0],
  [0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,1,1,0,0,1,1,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,1,1,0,0,1,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,1,1,0,1,1,0,0,0,0,0,0],
  [1,0,0,0,0,0,0,0,0,1,1,0,1,0,0,0,0,0,0,1],
  [1,1,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,1,1],
  [0,1,1,0,0,0,0,0,0,1,1,1,0,0,0,0,0,1,1,0],
  [0,0,1,1,0,0,0,0,0,1,1,1,0,0,0,0,1,1,0,0],
  [0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0],
  [0,0,0,0,1,1,0,0,0,1,1,0,0,0,1,1,0,0,0,0]
 ];
 for(var c=0; c<brickColumnCount; c++) {
   config[c] = []
   for(var r=0; r<brickRowCount; r++) {
     config[c][r] = { x: 0, y: 0, status: design[r][c] };
   }
 }
 return config;
}

//Prints the score on the top left corner of the canvas
function drawScore() {
 ctx.font = "18px Audiowide";
 ctx.fillStyle = "white";
 ctx.fillText("Score: "+score, 8, 20);
}

//Prints the lives left on the top right corner of the canvas
function drawLives() {
 ctx.font = "18px Audiowide";
 ctx.fillStyle = "white";
 ctx.fillText("Lives: "+lives, canvas.width-85, 20);
}

//Draws everything onto the canvas
function draw() {
 ctx.clearRect(0, 0, canvas.width, canvas.height);
 drawBricksFromBoard();
 drawBall();
 drawPaddle();
 drawScore();
 drawLives();
 collisionDetection();

 //Reverses the ball if it hits the borders
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
   //If it hits the bottom border, decrease a life
   else {
     lives--;

     //If no more lives, update the users' score in the backend to the current score
     if(!lives) {
       fetch(`http://localhost:3000/scores/${parseInt(localStorage.getItem("user_id"))}`, {
         method: 'PATCH',
         headers: {
           "Accept": "application/json",
           "Content-Type": "application/json"
         },
         body: JSON.stringify({
           score: score,
           user_id: parseInt(localStorage.getItem("user_id"))
         })
       })

       //Show end game screen
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

//Countdown before the game begins 
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
}, 1000)}
