import React, { useState, useRef, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { Flip } from 'gsap/Flip';
import './ReloadCeremony.css';

gsap.registerPlugin(Flip);

// MUI Icons
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import MovieIcon from '@mui/icons-material/Movie';
import SpaIcon from '@mui/icons-material/Spa';
import RepeatIcon from '@mui/icons-material/Repeat';
import HomeIcon from '@mui/icons-material/Home';
import CheckroomIcon from '@mui/icons-material/Checkroom';
import SavingsIcon from '@mui/icons-material/Savings';
import FlightIcon from '@mui/icons-material/Flight';
import LaptopIcon from '@mui/icons-material/Laptop';
import CelebrationIcon from '@mui/icons-material/Celebration';
import TargetIcon from '@mui/icons-material/GpsFixed';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import WorkIcon from '@mui/icons-material/Work';
import MoveToInboxIcon from '@mui/icons-material/MoveToInbox';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';

// Demo data
const DEMO_DEBRIEF_CARDS = [
  { type: 'big_spender', Icon: TrendingUpIcon, title: 'Big Spender', value: '$342', description: 'Largest purchase at Noel Leeming' },
  { type: 'high_traffic', Icon: WhatshotIcon, title: 'High Traffic', value: '47', description: '47 transactions in Groceries' },
  { type: 'ghost_town', Icon: VisibilityOffIcon, title: 'Ghost Town', value: '$0', description: 'No activity in Clothing' },
];

const DEMO_SPENDING_ENVELOPES = [
  { id: 1, name: 'Groceries', Icon: ShoppingCartIcon, color: '#e57373', balance: 45.20, suggested: 600, history: [580, 620, 595] },
  { id: 2, name: 'Dining Out', Icon: RestaurantIcon, color: '#9575cd', balance: 23.00, suggested: 200, history: [185, 220, 190] },
  { id: 3, name: 'Transport', Icon: DirectionsCarIcon, color: '#f06292', balance: 38.50, suggested: 150, history: [140, 165, 145] },
  { id: 4, name: 'Entertainment', Icon: MovieIcon, color: '#7986cb', balance: 35.00, suggested: 100, history: [85, 110, 95] },
  { id: 5, name: 'Appearance', Icon: SpaIcon, color: '#81c784', balance: 15.00, suggested: 60, history: [45, 80, 55] },
  { id: 6, name: 'Recurring', Icon: RepeatIcon, color: '#4db6ac', balance: 0, suggested: 80, history: [80, 80, 80] },
  { id: 7, name: 'Household', Icon: HomeIcon, color: '#64b5f6', balance: 0, suggested: 50, history: [35, 65, 48] },
  { id: 8, name: 'Gifts', Icon: CheckroomIcon, color: '#ffb74d', balance: 0, suggested: 100, history: [0, 150, 85] },
];

const DEMO_SAVING_ENVELOPES = [
  { id: 101, name: 'Emergency', Icon: SavingsIcon, color: '#4db6ac', balance: 4500, target: 10000, suggested: 200, isSavings: true, history: [200, 200, 200] },
  { id: 102, name: 'Holiday', Icon: FlightIcon, color: '#4dd0e1', balance: 1200, target: 3000, suggested: 150, isSavings: true, history: [150, 150, 150] },
  { id: 103, name: 'Tech Fund', Icon: LaptopIcon, color: '#7986cb', balance: 800, target: 1500, suggested: 100, isSavings: true, history: [100, 100, 100] },
];

// Month labels for spending history
const HISTORY_MONTHS = ['Nov', 'Dec', 'Jan'];

// Combined envelopes for allocation step - spending first, then savings
const ALL_ALLOCATION_ENVELOPES = [...DEMO_SPENDING_ENVELOPES, ...DEMO_SAVING_ENVELOPES];

const DEMO_INCOME = 1200;

const DEMO_INCOME_ENVELOPE = { id: 0, name: 'Income', Icon: AccountBalanceWalletIcon, color: '#9575cd', balance: DEMO_INCOME };

// Reusable envelope tile component matching app style
function EnvelopeTile({ envelope, amount, showProgress, progressPercent, isDraggable, onDragStart, isDropTarget, onDragOver, onDrop, isHighlighted, isFaded, tag, size = 'normal' }) {
  const Icon = envelope.Icon;
  const displayAmount = amount !== undefined ? amount : envelope.balance;

  return (
    <div
      className={`envelope-tile ${size} ${isHighlighted ? 'highlighted' : ''} ${isFaded ? 'faded' : ''}`}
      draggable={isDraggable}
      onDragStart={onDragStart}
      onDragOver={isDropTarget ? onDragOver : undefined}
      onDrop={isDropTarget ? onDrop : undefined}
    >
      {tag && <span className="envelope-tag">{tag}</span>}
      <div className="envelope-icon-badge" style={{ background: envelope.color }}>
        <Icon sx={{ fontSize: size === 'small' ? 20 : 28, color: '#fff' }} />
      </div>
      <span className="envelope-name">{envelope.name}</span>
      <span className="envelope-amount">${displayAmount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
      {showProgress && (
        <div className="envelope-progress">
          <div className="envelope-progress-fill" style={{ width: `${progressPercent || 0}%`, background: envelope.color }} />
        </div>
      )}
    </div>
  );
}

// Coin animation component - drain effect like index1
// Coins burst out of source envelope and spiral into target
function CoinStream({ from, to, count = 25, onComplete }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!from || !to || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const container = canvas.parentElement;
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;

    const coinImg = new Image();
    coinImg.src = '/coin.png';

    // Calculate the distance and angle between source and target
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const coins = [];
    for (let i = 0; i < count; i++) {
      // Random angle for initial burst direction
      const burstAngle = Math.random() * Math.PI * 2;
      // How far coins burst out before spiraling in
      const burstRadius = 30 + Math.random() * 50;

      coins.push({
        // Start at source
        startX: from.x,
        startY: from.y,
        // Burst outward first
        burstAngle,
        burstRadius,
        // Then spiral into target
        spiralRotation: (Math.PI * 0.8) + Math.random() * (Math.PI * 0.4),
        // Timing
        duration: 0.8 + Math.random() * 0.4,
        delay: Math.random() * 0.3,
        // Appearance
        size: 24 + Math.random() * 24,
        progress: 0,
        alive: true,
      });
    }

    let startTime = null;
    let animId;

    // Easing function - ease in for acceleration into target
    function easeInQuad(t) {
      return t * t;
    }

    function easeOutQuad(t) {
      return t * (2 - t);
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

        if (raw >= 1) {
          c.alive = false;
          continue;
        }

        aliveCount++;

        // Phase 1 (0-0.3): Burst out from source
        // Phase 2 (0.3-1): Spiral into target
        let x, y, size, alpha;

        if (raw < 0.25) {
          // Burst phase - coins explode outward from source
          const burstProgress = raw / 0.25;
          const eased = easeOutQuad(burstProgress);
          const currentBurstRadius = c.burstRadius * eased;

          x = c.startX + Math.cos(c.burstAngle) * currentBurstRadius;
          y = c.startY + Math.sin(c.burstAngle) * currentBurstRadius;
          size = c.size * (0.8 + 0.2 * eased);
          alpha = Math.min(burstProgress * 4, 1);
        } else {
          // Spiral phase - coins spiral into target
          const spiralProgress = (raw - 0.25) / 0.75;
          const eased = easeInQuad(spiralProgress);

          // Start position (end of burst)
          const burstEndX = c.startX + Math.cos(c.burstAngle) * c.burstRadius;
          const burstEndY = c.startY + Math.sin(c.burstAngle) * c.burstRadius;

          // Spiral from burst end to target
          const remainingDist = Math.sqrt(Math.pow(to.x - burstEndX, 2) + Math.pow(to.y - burstEndY, 2));
          const currentRadius = remainingDist * (1 - eased);
          const baseAngle = Math.atan2(to.y - burstEndY, to.x - burstEndX) + Math.PI;
          const currentAngle = baseAngle + c.spiralRotation * eased;

          x = to.x + Math.cos(currentAngle) * currentRadius;
          y = to.y + Math.sin(currentAngle) * currentRadius;

          // Shrink as approaching target
          size = c.size * (1 - eased * 0.7);

          // Fade out at the end
          alpha = spiralProgress > 0.85 ? (1 - spiralProgress) / 0.15 : 1;
        }

        ctx.globalAlpha = alpha;
        if (coinImg.complete) {
          ctx.drawImage(coinImg, x - size / 2, y - size / 2, size, size);
        }
      }

      ctx.globalAlpha = 1;

      if (aliveCount > 0) {
        animId = requestAnimationFrame(frame);
      } else {
        if (onComplete) onComplete();
      }
    }

    if (coinImg.complete) {
      animId = requestAnimationFrame(frame);
    } else {
      coinImg.onload = () => {
        animId = requestAnimationFrame(frame);
      };
    }

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [from, to, count, onComplete]);

  return <canvas ref={canvasRef} className="coin-canvas" />;
}

