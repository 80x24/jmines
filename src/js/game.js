/*
Note: This is my first real foray into JavaScript, so that code below will
probably reflect that. Enjoy.


Copyright 2017 Kyle Schreiber

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.

*/

// Globals are bad. mmmkay
var BOARD = null;
var FLAG_BOARD = null;
var START = true;
var COUNTER = null;
var TIME_TAKEN = 0;
var FLAGS = 0;
var MOUSEPOS = null;
var canvasElement = document.getElementById("canvas");
var canvas = canvasElement.getContext("2d");
var images = null;
var LOADED_IMAGES = false;

function main() {
	
	canvasElement.addEventListener("click", regClick, false);
	canvasElement.addEventListener("mousemove", function(event) {
		MOUSEPOS = getMousePos(canvasElement, event);
	}, false);
	canvasElement.addEventListener("contextmenu", function(e) {
		e.preventDefault();
		rightClick();
		return false;
	}, false);
	// restart button
	var restartButton = document.getElementById("restart-button");
	restartButton.addEventListener("click", function() {
		FLAGS = 0;
		TIME_TAKEN = 0;
		START = true;
		clearInterval(COUNTER);
		document.getElementById("timer").innerHTML = 0;
		document.getElementById("flag-count").innerHTML = "0/10";
		document.getElementById("result-text").innerHTML = "---";
		document.getElementById("result-text").removeAttribute("style");
		// Give the user the ability to click again.
		canvasElement.addEventListener("click", regClick, false);
		init();
	}, false);
	init();
}

function init() {
	// BOARD STATE
	// 0 hidden, no bomb.
	// 1 hidden, bomb.
	// 2 revealed, no bomb.
	// 3 revealed, bomb. (you lose)
	// 4. revealed, bomb. (for game over screen to show bomb.)
	// 5. 1
	// 6. 2
	// 7. 3
	// 8. 4
	// 9. 5
	// 10. 6
	// 11. 7
	// 12. 8
	// 13. 1 hidden
	// 14. 2 hidden
	// 15. 3 hidden
	// 16. 4 hidden
	// 17. 5 hidden
	// 18. 6 hidden
	// 19. 7 hidden
	// 20. 8 hidden
	BOARD = new Array(8);
	FLAG_BOARD = new Array(8);
	
	// random choice for bombs.
	// For the length of this array, we will select a random element from this
	// array and then reduce the size of the array until it is 0.
	var choices = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
	0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1];

	choices = shuffle(choices);


	for (var row = 0; row < 8; row++) {
		BOARD[row] = new Array(8);
		FLAG_BOARD[row] = new Array(8);
		for (var col = 0; col < 8; col++) {
			var randint = getRandomInt(0, choices.length);
			BOARD[row][col] = choices[randint];
			// remove that element from choices
			choices.splice(randint, 1);
			FLAG_BOARD[row][col] = 0;
		}
	}

	for (var row = 0; row < 8; row++) {
		for (var col = 0; col < 8; col++) {
			var totalMines = 0;
			var checkrow = 0;
			var checkcol = 0;
			for (var i = 0; i < 8; i++) {
				switch(i) {
					case 0:
						// left
						checkrow = row;
						checkcol = col - 1;
						totalMines += getMineCount(checkrow, checkcol);
						break;
					case 1:
						// top left
						checkrow = row - 1;
						checkcol = col - 1;
						totalMines += getMineCount(checkrow, checkcol);
						break;
					case 2:
						// top middle
						checkrow = row - 1;
						checkcol = col;
						totalMines += getMineCount(checkrow, checkcol);
						break;
					case 3:
						// top right
						checkrow = row - 1;
						checkcol = col + 1;
						totalMines += getMineCount(checkrow, checkcol);
						break;
					case 4:
						// right
						checkrow = row;
						checkcol = col + 1;
						totalMines += getMineCount(checkrow, checkcol);
						break;
					case 5:
						// bottom right
						checkrow = row + 1;
						checkcol = col + 1;
						totalMines += getMineCount(checkrow, checkcol);
						break;
					case 6:
						// bottom middle
						checkrow = row + 1;
						checkcol = col;
						totalMines += getMineCount(checkrow, checkcol);
						break;
					case 7:
						// bottom left
						checkrow = row + 1;
						checkcol = col - 1;
						totalMines += getMineCount(checkrow, checkcol);
						break;
					default:
						console.log("We shouldn't ever get here.");
						break;
				}
			}

			if (BOARD[row][col] != 1) {
				if (totalMines == 0) {
					BOARD[row][col] = 0;
				}
				else {
					BOARD[row][col] = totalMines + 12;
				}
			}
		}
	}

	// LOAD ALL OF THE IMAGES
	// 0: flag.svg
	// 1: 1mines.svg
	// 2: 2mines.svg
	// 3: 3mines.svg
	// 4: 4mines.svg
	// 5: 5mines.svg
	// 6: 6mines.svg
	// 7: 7mines.svg
	// 8: 8mines.svg
	// 9: mine.svg
	// 10: exploded.svg
	
	if (!LOADED_IMAGES) {
		images = new Array(11);
		images[0] = new Image();
		images[0].src = "./src/img/flag.svg";
		images[1] = new Image();
		images[1].src = "./src/img/1mines.svg";
		images[2] = new Image();
		images[2].src = "./src/img/2mines.svg";
		images[3] = new Image();
		images[3].src = "./src/img/3mines.svg";
		images[4] = new Image();
		images[4].src = "./src/img/4mines.svg";
		images[5] = new Image();
		images[5].src = "./src/img/5mines.svg";
		images[6] = new Image();
		images[6].src = "./src/img/6mines.svg";
		images[7] = new Image();
		images[7].src = "./src/img/7mines.svg";
		images[8] = new Image();
		images[8].src = "./src/img/8mines.svg";
		images[9] = new Image();
		images[9].src = "./src/img/mine.svg";
		images[10] = new Image();
		images[10].src = "./src/img/exploded.svg";
		LOADAED_IMAGES = true;
	}

	render();
}

