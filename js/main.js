
(function() {
  var LENGTH = 120;
  var CAMERA_PADDING = 20;
  var GROWTH_RATE = 30;
  var LIGHT_RANGE = LENGTH;
  var LIMIT = 200;
  var easings = [
    TWEEN.Easing.Linear.None,
    TWEEN.Easing.Quadratic.Out,
    TWEEN.Easing.Cubic.Out
  ];

  var renderer = new THREE.WebGLRenderer({
    antialias: true
  });
  renderer.setClearColor(0x000000);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  var scene = new THREE.Scene();
  window.scene = scene;

  scene.fog = new THREE.Fog(0x000000, 10, LENGTH * 3);

  var cameraParent = new THREE.Object3D();
  var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, LENGTH * 5);
  camera.position.set(0, 10, 20);
  camera.rotation.x = -0.3;
  camera._doTween = function () {
    var duration = 90000 * Math.random() + 30000;
    var pto = { x: rr(LENGTH - CAMERA_PADDING), y: Math.random() * 120, z: rr(LENGTH - CAMERA_PADDING) };
    new TWEEN.Tween(camera.position).to(pto, duration).easing(TWEEN.Easing.Quadratic.InOut).start().onComplete(function () {
      camera._doTween();
    });

    var rto = { y: rr(Math.PI * 2) };
    new TWEEN.Tween(cameraParent.rotation).to(rto, duration).start();

    var cprto = { x: Math.random() * -0.6, z: rr(0.01) };
    new TWEEN.Tween(camera.rotation).to(cprto, duration).start();
  };
  camera._doTween();
  cameraParent.add(camera);
  scene.add(cameraParent);

  var container = document.body;
  container.appendChild(renderer.domElement);

  window.addEventListener('resize', resize);
  resize();

  var pillars = [];
  var lights = [];
  var frames = 0;

  makeLights();
  makeGrid();
  makeGround();
  for (var i = 0; i < 20; i++) makePillar();
  renderer.render(scene, camera);
  start();

  function resize () {
    var s = { w: window.innerWidth, h: window.innerHeight };

    renderer.setSize(s.w, s.h);

    camera.aspect = s.w / s.h;
    camera.updateProjectionMatrix();
  }

  function start () {
    update();
  }

  function update (time) {
    frames += 1;
    if (frames % GROWTH_RATE === 0) {
      makePillar();
      if (pillars.length > LIMIT) {
        removePillar();
      }
    }

    TWEEN.update(time);
    renderer.render(scene, camera);

    window.requestAnimationFrame(update);
  }

  function makeGrid () {
    var gridLength = LENGTH + 10;

    var floorGrid = new THREE.GridHelper(gridLength, 50, 0x888888);
    floorGrid.position.y = 1.1;
    scene.add(floorGrid);

    var wallGrid1 = new THREE.GridHelper(gridLength, 20, 0x444444, 0x444444);
    wallGrid1.rotation.x = Math.PI / 2;
    wallGrid1.position.set(0, gridLength, gridLength);
    scene.add(wallGrid1);

    var wallGrid2 = new THREE.GridHelper(gridLength, 20, 0x444444, 0x444444);
    wallGrid2.rotation.x = Math.PI / 2;
    wallGrid2.position.set(0, gridLength, -gridLength);
    scene.add(wallGrid2);

    var wallGrid3 = new THREE.GridHelper(gridLength, 20, 0x444444, 0x444444);
    wallGrid3.rotation.z = Math.PI / 2;
    wallGrid3.position.set(gridLength, gridLength, 0);
    scene.add(wallGrid3);

    var wallGrid4 = new THREE.GridHelper(gridLength, 20, 0x444444, 0x444444);
    wallGrid4.rotation.z = Math.PI / 2;
    wallGrid4.position.set(-gridLength, gridLength, 0);
    scene.add(wallGrid4);
  }

  function makeGround () {
    var geometry = new THREE.BoxBufferGeometry(LENGTH * 2, 1, LENGTH * 2);
    var material = new THREE.MeshStandardMaterial({
  		roughness: 0.5,
  		metalness: 0.05,
  		color: 0xffffff
  	});
    var mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = 0.5;
    mesh.receiveShadow = true;
    scene.add(mesh);
  }

  function makePillar () {
    var l = Math.random() * 2.5 + 0.5;
    var geometry = new THREE.BoxBufferGeometry(l, 1, l);
  	var material = new THREE.MeshStandardMaterial({
  		roughness: 0.35,
  		metalness: 1.0,
  		color: 0xffffff
  	});
  	var mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(rr(LENGTH), 0, rr(LENGTH));
  	mesh.castShadow = true;

  	pillars.push(mesh);
  	scene.add(mesh);

    var y = Math.random() * Math.random() * 300 + 10;
    var duration = Math.random() * 8000 + 2000;
    var easing = easings[Math.floor(easings.length * Math.random())];
    mesh._growthTween = new TWEEN.Tween(mesh.scale).to({ y: y }, duration).easing(easing).start().onUpdate(function () {
      mesh.position.y = mesh.scale.y / 2;
    });
  }

  function removePillar () {
    var mesh = pillars.shift();
    if (mesh._growthTween) {
      mesh._growthTween.stop();
    }

    var duration = Math.random() * 2000 + 1000;
    new TWEEN.Tween(mesh.scale).to({ y: 0 }, duration).start().onUpdate(function () {
      mesh.position.y = mesh.scale.y / 2;
    }).onComplete(function () {
      scene.remove(mesh);
    });
  }

  function makeLights () {
    lights = [
      new THREE.PointLight(0xff0000, 1.0, LENGTH * 0.75, 4),
      new THREE.PointLight(0x0000ff, 1.0, LENGTH * 0.75, 4),
      new THREE.PointLight(0xff0000, 1.0, LENGTH * 0.75, 4),
      new THREE.PointLight(0x0000ff, 1.0, LENGTH * 0.75, 4),
      new THREE.PointLight(0xff0000, 1.0, LENGTH * 0.75, 4),
      new THREE.PointLight(0x0000ff, 1.0, LENGTH * 0.75, 4),
      new THREE.PointLight(0xff0000, 0.75, LENGTH, 2),
      new THREE.PointLight(0x0000ff, 0.75, LENGTH, 2),
      new THREE.PointLight(0xff0000, 0.75, LENGTH, 2),
      new THREE.PointLight(0x0000ff, 0.75, LENGTH, 2),
      new THREE.PointLight(0xff0000, 0.75, LENGTH, 2),
    ];

    lights.forEach(function (light) {
      light._doPTween = function () {
        var duration = Math.random() * 60000 + 30000;
        var to = { x: rr(LIGHT_RANGE), y: Math.pow(Math.random(), 1.5)  * 140, z: rr(LIGHT_RANGE) };
        light._pTween = new TWEEN.Tween(light.position).to(to, duration).start().onComplete(function() {
          light._doPTween();
        });
      };

      light.position.set(rr(LIGHT_RANGE), Math.random() * 80, rr(LIGHT_RANGE));
      light._doPTween();
      light.castShadow = true;

      scene.add(light);
    });
  }

  function rr (range) {
    return (Math.random() - 0.5) * range * 2;
  }
})();
