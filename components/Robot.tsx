'use client';

import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

/** A locally generated, articulated model: no external model or texture downloads. */
export default function Robot() {
  const host = useRef<HTMLDivElement>(null);
  const waveStarted = useRef(0);
  const turn = useRef(0);
  const drag = useRef<{ x: number; turn: number } | null>(null);
  const reducedMotion = useReducedMotion();
  const [ready, setReady] = useState(false);
  const [waving, setWaving] = useState(false);

  useEffect(() => {
    const container = host.current;
    if (!container) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch {
      return; // The accessible SVG illustration stays visible without WebGL.
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.domElement.setAttribute('aria-hidden', 'true');
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
    camera.position.set(0, 2.65, 7.6);
    camera.lookAt(0, 2.5, 0);
    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    const environment = pmrem.fromScene(room, 0.04);
    scene.environment = environment.texture;
    room.dispose();
    pmrem.dispose();

    const key = new THREE.DirectionalLight(0xffffff, 4);
    key.position.set(-3, 5, 4);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xe0e7ff, 3);
    rim.position.set(4, 3, -2);
    scene.add(rim, new THREE.HemisphereLight(0xffffff, 0x66575a, 1.5));
    const fill = new THREE.DirectionalLight(0xffd5cf, 1);
    fill.position.set(-4, 0, 2);
    scene.add(fill);

    // A subtle woven bump texture gives the armour a carbon-fibre finish.
    const weaveData = new Uint8Array(64 * 64 * 4);
    for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) {
      const horizontal = (Math.floor(x / 8) + Math.floor(y / 8)) % 2 === 0;
      const thread = horizontal ? y % 8 : x % 8;
      const value = 105 + Math.round(Math.sin(thread / 7 * Math.PI) * 45);
      const index = (y * 64 + x) * 4;
      weaveData.set([value, value, value, 255], index);
    }
    const weave = new THREE.DataTexture(weaveData, 64, 64);
    weave.wrapS = weave.wrapT = THREE.RepeatWrapping;
    weave.repeat.set(6, 5);
    weave.magFilter = THREE.LinearFilter;
    weave.minFilter = THREE.LinearMipmapLinearFilter;
    weave.generateMipmaps = true;
    weave.needsUpdate = true;
    const graphite = new THREE.MeshPhysicalMaterial({ color: 0x111214, metalness: 0.78, roughness: 0.38, clearcoat: 0.25, bumpMap: weave, bumpScale: 0.015 });
    const chrome = new THREE.MeshStandardMaterial({ color: 0xc2c5c8, metalness: 1, roughness: 0.11 });
    const joint = new THREE.MeshStandardMaterial({ color: 0x111216, metalness: 0.75, roughness: 0.4 });
    const glass = new THREE.MeshPhysicalMaterial({ color: 0x08090b, metalness: 1, roughness: 0.075, clearcoat: 1 });
    const accent = new THREE.MeshStandardMaterial({ color: 0x802c40, emissive: 0x802c40, emissiveIntensity: 0.7, metalness: 0.4, roughness: 0.3 });
    const led = new THREE.MeshStandardMaterial({ color: 0xdce9ee, emissive: 0x9eb6c2, emissiveIntensity: 1.5 });
    const geometries = new Set<THREE.BufferGeometry>();

    function mesh(parent: THREE.Object3D, geometry: THREE.BufferGeometry, material: THREE.Material, position: [number, number, number], scale: [number, number, number] = [1, 1, 1]) {
      geometries.add(geometry);
      const object = new THREE.Mesh(geometry, material);
      object.position.set(...position);
      object.scale.set(...scale);
      parent.add(object);
      return object;
    }
    function ellipsoid(parent: THREE.Object3D, material: THREE.Material, position: [number, number, number], scale: [number, number, number]) {
      return mesh(parent, new THREE.SphereGeometry(1, 48, 32), material, position, scale);
    }
    function cylinder(parent: THREE.Object3D, radius: number, length: number, material: THREE.Material, position: [number, number, number]) {
      return mesh(parent, new THREE.CylinderGeometry(radius, radius, length, 32), material, position);
    }

    const robot = new THREE.Group();
    scene.add(robot);
    robot.rotation.y = -0.16;

    // Segmented legs, knee motors, and a machined pelvis.
    ellipsoid(robot, graphite, [0, 1.45, 0], [0.43, 0.24, 0.26]);
    cylinder(robot, 0.17, 0.34, chrome, [0, 1.67, 0]);
    for (const side of [-1, 1]) {
      ellipsoid(robot, joint, [side * 0.29, 1.43, 0], [0.2, 0.19, 0.2]);
      ellipsoid(robot, graphite, [side * 0.29, 1.02, 0], [0.23, 0.43, 0.24]);
      ellipsoid(robot, joint, [side * 0.29, 0.61, 0.02], [0.18, 0.18, 0.18]);
      const knee = cylinder(robot, 0.12, 0.37, chrome, [side * 0.29, 0.61, 0.02]);
      knee.rotation.z = Math.PI / 2;
      ellipsoid(robot, graphite, [side * 0.29, 0.22, 0], [0.2, 0.34, 0.2]);
      ellipsoid(robot, joint, [side * 0.29, -0.12, 0.1], [0.22, 0.13, 0.34]);
    }

    const upperBody = new THREE.Group();
    upperBody.position.y = 1.76;
    robot.add(upperBody);
    // A tapered shell with a broad chest and narrow waist.
    const profile = [[0, 0], [0.3, 0.01], [0.38, 0.08], [0.43, 0.35], [0.63, 0.79], [0.68, 0.98], [0.6, 1.12], [0.4, 1.24], [0.2, 1.28], [0, 1.28]];
    const shell = new THREE.SplineCurve(profile.map(([x, y]) => new THREE.Vector2(x, y)));
    mesh(upperBody, new THREE.LatheGeometry(shell.getPoints(70), 80), graphite, [0, 0, 0], [1, 1, 0.64]);
    ellipsoid(upperBody, joint, [0, 0.35, -0.16], [0.35, 0.38, 0.22]);
    mesh(upperBody, new THREE.BoxGeometry(0.065, 0.012, 0.015), accent, [0.25, 0.92, 0.325]);
    for (let i = 0; i < 3; i++) mesh(upperBody, new THREE.BoxGeometry(0.075, 0.008, 0.012), chrome, [-0.27, 0.9 - i * 0.026, 0.326]);

    cylinder(upperBody, 0.12, 0.27, chrome, [0, 1.33, 0]);
    for (const side of [-1, 1]) {
      const neckPiston = cylinder(upperBody, 0.022, 0.25, chrome, [side * 0.13, 1.36, 0.04]);
      neckPiston.rotation.z = side * 0.22;
      cylinder(robot, 0.035, 0.27, chrome, [side * 0.24, 1.68, 0.07]);
    }
    cylinder(upperBody, 0.19, 0.075, joint, [0, 1.235, 0]);
    cylinder(upperBody, 0.14, 0.05, graphite, [0, 1.44, 0]);
    const head = new THREE.Group();
    head.position.set(0, 1.54, 0);
    upperBody.add(head);
    ellipsoid(head, chrome, [0, 0.27, 0], [0.385, 0.47, 0.335]);
    // A curved visor fitted to the helmet, leaving a polished rim and jaw exposed.
    mesh(head, new THREE.SphereGeometry(1, 64, 48, 0.3, Math.PI - 0.6, 0.32, 2.5), glass, [0, 0.28, 0.009], [0.387, 0.461, 0.342]);
    for (const side of [-1, 1]) {
      const ear = cylinder(head, 0.16, 0.055, chrome, [side * 0.355, 0.23, 0]);
      ear.rotation.z = Math.PI / 2;
      const earInset = cylinder(head, 0.123, 0.059, joint, [side * 0.372, 0.23, 0]);
      earInset.rotation.z = Math.PI / 2;
      ear.scale.set(1, 1, 1.38);
      earInset.scale.set(1, 1, 1.4);
      for (let row = 0; row < 4; row++) for (let col = 0; col < 5; col++) {
        const x = side * 0.135 + (col - 2) * 0.021;
        const y = 0.34 + row * 0.021;
        const z = 0.009 + 0.342 * Math.sqrt(1 - (x / 0.387) ** 2 - ((y - 0.28) / 0.461) ** 2);
        ellipsoid(head, led, [x, y, z + 0.004], [0.0045, 0.0045, 0.004]);
      }
    }

    const arms: THREE.Group[] = [];
    const elbows: THREE.Group[] = [];
    for (const side of [-1, 1]) {
      const arm = new THREE.Group();
      arm.position.set(side * 0.73, 1.04, 0);
      arm.rotation.z = side * 0.31;
      upperBody.add(arm);
      arms.push(arm);
      ellipsoid(arm, chrome, [0, 0, 0], [0.19, 0.19, 0.19]);
      const armourCurve = new THREE.SplineCurve([new THREE.Vector2(0, -0.53), new THREE.Vector2(0.15, -0.51), new THREE.Vector2(0.21, -0.33), new THREE.Vector2(0.245, -0.02), new THREE.Vector2(0.19, 0.15), new THREE.Vector2(0, 0.17)]);
      mesh(arm, new THREE.LatheGeometry(armourCurve.getPoints(40), 48), graphite, [side * 0.035, -0.05, 0.025], [1, 1, 0.95]);
      cylinder(arm, 0.095, 0.3, chrome, [0, -0.53, 0]);
      for (let ring = 0; ring < 4; ring++) cylinder(arm, 0.117, 0.016, joint, [0, -0.46 - ring * 0.038, 0]);
      for (const offset of [-0.085, 0.085]) cylinder(arm, 0.016, 0.26, chrome, [offset, -0.54, 0.07]);
      const elbow = new THREE.Group();
      elbow.position.y = -0.64;
      arm.add(elbow);
      elbows.push(elbow);
      ellipsoid(elbow, joint, [0, 0, 0], [0.145, 0.15, 0.155]);
      const bearing = cylinder(elbow, 0.09, 0.31, chrome, [0, 0, 0]);
      bearing.rotation.z = Math.PI / 2;
      const forearmCurve = new THREE.SplineCurve([new THREE.Vector2(0, -0.58), new THREE.Vector2(0.11, -0.56), new THREE.Vector2(0.155, -0.4), new THREE.Vector2(0.19, -0.13), new THREE.Vector2(0.17, -0.05), new THREE.Vector2(0, -0.03)]);
      mesh(elbow, new THREE.LatheGeometry(forearmCurve.getPoints(36), 48), graphite, [0, 0, 0.025]);
      cylinder(elbow, 0.075, 0.18, chrome, [0, -0.61, 0.025]);
      const hand = new THREE.Group();
      hand.position.set(0, -0.75, 0.025);
      hand.rotation.x = -0.13;
      elbow.add(hand);
      ellipsoid(hand, graphite, [0, 0, 0], [0.12, 0.16, 0.075]);
      for (let finger = 0; finger < 4; finger++) {
        const x = (finger - 1.5) * 0.053;
        const length = finger === 0 || finger === 3 ? 0.095 : 0.12;
        mesh(hand, new THREE.CapsuleGeometry(0.023, length, 4, 8), chrome, [x, -0.16, 0.01]);
        ellipsoid(hand, joint, [x, -0.22, 0.015], [0.025, 0.027, 0.025]);
        const tip = mesh(hand, new THREE.CapsuleGeometry(0.021, 0.065, 4, 8), graphite, [x, -0.27, 0.033]);
        tip.rotation.x = -0.35;
      }
      const thumb = mesh(hand, new THREE.CapsuleGeometry(0.032, 0.12, 4, 8), chrome, [-side * 0.13, -0.075, 0.035]);
      thumb.rotation.z = -side * 0.5;
    }

    const target = new THREE.Vector2();
    const pointer = (event: PointerEvent) => {
      if (event.pointerType === 'touch' || reducedMotion) return;
      const bounds = container.closest('.hero')?.getBoundingClientRect();
      if (!bounds || event.clientY < bounds.top || event.clientY > bounds.bottom) { target.set(0, 0); return; }
      target.set(THREE.MathUtils.clamp((event.clientX - bounds.left) / bounds.width * 2 - 1, -1, 1), THREE.MathUtils.clamp((event.clientY - bounds.top) / bounds.height * 2 - 1, -1, 1));
    };
    const reset = () => target.set(0, 0);
    window.addEventListener('pointermove', pointer, { passive: true });
    document.documentElement.addEventListener('pointerleave', reset);
    window.addEventListener('blur', reset);
    const resize = new ResizeObserver(() => {
      const { width, height } = container.getBoundingClientRect();
      renderer.setSize(width, height);
      camera.aspect = width / Math.max(height, 1);
      camera.position.z = Math.max(7.1, 5.7 / camera.aspect);
      camera.position.y = camera.aspect < 0.7 ? 2.05 : 2.65;
      camera.lookAt(0, camera.aspect < 0.7 ? 1.9 : 2.5, 0);
      camera.updateProjectionMatrix();
    });
    resize.observe(container);

    let frame = 0;
    let previousTime = 0;
    let visible = true;
    const visibility = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
    visibility.observe(container);
    function render(now: number) {
      frame = requestAnimationFrame(render);
      if (!visible || document.hidden) { previousTime = now; return; }
      const delta = Math.min((now - previousTime) / 1000, 0.05);
      previousTime = now;
      const damping = 1 - Math.exp(-6 * delta);
      head.rotation.y = THREE.MathUtils.lerp(head.rotation.y, target.x * 0.48, damping);
      head.rotation.x = THREE.MathUtils.lerp(head.rotation.x, target.y * 0.2, damping);
      robot.rotation.y = THREE.MathUtils.lerp(robot.rotation.y, -0.16 + target.x * 0.16 + turn.current, damping);
      upperBody.rotation.z = reducedMotion ? 0 : Math.sin(now * 0.00065) * 0.012;
      upperBody.position.y = 1.76 + (reducedMotion ? 0 : Math.sin(now * 0.0015) * 0.009);
      const elapsed = (now - waveStarted.current) / 1000;
      const wavingNow = waveStarted.current > 0 && elapsed < 2.6 && !reducedMotion;
      const envelope = wavingNow ? Math.min(elapsed * 3, 1, (2.6 - elapsed) * 3) : 0;
      arms[0].rotation.z = -0.31 - (reducedMotion ? 0 : Math.sin(now * 0.0009) * 0.025);
      arms[1].rotation.z = 0.31 + envelope * 1.85 + (reducedMotion ? 0 : Math.sin(now * 0.0009) * 0.025);
      elbows[0].rotation.x = -0.13;
      elbows[1].rotation.x = -0.1;
      elbows[1].rotation.z = envelope * (0.35 + Math.sin(elapsed * 12) * 0.22);
      if (waveStarted.current && elapsed >= 2.6) { waveStarted.current = 0; setWaving(false); }
      renderer.render(scene, camera);
    }
    frame = requestAnimationFrame(render);
    setReady(true);

    const contextLost = (event: Event) => { event.preventDefault(); setReady(false); cancelAnimationFrame(frame); };
    renderer.domElement.addEventListener('webglcontextlost', contextLost);
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      visibility.disconnect();
      window.removeEventListener('pointermove', pointer);
      document.documentElement.removeEventListener('pointerleave', reset);
      window.removeEventListener('blur', reset);
      renderer.domElement.removeEventListener('webglcontextlost', contextLost);
      geometries.forEach(geometry => geometry.dispose());
      [graphite, chrome, joint, glass, accent, led].forEach(material => material.dispose());
      weave.dispose();
      environment.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [reducedMotion]);

  return <div className="robot-visual">
    <div className="robot-stage" ref={host} role="group" tabIndex={0}
      aria-label="Interactive metallic robot. Drag horizontally or use left and right arrow keys to turn. Press Home to reset."
      onKeyDown={event => {
        if (reducedMotion) return;
        if (['ArrowLeft', 'ArrowRight', 'Home'].includes(event.key)) {
          event.preventDefault();
          turn.current = event.key === 'Home' ? 0 : THREE.MathUtils.clamp(turn.current + (event.key === 'ArrowRight' ? 0.2 : -0.2), -1.2, 1.2);
        }
      }}
      onPointerDown={event => {
        if (reducedMotion || event.button !== 0) return;
        drag.current = { x: event.clientX, turn: turn.current };
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={event => {
        if (!drag.current || reducedMotion) return;
        turn.current = THREE.MathUtils.clamp(drag.current.turn + (event.clientX - drag.current.x) * 0.007, -1.2, 1.2);
      }}
      onPointerUp={event => { drag.current = null; if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); }}
      onPointerCancel={() => { drag.current = null; }}
      onLostPointerCapture={() => { drag.current = null; }}
    >
      {!ready && <svg className="robot-fallback" viewBox="0 0 360 520" aria-hidden="true"><defs><linearGradient id="robot-metal"><stop stopColor="#151619"/><stop offset=".3" stopColor="#65696b"/><stop offset=".5" stopColor="#242629"/><stop offset="1" stopColor="#090b0e"/></linearGradient></defs><g fill="url(#robot-metal)" stroke="#484b50" strokeWidth="2"><rect x="163" y="137" width="34" height="36" rx="9"/><rect x="128" y="25" width="104" height="123" rx="47"/><path d="M115 174Q180 146 245 174L224 317Q180 333 136 317Z"/><ellipse cx="99" cy="195" rx="23" ry="27"/><ellipse cx="261" cy="195" rx="23" ry="27"/><rect x="60" y="203" width="42" height="101" rx="21" transform="rotate(15 81 203)"/><rect x="258" y="203" width="42" height="101" rx="21" transform="rotate(-15 279 203)"/><rect x="40" y="296" width="37" height="109" rx="18"/><rect x="283" y="296" width="37" height="109" rx="18"/><rect x="42" y="406" width="31" height="45" rx="12"/><rect x="287" y="406" width="31" height="45" rx="12"/><rect x="154" y="323" width="52" height="27" rx="12"/><rect x="129" y="347" width="46" height="160" rx="22"/><rect x="185" y="347" width="46" height="160" rx="22"/></g><rect x="140" y="48" width="80" height="84" rx="32" fill="#080a0d"/><g fill="#b6c3cd"><circle cx="160" cy="86" r="3"/><circle cx="200" cy="86" r="3"/></g></svg>}
    </div>
    <div className="robot-ground" aria-hidden="true"/>
    <div className="robot-controls"><span>{reducedMotion ? 'YOUR ENGINEERING COMPANION' : 'Move your cursor · drag to turn'}</span>{ready && !reducedMotion && <button onClick={() => { waveStarted.current = performance.now(); setWaving(true); }} disabled={waving}>{waving ? 'Hello there!' : 'Say hello ↗'}</button>}</div>
  </div>;
}