function getMineCount(row, col) {
	var totalMines = 0;
	if (goodBound(row, col) == true) {
		if (BOARD[row][col] == 1) {
			totalMines += 1;
		}
	}
	return totalMines;
}

function goodBound(row, col) {
	if (row < 0 || row > 7) {
		return false;
	}
	if (col < 0 || col > 7) {
		return false;
	}
	else {
		return true;
	}
}

function printBoard() {
	// DEBUG BOARD
	var mystr = ""
	for (var row = 0; row < 8; row++) {
		for (var col = 0; col < 8; col++) {
			mystr += BOARD[row][col];
			mystr += ",";
		}
		mystr += "\n";
	}
	console.log(mystr);
}

function printFlagBoard() {
	var mystr = ""
	for (var row = 0; row < 8; row++) {
		for (var col = 0; col < 8; col++) {
			mystr += FLAG_BOARD[row][col];
			mystr += ",";
		}
		mystr += "\n";
	}
	console.log(mystr);
}

function rightClick() {
	var collision_values = checkCollision();
	if (collision_values[0] == 1) {
		var row = collision_values[1];
		var col = collision_values[2];
		// check that we are only putting flags on hidden tiles.
		if (FLAG_BOARD[row][col] == 0 && (BOARD[row][col] >= 13 || BOARD[row][col] <= 1)) {
			FLAG_BOARD[row][col] = 1;
			FLAGS++;
		}
		else {
			// If they were able to put a flag there in the first place,
			// we shouldn't have to check that it is in the right spot before
			// removing it.
			FLAG_BOARD[row][col] = 0;
			FLAGS--;
		}
		if (checkWin()) {
			win();
		}
	}
	else {
		console.log("Right click didn't click in bounds. Rare.");
	}
	render();
	renderFlag();
	updateFlagCount();
}

