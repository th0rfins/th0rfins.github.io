import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/* ---------- helpers ---------- */
const $ = s => document.querySelector(s);
const toast = (msg) => {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 2200);
};

/* procedural planet texture (no external assets = Pages-friendly) */
function planetTexture(base, dark, light, bands = 5) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 256;
  const g = c.getContext('2d');
  const grad = g.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, light); grad.addColorStop(.5, base); grad.addColorStop(1, dark);
  g.fillStyle = grad; g.fillRect(0, 0, 512, 256);
  // horizontal bands
  for (let i = 0; i < bands; i++) {
    const y = Math.random() * 256;
    g.fillStyle = `rgba(255,255,255,${0.04 + Math.random() * 0.08})`;
    g.fillRect(0, y, 512, 4 + Math.random() * 18);
    g.fillStyle = `rgba(0,0,0,${0.05 + Math.random() * 0.1})`;
    g.fillRect(0, y + 14, 512, 3 + Math.random() * 12);
  }
  // speckles / craters
  for (let i = 0; i < 900; i++) {
    const x = Math.random() * 512, y = Math.random() * 256, r = Math.random() * 2.4;
    g.fillStyle = Math.random() > .5 ? 'rgba(255,255,255,.12)' : 'rgba(0,0,0,.16)';
    g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
function glowTexture(color) {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d');
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, color); gr.addColorStop(.35, color + 'aa'); gr.addColorStop(1, 'transparent');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

/* ---------- data ---------- */
const PLANETS = [
  { name:'PYRON',    tag:'LAVA WORLD',    color:'#ff6a3d', css:'radial-gradient(circle at 30% 30%,#ffd9a0,#ff6a3d 55%,#4d0d00)',
    size:1.1, dist:11, speed:.55, desc:'Dunia lava yang berputar cepat. Permukaannya retak magma — favorit para penambang helium-3.',
    temp:'482°C', day:'11 jam', moons:0 },
  { name:'AQUARIS',  tag:'OCEAN WORLD',   color:'#4de3ff', css:'radial-gradient(circle at 30% 30%,#d8fbff,#4de3ff 55%,#003a5c)',
    size:1.5, dist:16, speed:.38, desc:'95% lautan. Satu-satunya planet dengan sinyal radio alami misterius tiap 16 detik.',
    temp:'18°C', day:'24 jam', moons:2 },
  { name:'VERDANIA', tag:'JUNGLE WORLD',  color:'#5cff9d', css:'radial-gradient(circle at 30% 30%,#e2ffe9,#38d977 55%,#06351c)',
    size:1.7, dist:22, speed:.28, desc:'Hutan bioluminescent menutupi seluruh permukaan. Oksigen 34% — bawa masker.',
    temp:'26°C', day:'31 jam', moons:1 },
  { name:'KRONOS',   tag:'RINGED GIANT',  color:'#ffcf5c', css:'radial-gradient(circle at 30% 30%,#fff3cf,#ffcf5c 55%,#6b3d00)',
    size:2.6, dist:29, speed:.20, ring:true, desc:'Raksasa bercincin es setebal 280.000 km. Cincinnya terlihat dari teleskop rumahan.',
    temp:'-140°C', day:'10 jam', moons:14 },
  { name:'FROSTIS',  tag:'ICE WORLD',     color:'#b9c8ff', css:'radial-gradient(circle at 30% 30%,#ffffff,#9db4ff 55%,#1c2450)',
    size:1.3, dist:36, speed:.14, desc:'Badai nitrogen beku abadi. Jejak kaki di sini awet 10.000 tahun.',
    temp:'-210°C', day:'58 jam', moons:3 },
  { name:'EMBERIS',  tag:'EMBER DESERT',  color:'#ff6bd5', css:'radial-gradient(circle at 30% 30%,#ffd7f2,#ff6bd5 55%,#4d0036)',
    size:.9, dist:42, speed:.11, desc:'Gurun magnetik berwarna magenta. Kompas tidak berfungsi — navigasi pakai bintang.',
    temp:'88°C', day:'41 jam', moons:0 },
];

/* ---------- renderer / scene ---------- */
const canvas = $('#space');
const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x05060f);
scene.fog = new THREE.FogExp2(0x05060f, 0.0016);

