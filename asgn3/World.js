// Vertex shader program
var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  varying vec2 v_UV;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform sampler2D u_Sampler3;
  uniform int u_whichTexture;
  void main() {
    if (u_whichTexture == -2) {
      gl_FragColor = u_FragColor;
    } else if (u_whichTexture == -1) {
      gl_FragColor = vec4(v_UV,1.0,1.0);
    } else if (u_whichTexture == 0) {
      gl_FragColor = texture2D(u_Sampler0, v_UV);
    } else if (u_whichTexture == 1) {
      gl_FragColor = texture2D(u_Sampler1, v_UV);
    } else if (u_whichTexture == 2) {
      gl_FragColor = texture2D(u_Sampler2, v_UV);
    } else if (u_whichTexture == 3) {
      gl_FragColor = texture2D(u_Sampler3, v_UV);
    } else {
      gl_FragColor = vec4(1,.2,.2,1);
    }
  }`

// Global variables
let canvas;
let gl;
let a_Position;
let a_UV;
let u_FragColor;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_whichTexture;
let u_Sampler0;
let keysHeld = [];
let keysPressed = [];
// mouse control
let mouseDown = false;
let lastMouseX = 0;
let lastMouseY = 0;
// asteroid game
let asteroid = {
  x: 16,
  z: 16,
  y: 100,
  falling: false,
  speed: 0.25
};
let playerAlive = true;
let skyboxTexture = 0;

var g_startTime = performance.now()/1000.0;
var g_seconds   = performance.now()/1000.0 - g_startTime;
let g_camera = new Camera();
let g_map = [
  [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
  [3,3,3,3,3,3,3,3,3,3,3,3,2,2,2,2,2,2,2,2,3,3,3,3,3,3,3,3,3,3,3,3],
  [3,3,3,3,3,3,3,3,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,3,3,3,3,3,3,3,3,3],
  [3,3,3,3,3,3,3,3,2,2,2,2,2,1,1,1,1,1,1,2,2,2,2,2,3,3,3,3,3,3,3,3],
  [3,3,3,3,3,3,2,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,3,3,3,3,3,3],
  [3,3,3,3,3,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,3,3,3,3,3],
  [3,3,3,3,2,2,2,1,1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,1,2,2,2,3,3,3,3],
  [3,3,3,3,2,2,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,2,2,3,3,3,3],
  [3,3,3,2,2,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,2,2,3,3,3],
  [3,3,2,2,2,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,3,3],
  [3,3,2,2,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,2,2,3,3],
  [3,3,2,2,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,2,2,3,3],
  [3,2,2,2,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,2,2,2,3],
  [3,2,2,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,2,2,3],
  [3,2,2,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,2,2,3],
  [3,2,2,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,2,2,3],
  [3,2,2,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,2,2,3],
  [3,2,2,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,2,2,3],
  [3,2,2,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,2,2,3],
  [3,2,2,2,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,2,2,2,3],
  [3,3,2,2,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,2,2,3,3],
  [3,3,2,2,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,2,2,3,3],
  [3,3,2,2,2,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,3,3],
  [3,3,3,2,2,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,2,2,3,3,3],
  [3,3,3,3,2,2,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,2,2,3,3,3,3],
  [3,3,3,3,2,2,2,1,1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,1,2,2,2,3,3,3,3],
  [3,3,3,3,3,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,3,3,3,3,3],
  [3,3,3,3,3,3,2,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,3,3,3,3,3,3],
  [3,3,3,3,3,3,3,3,2,2,2,2,2,1,1,1,1,1,1,2,2,2,2,2,3,3,3,3,3,3,3,3],
  [3,3,3,3,3,3,3,3,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,3,3,3,3,3,3,3,3,3],
  [3,3,3,3,3,3,3,3,3,3,3,3,2,2,2,2,2,2,2,2,3,3,3,3,3,3,3,3,3,3,3,3],
  [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3]
];

// --- WebGL setup ---
function setupWebGL() {
  canvas = document.getElementById('webgl');
  
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
  if (!gl) { console.log('Failed to get WebGL context'); return; }

  gl.enable(gl.DEPTH_TEST);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

// --- Shader connection ---
function connectVariableToGLSL() {
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get a_Position');
    return;
  }

  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
    console.log('Failed to get a_UV');
    return;
  }

  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get u_FragColor');
    return;
  }

  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get u_ModelMatrix');
    return;
  }

  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) {
    console.log('Failed to get u_ViewMatrix');
    return;
  }

  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (!u_ProjectionMatrix) {
    console.log('Failed to get u_ProjectionMatrix');
    return;
  }

  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if(!u_Sampler0){
    console.log('Failed to get u_Sampler0');
    return;
  }
  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  if(!u_Sampler1){
    console.log('Failed to get u_Sampler1');
    return;
  }
  u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
  if(!u_Sampler2){
    console.log('Failed to get u_Sampler2');
    return;
  }
  u_Sampler3 = gl.getUniformLocation(gl.program, 'u_Sampler3');
  if(!u_Sampler3){
    console.log('Failed to get u_Sampler3');
    return;
  }

  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if (!u_whichTexture) {
    console.log('Failed to get u_whichTexture');
    return;
  }

  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

function addActionsForHtmlUI() {
  document.getElementById("startAsteroid").addEventListener("click", () => {
    startAsteroid();
  });

  document.getElementById("resetWorld").addEventListener("click", () => {
    resetWorld();
  });
}

function initTextures() {
  loadTexture('space.jpg', gl.TEXTURE0, u_Sampler0);
  loadTexture('ground.jpg', gl.TEXTURE1, u_Sampler1);
  loadTexture('regolith.jpg', gl.TEXTURE2, u_Sampler2);
  loadTexture('explode.jpg', gl.TEXTURE3, u_Sampler3)
}

function loadTexture(url, textureUnit, uniform) {
  var image = new Image();
  image.onload = function() {
    var texture = gl.createTexture();
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.activeTexture(textureUnit);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.uniform1i(uniform, textureUnit - gl.TEXTURE0);
  };
  image.src = url;
}

// --- Main ---
function main() {
  setupWebGL();
  connectVariableToGLSL();
  addActionsForHtmlUI();
  initTextures();

  canvas.addEventListener('mousedown', (ev) => {
    mouseDown = true;
    lastMouseX = ev.clientX;
    lastMouseY = ev.clientY;
  });

  canvas.addEventListener('mouseup', (ev) => {
    mouseDown = false;
  });

  canvas.addEventListener('mousemove', (ev) => {
    if (!mouseDown) return;

    let dx = ev.clientX - lastMouseX;
    let dy = ev.clientY - lastMouseY;

    let sensitivity = 0.2;

    g_camera.panRight(dx * sensitivity);
    g_camera.tilt(-dy * sensitivity);

    lastMouseX = ev.clientX;
    lastMouseY = ev.clientY;
  });

  gl.clearColor(0, 0, 0, 1.0);

  requestAnimationFrame(tick);
}

function tick() {
  g_seconds = performance.now()/1000.0-g_startTime;

  if (asteroid.falling) {
    asteroid.y -= asteroid.speed;

    if (asteroid.y <= 0) {
      asteroid.y = 0;
      asteroid.falling = false;

      let cam = g_camera.eye.elements;
      let hitBlock = false;
      let steps = 50;

      for (let i = 0; i <= steps; i++) {
        let t = i / steps;
        let px = cam[0] + t * (asteroid.x - cam[0]);
        let py = cam[1] + t * (0 - cam[1]);
        let pz = cam[2] + t * (asteroid.z - cam[2]);

        let cx = Math.floor(px);
        let cy = Math.floor(py);
        let cz = Math.floor(pz);

        if (g_map[cx] && g_map[cx][cz] !== undefined && g_map[cx][cz] > cy) {
          hitBlock = true;
          break;
        }
      }

      if (!hitBlock) {
        sendTextToHTML("You were hit by the asteroid! Press RESET.", "message");
        playerAlive = false;
        skyboxTexture = 3;
      } else {
        sendTextToHTML("You survived the asteroid!", "message");
        skyboxTexture = 3;
        setTimeout(() => { skyboxTexture = 0; }, 500);
      }
    }
  }

  renderAllShapes();

  drawAsteroid();

  requestAnimationFrame(tick);
}

window.addEventListener("keydown", (ev) => {
  if (!keysHeld[ev.keyCode]) { 
        keysPressed[ev.keyCode] = true;
    }
    keysHeld[ev.keyCode] = true;

    if (ev.keyCode === 32) {
    ev.preventDefault();
  }
});

window.addEventListener("keyup", (ev) => {
  keysHeld[ev.keyCode] = false;
});


function updateCamera() {
  if(keysHeld[87]) g_camera.forward();   // W
  if(keysHeld[65]) g_camera.left();      // A
  if(keysHeld[83]) g_camera.backward();  // S
  if(keysHeld[68]) g_camera.right();     // D
  if(keysHeld[32]) g_camera.upward();    // Space
  if(keysHeld[16]) g_camera.downward();  // Shift
  if(keysHeld[69]) g_camera.panRight();  // E
  if(keysHeld[81]) g_camera.panLeft();   // Q

  if(keysPressed[70]) addBlock();        // F: add block
  if(keysPressed[82]) removeBlock();     // R: remove block

  keysPressed = [];
}

function drawMap() {
  for (x = 0; x < 32; x++) {
    for (y = 0; y < 32; y++) {
      let height = g_map[x][y];
      for (h = 0; h < height; h++) {
        var body = new Cube();
        body.textureNum = 2;
        body.color = [1.0,1.0,1.0,1.0];
        body.matrix.setIdentity();
        body.matrix.translate(x, h, y);
        body.renderfast();
      }
    }
  }
}

function startAsteroid() {
  asteroid.falling = true;
  asteroid.y = 100;
  sendTextToHTML("", "message");
}

function resetWorld() {
  asteroid.falling = false;
  playerAlive = true;
  asteroid.y = 100;
  skyboxTexture = 0;
  sendTextToHTML("", "message");
}

function drawAsteroid() {
  let a = new Cube();
  a.textureNum = 1;
  a.matrix.setIdentity();
  a.matrix.translate(asteroid.x, asteroid.y, asteroid.z);
  a.matrix.scale(10,10,10);
  a.matrix.translate(-0.5,0,-0.5)
  a.renderfast();
}


function getBlock(maxDist = 5, step = 0.05) {
  let pos = g_camera.eye.elements.slice();
  let dir = [
    g_camera.at.elements[0] - g_camera.eye.elements[0],
    g_camera.at.elements[1] - g_camera.eye.elements[1],
    g_camera.at.elements[2] - g_camera.eye.elements[2]
  ];
  let len = Math.hypot(...dir);
  dir = dir.map(x => x / len);

  for (let t = 0; t < maxDist; t += step) {
    let px = pos[0] + dir[0] * t;
    let py = pos[1] + dir[1] * t;
    let pz = pos[2] + dir[2] * t;

    let cx = Math.floor(px);
    let cy = Math.floor(py);
    let cz = Math.floor(pz);

    if (!g_map[cx] || g_map[cx][cz] === undefined) continue;

    if (g_map[cx][cz] >= cy) {
      let fx = px - cx;
      let fy = py - cy;
      let fz = pz - cz;

      let maxAxis = Math.max(Math.abs(fx - 0.5), Math.abs(fy - 0.5), Math.abs(fz - 0.5));

      let face;
      if (maxAxis === Math.abs(fx - 0.5)) face = fx > 0.5 ? 'right' : 'left';
      else if (maxAxis === Math.abs(fy - 0.5)) face = fy > 0.5 ? 'top' : 'bottom';
      else face = fz > 0.5 ? 'front' : 'back';

      return {x: cx, y: cy, z: cz, face: face};
    }
  }
  return null;
}

function addBlock() {
  const hit = getBlock();
  if (!hit) return;

  let {x, z, y} = hit;

  g_map[x][z] = y + 1;
}

function removeBlock() {
  const hit = getBlock();
  if (!hit) return;

  let {x, z, y} = hit;

  if (g_map[x][z] > 0) g_map[x][z] -= 1;
}

function renderAllShapes() {
  if (playerAlive) updateCamera();
  
  var startTime = performance.now();

  var projMat = new Matrix4();
  projMat.setPerspective(60, canvas.width/canvas.height, 1, 100);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

  var viewMat = new Matrix4();
  viewMat.setLookAt(
    g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2],
    g_camera.at.elements[0],  g_camera.at.elements[1],  g_camera.at.elements[2],
    g_camera.up.elements[0],  g_camera.up.elements[1],  g_camera.up.elements[2]);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);

  var ground = new Cube();
  ground.textureNum = 1;
  ground.color = [0.25,0.5,0.25,1.0];
  ground.matrix.setIdentity();
  ground.matrix.scale(32,0.01,32);
  ground.matrix.translate(0,-1,0);
  ground.renderfast();

  var sky = new Cube();
  sky.textureNum = skyboxTexture;
  sky.matrix.setIdentity();
  sky.matrix.translate(-34,-20,-34);
  sky.matrix.scale(100,100,100);
  sky.renderfast();

  drawMap();

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