# Reload Ceremony Brief

> **Source**: `src/ReloadCeremony.jsx` + `src/ReloadCeremony.css`
> **Purpose**: 4-step budgeting flow where users review past spending, handle leftovers, allocate income to envelopes, and complete their budget.

---

## Overview

A **React component** implementing a guided budget allocation ceremony. Uses GSAP for animations, includes drag-to-transfer for leftovers (reuses coin physics from index1), tap-to-allocate with drawer UI, and spending history visualization.

---

## Flow Structure

```
Step 1: DEBRIEF
├── Shows last period summary (budgeted vs spent vs leftover)
├── Highlight cards (Big Spender, High Traffic, Ghost Town)
└── "Let's Reload" button

Step 2: LEFTOVERS
├── Envelopes with remaining balances
├── Drag to: Income (add to pool) or Savings envelopes
├── Uses same coin-pop physics as index1
└── "Continue" button

Step 3: ALLOCATION
├── Income envelope at top showing remaining
├── Grid of spending + savings envelopes
├── Tap envelope → Drawer with spending history + allocation controls
├── "Fill All" / "Clear" quick actions
└── "Complete Budget" triggers coin animation to all envelopes

Step 4: COMPLETE
├── Success checkmark animation
├── Summary: "$X allocated across Y envelopes"
├── Next budget date
└── "Start Spending" resets flow
```

---

## Key Components

### 1. Step Container Structure
```jsx
<div className="reload-ceremony">
  <div className="step-indicator">
    {[1,2,3,4].map(s => <div className={`step-dot ${s === step ? 'active' : ''}`} />)}
  </div>

  {step === 1 && <DebriefStep onNext={() => setStep(2)} />}
  {step === 2 && <LeftoversStep onNext={() => setStep(3)} />}
  {step === 3 && <AllocationStep onNext={handleComplete} />}
  {step === 4 && <CompleteStep onFinish={handleReset} />}
</div>
```

### 2. Envelope Data Model
```javascript
const SPENDING_ENVELOPES = [
  {
    id: 1,
    name: 'Groceries',
    Icon: ShoppingCartIcon,  // MUI icon component
    color: '#e57373',
    balance: 45.20,          // Current balance (leftover)
    suggested: 600,          // AI-suggested allocation
    history: [580, 620, 595] // Last 3 months spending
  },
  // ...
];

const SAVING_ENVELOPES = [
  {
    id: 101,
    name: 'Emergency',
    Icon: SavingsIcon,
    color: '#4db6ac',
    balance: 4500,
    target: 10000,           // Savings goal
    suggested: 200,
    isSavings: true,
    history: [200, 200, 200]
  },
];
```

### 3. Envelope Tile Component
```jsx
function EnvelopeTile({ envelope, amount, showProgress, isHighlighted, isFaded }) {
  return (
    <div className={`envelope-tile ${isHighlighted ? 'highlighted' : ''}`}>
      <div className="envelope-icon-badge" style={{ background: envelope.color }}>
        <envelope.Icon sx={{ fontSize: 28, color: '#fff' }} />
      </div>
      <span className="envelope-name">{envelope.name}</span>
      <span className="envelope-amount">${amount}</span>
      {showProgress && <div className="envelope-progress">...</div>}
    </div>
  );
}
```

### 4. Allocation Drawer
```jsx
<div className="envelope-drawer-overlay" onClick={close}>
  <div className="envelope-drawer" onClick={e => e.stopPropagation()}>
    <div className="drawer-handle" />

    {/* Header */}
    <div className="drawer-header">
      <IconBadge />
      <div>
        <span className="drawer-envelope-name">{name}</span>
        <span className="drawer-envelope-balance">Balance: ${balance}</span>
      </div>
    </div>

    {/* Horizontal spending chart */}
    <div className="drawer-history-section">
      <div className="drawer-history-header">
        <span>Recent spending</span>
        <button onClick={openModal}>Details →</button>
      </div>
      <HorizontalSpendingChart history={history} suggested={suggested} />
    </div>

    {/* Allocation controls */}
    <div className="drawer-amount-control">
      <button onClick={() => adjust(-25)}>−</button>
      <span>${allocation}</span>
      <button onClick={() => adjust(+25)}>+</button>
    </div>
    <button onClick={() => setAmount(suggested)}>
      Use suggested (${suggested})
    </button>

    <button className="drawer-done-btn" onClick={close}>Done</button>
  </div>
</div>
```

### 5. Horizontal Spending Chart
```jsx
function HorizontalSpendingChart({ history, suggested, color }) {
  const maxVal = Math.max(...history, suggested);

  return (
    <div className="horizontal-chart">
      {history.map((val, i) => (
        <div className="h-chart-row">
          <span className="h-chart-label">{MONTHS[i]}</span>
          <div className="h-chart-bar-track">
            <div
              className="h-chart-bar"
              style={{
                width: `${(val / maxVal) * 100}%`,
                background: color,
                opacity: 0.5 + (i * 0.2)  // Older months more faded
              }}
            />
          </div>
          <span className="h-chart-value">${val}</span>
        </div>
      ))}
      {/* Suggested row - highlighted in green */}
      <div className="h-chart-row suggested">
        <span>Suggested</span>
        <div className="h-chart-bar" style={{ background: '#4ade80' }} />
        <span className="suggested-value">${suggested}</span>
      </div>
    </div>
  );
}
```