const camera = new THREE.PerspectiveCamera(55, innerWidth/innerHeight, .1, 2000);
camera.position.set(0, 22, 58);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; controls.dampingFactor = .06;
controls.minDistance = 8; controls.maxDistance = 160;
controls.autoRotate = true; controls.autoRotateSpeed = .5;

/* lights */
const sunLight = new THREE.PointLight(0xfff2d9, 2600, 0, 1.8);
scene.add(sunLight);
const ambient = new THREE.AmbientLight(0x8899ff, .55);
scene.add(ambient);
const rim = new THREE.DirectionalLight(0x4de3ff, 1.2);
rim.position.set(-40, 20, -30); scene.add(rim);

/* ---------- sun ---------- */
const sun = new THREE.Mesh(
  new THREE.SphereGeometry(4.5, 64, 64),
  new THREE.MeshBasicMaterial({ map: planetTexture('#ffb347','#ff5e00','#fff3b0', 6) })
);
scene.add(sun);
const sunGlow = new THREE.Sprite(new THREE.SpriteMaterial({
  map: glowTexture('#ffaa33'), transparent:true, opacity:.95, depthWrite:false, blending:THREE.AdditiveBlending
}));
sunGlow.scale.setScalar(26); scene.add(sunGlow);
const sunGlow2 = new THREE.Sprite(new THREE.SpriteMaterial({
  map: glowTexture('#a06bff'), transparent:true, opacity:.35, depthWrite:false, blending:THREE.AdditiveBlending
}));
sunGlow2.scale.setScalar(48); scene.add(sunGlow2);

/* ---------- starfield ---------- */
function makeStars(n, rMin, rMax, size, color) {
  const pos = new Float32Array(n*3), col = new Float32Array(n*3);
  const c = new THREE.Color(color);
  for (let i=0;i<n;i++){
    const r = rMin + Math.random()*(rMax-rMin);
    const th = Math.random()*Math.PI*2, ph = Math.acos(2*Math.random()-1);
    pos[i*3]=r*Math.sin(ph)*Math.cos(th); pos[i*3+1]=r*Math.cos(ph); pos[i*3+2]=r*Math.sin(ph)*Math.sin(th);
    const v = .5+Math.random()*.5;
    col[i*3]=c.r*v; col[i*3+1]=c.g*v; col[i*3+2]=c.b*v;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos,3));
  geo.setAttribute('color', new THREE.BufferAttribute(col,3));
  return new THREE.Points(geo, new THREE.PointsMaterial({
    size, vertexColors:true, transparent:true, opacity:.9, depthWrite:false, blending:THREE.AdditiveBlending
  }));
}
const stars1 = makeStars(2200, 120, 700, 1.6, '#cfe8ff');
const stars2 = makeStars(500, 100, 600, 2.8, '#ffd7f2');
scene.add(stars1, stars2);

/* shooting stars */
const meteors = [];
function spawnMeteor() {
  const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3(-14,-7,0)]);
  const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color:0x9be9ff, transparent:true, opacity:0 }));
  line.position.set((Math.random()-.5)*160, 40+Math.random()*60, -60-Math.random()*80);
  line.userData = { life:0 };
  scene.add(line); meteors.push(line);
  setTimeout(spawnMeteor, 2500 + Math.random()*5000);
}
setTimeout(spawnMeteor, 2000);

/* ---------- planets, orbits, labels, trails ---------- */
const system = new THREE.Group(); scene.add(system);
const bodies = [];   // {data, mesh, angle, pivot, trail, trailLine}
const labelLayer = document.createElement('div');
labelLayer.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:3;overflow:hidden';
document.body.appendChild(labelLayer);

const orbitGroup = new THREE.Group(); scene.add(orbitGroup);

