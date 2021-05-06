/*
game.js for Perlenspiel 3.3.xd
Last revision: 2021-04-08 (BM)

Perlenspiel is a scheme by Professor Moriarty (bmoriarty@wpi.edu).
This version of Perlenspiel (3.3.x) is hosted at <https://ps3.perlenspiel.net>
Perlenspiel is Copyright © 2009-21 Brian Moriarty.
This file is part of the standard Perlenspiel 3.3.x devkit distribution.

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

var SPEED = 6;

var GRID_X = 0;
var GRID_Y = 0;
var GROUND_COLOR = PS.COLOR_GREEN;
var ACTOR_COLOR = PS.COLOR_BLUE;
var PLATFORM_COLOR = 0x600000;
var BACK_COLOR = 0x9B5316;
var TEXT_COLOR = PS.COLOR_WHITE;
var MAP_PLATFORM = 0;
var MAP_GROUND = 1;
var GROUND_RGB;
var PLATFORM_RGB;
var MAP_PLANE = 0;
var ACTOR_PLANE = 5;

var SCROLL_COLOR = PS.COLOR_YELLOW;
var SCROLL_PLANE = 1;
var SCROLL_MARKER = "scroll";
var scroll_found = false;

var SHELF_COLOR = PS.COLOR_RED;
var SHELF_PLANE = 4;

var actor_x = 1;
var actor_y = 1;

var actor_path = null;
var actor_position;
var actor_sprite;
var actor_gravity = -1;
var actor_jumpheight = 3;
var actor_onground = false;

var timer_id;
var pathmap;

var mapdata;

var gameComplete = false;

//display colors
var BACKGROUND_COLOR = 0xb8a441;
var PLAYER_COLOR = 0x135cea;
var SHELF_ACTUAL_COLOR = 0xff005a;
var SCROLL_ACTUAL_COLOR = 0x99dfbd;

var shelves = []; //array of shelves to look through on Update for gravity
var levels = ["images/level1fixed2.gif", "images/level2.gif", "images/level3.gif", "images/level4.gif", "images/endscreen (4).gif"]; //array to keep track of levels
var currentLevel = 0;

var imagemap = {
	width : 0,
	height : 0,
	pixelSize : 1,
	data : []
};

var is_platform = function ( x, y ) {
	var data;

	data = imagemap.data[ ( y * GRID_X ) + x ];
	return ( data === MAP_PLATFORM );
};

var is_shelf = function ( x, y ) {
	for (var i = 0; i < shelves.length; i++) {
		if (shelves[i].x == x && shelves[i].y == y) {
			return i;
		} 
	}
	return -1000;
}

var shade = function ( color ) {
	var RANGE, vary, r, g, b;

	RANGE = 10;

	vary = function ()  {
		return ( PS.random( RANGE * 2 ) - RANGE );
	};

	r = color.r + vary();
	g = color.g + vary();
	b = color.b + vary();

	return PS.makeRGB( r, g, b );
};

var actor_place = function ( x, y ) {
	var data, oplane;

	data = PS.data( x, y );

	PS.spriteMove( actor_sprite, x, y );
	actor_x = x;
	actor_y = y;
	PS.spriteSolidColor(actor_sprite, PS.COLOR_BLUE);

	if ( PS.data( x, y ) === SCROLL_MARKER ) {
		scroll_find( x, y );
	}
};

//var shelf_index_counter = 0;
var shelf_init = function( shelf_x, shelf_y ) {
	//shelf_index_counter += 1;
	var shelf_sprite = PS.spriteSolid( 1, 1 ); // Create 1x1 solid sprite, save its ID
	PS.spriteSolidColor( shelf_sprite, SHELF_ACTUAL_COLOR ); // assign color
	PS.spritePlane( shelf_sprite, SHELF_PLANE ); // Move to assigned plane

	var shelf_struct = {
		sprite: shelf_sprite,
		x: shelf_x,
		y: shelf_y
	};
	shelves.push(shelf_struct);

	shelf_place(shelf_x, shelf_y, shelves.length - 1);
}


var shelf_place = function ( x, y, index ) {
	var oplane = PS.gridPlane(); // save og plane

	PS.gridPlane( SHELF_PLANE );
	//PS.debug(index + "\n");
	PS.spriteMove( shelves[index].sprite, x, y );
	shelves[index].x = x;
	shelves[index].y = y;
	PS.spriteSolidColor(shelves[index].sprite, SHELF_ACTUAL_COLOR);

	PS.gridPlane( oplane );
};

var scroll_place = function ( x, y ) {
	var oplane = PS.gridPlane(); // save og plane

	PS.gridPlane( SCROLL_PLANE );
	PS.color( x, y, SCROLL_ACTUAL_COLOR );
	PS.alpha( x, y, PS.ALPHA_OPAQUE );
	PS.data( x, y, SCROLL_MARKER );

	PS.gridPlane( oplane );
};

var scroll_find = function ( x, y ) {
	//idk what happens when you find a scroll lmao
	var oplane = PS.gridPlane();
	PS.gridPlane( SCROLL_PLANE );
	PS.alpha( x, y, PS.ALPHA_TRANSPARENT );
	PS.statusText("Level Complete!");
	PS.gridPlane( oplane );
	level_progress();
}

var level_progress = function (){
	currentLevel += 1;
	if (currentLevel < levels.length) {
		PS.imageLoad( levels[currentLevel], onMapLoad, 1 );
	}
	else {
		PS.statusText("Wisdom is knowing we can't know everything.");
		gameComplete = true;
	}
}

var actor_step = function ( h, v ) {
	var nx, ny;

	// Calculate proposed new location.

	nx = actor_x + h;
	ny = actor_y + v;

	if ( is_platform( nx, ny )) {
		actor_onground = true;
		return;
	}
	if (is_shelf( nx, ny) >= 0 && v > 0) {
		actor_onground = true;
		return;
	}

	if (h != 0) { //horizontal movement
		var shelf_in_way = is_shelf( nx, ny );
		if ( shelf_in_way >= 0) {
			shelf_step(h, 0, shelf_in_way);
			// make it so you can't just sit in the shelves
			var direction = 0;
			if (h > 0) {
				direction = 1;
			} else if (h < 0) {
				direction = -1;
			}
			if (is_platform( nx + direction, ny )) {
				return;
			}
		}
	}

	// Is new location off the grid?
	// If so, exit without moving.

	if ( ( nx < 0 ) || ( nx >= GRID_X ) || ( ny < 0 ) || ( ny >= GRID_Y ) ) {
		return;
	}
	actor_onground = false;

	actor_path = null;
	actor_place( nx, ny );
};


var shelf_step = function ( h, v , index) {
	var nx, ny;

	// Calculate proposed new location.

	nx = shelves[index].x + h;
	ny = shelves[index].y + v;

	if ( is_platform( nx, ny ) ) {
		return;
	}
	if (is_shelf( nx, ny) >= 0 && v > 0) {
		actor_onground = true;
		return;
	}

	if (h != 0) { //horizontal movement
		var shelf_in_way = is_shelf( nx, ny );
		if ( shelf_in_way >= 0) {
			shelf_step(h, 0, shelf_in_way);
		}
	}

	// Is new location off the grid?
	// If so, exit without moving.

	if ( ( nx < 0 ) || ( nx >= GRID_X ) || ( ny < 0 ) || ( ny >= GRID_Y ) ) {
		return;
	}
	actor_onground = false;

	actor_path = null;
	shelf_place( nx, ny, index );
};

var draw_map = function ( map ) {
	var oplane, i, x, y, data, color;

	oplane = PS.gridPlane();
	PS.gridPlane( MAP_PLANE );

	i = 0;
	for ( y = 0; y < map.height; y += 1 ) {
		for ( x = 0; x < map.width; x += 1 ) {
			data = map.data[ i ];
			switch ( data ) {
				case MAP_GROUND:
					color = shade( GROUND_RGB );
					break;
				case MAP_PLATFORM:
					color = shade( PLATFORM_RGB );
					break;
				default:
					color = PS.COLOR_WHITE;
					break;
			}
			PS.color( x, y, color );
			i += 1;
		}
	}

	PS.gridPlane( oplane );
};


var onMapLoad = function ( image ) {
	shelf_index_counter = 0;
	shelves = [];

	var i, x, y, data, pixel;

	if ( image === PS.ERROR ) {
		PS.debug( "onMapLoad(): image load error\n" );
		return;
	}

	mapdata = image; // save map data for later

	// Prepare grid for map drawing

	imagemap.width = GRID_X = image.width;
	imagemap.height = GRID_Y = image.height;

	PS.gridSize( GRID_X, GRID_Y );
	PS.border( PS.ALL, PS.ALL, 0 );
	PS.gridColor(BACK_COLOR);

	// Translate map pixels to data format expected by imagemap

	i = 0; // init pointer into imagemap.data array

	for ( y = 0; y < GRID_Y; y += 1 ) {
		for ( x = 0; x < GRID_X; x += 1 ) {
			data = MAP_GROUND; // assume ground
			pixel = image.data[ i ];
			switch ( pixel ) {
				case GROUND_COLOR:
					break; // no need to do anything
				case PLATFORM_COLOR:
					data = MAP_PLATFORM; // found a platform!
					break;
				case SCROLL_COLOR:
					scroll_place( x, y ); // found a scroll!
					break;
				case ACTOR_COLOR:
					actor_x = x; // establish initial location of actor
					actor_y = y;
					break;
				case SHELF_COLOR:
					shelf_init( x, y ); //place shelf
					break;
				default:
					//PS.debug( "onMapLoad(): unrecognized pixel value\n" );
					//PS.debug("Pixel value: " + pixel + "\n");
					break;
			}
			imagemap.data[ i ] = data; // install translated data
			i += 1; // update array pointer
		}
	}

	// Now we can complete the initialization

	GROUND_RGB = PS.unmakeRGB( BACKGROUND_COLOR, {} );
	PLATFORM_RGB = PS.unmakeRGB( PLATFORM_COLOR, {} );
	draw_map( imagemap );

	actor_sprite = PS.spriteSolid( 1, 1 ); // Create 1x1 solid sprite, save its ID
	PS.spriteSolidColor( actor_sprite, PLAYER_COLOR ); // assign color
	PS.spritePlane( actor_sprite, ACTOR_PLANE ); // Move to assigned plane

	actor_place( actor_x, actor_y );
//	pathmap = PS.pathMap( imagemap );
	timer_id = PS.timerStart(SPEED, Update);

	PS.statusColor(TEXT_COLOR);
	PS.statusText( "Collect the scroll! (Space to reset level.)" );
};
// Similar to Update() in Unity
// 1 timer for everything
// If something occurs every tick, put in this function 
var Update = function () {

	// - - - - - - - GRAVITY - - - - - - - //
	if (actor_gravity == -1) {
		actor_step( 0, 1 ); // move DOWN (v = 1)
	} else if (actor_gravity > 0) {
		actor_step( 0, -1 ); // move UP (v = -1)
		actor_gravity -= 1;
	} else { // == 0
		actor_gravity -= 1;
	}

	//shelves
	for (var i = 0; i < shelves.length; i++) {
		//PS.debug(shelves[i].sprite);
		shelf_step( 0, 1, i);
	}
}

PS.init = function( system, options ) {

	// Load the image map in format 1
	PS.imageLoad( levels[currentLevel] , onMapLoad, 1 );
	 //PS.gridSize( 16, 16 );

	//sampleShelf = PS.spriteSolid(1, 1);


	const TEAM = "frog";

	// This code should be the last thing
	// called by your PS.init() handler.
	// DO NOT MODIFY IT, except for the change
	// explained in the comment below.

	PS.dbLogin( "imgd2900", TEAM, function ( id, user ) {
		if ( user === PS.ERROR ) {
			return;
		}
		PS.dbEvent( TEAM, "startup", user );
		PS.dbSend( TEAM, PS.CURRENT, { discard : true } );
	}, { active : false } );
	
	// Change the false in the final line above to true
	// before deploying the code to your Web site.
};


PS.keyDown = function( key, shift, ctrl, options ) {
	switch ( key ) {
		case PS.KEY_ARROW_UP:
		case 119:
		case 87: {
			//actor_step( 0, -1 ); // move UP (v = -1)
			if (actor_gravity == -1 && actor_onground) {
				actor_gravity = actor_jumpheight;
			} 
			
			break;
		}
		case PS.KEY_ARROW_LEFT:
		case 97:
		case 65: {
			actor_step( -1, 0 ); // move LEFT (h = -1)
			break;
		}
		case PS.KEY_ARROW_RIGHT:
		case 100:
		case 68: {
			actor_step( 1, 0 ); // move RIGHT (h = 1)
			break;
		}
		case 32: { //space
			if (!gameComplete) {
				PS.imageLoad( levels[currentLevel], onMapLoad, 1 );
			}
			break;
		}
	}
};