function updateFlagCount() {
	document.getElementById("flag-count").innerHTML = FLAGS + "/10";
}

function regClick() {
	// The user can click on a button that lands them on
	// a 1-8 tile. In that case, we dont' recursively search.
	// If the user clicks on a blank tile, we need to recursively
	// search to reveal all of the adjacent blank tiles.

	// Start the clock at the beginning of the game.
	if (START) {
		COUNTER = setInterval(timer, 1000);
		START = false;
	}

	// what to do when we click.
	// Make sure we aren't clicking on a flag.
	var collision_values = checkCollision();
	var row = collision_values[1];
	var col = collision_values[2];
	if (collision_values[0] == 1 && FLAG_BOARD[row][col] != 1) {
		// lose
		if (BOARD[row][col] == 1) {
			BOARD[row][col] = 3;
			lose();
		}
		// hidden tiles 1 - 8
		else if (BOARD[row][col] >= 13) {
			// set the hidden number to revealed.
			BOARD[row][col] = BOARD[row][col] - 8;
		}
		// we click on a blank hidden space.
		else if (BOARD[row][col] == 0) {
			revealTile(row, col);
			// This is needed because the number of revealed tiles is not
			// updated properly until the next check if more than one tile is
			// revealed. This is that extra check to combat this.
			if (checkWin()) {
				win();
			}
		}
		else {
			console.log("Nothing happens.");
		}

		if (checkWin()) {
			win();
		}
	}
	else {
		console.log("No collision. Should be rare.");
	}

	render();
	renderFlag();
}

function checkCollision() {
	// checkCollision() returns [collsion_status, row, col];

	// collision_map is gross, but works.
	// values are [minx, maxx, miny, maxy]
	collision_map = [[[0, 32, 0, 32], [34, 66, 0, 32], [68, 100, 0, 32], [102, 134, 0, 32], [136, 168, 0, 32], [170, 202, 0, 32], [204, 236, 0, 32], [238, 270, 0, 32]],
					[[0, 32, 34, 66], [34, 66, 34, 66], [68, 100, 34, 66], [102, 134, 34, 66], [136, 168, 34, 66], [170, 202, 34, 66], [204, 236, 34, 66], [238, 270, 34, 66]],
					[[0, 32, 68, 100], [34, 66, 68, 100], [68, 100, 68, 100], [102, 134, 68, 100], [136, 168, 68, 100], [170, 202, 68, 100], [204, 236, 68, 100], [238, 270, 68, 100]],
					[[0, 32, 102, 134], [34, 66, 102, 134], [68, 100, 102, 134], [102, 134, 102, 134], [136, 168, 102, 134], [170, 202, 102, 134], [204, 236, 102, 134], [238, 270, 102, 134]],
					[[0, 32, 136, 168], [34, 66, 136, 168], [68, 100, 136, 168], [102, 134, 136, 168], [136, 168, 136, 168], [170, 202, 136, 168], [204, 236, 136, 168], [238, 270, 136, 168]],
					[[0, 32, 170, 202], [34, 66, 170, 202], [68, 100, 170, 202], [102, 134, 170, 202], [136, 168, 170, 202], [170, 202, 170, 202], [204, 236, 170, 202], [238, 270, 170, 202]],
					[[0, 32, 204, 236], [34, 66, 204, 236], [68, 100, 204, 236], [102, 134, 204, 236], [136, 168, 204, 236], [170, 202, 204, 236], [204, 236, 204, 236], [238, 270, 204, 237]],
					[[0, 32, 238, 270], [34, 66, 238, 270], [68, 100, 238, 270], [102, 134, 238, 270], [136, 168, 238, 270], [170, 202, 238, 270], [204, 236, 238, 270], [238, 270, 238, 270]]
					];

	var rv = [0, 0, 0];
	for (var row = 0; row < 8; row++) {
		for (var col = 0; col < 8; col++) {
			var xmin = collision_map[row][col][0];
			var xmax = collision_map[row][col][1];
			var ymin = collision_map[row][col][2];
			var ymax = collision_map[row][col][3];
			if (MOUSEPOS.x > xmin && MOUSEPOS.x < xmax && MOUSEPOS.y > ymin && MOUSEPOS.y < ymax) {
				rv = [1, row, col];
			}
		}
	}
	return rv;
}

