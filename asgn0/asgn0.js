// DrawTriangle.js (c) 2012 matsuda
function main() {  
  // Retrieve <canvas> element
  var canvas = document.getElementById('example');  
  if (!canvas) { 
    console.log('Failed to retrieve the <canvas> element');
    return false; 
  } 

  // Get the rendering context for 2DCG
  var ctx = canvas.getContext('2d');

  // black background
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, 400, 400)

  // create vector
  var v1 = new Vector3([2.25, 2.25, 0]);

  // draw it
  drawVector(ctx, v1, "red");
}

function drawVector(ctx, v, color) {
  var scale = 20;
  var centerX = 200;
  var centerY = 200;

  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(centerX,centerY);
  ctx.lineTo(
    centerX + v.elements[0] * scale,
    centerY - v.elements[1] * scale
  );
  ctx.stroke();
}