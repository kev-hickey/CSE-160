var canvas, ctx;

function main() {  
  canvas = document.getElementById('example');  
  if (!canvas) { 
    console.log('Failed to retrieve the <canvas> element');
    return false; 
  } 

  ctx = canvas.getContext('2d');

  // Draw initial vectors on black background
  handleDrawEvent(); // this fills canvas and draws v1 (red) and v2 (blue)

  // Attach draw buttons
  document.getElementById('drawButton').addEventListener('click', handleDrawEvent);
  document.getElementById('drawOperationButton').addEventListener('click', handleDrawOperationEvent);

}

function handleDrawEvent() {
  // Clear canvas and fill black
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, 400, 400);

  // Read v1
  var x1 = parseFloat(document.getElementById('x1').value);
  var y1 = parseFloat(document.getElementById('y1').value);

  // Read v2
  var x2 = parseFloat(document.getElementById('x2').value);
  var y2 = parseFloat(document.getElementById('y2').value);

  // Draw v1 in red
  drawVectorOnCanvas(x1, y1, "red");

  // Draw v2 in blue
  drawVectorOnCanvas(x2, y2, "blue");
}

function drawVectorOnCanvas(x, y, color) {
  var scale = 20;
  var centerX = 200;
  var centerY = 200;

  var v = new Vector3([x, y, 0]);

  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.lineTo(
    centerX + v.elements[0] * scale,
    centerY - v.elements[1] * scale
  );
  ctx.stroke();
}

function handleDrawOperationEvent() {
  // Clear canvas
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, 400, 400);

  // Read v1 and v2 from inputs
  var x1 = parseFloat(document.getElementById('x1').value);
  var y1 = parseFloat(document.getElementById('y1').value);
  var x2 = parseFloat(document.getElementById('x2').value);
  var y2 = parseFloat(document.getElementById('y2').value);

  var v1 = new Vector3([x1, y1, 0]);
  var v2 = new Vector3([x2, y2, 0]);

  // Draw original vectors
  drawVectorOnCanvas(v1.elements[0], v1.elements[1], "red");
  if (x2 !== 0 || y2 !== 0) {
    drawVectorOnCanvas(v2.elements[0], v2.elements[1], "blue");
  }

  // Read operation
  var op = document.getElementById('operation').value;
  var s = parseFloat(document.getElementById('scalar').value);

  if (op === "add") {
    var v3 = new Vector3(v1.elements);
    v3.add(v2);
    drawVectorOnCanvas(v3.elements[0], v3.elements[1], "green");
  } else if (op === "sub") {
    var v3 = new Vector3(v1.elements);
    v3.sub(v2);
    drawVectorOnCanvas(v3.elements[0], v3.elements[1], "green");
  } else if (op === "mul") {
    var v3 = new Vector3(v1.elements);
    var v4 = new Vector3(v2.elements);
    v3.mul(s);
    v4.mul(s);
    drawVectorOnCanvas(v3.elements[0], v3.elements[1], "green");
    drawVectorOnCanvas(v4.elements[0], v4.elements[1], "green");
  } else if (op === "div") {
    var v3 = new Vector3(v1.elements);
    var v4 = new Vector3(v2.elements);
    v3.div(s);
    v4.div(s);
    drawVectorOnCanvas(v3.elements[0], v3.elements[1], "green");
    drawVectorOnCanvas(v4.elements[0], v4.elements[1], "green");
  } else if (op == "mag") {
    console.log("Magnitude of v1:", v1.magnitude());
    if (x2 !== 0 || y2 !== 0) console.log("Magnitude of v2:", v2.magnitude());
  } else if (op == "nor") {
    var v1norm = new Vector3(v1.elements).normalize();
    drawVectorOnCanvas(v1norm.elements[0], v1norm.elements[1], "green");

    if (x2 !== 0 || y2 !== 0) {
      var v2norm = new Vector3(v2.elements).normalize();
      drawVectorOnCanvas(v2norm.elements[0], v2norm.elements[1], "green");
    }
  } else if (op == "ang") {
    let angle = angleBetween(v1, v2);
    console.log("Angle:", angle);
  } else if (op == "area") {
    let area = areaTriangle(v1, v2);
    console.log("Area of the triangle:", area);
  }
}

function angleBetween(v1, v2) {
  let dot = Vector3.dot(v1, v2);
  let mag1 = v1.magnitude();
  let mag2 = v2.magnitude();

  if (mag1 === 0 || mag2 === 0) return 0; // avoid division by zero

  let cosAlpha = dot / (mag1 * mag2);

  // Clamp cosAlpha to [-1, 1] to avoid rounding errors outside the valid range
  cosAlpha = Math.max(-1, Math.min(1, cosAlpha));

  let alphaRad = Math.acos(cosAlpha); // in radians
  let alphaDeg = alphaRad * (180 / Math.PI); // convert to degrees
  return alphaDeg;
}

function areaTriangle(v1,v2) {
  let cross = Vector3.cross(v1,v2);
  let area = cross.magnitude() / 2;
  return area;
}