import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import './App.css';

const COIN_COUNT = 2000;

function App() {
  const canvasRef = useRef(null);
  const titleRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = 412;
    canvas.height = 915;

    const coinImg = new Image();
    coinImg.src = '/coin.png';

    const coins = [];
    for (let i = 0; i < COIN_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const startRadius = 800 + Math.random() * 200;
      coins.push({
        angle,
        startRadius,
        radius: startRadius,
        rotation: Math.PI / 2 + Math.random() * 0.3,
        duration: 1.4 + Math.random() * 0.8,
        delay: Math.random() * 0.6,
        size: 120 + Math.random() * 80,
        progress: 0,
        alive: true,
      });
    }

    let startTime = null;
    let animId;

    function easeIn(t) {
      return t * t;
    }

    function frame(timestamp) {
      if (!startTime) startTime = timestamp;
      const elapsed = (timestamp - startTime) / 1000;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let aliveCount = 0;

      for (let i = 0; i < coins.length; i++) {
        const c = coins[i];
        if (!c.alive) continue;

        const t = elapsed - c.delay;
        if (t < 0) { aliveCount++; continue; }

        const raw = Math.min(t / c.duration, 1);
        c.progress = easeIn(raw);

        if (raw >= 1) {
          c.alive = false;
          continue;
        }

        aliveCount++;

        const currentRadius = c.startRadius * (1 - c.progress);
        const currentAngle = c.angle + c.rotation * c.progress;
        const x = canvas.width / 2 + Math.cos(currentAngle) * currentRadius;
        const y = canvas.height / 2 + Math.sin(currentAngle) * currentRadius;

        const scale = 1 - c.progress * 0.8;
        const size = c.size * scale;
        const alpha = raw > 0.85 ? (1 - raw) / 0.15 : Math.min(t / 0.1, 1);

        ctx.globalAlpha = alpha;
        ctx.drawImage(coinImg, x - size / 2, y - size / 2, size, size);
      }

      ctx.globalAlpha = 1;

      if (aliveCount > 0) {
        animId = requestAnimationFrame(frame);
      }
    }

    coinImg.onload = () => {
      animId = requestAnimationFrame(frame);
    };

    // Title: zoom in, bounce, then zoom out
    const titleTl = gsap.timeline({ delay: 0.8 });
    gsap.set(titleRef.current, { scale: 0, opacity: 0 });

    titleTl
      .to(titleRef.current, {
        scale: 1.15,
        opacity: 1,
        duration: 0.5,
        ease: 'back.out(3)',
      })
      .to(titleRef.current, {
        scale: 1,
        duration: 0.3,
        ease: 'power2.out',
      })
      .to(titleRef.current, {
        scale: 1.05,
        duration: 0.25,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: 3,
      })
      .to(titleRef.current, {
        scale: 0,
        opacity: 0,
        duration: 0.4,
        ease: 'back.in(2)',
        delay: 0.2,
      });

    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="app">
      <canvas ref={canvasRef} className="drain-canvas" />
      <div className="center-glow" />
      <img
        ref={titleRef}
        src="/loottitle.gif"
        alt="Loot"
        className="title"
      />
    </div>
  );
}

export default App;
