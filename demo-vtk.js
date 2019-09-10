import * as THREE from "./node_modules/three/build/three.module.js";

import Stats from "./node_modules/three/examples/jsm/libs/stats.module.js";

import { TrackballControls } from "./node_modules/three/examples/jsm/controls/TrackballControls.js";
import { VTKLoader } from "./node_modules/three/examples/jsm/loaders/VTKLoader.js";

var container, stats;

var camera, controls, scene, renderer;

init();
animate();

function init() {
  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.01,
    1e10
  );
  camera.position.z = 0.2;

  scene = new THREE.Scene();

  scene.add(camera);

  // light

  var dirLight = new THREE.DirectionalLight(0xffffff);
  dirLight.position.set(200, 200, 1000).normalize();

  camera.add(dirLight);
  camera.add(dirLight.target);

  var material = new THREE.MeshLambertMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide
  });

  var loader = new VTKLoader();
  loader.load("https://threejs.org/examples/models/vtk/bunny.vtk", function(geometry) {
    geometry.center();
    geometry.computeVertexNormals();

    var mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(-0.075, 0.005, 0);
    mesh.scale.multiplyScalar(0.2);
    scene.add(mesh);
  });

  // var loader1 = new VTKLoader();
  // loader1.load("./data/bunny.vtk", function(geometry) {
  //   console.log(geometry)
  //   geometry.center();
  //   geometry.computeVertexNormals();

  //   var mesh = new THREE.Mesh(geometry, material);
  //   // mesh.position.set(-0.075, 0.005, 0);
  //   mesh.scale.multiplyScalar(0.2);
  //   scene.add(mesh);
  // });

  // var loader1 = new VTKLoader();
  // loader1.load("https://threejs.org/examples/models/vtk/cube_ascii.vtp", function(geometry) {
  //   geometry.computeVertexNormals();
  //   geometry.center();

  //   var material = new THREE.MeshLambertMaterial({
  //     color: 0x00ff00,
  //     side: THREE.DoubleSide
  //   });
  //   var mesh = new THREE.Mesh(geometry, material);

  //   mesh.position.set(-0.025, 0, 0);
  //   mesh.scale.multiplyScalar(0.01);

  //   scene.add(mesh);
  // });

  // var loader2 = new VTKLoader();
  // loader2.load("https://threejs.org/examples/models/vtk/cube_binary.vtp", function(geometry) {
  //   geometry.computeVertexNormals();
  //   geometry.center();

  //   var material = new THREE.MeshLambertMaterial({
  //     color: 0x0000ff,
  //     side: THREE.DoubleSide
  //   });
  //   var mesh = new THREE.Mesh(geometry, material);

  //   mesh.position.set(0.025, 0, 0);
  //   mesh.scale.multiplyScalar(0.01);

  //   scene.add(mesh);
  // });

  // var loader3 = new VTKLoader();
  // loader3.load("https://threejs.org/examples/models/vtk/cube_no_compression.vtp", function(geometry) {
  //   geometry.computeVertexNormals();
  //   geometry.center();

  //   var material = new THREE.MeshLambertMaterial({
  //     color: 0xff0000,
  //     side: THREE.DoubleSide
  //   });
  //   var mesh = new THREE.Mesh(geometry, material);

  //   mesh.position.set(0.075, 0, 0);
  //   mesh.scale.multiplyScalar(0.01);

  //   scene.add(mesh);
  // });

  // renderer

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  container = document.createElement("div");
  document.body.appendChild(container);
  container.appendChild(renderer.domElement);

  // controls

  controls = new TrackballControls(camera, renderer.domElement);

  controls.rotateSpeed = 5.0;
  controls.zoomSpeed = 5;
  controls.panSpeed = 2;

  controls.noZoom = false;
  controls.noPan = false;

  controls.staticMoving = true;
  controls.dynamicDampingFactor = 0.3;

  stats = new Stats();
  container.appendChild(stats.dom);

  //

  window.addEventListener("resize", onWindowResize, false);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

  controls.handleResize();
}

function animate() {
  requestAnimationFrame(animate);

  controls.update();
  renderer.render(scene, camera);

  stats.update();
}