// Horizontal spending chart for drawer
function HorizontalSpendingChart({ history, suggested, color }) {
  const maxVal = Math.max(...history, suggested);

  return (
    <div className="horizontal-chart">
      {history.map((val, i) => (
        <div key={i} className="h-chart-row">
          <span className="h-chart-label">{HISTORY_MONTHS[i]}</span>
          <div className="h-chart-bar-track">
            <div
              className="h-chart-bar"
              style={{
                width: `${(val / maxVal) * 100}%`,
                background: color,
                opacity: 0.5 + (i * 0.2)
              }}
            />
          </div>
          <span className="h-chart-value">${val}</span>
        </div>
      ))}
      <div className="h-chart-row suggested">
        <span className="h-chart-label">Suggested</span>
        <div className="h-chart-bar-track">
          <div
            className="h-chart-bar"
            style={{
              width: `${(suggested / maxVal) * 100}%`,
              background: '#4ade80'
            }}
          />
        </div>
        <span className="h-chart-value suggested-value">${suggested}</span>
      </div>
    </div>
  );
}

// Spending details modal
function SpendingDetailsModal({ envelope, onClose }) {
  if (!envelope) return null;

  const history = envelope.history || [];
  const maxVal = Math.max(...history, envelope.suggested);
  const avg = history.length > 0 ? Math.round(history.reduce((a, b) => a + b, 0) / history.length) : 0;
  const trend = history.length >= 2 ? history[history.length - 1] - history[0] : 0;

  return (
    <div className="spending-modal-overlay" onClick={onClose}>
      <div className="spending-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="envelope-icon-badge" style={{ background: envelope.color }}>
            <envelope.Icon sx={{ fontSize: 24, color: '#fff' }} />
          </div>
          <h2>{envelope.name} Spending</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-stats">
          <div className="modal-stat">
            <span className="stat-value">${avg}</span>
            <span className="stat-label">3-month avg</span>
          </div>
          <div className="modal-stat">
            <span className="stat-value" style={{ color: trend > 0 ? '#f87171' : trend < 0 ? '#4ade80' : '#fff' }}>
              {trend > 0 ? '+' : ''}{trend === 0 ? '—' : `$${trend}`}
            </span>
            <span className="stat-label">Trend</span>
          </div>
          <div className="modal-stat">
            <span className="stat-value" style={{ color: '#4ade80' }}>${envelope.suggested}</span>
            <span className="stat-label">Suggested</span>
          </div>
        </div>

        <div className="modal-chart">
          {history.map((val, i) => (
            <div key={i} className="modal-bar-container">
              <div className="modal-bar-wrapper">
                <div
                  className="modal-bar"
                  style={{
                    height: `${(val / maxVal) * 100}%`,
                    background: envelope.color
                  }}
                />
              </div>
              <span className="modal-bar-label">{HISTORY_MONTHS[i]}</span>
              <span className="modal-bar-value">${val}</span>
            </div>
          ))}
        </div>

        <p className="modal-explanation">
          Suggested amount is based on your average spending of ${avg}/month over the last 3 months
          {trend !== 0 && (
            <>, with spending {trend > 0 ? 'increasing' : 'decreasing'} by ${Math.abs(trend)}</>
          )}.
        </p>

        <button className="modal-done-btn" onClick={onClose}>Got it</button>
      </div>
    </div>
  );
}

// Floating badge component
function FloatingBadge({ text, position, onComplete }) {
  const badgeRef = useRef(null);

  useEffect(() => {
    if (!badgeRef.current || !position) return;

    gsap.fromTo(
      badgeRef.current,
      { opacity: 0, y: 0, scale: 0.8 },
      {
        opacity: 1,
        y: -20,
        scale: 1,
        duration: 0.3,
        ease: 'back.out(2)',
        onComplete: () => {
          gsap.to(badgeRef.current, {
            opacity: 0,
            y: -60,
            duration: 0.8,
            delay: 0.6,
            ease: 'power2.out',
            onComplete,
          });
        },
      }
    );
  }, [position, onComplete]);

  if (!position) return null;

  return (
    <div
      ref={badgeRef}
      className="floating-badge"
      style={{ left: position.x, top: position.y }}
    >
      {text}
    </div>
  );
}

// Step 1: Debrief
function DebriefStep({ onNext }) {
  const cardsRef = useRef([]);
  const headerRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    // Header fades in first
    if (headerRef.current) {
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
      );
    }

    // Cards fade in one after another with longer delays
    cardsRef.current.forEach((card, i) => {
      if (card) {
        gsap.fromTo(
          card,
          { opacity: 0, x: -30 },
          { opacity: 1, x: 0, duration: 0.5, delay: 0.5 + i * 0.4, ease: 'power2.out' }
        );
      }
    });

    // Button fades in after all cards
    if (buttonRef.current) {
      gsap.fromTo(
        buttonRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, delay: 0.5 + DEMO_DEBRIEF_CARDS.length * 0.4 + 0.2, ease: 'power2.out' }
      );
    }
  }, []);

  // Demo summary data
  const lastRound = {
    startDate: 'Jan 1',
    endDate: 'Jan 31',
    totalBudgeted: 1340,
    totalSpent: 1183,
    leftover: 157,
  };

  return (
    <div className="step-container debrief-step">
      <div className="step-header" ref={headerRef}>
        <h1>Time to Reload!</h1>
        <p className="step-subtitle">Here's how your last round went...</p>
      </div>

      <div className="round-summary">
        <div className="summary-period">{lastRound.startDate} – {lastRound.endDate}</div>
        <div className="summary-stats">
          <div className="summary-stat">
            <span className="stat-label">Budgeted</span>
            <span className="stat-value">${lastRound.totalBudgeted.toLocaleString()}</span>
          </div>
          <div className="summary-stat">
            <span className="stat-label">Spent</span>
            <span className="stat-value">${lastRound.totalSpent.toLocaleString()}</span>
          </div>
          <div className="summary-stat highlight">
            <span className="stat-label">Leftover</span>
            <span className="stat-value">${lastRound.leftover.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="insights-label">Highlights</div>
      <div className="debrief-cards">
        {DEMO_DEBRIEF_CARDS.map((card, i) => (
          <div
            key={card.type}
            ref={el => (cardsRef.current[i] = el)}
            className={`debrief-card ${card.type.replace('_', '-')}`}
            style={{ opacity: 0 }}
          >
            <div className="card-icon">
              <card.Icon sx={{ fontSize: 32 }} />
            </div>
            <div className="card-content">
              <div className="card-header">
                <span className="card-title">{card.title}</span>
                <span className="card-value">{card.value}</span>
              </div>
              <p className="card-description">{card.description}</p>
            </div>
          </div>
        ))}
      </div>

      <button className="primary-button" onClick={onNext} ref={buttonRef} style={{ opacity: 0 }}>
        Let's Reload
      </button>
    </div>
  );
}

