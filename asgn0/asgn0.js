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

  // Attach single draw button
  document.getElementById('drawButton').addEventListener('click', handleDrawEvent);
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