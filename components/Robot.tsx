'use client';

import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import * as THREE from 'three';
import { createRobot, createStudio } from '@/lib/robot-model';
import { gazeFromPointer, smoothTracking } from '@/lib/robot-motion';

export default function Robot() {
  const host = useRef<HTMLDivElement>(null);
  const turn = useRef(0);
  const drag = useRef<{ x: number; turn: number } | null>(null);
  const reduce = useReducedMotion();
  const [ready, setReady] = useState(false);
  const reduceRef = useRef(reduce);
  useEffect(() => { reduceRef.current = reduce; }, [reduce]);

  useEffect(() => {
    if (!host.current) return;
    const container = host.current;
    setReady(false);
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); }
    catch { return; }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setClearColor(0, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.domElement.style.opacity = '0';
    renderer.domElement.setAttribute('aria-hidden', 'true');
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const model = createRobot();
    const environment = createStudio(renderer);
    scene.environment = environment.texture;
    scene.add(model.root);
    const key = new THREE.DirectionalLight(0xfff6e9, 1.5);
    key.position.set(-3, 5, 4);
    scene.add(key, new THREE.HemisphereLight(0xffffff, 0x535059, 1.2));
    const camera = new THREE.PerspectiveCamera(31, 1, 0.1, 30);
    const resize = () => {
      const { width, height } = container.getBoundingClientRect();
      renderer.setSize(width, height);
      camera.aspect = width / Math.max(height, 1);
      camera.position.set(0, 2.8, Math.max(7.3, 5.1 / camera.aspect));
      camera.lookAt(0, 2.6, 0);
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    resize();

    const pointer = { x: 0, y: 0, active: false };
    const hero = container.closest('.hero');
    const onPointer = (event: PointerEvent) => {
      if (event.pointerType === 'touch' || reduceRef.current) return;
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      const heroBounds = hero?.getBoundingClientRect();
      pointer.active = !!heroBounds && heroBounds.bottom > 100 && event.clientY < heroBounds.bottom;
    };
    const resetGaze = () => { pointer.active = false; };
    window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('blur', resetGaze);
    window.addEventListener('scroll', resetGaze, { passive: true });
    document.documentElement.addEventListener('pointerleave', resetGaze);
    let visible = true;
    const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
    intersection.observe(container);

    model.root.rotation.y = -0.15;
    const projectedEyes = new THREE.Vector3();
    let frame = 0;
    let previous = 0;
    let contextAvailable = true;
    let presented = false;
    function render(now: number) {
      frame = requestAnimationFrame(render);
      const delta = Math.min((now - previous) / 1000, 0.05);
      previous = now;
      if (!visible || document.hidden || !contextAvailable) return;
      let targetYaw = 0;
      let targetPitch = 0;
      if (pointer.active && !drag.current && !reduceRef.current) {
        model.root.updateMatrixWorld(true);
        // A fixed neutral eye anchor prevents gaze feedback as the head moves.
        projectedEyes.set(0, 1.98, 0.28);
        model.body.localToWorld(projectedEyes);
        projectedEyes.project(camera);
        const bounds = container.getBoundingClientRect();
        const eyeX = bounds.left + (projectedEyes.x + 1) * bounds.width / 2;
        const eyeY = bounds.top + (1 - projectedEyes.y) * bounds.height / 2;
        const gaze = gazeFromPointer(pointer.x, pointer.y, eyeX, eyeY, Math.max(bounds.width * 0.85, 450));
        targetYaw = gaze.yaw;
        targetPitch = gaze.pitch;
      }
      model.root.rotation.y = smoothTracking(model.root.rotation.y, -0.15 + turn.current, delta);
      model.head.rotation.y = smoothTracking(model.head.rotation.y, targetYaw, delta);
      model.head.rotation.x = smoothTracking(model.head.rotation.x, targetPitch, delta);
      // No idle sway, head roll, eye drift, or independently lagging body motion.
      renderer.render(scene, camera);
      if (!presented) { renderer.domElement.style.opacity = '1'; presented = true; setReady(true); }
    }
    frame = requestAnimationFrame(render);
    const lost = (event: Event) => { event.preventDefault(); contextAvailable = false; renderer.domElement.style.opacity = '0'; setReady(false); };
    const restored = () => { contextAvailable = true; presented = false; resize(); };
    renderer.domElement.addEventListener('webglcontextlost', lost);
    renderer.domElement.addEventListener('webglcontextrestored', restored);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      intersection.disconnect();
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('blur', resetGaze);
      window.removeEventListener('scroll', resetGaze);
      document.documentElement.removeEventListener('pointerleave', resetGaze);
      renderer.domElement.removeEventListener('webglcontextlost', lost);
      renderer.domElement.removeEventListener('webglcontextrestored', restored);
      model.dispose();
      environment.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div className="robot-visual">
    <div className="robot-backdrop" aria-hidden="true"/>
    <div className="robot-stage" ref={host} data-ready={ready} role="group" tabIndex={ready && !reduce ? 0 : -1}
      aria-label="Interactive robot. Move your cursor to look around, drag to rotate, or use arrow keys. Press Home to reset."
      onKeyDown={event => {
        if (reduce) return;
        if (['ArrowLeft', 'ArrowRight', 'Home'].includes(event.key)) {
          event.preventDefault();
          turn.current = event.key === 'Home' ? 0 : THREE.MathUtils.clamp(turn.current + (event.key === 'ArrowRight' ? 0.2 : -0.2), -0.85, 0.85);
        }
      }}
      onPointerDown={event => {
        if (reduce || event.button !== 0) return;
        drag.current = { x: event.clientX, turn: turn.current };
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={event => {
        if (!drag.current || reduce) return;
        turn.current = THREE.MathUtils.clamp(drag.current.turn + (event.clientX - drag.current.x) * 0.005, -0.85, 0.85);
      }}
      onPointerUp={event => { drag.current = null; if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); }}
      onPointerCancel={() => { drag.current = null; }} onLostPointerCapture={() => { drag.current = null; }}>

    </div>

  </div>;
}