// Step 2: Leftovers - with full drag interaction from index1.html
function LeftoversStep({ onNext, onEnvelopesUpdate }) {
  const [envelopes, setEnvelopes] = useState(
    DEMO_SPENDING_ENVELOPES.filter(e => e.balance > 0).map(e => ({ ...e, transferred: false }))
  );
  const [floatingBadge, setFloatingBadge] = useState(null);
  const [incomeAdded, setIncomeAdded] = useState(0);
  const [savingsAdded, setSavingsAdded] = useState({}); // { envelopeId: addedAmount }
  const [currentDropTarget, setCurrentDropTarget] = useState(null);

  const containerRef = useRef(null);
  const envelopeRefs = useRef({});
  const targetRefs = useRef({});
  const coinRef = useRef(null);
  const burstRef = useRef(null);
  const dragStateRef = useRef(null);
  const lastCreakTimeRef = useRef(0);
  const floatRAFRef = useRef(null);
  const trailIntervalRef = useRef(null);

  // Constants from index1.html
  const DRAG_LIMIT = 20;
  const POP_THRESHOLD = 80;
  const CREAK_INTERVAL_MAX = 120;
  const CREAK_INTERVAL_MIN = 25;
  const CREAK_BUZZ_MS = 8;
  const COIN_SCALE = 0.7;
  const FLOAT_GRAVITY = 0.15;
  const FLOAT_DAMPING = 0.94;
  const FLOAT_MAX_DIST = 40;
  const FLOAT_WANDER = 0.3;

  // Coin orbit state
  const coinStateRef = useRef({ x: 0, y: 0, vx: 0, vy: 0, rotation: 0 });

  // Haptic creak
  const doCreak = useCallback((tension) => {
    if (!navigator.vibrate) return;
    const now = performance.now();
    const interval = CREAK_INTERVAL_MAX - tension * (CREAK_INTERVAL_MAX - CREAK_INTERVAL_MIN);
    if (now - lastCreakTimeRef.current >= interval) {
      const buzzDuration = Math.round(CREAK_BUZZ_MS + tension * 8);
      navigator.vibrate(buzzDuration);
      lastCreakTimeRef.current = now;
    }
  }, []);

  // Spawn burst effect
  const spawnBurst = useCallback((cx, cy) => {
    const container = containerRef.current;
    if (!container) return;
    const containerRect = container.getBoundingClientRect();

    // Burst ring
    if (burstRef.current) {
      burstRef.current.style.left = `${cx - containerRect.left - 20}px`;
      burstRef.current.style.top = `${cy - containerRect.top - 20}px`;
      burstRef.current.className = 'coin-burst';
      void burstRef.current.offsetWidth;
      burstRef.current.className = 'coin-burst go';
    }

    // Sparks (reduced for performance)
    const SPARK_COUNT = 5;
    for (let i = 0; i < SPARK_COUNT; i++) {
      const spark = document.createElement('div');
      spark.className = 'spark';
      const angle = (Math.PI * 2 / SPARK_COUNT) * i + (Math.random() - 0.5) * 0.5;
      const dist = 25 + Math.random() * 20;
      spark.style.left = `${cx - containerRect.left - 2}px`;
      spark.style.top = `${cy - containerRect.top - 2}px`;
      spark.style.setProperty('--sx', `${Math.cos(angle) * dist}px`);
      spark.style.setProperty('--sy', `${Math.sin(angle) * dist}px`);
      container.appendChild(spark);
      void spark.offsetWidth;
      spark.classList.add('go');
      spark.addEventListener('animationend', () => spark.remove());
    }
  }, []);

  // Trail spark
  const spawnTrailSpark = useCallback((x, y) => {
    const container = containerRef.current;
    if (!container) return;
    const containerRect = container.getBoundingClientRect();

    const spark = document.createElement('div');
    spark.className = 'trail-spark';
    const sizes = [3, 4, 5, 6];
    const size = sizes[Math.floor(Math.random() * sizes.length)];
    const gridSize = 4;
    const spread = 16;
    const dx = Math.round((Math.random() - 0.5) * spread / gridSize) * gridSize;
    const dy = Math.round((Math.random() - 0.5) * spread / gridSize) * gridSize;

    spark.style.width = `${size}px`;
    spark.style.height = `${size}px`;
    spark.style.left = `${Math.round((x - containerRect.left) / 2) * 2 + dx}px`;
    spark.style.top = `${Math.round((y - containerRect.top) / 2) * 2 + dy}px`;
    spark.style.opacity = '1';
    container.appendChild(spark);

    const driftX = Math.round((dx * 1.5 + (Math.random() - 0.5) * 12) / gridSize) * gridSize;
    const driftY = Math.round((dy + 8 + Math.random() * 12) / gridSize) * gridSize;

    spark.animate([
      { opacity: 1, transform: 'translate(0, 0)' },
      { opacity: 0.7, transform: `translate(${driftX * 0.5}px, ${driftY * 0.4}px)`, offset: 0.5 },
      { opacity: 0, transform: `translate(${driftX}px, ${driftY}px)` },
    ], { duration: 300 + Math.random() * 200, easing: 'steps(6)' }).onfinish = () => spark.remove();
  }, []);

  // Start trail
  const startTrail = useCallback(() => {
    if (trailIntervalRef.current) return;
    trailIntervalRef.current = setInterval(() => {
      const ds = dragStateRef.current;
      if (!ds || !ds.coinPopped || !coinRef.current) return;
      const coinState = coinStateRef.current;
      if (coinState.x && coinState.y) {
        spawnTrailSpark(coinState.x, coinState.y);
      }
    }, 40);
  }, [spawnTrailSpark]);

  const stopTrail = useCallback(() => {
    if (trailIntervalRef.current) {
      clearInterval(trailIntervalRef.current);
      trailIntervalRef.current = null;
    }
  }, []);

  // Orbit physics
  const startOrbit = useCallback(() => {
    if (floatRAFRef.current) return;
    const ds = dragStateRef.current;
    if (!ds) return;

    const coinState = coinStateRef.current;
    coinState.x = ds.pendingFingerX;
    coinState.y = ds.pendingFingerY;
    const angle = Math.random() * Math.PI * 2;
    coinState.vx = Math.cos(angle) * 3;
    coinState.vy = Math.sin(angle) * 3;

    const container = containerRef.current;
    const containerRect = container?.getBoundingClientRect();
    if (!containerRect) return;

    const tick = () => {
      const ds = dragStateRef.current;
      if (!ds || !ds.coinPopped || ds.coinPhase !== 'free') {
        floatRAFRef.current = null;
        return;
      }

      const targetX = ds.pendingFingerX;
      const targetY = ds.pendingFingerY;
      const dx = targetX - coinState.x;
      const dy = targetY - coinState.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 1) {
        const pullStrength = FLOAT_GRAVITY * Math.min(dist / 20, 1.5);
        coinState.vx += (dx / dist) * pullStrength;
        coinState.vy += (dy / dist) * pullStrength;
      }
      coinState.vx += (Math.random() - 0.5) * FLOAT_WANDER;
      coinState.vy += (Math.random() - 0.5) * FLOAT_WANDER;
      coinState.vx *= FLOAT_DAMPING;
      coinState.vy *= FLOAT_DAMPING;
      coinState.x += coinState.vx;
      coinState.y += coinState.vy;

      if (dist > FLOAT_MAX_DIST) {
        const pushBack = (dist - FLOAT_MAX_DIST) * 0.1;
        coinState.x -= (coinState.x - targetX) / dist * pushBack;
        coinState.y -= (coinState.y - targetY) / dist * pushBack;
      }

      const speed = Math.sqrt(coinState.vx * coinState.vx + coinState.vy * coinState.vy);
      coinState.rotation += speed * 3;
      const wobble = COIN_SCALE * (1 + Math.sin(coinState.rotation * 0.1) * 0.08);

      if (coinRef.current) {
        coinRef.current.style.left = `${coinState.x - containerRect.left - 20}px`;
        coinRef.current.style.top = `${coinState.y - containerRect.top - 20}px`;
        coinRef.current.style.transform = `scale(${wobble}) rotate(${coinState.rotation}deg)`;
      }

      floatRAFRef.current = requestAnimationFrame(tick);
    };
    floatRAFRef.current = requestAnimationFrame(tick);
  }, []);

  const stopOrbit = useCallback(() => {
    if (floatRAFRef.current) {
      cancelAnimationFrame(floatRAFRef.current);
      floatRAFRef.current = null;
    }
    coinStateRef.current.vx = 0;
    coinStateRef.current.vy = 0;
  }, []);

  // Transfer coins animation
  const transferCoins = useCallback((sourceEnvelope, targetEnvelope, sourceEl, targetEl, onComplete) => {
    const container = containerRef.current;
    if (!container) {
      if (onComplete) onComplete();
      return;
    }
    const containerRect = container.getBoundingClientRect();

    const GRAVITY = 0.08;
    const EMIT_SPEED = 2.0;
    const EMIT_STAGGER = 80;
    const ABSORB_RADIUS = 45;
    const DRAG = 0.98;
    const COIN_R = 16;
    const COIN_COUNT = 5;

    const sr = sourceEl.getBoundingClientRect();
    const tr = targetEl.getBoundingClientRect();
    const sx = sr.left + sr.width / 2;
    const sy = sr.top + sr.height / 2;
    const tx = tr.left + tr.width / 2;
    const ty = tr.top + tr.height / 2;

    // Floating badges
    setFloatingBadge({
      text: `+$${sourceEnvelope.balance.toFixed(0)}`,
      position: {
        x: tr.left + tr.width / 2 - containerRect.left,
        y: tr.top - containerRect.top + 20,
      },
    });

    if (navigator.vibrate) navigator.vibrate(20);

    // Source envelope deflate animation
    sourceEl.animate([
      { transform: 'scale(1)' },
      { transform: 'scale(0.88)', offset: 0.3 },
      { transform: 'scale(0.92)', offset: 0.7 },
      { transform: 'scale(1)' },
    ], { duration: 1200, easing: 'ease-in-out' });

    const particles = [];
    let landed = 0;

    for (let i = 0; i < COIN_COUNT; i++) {
      const coin = document.createElement('div');
      coin.className = 'transfer-coin';
      coin.textContent = '$';
      coin.style.opacity = '0';
      container.appendChild(coin);

      const angle = (Math.PI * 2 / COIN_COUNT) * i + (Math.random() - 0.5) * 0.6;
      const speed = EMIT_SPEED * (0.8 + Math.random() * 0.4);

      particles.push({
        el: coin,
        x: sx,
        y: sy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        scale: 0,
        rotation: 0,
        rotSpeed: (Math.random() - 0.5) * 3,
        alive: false,
        launched: false,
        trailFrame: 0,
      });
    }

    particles.forEach((p, i) => {
      setTimeout(() => {
        p.alive = true;
        p.launched = true;
      }, i * EMIT_STAGGER);
    });

    const tick = () => {
      let allDone = true;

      for (const p of particles) {
        if (!p.launched) { allDone = false; continue; }
        if (!p.alive) continue;
        allDone = false;

        if (p.scale < 1) {
          p.scale = Math.min(1, p.scale + 0.08);
          p.el.style.opacity = '1';
        }

        const dx = tx - p.x;
        const dy = ty - p.y;
        const distSq = dx * dx + dy * dy;
        const dist = Math.sqrt(distSq);

        const force = GRAVITY * Math.max(1, 8000 / distSq);
        p.vx += (dx / dist) * force;
        p.vy += (dy / dist) * force;
        p.vx += (dx / dist) * 0.25;
        p.vy += (dy / dist) * 0.25;
        p.vx *= DRAG;
        p.vy *= DRAG;

        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotSpeed;

        const vw = window.innerWidth;
        const vh = window.innerHeight;
        if (p.x < COIN_R) { p.x = COIN_R; p.vx = Math.abs(p.vx) * 0.6; }
        if (p.x > vw - COIN_R) { p.x = vw - COIN_R; p.vx = -Math.abs(p.vx) * 0.6; }
        if (p.y < COIN_R) { p.y = COIN_R; p.vy = Math.abs(p.vy) * 0.6; }
        if (p.y > vh - COIN_R) { p.y = vh - COIN_R; p.vy = -Math.abs(p.vy) * 0.6; }

        const approachScale = Math.min(1, dist / 60);
        const renderScale = p.scale * (0.3 + approachScale * 0.7);

        p.el.style.left = `${p.x - containerRect.left - 14}px`;
        p.el.style.top = `${p.y - containerRect.top - 14}px`;
        p.el.style.transform = `scale(${renderScale}) rotate(${p.rotation}deg)`;
        p.el.style.opacity = Math.min(1, dist / 20);

        // Trail sparks (reduced frequency for performance)
        p.trailFrame++;
        const pspeed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (p.trailFrame % 6 === 0 && pspeed > 3 && dist > 60) {
          spawnTrailSpark(p.x, p.y);
        }

        if (dist < ABSORB_RADIUS) {
          p.alive = false;
          p.el.remove();
          landed++;
          if (navigator.vibrate) navigator.vibrate(8);

          // Pulse the target envelope on each coin landing
          targetEl.animate([
            { transform: 'scale(1)' },
            { transform: `scale(${1.04 + (landed / COIN_COUNT) * 0.08})` },
            { transform: 'scale(1)' },
          ], { duration: 200, easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)' });

          // Final bounce when all coins landed
          if (landed === COIN_COUNT) {
            setTimeout(() => {
              targetEl.animate([
                { transform: 'scale(1)' },
                { transform: 'scale(1.15)' },
                { transform: 'scale(0.96)' },
                { transform: 'scale(1.04)' },
                { transform: 'scale(1)' },
              ], { duration: 350, easing: 'linear' });
              if (navigator.vibrate) navigator.vibrate(25);
            }, 50);
          }
        }
      }

      if (!allDone) {
        requestAnimationFrame(tick);
      } else {
        // All coins landed - call completion callback
        if (onComplete) onComplete();
      }
    };

    requestAnimationFrame(tick);
  }, [spawnTrailSpark]);

  // Get drop target under point
  const getDropTarget = useCallback((x, y, activeEnvelopeId) => {
    const dropTargets = [DEMO_INCOME_ENVELOPE, ...DEMO_SAVING_ENVELOPES];
    for (const target of dropTargets) {
      const el = targetRefs.current[target.id];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
        return { target, el };
      }
    }
    return null;
  }, []);

  // Pointer handlers
  const handlePointerDown = useCallback((e, envelope) => {
    const box = e.currentTarget;
    e.preventDefault();

    // Only capture if we have a valid pointerId
    if (e.pointerId !== undefined) {
      try {
        box.setPointerCapture(e.pointerId);
      } catch (err) {
        // Ignore capture errors for synthetic events
      }
    }

    const rect = box.getBoundingClientRect();
    dragStateRef.current = {
      envelope,
      box,
      startX: e.clientX,
      startY: e.clientY,
      boxCenterX: rect.left + rect.width / 2,
      boxCenterY: rect.top + rect.height / 2,
      coinPopped: false,
      coinPhase: null,
      pendingFingerX: e.clientX,
      pendingFingerY: e.clientY,
      lastDist: 0,
    };
    lastCreakTimeRef.current = 0;
    box.classList.add('dragging');
    startTrail();
  }, [startTrail]);

  const handlePointerMove = useCallback((e) => {
    const ds = dragStateRef.current;
    if (!ds) return;

    const dx = e.clientX - ds.startX;
    const dy = e.clientY - ds.startY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    const container = containerRef.current;
    const containerRect = container?.getBoundingClientRect();
    if (!containerRect) return;

    if (!ds.coinPopped) {
      const factor = DRAG_LIMIT * (1 - Math.exp(-dist / (DRAG_LIMIT * 4)));
      const angle = Math.atan2(dy, dx);
      const moveX = Math.cos(angle) * factor;
      const moveY = Math.sin(angle) * factor;

      // Box deformation
      const tension = Math.min(dist / POP_THRESHOLD, 1);
      const stretchAmount = 1 + tension * 0.25;
      const squashAmount = 1 - tension * 0.12;
      const angleDeg = angle * (180 / Math.PI);

      ds.box.style.transform = `translate(${moveX}px, ${moveY}px) rotate(${angleDeg}deg) scale(${stretchAmount}, ${squashAmount}) rotate(${-angleDeg}deg)`;

      // Haptic creak
      const creakTension = Math.max(0, (dist - POP_THRESHOLD * 0.2)) / (POP_THRESHOLD * 0.8);
      if (creakTension > 0 && creakTension < 1) {
        doCreak(Math.min(creakTension, 1));
      }

      ds.lastDist = dist;

      // Pop the coin
      if (dist >= POP_THRESHOLD) {
        ds.coinPopped = true;

        const currentTransform = ds.box.style.transform;
        const mx = Math.cos(angle) * factor;
        const my = Math.sin(angle) * factor;

        // Snap-back animation
        const snapBox = ds.box;
        snapBox.style.transition = 'none';
        const snapAnim = snapBox.animate([
          { transform: currentTransform },
          { transform: `translate(${-mx * 2.0}px, ${-my * 2.0}px) scale(0.85)`, offset: 0.12 },
          { transform: `translate(${mx * 1.0}px, ${my * 1.0}px) scale(1.1)`, offset: 0.28 },
          { transform: `translate(${-mx * 0.4}px, ${-my * 0.4}px) scale(0.93)`, offset: 0.44 },
          { transform: `translate(${mx * 0.15}px, ${my * 0.15}px) scale(1.03)`, offset: 0.60 },
          { transform: `translate(${-mx * 0.05}px, ${-my * 0.05}px) scale(0.99)`, offset: 0.78 },
          { transform: 'translate(0, 0) scale(1)' },
        ], { duration: 700, easing: 'linear', fill: 'forwards' });
        snapAnim.onfinish = () => {
          snapAnim.cancel();
          snapBox.style.transform = 'translate(0, 0) scale(1)';
        };

        // Coin zips from box center to finger
        const bx = ds.boxCenterX;
        const by = ds.boxCenterY;
        ds.coinPhase = 'zipping';
        ds.pendingFingerX = e.clientX;
        ds.pendingFingerY = e.clientY;

        // Place coin at box center
        if (coinRef.current) {
          coinRef.current.style.transition = 'none';
          coinRef.current.style.left = `${bx - containerRect.left - 20}px`;
          coinRef.current.style.top = `${by - containerRect.top - 20}px`;
          coinRef.current.style.opacity = '1';
          coinRef.current.style.transform = 'scale(0.7)';
        }

        // Lerp coin to finger
        let coinX = bx;
        let coinY = by;
        const ZIP_SPEED = 0.35;

        const zipTick = () => {
          const ds2 = dragStateRef.current;
          if (!ds2 || ds2.coinPhase !== 'zipping') return;

          const targetX = ds2.pendingFingerX;
          const targetY = ds2.pendingFingerY;
          coinX += (targetX - coinX) * ZIP_SPEED;
          coinY += (targetY - coinY) * ZIP_SPEED;

          if (coinRef.current) {
            coinRef.current.style.left = `${coinX - containerRect.left - 20}px`;
            coinRef.current.style.top = `${coinY - containerRect.top - 20}px`;
          }

          const d = Math.sqrt((targetX - coinX) ** 2 + (targetY - coinY) ** 2);
          if (d < 2) {
            if (coinRef.current) {
              coinRef.current.style.left = `${targetX - containerRect.left - 20}px`;
              coinRef.current.style.top = `${targetY - containerRect.top - 20}px`;
            }
            ds2.coinPhase = 'free';
            coinStateRef.current.x = targetX;
            coinStateRef.current.y = targetY;
            startOrbit();
            return;
          }

          requestAnimationFrame(zipTick);
        };
        requestAnimationFrame(zipTick);

        spawnBurst(bx, by);

        if (navigator.vibrate) navigator.vibrate([0, 10, 40]);
      }
    } else {
      ds.pendingFingerX = e.clientX;
      ds.pendingFingerY = e.clientY;

      // Check drop targets
      const hit = getDropTarget(e.clientX, e.clientY, ds.envelope.id);

      if (hit && (!currentDropTarget || currentDropTarget.id !== hit.target.id)) {
        if (currentDropTarget) {
          const prevEl = targetRefs.current[currentDropTarget.id];
          if (prevEl) prevEl.classList.remove('drop-target');
        }
        hit.el.classList.add('drop-target');
        setCurrentDropTarget(hit.target);
      } else if (!hit && currentDropTarget) {
        const prevEl = targetRefs.current[currentDropTarget.id];
        if (prevEl) prevEl.classList.remove('drop-target');
        setCurrentDropTarget(null);
      }

      if (coinRef.current && ds.coinPhase === 'free') {
        coinRef.current.style.opacity = '1';
      }
    }
  }, [doCreak, spawnBurst, startOrbit, getDropTarget, currentDropTarget]);

  const handlePointerUp = useCallback((e) => {
    const ds = dragStateRef.current;
    if (!ds) return;

    ds.coinPhase = 'dead';
    stopOrbit();
    stopTrail();

    const droppedOnTarget = currentDropTarget && ds.coinPopped;
    const sourceEnvelope = ds.envelope;

    // Reset box
    ds.box.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    ds.box.style.transform = 'translate(0, 0)';
    ds.box.classList.remove('dragging');

    // Hide coin
    if (coinRef.current) {
      coinRef.current.style.opacity = '0';
      coinRef.current.style.transform = 'scale(0)';
    }

    // Clear drop target styling
    if (currentDropTarget) {
      const targetEl = targetRefs.current[currentDropTarget.id];
      if (targetEl) targetEl.classList.remove('drop-target');
    }

    // If dropped on target, do transfer
    if (droppedOnTarget) {
      const sourceEl = envelopeRefs.current[sourceEnvelope.id];
      const targetEl = targetRefs.current[currentDropTarget.id];
      const targetEnv = currentDropTarget;

      if (sourceEl && targetEl) {
        // Start the coin animation, update state when complete
        transferCoins(sourceEnvelope, targetEnv, sourceEl, targetEl, () => {
          // Update amounts after animation completes
          if (targetEnv.id === 0) {
            setIncomeAdded(prev => prev + sourceEnvelope.balance);
          } else {
            setSavingsAdded(prev => ({
              ...prev,
              [targetEnv.id]: (prev[targetEnv.id] || 0) + sourceEnvelope.balance
            }));
          }

          // Mark envelope as transferred (stays in place, just fades)
          setEnvelopes(prev => prev.map(e =>
            e.id === sourceEnvelope.id ? { ...e, transferred: true } : e
          ));
        });
      }
    }

    dragStateRef.current = null;
    setCurrentDropTarget(null);
    lastCreakTimeRef.current = 0;
  }, [currentDropTarget, stopOrbit, stopTrail, transferCoins]);

  // Global pointer move/up
  useEffect(() => {
    const handleGlobalMove = (e) => handlePointerMove(e);
    const handleGlobalUp = (e) => handlePointerUp(e);

    window.addEventListener('pointermove', handleGlobalMove);
    window.addEventListener('pointerup', handleGlobalUp);
    window.addEventListener('pointercancel', handleGlobalUp);

    return () => {
      window.removeEventListener('pointermove', handleGlobalMove);
      window.removeEventListener('pointerup', handleGlobalUp);
      window.removeEventListener('pointercancel', handleGlobalUp);
    };
  }, [handlePointerMove, handlePointerUp]);

  const handleContinue = () => {
    const kept = envelopes.filter(e => !e.transferred);
    const transferred = envelopes.filter(e => e.transferred);
    onEnvelopesUpdate?.({ kept, transferred });
    onNext();
  };

  if (DEMO_SPENDING_ENVELOPES.filter(e => e.balance > 0).length === 0) {
    return (
      <div className="step-container leftovers-step">
        <div className="step-header">
          <div className="header-icon">
            <TargetIcon sx={{ fontSize: 48 }} />
          </div>
          <h1>No Leftovers</h1>
          <p className="step-subtitle">You used all your budget last period.</p>
        </div>
        <button className="primary-button" onClick={onNext}>
          Continue
        </button>
      </div>
    );
  }

  const dropTargets = [DEMO_INCOME_ENVELOPE, ...DEMO_SAVING_ENVELOPES];

  return (
    <div className="step-container leftovers-step" ref={containerRef}>
      <div className="step-header">
        <h1>You have leftovers!</h1>
        <p className="step-subtitle">
          Some envelopes still have money from last period. Drag them to savings, add to income, or leave them where they are.
        </p>
      </div>

      <div className="leftovers-section">
        <div className="section-label">Leftover balances</div>
        <div className="envelope-grid leftovers">
          {envelopes.map(envelope => (
            <div
              key={envelope.id}
              ref={el => (envelopeRefs.current[envelope.id] = el)}
              className={`envelope-tile small ${envelope.transferred ? 'faded' : ''}`}
              onPointerDown={envelope.transferred ? undefined : e => handlePointerDown(e, envelope)}
              style={{ touchAction: 'none', cursor: envelope.transferred ? 'default' : 'grab' }}
            >
              <div className="envelope-icon-badge" style={{ background: envelope.color }}>
                <envelope.Icon sx={{ fontSize: 20, color: '#fff' }} />
              </div>
              <span className="envelope-name">{envelope.name}</span>
              <span className="envelope-amount">${envelope.transferred ? 0 : envelope.balance.toFixed(0)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="drop-targets-section">
        <div className="section-label">Drag to</div>
        <div className="envelope-grid">
          {dropTargets.map(target => {
            const isSavings = target.id !== 0;
            const isHighlighted = currentDropTarget?.id === target.id;
            return (
              <div
                key={target.id}
                ref={el => (targetRefs.current[target.id] = el)}
                className={`envelope-tile small ${isHighlighted ? 'drop-target' : ''}`}
              >
                  <div className="envelope-icon-badge" style={{ background: target.color }}>
                  <target.Icon sx={{ fontSize: 20, color: '#fff' }} />
                </div>
                <span className="envelope-name">{target.name}</span>
                <span className="envelope-amount">
                  ${(target.id === 0
                    ? target.balance + incomeAdded
                    : target.balance + (savingsAdded[target.id] || 0)
                  ).toFixed(0)}
                </span>
                {isSavings && <span className="envelope-tag savings-tag">savings</span>}
              </div>
            );
          })}
        </div>
      </div>

      <button className="primary-button" onClick={handleContinue}>
        Continue
      </button>

      {/* Dragged coin */}
      <div
        ref={coinRef}
        className="coin"
        style={{ opacity: 0, transform: 'scale(0)' }}
      >$</div>

      {/* Burst ring */}
      <div ref={burstRef} className="coin-burst" />

      {floatingBadge && (
        <FloatingBadge
          text={floatingBadge.text}
          position={floatingBadge.position}
          onComplete={() => setFloatingBadge(null)}
        />
      )}
    </div>
  );
}

// Step 3: Allocation - Tap to fill
function AllocationStep({ onNext, leftoverDecision }) {
  // Calculate starting balances based on leftover decisions
  const getStartingBalance = (envelope) => {
    // If envelope was transferred in step 2, its balance is now 0
    if (leftoverDecision?.transferred?.some(t => t.id === envelope.id)) {
      return 0;
    }
    // Otherwise it keeps its leftover balance
    return envelope.balance;
  };

  const [allocations, setAllocations] = useState(
    ALL_ALLOCATION_ENVELOPES.reduce((acc, e) => ({ ...acc, [e.id]: 0 }), {})
  );
  const [drawerEnvelope, setDrawerEnvelope] = useState(null);
  const [detailsModalEnvelope, setDetailsModalEnvelope] = useState(null);
  const [fundingSavingsId, setFundingSavingsId] = useState(
    DEMO_SAVING_ENVELOPES.find(e => e.balance > 0)?.id || DEMO_SAVING_ENVELOPES[0]?.id
  );
  const containerRef = useRef(null);
  const incomeRef = useRef(null);
  const topSlotRef = useRef(null);
  const envelopeRefs = useRef({});

  // Prevent context menu globally in this step
  useEffect(() => {
    const preventContextMenu = (e) => {
      if (e.target.closest('.allocation-envelope')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };
    document.addEventListener('contextmenu', preventContextMenu, true);
    return () => document.removeEventListener('contextmenu', preventContextMenu, true);
  }, []);

  const totalAllocated = Object.values(allocations).reduce((sum, v) => sum + v, 0);
  const fundingSavingsEnvelope = DEMO_SAVING_ENVELOPES.find(e => e.id === fundingSavingsId);
  const savingsAvailable = fundingSavingsEnvelope?.balance || 0;
  // Total pool is always income + selected savings (so user can exceed income)
  const totalAvailable = DEMO_INCOME + savingsAvailable;
  const remaining = totalAvailable - totalAllocated;
  // Calculate how much we're actually pulling from savings
  const savingsUsage = Math.max(0, totalAllocated - DEMO_INCOME);
  const isUsingFromSavings = savingsUsage > 0;
  // For display: show income remaining (can go to 0 but not negative)
  const incomeRemaining = Math.max(0, DEMO_INCOME - totalAllocated);

  // Cycle to next savings envelope with fade animation
  const [isSwapping, setIsSwapping] = useState(false);

  const cycleFundingSavings = () => {
    if (isSwapping) return;

    const currentId = fundingSavingsId;
    const currentIndex = DEMO_SAVING_ENVELOPES.findIndex(e => e.id === currentId);
    const nextIndex = (currentIndex + 1) % DEMO_SAVING_ENVELOPES.length;
    const nextId = DEMO_SAVING_ENVELOPES[nextIndex].id;

    const topEl = topSlotRef.current;
    const nextEl = envelopeRefs.current[nextId]; // Envelope in grid that will move to top

    if (!topEl) {
      setFundingSavingsId(nextId);
      return;
    }

    setIsSwapping(true);

    // Fade out both: current at top AND next in grid
    const fadeOutTargets = [topEl];
    if (nextEl) fadeOutTargets.push(nextEl);

    gsap.to(fadeOutTargets, {
      opacity: 0,
      duration: 0.15,
      ease: 'power2.out',
      onComplete: () => {
        // Update state while both are invisible
        setFundingSavingsId(nextId);

        // Fade in after React re-renders
        requestAnimationFrame(() => {
          // Fade in the new top envelope
          gsap.to(topEl, { opacity: 1, duration: 0.15, ease: 'power2.in' });

          // Fade in the old envelope at its grid position
          const oldEl = envelopeRefs.current[currentId];
          if (oldEl) {
            gsap.fromTo(oldEl, { opacity: 0 }, { opacity: 1, duration: 0.15, ease: 'power2.in' });
          }

          setTimeout(() => setIsSwapping(false), 150);
        });
      }
    });
  };

  // Calculate total savings allocated (to auto-clear when over budget)
  const savingsAllocated = DEMO_SAVING_ENVELOPES.reduce(
    (sum, e) => sum + (allocations[e.id] || 0), 0
  );

  // Auto-clear savings allocations when dipping into savings
  // This prevents the confusing state of both adding to AND withdrawing from savings
  useEffect(() => {
    if (isUsingFromSavings && savingsAllocated > 0) {
      // Clear all savings allocations
      setAllocations(prev => {
        const newAllocations = { ...prev };
        DEMO_SAVING_ENVELOPES.forEach(e => {
          newAllocations[e.id] = 0;
        });
        return newAllocations;
      });
    }
  }, [isUsingFromSavings, savingsAllocated]);

  // Check if a savings envelope can be allocated to
  const canAllocateToSavings = (envelope) => {
    if (!envelope.isSavings) return true;
    // Can't allocate to savings if we're already dipping into savings
    // (unless clearing an existing allocation)
    return !isUsingFromSavings;
  };

  // Tap to open drawer
  const handleEnvelopeTap = (envelope) => {
    // Check if savings allocation is blocked
    if (envelope.isSavings && isUsingFromSavings) {
      // Shake animation to indicate blocked
      const el = envelopeRefs.current[envelope.id];
      if (el) {
        el.animate([
          { transform: 'translateX(0)' },
          { transform: 'translateX(-4px)' },
          { transform: 'translateX(4px)' },
          { transform: 'translateX(-4px)' },
          { transform: 'translateX(0)' },
        ], { duration: 300, easing: 'ease-out' });
      }
      return;
    }

    // Open the drawer
    setDrawerEnvelope(envelope);
  };

  // Drawer amount adjustment
  const handleDrawerAmountChange = (delta) => {
    if (!drawerEnvelope) return;
    const current = allocations[drawerEnvelope.id] || 0;

    // Block increasing savings allocation when dipping into savings
    if (drawerEnvelope.isSavings && isUsingFromSavings && delta > 0) {
      return;
    }

    const maxAllowable = remaining + current;
    const newAmount = Math.max(0, Math.min(current + delta, maxAllowable));
    setAllocations(prev => ({ ...prev, [drawerEnvelope.id]: newAmount }));
  };

  const handleDrawerSetAmount = (amount) => {
    if (!drawerEnvelope) return;
    const current = allocations[drawerEnvelope.id] || 0;

    // Block increasing savings allocation when dipping into savings
    if (drawerEnvelope.isSavings && isUsingFromSavings && amount > current) {
      return;
    }
    const maxAllowable = remaining + current;
    const newAmount = Math.max(0, Math.min(amount, maxAllowable));
    setAllocations(prev => ({ ...prev, [drawerEnvelope.id]: newAmount }));
  };

  const handleAutoFill = () => {
    const newAllocations = {};
    let remainingBudget = DEMO_INCOME;

    // First, fill spending envelopes (priority)
    const spendingEnvelopes = ALL_ALLOCATION_ENVELOPES.filter(e => !e.isSavings);
    const totalSpendingSuggested = spendingEnvelopes.reduce((sum, e) => sum + e.suggested, 0);
    const spendingScale = Math.min(1, remainingBudget / totalSpendingSuggested);

    spendingEnvelopes.forEach(e => {
      const amount = Math.round(e.suggested * spendingScale);
      newAllocations[e.id] = amount;
      remainingBudget -= amount;
    });

    // Then, fill savings envelopes only if there's money left
    const savingsEnvelopes = ALL_ALLOCATION_ENVELOPES.filter(e => e.isSavings);
    if (remainingBudget > 0) {
      const totalSavingsSuggested = savingsEnvelopes.reduce((sum, e) => sum + e.suggested, 0);
      const savingsScale = Math.min(1, remainingBudget / totalSavingsSuggested);

      savingsEnvelopes.forEach(e => {
        newAllocations[e.id] = Math.round(e.suggested * savingsScale);
      });
    } else {
      // No money for savings
      savingsEnvelopes.forEach(e => {
        newAllocations[e.id] = 0;
      });
    }

    setAllocations(newAllocations);
    if (navigator.vibrate) navigator.vibrate(20);
  };

  const handleClear = () => {
    setAllocations(ALL_ALLOCATION_ENVELOPES.reduce((acc, e) => ({ ...acc, [e.id]: 0 }), {}));
  };

  // Spawn trail sparks for transfer animation
  const spawnTrailSpark = useCallback((x, y) => {
    const container = containerRef.current;
    if (!container) return;
    const containerRect = container.getBoundingClientRect();

    const spark = document.createElement('div');
    spark.className = 'trail-spark';
    const sizes = [3, 4, 5, 6];
    const size = sizes[Math.floor(Math.random() * sizes.length)];
    const gridSize = 4;
    const spread = 16;
    const dx = Math.round((Math.random() - 0.5) * spread / gridSize) * gridSize;
    const dy = Math.round((Math.random() - 0.5) * spread / gridSize) * gridSize;

    spark.style.width = `${size}px`;
    spark.style.height = `${size}px`;
    spark.style.left = `${Math.round((x - containerRect.left) / 2) * 2 + dx}px`;
    spark.style.top = `${Math.round((y - containerRect.top) / 2) * 2 + dy}px`;
    spark.style.opacity = '1';
    container.appendChild(spark);

    const driftX = Math.round((dx * 1.5 + (Math.random() - 0.5) * 12) / gridSize) * gridSize;
    const driftY = Math.round((dy + 8 + Math.random() * 12) / gridSize) * gridSize;

    spark.animate([
      { opacity: 1, transform: 'translate(0, 0)' },
      { opacity: 0.7, transform: `translate(${driftX * 0.5}px, ${driftY * 0.4}px)`, offset: 0.5 },
      { opacity: 0, transform: `translate(${driftX}px, ${driftY}px)` },
    ], { duration: 300 + Math.random() * 200, easing: 'steps(6)' }).onfinish = () => spark.remove();
  }, []);

  // Animate coins from a source to a target envelope
  const animateCoinsToEnvelope = useCallback((sourceEl, targetEl, amount, delay, onLanded) => {
    const container = containerRef.current;
    if (!container || !sourceEl || !targetEl) return;

    const containerRect = container.getBoundingClientRect();
    const sr = sourceEl.getBoundingClientRect();
    const tr = targetEl.getBoundingClientRect();

    const sx = sr.left + sr.width / 2;
    const sy = sr.top + sr.height / 2;
    const tx = tr.left + tr.width / 2;
    const ty = tr.top + tr.height / 2;

    const COIN_COUNT = Math.min(4, Math.max(2, Math.floor(amount / 150)));
    const EMIT_STAGGER = 60;
    const GRAVITY = 0.12;
    const DRAG = 0.98;
    const ABSORB_RADIUS = 40;

    const particles = [];
    let landed = 0;

    for (let i = 0; i < COIN_COUNT; i++) {
      const coin = document.createElement('div');
      coin.className = 'transfer-coin';
      coin.textContent = '$';
      coin.style.opacity = '0';
      container.appendChild(coin);

      const angle = (Math.PI * 2 / COIN_COUNT) * i + (Math.random() - 0.5) * 0.6;
      const speed = 2.5 * (0.8 + Math.random() * 0.4);

      particles.push({
        el: coin,
        x: sx,
        y: sy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1,
        scale: 0,
        rotation: 0,
        rotSpeed: (Math.random() - 0.5) * 4,
        alive: false,
        launched: false,
        trailFrame: 0,
      });
    }

    // Stagger launch
    setTimeout(() => {
      particles.forEach((p, i) => {
        setTimeout(() => {
          p.alive = true;
          p.launched = true;
        }, i * EMIT_STAGGER);
      });

      const tick = () => {
        let allDone = true;

        for (const p of particles) {
          if (!p.launched) { allDone = false; continue; }
          if (!p.alive) continue;
          allDone = false;

          if (p.scale < 1) {
            p.scale = Math.min(1, p.scale + 0.12);
            p.el.style.opacity = '1';
          }

          const dx = tx - p.x;
          const dy = ty - p.y;
          const distSq = dx * dx + dy * dy;
          const dist = Math.sqrt(distSq);

          const force = GRAVITY * Math.max(1, 6000 / distSq);
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
          p.vx *= DRAG;
          p.vy *= DRAG;

          p.x += p.vx;
          p.y += p.vy;
          p.rotation += p.rotSpeed;

          const approachScale = Math.min(1, dist / 50);
          const renderScale = p.scale * (0.4 + approachScale * 0.6);

          p.el.style.left = `${p.x - containerRect.left - 14}px`;
          p.el.style.top = `${p.y - containerRect.top - 14}px`;
          p.el.style.transform = `scale(${renderScale}) rotate(${p.rotation}deg)`;
          p.el.style.opacity = Math.min(1, dist / 20);

          // Trail sparks (reduced frequency for performance)
          p.trailFrame++;
          const pspeed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
          if (p.trailFrame % 8 === 0 && pspeed > 3 && dist > 50) {
            spawnTrailSpark(p.x, p.y);
          }

          if (dist < ABSORB_RADIUS) {
            p.alive = false;
            p.el.remove();
            landed++;
            if (navigator.vibrate) navigator.vibrate(6);

            // Pulse target on each landing
            targetEl.animate([
              { transform: 'scale(1)' },
              { transform: `scale(${1.03 + (landed / COIN_COUNT) * 0.06})` },
              { transform: 'scale(1)' },
            ], { duration: 150, easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)' });

            // Final bounce
            if (landed === COIN_COUNT) {
              setTimeout(() => {
                targetEl.animate([
                  { transform: 'scale(1)' },
                  { transform: 'scale(1.12)' },
                  { transform: 'scale(0.97)' },
                  { transform: 'scale(1.03)' },
                  { transform: 'scale(1)' },
                ], { duration: 300, easing: 'linear' });
                if (navigator.vibrate) navigator.vibrate(20);
                if (onLanded) onLanded();
              }, 30);
            }
          }
        }

        if (!allDone) {
          requestAnimationFrame(tick);
        }
      };

      requestAnimationFrame(tick);
    }, delay);
  }, [spawnTrailSpark]);

  const handleComplete = () => {
    // Get envelopes with allocations
    const allocatedEnvelopes = ALL_ALLOCATION_ENVELOPES.filter(e => allocations[e.id] > 0);

    if (allocatedEnvelopes.length === 0) {
      onNext(totalAllocated, 0);
      return;
    }

    const animDuration = allocatedEnvelopes.length * 200 + 800;

    // Deflate income envelope
    if (incomeRef.current) {
      incomeRef.current.animate([
        { transform: 'scale(1)' },
        { transform: 'scale(0.85)', offset: 0.4 },
        { transform: 'scale(0.9)', offset: 0.7 },
        { transform: 'scale(1)' },
      ], { duration: animDuration, easing: 'ease-in-out' });
    }

    // Also deflate savings envelope if we're dipping into it
    const fundingSavingsEl = envelopeRefs.current[fundingSavingsId];
    if (isUsingFromSavings && fundingSavingsEl) {
      fundingSavingsEl.animate([
        { transform: 'scale(1)' },
        { transform: 'scale(0.85)', offset: 0.4 },
        { transform: 'scale(0.9)', offset: 0.7 },
        { transform: 'scale(1)' },
      ], { duration: animDuration, easing: 'ease-in-out' });
    }

    if (navigator.vibrate) navigator.vibrate(15);

    // Calculate how much comes from income vs savings for each envelope
    // We'll distribute proportionally based on the funding sources
    const incomeRatio = isUsingFromSavings ? DEMO_INCOME / totalAllocated : 1;
    const savingsRatio = isUsingFromSavings ? savingsUsage / totalAllocated : 0;

    let completed = 0;
    // Count total animations: each envelope gets coins from income, plus savings if applicable
    const totalToComplete = allocatedEnvelopes.length * (isUsingFromSavings ? 2 : 1);

    allocatedEnvelopes.forEach((envelope, i) => {
      const targetEl = envelopeRefs.current[envelope.id];
      if (!targetEl) {
        completed += isUsingFromSavings ? 2 : 1;
        return;
      }

      const allocationAmount = allocations[envelope.id];
      const fromIncome = Math.round(allocationAmount * incomeRatio);
      const fromSavings = allocationAmount - fromIncome;

      // Coins from income
      animateCoinsToEnvelope(incomeRef.current, targetEl, fromIncome, i * 150, () => {
        completed++;
        if (completed === totalToComplete) {
          setTimeout(() => {
            onNext(totalAllocated, allocatedEnvelopes.length);
          }, 300);
        }
      });

      // Coins from savings (if applicable)
      if (isUsingFromSavings && fundingSavingsEl && fromSavings > 0) {
        animateCoinsToEnvelope(fundingSavingsEl, targetEl, fromSavings, i * 150 + 75, () => {
          completed++;
          if (completed === totalToComplete) {
            setTimeout(() => {
              onNext(totalAllocated, allocatedEnvelopes.length);
            }, 300);
          }
        });
      } else if (isUsingFromSavings) {
        // No savings coins for this envelope, but still count as complete
        completed++;
      }
    });
  };

  // Progress bar percentages - relative to total allocated when using savings
  const incomeProgressPercent = isUsingFromSavings
    ? (DEMO_INCOME / totalAllocated) * 100  // Income portion of total
    : Math.min(100, (totalAllocated / DEMO_INCOME) * 100);  // Progress toward income
  const savingsProgressPercent = isUsingFromSavings
    ? (savingsUsage / totalAllocated) * 100  // Savings portion of total
    : 0;

  return (
    <div
      className="step-container allocation-step"
      ref={containerRef}
    >
      <div className="step-header">
        <h1>Fill Your Envelopes</h1>
        <p className="step-subtitle">
          Tap to fill each envelope
        </p>
      </div>

      {/* Income envelope at top (+ placeholder for funding savings) */}
      <div className="allocation-income-section">
        <div
          ref={incomeRef}
          className="envelope-tile income-envelope"
        >
          <div className="envelope-icon-badge" style={{ background: '#9575cd' }}>
            <AccountBalanceWalletIcon sx={{ fontSize: 28, color: '#fff' }} />
          </div>
          <span className="envelope-name">Income</span>
          <span className="envelope-amount">${DEMO_INCOME.toLocaleString()}</span>
          <div className="income-remaining-badge" style={{ color: incomeRemaining === 0 ? '#ef4444' : '#4ade80' }}>
            ${incomeRemaining.toLocaleString()} left
          </div>
        </div>

        {/* Funding savings envelope at top when dipping into savings */}
        {isUsingFromSavings && fundingSavingsEnvelope && (
          <div
            ref={topSlotRef}
            className="envelope-tile small funding-savings-slot funding-savings"
            onClick={cycleFundingSavings}
            style={{ cursor: 'pointer' }}
          >
            <span className="envelope-tag withdrawal-tag">-${savingsUsage.toLocaleString()}</span>
            <div className="envelope-icon-badge" style={{ background: fundingSavingsEnvelope.color }}>
              <fundingSavingsEnvelope.Icon sx={{ fontSize: 20, color: '#fff' }} />
            </div>
            <span className="envelope-name">{fundingSavingsEnvelope.name}</span>
            <span className="envelope-amount">${fundingSavingsEnvelope.balance.toLocaleString()}</span>
            <span className="envelope-tag savings-tag">savings</span>
            <span className="funding-swap-hint">tap to swap</span>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="allocation-progress">
        <div className="allocation-progress-bar">
          <div
            className="allocation-progress-fill"
            style={{ width: `${incomeProgressPercent}%` }}
          />
          {isUsingFromSavings && (
            <div
              className="allocation-progress-fill savings-fill"
              style={{ width: `${savingsProgressPercent}%` }}
            />
          )}
        </div>
        <div className="allocation-progress-labels">
          <span>${totalAllocated.toLocaleString()} allocated</span>
          <span>
            {isUsingFromSavings ? (
              <span className="savings-usage-label">+${savingsUsage.toLocaleString()} from savings</span>
            ) : (
              `$${incomeRemaining.toLocaleString()} remaining`
            )}
          </span>
        </div>
      </div>

      {/* Quick actions */}
      <div className="quick-action-buttons">
        <button className="chip-button" onClick={handleAutoFill}>Fill All</button>
        <button className="chip-button" onClick={handleClear}>Clear</button>
      </div>

      {/* Envelope grid - same style as other steps */}
      <div
        className="envelope-grid allocation-grid-tap"
        onContextMenu={(e) => e.preventDefault()}
        onSelectStart={(e) => e.preventDefault()}
      >
        {ALL_ALLOCATION_ENVELOPES.map(envelope => {
          const allocation = allocations[envelope.id];
          const isFilled = allocation > 0;
          const startingBalance = getStartingBalance(envelope);
          const isFundingSource = envelope.id === fundingSavingsId && isUsingFromSavings;
          const isBlockedSavings = envelope.isSavings && isUsingFromSavings && !isFilled && !isFundingSource;

          // Funding source envelope - render invisible placeholder (envelope shows at top)
          if (isFundingSource) {
            return (
              <div
                key={envelope.id}
                ref={el => { envelopeRefs.current[envelope.id] = el; }}
                className="envelope-tile small allocation-envelope"
                style={{ visibility: 'hidden', pointerEvents: 'none' }}
              >
                <div className="envelope-icon-badge" style={{ background: envelope.color }}>
                  <envelope.Icon sx={{ fontSize: 20, color: '#fff' }} />
                </div>
                <span className="envelope-name">{envelope.name}</span>
                <span className="envelope-amount">${envelope.balance}</span>
              </div>
            );
          }

          return (
            <div
              key={envelope.id}
              ref={el => { envelopeRefs.current[envelope.id] = el; }}
              className={`envelope-tile small allocation-envelope ${isFilled ? 'filled' : ''} ${isBlockedSavings ? 'blocked-savings' : ''}`}
              onClick={() => handleEnvelopeTap(envelope)}
              onContextMenu={(e) => e.preventDefault()}
              style={{
                cursor: isBlockedSavings ? 'not-allowed' : 'pointer',
              }}
            >
              {isFilled && <span className="envelope-tag filled-tag">+${allocation}</span>}
              <div className="envelope-icon-badge" style={{ background: envelope.color }}>
                <envelope.Icon sx={{ fontSize: 20, color: '#fff' }} />
              </div>
              <span className="envelope-name">{envelope.name}</span>
              <span className="envelope-amount">
                ${(startingBalance + allocation).toLocaleString()}
              </span>
              <span className="envelope-suggested-italic">suggested ${envelope.suggested}</span>
              {envelope.isSavings && <span className="envelope-tag savings-tag">savings</span>}
            </div>
          );
        })}
      </div>

      <button
        className="primary-button"
        onClick={handleComplete}
        disabled={totalAllocated === 0}
      >
        {totalAllocated === 0
          ? 'Tap envelopes to allocate'
          : `Complete Budget ($${totalAllocated.toLocaleString()})`
        }
      </button>

      {/* Envelope detail drawer */}
      {drawerEnvelope && (
        <div className="envelope-drawer-overlay" onClick={() => setDrawerEnvelope(null)}>
          <div className="envelope-drawer" onClick={e => e.stopPropagation()}>
            <div className="drawer-handle" />

            <div className="drawer-header">
              <div className="envelope-icon-badge" style={{ background: drawerEnvelope.color }}>
                <drawerEnvelope.Icon sx={{ fontSize: 24, color: '#fff' }} />
              </div>
              <div className="drawer-title">
                <span className="drawer-envelope-name">{drawerEnvelope.name}</span>
                <span className="drawer-envelope-balance">
                  Balance: ${getStartingBalance(drawerEnvelope).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Horizontal spending history bars */}
            <div className="drawer-history-section">
              <div className="drawer-history-header">
                <span className="drawer-section-label">Recent spending</span>
                <button
                  className="drawer-details-link"
                  onClick={() => setDetailsModalEnvelope(drawerEnvelope)}
                >
                  Details →
                </button>
              </div>
              <HorizontalSpendingChart
                history={drawerEnvelope.history || []}
                suggested={drawerEnvelope.suggested}
                color={drawerEnvelope.color}
              />
            </div>

            <div className="drawer-section">
              <div className="drawer-section-label">Your allocation</div>
              <div className="drawer-amount-control">
                <button
                  className="drawer-amount-btn"
                  onClick={() => handleDrawerAmountChange(-25)}
                >
                  −
                </button>
                <span className="drawer-current-amount">
                  ${allocations[drawerEnvelope.id] || 0}
                </span>
                <button
                  className="drawer-amount-btn"
                  onClick={() => handleDrawerAmountChange(25)}
                >
                  +
                </button>
              </div>
              <button
                className={`drawer-suggested-btn ${allocations[drawerEnvelope.id] === drawerEnvelope.suggested ? 'active' : ''}`}
                onClick={() => handleDrawerSetAmount(drawerEnvelope.suggested)}
              >
                Use suggested (${drawerEnvelope.suggested})
              </button>
            </div>

            <button className="drawer-done-btn" onClick={() => setDrawerEnvelope(null)}>
              Done
            </button>
          </div>
        </div>
      )}

      {/* Spending details modal */}
      {detailsModalEnvelope && (
        <SpendingDetailsModal
          envelope={detailsModalEnvelope}
          onClose={() => setDetailsModalEnvelope(null)}
        />
      )}
    </div>
  );
}

// Step 4: Complete
function CompleteStep({ totalAllocated, envelopeCount, onFinish }) {
  const checkRef = useRef(null);
  const contentRef = useRef(null);

  // Calculate next budget date (1 month from now)
  const nextBudgetDate = new Date();
  nextBudgetDate.setMonth(nextBudgetDate.getMonth() + 1);
  const nextBudgetStr = nextBudgetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  useEffect(() => {
    if (checkRef.current) {
      gsap.fromTo(
        checkRef.current,
        { scale: 0, rotation: -180 },
        { scale: 1, rotation: 0, duration: 0.6, ease: 'back.out(2)' }
      );
    }
    if (contentRef.current) {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, delay: 0.4 }
      );
    }
  }, []);

  return (
    <div className="step-container complete-step">
      <div ref={checkRef} className="complete-check">
        <CheckCircleIcon sx={{ fontSize: 64 }} />
      </div>
      <div ref={contentRef} className="complete-content">
        <h1>Budget Complete!</h1>
        <p className="complete-summary">
          You allocated ${totalAllocated.toLocaleString()} across {envelopeCount} envelopes
        </p>

        <div className="period-info">
          <div className="info-row">
            <span className="info-label">28 days remaining</span>
          </div>
          <div className="info-row">
            <span className="info-label">Next budget: {nextBudgetStr}</span>
          </div>
        </div>

        <button className="primary-button" onClick={onFinish}>
          Start Spending
        </button>
      </div>
    </div>
  );
}

// Main Ceremony Component
function ReloadCeremony() {
  const [step, setStep] = useState(1);
  const [leftoverDecision, setLeftoverDecision] = useState(null);
  const [totalAllocated, setTotalAllocated] = useState(0);
  const [envelopeCount, setEnvelopeCount] = useState(0);

  const handleLeftoversUpdate = (decision) => {
    setLeftoverDecision(decision);
  };

  const handleAllocationComplete = (total, count) => {
    setTotalAllocated(total);
    setEnvelopeCount(count);
    setStep(4);
  };

  const handleFinish = () => {
    // Reset to beginning for demo purposes
    setStep(1);
    setLeftoverDecision(null);
    setTotalAllocated(0);
    setEnvelopeCount(0);
  };

  return (
    <div className="reload-ceremony">
      <div className="step-indicator">
        {[1, 2, 3, 4].map(s => (
          <div
            key={s}
            className={`step-dot ${s === step ? 'active' : ''} ${s < step ? 'completed' : ''}`}
          />
        ))}
      </div>

      {step === 1 && <DebriefStep onNext={() => setStep(2)} />}
      {step === 2 && (
        <LeftoversStep
          onNext={() => setStep(3)}
          onEnvelopesUpdate={handleLeftoversUpdate}
        />
      )}
      {step === 3 && (
        <AllocationStep
          onNext={handleAllocationComplete}
          leftoverDecision={leftoverDecision}
        />
      )}
      {step === 4 && (
        <CompleteStep
          totalAllocated={totalAllocated}
          envelopeCount={envelopeCount}
          onFinish={handleFinish}
        />
      )}
    </div>
  );
}

export default ReloadCeremony;
