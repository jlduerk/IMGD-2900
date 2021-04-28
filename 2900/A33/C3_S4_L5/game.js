/*
game.js for Perlenspiel 3.3.x
Last revision: 2018-10-14 (BM)
*/

"use strict";

/* jshint browser : true, devel : true, esversion : 5, freeze : true */
/* globals PS : true */

var G = ( function () {
	var GRID_X = 0;
	var GRID_Y = 0;
	var GROUND_COLOR = PS.COLOR_GREEN;
	var ACTOR_COLOR = PS.COLOR_BLUE;
	var WALL_COLOR = 0x600000;
	var MAP_WALL = 0;
	var MAP_GROUND = 1;
	var GROUND_RGB;
	var WALL_RGB;
	var MAP_PLANE = 0;
	var ACTOR_PLANE = 5;
	var DARKNESS_PLANE = 4;

	var STRANGER_PLANE = 2;
	var STRANGER_COLOR = 0xC0C0C0;
	var STRANGER_MARKER = "stranger";

	var SHARD_COLOR = PS.COLOR_YELLOW;
	var SHARD_PLANE = 1;
	var SHARD_COUNT = 7;
	var SHARD_MARKER = "shard";
	var shards_found = 0;

	var DOOR_COLOR = PS.COLOR_BLACK;
	var DOOR_MARKER = "door";

	var VILLAIN_COLOR = PS.COLOR_RED;
	var VILLAIN_MARKER = "villain";

	var actor_x = 1;
	var actor_y = 1;

	var actor_path = null;
	var actor_position;
	var actor_sprite;

	var timer_id;
	var pathmap;

	var mapdata;

	var imagemap = {
		width : 0,
		height : 0,
		pixelSize : 1,
        data : []
	};

	var is_wall = function ( x, y ) {
		var data;

		data = imagemap.data[ ( y * GRID_X ) + x ];
		return ( data === MAP_WALL );
	};

	var TEXT_DELAY = 3;
	var text_timer = 0;
	var fade_text = null;

	var textfader = function () {
		if ( fade_text ) {
			text_timer += 1;
			if ( text_timer >= TEXT_DELAY ) {
				text_timer = 0;
				PS.statusColor( PS.COLOR_WHITE );
				fade_text = null;
			}
		}
	};

	var fade_say = function ( str ) {
		PS.statusText( str );
		PS.statusColor( PS.COLOR_BLACK );
		text_timer = 0;
		fade_text = true;
	};

	var VISIONS = [
		{
			says : "«Seek and ye shall find.»",
			notes : [ "l_hchord_g6", "l_hchord_a6", "l_hchord_bb6" ]
		},
		{
			says : "«First saying.»",
			notes : [ "l_hchord_ab6", "l_hchord_bb6", "l_hchord_b6" ]
		},
		{
			says : "«Second saying.»",
			notes : [ "l_hchord_a6", "l_hchord_b6", "l_hchord_c7" ]
		},
		{
			says : "«Third saying.»",
			notes : [ "l_hchord_bb6", "l_hchord_c7", "l_hchord_db7" ]
		},
		{
			says : "«Fourth saying.»",
			notes : [ "l_hchord_b6", "l_hchord_db7", "l_hchord_d7" ]
		},
		{
			says : "«Fifth saying.»",
			notes : [ "l_hchord_c7", "l_hchord_d7", "l_hchord_eb7" ]
		},
		{
			says : "«Sixth saying.»",
			notes : [ "l_hchord_db7", "l_hchord_eb7", "l_hchord_f7" ]
		},
		{
			says : "«Seventh saying.»",
			notes : [ "l_hchord_d7", "l_hchord_e7", "l_hchord_f7" ]
		}
	];

	var stranger_x;
	var stranger_y;
	var stranger_active = false;
	var stranger_beat = 0;
	var vision_count = 0;

	var stranger_vision = function () {
		var vision, music, len, i, oplane;

		vision = VISIONS[ vision_count ];
		music = vision.notes;
		len = music.length;

		if ( stranger_beat < 1 ) {
			fade_say( vision.says );
		}

		if ( stranger_beat < len ) {
			PS.audioPlay( music[ stranger_beat ] );
		}

		stranger_beat += 1;

		if ( stranger_beat === len ) {
			vision_count += 1;
			stranger_active = false;
			oplane = PS.gridPlane();
			PS.gridPlane( STRANGER_PLANE );
			PS.alpha( stranger_x, stranger_y, PS.ALPHA_TRANSPARENT );
			PS.data( stranger_x, stranger_y, PS.DEFAULT ); // remove marker
			PS.gridPlane( oplane );
		}
	};

	var stranger_depart = function () {
		actor_path = false; // stops actor
		if ( !stranger_active ) {
			stranger_beat = 0;
			stranger_active = true;
		}
	};

	var ZONES = [
		[
			[ -1, -1 ], [ 0, -1 ], [ 1, -1 ],
			[ -1, 0 ], [ 1, 0 ],
			[ -1, 1 ], [ 0, 1 ], [ 1, 1 ]
		],
		[
			[ -2, -2 ], [ -1, -2 ], [ 0, -2 ], [ 1, -2 ], [ 2, -2 ],
			[ -2, -1 ], [ 2, -1 ],
			[ -2, 0 ], [ 2, 0 ],
			[ -2, 1 ], [ 2, 1 ],
			[ -2, 2 ], [ -1, 2 ], [ 0, 2 ], [ 1, 2 ], [ 2, 2 ]
		],
		[
			[ -1, -3 ], [ 0, -3 ], [ 1, -3 ],
			[ -3, -1 ], [ 3, -1 ],
			[ -3, 0 ], [ 3, 0 ],
			[ -3, 1 ], [ 3, 1 ],
			[ -1, 3 ], [ 0, 3 ], [ 1, 3 ]
		]
	];

	var shard_find = function ( x, y ) {
		var oplane, zone2, len, i, offset, dx, dy, data;

		var findings = [
			"You found a shiny thing!",
			"Another shiny thing!",
			"Your third shiny thing.",
			"Yet a fourth thing of shininess.",
			"Five things that shine!",
			"Six! So much shiny goodness.",
			"Seven shall be the number of shinies."
		];

		oplane = PS.gridPlane();

		PS.gridPlane( SHARD_PLANE );
		PS.alpha( x, y, PS.ALPHA_TRANSPARENT );
		PS.data( x, y, PS.DEFAULT ); // remove marker

		// Find position of stranger

		zone2 = ZONES[ 1 ];
		len = zone2.length;
		for ( i = 0; i < len; i += 1 ) {
			offset = zone2[ i ];
			dx = x + offset[ 0 ];
			dy = y + offset[ 1 ];
			if ( ( dx >= 0 ) && ( dx < GRID_X ) && ( dy >= 0 ) && ( dy < GRID_Y ) ) {
				data = imagemap.data[ ( dy * GRID_X ) + dx ];
				if ( data === MAP_GROUND ) {
					stranger_place( dx, dy );
					break;
				}
			}
		}

		PS.audioPlay( "perc_triangle" );
		fade_say( findings[ shards_found ] );
		shards_found += 1;

		PS.gridPlane( oplane );
	};


	var illuminate = function ( x, y ) {
		var oplane, zone, i, j, offset, dx, dy;

		oplane = PS.gridPlane();
		PS.gridPlane( DARKNESS_PLANE );

		for ( j = 0; j < ZONES.length; j += 1 ) {
			zone = ZONES[ j ];
			for ( i = 0; i < zone.length; i += 1 ) {
				offset = zone[ i ];
				dx = x + offset[ 0 ];
				dy = y + offset[ 1 ];
				if ( ( dx >= 0 ) && ( dx < GRID_X ) && ( dy >= 0 ) && ( dy < GRID_Y ) ) {
					if ( PS.alpha( dx, dy ) !== PS.ALPHA_TRANSPARENT ) {
						PS.alpha( dx, dy, PS.ALPHA_TRANSPARENT );
						// seen[ ( dy * GRID_Y ) + dx ] = PS.ALPHA_TRANSPARENT;
					}
				}
			}
		}

		PS.gridPlane( oplane );
	};

	var actor_place = function ( x, y ) {
		var data, oplane;

		data = PS.data( x, y );

		if ( data === STRANGER_MARKER ) {
			stranger_depart();
			return;
		}
		else if ( data === DOOR_MARKER ) {
			actor_path = false; // stops actor
			PS.audioPlay( "fx_blast4", { volume : 0.5 } );
			fade_say( "The gate is locked." );
			return;
		}
		else if ( data === VILLAIN_MARKER ) {
			actor_path = false; // stops actor
			return;
		}

		PS.spriteMove( actor_sprite, x, y );
		actor_x = x;
		actor_y = y;

		illuminate( x, y );

		if ( PS.data( x, y ) === SHARD_MARKER ) {
			shard_find( x, y );
		}
	};

	var actor_step = function ( h, v ) {
		var nx, ny;

		// Calculate proposed new location.

		nx = actor_x + h;
		ny = actor_y + v;

		if ( is_wall( nx, ny ) ) {
			return;
		}

		// Is new location off the grid?
		// If so, exit without moving.

		if ( ( nx < 0 ) || ( nx >= GRID_X ) || ( ny < 0 ) || ( ny >= GRID_Y ) ) {
			return;
		}

		actor_path = null;
		actor_place( nx, ny );
	};

	// var path_print = function () {
	// 	var len, str, i, point;
	//
	// 	PS.debugClear();
	// 	len = actor_path.length;
	// 	str = "actor_path length = " + len + "\n";
	// 	for ( i = 0; i < len; i += 1 ) {
	// 		point = actor_path[ i ];
	// 		str += ( "\t" + i + ": x = " + point[ 0 ] + ", y = " + point[ 1 ] + "\n" );
	// 	}
	// 	PS.debug( str );
	// };

	var SECOND_DELAY = 10;
	var second_timer = 0;

	var actor_animate = function () {
		var point, x, y;

		if ( actor_path ) {
			point = actor_path[ actor_position ];
			x = point[ 0 ];
			y = point[ 1 ];
			// if ( is_wall( x, y ) ) {
			// 	actor_path = null;
			// 	return;
			// }
			actor_place( x, y );
			actor_position += 1;
			if ( actor_position >= actor_path.length ) {
				actor_path = null;
			}
		}

		second_timer += 1;
		if ( second_timer >= SECOND_DELAY ) {
			second_timer = 0;
			textfader();
			if ( stranger_active ) {
				stranger_vision();
			}
		}
	};

	var shade = function ( color ) {
		var RANGE, vary, r, g, b;

		RANGE = 32;

		vary = function ()  {
			return ( PS.random( RANGE * 2 ) - RANGE );
		};

		r = color.r + vary();
		g = color.g + vary();
		b = color.b + vary();

		return PS.makeRGB( r, g, b );
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
					case MAP_WALL:
						color = shade( WALL_RGB );
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

	var shard_place = function ( x, y ) {
		var oplane = PS.gridPlane();

		PS.gridPlane( SHARD_PLANE );
		PS.color( x, y, SHARD_COLOR );
		PS.alpha( x, y, PS.ALPHA_OPAQUE );
		PS.data( x, y, SHARD_MARKER );

		PS.gridPlane( oplane );
	};

	var stranger_place = function ( x, y ) {
		var oplane = PS.gridPlane();

		PS.gridPlane( STRANGER_PLANE );
		PS.color( x, y, STRANGER_COLOR );
		PS.alpha( x, y, PS.ALPHA_OPAQUE );
		PS.data( x, y, STRANGER_MARKER );

		stranger_x = x;
		stranger_y = y;

		PS.gridPlane( oplane );
	};

	var door_place = function ( x, y ) {
		PS.data( x, y, DOOR_MARKER );
		PS.borderColor( x, y, PS.COLOR_BLACK );
		PS.border( x, y, { top : 6, bottom : 0, left : 0, right : 0 } );
	};


	var villain_place = function ( x, y ) {
		var oplane = PS.gridPlane();

		PS.gridPlane( STRANGER_PLANE );
		PS.color( x, y, PS.COLOR_RED );
		PS.alpha( x, y, PS.ALPHA_OPAQUE );
		PS.data( x, y, VILLAIN_MARKER );

		PS.gridPlane( oplane );
	};

	return {
		init : function () {
			// This function is called when the map image is loaded

			var onMapLoad = function ( image ) {
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

				// Translate map pixels to data format expected by imagemap

				i = 0; // init pointer into imagemap.data array

				for ( y = 0; y < GRID_Y; y += 1 ) {
					for ( x = 0; x < GRID_X; x += 1 ) {
						data = MAP_GROUND; // assume ground
						pixel = image.data[ i ];
						switch ( pixel ) {
							case GROUND_COLOR:
								break; // no need to do anything
							case WALL_COLOR:
								data = MAP_WALL; // found a wall!
								break;
							case SHARD_COLOR:
								shard_place( x, y ); // found a shard!
								break;
							case ACTOR_COLOR:
								actor_x = x; // establish initial location of actor
								actor_y = y;
								break;
							case STRANGER_COLOR:
								stranger_place( x, y );
								break;
							case DOOR_COLOR:
								door_place( x, y );
								break;
							case VILLAIN_COLOR:
								villain_place( x, y );
								break;
							default:
								PS.debug( "onMapLoad(): unrecognized pixel value\n" );
								break;
						}
						imagemap.data[ i ] = data; // install translated data
						i += 1; // update array pointer
					}
				}

				// Now we can complete the initialization

				GROUND_RGB = PS.unmakeRGB( GROUND_COLOR, {} );
				WALL_RGB = PS.unmakeRGB( WALL_COLOR, {} );
				draw_map( imagemap );

				// Create darkness plane

				PS.gridPlane( DARKNESS_PLANE );
				PS.color( PS.ALL, PS.ALL, PS.COLOR_BLACK );
				PS.alpha( PS.ALL, PS.ALL, PS.ALPHA_OPAQUE );

				actor_sprite = PS.spriteSolid( 1, 1 ); // Create 1x1 solid sprite, save its ID
				PS.spriteSolidColor( actor_sprite, ACTOR_COLOR ); // assign color
				PS.spritePlane( actor_sprite, ACTOR_PLANE ); // Move to assigned plane

				actor_place( actor_x, actor_y );
				pathmap = PS.pathMap( imagemap );
				timer_id = PS.timerStart( 6, actor_animate );
			};

			// Load the image map in format 1

			PS.imageLoad( "images/maze6.gif", onMapLoad, 1 );
		},
		touch : function ( x, y ) {
			var path;
			//PS.debug( "PS.touch() @ " + x + ", " + y + "\n" );

			if ( PS.alpha( x, y ) !== PS.ALPHA_OPAQUE ) {
				path = PS.pathFind( pathmap, actor_x, actor_y, x, y );
				if ( path.length > 0 ) {
					actor_position = 0;
					actor_path = path;
				}
				// path_print();
			}
		},
		keyDown : function ( key ) {
			//PS.debug( "PS.keyDown(): key=" + key + "\n" );

			switch ( key ) {
				case PS.KEY_ARROW_UP:
				case 119:
				case 87: {
					actor_step( 0, -1 ); // move UP (v = -1)
					break;
				}
				case PS.KEY_ARROW_DOWN:
				case 115:
				case 83: {
					actor_step( 0, 1 ); // move DOWN (v = 1)
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
			}
		}
	};
} () );

PS.init = G.init;
PS.touch = G.touch;
PS.keyDown = G.keyDown;

