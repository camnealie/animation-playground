import React, { useEffect, useRef } from 'react';
import Matter from 'matter-js';
import './App2.css';

const W = 412;
const H = 915;
const CARD_COUNT = 52;
const CARD_W = 70;
const CARD_H = 100;
const DEAL_INTERVAL = 80;
const HOLD_DELAY = 1200;
const WALL_THICKNESS = 40;

const SUITS = ['\u2660', '\u2665', '\u2666', '\u2663']; // spade, heart, diamond, club
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

function App4() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = W;
    canvas.height = H;

    const { Engine, World, Bodies, Body } = Matter;

    const engine = Engine.create();
    engine.gravity.y = 1.5;

    const wallLeft = Bodies.rectangle(-WALL_THICKNESS / 2, H / 2, WALL_THICKNESS, H * 2, { isStatic: true });
    const wallRight = Bodies.rectangle(W + WALL_THICKNESS / 2, H / 2, WALL_THICKNESS, H * 2, { isStatic: true });
    const floor = Bodies.rectangle(W / 2, H + WALL_THICKNESS / 2, W + WALL_THICKNESS * 2, WALL_THICKNESS, { isStatic: true });

    World.add(engine.world, [wallLeft, wallRight, floor]);

    const cardBodies = [];
    let cardsDealt = 0;
    let lastDealTime = 0;
    let holdStart = null;
    let phase = 'deal';

    // Build shuffled deck
    const deck = [];
    for (let s = 0; s < 4; s++) {
      for (let r = 0; r < 13; r++) {
        deck.push({ suit: SUITS[s], rank: RANKS[r], red: s === 1 || s === 2 });
      }
    }
    // Shuffle
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    function dealCard() {
      // Deal from top center, fan out with random angle and velocity
      const x = W / 2 + (Math.random() - 0.5) * 60;
      const y = -CARD_H;
      const body = Bodies.rectangle(x, y, CARD_W * 0.9, CARD_H * 0.9, {
        restitution: 0.3,
        friction: 0.4,
        frictionAir: 0.01,
        density: 0.001,
        chamfer: { radius: 5 },
      });

      // Give it a sideways flick
      const vx = (Math.random() - 0.5) * 8;
      const vy = 2 + Math.random() * 3;
      Body.setVelocity(body, { x: vx, y: vy });
      Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.15);

      body.card = deck[cardsDealt];
      World.add(engine.world, body);
      cardBodies.push(body);
      cardsDealt++;
    }

    let animId;
    let startTime = null;

    function frame(timestamp) {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;

      if (phase === 'deal') {
        if (cardsDealt < CARD_COUNT && elapsed - lastDealTime > DEAL_INTERVAL) {
          dealCard();
          lastDealTime = elapsed;
        }
        if (cardsDealt >= CARD_COUNT) {
          phase = 'hold';
          holdStart = timestamp;
        }
      }

      if (phase === 'hold') {
        if (timestamp - holdStart > HOLD_DELAY) {
          phase = 'sweep';
          World.remove(engine.world, floor);
          // Add a strong horizontal wind to sweep cards
          engine.gravity.x = 3;
          engine.gravity.y = 2;
        }
      }

      if (phase === 'sweep') {
        const anyVisible = cardBodies.some(b =>
          b.position.x < W + 200 && b.position.y < H + 200
        );
        if (!anyVisible) {
          phase = 'end';
        }
      }

      Engine.update(engine, 1000 / 60);

      ctx.clearRect(0, 0, W, H);

      for (const body of cardBodies) {
        const { x, y } = body.position;
        if (x > W + 300 || y > H + 300) continue;

        const card = body.card;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(body.angle);

        // Card background
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(-CARD_W / 2, -CARD_H / 2, CARD_W, CARD_H, 5);
        ctx.fill();
        ctx.stroke();

        // Card content
        ctx.fillStyle = card.red ? '#d32f2f' : '#222';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(card.rank, -CARD_W / 2 + 6, -CARD_H / 2 + 5);
        ctx.fillText(card.suit, -CARD_W / 2 + 6, -CARD_H / 2 + 20);

        // Center suit
        ctx.font = '32px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(card.suit, 0, 5);

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

export default App4;
