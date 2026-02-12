import React, { useEffect, useRef } from 'react';
import Matter from 'matter-js';
import './App2.css';

const W = 412;
const H = 915;
const COIN_COUNT = 150;
const COIN_RADIUS_MIN = 22;
const COIN_RADIUS_MAX = 50;
const COINS_PER_TICK = 4;
const SPAWN_INTERVAL = 20;   // ms between spawn ticks
const HOLD_DELAY = 800;      // ms to hold after all coins spawned
const BODY_RESTITUTION = 0.3;
const WALL_THICKNESS = 40;

function App2() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = W;
    canvas.height = H;

    const { Engine, World, Bodies, Events } = Matter;

    const engine = Engine.create();
    engine.gravity.y = 1.2;

    // Walls: left, right, floor
    const wallLeft = Bodies.rectangle(-WALL_THICKNESS / 2, H / 2, WALL_THICKNESS, H * 2, { isStatic: true });
    const wallRight = Bodies.rectangle(W + WALL_THICKNESS / 2, H / 2, WALL_THICKNESS, H * 2, { isStatic: true });
    const floor = Bodies.rectangle(W / 2, H + WALL_THICKNESS / 2, W + WALL_THICKNESS * 2, WALL_THICKNESS, { isStatic: true });

    World.add(engine.world, [wallLeft, wallRight, floor]);

    // Load coin image
    const coinImg = new Image();
    coinImg.src = '/coin.png';

    // Track coin bodies
    const coinBodies = [];
    let coinsSpawned = 0;
    let lastSpawnTime = 0;
    let floorRemoved = false;
    let holdStart = null;
    let phase = 'fill'; // 'fill' | 'hold' | 'drop' | 'end'

    function spawnCoin() {
      const r = COIN_RADIUS_MIN + Math.random() * (COIN_RADIUS_MAX - COIN_RADIUS_MIN);
      const x = r + Math.random() * (W - r * 2);
      const y = -r * 2 - Math.random() * 80;
      const body = Bodies.circle(x, y, r, {
        restitution: BODY_RESTITUTION,
        friction: 0.3,
        density: 0.002,
      });
      body.coinRadius = r;
      World.add(engine.world, body);
      coinBodies.push(body);
      coinsSpawned++;
    }

    let animId;
    let startTime = null;

    function frame(timestamp) {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;

      // --- Spawning phase (ramps up over time) ---
      if (phase === 'fill') {
        const progress = coinsSpawned / COIN_COUNT; // 0 → 1
        const perTick = Math.max(1, Math.floor(1 + progress * (COINS_PER_TICK - 1)));
        if (coinsSpawned < COIN_COUNT && elapsed - lastSpawnTime > SPAWN_INTERVAL) {
          for (let i = 0; i < perTick && coinsSpawned < COIN_COUNT; i++) {
            spawnCoin();
          }
          lastSpawnTime = elapsed;
        }
        if (coinsSpawned >= COIN_COUNT) {
          phase = 'hold';
          holdStart = timestamp;
        }
      }

      // --- Hold phase ---
      if (phase === 'hold') {
        if (timestamp - holdStart > HOLD_DELAY) {
          phase = 'drop';
          World.remove(engine.world, floor);
          floorRemoved = true;
        }
      }

      // --- Drop phase: check if all coins fell off screen ---
      if (phase === 'drop') {
        const anyVisible = coinBodies.some(b => b.position.y < H + 200);
        if (!anyVisible) {
          phase = 'end';
        }
      }

      // Step physics
      Engine.update(engine, 1000 / 60);

      // Render
      ctx.clearRect(0, 0, W, H);

      const imgScale = 1 / 0.85;
      for (const body of coinBodies) {
        const { x, y } = body.position;
        if (y > H + 300) continue;

        const drawR = body.coinRadius * imgScale;
        const drawSize = drawR * 2;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(body.angle);
        ctx.drawImage(coinImg, -drawR, -drawR, drawSize, drawSize);
        ctx.restore();
      }

      if (phase !== 'end') {
        animId = requestAnimationFrame(frame);
      }
    }

    coinImg.onload = () => {
      animId = requestAnimationFrame(frame);
    };

    return () => {
      cancelAnimationFrame(animId);
      Engine.clear(engine);
    };
  }, []);

  return (
    <div className="app">
      <canvas ref={canvasRef} className="coin-canvas" />
    </div>
  );
}

export default App2;
