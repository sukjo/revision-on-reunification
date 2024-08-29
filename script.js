import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

let scene, renderer, camera, light, controls, gui;
const cameraFrustum = 60;
const lightFrustum = 24; // doesn't have to be too wide as long as the camera pos remains steady (no zoom)
let targetMousePos = new THREE.Vector3();
let currentMousePos = new THREE.Vector3();
let clientX, clientY;

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

  document.body.appendChild(renderer.domElement);

  // controls = new OrbitControls(camera, renderer.domElement);
  // controls.update();

  addLight(scene);
  addModel(scene);
  addPlane(scene);
  // addHelpers(scene);
  // addGUI();
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
}

initScene();
update();

/* -------------------------------------------------------------------------- */
/*                                 not-canvas                                 */
/* -------------------------------------------------------------------------- */

$(function () {
  let total;
  const contentCont = $("#contentContainer");

  const positionCues = () => {
    const cueCont = $("#cueContainer");
    // const spiralMaxHR = $(window).height() / 2;
    // const spiralMaxWR = $(window).width() / 2;

    cueCont.empty(); // clear cues before repositioning

    for (let i = 0; i < total; i++) {
      // const angle = i * 0.7; // spacing between points
      // let r;
      // if ($(window).width() > $(window).height()) {
      //   r = i * ($(window).height() / 2 / total); // vertical spread of spiral
      // } else {
      //   r = i * ($(window).width() / 2 / total); // horizontal spread of spiral
      // }

      let x = (Math.random() * (cueCont.width() - 28)).toFixed();
      let y = (Math.random() * (cueCont.height() - 28)).toFixed();

      // polar to cartesian coords
      // const x = r * Math.cos(angle) + spiralMaxWR;
      // const y = r * Math.sin(-angle) + spiralMaxHR;

      const floatStart = (Math.random() * 10 - 5).toFixed(1); // Generates a value between -5 and 5

      // if (y >= 0 && y <= spiralMaxHR) {
      $("<div/>")
        .addClass("cue")
        .attr({
          tabindex: "0",
          role: "button",
          "aria-pressed": "false",
        })
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

    $element.css("fontSize", `${i - 1}px`);
  };

  const setupCues = (data) => {
    positionCues();

    const cue = $(".cue");

    cue.each(function (i) {
      // const floatStart = (Math.random() * 10 - 5).toFixed(1); // Generates a value between -5 and 5
      // $(this).css("--float-start", `${floatStart}px`);

      $(this).off("mouseover mouseout"); // erase duplicate listeners

      $(this).on("mouseover focus", function () {
        // console.log(data[i].text);

        if (data[i].hasOwnProperty("media")) {
          $("body")
            .removeClass("defaultBg")
            .addClass("mediaBg")
            .css({
              "background-image": `url("./assets/${data[i].media}")`,
            });
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

      $(this).on("mouseout focusout", function () {
        // console.log(i + " is not hovered anymore");

        $("body")
          .removeClass("mediaBg")
          .addClass("defaultBg")
          .css("background-image", `url("./assets/stone.png")`);

        contentCont
          .find(`#${i}`)
          .removeClass("show")
          .addClass("hide")
          .on("animationend", function () {
            $(this).css("display", "none");
          });
      });
    });

    $(document).on("touchmove", function () {
      cue.each(function (i) {
        const cueBounds = $(this)[0].getBoundingClientRect();
        if (
          clientX >= cueBounds.left &&
          clientX <= cueBounds.right &&
          clientY >= cueBounds.top &&
          clientY <= cueBounds.bottom
        ) {
          // console.log(`cue ${i} overlapped`);
          if (data[i].hasOwnProperty("media")) {
            $("body")
              .removeClass("defaultBg")
              .addClass("mediaBg")
              .css({
                "background-image": `url("./assets/${data[i].media}")`,
              });
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
        } else {
          $("body")
            .removeClass("mediaBg")
            .addClass("defaultBg")
            .css("background-image", `url("./assets/stone.png")`);
          contentCont
            .find(`#${i}`)
            .removeClass("show")
            .addClass("hide")
            .on("animationend", function () {
              $(this).css("display", "none");
            });
        }
      });
    });
  };

  async function loadData() {
    try {
      const response = await fetch("data.json");
      const data = await response.json(); // parse
      total = data.length;
      // console.log("total: ", total);

      data.forEach((item, i) => {
        $("<div/>")
          .addClass("content")
          .attr("id", `${i}`)
          .css("display", "none")
          .appendTo(contentCont)
          .html(item.text);
      });

      setupCues(data);

      $(window).on("resize", () => {
        setupCues(data);
      });
    } catch (error) {
      console.log(error);
    }
  }

  loadData();

  /* ------------------------ on mousemove or touchmove ----------------------- */

  $(document).on("mousemove touchmove", function (ev) {
    if (ev.type === "touchmove") {
      clientX = ev.originalEvent.touches[0].clientX;
      clientY = ev.originalEvent.touches[0].clientY;
    } else {
      clientX = ev.clientX;
      clientY = ev.clientY;
    }

    const mouseX = (clientX / window.innerWidth) * 2 - 1;
    const mouseY = -(clientY / window.innerHeight) * 2 + 1;
    targetMousePos.set(mouseX * 50, 7, mouseY * -50);
  });

  /* ------------------------------ window resize ----------------------------- */
  $(window).on("resize", () => {
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

  $(window).on("click", (event) => {
    if (isModalVis && event.target.id === "infoScreen") {
      isModalVis = false;
      $("#infoScreen").css("display", "none");
      $("#info").html("info");
    }
  });

  $(window).one("click", () => {
    $("#mobileModal").css("display", "none");
  });

  $(window).on("touchstart", () => {
    $("#mobileModal").css("display", "none");
  });

  $("#infoContainer").on("click", function (event) {
    event.stopPropagation();
  });
});
