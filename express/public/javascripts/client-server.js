//-------------AJAX---------------------------------------
function Laberinto() {
    var data = {};
    $.ajax({
        type: 'POST',
        contentType: 'application/json',
        url: 'http://localhost:3000/generaMaze',
        success: function (data) {
            maze = jsonMaze(JSON.parse(data));
            draw();
            console.log('success');
        }
    });
}
//---------------------------------------------------------------
function enviaDatos(x, y) {
    var data = { x: x, y: y };
    $.ajax({
        type: 'POST',
        data: data,
        ontentType: 'application/json',
        url: 'http://localhost:3000/insert',
        success: function (data) {
            console.log(data.done);
        }
    });
}
//----------------------Audio fondo
function sound(src) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.play = function(){
            this.sound.play();
        }
    this.stop = function(){
        this.sound.pause();
    }
}

function soundTrack(src){
    myAudio = new Audio(src);
    myAudio.addEventListener('ended', function() {
        this.currentTime = 0;
        this.play();
    }, false);
    myAudio.play();
}
//-----------------------------------------------------------------
var canvas,leftRight = 420,upDown = 65;
var music;
var maze = [];
window.onload = function () {
    Laberinto();
    canvas = $('#Maze');
    empezarDetener(this);
    soundTrack('/sound/back.mp3');
    document.onkeydown = press;
}

function jsonMaze(data) {
    var mazeTemp = [];
    data.forEach(x => mazeTemp.push(x.linea));
    return mazeTemp;
}

var player = {
    x: 1,
    y: 0
};

function fillAll(blockSize, ctx) {
    function fillIt(y, x) {
        if (x < maze[y].length) {
            (maze[y][x] === 1) ? (ctx.fillStyle = "black",ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize)) : (
                (maze[y][x] === -1) ? (
                    ctx.beginPath(),
                    ctx.lineWidth = 5,
                    ctx.strokeStyle = "gold",
                    ctx.moveTo(x * blockSize, y * blockSize),
                    ctx.lineTo((x + 1) * blockSize, (y + 1) * blockSize),
                    ctx.moveTo(x * blockSize, (y + 1) * blockSize),
                    ctx.lineTo((x + 1) * blockSize, y * blockSize),
                    ctx.stroke()) : (maze[y][x]===5)?
                    (ctx.fillStyle = "yellow",
                    ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize)):0
                  );
            fillIt(y, x + 1);
        } else if (y < maze.length - 1) {
            fillIt(y + 1, 0);
        }
    }
    fillIt(0, 0);
}

//---------------------------Primera vez-----------------------
function draw() {
    var width = canvas.width();
    var half;
    var blockSize = width / ((maze.length) + 20);
    var ctx = canvas[0].getContext('2d');
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, width, width);
        ctx.fillStyle = "black";
        //Loop through the maze array drawing the walls and the goal
        fillAll(blockSize, ctx);
        //Draw the player
        ctx.beginPath();
        half = blockSize / 2;
        ctx.fillStyle = "white";
        ctx.arc(player.x * blockSize + half, player.y * blockSize + half, half, 0, 2 * Math.PI);
        ctx.fill();
}

//Check to see if the new space is inside the maze and not a wall
function canMove(x, y) {
    return (y >= 0) && (y < maze.length) && (x >= 0) && (x < maze[y].length) && (maze[y][x] != 1);
}


