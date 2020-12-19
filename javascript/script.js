const canvas = document.querySelector("canvas");
let c = canvas.getContext("2d");
let imageData;

// controls
let variance = 100;
let vertCount = [20, 10];
let lineColor = "#111111";
let canvasSize = [2560, 1440];
let gradAngle = 0;
let radialGradient = false;
let randColor = 0;
let brightnessBalance = 0;
let colors = [];
let palettes = [
   ["#eb640a", "#faffad", "#c7ffad", "#98fb6a", "#53c021", "#084200"]
];
let defaultPalette = ["#eb640a", "#faffad", "#c7ffad", "#98fb6a", "#53c021", "#084200"];

let verts = [];
let avgs = [];
let tempColors = [];
let gradMode = "calculate"; // snap or calculate -- doesn't work


let outline = false;
let showVerts = false;
let showAvgs = false;

let arrowSuffix = "s";
let arrowAngles = {
   s: [0, 90, 180, 270],
   d: []
};
let activePalette = 0;
let editingPalette = -1;

let defaults = {
   gradAngle: 0,
   variance: 100,
   vertCount: [20, 10],
   randColor: 0,
   brightnessBalance: 0,
   brightnessInput: 50
};



let Debug = document.querySelector(".debug");

// to do:
/* 
- radial / linear grad
- outline control
*/

/*
===================================================================================

CONTROLS

===================================================================================
*/

document.querySelector(".height").addEventListener("input", function () {
	canvasSize[1] = this.value;
   canvas.setAttribute("height", canvasSize[1]);
   adjustAngle();
});

document.querySelector(".width").addEventListener("input", function () {
	canvasSize[0] = this.value;
   canvas.setAttribute("width", canvasSize[0]);
   adjustAngle();
});

document.querySelector(".rotation").addEventListener("input", function () {
   gradAngle = parseInt(this.value);
   arrowDir = 0;
   // clear btns
   createGradient();
   drawBoxes();
});

document.querySelector(".variance").addEventListener("input", function () {
   variance = parseInt(this.value);
   c.clearRect(0, 0, canvasSize[0], canvasSize[1]);
   verts = [];
   createGradient();
   generateVertices();
});

document.querySelector(".randomness").addEventListener("input", function () {
   randColor = parseInt(this.value);
   c.clearRect(0, 0, canvasSize[0], canvasSize[1]);
   createGradient();
   drawBoxes();
});

document.querySelector(".brightness").addEventListener("input", function () {
   brightnessBalance = parseInt(this.value) - 50;
   c.clearRect(0, 0, canvasSize[0], canvasSize[1]);
   createGradient();
   drawBoxes();
});

document.querySelector(".size-x").addEventListener("input", function () {
   vertCount[0] = parseInt(this.value);
   c.clearRect(0, 0, canvasSize[0], canvasSize[1]);
   verts = [];
   createGradient();
   generateVertices();
});

document.querySelector(".size-y").addEventListener("input", function () {
   vertCount[1] = parseInt(this.value);
   c.clearRect(0, 0, canvasSize[0], canvasSize[1]);
   verts = [];
   createGradient();
   generateVertices();
});

document.querySelector(".snap-diagonal").addEventListener("click", function () {
   if (arrowSuffix == "s") {
      arrowSuffix = "d";
      arrowOffset = -45;
      document.querySelector(".snap-diagonal").classList.add("btn-selected");
      document.querySelector(".snap-straight").classList.remove("btn-selected");
      for (let a = 0; a < 4; a++) {
         document.querySelector(".arrow-" + (a + 1) + "-s").classList.add("arrow-" + (a + 1) + "-d");
         document.querySelector(".arrow-" + (a + 1) + "-d").classList.remove("arrow-" + (a + 1) + "-s");
      }
   }
});

