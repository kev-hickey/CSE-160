// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`

// Global variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_ModelMatrix;
let u_GlobalRotateMatrix;

// --- WebGL setup ---
function setupWebGL() {
  canvas = document.getElementById('webgl');
  gl = canvas.getContext('webgl', { preserveDrawingBuffer: true });
  if (!gl) { console.log('Failed to get WebGL context'); return; }

  gl.enable(gl.DEPTH_TEST);
}

// --- Shader connection ---
function connectVariableToGLSL() {
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) console.log('Failed to get storage location of a_Position');
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) console.log('Failed to get u_FragColor');
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) console.log('Failed to get u_ModelMatrix');
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) console.log('Failed to get u_GlobalRotateMatrix');

  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

// sliders
let g_globalAngle = 0;
// buttons
let g_animation = false;
// animation angles
let g_upArmLAngle = 0;
let g_upArmRAngle = 0;
let g_foArmLAngle = 0;
let g_foArmRAngle = 0;
let g_handLAngle = 0;
let g_handRAngle = 0;
let g_thighLAngle = 0;
let g_thighRAngle = 0;
let g_loLegLAngle = 0;
let g_loLegRAngle = 0;
let g_footLAngle = 0;
let g_footRAngle = 0;
let g_headAngle = 0;
// mouse control
let g_rotateX = 0;
let g_rotateY = 0;
let g_dragging = false;
let g_lastMouseX = 0;
let g_lastMouseY = 0;
// poke animation
let g_poke = false;
let g_pokeStartTime = 0;


function addActionsForHtmlUI() {
  // joint sliders
  document.getElementById('upArmSlider').addEventListener('mousemove', function() { g_upArmLAngle = this.value; g_upArmRAngle = this.value; renderAllShapes(); });
  document.getElementById('foArmSlider').addEventListener('mousemove', function() { g_foArmLAngle = this.value; g_foArmRAngle = this.value; renderAllShapes(); });
  document.getElementById('handSlider').addEventListener('mousemove', function() { g_handLAngle = this.value; g_handRAngle = this.value; renderAllShapes(); });
  document.getElementById('thighSlider').addEventListener('mousemove', function() { g_thighLAngle = this.value; g_thighRAngle = this.value; renderAllShapes(); });
  document.getElementById('loLegSlider').addEventListener('mousemove', function() { g_loLegLAngle = this.value; g_loLegRAngle = this.value; renderAllShapes(); });
  document.getElementById('footSlider').addEventListener('mousemove', function() { g_footLAngle = this.value; g_footRAngle = this.value; renderAllShapes(); });
  document.getElementById('headSlider').addEventListener('mousemove', function() { g_headAngle = this.value; renderAllShapes(); });

  // animation buttons
  document.getElementById('animationOnButton').onclick = function() { g_animation = true; };
  document.getElementById('animationOffButton').onclick   = function() { g_animation = false; };
  
  // camera angle slider
  document.getElementById('angleSlider').addEventListener('mousemove', function() { g_globalAngle = this.value; renderAllShapes(); });

  // mouse control
  canvas.onmousedown = function(ev) {
    g_dragging = true;
    g_lastMouseX = ev.clientX;
    g_lastMouseY = ev.clientY;
  };
  canvas.onmouseup = function(ev) {
    g_dragging = false;
  };
  canvas.onmousemove = function(ev) {
    if (!g_dragging) return;
    let dx = ev.clientX - g_lastMouseX;
    let dy = ev.clientY - g_lastMouseY;

    g_rotateY -= dx * 0.5;
    g_rotateX -= dy * 0.5;

    g_lastMouseX = ev.clientX;
    g_lastMouseY = ev.clientY;

    renderAllShapes();
  };

  // poke animation
  canvas.onmousedown = function(ev) {
    if (ev.shiftKey) {
      g_poke = true;
      g_pokeStartTime = performance.now()/1000.0;
    } else {
      g_dragging = true;
      g_lastMouseX = ev.clientX;
      g_lastMouseY = ev.clientY;
    }
  };

}

// --- Main ---
function main() {
  setupWebGL();
  connectVariableToGLSL();
  addActionsForHtmlUI();
  
  gl.clearColor(0.53, 0.81, 0.92, 1.0);

  requestAnimationFrame(tick);
}

var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0-g_startTime;

function tick() {
  g_seconds = performance.now()/1000.0-g_startTime;
  updateAnimationAngles();
  renderAllShapes();
  requestAnimationFrame(tick);
}


