// Jasmine Duerk
// Team Frog
// Mod 1: Click and hold down mouse to draw on multiple beads at once (draw lines)
// Mod 2: Press space to change draw color
// Mod 3: Status text states what color (or eraser) the pen currently is
// Mod 4: Background color changed to dark blue
// Mod 5: Grid size changed to 12x12


/*
game.js for Perlenspiel 3.3.x
Last revision: 2018-10-14 (BM)

/* jshint browser : true, devel : true, esversion : 6, freeze : true */
/* globals PS : true */

"use strict"; // do not remove this directive!

/*
PS.init( system, options )
Called once after engine is initialized but before event-polling begins.
This function doesn't have to do anything, although initializing the grid dimensions with PS.gridSize() is recommended.
If PS.grid() is not called, the default grid dimensions (8 x 8 beads) are applied.
Any value returned is ignored.
[system : Object] = A JavaScript object containing engine and host platform information properties; see API documentation for details.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

var mouseDown;
var colorCount;
var currentColor;
var colorArray = [0xF6BD60, 0xF5CAC3, 0x84A59D, 0xF28482, PS.COLOR_WHITE];
var colorArrayName = ["Yellow", "Light Pink", "Teal", "Dark Pink", "Eraser"]

PS.init = function( system, options ) {

	// Establish grid dimensions
	
	PS.gridSize( 12, 12 );
	
	// Set background color to Perlenspiel logo gray
	
	PS.gridColor( 0x555b6e );
	
	// Change status line color and text

	PS.statusColor( PS.COLOR_WHITE );
	PS.statusText( "Yellow" );
	
	// Preload click sound

	PS.audioLoad( "fx_click" );

	mouseDown = false;
	colorCount = 0;
	currentColor = 0;
	PS.data( PS.ALL, PS.ALL, colorArray[currentColor] );
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

PS.touch = function( x, y, data, options ) {
	// Toggle color of touched bead from white to black and back again
	// NOTE: The default value of a bead's [data] is 0, which happens to be equal to PS.COLOR_BLACK

	PS.color( x, y, data ); // set color to current value of data
	
	// Decide what the next color should be.
	// If the current value was black, change it to white.
	// Otherwise change it to black.

	/*let next; // variable to save next color

	if ( !(data === PS.COLOR_WHITE) ) {
		next = PS.COLOR_WHITE;
	}
	else {
		next = colorArray[currentColor];
	}

	// NOTE: The above statement could be expressed more succinctly using JavaScript's ternary operator:
	// let next = ( data === PS.COLOR_BLACK ) ? PS.COLOR_WHITE : PS.COLOR_BLACK;
	
	// Remember the newly-changed color by storing it in the bead's data.
	
	PS.data( x, y, next );*/

	// Play click sound.

	PS.audioPlay( "fx_click" );

	mouseDown = true;
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

// UNCOMMENT the following code BLOCK to expose the PS.release() event handler:



