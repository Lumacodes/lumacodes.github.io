import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js';

const canvas = document.getElementById('hero-canvas');
if (!canvas || !window.WebGLRenderingContext) return;

try {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true
  });
  renderer.setPixelRatio(window.devicePixelRatio || 1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0.45, 2.1);

  // Lights
  const d1 = new THREE.DirectionalLight(0xffffff, 1.1);
  d1.position.set(2, 2, 2);
  const d2 = new THREE.DirectionalLight(0xffffff, 0.5);
  d2.position.set(-2, -1, 1);
  const amb = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(d1, d2, amb);

  // Geometry + material
  const geo = new THREE.IcosahedronGeometry(0.9, 5);
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0xeceff1,
    metalness: 0.85,
    roughness: 0.12,
    transmission: 0.6,
    thickness: 0.6,
    clearcoat: 1,
    clearcoatRoughness: 0.02
  });
  const orb = new THREE.Mesh(geo, mat);
  scene.add(orb);

  // Base positions
  const pos = geo.attributes.position;
  const base = pos.array.slice();
  let t = 0;
  const tmp = new THREE.Vector3();

  // Controls
  const controls = new OrbitControls(camera, canvas);
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.45;
  controls.rotateSpeed = 0.6;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(200, rect.width);
    const h = Math.max(200, rect.height);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  const ro = new ResizeObserver(resize);
  ro.observe(canvas.parentElement);
  resize();

  function animate() {
    t += 0.004;
    for (let i = 0; i < pos.count; i++) {
      tmp.fromBufferAttribute(pos, i).normalize();
      const k = 0.028 * Math.sin(t + i * 0.12);
      pos.setXYZ(i, base[i * 3] + tmp.x * k, base[i * 3 + 1] + tmp.y * k, base[i * 3 + 2] + tmp.z * k);
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();

  // Click morph
  canvas.addEventListener('click', () => {
    const h = (performance.now() / 60) % 360;
    mat.color.setHSL(h / 360, 0.6, 0.6);
  });

  // Konami code easter egg
  const seq = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  let idx = 0;
  window.addEventListener('keydown', e => {
    idx = (e.key === seq[idx]) ? idx + 1 : 0;
    if (idx === seq.length) {
      gsap.to(orb.rotation, {
        x: '+=6.283',
        y: '+=6.283',
        duration: 1.6,
        ease: 'power3.inOut'
      });
      idx = 0;
    }
  });
} catch (e) {
  console.error('Three.js error:', e);
}
