import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls";
import { GUI } from "dat.gui";

import atmosphere_vertex from "./shaders/atmosphere_vertex.glsl";
import atmosphere_fragment from "./shaders/atmosphere_fragment.glsl";
import scatter_vertex from "./shaders/scatter_vertex.glsl";
import scatter_fragment from "./shaders/scatter_fragment.glsl";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const default_values = {
	rayleighC: 0.0025,
	mieC: 0.001,
	g: -0.95,
	Isun: 20.0,
	radius: 5.0,
	wavelength: [0.65, 0.57, 0.475]
};

camera.position.set(0, 0, default_values.radius * 2.5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.minDistance = default_values.radius * 1.1;
controls.maxDistance = 300; // skybox radius

function makeXYZGUI(gui, vector3, name, onChangeFn) {
  const folder = gui.addFolder(name);
  folder.add(vector3, "x", -1, 1).onChange(onChangeFn);
  folder.add(vector3, "y", -1, 1).onChange(onChangeFn);
  folder.add(vector3, "z", -1, 1).onChange(onChangeFn);
  folder.open();
}

// Make Light Source
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 0, 0.5);
directionalLight.shadow.camera.right = 20;
directionalLight.shadow.camera.left = -20;
directionalLight.shadow.camera.top = 20;
directionalLight.shadow.camera.bottom = -20;
directionalLight.castShadow = true;
directionalLight.shadowCameraVisible = true;

scene.add(directionalLight);
const helper = new THREE.DirectionalLightHelper(directionalLight);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.05);
scene.add(ambientLight);

// Make Planet
const planetGeometry = new THREE.SphereGeometry(5.0, 100, 100);
const planetMaterial = new THREE.MeshPhongMaterial({
  map: new THREE.TextureLoader().load("./texture/planet.png"),
  normalMap: new THREE.TextureLoader().load("./texture/planet_normal.png"),
  normalScale: new THREE.Vector2(3, 3),
  displacementMap: new THREE.TextureLoader().load(
    "./texture/planet_displacement.png"
  ),
  displacementScale: 0.03,
});
const planetMesh = new THREE.Mesh(planetGeometry, planetMaterial);
scene.add(planetMesh);

// Add Cloud
const cloudGeometry = new THREE.SphereGeometry(5.0, 100, 100);
const cloudMaterial = new THREE.MeshPhongMaterial({
  map: new THREE.TextureLoader().load("./texture/planet_cloud.png"),
  displacementMap: new THREE.TextureLoader().load("./texture/planet_cloud.png"),
  displacementScale: 0.005,
  transparent: true,
});
const cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
scene.add(cloudMesh);

// Add Atmosphere Scattering (Outer ring - Halo)
const scatterGeometry = new THREE.SphereGeometry(5.125, 1000, 1000);
let scatterMaterial = new THREE.ShaderMaterial({
  vertexShader: scatter_vertex,
  fragmentShader: scatter_fragment,
  uniforms: {
    v3LightPos: new THREE.Uniform(directionalLight.position),
    Isun: { value: default_values.Isun },
    g: { value: default_values.g },
    wavelength: {
      value: new THREE.Vector3(
        1 / Math.pow(default_values.wavelength[0], 4),
        1 / Math.pow(default_values.wavelength[1], 4),
        1 / Math.pow(default_values.wavelength[2], 4)
      ),
    },
    radius: { value: default_values.radius },
    atmosphereHeight: { value: default_values.radius * 0.025 },
    rayleighC: { value: default_values.rayleighC },
    mieC: { value: default_values.mieC },
  },
  blending: THREE.AdditiveBlending,
  side: THREE.BackSide,
  transparent: true,
});
const scatterMesh = new THREE.Mesh(scatterGeometry, scatterMaterial);
scene.add(scatterMesh);

// Add Second Atmosphere (Blurry effects)
const atmosphereGeometry = new THREE.SphereGeometry(5.05, 100, 100);
let atmosphereMaterial = new THREE.ShaderMaterial({
  vertexShader: atmosphere_vertex,
  fragmentShader: atmosphere_fragment,
  uniforms: {
    planetCenter: new THREE.Uniform(planetMesh.position),
    planetRadius: new THREE.Uniform(5.0),
    atmosphereRadius: new THREE.Uniform(6.0),
    v3LightPos: new THREE.Uniform(directionalLight.position),
  },
  blending: THREE.AdditiveBlending,
  side: THREE.FrontSide,
  transparent: true,
});
const atmosphereMesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
scene.add(atmosphereMesh);

// Make a Moon
const moonGeometry = new THREE.SphereGeometry(0.8, 100, 100);
const moonMaterial = new THREE.MeshPhongMaterial({
  map: new THREE.TextureLoader().load("./texture/moon.png"),
  normalMap: new THREE.TextureLoader().load("./texture/moon_normal.png"),
  normalScale: new THREE.Vector2(3, 3),
  displacementMap: new THREE.TextureLoader().load(
    "./texture/moon_displacement.png"
  ),
  displacementScale: 0.01,
});
const moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);
moonMesh.position.set(9.5, 0, -0.5);

scene.add(moonMesh);

const moonObj = new THREE.Object3D();
moonObj.add(moonMesh);
scene.add(moonObj);

// Make Stars
const starGeometry = new THREE.SphereGeometry(300, 300, 300);
const starMaterial = new THREE.MeshBasicMaterial({
  map: new THREE.TextureLoader().load("./texture/stars.png"),
  side: THREE.BackSide,
});
const starsMesh = new THREE.Mesh(starGeometry, starMaterial);
scene.add(starsMesh);

const onChange = () => {
  directionalLight.target.updateMatrixWorld();
  helper.update();
  atmosphereMaterial.uniforms.v3LightPos.value = directionalLight.position;
  scatterMaterial.uniforms.v3LightPos.value = directionalLight.position;
};
onChange();

const gui = new GUI();
makeXYZGUI(gui, directionalLight.position, "light position", onChange);

scene.traverse(function (child) {
  if (child.isMesh) {
    child.castShadow = true;
    child.receiveShadow = true;
  }
});

function animate() {
  requestAnimationFrame(animate);

  planetMesh.rotateY(-0.001);
  cloudMesh.rotateY(-0.0015);
  moonMesh.rotateY(-0.003);
  moonObj.rotateY(0.001);

  renderer.render(scene, camera);
  controls.update();
}
animate();