document.querySelector(".snap-straight").addEventListener("click", function () {
   if (arrowSuffix == "d") {
      arrowSuffix = "s";
      arrowOffset = 0;
      document.querySelector(".snap-straight").classList.add("btn-selected");
      document.querySelector(".snap-diagonal").classList.remove("btn-selected");
      for (let a = 0; a < 4; a++) {
         document.querySelector(".arrow-" + (a + 1) + "-d").classList.add("arrow-" + (a + 1) + "-s");
         document.querySelector(".arrow-" + (a + 1) + "-s").classList.remove("arrow-" + (a + 1) + "-d");
      }
   }
});

document.querySelector(".arrow-1").addEventListener("click", function () {
   gradAngle = arrowAngles[arrowSuffix][0];
   document.querySelector(".rotation").value = gradAngle;
   createGradient();
   drawBoxes();
});
document.querySelector(".arrow-2").addEventListener("click", function () {
   gradAngle = arrowAngles[arrowSuffix][1];
   document.querySelector(".rotation").value = gradAngle;
   createGradient();
   drawBoxes();
});
document.querySelector(".arrow-3").addEventListener("click", function () {
   gradAngle = arrowAngles[arrowSuffix][2];
   document.querySelector(".rotation").value = gradAngle;
   createGradient();
   drawBoxes();
});
document.querySelector(".arrow-4").addEventListener("click", function () {
   gradAngle = arrowAngles[arrowSuffix][3];
   document.querySelector(".rotation").value = gradAngle;
   createGradient();
   drawBoxes();
});


/*
===================================================================================

MODAL

===================================================================================
*/

document.querySelector(".modal-confirm").addEventListener("click", function () {
   document.querySelector(".color-modal").style.opacity = "0";
	document.querySelector(".color-modal").style.visibility = "hidden";
	document.querySelector(".overlay").style.opacity = "0";
	document.querySelector(".overlay").style.visibility = "hidden";
	colors = [];
	colors = tempColors.concat();
	tempColors = [];
	// while (document.querySelector(".palette").firstChild) {
	// 	document.querySelector(".palette").removeChild(document.querySelector(".palette").firstChild);
   // }
   c.clearRect(0, 0, canvasSize[0], canvasSize[1]);
   verts = [];
	updatePalette(editingPalette);
   createGradient();
   generateVertices();
});

document.querySelector(".modal-cancel").addEventListener("click", function () {
	document.querySelector(".color-modal").style.opacity = "0";
	document.querySelector(".color-modal").style.visibility = "hidden";
	document.querySelector(".overlay").style.opacity = "0";
	document.querySelector(".overlay").style.visibility = "hidden";
	tempColors = [];
});

document.querySelector(".modal-subtract").addEventListener("click", function () {
	if (tempColors.length != 1) {
		tempColors.pop();
		while (document.querySelector(".colors-wrap").firstChild) {
			document.querySelector(".colors-wrap").removeChild(document.querySelector(".colors-wrap").firstChild);
		}
		updateModalColors(true);
	}
});

document.querySelector(".modal-add").addEventListener("click", function () {
	tempColors.push(tempColors[tempColors.length - 1]);
	while (document.querySelector(".colors-wrap").firstChild) {
		document.querySelector(".colors-wrap").removeChild(document.querySelector(".colors-wrap").firstChild);
	}
	updateModalColors(true);
});

document.querySelector(".save-new").addEventListener("click", function () {
   document.querySelector(".color-modal").style.opacity = "0";
	document.querySelector(".color-modal").style.visibility = "hidden";
	document.querySelector(".overlay").style.opacity = "0";
	document.querySelector(".overlay").style.visibility = "hidden";
   createNewPalette();
});

/*
===================================================================================

TOOLS 

===================================================================================
*/

document.querySelector(".export").addEventListener("click", function () {
   let img = canvas.toDataURL();
   let newWindow = window.open("about:blank", "image from canvas");
   newWindow.document.write("<img src='" + img + "' />");
});

document.querySelector(".save-palettes").addEventListener("click", function () {
   localStorage.setItem("palettes", JSON.stringify(palettes));
});

