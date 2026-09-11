import React, { useRef, useEffect, useState, useCallback } from 'react';
import { soundEffects } from '../../utils/soundEffects';
import { Play, RotateCcw, Volume2, VolumeX, Shield, Trophy } from 'lucide-react';

export const PixelArcade64x64: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(1420);
  const [health, setHealth] = useState<number>(100);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Game state references
  const gameState = useRef({
    playerX: 32,
    playerY: 54,
    lasers: [] as { x: number; y: number }[],
    enemies: [] as { x: number; y: number; hp: number; speed: number }[],
    particles: [] as { x: number; y: number; vx: number; vy: number; life: number; color: string }[],
    stars: [] as { x: number; y: number; s: number }[],
    keys: { left: false, right: false, up: false, down: false, fire: false },
    score: 0,
    health: 100,
    lastFire: 0,
  });

  // Init stars
  useEffect(() => {
    const stars = [];
    for (let i = 0; i < 40; i++) {
      stars.push({
        x: Math.random() * 64,
        y: Math.random() * 64,
        s: Math.random() * 0.5 + 0.2,
      });
    }
    gameState.current.stars = stars;
  }, []);

  // Keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const k = gameState.current.keys;
      if (e.key === 'ArrowLeft' || e.key === 'a') k.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd') k.right = true;
      if (e.key === 'ArrowUp' || e.key === 'w') k.up = true;
      if (e.key === 'ArrowDown' || e.key === 's') k.down = true;
      if (e.key === ' ' || e.key === 'Enter') {
        k.fire = true;
        e.preventDefault();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const k = gameState.current.keys;
      if (e.key === 'ArrowLeft' || e.key === 'a') k.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd') k.right = false;
      if (e.key === 'ArrowUp' || e.key === 'w') k.up = false;
      if (e.key === 'ArrowDown' || e.key === 's') k.down = false;
      if (e.key === ' ' || e.key === 'Enter') k.fire = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Main 64x64 Arcade Engine Loop
  useEffect(() => {
    if (!isPlaying) return;

    let reqId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const loop = (timestamp: number) => {
      const s = gameState.current;

      // 1. Move Player
      if (s.keys.left && s.playerX > 4) s.playerX -= 0.8;
      if (s.keys.right && s.playerX < 60) s.playerX += 0.8;
      if (s.keys.up && s.playerY > 8) s.playerY -= 0.8;
      if (s.keys.down && s.playerY < 58) s.playerY += 0.8;

      // Fire Laser
      if (s.keys.fire && timestamp - s.lastFire > 140) {
        s.lasers.push({ x: s.playerX, y: s.playerY - 3 });
        s.lastFire = timestamp;
        soundEffects.playLaser();
      }

      // 2. Spawn Enemies
      if (Math.random() < 0.04) {
        s.enemies.push({
          x: Math.random() * 54 + 5,
          y: -4,
          hp: 2,
          speed: Math.random() * 0.4 + 0.3,
        });
      }

      // 3. Update Lasers
      for (let i = s.lasers.length - 1; i >= 0; i--) {
        s.lasers[i].y -= 1.6;
        if (s.lasers[i].y < -2) {
          s.lasers.splice(i, 1);
        }
      }

      // 4. Update Enemies
      for (let i = s.enemies.length - 1; i >= 0; i--) {
        const en = s.enemies[i];
        en.y += en.speed;

        // Collision with lasers
        for (let j = s.lasers.length - 1; j >= 0; j--) {
          const l = s.lasers[j];
          if (Math.abs(l.x - en.x) < 4 && Math.abs(l.y - en.y) < 4) {
            en.hp--;
            s.lasers.splice(j, 1);

            // Sparks
            for (let p = 0; p < 4; p++) {
              s.particles.push({
                x: en.x,
                y: en.y,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                life: 12,
                color: '#f59e0b',
              });
            }

            if (en.hp <= 0) {
              soundEffects.playExplosion();
              s.score += 50;
              setScore(s.score);
              s.enemies.splice(i, 1);
              break;
            }
          }
        }

        // Collision with player
        if (Math.abs(en.x - s.playerX) < 4 && Math.abs(en.y - s.playerY) < 4) {
          s.health -= 15;
          setHealth(Math.max(0, s.health));
          soundEffects.playExplosion();
          s.enemies.splice(i, 1);
          if (s.health <= 0) {
            setIsPlaying(false);
          }
        }
      }

      // 5. Update Stars
      s.stars.forEach((star) => {
        star.y += star.s;
        if (star.y > 64) star.y = 0;
      });

      // 6. Update Particles
      for (let i = s.particles.length - 1; i >= 0; i--) {
        const p = s.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        if (p.life <= 0) s.particles.splice(i, 1);
      }

      // 7. RENDER 64x64 PIXELS
      ctx.fillStyle = '#05070f';
      ctx.fillRect(0, 0, 64, 64);

      // Stars
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      s.stars.forEach((st) => {
        ctx.fillRect(Math.floor(st.x), Math.floor(st.y), 1, 1);
      });

      // Lasers
      ctx.fillStyle = '#00f2fe';
      s.lasers.forEach((l) => {
        ctx.fillRect(Math.floor(l.x), Math.floor(l.y), 1, 3);
      });

      // Enemies
      ctx.fillStyle = '#ef4444';
      s.enemies.forEach((en) => {
        const ex = Math.floor(en.x);
        const ey = Math.floor(en.y);
        ctx.fillRect(ex - 2, ey, 5, 2);
        ctx.fillRect(ex - 1, ey + 2, 3, 2);
        ctx.fillRect(ex, ey + 4, 1, 1);
      });

      // Player Ship
      const px = Math.floor(s.playerX);
      const py = Math.floor(s.playerY);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(px, py - 3, 1, 4); // Nose
      ctx.fillRect(px - 1, py - 1, 3, 3); // Cockpit
      ctx.fillRect(px - 3, py + 1, 7, 2); // Wings
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(px - 2, py + 3, 1, 2); // Left thruster
      ctx.fillRect(px + 2, py + 3, 1, 2); // Right thruster

      // Particles
      s.particles.forEach((p) => {
        ctx.fillStyle = p.color;
        ctx.fillRect(Math.floor(p.x), Math.floor(p.y), 1, 1);
      });

      reqId = requestAnimationFrame(loop);
    };

    reqId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(reqId);
  }, [isPlaying]);

  const handleStartGame = () => {
    soundEffects.init();
    gameState.current.score = 0;
    gameState.current.health = 100;
    gameState.current.enemies = [];
    gameState.current.lasers = [];
    gameState.current.playerX = 32;
    gameState.current.playerY = 52;
    setScore(0);
    setHealth(100);
    setIsPlaying(true);
    soundEffects.playWarpCharge();
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#050811] text-slate-100 p-3 sm:p-6 select-none font-sans">
      <div className="w-full max-w-xl bg-[#090e1c] border border-cyan-500/30 rounded-xl p-4 flex flex-col items-center shadow-[0_0_40px_rgba(0,242,254,0.15)]">
        {/* Header HUD */}
        <div className="w-full flex items-center justify-between pb-3 border-b border-white/10 text-xs font-mono">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="text-slate-400">SCORE:</span>
            <span className="text-white font-bold">{score.toString().padStart(5, '0')}</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-400 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>HULL: {health}%</span>
            </span>
            <button
              onClick={() => {
                const next = !isMuted;
                setIsMuted(next);
                soundEffects.setMuted(next);
              }}
              className="p-1 rounded bg-white/5 text-slate-300 hover:text-white"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* 64x64 Arcade Screen with CRT Phosphor Bezel */}
        <div className="relative my-4 p-2 bg-black border-4 border-slate-800 rounded-lg shadow-inner flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={64}
            height={64}
            className="w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] image-rendering-pixelated bg-black rounded"
            style={{ imageRendering: 'pixelated' }}
          />

          {!isPlaying && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-xs text-center p-4">
              <h3 className="text-base font-bold font-mono text-cyan-300 uppercase tracking-widest mb-1">
                Pixel Arcade 64×64
              </h3>
              <p className="text-[11px] text-slate-400 font-mono mb-4">
                Arrow Keys or WASD to move • Space to Fire
              </p>
              <button
                onClick={handleStartGame}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-black font-mono font-bold text-xs shadow-[0_0_20px_rgba(0,242,254,0.4)] transition-all"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>LAUNCH STARFIGHTER</span>
              </button>
            </div>
          )}
        </div>

        {/* Virtual D-Pad for Touch/Mobile */}
        <div className="w-full flex items-center justify-between pt-2 border-t border-white/10 text-[11px] font-mono text-slate-400">
          <div>TOP RECORD: {highScore}</div>
          <div className="flex gap-1.5">
            <button
              onMouseDown={() => (gameState.current.keys.left = true)}
              onMouseUp={() => (gameState.current.keys.left = false)}
              onTouchStart={() => (gameState.current.keys.left = true)}
              onTouchEnd={() => (gameState.current.keys.left = false)}
              className="px-3 py-1 bg-white/5 border border-white/10 rounded active:bg-cyan-500/20"
            >
              ←
            </button>
            <button
              onMouseDown={() => (gameState.current.keys.fire = true)}
              onMouseUp={() => (gameState.current.keys.fire = false)}
              onTouchStart={() => (gameState.current.keys.fire = true)}
              onTouchEnd={() => (gameState.current.keys.fire = false)}
              className="px-4 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded font-bold"
            >
              FIRE
            </button>
            <button
              onMouseDown={() => (gameState.current.keys.right = true)}
              onMouseUp={() => (gameState.current.keys.right = false)}
              onTouchStart={() => (gameState.current.keys.right = true)}
              onTouchEnd={() => (gameState.current.keys.right = false)}
              className="px-3 py-1 bg-white/5 border border-white/10 rounded active:bg-cyan-500/20"
            >
              →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
