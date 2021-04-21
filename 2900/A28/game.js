/*
game.js for Perlenspiel 3.3.x
Last revision: 2021-03-24 (BM)

The following comment lines are for JSHint <https://jshint.com>, a tool for monitoring code quality.
You may find them useful if your development environment is configured to support JSHint.
If you don't use JSHint (or are using it with a configuration file), you can safely delete these lines.
*/

/* jshint browser : true, devel : true, esversion : 6, freeze : true */
/* globals PS : true */

"use strict"; // Do NOT delete this directive!

/*
PS.init( system, options )
Called once after engine is initialized but before event-polling begins.
This function doesn't have to do anything, although initializing the grid dimensions with PS.gridSize() is recommended.
If PS.grid() is not called, the default grid dimensions (8 x 8 beads) are applied.
Any value returned is ignored.
[system : Object] = A JavaScript object containing engine and host platform information properties; see API documentation for details.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

var COLOR_1 = 0x66D8FF;
var COLOR_2 = 0x38FF57;
var COLOR_3 = 0xFF8145;
var COLOR_4 = 0xFF4FF5;
var BLACK = 0x000000;
const STARTSPEED = 10;
var SPEED = 10;
var circlesPos = [];
var CENTER_POS_X = 4;
var CENTER_POS_Y = 4;
var centerPos;
var topLeft;
var topRight;
var bottomLeft;
var bottomRight;
let sprite_id;
let sprite_tlx = -1;
let sprite_tly = -1;
let sprite_trx = 9;
let sprite_try = -1;
let sprite_blx = -1;
let sprite_bly = 9;
let sprite_brx = 9;
let sprite_bry = 9;

var ballTimer;
var ballCounter = 0;
var totalBallsPerLevel = 0;
var currentLevel = 1;
var ballSequence = []; //blue = 0, green = 1, orange = 2, magenta = 3
let levelSuccess = true;
var selectBalls = false;
var selectCounter = 0;
var highScore = 0;


var randomizeCircles = function () {
	var randBall = Math.floor(Math.random()*4);
	ballSequence.push(randBall);
	if (randBall == 0){
	//	playTopLeft();
		ballTimer = PS.timerStart(SPEED, playTopLeft);
	} else if (randBall == 1){
	//	playTopRight();
		ballTimer = PS.timerStart(SPEED, playTopRight);
	} else if (randBall == 2){
	//	playBottomLeft();
		ballTimer = PS.timerStart(SPEED, playBottomLeft);
	} else if (randBall == 3){
	//	playBottomRight();
		ballTimer = PS.timerStart(SPEED, playBottomRight);
	}

}


var moveTL = function (h, v){
	sprite_tlx += h;
	sprite_tly += v;
	PS.spriteMove(sprite_id, sprite_tlx, sprite_tly);
}

var moveTR = function (h, v){
	sprite_trx += h;
	sprite_try += v;
	PS.spriteMove(sprite_id, sprite_trx, sprite_try);
}

var moveBL = function (h, v){
	sprite_blx += h;
	sprite_bly += v;
	PS.spriteMove(sprite_id, sprite_blx, sprite_bly);
}

var moveBR = function (h, v){
	sprite_brx += h;
	sprite_bry += v;
	PS.spriteMove(sprite_id, sprite_brx, sprite_bry);
}


var playTopLeft = function () {
	PS.spriteShow(topLeft, 1);
	sprite_id = topLeft;
	if (sprite_tlx < 4) {
		moveTL(1, 1);
	} else {
		PS.spriteMove(topLeft, 0, 0);
		PS.spriteShow(topLeft, 0);
		ballCounter +=1;
		PS.timerStop(ballTimer);
		sprite_tlx = -1;
		sprite_tly = -1;
		PS.audioPlay("piano_c3");
		if (ballCounter < totalBallsPerLevel) {
			randomizeCircles();
		} else { //done spawning balls 
			selectBallsTime();
		}
	}
}

var playTopRight = function (){
	PS.spriteShow(topRight, 1);
	sprite_id = topRight;
	if (sprite_trx > 4) {
		moveTR(-1, 1);
	} else {
		PS.spriteMove(topRight, 8, 0);
		PS.spriteShow(topRight, 0);
		ballCounter +=1;
		PS.timerStop(ballTimer);
		sprite_trx = 9;
		sprite_try = -1;
		PS.audioPlay("piano_c4");
		if (ballCounter < totalBallsPerLevel) {
			randomizeCircles();
		} else { //done spawning balls 
			selectBallsTime();
		}
	}
}

var playBottomLeft = function (){
	PS.spriteShow(bottomLeft, 1);
	sprite_id = bottomLeft;
	if (sprite_blx < 4) {
		moveBL(1, -1);
	} else {
		PS.spriteMove(bottomLeft, 0, 8);
		PS.spriteShow(bottomLeft, 0);
		ballCounter +=1;
		PS.timerStop(ballTimer);
		sprite_blx = -1;
		sprite_bly = 9;
		PS.audioPlay("piano_c5");
		if (ballCounter < totalBallsPerLevel) {
			randomizeCircles();
		} else { //done spawning balls 
			selectBallsTime();
		}
	}
}

var playBottomRight = function (){
	PS.spriteShow(bottomRight, 1);
	sprite_id = bottomRight;
	if (sprite_brx > 4) {
		moveBR(-1, -1);
	} else {
		PS.spriteMove(bottomRight, 8, 8);
		PS.spriteShow(bottomRight, 0);
		ballCounter +=1;
		PS.timerStop(ballTimer);
		sprite_brx = 9;
		sprite_bry = 9;
		PS.audioPlay("piano_c6");
		if (ballCounter < totalBallsPerLevel) {
			randomizeCircles();
		} else { //done spawning balls 
			selectBallsTime();
		}
	}
}

var selectBallsTime = function() {
	selectBalls = true;
	PS.alpha(1, 10, 255);
	PS.alpha(3, 10, 255);
	PS.alpha(5, 10, 255);
	PS.alpha(7, 10, 255);
}

var levelComplete = function() {
	selectBalls = false;
	var displayTimer;
	var timerTicks = 60;
	var startNextLevel = function () {
		initLevel();
		PS.timerStop(displayTimer);
	}
	if (levelSuccess == true) { //IF YOU BEAT THE LEVEL
		PS.statusText("Level Complete!");
	} else { //IF YOU FAILED THE LEVEL
		timerTicks = 180;
		PS.statusText("GAME OVER! Score: " + currentLevel);
		if (currentLevel > highScore) highScore = currentLevel;
	}
	
	displayTimer = PS.timerStart(timerTicks, startNextLevel);

}

var initLevel = function(){
	PS.gridShadow( false, PS.COLOR_GRAY_LIGHT );
	PS.alpha(1, 10, 100);
	PS.alpha(3, 10, 100);
	PS.alpha(5, 10, 100);
	PS.alpha(7, 10, 100);

	if (highScore > 0) {
		PS.statusText("Current Score: " + currentLevel + "  High Score: " + highScore);
	} else PS.statusText("Current Score: " + currentLevel);
	if (currentLevel < 5) {
		totalBallsPerLevel += 1;
		SPEED -= 1;
	} else {
		if (currentLevel % 2 == 0 && currentLevel > 7) { // balls increase every other level after 7
			totalBallsPerLevel += 1;
		}
	}
	selectBalls = false;
	selectCounter = 0;
	ballCounter = 0;
	ballSequence = [];
	if (levelSuccess == true) {
		randomizeCircles();
	} else {
		//if u fail a level for now we just go back to beginning hahaha
		SPEED = STARTSPEED;
		currentLevel = 1;
		totalBallsPerLevel = 0;
		levelSuccess = true;
		initLevel();
	}
}

PS.init = function( system, options ) {
	// Change this string to your team name
	// Use only ALPHABETIC characters
	// No numbers, spaces or punctuation!

	const TEAM = "frog";

	// Begin with essential setup
	// Establish initial grid size

	PS.gridSize( 9, 11); // or whatever size you want

	// Install additional initialization code
	// here as needed

	centerPos = PS.spriteSolid(1, 1);
	PS.spriteSolidColor(centerPos, BLACK);
	PS.spriteMove(centerPos, 4, 4);


	topLeft = PS.spriteSolid(1, 1);
	PS.spriteSolidColor(topLeft, COLOR_1);
	PS.spriteMove(topLeft, 0, 0);
	PS.spriteShow(topLeft, 0);
	PS.spritePlane(topLeft, 1);

	topRight = PS.spriteSolid(1, 1);
	PS.spriteSolidColor(topRight, COLOR_2);
	PS.spriteMove(topRight, 8, 0);
	PS.spriteShow(topRight, 0);
	PS.spritePlane(topRight, 1);

	bottomLeft = PS.spriteSolid(1, 1);
	PS.spriteSolidColor(bottomLeft, COLOR_3);
	PS.spriteMove(bottomLeft, 0, 8);
	PS.spriteShow(bottomLeft, 0);
	PS.spritePlane(bottomLeft, 1);


	bottomRight = PS.spriteSolid(1, 1);
	PS.spriteSolidColor(bottomRight, COLOR_4);
	PS.spriteMove(bottomRight, 8, 8);
	PS.spriteShow(bottomRight, 0);
	PS.spritePlane(bottomRight, 1);


	PS.color(1, 10, COLOR_1);
	PS.color(3, 10, COLOR_2);
	PS.color(5, 10, COLOR_3);
	PS.color(7, 10, COLOR_4);
	PS.color(PS.ALL, 9, 0x000000);

	PS.radius(PS.ALL, PS.ALL, 50);
	PS.radius(PS.ALL, 9, 0);
	PS.scale(PS.ALL, 9, 50);
	PS.border(PS.ALL, PS.ALL, 0);

	initLevel();
	// PS.dbLogin() must be called at the END
	// of the PS.init() event handler (as shown)
	// DO NOT MODIFY THIS FUNCTION CALL
	// except as instructed

	PS.dbLogin( "imgd2900", TEAM, function ( id, user ) {
		if ( user === PS.ERROR ) {
			//return PS.dbErase( TEAM );
			return;
		}
		PS.dbEvent( TEAM, "startup", user );
		//PS.dbSave( TEAM, PS.CURRENT, { discard : true } );
		PS.dbSend( TEAM, PS.CURRENT, { discard : true } );
	}, { active : false } );
};


/*
PS.touch ( x, y, data, options )
Called when the left mouse button is clicked over bead(x, y), or when bead(x, y) is touched.
This function doesn't have to do anything. Any value returned is ignored.
[x : Number] = zero-based x-position (column) of the bead on the grid.
[y : Number] = zero-based y-position (row) of the bead on the grid.
[data : *] = The JavaScript value previously associated with bead(x, y) using PS.data(); default = 0.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/
const onClickAlpha = 150;
PS.touch = function( x, y, data, options ) {
	//PS.color(1, 10, COLOR_1);
	//PS.color(3, 10, COLOR_2);
	//PS.color(5, 10, COLOR_3);
	//PS.color(7, 10, COLOR_4);
	//selectCounter = 0;
	//blue = 0, green = 1, orange = 2, magenta = 3
	//PS.debug("selectBalls: " + selectBalls + "\n");
	//PS.debug(ballSequence[selectCounter]);
	//PS.debug("x:"+x+" y:"+y+"\n");
	if (selectBalls == true) {
		if (x == 1 && y == 10) { //COLOR_1
			PS.alpha(x,y, onClickAlpha);
			PS.audioPlay("piano_c3");
			if (ballSequence[selectCounter] == 0) {
				//PS.debug("correct selection");
				//PS.gridShadow( true, PS.COLOR_GREEN );
				selectCounter += 1;
				if (selectCounter == ballSequence.length) {
					PS.gridShadow( true, PS.COLOR_GREEN );
					levelSuccess = true;
					currentLevel += 1;
					levelComplete();
				}
			} else { //the player messed up
				PS.gridShadow( true, PS.COLOR_RED );
				//PS.audioPlay("piano_a0");
				levelSuccess = false;
				levelComplete();
			}
		} else if (x == 3 && y == 10) { //COLOR_2
			PS.alpha(x,y, onClickAlpha);
			PS.audioPlay("piano_c4");
			if (ballSequence[selectCounter] == 1) {
				//PS.debug("correct selection");
				//PS.gridShadow( true, PS.COLOR_GREEN );
				selectCounter += 1;
				if (selectCounter == ballSequence.length) {
					PS.gridShadow( true, PS.COLOR_GREEN );
					levelSuccess = true;
					currentLevel += 1;
					levelComplete();
				}
			} else { //the player messed up
				PS.gridShadow( true, PS.COLOR_RED );
				//PS.audioPlay("piano_a0");
				levelSuccess = false;
				levelComplete();
			}
			
		} else if (x == 5 && y == 10) { //COLOR_3
			PS.alpha(x,y, onClickAlpha);
			PS.audioPlay("piano_c5");
			if (ballSequence[selectCounter] == 2) {
				//PS.debug("correct selection");
				//PS.gridShadow( true, PS.COLOR_GREEN );
				selectCounter += 1;
				if (selectCounter == ballSequence.length) {
					PS.gridShadow( true, PS.COLOR_GREEN );
					levelSuccess = true;
					currentLevel += 1;
					levelComplete();
				}
			} else { //the player messed up
				PS.gridShadow( true, PS.COLOR_RED );
				//PS.audioPlay("piano_a0");
				levelSuccess = false;
				levelComplete();
			}
		} else if (x == 7 && y == 10) { //COLOR_4
			PS.alpha(x,y, onClickAlpha);
			PS.audioPlay("piano_c6");
			if (ballSequence[selectCounter] == 3) {
				//PS.debug("correct selection");
				//PS.gridShadow( true, PS.COLOR_GREEN );
				selectCounter += 1;
				if (selectCounter == ballSequence.length) {
					PS.gridShadow( true, PS.COLOR_GREEN );
					levelSuccess = true;
					currentLevel += 1;
					levelComplete();
				}
			} else { //the player messed up
				PS.gridShadow( true, PS.COLOR_RED );
				//PS.audioPlay("piano_a0");
				levelSuccess = false;
				levelComplete();
			}
		}
	}

	// Add code here for mouse clicks/touches
	// over a bead.
};

/*
PS.release ( x, y, data, options )
Called when the left mouse button is released, or when a touch is lifted, over bead(x, y).
This function doesn't have to do anything. Any value returned is ignored.
[x : Number] = zero-based x-position (column) of the bead on the grid.
[y : Number] = zero-based y-position (row) of the bead on the grid.
[data : *] = The JavaScript value previously associated with bead(x, y) using PS.data(); default = 0.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

PS.release = function( x, y, data, options ) {
	// Uncomment the following code line to inspect x/y parameters:

	// PS.debug( "PS.release() @ " + x + ", " + y + "\n" );
	PS.alpha(x,y, 255);

	// Add code here for when the mouse button/touch is released over a bead.
};

/*
PS.enter ( x, y, button, data, options )
Called when the mouse cursor/touch enters bead(x, y).
This function doesn't have to do anything. Any value returned is ignored.
[x : Number] = zero-based x-position (column) of the bead on the grid.
[y : Number] = zero-based y-position (row) of the bead on the grid.
[data : *] = The JavaScript value previously associated with bead(x, y) using PS.data(); default = 0.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

PS.enter = function( x, y, data, options ) {
	// Uncomment the following code line to inspect x/y parameters:

	// PS.debug( "PS.enter() @ " + x + ", " + y + "\n" );

	// Add code here for when the mouse cursor/touch enters a bead.
};

/*
PS.exit ( x, y, data, options )
Called when the mouse cursor/touch exits bead(x, y).
This function doesn't have to do anything. Any value returned is ignored.
[x : Number] = zero-based x-position (column) of the bead on the grid.
[y : Number] = zero-based y-position (row) of the bead on the grid.
[data : *] = The JavaScript value previously associated with bead(x, y) using PS.data(); default = 0.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

PS.exit = function( x, y, data, options ) {
	// Uncomment the following code line to inspect x/y parameters:

	// PS.debug( "PS.exit() @ " + x + ", " + y + "\n" );

	// Add code here for when the mouse cursor/touch exits a bead.
};

/*
PS.exitGrid ( options )
Called when the mouse cursor/touch exits the grid perimeter.
This function doesn't have to do anything. Any value returned is ignored.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

PS.exitGrid = function( options ) {
	// Uncomment the following code line to verify operation:

	// PS.debug( "PS.exitGrid() called\n" );

	// Add code here for when the mouse cursor/touch moves off the grid.
};

/*
PS.keyDown ( key, shift, ctrl, options )
Called when a key on the keyboard is pressed.
This function doesn't have to do anything. Any value returned is ignored.
[key : Number] = ASCII code of the released key, or one of the PS.KEY_* constants documented in the API.
[shift : Boolean] = true if shift key is held down, else false.
[ctrl : Boolean] = true if control key is held down, else false.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

PS.keyDown = function( key, shift, ctrl, options ) {
	// Uncomment the following code line to inspect first three parameters:

	// PS.debug( "PS.keyDown(): key=" + key + ", shift=" + shift + ", ctrl=" + ctrl + "\n" );

	// Add code here for when a key is pressed.
};

/*
PS.keyUp ( key, shift, ctrl, options )
Called when a key on the keyboard is released.
This function doesn't have to do anything. Any value returned is ignored.
[key : Number] = ASCII code of the released key, or one of the PS.KEY_* constants documented in the API.
[shift : Boolean] = true if shift key is held down, else false.
[ctrl : Boolean] = true if control key is held down, else false.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

PS.keyUp = function( key, shift, ctrl, options ) {
	// Uncomment the following code line to inspect first three parameters:

	// PS.debug( "PS.keyUp(): key=" + key + ", shift=" + shift + ", ctrl=" + ctrl + "\n" );

	// Add code here for when a key is released.
};

/*
PS.input ( sensors, options )
Called when a supported input device event (other than those above) is detected.
This function doesn't have to do anything. Any value returned is ignored.
[sensors : Object] = A JavaScript object with properties indicating sensor status; see API documentation for details.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
NOTE: Currently, only mouse wheel events are reported, and only when the mouse cursor is positioned directly over the grid.
*/

PS.input = function( sensors, options ) {
	// Uncomment the following code lines to inspect first parameter:

	//	 var device = sensors.wheel; // check for scroll wheel
	//
	//	 if ( device ) {
	//	   PS.debug( "PS.input(): " + device + "\n" );
	//	 }

	// Add code here for when an input event is detected.
};

/*
PS.shutdown ( options )
Called when the browser window running Perlenspiel is about to close.
This function doesn't have to do anything. Any value returned is ignored.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
NOTE: This event is generally needed only by applications utilizing networked telemetry.
*/

PS.shutdown = function( options ) {
	// Uncomment the following code line to verify operation:

	// PS.debug( "“Dave. My mind is going. I can feel it.”\n" );

	// Add code here to tidy up when Perlenspiel is about to close.
};

