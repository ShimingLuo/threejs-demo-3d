import * as THREE from "./node_modules/three/build/three.module.js";

import Stats from "./node_modules/three/examples/jsm/libs/stats.module.js";
import { GUI } from './node_modules/three/examples/jsm/libs/dat.gui.module.js';

import { TrackballControls } from "./node_modules/three/examples/jsm/controls/TrackballControls.js";
import { OBJLoader } from "./node_modules/three/examples/jsm/loaders/OBJLoader.js";

var container, stats;

var camera, controls, scene, renderer;

let modShape, factShape;

let params = {
  'offset': -60,
  '设计模型': false,
  '扫描成果模型': false,
  '模型计算': false
}

let _data = {
  modData:{
    m2: 2995.94,
    m3: 9154.61,
    center: [-5.966, -1.863, 0.534],
    size: {
      x: 77.88,
      y: 48.64,
      z: 13.708
    }
  },
  fatData:{
    m2: 3308.62,
    m3: 9356.11,
    center: [-6.62, -1.855, 0.793],
    size: {
      x: 77.88,
      y: 48.5,
      z: 20.354
    }
  },
  subsData: {
    m2: 312.68,
    m3: 201.50
  }
}

init();
animate();

function init() {
  camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.01, 1e10 );
  camera.position.z = 60;// 高
  camera.position.x = 40;
  camera.position.y = 60;

  scene = new THREE.Scene();

  scene.add(camera);

  // light
  var dirLight = new THREE.DirectionalLight(0xffffff);
  dirLight.position.set(200, 200, 1000).normalize();

  camera.add(dirLight);
  camera.add(dirLight.target);

  // helper
  var helper = new THREE.GridHelper( 1000, 300, 0x0000ff, 0x808080 );
  scene.add( helper );

  // obj 加载器
  var objLoader = new OBJLoader();
  //
  objLoader.load(
    "./data/tudui_gai.obj",
    function(obj) {
      var material = new THREE.MeshLambertMaterial({
        color: 0x5C3A21
      });
      obj.traverse( function (child) {
        if ( child instanceof THREE.Mesh ) {
          // child.material.map = THREE.ImageUtils.loadTexture( './data/timg.jpg');
          // child.material.needsUpdate = true;
          child.material = new THREE.MeshLambertMaterial({
            side: THREE.DoubleSide,
            color: 0xff6600
          });
          // child.geometry.computeFaceNormals();
          child.geometry.computeVertexNormals();
          child.material.shading = THREE.SmoothShading;
        }
      });
      // geometry is a group of children. If a child has one additional child it's probably a mesh
      obj.children.forEach(function (child) {
        if (child.children.length == 1) {
          if (child.children[0] instanceof THREE.Mesh) {
            child.children[0].material = material;
          }
        }
      });
      // obj.position.set(-0.075, 0.005, 0);
      obj.position.z = params.offset || 0
      factShape = obj
      scene.add(obj);
    },
    function(xhr) {},
    function() {}
  );
  objLoader.load(
    "./data/tudui.obj",
    function(obj) {
      var material = new THREE.MeshLambertMaterial({
        color: 0x5C3A21,
        side: THREE.DoubleSide
      });
      obj.traverse( function (child) {
        if ( child instanceof THREE.Mesh ) {
          child.material.map = THREE.ImageUtils.loadTexture( './data/tudui.jpg');
          child.material.needsUpdate = true;
          child.material.side = THREE.DoubleSide;
          child.geometry.computeVertexNormals();
        }
      });
      // geometry is a group of children. If a child has one additional child it's probably a mesh
      obj.children.forEach(function (child) {
        if (child.children.length == 1) {
          if (child.children[0] instanceof THREE.Mesh) {
            child.children[0].material = material;
          }
        }
      });
      modShape = obj
      obj.position.y = 0.18
      scene.add(obj);
    },
    function(xhr) {},
    function() {}
  );
  


  // renderer 渲染器
  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  // DOM容器
  container = document.createElement("div");
  document.body.appendChild(container);
  container.appendChild(renderer.domElement);

  // controls 控制器
  controls = new TrackballControls(camera, renderer.domElement);
  controls.rotateSpeed = 5.0;
  controls.zoomSpeed = 5;
  controls.panSpeed = 2;
  controls.noZoom = false;
  controls.noPan = false;
  controls.staticMoving = true;
  controls.dynamicDampingFactor = 0.3;

  // cpu 状态控制器
  stats = new Stats();
  stats.dom.style.top = 'unset';
  stats.dom.style.left = 'unset';
  stats.dom.style.bottom = 0;
  stats.dom.style.right = 0;
  container.appendChild(stats.dom);

  // 变化
  window.addEventListener("resize", onWindowResize, false);

  // 控制参数
  let gui = new GUI();
  gui.add( params, '设计模型' );
  gui.add( params, '扫描成果模型' );
  gui.add( params, '模型计算' );
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

  controls.handleResize();
}

let offset = params.offset || 60, mod_animo = false, fat_animo = false;
function changePars() {
  let mod = params['设计模型'], scan = params['扫描成果模型'], calc = params['模型计算'];
  if(modShape && mod) {
    $('#info .info-mod').show()
  } else {
    $('#info .info-mod').hide()
    $('#info .info-sub').hide()
  }
  if(factShape && scan) {
    $('#info .info-fat').show()
  } else {
    $('#info .info-fat').hide()
    $('#info .info-sub').hide()
  }
  if(modShape && factShape) {
    modShape.visible = mod;
    factShape.visible = scan;
    let z = factShape.position.z;
    if(z !== 0) {
      if(mod && scan && calc) {
        if(z > 0) {
          factShape.position.z = z - 0.5;
        } else if(z < 0) {
          factShape.position.z = z + 0.5;
        } else {
          factShape.position.z = 0;
        }
        $('#info .info-sub').show();
      } else {
        $('#info .info-sub').hide();
      }
    } else if(!calc) {
      factShape.position.z = offset;
      $('#info .info-sub').hide();
    }
  }
}

function animate() {
  requestAnimationFrame(animate);

  controls.update();
  renderer.render(scene, camera);

  // var time = Date.now();
  changePars();

  stats.update();
}
