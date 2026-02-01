# Coin Drag Transfer Animation Brief

> **Source**: `index1.html` (standalone HTML file with embedded CSS/JS)
> **Purpose**: Drag-to-transfer interaction where users pull a "coin" out of an envelope and drop it on another to transfer money.

---

## Overview

This is a **single-file vanilla JS implementation** of a satisfying drag-and-drop money transfer interaction. Users drag from one envelope tile, a coin "pops out" with physics, follows their finger with orbital float, and when dropped on another envelope, coins fly with gravity physics into the target.

---

## Core Interaction Flow

```
1. PRESS on envelope
   └─> Envelope stretches toward finger (elastic deformation)
   └─> Haptic "creak" vibrations increase with tension

2. DRAG past threshold (80px)
   └─> Coin POPS out with burst effect + sparks
   └─> Envelope snaps back with spring animation
   └─> Coin zips to finger position, then orbits around it

3. HOVER over target envelope
   └─> Target highlights
   └─> Preview badges show "+$5" / "-$5"

4. RELEASE over target
   └─> Multiple coins fly from source → target with gravity physics
   └─> Source amount ticks down as coins leave
   └─> Target amount ticks up as coins land
   └─> Haptic feedback on each coin landing
```

---

## Key Components

### 1. Envelope Tiles (`.box`)
```css
/* White card with colored icon badge */
.box {
  background: #fff;
  border-radius: 14px;
  padding: 16px 8px 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.box-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  /* Gem-like 3D effect with inset shadows */
  box-shadow:
    inset 0 3px 6px rgba(255,255,255,0.5),
    inset 0 -3px 6px rgba(0,0,0,0.25);
}
```

### 2. Elastic Drag Deformation
```javascript
// Envelope stretches toward finger, squashes perpendicular
const tension = Math.min(dist / POP_THRESHOLD, 1);
const stretchAmount = 1 + tension * 0.25;   // up to 1.25x
const squashAmount = 1 - tension * 0.12;    // down to 0.88x
const angleDeg = angle * (180 / Math.PI);

box.style.transform = `
  translate(${moveX}px, ${moveY}px)
  rotate(${angleDeg}deg)
  scale(${stretchAmount}, ${squashAmount})
  rotate(${-angleDeg}deg)
`;
```

### 3. Coin Pop + Snap-back
```javascript
// When drag exceeds threshold:
// 1. Spawn burst ring + sparks at envelope center
spawnBurst(boxCenterX, boxCenterY);

// 2. Envelope snaps back with spring animation
box.animate([
  { transform: currentTransform },
  { transform: `translate(${-mx*2}px, ${-my*2}px) scale(0.85)`, offset: 0.12 },
  { transform: `translate(${mx}px, ${my}px) scale(1.1)`, offset: 0.28 },
  // ... oscillating keyframes
  { transform: 'translate(0, 0) scale(1)' },
], { duration: 700 });

// 3. Coin zips from box center to finger
// Uses lerp: coinPos += (fingerPos - coinPos) * 0.35
```

### 4. Coin Orbit Physics
```javascript
// Coin floats around finger with physics
const FLOAT_GRAVITY = 0.15;
const FLOAT_DAMPING = 0.94;
const FLOAT_WANDER = 0.3;

function orbitTick() {
  // Pull toward finger
  coinState.vx += (fingerX - coinState.x) / dist * FLOAT_GRAVITY;
  coinState.vy += (fingerY - coinState.y) / dist * FLOAT_GRAVITY;

  // Random wander
  coinState.vx += (Math.random() - 0.5) * FLOAT_WANDER;
  coinState.vy += (Math.random() - 0.5) * FLOAT_WANDER;

  // Damping
  coinState.vx *= FLOAT_DAMPING;
  coinState.vy *= FLOAT_DAMPING;

  // Rotation based on speed
  coinState.rotation += speed * 3;
}
```