/*
===================================================================================

SAVE / RESET

===================================================================================
*/

document.querySelector(".save-rotation").addEventListener("click", function () {
   localStorage.setItem("rotation", JSON.stringify(gradAngle));
});
document.querySelector(".reset-rotation").addEventListener("click", function () {
   document.querySelector(".rotation").value = defaults.gradAngle;
   localStorage.setItem("rotation", JSON.stringify(defaults.gradAngle));
   gradAngle = defaults.gradAngle;
   arrowDir = 0;
   // clear btns
   createGradient();
   drawBoxes();
});

document.querySelector(".save-variance").addEventListener("click", function () {
   localStorage.setItem("variance", JSON.stringify(variance));
});
document.querySelector(".reset-variance").addEventListener("click", function () {
   document.querySelector(".variance").value = defaults.variance;
   localStorage.setItem("variance", JSON.stringify(defaults.variance));
   variance = defaults.variance;
   c.clearRect(0, 0, canvasSize[0], canvasSize[1]);
   verts = [];
   createGradient();
   generateVertices();
});

document.querySelector(".save-x").addEventListener("click", function () {
   localStorage.setItem("x", JSON.stringify(vertCount[0]));
});
document.querySelector(".reset-x").addEventListener("click", function () {
   document.querySelector(".size-x").value = defaults.vertCount[0];
   localStorage.setItem("x", JSON.stringify(defaults.vertCount[0]));
   vertCount[0] = defaults.vertCount[0];
   c.clearRect(0, 0, canvasSize[0], canvasSize[1]);
   verts = [];
   createGradient();
   generateVertices();
});

document.querySelector(".save-y").addEventListener("click", function () {
   localStorage.setItem("y", JSON.stringify(vertCount[1]));
});
document.querySelector(".reset-y").addEventListener("click", function () {
   document.querySelector(".size-y").value = defaults.vertCount[1];
   localStorage.setItem("y", JSON.stringify(defaults.vertCount[1]));
   vertCount[1] = defaults.vertCount[1];
   c.clearRect(0, 0, canvasSize[0], canvasSize[1]);
   verts = [];
   createGradient();
   generateVertices();
});
document.querySelector(".save-rand").addEventListener("click", function () {
   localStorage.setItem("randColor", JSON.stringify(randColor));
});
document.querySelector(".reset-rand").addEventListener("click", function () {
   document.querySelector(".randomness").value = defaults.randColor;
   localStorage.setItem("randColor", JSON.stringify(defaults.randColor));
   randColor = defaults.randColor;
   c.clearRect(0, 0, canvasSize[0], canvasSize[1]);
   createGradient();
   drawBoxes();
});

document.querySelector(".save-brightness").addEventListener("click", function () {
   localStorage.setItem("brightness", JSON.stringify(brightnessBalance));
});
document.querySelector(".reset-brightness").addEventListener("click", function () {
   document.querySelector(".brightness").value = defaults.brightnessInput;
   localStorage.setItem("brightness", JSON.stringify(defaults.brightnessBalance));
   brightnessBalance = defaults.brightnessBalance;
   c.clearRect(0, 0, canvasSize[0], canvasSize[1]);
   createGradient();
   drawBoxes();
});



/*
===================================================================================

FUNCTIONS

===================================================================================
*/

