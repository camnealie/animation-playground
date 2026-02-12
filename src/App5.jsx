import React, { useEffect, useRef } from 'react';
import Matter from 'matter-js';
import './App2.css';

const W = 412;
const H = 915;
const HOLD_DELAY = 800;

function App5() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = W;
    canvas.height = H;

    const { Engine, World, Bodies, Body, Vertices } = Matter;

    const engine = Engine.create();
    engine.gravity.y = 0;

    // Generate triangular shards using a grid-based approach
    const shards = [];
    const cols = 8;
    const rows = 16;
    const cellW = W / cols;
    const cellH = H / rows;

    // Create grid points with jitter
    const points = [];
    for (let row = 0; row <= rows; row++) {
      points[row] = [];
      for (let col = 0; col <= cols; col++) {
        const jitterX = (col === 0 || col === cols) ? 0 : (Math.random() - 0.5) * cellW * 0.6;
        const jitterY = (row === 0 || row === rows) ? 0 : (Math.random() - 0.5) * cellH * 0.6;
        points[row][col] = {
          x: col * cellW + jitterX,
          y: row * cellH + jitterY,
        };
      }
    }

    // Create triangles from grid
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const tl = points[row][col];
        const tr = points[row][col + 1];
        const bl = points[row + 1][col];
        const br = points[row + 1][col + 1];

        // Two triangles per cell
        const tri1 = [tl, tr, bl];
        const tri2 = [tr, br, bl];

        [tri1, tri2].forEach(verts => {
          const cx = (verts[0].x + verts[1].x + verts[2].x) / 3;
          const cy = (verts[0].y + verts[1].y + verts[2].y) / 3;

          // Convert to Matter vertices (relative to center)
          const matterVerts = verts.map(v => ({ x: v.x - cx, y: v.y - cy }));

          const body = Bodies.fromVertices(cx, cy, matterVerts, {
            restitution: 0.2,
            friction: 0.3,
            frictionAir: 0.01,
            density: 0.001,
          });

          if (body) {
            body.shardColor = `hsl(${200 + Math.random() * 40}, ${60 + Math.random() * 20}%, ${40 + Math.random() * 20}%)`;
            body.originalVerts = verts;
            shards.push(body);
          }
        });
      }
    }

    World.add(engine.world, shards);

    let animId;
    let startTime = null;
    let holdStart = null;
    let phase = 'hold';

    function frame(timestamp) {
      if (!startTime) startTime = timestamp;

      if (phase === 'hold') {
        if (!holdStart) holdStart = timestamp;
        if (timestamp - holdStart > HOLD_DELAY) {
          phase = 'explode';
          // Explode from center
          const centerX = W / 2;
          const centerY = H / 2;
          shards.forEach(body => {
            const dx = body.position.x - centerX;
            const dy = body.position.y - centerY;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const force = 0.08 + Math.random() * 0.06;
            Body.setVelocity(body, {
              x: (dx / dist) * force * 60,
              y: (dy / dist) * force * 60,
            });
            Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.3);
          });
          engine.gravity.y = 0.5;
        }
      }

      if (phase === 'explode') {
        const anyVisible = shards.some(b =>
          b.position.x > -100 && b.position.x < W + 100 &&
          b.position.y > -100 && b.position.y < H + 300
        );
        if (!anyVisible) {
          phase = 'end';
        }
      }

      Engine.update(engine, 1000 / 60);

      ctx.clearRect(0, 0, W, H);

      for (const body of shards) {
        const { x, y } = body.position;
        if (x < -200 || x > W + 200 || y < -200 || y > H + 400) continue;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(body.angle);

        const verts = body.vertices;
        ctx.beginPath();
        ctx.moveTo(verts[0].x - x, verts[0].y - y);
        for (let i = 1; i < verts.length; i++) {
          ctx.lineTo(verts[i].x - x, verts[i].y - y);
        }
        ctx.closePath();

        ctx.fillStyle = body.shardColor;
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.restore();
      }

      if (phase !== 'end') {
        animId = requestAnimationFrame(frame);
      }
    }

    animId = requestAnimationFrame(frame);

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

export default App5;
