import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { AsciiEffect } from "three/addons/effects/AsciiEffect.js";

let scene, renderer, camera, light, gui, effect;

function addLight(scene) {
  light = new THREE.DirectionalLight(0xffffff, 1);
  //     const light = new THREE.SpotLight(0xffffff, 1);
  //   const light = new THREE.PointLight(0xffffff, 1);

  light.castShadow = true;
  const sBound = 9; // doesn't have to be too wide as long as the camera pos remains steady (no zoom)
  light.shadow.camera.left = -sBound;
  light.shadow.camera.right = sBound;
  light.shadow.camera.top = sBound;
  light.shadow.camera.bottom = -sBound;
  light.shadow.radius = 6;
  light.shadow.blurSamples = 25;
  scene.add(light);
}

function addTestModel(scene) {
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

function addModel(scene) {
  const loader = new GLTFLoader();
  loader.load(
    "assets/arch.glb",
    function (glb) {
      glb.scene.traverse(function (mesh) {
        if (mesh.isMesh) {
          mesh.material = new THREE.MeshStandardMaterial({
            color: 0xf2f2f2,
            colorWrite: false,
          });
          mesh.castShadow = true;
        }
      });
      glb.scene.rotation.set(0, Math.PI / 4, 0);
      scene.add(glb.scene);
    },
    function (xhr) {
      // console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    function (error) {
      console.log("An error happened");
    }
  );
}

function addPlane(scene) {
  const planeGeo = new THREE.PlaneGeometry(100, 100);
  const planeMat = new THREE.ShadowMaterial({
    opacity: 0.1,
    // transparent: false,
  });
  // const planeMat = new THREE.MeshStandardMaterial({
  //   color: 0xf2f2f2,
  // });
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
  lightFolder.add(light.position, "y", 0, 100, 1).onChange(function (val) {
    light.position.y = val;
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
  console.log(
    "resized! width: " + window.innerWidth + " height: " + window.innerHeight
  );
  //   effect.setSize(window.innerWidth, window.innerHeight);
}

/* -------------------------------------------------------------------------- */
/*                                    SCENE                                   */
/* -------------------------------------------------------------------------- */

function initScene() {
  scene = new THREE.Scene();

  const cBound = 60;
  camera = new THREE.OrthographicCamera(
    window.innerWidth / -cBound,
    window.innerWidth / cBound,
    window.innerHeight / cBound,
    window.innerHeight / -cBound,
    0.1,
    100
  );
  camera.position.set(0, 10, 0);
  camera.lookAt(0, 0, 0);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0xffffff, 0);
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
  // addHelpers(scene);
  // addGUI();

  document.addEventListener("mousemove", (event) => {
    const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    light.position.set(mouseX * 50, 5, mouseY * -50);
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

/* -------------------------------------------------------------------------- */
/*                                 not-canvas                                 */
/* -------------------------------------------------------------------------- */

$(function () {
  let total;

  async function loadData() {
    try {
      const response = await fetch("data.json");
      const data = await response.json(); // parse
      total = data.length;
      console.log("total: ", total);

      data.forEach((item, i) => {
        $("<div/>")
          .addClass("content")
          .css("display", "none")
          .attr("id", `${i}`)
          .appendTo($("#contentContainer"))
          .html(item.text);
      });

      /* ---------------------------- positioning cues ---------------------------- */
      const cueCont = $("#cueContainer");
      const spiralMaxHR = $(window).height() / 2;
      const spiralMaxWR = $(window).width() / 2;

      for (let i = 0; i < total; i++) {
        // let x = (Math.random() * (cueCont.width() - 28)).toFixed();
        // let y = (Math.random() * (cueCont.height() - 28)).toFixed();

        const angle = i * 0.7; // spacing between points
        const r = i * ($(window).width() / 2 / total); // horizontal spread of spiral

        // polar to cartesian coords
        const x = r * Math.cos(angle) + spiralMaxWR;
        const y = r * Math.sin(-angle) + spiralMaxHR;

        // if (y >= 0 && y <= spiralMaxH) {
        $("<div/>")
          .addClass("cue")
          .appendTo(cueCont)
          .css({
            top: y + "px",
            left: x + "px",
          });
        // }

        console.log("computed: " + $(".cue").width());
      }

      /* --------------------------- revealing contents --------------------------- */
      const cue = $(".cue");
      cue.each(function (i) {
        $(this).on("mouseenter", function (e) {
          console.log(data[i].text);
          $("#contentContainer")
            .find(`#${i}`)
            .removeClass("hide")
            .css("display", "block")
            .addClass("show")
            .on("animationend", function () {
              $(this).css("display", "block");
            });
        });

        $(this).on("mouseleave", function () {
          console.log(i + " is not hovered anymore");
          $("#contentContainer")
            .find(`#${i}`)
            .removeClass("show")
            .addClass("hide")
            .on("animationend", function () {
              $(this).css("display", "none");
            });
        });
      });
    } catch (error) {
      console.log(error);
    }
  }

  loadData();
});