function generateVertices() {
	let xSpace = canvasSize[0] / (vertCount[0] - 1);
	let ySpace = canvasSize[1] / (vertCount[1] - 1);
	for (let a = 0; a < vertCount[0]; a++) {
		let col = [];
		for (let b = 0; b < vertCount[1]; b++) {
			let newPair = [];
			let posNegX = Math.floor(Math.random() * 2) == 0 ? -1 : 1;
			let posNegY = Math.floor(Math.random() * 2) == 0 ? -1 : 1;

			if (b == 0) {
				posNegY = -1;
			}
			if (b == vertCount[1] - 1) {
				posNegY = 1;
			}
			if (a == 0) {
				posNegX = -1;
			}
			if (a == vertCount[0] - 1) {
				posNegX = 1;
			}

			let x = a * xSpace + Math.floor(Math.random() * (posNegX * (variance / 2)));
			let y = b * ySpace + Math.floor(Math.random() * (posNegY * (variance / 2)));

			newPair.push(x, y);
			col.push(newPair);

			if (showVerts) {
				c.beginPath();
				c.arc(x, y, 4, 0, Math.PI * 2);
				c.fill();
			}
		}
		verts.push(col);
	}
	drawBoxes();
}

function drawBoxes() {
   imageData = c.getImageData(0, 0, canvasSize[0], canvasSize[1]);
   let avgX1, avgX2, avgY1, avgY2;
	for (let a = 0; a < vertCount[0] - 1; a++) {
		for (let b = 0; b < vertCount[1] - 1; b++) {
			let dir = Math.floor(Math.random() * 2);
			if (dir == 0) {
				avgX1 = (verts[a][b][0] + verts[a + 1][b][0] + verts[a + 1][b + 1][0]) / 3;
            avgY1 = (verts[a][b][1] + verts[a + 1][b][1] + verts[a + 1][b + 1][1]) / 3;
            c.fillStyle = getPixelColor(avgX1, avgY1);

            c.beginPath();
				c.moveTo(verts[a][b][0], verts[a][b][1]);
				c.lineTo(verts[a + 1][b][0], verts[a + 1][b][1]);
				c.lineTo(verts[a + 1][b + 1][0], verts[a + 1][b + 1][1]);
            c.closePath();
            c.fill();
            if (outline) {
               c.stroke();
            }

            if (showAvgs) {
               c.fillStyle = "black";
               c.beginPath();
               c.arc(avgX1, avgY1, 4, 0, Math.PI * 2);
               c.stroke();
            }
            
            avgX2 = (verts[a][b][0] + verts[a][b + 1][0] + verts[a + 1][b + 1][0]) / 3;
            avgY2 = (verts[a][b][1] + verts[a][b + 1][1] + verts[a + 1][b + 1][1]) / 3;
            c.fillStyle = getPixelColor(avgX2, avgY2);

            c.beginPath();
				c.moveTo(verts[a][b][0], verts[a][b][1]);
				c.lineTo(verts[a][b + 1][0], verts[a][b + 1][1]);
				c.lineTo(verts[a + 1][b + 1][0], verts[a + 1][b + 1][1]);
            c.closePath();
            c.fill();
				if (outline) {
               c.stroke();
            }

            if (showAvgs) {
               c.fillStyle = "black";
               c.beginPath();
               c.arc(avgX2, avgY2, 4, 0, Math.PI * 2);
               c.stroke();
            }
			} else {
				avgX1 = (verts[a][b][0] + verts[a + 1][b][0] + verts[a][b + 1][0]) / 3;
				avgY1 = (verts[a][b][1] + verts[a + 1][b][1] + verts[a][b + 1][1]) / 3;
            c.fillStyle = getPixelColor(avgX1, avgY1);

            c.beginPath();
				c.moveTo(verts[a][b][0], verts[a][b][1]);
				c.lineTo(verts[a + 1][b][0], verts[a + 1][b][1]);
				c.lineTo(verts[a][b + 1][0], verts[a][b + 1][1]);
            c.closePath();
            c.fill();
            if (outline) {
               c.stroke();
            }

            if (showAvgs) {
               c.fillStyle = "black";
               c.beginPath();
               c.arc(avgX1, avgY1, 4, 0, Math.PI * 2);
               c.stroke();
            }
            
            avgX2 = (verts[a + 1][b][0] + verts[a][b + 1][0] + verts[a + 1][b + 1][0]) / 3;
            avgY2 = (verts[a + 1][b][1] + verts[a][b + 1][1] + verts[a + 1][b + 1][1]) / 3;
            c.fillStyle = getPixelColor(avgX2, avgY2);

            c.beginPath();
				c.moveTo(verts[a + 1][b][0], verts[a + 1][b][1]);
				c.lineTo(verts[a][b + 1][0], verts[a][b + 1][1]);
				c.lineTo(verts[a + 1][b + 1][0], verts[a + 1][b + 1][1]);
            c.closePath();
            c.fill();
				if (outline) {
               c.stroke();
            }

            if (showAvgs) {
               c.fillStyle = "black";
               c.beginPath();
               c.arc(avgX2, avgY2, 4, 0, Math.PI * 2);
               c.stroke();
            }
			}
		}
	}
}

