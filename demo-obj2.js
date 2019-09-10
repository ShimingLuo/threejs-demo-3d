import * as THREE from "./node_modules/three/build/three.module.js";

import { TrackballControls } from "./node_modules/three/examples/jsm/controls/TrackballControls.js";

import { MTLLoader } from "./node_modules/three/examples/jsm/loaders/MTLLoader.js";
import { OBJLoader2 } from "./node_modules/three/examples/jsm/loaders/OBJLoader2.js";
import { MtlObjBridge } from "./node_modules/three/examples/jsm/loaders/obj2/bridge/MtlObjBridge.js";

const OBJLoader2Example = function(elementToBindTo) {
  this.renderer = null;
  this.canvas = elementToBindTo;
  this.aspectRatio = 1;
  this.recalcAspectRatio();

  this.scene = null;
  this.cameraDefaults = {
    posCamera: new THREE.Vector3(0.0, 175.0, 500.0),
    posCameraTarget: new THREE.Vector3(0, 0, 0),
    near: 0.1,
    far: 10000,
    fov: 45
  };
  this.camera = null;
  this.cameraTarget = this.cameraDefaults.posCameraTarget;

  this.controls = null;
};

OBJLoader2Example.prototype = {
  constructor: OBJLoader2Example,

  initGL: function() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      autoClear: true
    });
    this.renderer.setClearColor(0x050505);

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      this.cameraDefaults.fov,
      this.aspectRatio,
      this.cameraDefaults.near,
      this.cameraDefaults.far
    );
    this.resetCamera();
    this.controls = new TrackballControls(
      this.camera,
      this.renderer.domElement
    );

    let ambientLight = new THREE.AmbientLight(0x404040);
    let directionalLight1 = new THREE.DirectionalLight(0xc0c090);
    let directionalLight2 = new THREE.DirectionalLight(0xc0c090);

    directionalLight1.position.set(-100, -50, 100);
    directionalLight2.position.set(100, 50, -100);

    this.scene.add(directionalLight1);
    this.scene.add(directionalLight2);
    this.scene.add(ambientLight);

    let helper = new THREE.GridHelper(1200, 60, 0xff4444, 0x404040);
    this.scene.add(helper);
  },

  initContent: function() {
    let modelName = "female02";
    this._reportProgress({ detail: { text: "Loading: " + modelName } });

    let scope = this;
    let objLoader2 = new OBJLoader2();
    let callbackOnLoad = function(object3d) {
      scope.scene.add(object3d);
      console.log("Loading complete: " + modelName);
      scope._reportProgress({ detail: { text: "" } });
    };

    let onLoadMtl = function(mtlParseResult) {
      objLoader2.setModelName(modelName);
      objLoader2.setLogging(true, true);
      objLoader2.addMaterials(
        MtlObjBridge.addMaterialsFromMtlLoader(mtlParseResult)
      );
      objLoader2.load(
        // "https://threejs.org/examples/models/obj/female02/female02.obj",
        // "./data/test5.obj",
        "./data/tudui.obj",
        callbackOnLoad,
        null,
        null,
        null
      );
    };
    let mtlLoader = new MTLLoader();
    // mtlLoader.load("https://threejs.org/examples/models/obj/female02/female02.mtl", onLoadMtl);
    mtlLoader.load("./data/tudui.mtl", onLoadMtl);
  },

  _reportProgress: function(event) {
    let output = "";
    if (
      event.detail !== null &&
      event.detail !== undefined &&
      event.detail.text
    ) {
      output = event.detail.text;
    }
    console.log("Progress: " + output);
    document.getElementById("feedback").innerHTML = output;
  },

  resizeDisplayGL: function() {
    this.controls.handleResize();

    this.recalcAspectRatio();
    this.renderer.setSize(
      this.canvas.offsetWidth,
      this.canvas.offsetHeight,
      false
    );

    this.updateCamera();
  },

  recalcAspectRatio: function() {
    this.aspectRatio =
      this.canvas.offsetHeight === 0
        ? 1
        : this.canvas.offsetWidth / this.canvas.offsetHeight;
  },

  resetCamera: function() {
    this.camera.position.copy(this.cameraDefaults.posCamera);
    this.cameraTarget.copy(this.cameraDefaults.posCameraTarget);

    this.updateCamera();
  },

  updateCamera: function() {
    this.camera.aspect = this.aspectRatio;
    this.camera.lookAt(this.cameraTarget);
    this.camera.updateProjectionMatrix();
  },

  render: function() {
    if (!this.renderer.autoClear) this.renderer.clear();
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
};

let app = new OBJLoader2Example(document.getElementById("example"));

let resizeWindow = function() {
  app.resizeDisplayGL();
};

let render = function() {
  requestAnimationFrame(render);
  app.render();
};

window.addEventListener("resize", resizeWindow, false);

console.log("Starting initialisation phase...");
app.initGL();
app.resizeDisplayGL();
app.initContent();

render();
