var canvas, ctx;

function main() {  
  // Retrieve <canvas> element
  canvas = document.getElementById('example');  
  if (!canvas) { 
    console.log('Failed to retrieve the <canvas> element');
    return false; 
  } 

  // Get the rendering context for 2DCG
  ctx = canvas.getContext('2d');

  // Draw initial vector
  drawVectorOnCanvas(2.25, 2.25);

  // Attach event listener to button
  document.getElementById('drawButton').addEventListener('click', handleDrawEvent);
}

function handleDrawEvent() {
  // Read input values
  var x = parseFloat(document.getElementById('xInput').value);
  var y = parseFloat(document.getElementById('yInput').value);

  // Clear canvas and draw new vector
  drawVectorOnCanvas(x, y);
}

function drawVectorOnCanvas(x, y) {
  // Clear canvas
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, 400, 400);

  // Create vector
  var v1 = new Vector3([x, y, 0]);

  // Draw it
  drawVector(ctx, v1, "red");
}

function drawVector(ctx, v, color) {
  var scale = 20;
  var centerX = 200;
  var centerY = 200;

  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.lineTo(
    centerX + v.elements[0] * scale,
    centerY - v.elements[1] * scale
  );
  ctx.stroke();
}