function press(e) {
    var hit = new sound('/sound/Articuno.ogg');

  switch(e.which){
    case 38:
    if(canMove(player.x, player.y-1)){
        upDown -= 10;
        document.getElementById("Arti").style.paddingTop = upDown+"px";
      player.y--;
    }else{
    hit.play();
    }
    break;

    case 40:
    if(canMove(player.x, player.y+1)){
        upDown += 10;
        document.getElementById("Arti").style.paddingTop = upDown+"px";
      player.y++;
    }else{
      hit.play();
    }
    break;

    case 37:
    if(canMove(player.x-1, player.y)){
      player.x--;
      leftRight -=10;
      document.getElementById("Arti").style.paddingLeft = leftRight+"px";
    }else{
      hit.play();
    }
    break;

    case 39:
    if(canMove(player.x+1, player.y)){
      player.x++;
      leftRight +=10;
      document.getElementById("Arti").style.paddingLeft = leftRight+"px";
    }else{
      hit.play();
    }
    break;

  }
var win,dab = new sound('/sound/dab.mp3'),ctx = canvas[0].getContext('2d');
    enviaDatos(player.x, player.y);
    draw();
    if(player.x == 79 && player.y ==59){
        win = new Image();
        win.src ='/images/youwin.jpg';
        ctx.drawImage(win,0,0);
        ctx.stroke();
    }

    if(player.x==80 && player.y==59){
        music.stop();
        dab.play();
        win = new Image();
        win.src ='/images/youwin.jpg';
        ctx.drawImage(win,0,0);
        ctx.stroke();
        empezarDetener(this);
        document.onkeydown = desabilitar;
    }
    e.preventDefault();
}
//---------------------------------------------------------------------------
function searchMaze(y, x) {
    var sol;
    function searchMaze(y, x, m) {
      if(!sol){
        if (maze[y][x]!=5) {
          var log1 =(x < 0) || (x > 80) || (y < 0) || (y > 59);
            if (!log1) {
                var log2 = m[y][x] == 1;
                if (!log2) {
                    var copy = m.map((arr) => arr.slice());
                    copy[y][x] = 2;  // estoy bien
                    maze[y][x] = 5;
                    player.y = y;
                    player.x = x;
                    if ((x == 80) && (y == 59)) {
                        console.log("Yuhu!, i have found the way out!");
                        sol = copy.map((arr) => arr.slice());
                        return sol;
                    }
                    searchMaze(y + 1, x, copy);   // abajo
                    searchMaze(y, x + 1, copy);   // der
                    searchMaze(y - 1, x, copy);   // arriba
                    searchMaze(y, x - 1, copy);   // izq

                }
            }
        }
    }else{return sol;}}
    searchMaze(y, x, maze);
    return sol;
}
//--------------------------------------------------RESPUESTA MARCADA-------------------------------------------------------------
function fillAllAnswer(blockSize, ctx) {
    function fillItAnswer(y, x) {
        var win;

        if (x < maze[y].length) {
            switch (maze[y][x]) {
                case 0:
                    ctx.fillStyle = "white";
                    break;
                case 1:
                    ctx.fillStyle = "black";
                    break;
                case 2:
                    ctx.fillStyle = "red";
                    break;
            }
            ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
            fillItAnswer(y, x + 1);
        } else if (y < maze.length - 1) {
            fillItAnswer(y + 1, 0);
        }
    }
    fillItAnswer(0, 0);
}

function drawAnswer() {
    maze = searchMaze(0, 1);
    dab = new sound('/sound/aplauso.mp3');
    var width = canvas.width();
    var blockSize = width / ((maze.length) + 20);
    var ctx = canvas[0].getContext('2d');
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, width, width);
    //Loop through the maze array drawing the walls and the goal
    fillAllAnswer(blockSize, ctx);
    if(player.x==80 && player.y==59){
        music.stop();
        dab.play();
        empezarDetener(this);
        document.getElementById("Arti").style.paddingLeft = "1200px";
        document.getElementById("Arti").style.paddingTop = "650px";
        document.onkeydown = desabilitar;
    }
}

function drawAnswer2() {
    maze = searchMaze(player.y, player.x);
    console.log(JSON.stringify(maze));
    var width = canvas.width();
    var blockSize = width / ((maze.length) + 20);
    var ctx = canvas[0].getContext('2d');
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, width, width);
    //Loop through the maze array drawing the walls and the goal
    fillAllAnswer(blockSize, ctx);
}

function desabilitar() {
    if (event.ctrlKey) {
        switch(window.event.keyCode) {
            case 38:
            case 40:
            case 37:
            case 39:
            event.keyCode = 0;
                return false;
            default:
            break;
        }
    }
}

//-----------------------Cronometro
var inicio=0;
var timeout=0;

	function empezarDetener(elemento)
	{
		if(timeout==0)
		{
			// empezar el cronometro

			elemento.value="Detener";

			// Obtenemos el valor actual
			inicio=vuelta=new Date().getTime();

			// iniciamos el proceso
			funcionando();
		}else{
			// detemer el cronometro

			elemento.value="Empezar";
			clearTimeout(timeout);
			timeout=0;
		}
	}

	function funcionando()
	{
		// obteneos la fecha actual
		var actual = new Date().getTime();

		// obtenemos la diferencia entre la fecha actual y la de inicio
		var diff=new Date(actual-inicio);

		// mostramos la diferencia entre la fecha actual y la inicial
		var result=LeadingZero(diff.getUTCHours())+":"+LeadingZero(diff.getUTCMinutes())+":"+LeadingZero(diff.getUTCSeconds());
		document.getElementById('crono').innerHTML = result;

		// Indicamos que se ejecute esta función nuevamente dentro de 1 segundo
		timeout=setTimeout("funcionando()",1000);
	}

	/* Funcion que pone un 0 delante de un valor si es necesario */
	function LeadingZero(Time) {
		return (Time < 10) ? "0" + Time : + Time;
	}