function createNewPalette() {
   palettes.push(tempColors);
   tempColors = [];
   displayPalettes();
}

function updatePalette(id) {
   palettes[id] = [];
   palettes[id] = colors.concat();
   console.log(palettes);
   while (document.querySelector(".palette-"+id).querySelector(".p-color")) {
		document.querySelector(".palette-"+id).removeChild(document.querySelector(".palette-"+id).querySelector(".p-color"));
   }
   for (let a = 0; a < palettes[id].length; a++) {
      let newColor = document.createElement("div");
		newColor.classList.add("p-color");
		newColor.style.background = palettes[id][a];
		document.querySelector(".palette-"+id).appendChild(newColor);
   }
}

function displayPalettes() {
   while (document.querySelector(".palette")) {
		document.querySelector(".palette-input").removeChild(document.querySelector(".palette"));
   }
   for (let a = 0; a < palettes.length; a++) {
      let phtml = `<div class="palette-options">
                     <div class="p-o-1 palette-use palette-use-${a}">
                        <svg viewBox="0 0 24 24">
                           <path fill="currentColor" d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
                        </svg>
                     </div>
                     <div class="p-o-2 palette-edit palette-edit-${a}">
                        <svg viewBox="0 0 24 24">
                           <path
                              fill="currentColor"
                              d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"
                           />
                        </svg>
                     </div>
                     <div class="p-o-3 palette-delete palette-delete-${a}">
                        <svg viewBox="0 0 24 24">
                           <path fill="currentColor" d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
                        </svg>
                     </div>
                  </div>`;
      let newP = document.createElement("div");
      newP.classList.add("palette", `palette-${a}`);
      newP.innerHTML = phtml;
      document.querySelector(".palette-input").appendChild(newP);
      document.querySelector(".palette-edit-"+a).addEventListener("click", function() {
         document.querySelector(".color-modal").style.opacity = "1";
         document.querySelector(".color-modal").style.visibility = "visible";
         document.querySelector(".overlay").style.opacity = "1";
         document.querySelector(".overlay").style.visibility = "visible";
         tempColors = palettes[a].concat();
         let savedId = parseInt(this.classList[2].split("-")[2]);
         editingPalette = savedId;
         updateModalColors(savedId);
      });
      document.querySelector(".palette-use-"+a).addEventListener("click", function() {
         let savedId = parseInt(this.classList[2].split("-")[2]);
         activePalette = a;
         c.clearRect(0, 0, canvasSize[0], canvasSize[1]);
         verts = [];
         colors = palettes[savedId];
         if (document.querySelector(".palette-active")) {
            document.querySelector(".palette-active").classList.remove("palette-active");
         }
         if (!this.parentElement.parentElement.classList.contains("palette-active")) {
            this.parentElement.parentElement.classList.add("palette-active");
         }
         createGradient();
         generateVertices();
      });
      document.querySelector(".palette-delete-" + a).addEventListener("click", function () {
         palettes.splice(a, 1);
         if (palettes[a - 1]) {
            c.clearRect(0, 0, canvasSize[0], canvasSize[1]);
            verts = [];
            colors = palettes[a-1];
            if (document.querySelector(".palette-active")) {
               document.querySelector(".palette-active").classList.remove("palette-active");
            }
            if (!document.querySelector(".palette-"+(a-1)).classList.contains("palette-active")) {
               document.querySelector(".palette-"+(a-1)).classList.add("palette-active");
            }
            createGradient();
            generateVertices();
         } else if (palettes[a]) {
            c.clearRect(0, 0, canvasSize[0], canvasSize[1]);
            verts = [];
            colors = palettes[a];
            if (document.querySelector(".palette-active")) {
               document.querySelector(".palette-active").classList.remove("palette-active");
            }
            if (!document.querySelector(".palette-"+(a+1)).classList.contains("palette-active")) {
               document.querySelector(".palette-"+(a+1)).classList.add("palette-active");
            }
            createGradient();
            generateVertices();
         }
         this.parentElement.parentElement.remove();
      });
      for (let b = 0; b < palettes[a].length; b++) {
         let newColor = document.createElement("div");
			newColor.classList.add("p-color");
			newColor.style.background = palettes[a][b];
			newP.appendChild(newColor);
      }
   }
}