function checkWin() {
	// Make sure that there are 54 revealed squares. Leaving 10 bombs.
	// We need to make sure there aren't any flags on blank spaces.
	var won = false;
	for (var row = 0; row < 8; row++) {
		for (var col = 0; col < 8; col++) {
			if (FLAG_BOARD[row][col] == 1 && BOARD[row][col] != 1) {
				won = false;
			}
		}
	}
	var numrevealed = 0;
	for (var row = 0; row < 8; row++) {
		for (var col = 0; col < 8; col++) {
			if (BOARD[row][col] == 2 || (BOARD[row][col] >= 5 && BOARD[row][col] < 13)) {
				numrevealed += 1;
			}
		}
	}
	if (numrevealed == 54) {
		won = true;
	}
	return won;
}

function win() {
	var resultText = document.getElementById("result-text");
	resultText.style = "color: green";
	resultText.innerHTML = "You Win!";
	clearInterval(COUNTER);
	// remove ability to click on board.
	// They can still right click.
	document.getElementById("canvas").removeEventListener("click", regClick);
}

function lose() {
	for (var row = 0; row < 8; row++) {
		for (var col = 0; col < 8; col++) {
			// set the bombs to their bomb revealed state when we lose
			if (BOARD[row][col] == 1) {
				BOARD[row][col] = 4;
			}
		}
	}
	var resultText = document.getElementById("result-text");
	resultText.style = "color: red";
	resultText.innerHTML = "You Lost";
	clearInterval(COUNTER);
	// remove ability to click on board.
	// They can still right click.
	document.getElementById("canvas").removeEventListener("click", regClick);
}

function revealTile(row, col) {
	// recursive function to reveal blank tiles. Make sure it's a hidden tile that's not a bomb.
	if (row >= 0 && row < 8 && col >= 0 && col < 8 && (BOARD[row][col] == 0 || BOARD[row][col] >= 13) && FLAG_BOARD[row][col] != 1) {
		// set the tile to revealed.
		if (BOARD[row][col] != 0) {
			BOARD[row][col] = BOARD[row][col] - 8;
		}
		if (BOARD[row][col] == 0) {
			BOARD[row][col] = 2;
			revealTile(row, col+1);
			revealTile(row, col-1);
			revealTile(row+1, col);
			revealTile(row+1, col+1);
			revealTile(row+1, col-1);
			revealTile(row-1, col);
			revealTile(row-1, col+1);
			revealTile(row-1, col-1);
		}
	}
}