PLANETS.forEach((p) => {
  const pivot = new THREE.Group(); system.add(pivot);
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(p.size, 48, 48),
    new THREE.MeshStandardMaterial({
      map: planetTexture(p.color, '#0a0a18', '#ffffff', 6),
      roughness:.85, metalness:.15
    })
  );
  // tint map toward planet color
  mesh.material.color.set(p.color).lerp(new THREE.Color('#ffffff'), .45);
  mesh.position.x = p.dist;
  mesh.userData.planet = p;
  pivot.add(mesh);

  // orbit ring
  const seg = 128, pts = [];
  for (let i=0;i<=seg;i++){ const a=i/seg*Math.PI*2; pts.push(new THREE.Vector3(Math.cos(a)*p.dist,0,Math.sin(a)*p.dist)); }
  const orbit = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(pts),
    new THREE.LineBasicMaterial({ color:0x4de3ff, transparent:true, opacity:.22 })
  );
  orbitGroup.add(orbit);

  // saturn ring
  if (p.ring) {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(p.size*1.4, p.size*2.3, 64),
      new THREE.MeshBasicMaterial({ color:0xffdf9e, transparent:true, opacity:.55, side:THREE.DoubleSide })
    );
    ring.rotation.x = Math.PI/2.4; mesh.add(ring);
  }

  // moons (simple)
  if (p.moons > 0) {
    const n = Math.min(p.moons, 2);
    for (let i=0;i<n;i++){
      const m = new THREE.Mesh(new THREE.SphereGeometry(.22,16,16),
        new THREE.MeshStandardMaterial({ color:0xdde6ff, roughness:.9 }));
      m.position.set(2.4+i*1.1, .6, 0);
      mesh.add(m);
    }
  }

  // glow sprite
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTexture(p.color), transparent:true, opacity:.5, depthWrite:false, blending:THREE.AdditiveBlending }));
  glow.scale.setScalar(p.size*5); mesh.add(glow);

  // label
  const label = document.createElement('div');
  label.className = 'planet-label';
  label.textContent = p.name;
  label.style.cssText = `position:absolute;font:700 10px JetBrains Mono,monospace;letter-spacing:.25em;`+
    `color:${p.color};text-shadow:0 0 12px ${p.color};transform:translate(-50%,-140%);white-space:nowrap;`;
  labelLayer.appendChild(label);

  // trail
  const trailMax = 90;
  const trailGeo = new THREE.BufferGeometry();
  trailGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(trailMax*3),3));
  const trailLine = new THREE.Line(trailGeo, new THREE.LineBasicMaterial({ color:new THREE.Color(p.color), transparent:true, opacity:.5 }));
  trailLine.visible = false; trailLine.frustumCulled = false;
  scene.add(trailLine);

  bodies.push({ data:p, mesh, pivot, angle:Math.random()*Math.PI*2, label, trail:[], trailLine, trailMax });
});

/* ---------- asteroid belt ---------- */
const AST_N = 1200;
const astGeo = new THREE.IcosahedronGeometry(.16, 0);
const astMat = new THREE.MeshStandardMaterial({ color:0x9aa7c7, roughness:1 });
const belt = new THREE.InstancedMesh(astGeo, astMat, AST_N);
{
  const d = new THREE.Object3D();
  for (let i=0;i<AST_N;i++){
    const a = Math.random()*Math.PI*2, r = 25.2 + Math.random()*2.6;
    d.position.set(Math.cos(a)*r, (Math.random()-.5)*1.6, Math.sin(a)*r);
    d.rotation.set(Math.random()*6,Math.random()*6,Math.random()*6);
    const s = .4+Math.random()*1.4; d.scale.setScalar(s);
    d.updateMatrix(); belt.setMatrixAt(i, d.matrix);
  }
}
scene.add(belt);
$('#statAsteroids').textContent = AST_N.toLocaleString('id-ID');

/* ---------- interaction: select / dossier / cards ---------- */
const ray = new THREE.Raycaster();
const ptr = new THREE.Vector2();
let selected = null, timeScale = 1, paused = false;

function selectPlanet(body) {
  selected = body;
  if (!body) { $('#dossier').classList.add('hidden'); controls.autoRotate = true; return; }
  const p = body.data;
  $('#dossierDot').style.background = p.css;
  $('#dossierName').textContent = p.name;
  $('#dossierTag').textContent = '◆ ' + p.tag;
  $('#dossierDesc').textContent = p.desc;
  $('#dossierDist').textContent = (p.dist*12.4).toFixed(1) + ' jt km';
  $('#dossierTemp').textContent = p.temp;
  $('#dossierDay').textContent = p.day;
  $('#dossierMoons').textContent = p.moons + ' bulan';
  $('#dossier').classList.remove('hidden');
  controls.autoRotate = false;
  toast('◉ Locked → ' + p.name);
}
$('#closeDossier').onclick = () => selectPlanet(null);

