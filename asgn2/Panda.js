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

// Global variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_ModelMatrix;

// Shapes list
var g_shapesList = [];

// UI state
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];

// --- WebGL setup ---
function setupWebGL() {
  canvas = document.getElementById('webgl');
  gl = canvas.getContext('webgl', { preserveDrawingBuffer: true });
  if (!gl) { console.log('Failed to get WebGL context'); return; }

  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
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
}

// --- Cube drawing ---
function drawCube(M) {
  const vertices = [
    -0.5,-0.5, 0.5,  0.5,-0.5,0.5,  0.5,0.5,0.5,  -0.5,0.5,0.5, // front
    -0.5,-0.5,-0.5,  0.5,-0.5,-0.5,  0.5,0.5,-0.5,  -0.5,0.5,-0.5  // back
  ];

  const indices = [
    0,1,2, 0,2,3, // front
    1,5,6, 1,6,2, // right
    5,4,7, 5,7,6, // back
    4,0,3, 4,3,7, // left
    3,2,6, 3,6,7, // top
    4,5,1, 4,1,0  // bottom
  ];

  const vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);

  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

  gl.uniformMatrix4fv(u_ModelMatrix, false, M.elements);
  gl.uniform4fv(u_FragColor, g_selectedColor);

  gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
}

// --- HTML UI ---
function addActionsForHtmlUI() {
  document.getElementById('green').onclick = () => g_selectedColor = [0,1,0,1];
  document.getElementById('red').onclick   = () => g_selectedColor = [1,0,0,1];
}

// --- Scene rendering ---
function renderScene() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // example: cube at origin
  let M = new Matrix4(); // identity
  drawCube(M);
}

// --- Animation loop ---
function animate() {
  renderScene();
  requestAnimationFrame(animate);
}

// --- Main ---
function main() {
  setupWebGL();
  connectVariableToGLSL();
  addActionsForHtmlUI();
  animate();
}