### 6. Spending Details Modal
```jsx
function SpendingDetailsModal({ envelope, onClose }) {
  const avg = history.reduce((a,b) => a+b, 0) / history.length;
  const trend = history[2] - history[0];  // Jan - Nov

  return (
    <div className="spending-modal-overlay">
      <div className="spending-modal">
        <header>
          <IconBadge />
          <h2>{name} Spending</h2>
          <button onClick={onClose}>×</button>
        </header>

        <div className="modal-stats">
          <Stat label="3-month avg" value={`$${avg}`} />
          <Stat label="Trend" value={trend > 0 ? `+$${trend}` : `-$${Math.abs(trend)}`} />
          <Stat label="Suggested" value={`$${suggested}`} color="green" />
        </div>

        <BarChart data={history} />

        <p>Suggested amount is based on your average spending of ${avg}/month...</p>

        <button onClick={onClose}>Got it</button>
      </div>
    </div>
  );
}
```

---

## Animations

### GSAP Entry Animations (Debrief Step)
```javascript
useEffect(() => {
  // Header fades in first
  gsap.fromTo(headerRef.current,
    { opacity: 0, y: -20 },
    { opacity: 1, y: 0, duration: 0.6 }
  );

  // Cards stagger in
  cardsRef.current.forEach((card, i) => {
    gsap.fromTo(card,
      { opacity: 0, x: -30 },
      { opacity: 1, x: 0, duration: 0.5, delay: 0.5 + i * 0.4 }
    );
  });
}, []);
```

### Coin Transfer Animation (Allocation Complete)
```javascript
// When user clicks "Complete Budget":
// 1. Deflate income envelope
incomeRef.current.animate([
  { transform: 'scale(1)' },
  { transform: 'scale(0.85)', offset: 0.4 },
  { transform: 'scale(1)' },
], { duration: animDuration });

// 2. Spawn coins from income to each allocated envelope
allocatedEnvelopes.forEach((envelope, i) => {
  animateCoinsToEnvelope(
    incomeRef.current,
    envelopeRefs.current[envelope.id],
    allocations[envelope.id],
    i * 150  // Stagger delay
  );
});
```

### Drawer Slide-up
```css
@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.envelope-drawer {
  animation: slideUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
```

---

## State Management

```javascript
// Main ceremony state
const [step, setStep] = useState(1);
const [leftoverDecision, setLeftoverDecision] = useState(null);
const [totalAllocated, setTotalAllocated] = useState(0);

// Allocation step state
const [allocations, setAllocations] = useState(
  ALL_ENVELOPES.reduce((acc, e) => ({ ...acc, [e.id]: 0 }), {})
);
const [drawerEnvelope, setDrawerEnvelope] = useState(null);
const [detailsModalEnvelope, setDetailsModalEnvelope] = useState(null);

// Computed values
const totalAllocated = Object.values(allocations).reduce((sum, v) => sum + v, 0);
const remaining = DEMO_INCOME - totalAllocated;
```

---

## CSS Architecture

### Layout
```css
.reload-ceremony {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
}

.step-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0 20px 24px;
  overflow-y: auto;
}
```

### Envelope Grid
```css
.envelope-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.envelope-tile {
  background: #fff;
  border-radius: 16px;
  padding: 12px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.envelope-tile.filled {
  border: 2px solid #4ade80;
  box-shadow: 0 4px 12px rgba(74, 222, 128, 0.25);
}
```

### Drawer
```css
.envelope-drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
}

.envelope-drawer {
  background: #1a1a2e;
  border-radius: 20px 20px 0 0;
  padding: 12px 20px 24px;
  width: 100%;
  max-width: 400px;
}
```

---

## Dependencies

```json
{
  "gsap": "^3.x",           // Animations
  "gsap/Flip": "plugin",    // Layout animations
  "@mui/icons-material": "^7.x",  // Icons
  "react": "^18.x"
}
```

---

## Integration Checklist

1. **Data**: Replace `DEMO_*` constants with real user data
2. **Suggested amounts**: Implement actual 3-month average calculation
3. **History**: Fetch real spending history per envelope
4. **Persistence**: Save allocations to backend on complete
5. **Navigation**: Wire up "Start Spending" to exit ceremony
6. **Haptics**: Already uses `navigator.vibrate()` - works on mobile

---

## Files Structure

```
src/
├── ReloadCeremony.jsx      # Main component + sub-steps
├── ReloadCeremony.css      # All styles
└── (extract if needed):
    ├── components/
    │   ├── EnvelopeTile.jsx
    │   ├── AllocationDrawer.jsx
    │   ├── SpendingDetailsModal.jsx
    │   └── HorizontalSpendingChart.jsx
    ├── hooks/
    │   └── useCoinTransfer.js
    └── data/
        └── envelopes.js
```
