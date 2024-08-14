import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { AsciiEffect } from "three/addons/effects/AsciiEffect.js";

let scene, renderer, camera, light, gui, effect;

function addLight(scene) {
  light = new THREE.DirectionalLight(0xffffff, 1);
  //     const light = new THREE.SpotLight(0xffffff, 1);
  //   const light = new THREE.PointLight(0xffffff, 1);

  light.castShadow = true;
  const sBound = 20; // doesn't have to be too wide as long as the camera pos remains steady (no zoom)
  light.shadow.camera.left = -sBound;
  light.shadow.camera.right = sBound;
  light.shadow.camera.top = sBound;
  light.shadow.camera.bottom = -sBound;
  light.shadow.radius = 6;
  light.shadow.blurSamples = 25;
  scene.add(light);
}

function addModel(scene) {
  const modelGeo = new THREE.BoxGeometry(2, 2, 2);
  const modelMat = new THREE.MeshStandardMaterial({
    color: 0xf2f2f2,
    colorWrite: false,
  });
  const model = new THREE.Mesh(modelGeo, modelMat);
  model.castShadow = true;
  model.position.y = 2;
  scene.add(model);
}

function addPlane(scene) {
  const planeGeo = new THREE.PlaneGeometry(20, 20);
  const planeMat = new THREE.ShadowMaterial({
    opacity: 0.5,
  });
  const plane = new THREE.Mesh(planeGeo, planeMat);
  plane.rotation.x = -Math.PI / 2;
  plane.receiveShadow = true;
  scene.add(plane);
}

function addGUI() {
  gui = new GUI();
  const lightFolder = gui.addFolder("light");
  lightFolder.add(light.shadow, "radius", 0, 50, 1).onChange(function (val) {
    light.shadow.radius = val;
  });
  lightFolder
    .add(light.shadow, "blurSamples", 1, 25, 1)
    .onChange(function (val) {
      light.shadow.blurSamples = val;
    });
}

function addHelpers(scene) {
  const helper = new THREE.DirectionalLightHelper(light, 3, 0x000000);
  //     const helper = new THREE.SpotLightHelper(light, 3, 0x000000);
  //   const helper = new THREE.PointLightHelper(light, 3, 0x000000);
  scene.add(helper);

  const axesHelper = new THREE.AxesHelper(5);
  scene.add(axesHelper);
}

function onWindowResize() {
  const aspect = window.innerWidth / window.innerHeight;
  camera.left = -10 * aspect;
  camera.right = 10 * aspect;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  //   effect.setSize(window.innerWidth, window.innerHeight);
}

/* -------------------------------------------------------------------------- */
/*                                    SCENE                                   */
/* -------------------------------------------------------------------------- */

function initScene() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf2f2f2);

  const cBound = 15;
  camera = new THREE.OrthographicCamera(
    -cBound,
    cBound,
    cBound,
    -cBound,
    0.1,
    100
  );
  camera.position.set(0, 10, 0);
  camera.lookAt(0, 0, 0);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.VSMShadowMap;
  //   renderer.shadowMap.type = THREE.PCFShadowMap;
  //   renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  effect = new AsciiEffect(renderer, "#OX. ", { invert: true });
  effect.setSize(window.innerWidth, window.innerHeight);

  document.body.appendChild(renderer.domElement);
  //   document.body.appendChild(effect.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  //   const controls = new OrbitControls(camera, effect.domElement);

  addLight(scene);
  addModel(scene);
  addPlane(scene);
  //   addHelpers(scene);
  //   addGUI();

  document.addEventListener("mousemove", (event) => {
    const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    light.position.set(mouseX * 10, 5, mouseY * -10);
    light.lookAt(0, 0, 0);
  });

  window.addEventListener("resize", () => {
    onWindowResize();
  });
}

/* -------------------------------------------------------------------------- */
/*                                   UPDATE                                   */
/* -------------------------------------------------------------------------- */

function update() {
  requestAnimationFrame(update);
  renderer.render(scene, camera);
  //   effect.render(scene, camera);
}

initScene();
update();
