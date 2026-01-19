// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform float u_Size;
  void main() {
    gl_Position = a_Position;
    gl_PointSize = u_Size;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`

// Global Variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;
let blackHoleActive = false;

function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  gl = canvas.getContext("webgl", { preserveDrawingBugger: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
}

function connectVariableToGLSL() {
    // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_Size
  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_Size) {
    console.log('Failed to get the storage location of u_Size');
    return;
  }

}

const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

let g_selectedColor=[1.0,1.0,1.0,1.0];
let g_selectedSize = 5;
let g_selectedType = POINT;
let g_selectedSegments = 10;

function addActionsForHtmlUI() {
  // Button Events (Shape Type)
  document.getElementById('green').onclick = function() { g_selectedColor = [0.0,1.0,0.0,1.0]; };
  document.getElementById('red').onclick   = function() { g_selectedColor = [1.0,0.0,0.0,1.0]; };
  document.getElementById('clearButton').onclick = function() { g_shapesList = []; blackHoleActive = false; renderAllShapes();};

  document.getElementById('pointButton').onclick = function() {g_selectedType=POINT};
  document.getElementById('triButton').onclick   = function() {g_selectedType=TRIANGLE};
  document.getElementById('circleButton').onclick   = function() {g_selectedType=CIRCLE};

  // Color Slider Events
  document.getElementById('redSlide').addEventListener('mouseup', function() { g_selectedColor[0] = this.value/100; });
  document.getElementById('greenSlide').addEventListener('mouseup', function() { g_selectedColor[1] = this.value/100; });
  document.getElementById('blueSlide').addEventListener('mouseup', function() { g_selectedColor[2] = this.value/100; });

  // Size & Segments Slider Events
  document.getElementById('sizeSlide').addEventListener('mouseup', function() { g_selectedSize = this.value; });
  document.getElementById('segSlide').addEventListener('mouseup', function() { g_selectedSegments = this.value; });

  // BLACK HOLE
  document.getElementById('blackHoleButton').onclick = function() {
    blackHoleActive = true;

    let bh = new BlackHole();
    g_shapesList.unshift(bh);
  };

}

function main() {

  setupWebGL();
  connectVariableToGLSL();
  addActionsForHtmlUI();

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  canvas.onmousemove = function(ev) { if(ev.buttons == 1) { click(ev) } }

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  // start animation loop
  animate();
}

var g_shapesList = [];

function click(ev) {
  
  // Extract the event click and return it in WebGL coordinates
  let [x,y] = convertCoordinatesEventToGL(ev);

  // Create and store the new point
  let point;
  if (g_selectedType==POINT) {
    point = new Point();
  } else if (g_selectedType==TRIANGLE) {
    point = new Triangle();
  } else {
    point = new Circle();
    point.segments = g_selectedSegments;
  }
  point.position = [x,y];
  point.color = g_selectedColor.slice();
  point.size = g_selectedSize;
  g_shapesList.push(point);

  // Draw every shapes that is supposed to be in the canvas
  renderAllShapes();
}

function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return([x,y]);
}

function renderAllShapes() {
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  // render black hole first, so it's always at the back
  for (let i = 0; i < g_shapesList.length; i++) {
    if (g_shapesList[i] instanceof BlackHole) {
      g_shapesList[i].render();
    }
  }

  for (let i = 0; i < g_shapesList.length; i++) {
    let shape = g_shapesList[i];

    // if black hole active, move shape toward [0,0] and shrink it
    if (blackHoleActive) {
      let dx = -shape.position[0];
      let dy = -shape.position[1];

      // move fraction toward origin
      shape.position[0] += dx * 0.05;
      shape.position[1] += dy * 0.05;

      // shrink size
      shape.size *= 0.95;

      // remove if too small, as they've fallen into black hole
      if (shape.size < 0.05) {
        g_shapesList.splice(i, 1);
        continue; // skip rendering
      }
    }

    // render shape normally otherwise
    shape.render();
  }

  // remove fallen shapes after rendering
  g_shapesList = g_shapesList.filter(s => s !== null);
}

// contiuous animation
function animate() {
  renderAllShapes();
  requestAnimationFrame(animate);
}