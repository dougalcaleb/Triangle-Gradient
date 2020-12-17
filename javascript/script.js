const canvas = document.querySelector("canvas");
let c = canvas.getContext("2d");

let variance = 100;
let vertCount = [20, 10];
let verts = [];
let canvasSize = [2560, 1440];
let rotation = 0;
let colors = ["#111", "#640064", "orange", "green", "blue"];
let tempColors = [];
let gradAngle = 0;
let radialGradient = false;


function generateVertices() {
   // vertCount[0] += 2;
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

         let x = (a * xSpace) + (Math.floor(Math.random() * (posNegX * (variance / 2))));
         let y = (b * ySpace) + (Math.floor(Math.random() * (posNegY * (variance / 2))));

         newPair.push(x, y);
         col.push(newPair);

         c.beginPath();
         c.arc(x, y, 4, 0, Math.PI * 2);
         c.fill();
      }
      verts.push(col);
   }
   console.log(verts);
   drawBoxes();
}

function drawBoxes() {
   for (let a = 0; a < vertCount[0] - 1; a++) {
      for (let b = 0; b < vertCount[1] - 1; b++) {
         c.beginPath();
         let dir = Math.floor(Math.random() * 2);
         if (dir == 0) { // \
            c.moveTo(verts[a][b][0], verts[a][b][1]);
            c.lineTo(verts[a + 1][b][0], verts[a + 1][b][1]);
            c.lineTo(verts[a + 1][b + 1][0], verts[a + 1][b + 1][1]);
            c.closePath();
            c.stroke();

            c.moveTo(verts[a][b][0], verts[a][b][1]);
            c.lineTo(verts[a][b + 1][0], verts[a][b + 1][1]);
            c.lineTo(verts[a + 1][b + 1][0], verts[a + 1][b + 1][1]);
            c.closePath();
            c.stroke();
         } else {
            c.moveTo(verts[a][b][0], verts[a][b][1]);
            c.lineTo(verts[a + 1][b][0], verts[a + 1][b][1]);
            c.lineTo(verts[a][b + 1][0], verts[a][b + 1][1]);
            c.closePath();
            c.stroke();

            c.moveTo(verts[a + 1][b][0], verts[a + 1][b][1]);
            c.lineTo(verts[a][b + 1][0], verts[a][b + 1][1]);
            c.lineTo(verts[a + 1][b + 1][0], verts[a + 1][b + 1][1]);
            c.closePath();
            c.stroke();
         }
      }
   }
}








document.querySelector(".height").addEventListener("input", function () {
   canvasSize[1] = this.value;
   canvas.setAttribute("height", canvasSize[1]);
});

document.querySelector(".width").addEventListener("input", function () {
   canvasSize[0] = this.value;
   canvas.setAttribute("width", canvasSize[0]);
});
function setCanvas() {
   canvas.setAttribute("width", canvasSize[0]);
   canvas.setAttribute("height", canvasSize[1]);
}







document.querySelector(".palette").addEventListener("click", function () {
   document.querySelector(".color-modal").style.opacity = "1";
   document.querySelector(".color-modal").style.visibility = "visible";
   document.querySelector(".overlay").style.opacity = "1";
   document.querySelector(".overlay").style.visibility = "visible";
   tempColors = colors.concat();
   showColorPalette(true);
});

document.querySelector(".modal-confirm").addEventListener("click", function () {
   document.querySelector(".color-modal").style.opacity = "0";
   document.querySelector(".color-modal").style.visibility = "hidden";
   document.querySelector(".overlay").style.opacity = "0";
   document.querySelector(".overlay").style.visibility = "hidden";
   colors = [];
   colors = tempColors.concat();
   tempColors = [];
   while (document.querySelector(".palette").firstChild) {
      document.querySelector(".palette").removeChild(document.querySelector(".palette").firstChild);
   }
   showColorPalette();
});

document.querySelector(".modal-cancel").addEventListener("click", function () {
   document.querySelector(".color-modal").style.opacity = "0";
   document.querySelector(".color-modal").style.visibility = "hidden";
   document.querySelector(".overlay").style.opacity = "0";
   document.querySelector(".overlay").style.visibility = "hidden";
   tempColors = [];
});

document.querySelector(".modal-subtract").addEventListener("click", function () {
   tempColors.pop();
   while (document.querySelector(".colors-wrap").firstChild) {
      document.querySelector(".colors-wrap").removeChild(document.querySelector(".colors-wrap").firstChild);
   }
   showColorPalette(true);
});

document.querySelector(".modal-add").addEventListener("click", function () {
   tempColors.push(tempColors[tempColors.length-1]);
   while (document.querySelector(".colors-wrap").firstChild) {
      document.querySelector(".colors-wrap").removeChild(document.querySelector(".colors-wrap").firstChild);
   }
   showColorPalette(true);
});

function showColorPalette(refreshEdit = false) {
   for (let a = 0; a < colors.length; a++) {
      if (!refreshEdit) {
         let newColor = document.createElement("DIV");
         newColor.classList.add("p-color");
         newColor.style.background = colors[a];
         document.querySelector(".palette").appendChild(newColor);
      }
   }
   while (document.querySelector(".colors-wrap").firstChild) {
      document.querySelector(".colors-wrap").removeChild(document.querySelector(".colors-wrap").firstChild);
   }
   for (let b = 0; b < tempColors.length; b++) {
      let newEditColor = document.createElement("div");
      newEditColor.classList.add("edit-color");
      newEditColor.style.background = tempColors[b];
      document.querySelector(".colors-wrap").appendChild(newEditColor);
      let newInput = document.createElement("input");
      newInput.setAttribute("type", "color");
      newInput.classList.add("color-input", "input-"+b);
      newEditColor.appendChild(newInput);
      newInput.addEventListener("blur", function () {
         let num = parseInt(this.classList[1].split("-")[1]);
         tempColors[num] = this.value;
         newEditColor.style.background = this.value;
      });
   }
   let grad;
   console.log(colors);
   if (radialGradient) {

   } else {
      let len = 50;
      // c.translate(canvasSize[0] / 2, canvasSize[1] / 2);
      // this is probably right
      // triangle solver: https://www.calculator.net/triangle-calculator.html
      let xOffsetFromCenter = ((canvasSize[1] / 2) * Math.sin(degToRad(gradAngle))) / (Math.sin(degToRad(180 - 90 - gradAngle)));
      let yOffsetFromCenter = (xOffsetFromCenter * Math.sin(degToRad(180 - 90 - gradAngle))) / (Math.sin(xOffsetFromCenter));
      if (xOffsetFromCenter < (-1 * (canvasSize[0] / 2))) {
         xOffsetFromCenter = (-1 * (canvasSize[0] / 2));
      }
      grad = c.createLinearGradient(0, 0, 100, 1440);
      for (let c = 0; c < colors.length; c++) {
         let pos = (1 / (colors.length-1)) * c;
         grad.addColorStop(pos, colors[c]);
      }
   }
   c.fillStyle = grad;
   c.fillRect(0, 0, canvasSize[0], canvasSize[1]);
}

function degToRad(deg) {
   return ((deg * Math.PI) / 180);
}

setCanvas();
// generateVertices();
showColorPalette();
