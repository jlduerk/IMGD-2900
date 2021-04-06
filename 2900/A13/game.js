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

var GRID_WIDTH = 32;
var GRID_HEIGHT = 20;
var GROUND_LEVEL = 16;
var COLOR_SKY = 0x6A98D2;
var COLOR_GROUND_1 = 0x36B02C;
//var COLOR_GROUND_2 = 0x0A873F;
var COLOR_SEED = 0xD29A3E;
var SPEED = 6; // 10 fps
var DROP_SOUND = "xylo_d5";
var LAND_SOUND = "xylo_d7";

var seeds = [];
var seed_Tracker = [];


var bury = function (x, y) {
	if (PS.color(x,y) == COLOR_SKY) {
		PS.color(x, y, PS.COLOR_WHITE);
	}
	PS.audioPlay(LAND_SOUND);
	//PS.debug("seedTracker:" + seed_Tracker);
	var alreadyHasPlant = false;
	for (var i = 0; i < seed_Tracker.length; i++) {
		if (x == seed_Tracker[i][0] || x + 1 == seed_Tracker[i][0] || x + 2 == seed_Tracker[i][0] || x - 1 == seed_Tracker[i][0] 
			|| x - 2 == seed_Tracker[i][0] || x + 3 == seed_Tracker[i][0] || x + 4 == seed_Tracker[i][0] || 
			x - 3 == seed_Tracker[i][0] || x - 4 == seed_Tracker[i][0]) {
			alreadyHasPlant = true;
		}
	}
	if (!alreadyHasPlant) {
		seed_Tracker.push([x,16]);
		//var flow = Math.floor(Math.random()*3);
		//if (flow == 0){
		growRose(x);
		/*} else if (flow == 1){
			growSunflower(x);
		}
		else if (flow == 2){
			growTulip(x);
		}*/
	} else {
		PS.color(x, y, COLOR_SKY)
	}
}