### 5. Transfer Animation (Gravity Physics)
```javascript
const GRAVITY = 0.08;
const DRAG = 0.98;
const ABSORB_RADIUS = 45;

function coinTick(particle) {
  // Inverse-square gravity toward target
  const force = GRAVITY * Math.max(1, 8000 / distSq);
  p.vx += (dx / dist) * force;
  p.vy += (dy / dist) * force;

  // Constant inward drift (prevents orbiting)
  p.vx += (dx / dist) * 0.25;
  p.vy += (dy / dist) * 0.25;

  // Air drag
  p.vx *= DRAG;
  p.vy *= DRAG;

  // Bounce off screen edges
  if (p.x < COIN_R) { p.x = COIN_R; p.vx = Math.abs(p.vx) * 0.6; }

  // Absorb when close to target
  if (dist < ABSORB_RADIUS) {
    // Coin lands - update amounts, haptic, bounce animation
  }
}
```

### 6. Haptic Feedback
```javascript
// Creak while dragging (tension-based interval)
function doCreak(tension) {
  const interval = 120 - tension * 95; // faster as tension increases
  if (now - lastCreakTime >= interval) {
    navigator.vibrate(8 + tension * 8);
    lastCreakTime = now;
  }
}

// Pop: navigator.vibrate([0, 10, 40])
// Coin land: navigator.vibrate(8)
// Final land: navigator.vibrate(25)
```

---

## Visual Effects

### Burst Ring
```css
@keyframes burstRing {
  0% {
    opacity: 0.7;
    transform: scale(1);
    box-shadow: 0 0 0 3px rgba(241, 196, 15, 0.8);
  }
  100% {
    opacity: 0;
    transform: scale(2.5);
  }
}
```

### Spark Particles
```javascript
// 8 sparks burst outward from pop point
for (let i = 0; i < 8; i++) {
  const angle = (Math.PI * 2 / 8) * i + random;
  const dist = 30 + Math.random() * 25;
  spark.style.setProperty('--sx', `${Math.cos(angle) * dist}px`);
  spark.style.setProperty('--sy', `${Math.sin(angle) * dist}px`);
}
```

### Trail Sparks (Pixelated)
```css
.trail-spark {
  border-radius: 0;  /* Square pixels */
  image-rendering: pixelated;
  animation: steps(6);  /* Stepped animation for retro feel */
}
```

---

## Data Model

```javascript
const envelopes = [
  { name: 'Groceries', value: 12050, color: '#e57373', icon: 'shopping_cart' },
  { name: 'Dining', value: 4500, color: '#9575cd', icon: 'restaurant' },
  // ...
];

// Values in cents, displayed as dollars
function formatAmount(cents) {
  return '$' + (cents / 100).toFixed(0);
}
```

---

## Constants to Tune

| Constant | Value | Purpose |
|----------|-------|---------|
| `DRAG_LIMIT` | 20 | Max pixels envelope moves before popping |
| `POP_THRESHOLD` | 80 | Distance to trigger coin pop |
| `TRANSFER_CENTS` | 500 | Amount per transfer ($5) |
| `FLOAT_GRAVITY` | 0.15 | How strongly coin pulls toward finger |
| `FLOAT_DAMPING` | 0.94 | Coin velocity decay |
| `GRAVITY` | 0.08 | Transfer coin gravity strength |
| `ABSORB_RADIUS` | 45 | Distance to "catch" coin at target |

---

## Integration Notes

1. **Dependencies**: None (vanilla JS), uses Material Symbols font for icons
2. **Haptics**: Uses `navigator.vibrate()` - wrap in feature detection
3. **Touch**: Uses pointer events for unified mouse/touch handling
4. **Performance**: Uses `requestAnimationFrame` for all animations
5. **State**: Track `dragState` object with phase: `null | 'zipping' | 'free' | 'dead'`

---

## Files to Extract

If porting to React/component architecture:
- **EnvelopeTile**: The `.box` component with icon, label, amount, bar
- **CoinDrag**: Hook/context managing drag state and coin position
- **TransferAnimation**: Spawns and animates coins between points
- **HapticFeedback**: Utility for vibration patterns