function updateAnimationAngles() {
  if (!g_animation) return;
  
  const walkSpeed = 3;
  const upperSwing = 30;
  const lowerSwing = 20;
  const handFootSwing = 15;
  const headSwing = 5;

  const walkCycle = Math.sin(g_seconds * walkSpeed);

  // ARMS
  g_upArmLAngle = -walkCycle * upperSwing;
  g_upArmRAngle =  walkCycle * upperSwing;

  g_foArmLAngle = -walkCycle * lowerSwing;
  g_foArmRAngle =  walkCycle * lowerSwing;

  g_handLAngle = -walkCycle * handFootSwing;
  g_handRAngle =  walkCycle * handFootSwing;

  // LEGS
  g_thighLAngle =  walkCycle * upperSwing;
  g_thighRAngle = -walkCycle * upperSwing;

  g_loLegLAngle =  walkCycle * lowerSwing;
  g_loLegRAngle = -walkCycle * lowerSwing;

  g_footLAngle =  walkCycle * handFootSwing;
  g_footRAngle = -walkCycle * handFootSwing;

  // HEAD
  g_headAngle = walkCycle * headSwing;
}


function renderAllShapes() {
  var startTime = performance.now();

  var globalRotMat=new Matrix4();

  // If poke animation is active
  if (g_poke) {
    let elapsed = g_seconds - g_pokeStartTime;
    if (elapsed > 1.5) {
      g_poke = false;
    } else {
      let t = elapsed / 1.5;
      let rollAngle = t * 360;
      globalRotMat.rotate(-rollAngle, 0, 0, 1);
    }
  }

  globalRotMat
    .rotate(-g_globalAngle, 0, 1, 0)
    .rotate(g_rotateY, 0, 1, 0)
    .rotate(g_rotateX, 1, 0, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);

  var body = new Cube();
  body.color = [1,1,1,1];
  body.matrix.translate(0, 0, .225);
  body.matrix.scale(0.35, 0.35, 0.3);
  body.render();

  var shoulders = new Cube();
  shoulders.color = [0.1,0.1,0.1,1];
  shoulders.matrix.translate(0, 0, 0);
  shoulders.matrix.scale(0.35, 0.35, 0.15);
  shoulders.render();

  var butt = new Cube();
  butt.color = [1,1,1,1];
  butt.matrix.translate(0, -0.038, 0.425);
  butt.matrix.scale(0.35, 0.25, 0.1);
  butt.render();

  var tail = new Cube();
  tail.color = [1,1,1,1];
  tail.matrix.translate(0, -0.065, 0.45);
  tail.matrix.rotate(-30, 1, 0, 0);
  tail.matrix.scale(0.1, 0.15, 0.1);
  tail.render();

  // LEFT ARM
  var upArmL = new Cube();
  upArmL.color = [0.1,0.1,0.1,1];
  upArmL.matrix.translate(0.1, -0.2, 0);
  upArmL.matrix.rotate(g_upArmLAngle, 1, 0, 0);
  upArmL.matrix.scale(0.15, 0.075, 0.15);
  upArmL.render();

  var foArmL = new Cube();
  foArmL.color = [0.1,0.1,0.1,1];
  foArmL.matrix = new Matrix4(upArmL.matrix);
  foArmL.matrix.translate(0.1666666, -0.75, -0.1666666);
  foArmL.matrix.rotate(g_foArmLAngle, 1, 0, 0);
  foArmL.matrix.scale(0.1 / 0.15, 0.1 / 0.075, 0.1 / 0.15);
  foArmL.render();

  var handL = new Cube();
  handL.color = [0.1,0.1,0.1,1];
  handL.matrix = new Matrix4(foArmL.matrix);
  handL.matrix.translate(0, -0.4, -0.125);
  handL.matrix.rotate(g_handLAngle, 1, 0, 0);
  handL.matrix.scale(1, 0.3, 1.25);
  handL.render();

  // RIGHT ARM
  var upArmR = new Cube();
  upArmR.color = [0.1,0.1,0.1,1];
  upArmR.matrix.translate(-0.1, -0.2, 0);
  upArmR.matrix.rotate(g_upArmRAngle, 1, 0, 0);
  upArmR.matrix.scale(0.15, 0.075, 0.15);
  upArmR.render();

  var foArmR = new Cube();
  foArmR.color = [0.1,0.1,0.1,1];
  foArmR.matrix = new Matrix4(upArmR.matrix);
  foArmR.matrix.translate(-0.1666666, -0.75, -0.1666666);
  foArmR.matrix.rotate(g_foArmRAngle, 1, 0, 0);
  foArmR.matrix.scale(0.1 / 0.15, 0.1 / 0.075, 0.1 / 0.15);
  foArmR.render();

  var handR = new Cube();
  handR.color = [0.1,0.1,0.1,1];
  handR.matrix = new Matrix4(foArmR.matrix);
  handR.matrix.translate(0, -0.4, -0.125);
  handR.matrix.rotate(g_handRAngle, 1, 0, 0);
  handR.matrix.scale(1, 0.3, 1.25);
  handR.render();

  // LEFT LEG
  var thighL = new Cube();
  thighL.color = [0.1,0.1,0.1,1];
  thighL.matrix.translate(0.1, -0.2, 0.425); 
  thighL.matrix.rotate(g_thighLAngle, 1, 0, 0);
  thighL.matrix.scale(0.15, 0.075, 0.1);
  thighL.render();

  var loLegL = new Cube();
  loLegL.color = [0.1,0.1,0.1,1];
  loLegL.matrix = new Matrix4(thighL.matrix);
  loLegL.matrix.translate(0.1666666, -0.75, 0);
  loLegL.matrix.rotate(g_loLegLAngle, 1, 0, 0);
  loLegL.matrix.scale(0.1 / 0.15, 0.1 / 0.075, 1);
  loLegL.render();

  var footL = new Cube();
  footL.color = [0.1,0.1,0.1,1];
  footL.matrix = new Matrix4(loLegL.matrix);
  footL.matrix.translate(0, -0.4, -0.125);
  footL.matrix.rotate(g_footLAngle, 1, 0, 0);
  footL.matrix.scale(1, 0.3, 1.25);
  footL.render();

  // RIGHT LEG
  var thighR = new Cube();
  thighR.color = [0.1,0.1,0.1,1];
  thighR.matrix.translate(-0.1, -0.2, 0.425);
  thighR.matrix.rotate(g_thighRAngle, 1, 0, 0);
  thighR.matrix.scale(0.15, 0.075, 0.1);
  thighR.render();

  var loLegR = new Cube();
  loLegR.color = [0.1,0.1,0.1,1];
  loLegR.matrix = new Matrix4(thighR.matrix);
  loLegR.matrix.translate(-0.1666666, -0.75, 0);
  loLegR.matrix.rotate(g_loLegRAngle, 1, 0, 0);
  loLegR.matrix.scale(0.1 / 0.15, 0.1 / 0.075, 1);
  loLegR.render();

  var footR = new Cube();
  footR.color = [0.1,0.1,0.1,1];
  footR.matrix = new Matrix4(loLegR.matrix);
  footR.matrix.translate(0, -0.4, -0.125);
  footR.matrix.rotate(g_footRAngle, 1, 0, 0);
  footR.matrix.scale(1, 0.3, 1.25);
  footR.render();

  // HEAD STUFF
  var neck = new Cube();
  neck.color = [1,1,1,1];
  neck.matrix.translate(0, 0, -0.1);
  neck.matrix.scale(0.3, 0.3, 0.05);
  neck.render();

  var head = new Cube();
  head.color = [1,1,1,1];
  head.matrix.translate(0, -0.025, -0.2);
  head.matrix.rotate(g_headAngle, 1, 0, 0);
  head.matrix.scale(0.25, 0.25, 0.2);
  head.render();

  var snout = new Cube();
  snout.color = [1,1,1,1];
  snout.matrix = new Matrix4(head.matrix);
  snout.matrix.translate(0, -0.3, -0.6);
  snout.matrix.scale(0.4, 0.3, 0.4);
  snout.render();

  var bridge = new Cube();
  bridge.color = [1,1,1,1];
  bridge.matrix = new Matrix4(head.matrix);
  bridge.matrix.translate(0, -0.1, -0.55);
  bridge.matrix.rotate(45, 1, 0, 0);
  bridge.matrix.scale(0.4, 0.4, 0.3);
  bridge.render();

  var nose = new Cube();
  nose.color = [0.1,0.1,0.1,1];
  nose.matrix = new Matrix4(snout.matrix);
  nose.matrix.translate(0, 0.25, -0.35);
  nose.matrix.scale(0.6, 0.4, 0.5);
  nose.render();

  var eyeL = new Cube();
  eyeL.color = [0.1,0.1,0.1,1];
  eyeL.matrix = new Matrix4(head.matrix);
  eyeL.matrix.translate(0.3, 0.125, -0.45);
  eyeL.matrix.rotate(30, 0, 0, 1);
  eyeL.matrix.scale(0.25, 0.333333, 0.2);
  eyeL.render();

  var eyeR = new Cube();
  eyeR.color = [0.1,0.1,0.1,1];
  eyeR.matrix = new Matrix4(head.matrix);
  eyeR.matrix.translate(-0.3, 0.125, -0.45);
  eyeR.matrix.rotate(-30, 0, 0, 1);
  eyeR.matrix.scale(0.25, 0.333333, 0.2);
  eyeR.render();

  var earL = new Cube();
  earL.color = [0.1,0.1,0.1,1];
  earL.matrix = new Matrix4(head.matrix);
  earL.matrix.translate(0.45, 0.55, -0.2);
  earL.matrix.rotate(60, 0, 0, 1);
  earL.matrix.scale(0.085 / 0.25, 0.085 / 0.25, 0.05 / 0.2);
  earL.render();

  var earR = new Cube();
  earR.color = [0.1,0.1,0.1,1];
  earR.matrix = new Matrix4(head.matrix);
  earR.matrix.translate(-0.45, 0.55, -0.2);
  earR.matrix.rotate(-60, 0, 0, 1);
  earR.matrix.scale(0.085 / 0.25, 0.085 / 0.25, 0.05 / 0.2);
  earR.render();

  var duration = performance.now() - startTime;
  sendTextToHTML( " fps: " + Math.floor(10000/duration)/10, "numdot");
}

function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log("Failed to get " + htmlID + " from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}