var growSunflower = function(x) {
	var rootTimer;
	var smolTimer;
	var saplingTimer;
	var budTimer;
	var fullFlowerTimer;
	var deadFlowerTimer;
	var ripTimer;

	var root = function() {
		PS.color(x, GROUND_LEVEL, 0x558b2f);
	}

	var smol = function() {
		PS.color(x, GROUND_LEVEL, 0x558b2f);
		PS.color(x, GROUND_LEVEL - 1, 0x689f38);
		PS.color(x, GROUND_LEVEL - 2, 0x7cb342);
		if (x - 1 > 0) {
			PS.color(x - 1, GROUND_LEVEL - 2, 0x558b2f);
			PS.color(x - 1, GROUND_LEVEL - 3, 0x689f38);
		}
		if (x - 2 > 0) {
			PS.color(x - 2, GROUND_LEVEL - 3, 0x7cb342);
			PS.color(x - 2, GROUND_LEVEL - 4, 0x7cb342);
		}
		PS.timerStop(smolTimer);
	}
	
	var sapling = function() {
		PS.color(x, GROUND_LEVEL - 3, 0x689f38);
		PS.color(x, GROUND_LEVEL - 4, 0x689f38);
		PS.color(x, GROUND_LEVEL - 5, 0x689f38);
		PS.color(x, GROUND_LEVEL - 6, 0x7cb342);
		if (x + 1 < GRID_WIDTH) {
			PS.color(x + 1, GROUND_LEVEL - 4, 0x558b2f);
			PS.color(x + 1, GROUND_LEVEL - 5, 0x689f38);
		}
		if (x + 2 < GRID_WIDTH) {
			PS.color(x + 2, GROUND_LEVEL - 5, 0x7cb342);
			PS.color(x + 2, GROUND_LEVEL - 6, 0x7cb342);
		}
		PS.timerStop(saplingTimer);
	}

	var bud = function() {
		PS.color(x, GROUND_LEVEL - 7, 0x7cb342);
		PS.color(x, GROUND_LEVEL - 8, 0x7cb342);
		if (x - 1 > 0) {
			PS.color(x - 1, GROUND_LEVEL - 6, 0x8bc34a);
			PS.color(x - 1, GROUND_LEVEL - 7, 0x689f38);
		}
		if (x - 2 > 0) {
			PS.color(x - 2, GROUND_LEVEL - 7, 0x8bc34a);
			PS.color(x - 2, GROUND_LEVEL - 8, 0x7cb342);
		}
		if (x + 1 < GRID_WIDTH) {
			//PS.color(x + 1, GROUND_LEVEL - 8, 0x7cb342);
			PS.color(x + 1, GROUND_LEVEL - 9, 0x689f38);
		}
		PS.timerStop(budTimer);
	}

	var fullFlower = function() {
		PS.color(x, GROUND_LEVEL - 9, 0xffc400);
		PS.color(x, GROUND_LEVEL - 13, 0xffd640);
		PS.color(x, GROUND_LEVEL - 10, 0xa3710c);
		PS.color(x, GROUND_LEVEL - 12, 0xa3710c);
		PS.color(x, GROUND_LEVEL - 11, 0x8a5f0a);
		if (x - 1 > 0) {
			PS.color(x - 1, GROUND_LEVEL - 9, 0xffc400);
			PS.color(x - 1, GROUND_LEVEL - 10, 0xffc400);
			PS.color(x - 1, GROUND_LEVEL - 13, 0xffc400);
			PS.color(x - 1, GROUND_LEVEL - 12, 0xffd640);
			PS.color(x - 1, GROUND_LEVEL - 11, 0xa3710c);
		}
		if (x - 2 > 0) {
			PS.color(x - 2, GROUND_LEVEL - 10, 0xffc400);
			PS.color(x - 2, GROUND_LEVEL - 12, 0xffd640);
			PS.color(x - 2, GROUND_LEVEL - 11, 0xffe57f);
		}
		if (x + 1 < GRID_WIDTH) {
			PS.color(x + 1, GROUND_LEVEL - 9, 0xffe57f);
			PS.color(x + 1, GROUND_LEVEL - 12, 0xffe57f);
			PS.color(x + 1, GROUND_LEVEL - 13, 0xffe57f);
			PS.color(x + 1, GROUND_LEVEL - 10, 0xffd640);
			PS.color(x + 1, GROUND_LEVEL - 11, 0xa3710c);
		}
		if (x + 2 < GRID_WIDTH) {
			PS.color(x + 2, GROUND_LEVEL - 11, 0xffe57f);
			PS.color(x + 2, GROUND_LEVEL - 12, 0xffe57f);
			PS.color(x + 2, GROUND_LEVEL - 10, 0xffd640);
		}
		PS.timerStop(fullFlowerTimer);
	}

	var deadFlower = function() {
		PS.timerStop(rootTimer);
		PS.color(x, GROUND_LEVEL, 0x706510);
		PS.color(x, GROUND_LEVEL - 1, 0x706510);
		PS.color(x, GROUND_LEVEL - 8, 0x706510);
		PS.color(x, GROUND_LEVEL - 2, 0x827717);
		PS.color(x, GROUND_LEVEL - 3, 0x827717);
		PS.color(x, GROUND_LEVEL - 4, 0x827717);
		PS.color(x, GROUND_LEVEL - 5, 0x827717);
		PS.color(x, GROUND_LEVEL - 6, 0x827717);
		PS.color(x, GROUND_LEVEL - 7, 0x453e0b);
		PS.color(x, GROUND_LEVEL - 9, 0xc2850b);
		PS.color(x, GROUND_LEVEL - 13, 0xd99709);
		PS.color(x, GROUND_LEVEL - 10, 0x6d4c41);
		PS.color(x, GROUND_LEVEL - 12, 0x6d4c41);
		PS.color(x, GROUND_LEVEL - 11, 0x4e342e);
		if (x - 1 > 0) {
			PS.color(x - 1, GROUND_LEVEL - 1, 0x706510);
			PS.color(x - 1, GROUND_LEVEL - 6, 0x706510);
			PS.color(x - 1, GROUND_LEVEL - 2, 0x827717);
			PS.color(x - 1, GROUND_LEVEL - 10, 0xc2850b);
			PS.color(x - 1, GROUND_LEVEL - 9, 0xa3710c);
			PS.color(x - 1, GROUND_LEVEL - 12, 0xa3710c);
			PS.color(x - 1, GROUND_LEVEL - 13, 0xd99709);
			PS.color(x - 1, GROUND_LEVEL - 11, 0x6d4c41);
			PS.color(x - 1, GROUND_LEVEL - 3, COLOR_SKY);
			PS.color(x - 1, GROUND_LEVEL - 7, COLOR_SKY);
		}
		if (x - 2 > 0) {
			PS.color(x - 2, GROUND_LEVEL - 2, 0x706510);
			PS.color(x - 2, GROUND_LEVEL - 6, 0x827717);
			PS.color(x - 2, GROUND_LEVEL - 11, 0xc2850b);
			PS.color(x - 2, GROUND_LEVEL - 10, 0xa3710c);
			PS.color(x - 2, GROUND_LEVEL - 12, 0xd99709);
			PS.color(x - 2, GROUND_LEVEL - 3, COLOR_SKY);
			PS.color(x - 2, GROUND_LEVEL - 4, COLOR_SKY);
			PS.color(x - 2, GROUND_LEVEL - 7, COLOR_SKY);
			PS.color(x - 2, GROUND_LEVEL - 8, COLOR_SKY);
		}
		if (x + 1 < GRID_WIDTH) {
			PS.color(x + 1, GROUND_LEVEL - 3, 0x706510);
			PS.color(x + 1, GROUND_LEVEL - 4, 0x827717);
			PS.color(x + 1, GROUND_LEVEL - 9, 0xa3710c);
			PS.color(x + 1, GROUND_LEVEL - 10, 0xa3710c);
			PS.color(x + 1, GROUND_LEVEL - 12, 0xa3710c);
			PS.color(x + 1, GROUND_LEVEL - 13, 0xd99709);
			PS.color(x + 1, GROUND_LEVEL - 11, 0x6d4c41);
			PS.color(x + 1, GROUND_LEVEL - 5, COLOR_SKY);
		}
		if (x + 2 < GRID_WIDTH) {
			PS.color(x + 2, GROUND_LEVEL - 4, 0x706510);
			PS.color(x + 2, GROUND_LEVEL - 10, 0xa3710c);
			PS.color(x + 2, GROUND_LEVEL - 11, 0xd99709);
			PS.color(x + 2, GROUND_LEVEL - 12, 0xd99709);
			PS.color(x + 2, GROUND_LEVEL - 5, COLOR_SKY);
			PS.color(x + 2, GROUND_LEVEL - 6, COLOR_SKY);
		}
		PS.timerStop(deadFlowerTimer);
	}

	var rip = function() { 
		PS.timerStop(ripTimer);
		PS.color(x, GROUND_LEVEL, COLOR_SKY);
		PS.color(x, GROUND_LEVEL - 1, COLOR_SKY);
		PS.color(x, GROUND_LEVEL - 8, COLOR_SKY);
		PS.color(x, GROUND_LEVEL - 2, COLOR_SKY);
		PS.color(x, GROUND_LEVEL - 3, COLOR_SKY);
		PS.color(x, GROUND_LEVEL - 4, COLOR_SKY);
		PS.color(x, GROUND_LEVEL - 5, COLOR_SKY);
		PS.color(x, GROUND_LEVEL - 6, COLOR_SKY);
		PS.color(x, GROUND_LEVEL - 7, COLOR_SKY);
		PS.color(x, GROUND_LEVEL - 9, COLOR_SKY);
		PS.color(x, GROUND_LEVEL - 13, COLOR_SKY);
		PS.color(x, GROUND_LEVEL - 10, COLOR_SKY);
		PS.color(x, GROUND_LEVEL - 12, COLOR_SKY);
		PS.color(x, GROUND_LEVEL - 11, COLOR_SKY);
		if (x - 1 > 0) {
			PS.color(x - 1, GROUND_LEVEL - 1, COLOR_SKY);
			PS.color(x - 1, GROUND_LEVEL - 6, COLOR_SKY);
			PS.color(x - 1, GROUND_LEVEL - 2, COLOR_SKY);
			PS.color(x - 1, GROUND_LEVEL - 10, COLOR_SKY);
			PS.color(x - 1, GROUND_LEVEL - 9, COLOR_SKY);
			PS.color(x - 1, GROUND_LEVEL - 12, COLOR_SKY);
			PS.color(x - 1, GROUND_LEVEL - 13, COLOR_SKY);
			PS.color(x - 1, GROUND_LEVEL - 11, COLOR_SKY);
		}
		if (x - 2 > 0) {
			PS.color(x - 2, GROUND_LEVEL - 2, COLOR_SKY);
			PS.color(x - 2, GROUND_LEVEL - 6, COLOR_SKY);
			PS.color(x - 2, GROUND_LEVEL - 11, COLOR_SKY);
			PS.color(x - 2, GROUND_LEVEL - 10, COLOR_SKY);
			PS.color(x - 2, GROUND_LEVEL - 12, COLOR_SKY);
		}
		if (x + 1 < GRID_WIDTH) {
			PS.color(x + 1, GROUND_LEVEL - 3, COLOR_SKY);
			PS.color(x + 1, GROUND_LEVEL - 4, COLOR_SKY);
			PS.color(x + 1, GROUND_LEVEL - 9, COLOR_SKY);
			PS.color(x + 1, GROUND_LEVEL - 10, COLOR_SKY);
			PS.color(x + 1, GROUND_LEVEL - 12, COLOR_SKY);
			PS.color(x + 1, GROUND_LEVEL - 13, COLOR_SKY);
			PS.color(x + 1, GROUND_LEVEL - 11, COLOR_SKY);
		}
		if (x + 2 < GRID_WIDTH) {
			PS.color(x + 2, GROUND_LEVEL - 4, COLOR_SKY);
			PS.color(x + 2, GROUND_LEVEL - 10, COLOR_SKY);
			PS.color(x + 2, GROUND_LEVEL - 11, COLOR_SKY);
			PS.color(x + 2, GROUND_LEVEL - 12, COLOR_SKY);
		}
		for (var i = 0; i < seed_Tracker.length; i++) {
			if (x == seed_Tracker[i][0]) {
				seed_Tracker.splice(i, 1);
			}
		}
	}

	/*var rootTicks = 6;
	var smolTicks = Math.floor((Math.random()*100) + 20);
	var saplingTicks = Math.floor((Math.random()*100) + 70);
	var budTicks = Math.floor((Math.random()*100) + 130);
	var fullFlowerTicks = Math.floor((Math.random()*100) + 190);
	var deadFlowerTicks = Math.floor((Math.random()*60) + 330);
	var ripTicks = Math.floor((Math.random()*60) + 380);*/

	rootTimer = PS.timerStart(6, root);
	smolTimer = PS.timerStart(60, smol);
	saplingTimer = PS.timerStart(120, sapling);
	budTimer = PS.timerStart(180, bud);
	fullFlowerTimer = PS.timerStart(240, fullFlower);
	deadFlowerTimer = PS.timerStart(370, deadFlower);
	ripTimer = PS.timerStart(430, rip);
}