PS.release = function( x, y, data, options ) {
	"use strict"; // Do not remove this directive!

	// Uncomment the following code line to inspect x/y parameters:

	// PS.debug( "PS.release() @ " + x + ", " + y + "\n" );

	// Add code here for when the mouse button/touch is released over a bead.
	mouseDown = false;
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

// UNCOMMENT the following code BLOCK to expose the PS.enter() event handler:



PS.enter = function( x, y, data, options ) {
	"use strict"; // Do not remove this directive!

	// Uncomment the following code line to inspect x/y parameters:

	// PS.debug( "PS.enter() @ " + x + ", " + y + "\n" );

	// Add code here for when the mouse cursor/touch enters a bead.
	if (mouseDown == true) {
		PS.color( x, y, data ); // set color to current value of data
		/*
		// Decide what the next color should be.
		// If the current value was black, change it to white.
		// Otherwise change it to black.
	
		let next; // variable to save next color
	
		if ( !(data === PS.COLOR_WHITE) ) {
			next = PS.COLOR_WHITE;
		}
		else {
			next = colorArray[currentColor];
		}
	
		// NOTE: The above statement could be expressed more succinctly using JavaScript's ternary operator:
		// let next = ( data === PS.COLOR_BLACK ) ? PS.COLOR_WHITE : PS.COLOR_BLACK;
		
		// Remember the newly-changed color by storing it in the bead's data.
		
		PS.data( x, y, next );*/
	}
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

// UNCOMMENT the following code BLOCK to expose the PS.exit() event handler:

/*

PS.exit = function( x, y, data, options ) {
	"use strict"; // Do not remove this directive!

	// Uncomment the following code line to inspect x/y parameters:

	// PS.debug( "PS.exit() @ " + x + ", " + y + "\n" );

	// Add code here for when the mouse cursor/touch exits a bead.
};

*/

/*
PS.exitGrid ( options )
Called when the mouse cursor/touch exits the grid perimeter.
This function doesn't have to do anything. Any value returned is ignored.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

// UNCOMMENT the following code BLOCK to expose the PS.exitGrid() event handler:

/*

PS.exitGrid = function( options ) {
	"use strict"; // Do not remove this directive!

	// Uncomment the following code line to verify operation:

	// PS.debug( "PS.exitGrid() called\n" );

	// Add code here for when the mouse cursor/touch moves off the grid.
};

*/

/*
PS.keyDown ( key, shift, ctrl, options )
Called when a key on the keyboard is pressed.
This function doesn't have to do anything. Any value returned is ignored.
[key : Number] = ASCII code of the released key, or one of the PS.KEY_* constants documented in the API.
[shift : Boolean] = true if shift key is held down, else false.
[ctrl : Boolean] = true if control key is held down, else false.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

// UNCOMMENT the following code BLOCK to expose the PS.keyDown() event handler:



PS.keyDown = function( key, shift, ctrl, options ) {
	"use strict"; // Do not remove this directive!

	// Uncomment the following code line to inspect first three parameters:

	//PS.debug( "PS.keyDown(): key=" + key + ", shift=" + shift + ", ctrl=" + ctrl + "\n" );

	// Add code here for when a key is pressed.
	if (key == 32) { // space key pressed changes color of pen
		colorCount += 1;
		currentColor = colorCount % 5;
		PS.data( PS.ALL, PS.ALL, colorArray[currentColor] );
		PS.statusText( colorArrayName[currentColor] );
		//PS.debug("Current color: ");
		//PS.debug(currentColor);
		//PS.debug("\n");
	}
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

// UNCOMMENT the following code BLOCK to expose the PS.keyUp() event handler:

/*

PS.keyUp = function( key, shift, ctrl, options ) {
	"use strict"; // Do not remove this directive!

	// Uncomment the following code line to inspect first three parameters:

	// PS.debug( "PS.keyUp(): key=" + key + ", shift=" + shift + ", ctrl=" + ctrl + "\n" );

	// Add code here for when a key is released.
};

*/

/*
PS.input ( sensors, options )
Called when a supported input device event (other than those above) is detected.
This function doesn't have to do anything. Any value returned is ignored.
[sensors : Object] = A JavaScript object with properties indicating sensor status; see API documentation for details.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
NOTE: Currently, only mouse wheel events are reported, and only when the mouse cursor is positioned directly over the grid.
*/

// UNCOMMENT the following code BLOCK to expose the PS.input() event handler:

/*

PS.input = function( sensors, options ) {
	"use strict"; // Do not remove this directive!

	// Uncomment the following code lines to inspect first parameter:

//	 var device = sensors.wheel; // check for scroll wheel
//
//	 if ( device ) {
//	   PS.debug( "PS.input(): " + device + "\n" );
//	 }

	// Add code here for when an input event is detected.
};

*/

/*
PS.shutdown ( options )
Called when the browser window running Perlenspiel is about to close.
This function doesn't have to do anything. Any value returned is ignored.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
NOTE: This event is generally needed only by applications utilizing networked telemetry.
*/

// UNCOMMENT the following code BLOCK to expose the PS.shutdown() event handler:

/*

PS.shutdown = function( options ) {
	"use strict"; // Do not remove this directive!

	// Uncomment the following code line to verify operation:

	// PS.debug( "“Dave. My mind is going. I can feel it.”\n" );

	// Add code here to tidy up when Perlenspiel is about to close.
};

*/
