import React, { useEffect, useRef } from 'react';
import Matter from 'matter-js';
import './App2.css';

const W = 412;
const H = 915;
const COIN_COUNT = 120;
const COIN_RADIUS_MIN = 22;
const COIN_RADIUS_MAX = 50;
const COINS_PER_TICK = 3;
const SPAWN_INTERVAL = 25;
const HOLD_DELAY = 1000;
const WALL_THICKNESS = 40;

function App3() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = W;
    canvas.height = H;

    const { Engine, World, Bodies } = Matter;

    const engine = Engine.create();
    // Negative gravity = coins float up
    engine.gravity.y = -1.8;

    // Walls: left, right, ceiling
    const wallLeft = Bodies.rectangle(-WALL_THICKNESS / 2, H / 2, WALL_THICKNESS, H * 2, { isStatic: true });
    const wallRight = Bodies.rectangle(W + WALL_THICKNESS / 2, H / 2, WALL_THICKNESS, H * 2, { isStatic: true });
    const ceiling = Bodies.rectangle(W / 2, -WALL_THICKNESS / 2, W + WALL_THICKNESS * 2, WALL_THICKNESS, { isStatic: true });

    World.add(engine.world, [wallLeft, wallRight, ceiling]);

    // Load coin image
    const coinImg = new Image();
    coinImg.src = '/coin.png';

    const coinBodies = [];
    let coinsSpawned = 0;
    let lastSpawnTime = 0;
    let holdStart = null;
    let phase = 'fill';

    function spawnCoin() {
      const r = COIN_RADIUS_MIN + Math.random() * (COIN_RADIUS_MAX - COIN_RADIUS_MIN);
      const x = r + Math.random() * (W - r * 2);
      const y = H + r + Math.random() * 100;
      const body = Bodies.circle(x, y, r, {
        restitution: 0.4,
        friction: 0.3,
        frictionAir: 0.01,
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

      if (phase === 'fill') {
        const progress = coinsSpawned / COIN_COUNT;
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

      if (phase === 'hold') {
        if (timestamp - holdStart > HOLD_DELAY) {
          phase = 'drop';
          World.remove(engine.world, ceiling);
        }
      }

      if (phase === 'drop') {
        const anyVisible = coinBodies.some(b => b.position.y > -200);
        if (!anyVisible) {
          phase = 'end';
        }
      }

      Engine.update(engine, 1000 / 60);

      ctx.clearRect(0, 0, W, H);

      const imgScale = 1 / 0.85;
      for (const body of coinBodies) {
        const { x, y } = body.position;
        if (y < -300) continue;

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

export default App3;
