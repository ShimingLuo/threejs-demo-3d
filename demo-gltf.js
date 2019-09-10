import * as THREE from "../build/three.module.js";

import Stats from "./jsm/libs/stats.module.js";

import { OrbitControls } from "./jsm/controls/OrbitControls.js";
import { GLTFLoader } from "./jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "./jsm/loaders/RGBELoader.js";
import { EquirectangularToCubeGenerator } from "./jsm/loaders/EquirectangularToCubeGenerator.js";
import { PMREMGenerator } from "./jsm/pmrem/PMREMGenerator.js";
import { PMREMCubeUVPacker } from "./jsm/pmrem/PMREMCubeUVPacker.js";

var container, stats, controls;
var camera, scene, renderer;

init();
animate();

function init() {
  container = document.createElement("div");
  document.body.appendChild(container);

  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.25,
    20
  );
  camera.position.set(-1.8, 0.9, 2.7);

  scene = new THREE.Scene();

  new RGBELoader()
    .setDataType(THREE.UnsignedByteType)
    .setPath("textures/equirectangular/")
    .load("pedestrian_overpass_2k.hdr", function(texture) {
      var cubeGenerator = new EquirectangularToCubeGenerator(texture, {
        resolution: 1024
      });
      cubeGenerator.update(renderer);

      var pmremGenerator = new PMREMGenerator(
        cubeGenerator.renderTarget.texture
      );
      pmremGenerator.update(renderer);

      var pmremCubeUVPacker = new PMREMCubeUVPacker(pmremGenerator.cubeLods);
      pmremCubeUVPacker.update(renderer);

      var envMap = pmremCubeUVPacker.CubeUVRenderTarget.texture;

      // model

      var loader = new GLTFLoader().setPath("models/gltf/DamagedHelmet/glTF/");
      loader.load("DamagedHelmet.gltf", function(gltf) {
        gltf.scene.traverse(function(child) {
          if (child.isMesh) {
            child.material.envMap = envMap;
          }
        });

        scene.add(gltf.scene);
      });

      pmremGenerator.dispose();
      pmremCubeUVPacker.dispose();

      scene.background = cubeGenerator.renderTarget;
    });

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.gammaOutput = true;
  container.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, -0.2, -0.2);
  controls.update();

  window.addEventListener("resize", onWindowResize, false);

  // stats
  stats = new Stats();
  container.appendChild(stats.dom);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

//

function animate() {
  requestAnimationFrame(animate);

  renderer.render(scene, camera);

  stats.update();
}
