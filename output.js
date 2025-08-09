import * as THREE from 'https://unpkg.com/three@0.155.0/build/three.module.js';
import Peer from 'https://esm.sh/peerjs@1.5.2?target=es2020';

const OUTPUT_PEER_ID = 'three-output-001'; // <-- set this and remember it
const mount = document.getElementById('three-render');

// --- Three.js (your code) ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x202020);

const camera = new THREE.PerspectiveCamera(
  75, mount.clientWidth / mount.clientHeight, 0.1, 1000
);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(mount.clientWidth, mount.clientHeight);
mount.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x0000ff });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

window.addEventListener('resize', () => {
  renderer.setSize(mount.clientWidth, mount.clientHeight);
  camera.aspect = mount.clientWidth / mount.clientHeight;
  camera.updateProjectionMatrix();
});

function animate() {
  requestAnimationFrame(animate);
  // keep your spin if you want
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  renderer.render(scene, camera);
}
animate();

// --- PeerJS (host) ---
const peer = new Peer(OUTPUT_PEER_ID);

peer.on('open', id => {
  console.log('[OUTPUT] Peer open with id:', id);
});

peer.on('error', err => {
  console.error('[OUTPUT] Peer error:', err);
});

peer.on('connection', conn => {
  console.log('[OUTPUT] Got connection from', conn.peer);
  conn.on('data', msg => {
    // Expecting { x, y, z }
    if (msg && typeof msg === 'object') {
      if ('x' in msg) cube.position.x = Number(msg.x) || 0;
      if ('y' in msg) cube.position.y = Number(msg.y) || 0;
      if ('z' in msg) cube.position.z = Number(msg.z) || 0;
    }
  });
  conn.on('close', () => console.log('[OUTPUT] Connection closed'));
});