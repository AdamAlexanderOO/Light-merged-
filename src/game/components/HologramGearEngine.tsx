import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { CHARACTER_RIGS, CharacterRig } from '../data/characterRigs';
import { soundEffects } from '../utils/soundEffects';
import { Shield, Zap, Crosshair, ChevronRight, RotateCcw, Cpu } from 'lucide-react';

export const HologramGearEngine: React.FC = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [selectedRig, setSelectedRig] = useState<CharacterRig>(CHARACTER_RIGS[0]);
  const [rotationSpeed, setRotationSpeed] = useState<number>(0.01);
  const [wireframeMode, setWireframeMode] = useState<boolean>(true);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 500;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Holographic grid floor
    const grid = new THREE.GridHelper(10, 20, 0x00f2fe, 0x1e293b);
    grid.position.y = -2.5;
    scene.add(grid);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(selectedRig.colorScheme.glow, 2, 50);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // Build 3D Holographic Mech Geometry Group
    const mechGroup = new THREE.Group();

    const mat = new THREE.MeshStandardMaterial({
      color: selectedRig.colorScheme.primary,
      wireframe: wireframeMode,
      emissive: selectedRig.colorScheme.glow,
      emissiveIntensity: 0.35,
      metalness: 0.8,
      roughness: 0.2,
    });

    // Torso
    const torsoGeo = new THREE.BoxGeometry(1.8, 2.2, 1.2);
    const torso = new THREE.Mesh(torsoGeo, mat);
    mechGroup.add(torso);

    // Head
    const headGeo = new THREE.ConeGeometry(0.5, 0.9, 6);
    const head = new THREE.Mesh(headGeo, mat);
    head.position.y = 1.6;
    mechGroup.add(head);

    // Wings / Shoulder Pauldrons
    const wingL = new THREE.Mesh(new THREE.BoxGeometry(0.8, 2.8, 0.2), mat);
    wingL.position.set(-1.6, 0.5, -0.4);
    wingL.rotation.z = 0.3;
    mechGroup.add(wingL);

    const wingR = new THREE.Mesh(new THREE.BoxGeometry(0.8, 2.8, 0.2), mat);
    wingR.position.set(1.6, 0.5, -0.4);
    wingR.rotation.z = -0.3;
    mechGroup.add(wingR);

    // Legs
    const legL = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.2, 2, 8), mat);
    legL.position.set(-0.6, -1.8, 0);
    mechGroup.add(legL);

    const legR = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.2, 2, 8), mat);
    legR.position.set(0.6, -1.8, 0);
    mechGroup.add(legR);

    scene.add(mechGroup);

    let reqId: number;
    const animate = () => {
      reqId = requestAnimationFrame(animate);
      mechGroup.rotation.y += rotationSpeed;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [selectedRig, rotationSpeed, wireframeMode]);

  return (
    <div className="w-full h-full flex flex-col lg:flex-row bg-[#050811] text-slate-100 overflow-hidden select-none font-sans">
      {/* 3D Hologram Stage */}
      <div className="flex-1 relative flex flex-col items-center justify-center p-4 bg-radial from-cyan-950/20 via-black to-black">
        {/* Hologram Canvas Container */}
        <div ref={mountRef} className="w-full h-full min-h-[350px] sm:min-h-[450px]" />

        {/* Floating Quick Controls */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between bg-black/70 backdrop-blur-md px-4 py-2 rounded-lg border border-cyan-500/30 text-xs font-mono">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setWireframeMode(!wireframeMode);
                soundEffects.playPixelChime();
              }}
              className="px-2.5 py-1 rounded bg-white/5 border border-white/10 hover:text-cyan-300 transition-colors"
            >
              {wireframeMode ? 'WIREFRAME MESH' : 'SOLID CHASSIS'}
            </button>
            <button
              onClick={() => setRotationSpeed(rotationSpeed === 0 ? 0.015 : 0)}
              className="px-2.5 py-1 rounded bg-white/5 border border-white/10 hover:text-cyan-300 transition-colors"
            >
              {rotationSpeed === 0 ? 'ROTATE: OFF' : 'ROTATE: ON'}
            </button>
          </div>
          <div className="text-cyan-400 font-bold hidden sm:block">
            TACTICAL RESTRAINT LOCK: ENGAGED
          </div>
        </div>
      </div>

      {/* Roster & Specs Panel */}
      <div className="w-full lg:w-96 border-l border-white/10 bg-[#070c18] p-4 flex flex-col justify-between shrink-0 overflow-y-auto no-scrollbar space-y-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-white/10">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold font-mono tracking-wider uppercase text-white">
              Hologram Rig Schema & Spec
            </h2>
          </div>

          {/* Rig Switcher Pills */}
          <div className="space-y-1.5">
            {CHARACTER_RIGS.map((rig) => (
              <button
                key={rig.id}
                onClick={() => {
                  setSelectedRig(rig);
                  soundEffects.playWarpCharge();
                }}
                className={`w-full p-2.5 rounded-lg border transition-all text-left flex items-center justify-between ${
                  selectedRig.id === rig.id
                    ? 'bg-cyan-950/60 border-cyan-400 text-white shadow-[0_0_15px_rgba(0,242,254,0.2)]'
                    : 'bg-white/5 border-transparent text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <div>
                  <div className="text-xs font-bold font-mono">{rig.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{rig.classification}</div>
                </div>
                <ChevronRight className="w-4 h-4 text-cyan-400 shrink-0" />
              </button>
            ))}
          </div>

          {/* Detailed Specs Card */}
          <div className="bg-black/60 p-3.5 rounded-lg border border-cyan-500/20 space-y-2.5 text-xs font-mono">
            <div className="text-[10px] text-slate-400 tracking-wider font-bold">TACTICAL TELEMETRY</div>

            <div className="flex justify-between border-b border-white/5 pb-1">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Crosshair className="w-3 h-3 text-rose-400" />
                <span>Primary Armament</span>
              </span>
              <span className="text-slate-100 font-bold text-right">{selectedRig.primaryWeapon}</span>
            </div>

            <div className="flex justify-between border-b border-white/5 pb-1">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-amber-400" />
                <span>Secondary Battery</span>
              </span>
              <span className="text-slate-100 font-bold text-right">{selectedRig.secondaryWeapon}</span>
            </div>

            <div className="flex justify-between border-b border-white/5 pb-1">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Shield className="w-3 h-3 text-blue-400" />
                <span>Armor Composition</span>
              </span>
              <span className="text-slate-100 font-bold text-right truncate max-w-[170px]">{selectedRig.armorType}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-400">Atmospheric Intercept</span>
              <span className="text-emerald-400 font-bold">Mach {selectedRig.speedMach.toFixed(1)}</span>
            </div>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 font-mono border-t border-white/10 pt-3 flex justify-between">
          <span>COGNITIVE LINK: ACTIVE</span>
          <span className="text-cyan-400">100% SYNC</span>
        </div>
      </div>
    </div>
  );
};