var growTulip = function(x) {
	var rootTimer;
	var smolTimer;
	var saplingTimer;
	var budTimer;
	var fullFlowerTimer;
	var deadFlowerTimer;
	var ripTimer;

	var root = function() {
		PS.color(x, GROUND_LEVEL, 0x1b5e1f);
	}

	var smol = function() {
		PS.color(x, GROUND_LEVEL, 0x1b5e1f);
		PS.color(x, GROUND_LEVEL - 1, 0x43a048);
		if (x - 1 > 0) PS.color(x - 1, GROUND_LEVEL - 2, 0x43a048);
		PS.timerStop(smolTimer);
	}
	
	var sapling = function() {
		PS.color(x, GROUND_LEVEL - 2, 0x43a048);
		PS.color(x, GROUND_LEVEL - 3, 0x4caf4f);
		PS.color(x, GROUND_LEVEL - 4, 0x66bb6a);
		if (x - 1 > 0) PS.color(x - 1, GROUND_LEVEL - 1, 0x2e7d32);
		if (x - 2 > 0) {
			PS.color(x - 2, GROUND_LEVEL - 2, 0x388e3d);
			PS.color(x - 2, GROUND_LEVEL - 3, 0x43a048);
		}
		if (x + 1 < GRID_WIDTH) {
			PS.color(x + 1, GROUND_LEVEL - 3, 0x4caf4f);
			PS.color(x + 1, GROUND_LEVEL - 1, 0x2e7d32);
			PS.color(x + 1, GROUND_LEVEL - 2, 0x388e3d);
		}
		if (x + 2 < GRID_WIDTH) {
			PS.color(x + 2, GROUND_LEVEL - 2, 0x2e7d32);
			PS.color(x + 2, GROUND_LEVEL - 3, 0x2e7d32);
			PS.color(x + 2, GROUND_LEVEL - 4, 0x4caf4f);
		}
		PS.timerStop(saplingTimer);
	}

	var bud = function() {
		PS.color(x, GROUND_LEVEL - 5, 0x2e7d32);
		PS.color(x, GROUND_LEVEL - 6, 0x7b1fa2);
		PS.color(x, GROUND_LEVEL - 7, 0xaa47bc);
		PS.color(x, GROUND_LEVEL - 8, 0xba68c8);
		if (x - 1 > 0) {
			PS.color(x - 1, GROUND_LEVEL - 6, 0x7b1fa2);
			PS.color(x - 1, GROUND_LEVEL - 7, 0xaa47bc);
		}
		if (x - 2 > 0) {
			PS.color(x - 2, GROUND_LEVEL - 4, 0x66bb6a);
		}
		if (x + 1 < GRID_WIDTH) {
			PS.color(x + 1, GROUND_LEVEL - 6, 0x7b1fa2);
			PS.color(x + 1, GROUND_LEVEL - 7, 0xaa47bc);
		}
		if (x + 2 < GRID_WIDTH) {
			PS.color(x + 2, GROUND_LEVEL - 5, 0x66bb6a);
		}
		PS.timerStop(budTimer);
	}

	var fullFlower = function() { 
		if (x - 1 > 0) {
			PS.color(x - 1, GROUND_LEVEL - 6, COLOR_SKY);
			PS.color(x - 1, GROUND_LEVEL - 7, 0x7b1fa2);
			PS.color(x - 1, GROUND_LEVEL - 8, 0xaa47bc);
			PS.color(x - 1, GROUND_LEVEL - 9, 0xba68c8);
		}
		if (x - 2 > 0) {
		}
		if (x + 1 < GRID_WIDTH) {
			PS.color(x + 1, GROUND_LEVEL - 6, COLOR_SKY);
			PS.color(x + 1, GROUND_LEVEL - 7, 0x7b1fa2);
			PS.color(x + 1, GROUND_LEVEL - 8, 0xaa47bc);
			PS.color(x + 1, GROUND_LEVEL - 9, 0xba68c8);
		}
		if (x + 2 < GRID_WIDTH) {
		}
		PS.timerStop(fullFlowerTimer);
	}

	var deadFlower = function() {
		PS.timerStop(rootTimer);
		PS.color(x, GROUND_LEVEL, 0x827717);
		PS.color(x, GROUND_LEVEL - 1, 0x9e9e24);
		PS.color(x, GROUND_LEVEL - 2, 0xc0ca33);
		PS.color(x, GROUND_LEVEL - 3, 0xc0ca33);
		PS.color(x, GROUND_LEVEL - 4, 0xc0ca33);
		PS.color(x, GROUND_LEVEL - 5, 0x9e9e24);
		PS.color(x, GROUND_LEVEL - 6, 0x5e35b1);
		PS.color(x, GROUND_LEVEL - 7, 0x7e57c2);
		PS.color(x, GROUND_LEVEL - 8, 0x9675cd);
		if (x - 1 > 0) {
			PS.color(x - 1, GROUND_LEVEL - 1, 0x9e9e24);
			PS.color(x - 1, GROUND_LEVEL - 2, 0xccdc39);
			PS.color(x - 1, GROUND_LEVEL - 6, 0x5e35b1);
			PS.color(x - 1, GROUND_LEVEL - 7, 0x7e57c2);
			PS.color(x - 1, GROUND_LEVEL - 8, COLOR_SKY);
			PS.color(x - 1, GROUND_LEVEL - 9, COLOR_SKY);
		}
		if (x - 2 > 0) {
			PS.color(x - 2, GROUND_LEVEL - 2, 0x9e9e24);
			PS.color(x - 2, GROUND_LEVEL - 3, 0xccdc39);
			PS.color(x - 2, GROUND_LEVEL - 4, COLOR_SKY);
		}
		if (x + 1 < GRID_WIDTH) {
			PS.color(x + 1, GROUND_LEVEL - 1, 0x827717);
			PS.color(x + 1, GROUND_LEVEL - 2, 0x9e9e24);
			PS.color(x + 1, GROUND_LEVEL - 3, 0xccdc39);
			PS.color(x + 1, GROUND_LEVEL - 6, 0x7e57c2);
			PS.color(x + 1, GROUND_LEVEL - 7, 0x9675cd);
			PS.color(x + 1, GROUND_LEVEL - 8, COLOR_SKY);
			PS.color(x + 1, GROUND_LEVEL - 9, COLOR_SKY);
		}
		if (x + 2 < GRID_WIDTH) {
			PS.color(x + 2, GROUND_LEVEL - 2, 0x827717);
			PS.color(x + 2, GROUND_LEVEL - 3, 0x827717);
			PS.color(x + 2, GROUND_LEVEL - 4, 0xc0ca33);
			PS.color(x + 2, GROUND_LEVEL - 5, COLOR_SKY);
		}
		PS.timerStop(deadFlowerTimer);
	}

	var rip = function() { 
		PS.color(x, GROUND_LEVEL, COLOR_SKY);
		PS.color(x, GROUND_LEVEL - 1, COLOR_SKY);
		PS.color(x, GROUND_LEVEL - 2, COLOR_SKY);
		PS.color(x, GROUND_LEVEL - 3, COLOR_SKY);
		PS.color(x, GROUND_LEVEL - 4, COLOR_SKY);
		PS.color(x, GROUND_LEVEL - 5, COLOR_SKY);
		PS.color(x, GROUND_LEVEL - 6, COLOR_SKY);
		PS.color(x, GROUND_LEVEL - 7, COLOR_SKY);
		PS.color(x, GROUND_LEVEL - 8, COLOR_SKY);
		if (x - 1 > 0) {
			PS.color(x - 1, GROUND_LEVEL - 1, COLOR_SKY);
			PS.color(x - 1, GROUND_LEVEL - 2, COLOR_SKY);
			PS.color(x - 1, GROUND_LEVEL - 6, COLOR_SKY);
			PS.color(x - 1, GROUND_LEVEL - 7, COLOR_SKY);
		}
		if (x - 2 > 0) {
			PS.color(x - 2, GROUND_LEVEL - 2, COLOR_SKY);
			PS.color(x - 2, GROUND_LEVEL - 3, COLOR_SKY);
		}
		if (x + 1 < GRID_WIDTH) {
			PS.color(x + 1, GROUND_LEVEL - 1, COLOR_SKY);
			PS.color(x + 1, GROUND_LEVEL - 2, COLOR_SKY);
			PS.color(x + 1, GROUND_LEVEL - 3, COLOR_SKY);
			PS.color(x + 1, GROUND_LEVEL - 6, COLOR_SKY);
			PS.color(x + 1, GROUND_LEVEL - 7, COLOR_SKY);
		}
		if (x + 2 < GRID_WIDTH) {
			PS.color(x + 2, GROUND_LEVEL - 2, COLOR_SKY);
			PS.color(x + 2, GROUND_LEVEL - 3, COLOR_SKY);
			PS.color(x + 2, GROUND_LEVEL - 4, COLOR_SKY);
		}
		PS.timerStop(ripTimer);
		for (var i = 0; i < seed_Tracker.length; i++) {
			if (x == seed_Tracker[i][0]) {
				seed_Tracker.splice(i, 1);
			}
		}
	}

	/*var rootTicks = 6;
	var smolTicks = Math.floor((Math.random()*100) + 20);
	var saplingTicks = Math.floor((Math.random()*100) + 70);
	var budTicks = Math.floor((Math.random()*100) + 130);
	var fullFlowerTicks = Math.floor((Math.random()*100) + 190);
	var deadFlowerTicks = Math.floor((Math.random()*60) + 330);
	var ripTicks = Math.floor((Math.random()*60) + 380);*/

	rootTimer = PS.timerStart(6, root);
	smolTimer = PS.timerStart(60, smol);
	saplingTimer = PS.timerStart(120, sapling);
	budTimer = PS.timerStart(180, bud);
	fullFlowerTimer = PS.timerStart(240, fullFlower);
	deadFlowerTimer = PS.timerStart(370, deadFlower);
	ripTimer = PS.timerStart(430, rip);
}