let downAt = 0;
renderer.domElement.addEventListener('pointerdown', () => downAt = Date.now());
renderer.domElement.addEventListener('pointerup', (e) => {
  if (Date.now() - downAt > 250) return; // it was a drag
  ptr.x = (e.clientX/innerWidth)*2-1; ptr.y = -(e.clientY/innerHeight)*2+1;
  ray.setFromCamera(ptr, camera);
  const hits = ray.intersectObjects(bodies.map(b=>b.mesh));
  selectPlanet(hits.length ? bodies.find(b=>b.mesh===hits[0].object) : null);
});

/* cards */
const cardsEl = $('#cards');
PLANETS.forEach((p) => {
  const b = document.createElement('button');
  b.className = 'card';
  b.innerHTML = `<div class="dot" style="background:${p.css};box-shadow:0 0 18px ${p.color}"></div>
    <small>${p.tag}</small><h3>${p.name}</h3><p>${p.desc}</p>
    <div class="meta"><span>${p.temp}</span><span>${p.moons} moons</span></div>`;
  b.onclick = () => {
    const body = bodies.find(x=>x.data.name===p.name);
    selectPlanet(body);
    document.getElementById('explorer').scrollIntoView({ behavior:'smooth' });
  };
  cardsEl.appendChild(b);
});
$('#statBodies').textContent = PLANETS.length + 1;

/* ---------- control bar ---------- */
$('#pauseBtn').onclick = (e) => {
  paused = !paused;
  e.target.textContent = paused ? '▶ Resume' : '⏸ Pause';
  e.target.classList.toggle('active', paused);
};
$('#orbitBtn').onclick = (e) => {
  orbitGroup.visible = !orbitGroup.visible;
  e.target.textContent = `◎ Orbits: ${orbitGroup.visible?'ON':'OFF'}`;
  e.target.classList.toggle('active', orbitGroup.visible);
};
let labelsOn = true;
$('#labelBtn').onclick = (e) => {
  labelsOn = !labelsOn;
  labelLayer.style.display = labelsOn ? 'block' : 'none';
  e.target.textContent = `🏷 Labels: ${labelsOn?'ON':'OFF'}`;
  e.target.classList.toggle('active', labelsOn);
};
let trailsOn = false;
$('#trailBtn').onclick = (e) => {
  trailsOn = !trailsOn;
  bodies.forEach(b=>{ b.trailLine.visible = trailsOn; if(!trailsOn) b.trail.length = 0; });
  e.target.textContent = `✦ Trails: ${trailsOn?'ON':'OFF'}`;
  e.target.classList.toggle('active', trailsOn);
};
$('#speed').oninput = (e) => {
  timeScale = e.target.value/100;
  $('#speedVal').textContent = timeScale.toFixed(1)+'×';
  $('#statSpeed').textContent = timeScale.toFixed(1)+'×';
};
$('#resetBtn').onclick = () => {
  selectPlanet(null);
  camera.position.set(0,22,58); controls.target.set(0,0,0);
  toast('⟲ Camera reset');
};
$('#warpBtn').onclick = () => {
  const prev = timeScale;
  timeScale = 8; $('#speed').value = 800;
  $('#speedVal').textContent = '8.0×'; $('#statSpeed').textContent = '8.0×';
  camera.fov = 75; camera.updateProjectionMatrix();
  toast('⚡ WARP SPEED ENGAGED');
  setTimeout(()=>{ timeScale = prev; $('#speed').value = prev*100;
    $('#speedVal').textContent = prev.toFixed(1)+'×'; $('#statSpeed').textContent = prev.toFixed(1)+'×';
    camera.fov = 55; camera.updateProjectionMatrix();
  }, 2600);
};

