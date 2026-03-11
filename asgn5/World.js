import * as THREE from 'three';
import {OBJLoader} from 'three/addons/loaders/OBJLoader.js';
import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';

function main() {
  let asteroid; // loaded OBJ
  
  const canvas = document.querySelector('#c');
  const renderer = new THREE.WebGLRenderer({antialias: true, canvas});
  renderer.setSize(1520, 800);

  const crashText = document.getElementById('crashText');

  const fov = 75;
  const aspect = 1520 / 800;
  const near = 0.1;
  const far = 1000;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.z = 2;

  const scene = new THREE.Scene();

  const keysHeld = [];
  window.addEventListener("keydown", (e) => keysHeld[e.code] = true);
  window.addEventListener("keyup",   (e) => keysHeld[e.code] = false);
  let mouseDown = false;
  window.addEventListener("mousedown", () => mouseDown = true);
  window.addEventListener("mouseup", () => mouseDown = false);

  const loader = new THREE.TextureLoader();
  const texture = loader.load( 'regolith.jpg' );
  const spaceTexture = loader.load( 'space.jpg' );
  texture.colorSpace = THREE.SRGBColorSpace;
  spaceTexture.colorSpace = THREE.SRGBColorSpace;

  const rotations = [];

  const player = new THREE.Sphere(camera.position, 1);

  // SKYBOX --------------------------------------------------
  const skyGeo = new THREE.BoxGeometry(1000, 1000, 1000);
  const skyMat = new THREE.MeshBasicMaterial({
    map: spaceTexture,
    side: THREE.BackSide
  });

  const skybox = new THREE.Mesh(skyGeo, skyMat);
  scene.add(skybox);

  // CONTROLS --------------------------------------------------
  const controls = new FirstPersonControls(camera, renderer.domElement);
  controls.movementSpeed = 5;
  controls.lookSpeed = 0.1;
  controls.lookVertical = true;

  camera.position.set(0, 0, 20);

  // ASTEROID --------------------------------------------------
  const objLoader = new OBJLoader();
  objLoader.load('asteroid.obj', (root) => {
    root.traverse((node) => {
      if (node.isMesh) {
        node.geometry.computeVertexNormals();
        node.material = new THREE.MeshPhongMaterial({
          map: texture , side: THREE.DoubleSide
        });
      }
    });

    // center asteroid model (fix rotation)
    const box = new THREE.Box3().setFromObject(root);
    const center = box.getCenter(new THREE.Vector3());
    root.children.forEach(child => {
      child.position.sub(center);
    });

    root.scale.set(0.02, 0.02, 0.02);
    asteroid = root;

    // TRACK --------------------------------------------------

    const shapes = [
      (size) => new THREE.BoxGeometry(size, size, size),
      (size) => new THREE.CapsuleGeometry(size/2, size, 4, 8),
      (size) => new THREE.CylinderGeometry(size/2, size/2, size, 6),
      (size) => new THREE.DodecahedronGeometry(size),
      (size) => new THREE.IcosahedronGeometry(size),
      (size) => new THREE.OctahedronGeometry(size),
      (size) => new THREE.SphereGeometry(size/2, 8, 8),
      (size) => new THREE.TetrahedronGeometry(size),
      (size) => new THREE.TorusKnotGeometry(size/2, size/8, 64, 8),
    ];

    // generate 100 shapes
    for (let i = 0; i < 100; i++) {
      const z = -Math.random() * 250;
      const x = (Math.random() - 0.5) * 100;
      const y = (Math.random() - 0.5) * 100;

      const scale = Math.random() * 9 + 5;
      const shapeIndex = Math.floor(Math.random() * shapes.length);
      const geom = shapes[shapeIndex](scale);

      let mesh;

      // 50% chance to use asteroid OBJ
      if (asteroid && Math.random() < 0.5) {
        mesh = asteroid.clone();
        mesh.scale.set(scale*0.02, scale*0.02, scale*0.02);
      } else {
        const mat = new THREE.MeshPhongMaterial({map: texture});
        mesh = new THREE.Mesh(geom, mat);
      }

      mesh.position.set(x, y, z);
      mesh.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI);

      scene.add(mesh);

      if (mesh.geometry) {
        mesh.geometry.computeBoundingSphere();

        // if asteroid model, increase boundary (fix)
        const boundary = mesh.geometry.boundingSphere.clone();
        if (mesh === asteroid) {
          boundary.radius *= 1.2;
        }

        rotations.push({
          mesh,
          rotationSpeed: new THREE.Vector3(
            (Math.random() - 0.5) * 0.01,
            (Math.random() - 0.5) * 0.01,
            (Math.random() - 0.5) * 0.01
          ),
          boundary
        });
      } else {
        rotations.push({
          mesh,
          rotationSpeed: new THREE.Vector3(
            (Math.random() - 0.5) * 0.01,
            (Math.random() - 0.5) * 0.01,
            (Math.random() - 0.5) * 0.01
          ),
          boundary: new THREE.Sphere(mesh.position.clone(), 5)
        });
      }
    }
  });

  const ringGeometry = new THREE.TorusGeometry(10, 0.5, 16, 100);
  const ringMaterial = new THREE.MeshPhongMaterial({ color: 0xaaaaaa, side: THREE.DoubleSide });
  const finishLine = new THREE.Mesh(ringGeometry, ringMaterial);
  finishLine.position.set(0, 0, -260);
  scene.add(finishLine);

  const timer = document.getElementById('timer');
  let timerStarted = false;
  let startTime = 0;
  let finished = false;

  function render(time) {
    time *= 0.001;  // convert time to seconds

    const moveDistance = controls.movementSpeed * 0.05;
    if (keysHeld['Space']) camera.position.y += moveDistance;
    if (keysHeld['ShiftLeft'] || keysHeld['ShiftRight']) camera.position.y -= moveDistance;
    
    controls.update(0.1);

    rotations.forEach(({mesh, rotationSpeed}) => {
      mesh.rotation.x += rotationSpeed.x;
      mesh.rotation.y += rotationSpeed.y;
      mesh.rotation.z += rotationSpeed.z;
    });

    player.center.copy(camera.position);

    if (!timerStarted && (Object.values(keysHeld).some(v => v) || mouseDown)) {
      timerStarted = true;
      startTime = performance.now();
    }

    if (timerStarted && !finished) {
      const elapsed = (performance.now() - startTime) / 1000;
      timer.textContent = elapsed.toFixed(2) + 's';
    }

    const finishBox = new THREE.Box3().setFromCenterAndSize(
      finishLine.position,
      new THREE.Vector3(20, 20, 5)
    );
    if (!finished && finishBox.containsPoint(camera.position)) {
        finished = true;
        timer.style.color = 'lime';
    }

    rotations.forEach(r => {
      r.boundary.center.setFromMatrixPosition(r.mesh.matrixWorld);
      if (player.intersectsSphere(r.boundary)) {
        crashText.style.display = 'block';
        camera.position.set(0, 0, 20);
        player.center.copy(camera.position);
        setTimeout(() => { crashText.style.display = 'none'; }, 1000);
      }
    })

    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);

  // LIGHTING --------------------------------------------------
  const sunlight = new THREE.DirectionalLight(0xffffff, 3);
  sunlight.position.set(5, 10, 7);
  scene.add(sunlight);

  const ambient = new THREE.AmbientLight(0x222244, 0.5);
  scene.add(ambient);

  const finishLight = new THREE.PointLight(0xffaa00, 10000);
  finishLight.position.set(0, 0, -255);
  scene.add(finishLight);
}

main();