function render() {
	// Render the board.
	// gutter: 2px
	var unclicked = "#babdb6";
	var clicked = "#dcdee0";
	var gutterx = 0;
	var guttery = 0;
	for (var row = 0; row < 8; row++) {
		for (var col = 0; col < 8; col++) {
			var locx = col*32+gutterx;
			var locy = row*32+guttery;
			var offset = 6;
			switch (BOARD[row][col]) {
				case 0:
					// Blank. unclicked.
					canvas.fillStyle = unclicked;
					canvas.fillRect(locx, locy, 32, 32);
					break;
				case 1:
					// Mines. unclikced.
					canvas.fillStyle = unclicked;
					canvas.fillRect(locx, locy, 32, 32);
					// dev hacks. show bombs.
					//canvas.drawImage(images[9], locx+offset, locy+offset, 20, 20);
					break;
				case 2:
					// Blank. clicked.
					canvas.fillStyle = clicked;
					canvas.fillRect(locx, locy, 32, 32);
					break;
				case 3:
					// exploded.
					canvas.fillStyle = clicked;
					canvas.fillRect(locx, locy, 32, 32);
					canvas.drawImage(images[10], locx+offset, locy+offset, 20, 20);
					break;
				case 4:
					// show the bombs to the user after they lose.
					canvas.fillStyle = unclicked;
					canvas.fillRect(locx, locy, 32, 32);
					canvas.drawImage(images[9], locx+offset, locy+offset, 20, 20);
					break;
				case 5:
					// 1. clicked.
					canvas.fillStyle = clicked;
					canvas.fillRect(locx, locy, 32, 32);
					canvas.drawImage(images[1], locx+offset, locy+offset, 20, 20);
					break;
				case 6:
					// 2. clicked.
					canvas.fillStyle = clicked;
					canvas.fillRect(locx, locy, 32, 32);
					canvas.drawImage(images[2], locx+offset, locy+offset, 20, 20);
					break;
				case 7:
					// 3. clicked.
					canvas.fillStyle = clicked;
					canvas.fillRect(locx, locy, 32, 32);
					canvas.drawImage(images[3], locx+offset, locy+offset, 20, 20);
					break;
				case 8:
					// 4. clicked.
					canvas.fillStyle = clicked;
					canvas.fillRect(locx, locy, 32, 32);
					canvas.drawImage(images[4], locx+offset, locy+offset, 20, 20);
					break;
				case 9:
					// 5. clicked.
					canvas.fillStyle = clicked;
					canvas.fillRect(locx, locy, 32, 32);
					canvas.drawImage(images[5], locx+offset, locy+offset, 20, 20);
					break;
				case 10:
					// 6. clicked.
					canvas.fillStyle = clicked;
					canvas.fillRect(locx, locy, 32, 32);
					canvas.drawImage(images[6], locx+offset, locy+offset, 20, 20);
					break;
				case 11:
					// 7. clicked.
					canvas.fillStyle = clicked;
					canvas.fillRect(locx, locy, 32, 32);
					canvas.drawImage(images[7], locx+offset, locy+offset, 20, 20);
					break;
				case 12:
					// 8. clicked.
					canvas.fillStyle = clicked;
					canvas.fillRect(locx, locy, 32, 32);
					canvas.drawImage(images[8], locx+offset, locy+offset, 20, 20);
					break;
				// 1 - 8. unclicked. hidden.
				case 13:
				case 14:
				case 15:
				case 16:
				case 17:
				case 18:
				case 19:
				case 20:
					canvas.fillStyle = unclicked;
					canvas.fillRect(locx, locy, 32, 32);
					break;
				default:
					console.log("not implemented.");
					break;
			}
			gutterx += 2;
		}
		gutterx = 0;
		guttery += 2;
	}
}

function renderFlag() {
	var unclicked = "#babdb6";
	var gutterx = 0;
	var guttery = 0;
	for (var row = 0; row < 8; row++) {
		for (var col = 0; col < 8; col++) {
			var locx = col*32+gutterx;
			var locy = row*32+guttery;
			var offset = 6;
			if (FLAG_BOARD[row][col] == 1) {
				canvas.fillStyle = unclicked;
				canvas.fillRect(locx, locy, 32, 32);
				canvas.drawImage(images[0], locx+offset, locy+offset, 20, 20);
			}
			gutterx += 2;
		}
		gutterx = 0;
		guttery += 2;
	}
}

function timer() {
	TIME_TAKEN += 1;
	// You lose if you take more than 999 seconds.
	if (TIME_TAKEN > 999) {
		clearInterval(COUNTER);
		lose();
		return;
	}
	document.getElementById("timer").innerHTML = TIME_TAKEN;
}

function shuffle(array) {
	var counter = array.length;
	while (counter > 0) {
		var index = Math.floor(Math.random() * counter);
		counter--;

		var temp = array[counter];
		array[counter] = array[index];
		array[index] = temp;
	}
	return array;
}

function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min) + min);
}

function getMousePos(canvas, event) {
	var rect = canvas.getBoundingClientRect();
	return {
		x: event.clientX - rect.left,
		y: event.clientY - rect.top
	};
}

main();
