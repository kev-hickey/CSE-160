var canvas, ctx;

function main() {  
  canvas = document.getElementById('example');  
  if (!canvas) { 
    console.log('Failed to retrieve the <canvas> element');
    return false; 
  } 

  ctx = canvas.getContext('2d');

  // Draw initial v1
  drawVectorOnCanvas(2.25, 2.25, "red");

  // Attach single draw button
  document.getElementById('drawButton').addEventListener('click', handleDrawEvent);
}

function handleDrawEvent() {
  // Read v1
  var x1 = parseFloat(document.getElementById('x1').value);
  var y1 = parseFloat(document.getElementById('y1').value);

  // Read v2
  var x2 = parseFloat(document.getElementById('x2').value);
  var y2 = parseFloat(document.getElementById('y2').value);

  // Clear canvas
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, 400, 400);

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