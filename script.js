import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { AsciiEffect } from "three/addons/effects/AsciiEffect.js";

let scene, renderer, camera, light, controls, gui, effect;
const cameraFrustum = 60;
const lightFrustum = 24; // doesn't have to be too wide as long as the camera pos remains steady (no zoom)
let targetMousePos = new THREE.Vector3();
let currentMousePos = new THREE.Vector3();

function addLight(scene) {
  light = new THREE.DirectionalLight(0xffffff, 1);
  //     const light = new THREE.SpotLight(0xffffff, 1);
  //   const light = new THREE.PointLight(0xffffff, 1);

  light.castShadow = true;

  light.shadow.camera.left = -lightFrustum;
  light.shadow.camera.right = lightFrustum;
  light.shadow.camera.top = lightFrustum;
  light.shadow.camera.bottom = -lightFrustum;
  light.shadow.radius = 3; // 6
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
      glb.scene.rotation.set(0, Math.PI / 4.33, 0);
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
    .add(light.shadow, "blurSamples", 1, 50, 1)
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

function updateCameraPOV() {
  camera.left = window.innerWidth / -cameraFrustum;
  camera.right = window.innerWidth / cameraFrustum;
  camera.top = window.innerHeight / cameraFrustum;
  camera.bottom = window.innerHeight / -cameraFrustum;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  //   effect.setSize(window.innerWidth, window.innerHeight);
}

/* -------------------------------------------------------------------------- */
/*                                    SCENE                                   */
/* -------------------------------------------------------------------------- */

function initScene() {
  scene = new THREE.Scene();

  camera = new THREE.OrthographicCamera(
    window.innerWidth / -cameraFrustum,
    window.innerWidth / cameraFrustum,
    window.innerHeight / cameraFrustum,
    window.innerHeight / -cameraFrustum,
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

  controls = new OrbitControls(camera, renderer.domElement);
  // controls.update();
  //   const controls = new OrbitControls(camera, effect.domElement);

  addLight(scene);
  addModel(scene);
  addPlane(scene);
  // addHelpers(scene);
  // addGUI();

  document.addEventListener("mousemove", (event) => {
    const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    targetMousePos.set(mouseX * 50, 7, mouseY * -50);
  });
}

/* -------------------------------------------------------------------------- */
/*                                   UPDATE                                   */
/* -------------------------------------------------------------------------- */

function update() {
  requestAnimationFrame(update);

  const damping = 0.04;
  currentMousePos.lerp(targetMousePos, damping);
  light.position.copy(currentMousePos);
  light.lookAt(0, 0, 0);

  // controls.update();

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

  const positionCues = () => {
    const cueCont = $("#cueContainer");
    // const spiralMaxHR = $(window).height() / 2;
    // const spiralMaxWR = $(window).width() / 2;

    cueCont.empty(); // clear cues before repositioning

    for (let i = 0; i < total; i++) {
      const angle = i * 0.7; // spacing between points
      let r;
      if ($(window).width() > $(window).height()) {
        r = i * ($(window).height() / 2 / total); // vertical spread of spiral
      } else {
        r = i * ($(window).width() / 2 / total); // horizontal spread of spiral
      }

      let x = (Math.random() * (cueCont.width() - 28)).toFixed();
      let y = (Math.random() * (cueCont.height() - 28)).toFixed();

      // polar to cartesian coords
      // const x = r * Math.cos(angle) + spiralMaxWR;
      // const y = r * Math.sin(-angle) + spiralMaxHR;

      const floatStart = (Math.random() * 10 - 5).toFixed(1); // Generates a value between -5 and 5

      // if (y >= 0 && y <= spiralMaxHR) {
      $("<div/>")
        .addClass("cue")
        .appendTo(cueCont)
        .css({
          top: y + "px",
          left: x + "px",
          "--float-start": `${floatStart}px`,
        });
      // .html(`<img src="/assets/star.png" />`);
      // }
    }
  };

  const isOverflown = ({ element, parent }) =>
    element.height() > parent.height();

  const resizeText = ({ $element, $parent }) => {
    const minSize = 12; // px
    const maxSize = 150;
    let i = minSize;
    let overflow = false;

    while (!overflow && i < maxSize) {
      $element.css("fontSize", `${i}px`);
      overflow = isOverflown({ element: $element, parent: $parent });
      if (!overflow) i++;
    }

    // console.log($element);
    console.log(`element ${$element.attr("id")} height: ${$element.height()}`);
    console.log(`parent height: ${$parent.height()}`);

    $element.css("fontSize", `${i - 1}px`);
    console.log(`text resized to ${i} px`);
  };

  async function loadData() {
    try {
      const response = await fetch("data.json");
      const data = await response.json(); // parse
      total = data.length;
      console.log("total: ", total);

      const contentCont = $("#contentContainer");

      data.forEach((item, i) => {
        $("<div/>")
          .addClass("content")
          .attr("id", `${i}`)
          .css("display", "none")
          .appendTo(contentCont)
          .html(item.text);

        // resizeText({
        //   $element: $(`#${i}`),
        //   $parent: contentCont,
        // });
      });

      const setupCues = () => {
        /* ---------------------------- positioning cues ---------------------------- */
        positionCues();

        /* --------------------------- revealing contents --------------------------- */
        const cue = $(".cue");

        cue.each(function (i) {
          // const floatStart = (Math.random() * 10 - 5).toFixed(1); // Generates a value between -5 and 5
          // $(this).css("--float-start", `${floatStart}px`);

          $(this).off("mouseover mouseout"); // erase duplicate listeners

          $(this).on("mouseover", function () {
            // console.log(data[i].text);

            if (data[i].hasOwnProperty("media")) {
              $("body")
                .removeClass("defaultBg")
                .addClass("mediaBg")
                .css({
                  "background-image": `url("/assets/${data[i].media}")`,
                });
              // $("#contentContainer").find(`#${i}`).css("color", "#f4efe8f2");
            }

            contentCont
              .find(`#${i}`)
              .removeClass("hide")
              .css("display", "block")
              .addClass("show")
              .on("animationend", function () {
                $(this).css("display", "block");
              });

            resizeText({
              $element: $(`#${i}`),
              $parent: contentCont,
            });
          });

          $(this).on("mouseout", function () {
            // console.log(i + " is not hovered anymore");

            $("body")
              .removeClass("mediaBg")
              .addClass("defaultBg")
              .css("background-image", `url("/assets/stone.png")`);

            contentCont
              .find(`#${i}`)
              .removeClass("show")
              .addClass("hide")
              .on("animationend", function () {
                $(this).css("display", "none");
              });
          });
        });
      };

      setupCues();

      window.addEventListener("resize", () => {
        setupCues();
      });
    } catch (error) {
      console.log(error);
    }
  }

  loadData();

  /* ------------------------------- responsive ------------------------------- */
  window.addEventListener("resize", () => {
    updateCameraPOV();
    positionCues();
  });

  /* ------------------------------- info modal ------------------------------- */
  let isModalVis = false;

  $("#info").on("click", function () {
    isModalVis = !isModalVis;
    if (isModalVis) {
      $("#infoScreen").css("display", "flex");
      $(this).html("close");
    } else {
      $("#infoScreen").css("display", "none");
      $(this).html("info");
    }
  });

  window.addEventListener("click", (event) => {
    if (
      (isModalVis && event.target.id === "infoScreen") ||
      event.target.id === "#info"
    ) {
      isModalVis = false;
      $("#infoScreen").css("display", "none");
      $("#info").html("info");
    }
  });

  $("#infoContainer").on("click", function (event) {
    event.stopPropagation();
  });
});
