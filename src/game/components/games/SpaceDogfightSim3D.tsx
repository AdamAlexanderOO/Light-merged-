import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { soundEffects } from '../../utils/soundEffects';
import { Crosshair, Shield, Play, RotateCcw, Zap } from 'lucide-react';

export const SpaceDogfightSim3D: React.FC = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [targetsDestroyed, setTargetsDestroyed] = useState<number>(0);
  const [shieldHp, setShieldHp] = useState<number>(100);

  const simRef = useRef({
    lasers: [] as { mesh: THREE.Mesh; vel: THREE.Vector3; life: number }[],
    enemies: [] as { mesh: THREE.Mesh; vel: THREE.Vector3; hp: number }[],
    camera: null as THREE.PerspectiveCamera | null,
    scene: null as THREE.Scene | null,
    aimX: 0,
    aimY: 0,
  });

  const handleStartSim = () => {
    soundEffects.init();
    setTargetsDestroyed(0);
    setShieldHp(100);
    setIsPlaying(true);
    soundEffects.playWarpCharge();
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 700;
    const height = container.clientHeight || 500;

    const scene = new THREE.Scene();
    simRef.current.scene = scene;
    scene.fog = new THREE.FogExp2(0x050714, 0.015);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 0, 0);
    simRef.current.camera = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Starfield
    const starCount = 600;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * 400;
      starPos[i + 1] = (Math.random() - 0.5) * 400;
      starPos[i + 2] = -Math.random() * 300;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 1.2 });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // Ambient & Point Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const light = new THREE.PointLight(0x00f2fe, 2, 100);
    light.position.set(0, 0, 10);
    scene.add(light);

    // Spawn 8 Enemy Drones
    simRef.current.enemies = [];
    const enemyMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0x991b1b,
      wireframe: true,
    });
    for (let i = 0; i < 8; i++) {
      const eMesh = new THREE.Mesh(new THREE.OctahedronGeometry(1.5, 0), enemyMat);
      eMesh.position.set(
        (Math.random() - 0.5) * 50,
        (Math.random() - 0.5) * 30,
        -50 - Math.random() * 80
      );
      scene.add(eMesh);
      simRef.current.enemies.push({
        mesh: eMesh,
        vel: new THREE.Vector3((Math.random() - 0.5) * 0.2, (Math.random() - 0.5) * 0.2, 0.35),
        hp: 2,
      });
    }

    // Mouse aiming
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      simRef.current.aimX = x;
      simRef.current.aimY = y;
    };
    container.addEventListener('mousemove', handleMouseMove);

    // Click to shoot 3D plasma lasers
    const handleClick = () => {
      if (!isPlaying) return;
      soundEffects.playLaser();

      const laserMat = new THREE.MeshBasicMaterial({ color: 0x00f2fe });
      const laserGeo = new THREE.CylinderGeometry(0.1, 0.1, 4, 8);
      laserGeo.rotateX(Math.PI / 2);
      const laserMesh = new THREE.Mesh(laserGeo, laserMat);

      // Offset left & right blaster
      laserMesh.position.set(camera.position.x + (Math.random() > 0.5 ? 1 : -1) * 0.8, camera.position.y - 0.5, -2);
      scene.add(laserMesh);

      const targetVec = new THREE.Vector3(simRef.current.aimX * 25, simRef.current.aimY * 20, -100);
      const dir = targetVec.sub(laserMesh.position).normalize();

      simRef.current.lasers.push({
        mesh: laserMesh,
        vel: dir.multiplyScalar(2.2),
        life: 60,
      });
    };
    container.addEventListener('click', handleClick);

    // Render loop
    let reqId: number;
    const animate = () => {
      reqId = requestAnimationFrame(animate);

      // Camera smooth follow cursor
      camera.rotation.y = -simRef.current.aimX * 0.35;
      camera.rotation.x = simRef.current.aimY * 0.3;

      // Update Lasers
      const lasers = simRef.current.lasers;
      for (let i = lasers.length - 1; i >= 0; i--) {
        const l = lasers[i];
        l.mesh.position.add(l.vel);
        l.life--;

        // Check collision with enemies
        for (let j = simRef.current.enemies.length - 1; j >= 0; j--) {
          const en = simRef.current.enemies[j];
          if (l.mesh.position.distanceTo(en.mesh.position) < 2.5) {
            en.hp--;
            soundEffects.playExplosion();
            scene.remove(l.mesh);
            lasers.splice(i, 1);

            if (en.hp <= 0) {
              setTargetsDestroyed((prev) => prev + 1);
              // Respawn enemy further back
              en.mesh.position.set((Math.random() - 0.5) * 60, (Math.random() - 0.5) * 40, -120);
              en.hp = 2;
            }
            break;
          }
        }

        if (l.life <= 0) {
          scene.remove(l.mesh);
          lasers.splice(i, 1);
        }
      }

      // Update Enemies
      simRef.current.enemies.forEach((en) => {
        en.mesh.position.add(en.vel);
        en.mesh.rotation.x += 0.02;
        en.mesh.rotation.y += 0.03;

        // Passed camera -> loop back
        if (en.mesh.position.z > 5) {
          en.mesh.position.set((Math.random() - 0.5) * 50, (Math.random() - 0.5) * 30, -100);
          setShieldHp((prev) => Math.max(0, prev - 10));
          soundEffects.playExplosion();
        }
      });

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(reqId);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('click', handleClick);
      renderer.dispose();
    };
  }, [isPlaying]);

  return (
    <div className="w-full h-full relative flex flex-col bg-[#050811] text-slate-100 overflow-hidden select-none font-sans">
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="w-full h-full cursor-crosshair" />

      {/* Top HUD Banner */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between bg-black/70 backdrop-blur-md px-4 py-2.5 rounded-lg border border-cyan-500/30 text-xs font-mono pointer-events-none">
        <div className="flex items-center gap-3">
          <Crosshair className="w-4 h-4 text-cyan-400 animate-spin" />
          <span className="text-slate-300 font-bold">DOGFIGHT INTERCEPT: {targetsDestroyed} DOWN</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-emerald-400">
            <Shield className="w-3.5 h-3.5" />
            <span>SHIELDS: {shieldHp}%</span>
          </span>
          <span className="text-cyan-400">AMMO: UNLIMITED PLASMA</span>
        </div>
      </div>

      {/* Crosshair Overlay in Center */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-12 h-12 rounded-full border border-cyan-400/50 flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#00f2fe]" />
        </div>
      </div>

      {/* Start Modal if not playing */}
      {!isPlaying && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm z-30 p-4">
          <div className="bg-[#090f1f] border border-cyan-500/40 rounded-xl p-6 max-w-md text-center shadow-[0_0_50px_rgba(0,242,254,0.25)] space-y-4">
            <h3 className="text-lg font-bold font-mono text-cyan-300 uppercase tracking-wider">
              Deep Space 3D Dogfight Sim
            </h3>
            <p className="text-xs font-mono text-slate-400 leading-relaxed">
              Move cursor to aim starfighter blasters. Click to discharge high-velocity plasma sabots at intercepting enemy drone frames.
            </p>
            <button
              onClick={handleStartSim}
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black font-mono font-bold text-xs shadow-lg transition-all"
            >
              INITIALIZE 3D COCKPIT
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