function updateModalColors() {
   // reset modal
	while (document.querySelector(".colors-wrap").firstChild) {
		document.querySelector(".colors-wrap").removeChild(document.querySelector(".colors-wrap").firstChild);
   }
   // add all colors to modal
	for (let b = 0; b < tempColors.length; b++) {
		let newEditColor = document.createElement("div");
		newEditColor.classList.add("edit-color");
		newEditColor.style.background = tempColors[b];
		document.querySelector(".colors-wrap").appendChild(newEditColor);
		let newInput = document.createElement("input");
		newInput.setAttribute("type", "color");
		newInput.classList.add("color-input", "input-" + b);
		newEditColor.appendChild(newInput);
		newInput.addEventListener("blur", function () {
			let num = parseInt(this.classList[1].split("-")[1]);
			tempColors[num] = this.value;
			newEditColor.style.background = this.value;
		});
		newInput.addEventListener("focus", function () {
			let num = parseInt(this.classList[1].split("-")[1]);
			this.value = tempColors[num];
			newEditColor.style.background = this.value;
		});
		newInput.addEventListener("input", function () {
			this.parentElement.style.background = this.value;
		});
	}
}

function createGradient() {
   colors = palettes[activePalette];
	let grad, x1, y1, x2, y2, xCenterOffset, yCenterOffset;
	if (radialGradient) {
	} else {
		let intercepting;
		let radAngle = degToRad(gradAngle);

		let half = gradAngle % 180;
		let idealDiagonal = Math.atan(canvasSize[1] / canvasSize[0]);
		if (degToRad(half) > idealDiagonal && degToRad(half) < Math.PI - idealDiagonal) {
			intercepting = "X";
			if (gradMode == "calculate") {
				yCenterOffset = canvasSize[1] / 2;
				xCenterOffset = (yCenterOffset * Math.sin(Math.PI / 2 - radAngle)) / Math.sin(radAngle);
				if (gradAngle > radToDeg(idealDiagonal) && gradAngle > 180) {
					xCenterOffset *= -1;
					yCenterOffset *= -1;
				}
				x1 = canvasSize[0] / 2 - xCenterOffset;
				y1 = canvasSize[1] / 2 - yCenterOffset;
				x2 = canvasSize[0] - x1;
				y2 = canvasSize[1] - y1;
			} else {
				x1 = canvasSize[0];
				y1 = canvasSize[1];
				x2 = canvasSize[0] - x1;
				y2 = canvasSize[1] - y1;
			}
		} else {
			intercepting = "Y";
			if (gradMode == "calculate") {
				xCenterOffset = canvasSize[0] / 2;
				yCenterOffset = (xCenterOffset * Math.sin(radAngle)) / Math.sin(Math.PI / 2 - radAngle);
				if (gradAngle > 180 - radToDeg(idealDiagonal) && gradAngle < 270) {
					xCenterOffset *= -1;
					yCenterOffset *= -1;
				}
				if (gradAngle == 135) {
					xCenterOffset *= -1;
					yCenterOffset *= -1;
				}
				x1 = canvasSize[0] / 2 - xCenterOffset;
				y1 = canvasSize[1] / 2 - yCenterOffset;
				x2 = canvasSize[0] - x1;
				y2 = canvasSize[1] - y1;
			} else {
				x1 = canvasSize[0];
				y1 = canvasSize[1];
				x2 = canvasSize[0] - x1;
				y2 = canvasSize[1] - y1;
			}
		}
		grad = c.createLinearGradient(x1, y1, x2, y2);
		for (let c = 0; c < colors.length; c++) {
			let pos = (1 / (colors.length - 1)) * c;
			grad.addColorStop(pos, colors[c]);
		}
	}
	c.fillStyle = grad;
	c.fillRect(0, 0, canvasSize[0], canvasSize[1]);
   c.fillStyle = "black";
}

