/* --- Settings --- */

var gridSize = 8; // 8 / 16

var mineCount = 10; // 10 / 40

cellCount = gridSize * gridSize;

var firstMineCount = mineCount;

var notif = document.querySelector("#notif-text");

var table = document.querySelector("#grid");

table.addEventListener("mousedown", sweep);

document.querySelector("#reset").addEventListener("click", update);

function update() {
	
	end = false;

	mineCount = 10;
	
	firstMineCount = mineCount;
		
	notif.innerHTML = "Start by clicking any cell!";
		
	table.innerHTML = "";

	init();
	
}

function init() {
	
	/* --- Grid creation --- */

	for (var i = 0; i < gridSize; i++) { 
		
		var row = table.insertRow(i);
		
		for (var j = 0; j < gridSize; j++) {
			
			row.insertCell(j);
			
		}
		
	}

	tds = document.querySelectorAll("#grid td");

	/* -- -- Assign IDs -- -- */

	for (var i = 0; i < cellCount; i++) {

		tds[i].id = "cell" + (i + 1); // Cell1 -> Cell64

	}

	/* -- -- Set mines -- -- */

	for (var i = 0; i < mineCount; i++) {
		
		var randomMine = Math.floor(Math.random() * cellCount);
		
		while (tds[randomMine].className === "mine") { // prevents mine on same spot
		
			randomMine = Math.floor(Math.random() * cellCount);
			
		}
		
		tds[randomMine].className = "mine";

	}

	/*  Set hints (numbers) [2 parts] */

	for (var i = 0; i < cellCount; i++) { 

		// [Part 1] - Loop through mines, add '1' to surrounding cells

		var cell = tds[i].id.slice(4); // get number from ID
		
		// Booleans for AVAILABLE directions
		
		var north = cell > gridSize;               		// not 8, 7, 6, 5, 4, 3, 2, 1
		var south = cell < cellCount - gridSize + 1;		// not 57, 58, 59, 60, 61, 62, 63, 64
		var east = cell % gridSize !== 0;          		// not 8, 16, 24, 32, 40, 48, 56, 64
		var west = (cell - 1) % gridSize !== 0;    		// not 1, 9, 17, 25, 33, 41, 49, 57
		
		if (tds[i].classList.contains("mine")) {
			
			var nearbies = " nearby nearby1";
			
			if (north) { tds[i - gridSize].className += nearbies; } // If north available, add nearbies there
			if (south) { tds[i + gridSize].className += nearbies; } // etc.
			if (east) { tds[i + 1].className += nearbies; }
			if (west) { tds[i - 1].className += nearbies; }

			if (north && west) { tds[i - gridSize - 1].className += nearbies; }
			if (north && east) { tds[i - gridSize + 1].className += nearbies; }
			if (south && west) { tds[i + gridSize - 1].className += nearbies; }
			if (south && east) { tds[i + gridSize + 1].className += nearbies; }
			
		}
		
	}

	for (var i = 0; i < cellCount; i++) { 

		// [Part 2] Check class duplicates (nearby) and add higher numbers

		if (tds[i].classList.contains("nearby") && !(tds[i].classList.contains("mine"))) {
			
			classCount = tds[i].classList.length
			
			if (classCount % 2 === 0 && classCount < 17) {
			
				tds[i].innerHTML = classCount / 2;
				tds[i].className += " nearby" + classCount / 2;
			
			} 
			
		}
		
	}

	/* Loop to hide every cell */

	for (var i = 0; i < cellCount; i++) {

		tds[i].className += " hidden";

	}
	
}

function floodFill(node) { // node is number, cellN is corresponding DOM element

	var north = node > gridSize;               		// not 8, 7, 6, 5, 4, 3, 2, 1
	var south = node < cellCount - gridSize + 1;	// not 57, 58, 59, 60, 61, 62, 63, 64
	var east = node % gridSize !== 0;          		// not 8, 16, 24, 32, 40, 48, 56, 64
	var west = (node - 1) % gridSize !== 0;    		// not 1, 9, 17, 25, 33, 41, 49, 57
		
	var cellN = document.querySelector("#cell" + node);
	
	if (cellN.classList.contains("white")) {
		
		return;
		
	}
	
	if (cellN.classList.contains("nearby")) { // If on top of number (a.k.a hint / nearby)
		
		cellN.classList.remove("hidden");
		
		if (north && east && south && west) { // If not near walls
			
			if (document.querySelector("#cell" + (node + 1)).classList.contains("white") || 
				document.querySelector("#cell" + (node - 1)).classList.contains("white")) {
			
				document.querySelector("#cell" + (node + gridSize)).classList.remove("hidden");
				document.querySelector("#cell" + (node - gridSize)).classList.remove("hidden");
					
			}
			
			if (document.querySelector("#cell" + (node + gridSize)).classList.contains("white") || 
				document.querySelector("#cell" + (node - gridSize)).classList.contains("white")) {
				
				document.querySelector("#cell" + (node + 1)).classList.remove("hidden");
				document.querySelector("#cell" + (node - 1)).classList.remove("hidden");
				
			} 
			
		} 
		
		return;
	
	}
	
	cellN.className += " white";
	cellN.classList.remove("hidden");
	
	if (north) {
	
		floodFill(node - gridSize);
	
	}
	
	if (east) {
	
		floodFill(node + 1);
		
	}
	
	if (south) {
	
		floodFill(node + gridSize);
	
	}	
	
	if (west) {
	
		floodFill(node - 1)
		
	}
	
	return;

}

function sweep(event) {
	
	if (end) {
		
		if (confirm("Game over, click ok to reset.")) {
		
			update();
			
		}
	
		return;
		
	}
	
	var NumId = Number(event.target.id.slice(4));
	
	if (event.which === 3) { // right-click
		
		if (event.target.classList.contains("mine")) { // if mine
			
			event.target.style.fontSize = "16px";
			
			if (event.target.innerHTML === "") {
					
				mineCount--;
				event.target.innerHTML = "&#9873;"; // flag

			}
			
			notif.innerHTML = "Mines left: " + mineCount + " / " + firstMineCount;
			
			if (mineCount === 0) {
				
				end = true;
				
				notif.innerHTML =  "All flagged, it's a WIN!"; 
				
			}
			
		} else {
			
			notif.innerHTML = "Flagged a wrong place, you lose!";
			
			end = true;
		}
		
	} else { // left-click
		
		if (event.target.classList.contains("mine")) {
			
			notif.innerHTML = "Stepped on a mine, you lose!";
			
			event.target.classList.remove("hidden");
			
			end = true;
			
		} else {
			
			floodFill(NumId);
			
		}
		
	}
	
}

update();