var growRose = function(x) {
	var rootTimer;
	var smolTimer;
	var saplingTimer;
	var budTimer;
	var fullFlowerTimer;
	var deadFlowerTimer;
	var ripTimer;

	var root = function() {
		PS.color(x, GROUND_LEVEL, 0x4caf4f);
	}

	var smol = function() {
		PS.color(x, GROUND_LEVEL, 0x4caf4f);
		PS.color(x, GROUND_LEVEL - 1, 0x3d9e40);
		if (x+1 < GRID_WIDTH) PS.color(x + 1, GROUND_LEVEL - 2, 0x4caf4f);
		PS.timerStop(smolTimer);
	}
	
	var sapling = function() {
		if (x-1 > 0) PS.color(x - 1, GROUND_LEVEL - 2, 0x8bc34a);
		if (x+2 < GRID_WIDTH) PS.color(x + 2, GROUND_LEVEL - 3, 0x8bc34a);
		PS.timerStop(saplingTimer);
	}

	var bud = function() {
		PS.color(x, GROUND_LEVEL - 2, 0x4caf4f);
		PS.color(x, GROUND_LEVEL - 3, 0x4caf4f);
		PS.color(x, GROUND_LEVEL - 4, 0x009687);
		PS.color(x, GROUND_LEVEL - 5, 0xc62828);
		if (x+1 < GRID_WIDTH) PS.color(x + 1, GROUND_LEVEL - 6, 0xef5250);
		if (x-1 > 0) PS.color(x - 1, GROUND_LEVEL - 6, 0xc62828);
		PS.timerStop(budTimer);
	}

	var fullFlower = function() {
		if (x+1 < GRID_WIDTH) PS.color(x + 1, GROUND_LEVEL - 5, 0xb71c1c);
		if (x-1 > 0) PS.color(x - 1, GROUND_LEVEL - 5, 0xe91e62);
		PS.color(x, GROUND_LEVEL - 6, 0xef5250);
		if (x+2 < GRID_WIDTH) PS.color(x + 2, GROUND_LEVEL - 6, 0xe91e62);
		if (x-2 > 0) PS.color(x - 2, GROUND_LEVEL - 6, 0xc62828);
		PS.color(x, GROUND_LEVEL - 7, 0xe57373);
		if (x+1 < GRID_WIDTH) PS.color(x + 1, GROUND_LEVEL - 7, 0xe91e62);
		if (x-2 > 0) PS.color(x - 2, GROUND_LEVEL - 7, 0xe91e62);
		if (x-1 > 0) PS.color(x - 1, GROUND_LEVEL - 7, 0xef5250);
		if (x-1 > 0) PS.color(x - 1, GROUND_LEVEL - 8, 0xe91e62);
		PS.timerStop(fullFlowerTimer);
	}

	var deadFlower = function() {
		PS.timerStop(rootTimer);
		PS.color(x, GROUND_LEVEL, 0x9e9e24);
		PS.color(x, GROUND_LEVEL - 1, 0x827717);
		if (x+1 < GRID_WIDTH) PS.color(x + 1, GROUND_LEVEL - 2, 0x9e9e24);
		if (x+2 < GRID_WIDTH) PS.color(x + 2, GROUND_LEVEL - 1, 0xc0ca33);
		if (x-1 > 0) PS.color(x - 1, GROUND_LEVEL - 2, 0xc0ca33);
		PS.color(x, GROUND_LEVEL - 2, 0x9e9e24);
		PS.color(x, GROUND_LEVEL - 3, 0x9e9e24);
		PS.color(x, GROUND_LEVEL - 4, 0x827717);
		PS.color(x, GROUND_LEVEL - 5, 0x946276);
		if (x+1 < GRID_WIDTH) PS.color(x + 1, GROUND_LEVEL - 5, 0x946276);
		if (x-1 > 0) PS.color(x - 1, GROUND_LEVEL - 7, 0x946276);
		PS.color(x, GROUND_LEVEL - 6, 0x9c4665);
		if (x-1 > 0) PS.color(x - 1, GROUND_LEVEL - 6, 0x9c4665);
		if (x+1 < GRID_WIDTH) PS.color(x + 1, GROUND_LEVEL - 6, 0x8c435f);
		PS.color(x, GROUND_LEVEL - 7, 0x8c435f);
		if (x-2 > 0) PS.color(x - 2, GROUND_LEVEL - 7, 0xe91e62);
		if (x+2 < GRID_WIDTH) PS.color(x + 2, GROUND_LEVEL - 3, COLOR_SKY);
		if (x-1 > 0) PS.color(x - 1, GROUND_LEVEL - 5, COLOR_SKY);
		if (x-1 > 0) PS.color(x - 1, GROUND_LEVEL - 8, COLOR_SKY);
		if (x-2 > 0) PS.color(x - 2, GROUND_LEVEL - 6, COLOR_SKY);
		if (x-2 > 0) PS.color(x - 2, GROUND_LEVEL - 7, COLOR_SKY);
		if (x+1 < GRID_WIDTH) PS.color(x + 1, GROUND_LEVEL - 7, COLOR_SKY);
		if (x+2 < GRID_WIDTH) PS.color(x + 2, GROUND_LEVEL - 6, COLOR_SKY);
		PS.timerStop(deadFlowerTimer);
	}

	var rip = function() {
		PS.color(x, GROUND_LEVEL, COLOR_SKY);
		PS.color(x, GROUND_LEVEL - 1, COLOR_SKY);
		if (x+1 < GRID_WIDTH) PS.color(x + 1, GROUND_LEVEL - 2, COLOR_SKY);
		if (x+2 < GRID_WIDTH) PS.color(x + 2, GROUND_LEVEL - 1, COLOR_SKY);
		if (x-1 > 0) PS.color(x - 1, GROUND_LEVEL - 2, COLOR_SKY);
		PS.color(x, GROUND_LEVEL - 2, COLOR_SKY);
		PS.color(x, GROUND_LEVEL - 3, COLOR_SKY);
		PS.color(x, GROUND_LEVEL - 4, COLOR_SKY);
		PS.color(x, GROUND_LEVEL - 5, COLOR_SKY);
		if (x+1 < GRID_WIDTH) PS.color(x + 1, GROUND_LEVEL - 5, COLOR_SKY);
		if (x-1 > 0) PS.color(x - 1, GROUND_LEVEL - 7, COLOR_SKY);
		PS.color(x, GROUND_LEVEL - 6, COLOR_SKY);
		if (x-1 > 0) PS.color(x - 1, GROUND_LEVEL - 6, COLOR_SKY);
		if (x+1 < GRID_WIDTH) PS.color(x + 1, GROUND_LEVEL - 6, COLOR_SKY);
		PS.color(x, GROUND_LEVEL - 7, COLOR_SKY);
		if (x-2 > 0) PS.color(x - 2, GROUND_LEVEL - 7, COLOR_SKY);
		PS.timerStop(ripTimer);
		for (var i = 0; i < seed_Tracker.length; i++) {
			if (x == seed_Tracker[i][0]) {
				seed_Tracker.splice(i, 1);
			}
		}
	}

	/*var rootTicks = 6;
	var smolTicks = Math.floor((Math.random()*100) + 20);
	var saplingTicks = Math.floor((Math.random()*100) + 70);
	var budTicks = Math.floor((Math.random()*100) + 130);
	var fullFlowerTicks = Math.floor((Math.random()*100) + 190);
	var deadFlowerTicks = Math.floor((Math.random()*60) + 330);
	var ripTicks = Math.floor((Math.random()*60) + 380);*/

	rootTimer = PS.timerStart(6, root);
	smolTimer = PS.timerStart(60, smol);
	saplingTimer = PS.timerStart(120, sapling);
	budTimer = PS.timerStart(180, bud);
	fullFlowerTimer = PS.timerStart(240, fullFlower);
	deadFlowerTimer = PS.timerStart(370, deadFlower);
	ripTimer = PS.timerStart(430, rip);

}