function getPixelColor(x, y) {
   x = Math.round(x);
   y = Math.round(y);
   if (x < 0) {
      x = 0;
   }
   if (y < 0) {
      y = 0;
   }
   if (x > canvasSize[0] - 1) {
      x = canvasSize[0] - 1;
   }
   if (y > canvasSize[1] - 1) {
      y = canvasSize[1] - 1;
   }
   let rrand = Math.floor(Math.random() * randColor) * (Math.floor(Math.random() * 2) * -1);
   let grand = Math.floor(Math.random() * randColor) * (Math.floor(Math.random() * 2) * -1);
   let brand = Math.floor(Math.random() * randColor) * (Math.floor(Math.random() * 2) * -1);
   let bb = Math.floor(Math.random() * brightnessBalance);
	let r = imageData.data[y * (imageData.width * 4) + x * 4] + rrand + bb;
	let g = imageData.data[y * (imageData.width * 4) + x * 4 + 1] + grand + bb;
	let b = imageData.data[y * (imageData.width * 4) + x * 4 + 2] + brand + bb;
   let a = imageData.data[y * (imageData.width * 4) + x * 4 + 3];
   return "rgba(" + r + "," + g + "," + b + "," + a + ")";
}

function loadSaved() {
   if (localStorage.getItem("rotation")) {
      gradAngle = JSON.parse(localStorage.getItem("rotation"));
   }
   if (localStorage.getItem("x")) {
      vertCount[0] = JSON.parse(localStorage.getItem("x"));
   }
   if (localStorage.getItem("y")) {
      vertCount[1] = JSON.parse(localStorage.getItem("y"));
   }
   if (localStorage.getItem("variance")) {
      variance = JSON.parse(localStorage.getItem("variance"));
   }
   if (localStorage.getItem("variance")) {
      randColor = JSON.parse(localStorage.getItem("variance"));
   }
   if (localStorage.getItem("brightness")) {
      brightnessBalance = JSON.parse(localStorage.getItem("brightness"));
   }
}

function loadPalettes() {
   if (localStorage.getItem("palettes")) {
      palettes = JSON.parse(localStorage.getItem("palettes"));
   }
   if (palettes.length == 0) {
      palettes.push(defaultPalette);
   }
}

function adjustAngle() {
   let diag = radToDeg(Math.atan(canvasSize[1] / canvasSize[0]));
   arrowAngles.d.push(diag, 180 - diag, diag + 180, 360 - diag);
}

function setCanvas() {
	canvas.setAttribute("width", canvasSize[0]);
	canvas.setAttribute("height", canvasSize[1]);
}

function degToRad(deg) {
	return (deg * Math.PI) / 180;
}
function radToDeg(rad) {
	return (rad * 180) / Math.PI;
}


loadSaved();
loadPalettes();
setCanvas();
displayPalettes();
createGradient();
generateVertices();
adjustAngle();