/* day / night */
const themeBtn = $('#themeBtn');
function setTheme(t) {
  document.body.dataset.theme = t;
  themeBtn.textContent = t === 'night' ? '☾' : '☀';
  if (t === 'day') { scene.background.set(0x0a1230); ambient.intensity = 1.1; rim.intensity = 2; }
  else { scene.background.set(0x05060f); ambient.intensity = .55; rim.intensity = 1.2; }
  toast(t === 'day' ? '☀ Day side — nebula terang' : '☾ Night side — bintang maksimal');
}
themeBtn.onclick = () => setTheme(document.body.dataset.theme === 'night' ? 'day' : 'night');

/* clock */
setInterval(()=>{ $('#clock').textContent = new Date().toLocaleTimeString('id-ID'); }, 1000);

/* ---------- animate ---------- */
const clock = new THREE.Clock();
let frames = 0, fpsT = 0;
const tmpV = new THREE.Vector3();

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), .05);
  const t = clock.elapsedTime;

  // fps
  frames++; fpsT += dt;
  if (fpsT >= .5) { $('#statFps').textContent = Math.round(frames/fpsT); frames = 0; fpsT = 0; }

  if (!paused) {
    sun.rotation.y += dt*.1;
    sunGlow.material.opacity = .85 + Math.sin(t*2)*.1;
    stars1.rotation.y += dt*.004; stars2.rotation.y -= dt*.003;
    belt.rotation.y += dt*.05*timeScale;

    bodies.forEach((b) => {
      b.angle += dt * b.data.speed * .35 * timeScale;
      const x = Math.cos(b.angle)*b.data.dist, z = Math.sin(b.angle)*b.data.dist;
      b.mesh.position.set(x, Math.sin(t*.8 + b.data.dist)*.35, z);
      b.mesh.rotation.y += dt*(.4+timeScale*.3);
      b.mesh.getWorldPosition(tmpV);

      if (trailsOn) {
        b.trail.push(tmpV.x, tmpV.y, tmpV.z);
        if (b.trail.length > b.trailMax*3) b.trail.splice(0, 3);
        const pos = b.trailLine.geometry.attributes.position;
        for (let i=0;i<b.trail.length/3;i++){
          pos.setXYZ(i, b.trail[i*3], b.trail[i*3+1], b.trail[i*3+2]);
        }
        b.trailLine.geometry.setDrawRange(0, b.trail.length/3);
        pos.needsUpdate = true;
      }
    });

    // meteors
    for (let i=meteors.length-1;i>=0;i--){
      const m = meteors[i];
      m.userData.life += dt;
      const L = m.userData.life;
      m.position.x -= dt*90; m.position.y -= dt*45;
      m.material.opacity = L < .15 ? L/.15 : Math.max(0, 1-(L-.15)/.8);
      if (L > 1) { scene.remove(m); m.geometry.dispose(); m.material.dispose(); meteors.splice(i,1); }
    }
  }

  // camera follow selected
  if (selected) {
    selected.mesh.getWorldPosition(tmpV);
    controls.target.lerp(tmpV, .08);
    const want = tmpV.clone().add(new THREE.Vector3(selected.data.size*4+6, selected.data.size*2+3, selected.data.size*4+8));
    camera.position.lerp(want, .04);
  } else {
    controls.target.lerp(new THREE.Vector3(0,0,0), .05);
  }
  controls.update();

  // labels projection
  if (labelsOn) {
    bodies.forEach((b) => {
      b.mesh.getWorldPosition(tmpV); tmpV.y += b.data.size + 1;
      tmpV.project(camera);
      const vis = tmpV.z < 1;
      b.label.style.display = vis ? 'block' : 'none';
      if (vis) {
        b.label.style.left = ((tmpV.x*.5+.5)*innerWidth)+'px';
        b.label.style.top = ((-tmpV.y*.5+.5)*innerHeight)+'px';
      }
    });
  }

  renderer.render(scene, camera);
}
animate();

addEventListener('resize', () => {
  camera.aspect = innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

/* loader out */
requestAnimationFrame(() => requestAnimationFrame(() => {
  setTimeout(()=> $('#loader').classList.add('done'), 500);
}));
toast('🪐 Selamat datang di ORBITAL — klik planet!');
