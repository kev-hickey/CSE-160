// Vertex shader program
var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  attribute vec3 a_Normal;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  varying vec4 v_VertPos;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  uniform mat4 u_NormalMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
    v_Normal = normalize(vec3(u_NormalMatrix * vec4(a_Normal, 0.0)));
    v_VertPos = u_ModelMatrix * a_Position;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform sampler2D u_Sampler3;
  uniform int u_whichTexture;
  uniform vec3 u_cameraPos;
  varying vec4 v_VertPos;

  uniform vec3 u_lightPos;
  uniform bool u_lightOn;
  uniform vec3 u_lightColor;

  uniform bool u_spotOn;
  uniform vec3 u_spotPos;
  uniform vec3 u_spotDir;
  uniform float u_spotAngle;

  void main() {
    if (u_whichTexture == -3) {
      gl_FragColor = vec4((v_Normal+1.0)/2.0, 1.0);
    } else if (u_whichTexture == -2) {
      gl_FragColor = u_FragColor;
    } else if (u_whichTexture == -1) {
      gl_FragColor = vec4(v_UV,1.0,1.0);
    } else if (u_whichTexture == 0) {
      gl_FragColor = texture2D(u_Sampler0, v_UV);
      return;
    } else if (u_whichTexture == 1) {
      gl_FragColor = texture2D(u_Sampler1, v_UV);
    } else if (u_whichTexture == 2) {
      gl_FragColor = texture2D(u_Sampler2, v_UV);
    } else if (u_whichTexture == 3) {
      gl_FragColor = texture2D(u_Sampler3, v_UV);
      return;
    } else {
      gl_FragColor = vec4(1,.2,.2,1);
    }

    vec3 lightVector = u_lightPos - vec3(v_VertPos);
    float r = length(lightVector);

    vec3 L = normalize(lightVector);
    vec3 N = normalize(v_Normal);
    float nDotL = max(dot(N,L), 0.0);

    // Reflection
    vec3 R = reflect(-L, N);

    // Eye
    vec3 E = normalize(u_cameraPos - vec3(v_VertPos));

    vec3 diffuse = vec3(0.0);
    vec3 specular = vec3(0.0);
    vec3 ambient = vec3(gl_FragColor) * 0.2;

    if(u_lightOn) {
      diffuse += u_lightColor * vec3(gl_FragColor) * nDotL * 0.7;
      specular += u_lightColor * pow(max(dot(E,R),0.0),64.0) * 0.8;
    }

    if(u_spotOn) {
      vec3 spotL = normalize(u_spotPos - vec3(v_VertPos));
      float cosTheta = dot(normalize(-spotL), normalize(u_spotDir));
      float spotEffect = 0.0;
      if(cosTheta > cos(u_spotAngle)) {
        spotEffect = pow(cosTheta,10.0);
      }
      float nDotL2 = max(dot(N, spotL),0.0);
      vec3 R2 = reflect(-spotL, N);
      diffuse += vec3(1.0,1.0,1.0) * vec3(gl_FragColor) * nDotL2 * 2.0 * spotEffect;
      specular += vec3(1.0,1.0,1.0) * pow(max(dot(E,R2),0.0),64.0) * 2.0 * spotEffect;
    }

    gl_FragColor = vec4(diffuse + specular + ambient, 1.0);
  }`

// Global variables
let canvas;
let gl;
let a_Position;
let a_UV;
let a_Normal;
let u_FragColor;
let u_lightPos;
let u_cameraPos;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_NormalMatrix;
let u_ViewMatrix;
let u_whichTexture;
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_Sampler3;
let g_normalOn = false;
let g_lightPos = [0,5,0];
let g_lightOn = true;
let g_lightHue = 40;
let g_spotOn = true;
let g_spotPos = [16, 16, 16];
let g_spotDir = [0, -1, 0];
let g_spotAngle = Math.PI / 6;

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

  a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
  if (a_Normal < 0) {
    console.log('Failed to get a_Normal');
    return;
  }

  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get u_FragColor');
    return;
  }
  
  u_lightPos = gl.getUniformLocation(gl.program, 'u_lightPos');
  if (!u_lightPos) {
    console.log('Failed to get u_lightPos');
    return;
  }

  u_cameraPos = gl.getUniformLocation(gl.program, 'u_cameraPos');
  if (!u_cameraPos) {
    console.log('Failed to get u_cameraPos');
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

  u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
  if (!u_NormalMatrix) {
    console.log('Failed to get u_NormalMatrix');
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

  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if (!u_whichTexture) {
    console.log('Failed to get u_whichTexture');
    return;
  }

  u_lightOn = gl.getUniformLocation(gl.program, 'u_lightOn');
  if (!u_lightOn) {
    console.log('Failed to get u_lightOn');
    return;
  }

  u_lightColor = gl.getUniformLocation(gl.program, 'u_lightColor');
  if (!u_lightColor) {
    console.log('Failed to get u_lightColor');
    return;
  }

  u_spotOn = gl.getUniformLocation(gl.program, 'u_spotOn');
  u_spotPos = gl.getUniformLocation(gl.program, 'u_spotPos');
  u_spotDir = gl.getUniformLocation(gl.program, 'u_spotDir');
  u_spotAngle = gl.getUniformLocation(gl.program, 'u_spotAngle');

  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

function addActionsForHtmlUI() {
  document.getElementById('lightOn').onclick = function() { g_lightOn = true; };
  document.getElementById('lightOff').onclick = function() { g_lightOn = false; };

  document.getElementById('spotOn').onclick = function() { g_spotOn = true; renderAllShapes(); };
  document.getElementById('spotOff').onclick = function() { g_spotOn = false; renderAllShapes(); };

  document.getElementById('normalOn').onclick = function() { g_normalOn = true; };
  document.getElementById('normalOff').onclick = function() { g_normalOn = false; };

  document.getElementById('lightSlideY').addEventListener('mousemove', function(ev) {if(ev.buttons == 1) { g_lightPos[1] = this.value/100; renderAllShapes();}});
  document.getElementById('lightHue').addEventListener('mousemove', function(ev) {if(ev.buttons == 1) { g_lightHue = this.value; renderAllShapes();}});

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
  loadTexture('explode.jpg', gl.TEXTURE3, u_Sampler3);
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

  animate();

  renderAllShapes();

  drawAsteroid();

  requestAnimationFrame(tick);
}

function animate() {
  g_lightPos[0] = 16 + 10 * Math.cos(g_seconds);
  g_lightPos[2] = 16 + 10 * Math.sin(g_seconds);
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
        if (g_normalOn) {body.textureNum=-3;} else {(body.textureNum = 2);}
        body.color = [1.0,1.0,1.0,1.0];
        body.matrix.setIdentity();
        body.matrix.translate(x, h, y);
        body.renderfast();
      }
    }
  }
}

function hueToRgb(h) {
    h = (h % 360) / 60;
    let c = 1, x = 1 - Math.abs(h % 2 - 1);
    let r = 0, g = 0, b = 0;

    if (h < 1)      [r,g,b] = [c,x,0];
    else if (h < 2) [r,g,b] = [x,c,0];
    else if (h < 3) [r,g,b] = [0,c,x];
    else if (h < 4) [r,g,b] = [0,x,c];
    else if (h < 5) [r,g,b] = [x,0,c];
    else            [r,g,b] = [c,0,x];

    return [r, g, b];
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
  if (g_normalOn) {a.textureNum=-3;} else {(a.textureNum = 1);}
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
  projMat.setPerspective(60, canvas.width/canvas.height, 1, 250);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

  var viewMat = new Matrix4();
  viewMat.setLookAt(
    g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2],
    g_camera.at.elements[0],  g_camera.at.elements[1],  g_camera.at.elements[2],
    g_camera.up.elements[0],  g_camera.up.elements[1],  g_camera.up.elements[2]);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.uniform3f(u_lightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);

  gl.uniform3f(u_cameraPos, g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2]);

  gl.uniform1i(u_lightOn, g_lightOn);

  let rgb = hueToRgb(g_lightHue);
  let lightRGB = [rgb[0], rgb[1], rgb[2]];
  gl.uniform3f(u_lightColor, lightRGB[0], lightRGB[1], lightRGB[2]);

  // spotlight stuff
  gl.uniform1i(u_spotOn, g_spotOn);
  gl.uniform3f(u_spotPos, g_spotPos[0], g_spotPos[1], g_spotPos[2]);
  gl.uniform3f(u_spotDir, g_spotDir[0], g_spotDir[1], g_spotDir[2]);
  gl.uniform1f(u_spotAngle, Math.cos(g_spotAngle));

  var light = new Cube();
  light.color = [rgb[0], rgb[1], rgb[2], 1];
  light.matrix.translate(g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  light.matrix.scale(-.1,-.1,-.1);
  light.matrix.translate(-0.5,-0.5,-0.5);
  light.renderfast();

  var spot = new Cube();
  spot.color = [1,1,1,1];
  spot.matrix.translate(g_spotPos[0], g_spotPos[1], g_spotPos[2]);
  spot.matrix.scale(-.1,-.1,-.1);
  spot.matrix.translate(-0.5,-0.5,-0.5);
  spot.renderfast();

  var ground = new Cube();
  if (g_normalOn) {ground.textureNum=-3;} else {(ground.textureNum = 1);}
  ground.color = [0.25,0.5,0.25,1.0];
  ground.matrix.setIdentity();
  ground.matrix.scale(32,0.01,32);
  ground.matrix.translate(0,-1,0);
  ground.renderfast();

  var sky = new Cube();
  if (g_normalOn) {sky.textureNum=-3;} else {(sky.textureNum = skyboxTexture);}
  sky.color = [1,1,1,1];
  sky.matrix.setIdentity();
  sky.matrix.translate(-34,-20,-34);
  sky.matrix.scale(100,100,100);
  sky.renderfast();

  drawMap();

  var ball = new Sphere();
  if (g_normalOn) ball.textureNum=-3;
  ball.color = [1.0,0.5,0.5,1.0];
  ball.matrix.setIdentity();
  ball.matrix.translate(24,5,16);
  ball.normalMatrix.setInverseOf(ball.matrix).transpose();
  ball.render();

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