var animate = function () {
	var len, i, seed, x, y;
	len = seeds.length;
	i = 0;
	while (i < len){
		seed = seeds[i];
		x = seed[0];
		y = seed[1];
		if (y < GROUND_LEVEL) {
			if (PS.color(x,y) == COLOR_SEED) PS.color(x, y, COLOR_SKY);
			y += 1;
			seed[1] = y;
			if (y < GROUND_LEVEL){
				if (PS.color(x,y) == COLOR_SKY) {
					PS.color(x, y, COLOR_SEED);
				}
			}
			else {
				bury(x, y);
			}
			i += 1;
		}
		else {
			if (PS.color(x,y) == COLOR_SEED) PS.color(x, y, COLOR_SKY);
			seeds.splice(i, 1);
			len -= 1;
		}
	}
}


PS.init = function( system, options ) {
	// Change this string to your team name
	// Use only ALPHABETIC characters
	// No numbers, spaces or punctuation!

	const TEAM = "Frog";

	// Begin with essential setup
	// Establish initial grid size

	PS.gridSize( GRID_WIDTH, GRID_HEIGHT); // or whatever size you want

	// Install additional initialization code
	// here as needed

	PS.gridColor(0x6A98D2);
	PS.border(PS.ALL, PS.ALL, 0);
	PS.color(PS.ALL, PS.ALL, COLOR_SKY);
	PS.color(PS.ALL, 19, COLOR_GROUND_1);
	PS.color(PS.ALL, 18, COLOR_GROUND_1);
	PS.color(PS.ALL, 17, COLOR_GROUND_1);
/*	PS.color(0, 18, COLOR_GROUND_2);
	PS.color(4, 18, COLOR_GROUND_2);
	PS.color(5, 17, COLOR_GROUND_2);
	PS.color(9, 19, COLOR_GROUND_2);
	PS.color(10, 18, COLOR_GROUND_2);
	PS.color(14, 18, COLOR_GROUND_2);
	PS.color(15, 17, COLOR_GROUND_2);
	PS.color(19, 19, COLOR_GROUND_2);
	PS.color(20, 18, COLOR_GROUND_2);
	PS.color(24, 18, COLOR_GROUND_2);
	PS.color(25, 17, COLOR_GROUND_2);
	PS.color(29, 19, COLOR_GROUND_2);
	PS.color(30, 18, COLOR_GROUND_2); */
	PS.statusText("Flower Garden");
	PS.statusColor(0x064F0A);

	PS.timerStart(SPEED, animate);
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

PS.touch = function( x, y, data, options ) {
	// Uncomment the following code line
	// to inspect x/y parameters:

	// PS.debug( "PS.touch() @ " + x + ", " + y + "\n" );
	if (y < GROUND_LEVEL){
		if (PS.color(x,y) == COLOR_SKY) {
			PS.color(x, y, COLOR_SEED);
		}
		PS.audioPlay(DROP_SOUND);
	}
	else if (y = GROUND_LEVEL){
		bury(x, y);
	}
	seeds.push([x,y]);
	//PS.debug("seedTracker:" + seed_Tracker);
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
//	0xD29A3E
//	0xD2B26A

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

