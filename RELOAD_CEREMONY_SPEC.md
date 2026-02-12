# Reload Ceremony - UX Specification

## Overview

**Reload** is a guided ceremony that marks the transition between budget periods. When a new budgeting period begins, users are presented with a celebratory review of their previous period's performance, then guided through allocating funds to their envelopes for the upcoming period.

The name "Reload" fits Loot's gaming-inspired brand - like reloading ammo or resources before the next level.

---

## User Flow Summary

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Step 1        │    │   Step 2        │    │   Step 3        │    │   Step 4        │
│   DEBRIEF       │ -> │   LEFTOVERS     │ -> │   ALLOCATION    │ -> │   COMPLETE      │
│                 │    │                 │    │                 │    │                 │
│  Fun stats &    │    │  Handle surplus │    │  Distribute     │    │  Confirmation   │
│  achievements   │    │  money from     │    │  income to      │    │  & return to    │
│  from last      │    │  spending       │    │  spending       │    │  normal app     │
│  period         │    │  envelopes      │    │  envelopes      │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## Example: camnealie@gmail.com's Envelopes

### System Envelopes (Not User-Editable)
| Envelope | Type | Purpose |
|----------|------|---------|
| **Income** | System | Receives all deposits/paychecks. Locked after ceremony completion. |
| **Transfers** | System | Internal transfers between envelopes. Hidden from UI. |

### Spending Envelopes
| Envelope | Icon | Purpose | Typical Allocation |
|----------|------|---------|-------------------|
| **Groceries** | Shopping Cart | Supermarket, fresh food | $600/month |
| **Eating Out** | Fork & Knife | Restaurants, takeaways, coffee | $200/month |
| **Transport** | Car | Petrol, parking, rideshare | $150/month |
| **Entertainment** | Film Reel | Movies, events, hobbies | $100/month |
| **Subscriptions** | Repeat | Netflix, Spotify, gym | $80/month |
| **Personal Care** | Health | Haircuts, pharmacy, self-care | $60/month |
| **Household** | House | Cleaning supplies, home maintenance | $50/month |
| **Clothing** | Shirt | Clothes, shoes, accessories | $100/month |

### Saving Envelopes
| Envelope | Icon | Purpose | Target |
|----------|------|---------|--------|
| **Emergency Fund** | Piggy Bank | 3-month safety net | $10,000 |
| **Holiday** | Airplane | Annual trip fund | $3,000 |
| **Tech Upgrade** | Laptop | New laptop/phone | $1,500 |

---

## Step 1: Debrief

### Purpose
Review the previous period with achievement-style "debrief cards" that make budgeting feel rewarding rather than tedious. This step celebrates wins and provides interesting insights.

### What Happens
1. Modal appears with header icon (wallet) and "Time to Budget!"
2. Shows period dates (e.g., "Jan 1 - Jan 31")
3. Displays up to 3 randomly-selected achievement cards

### Debrief Card Types

| Card Type | Criteria | Example for camnealie |
|-----------|----------|----------------------|
| **Big Spender** | Largest single transaction | "$342 at Noel Leeming" |
| **Regular** | Most visits to one merchant | "12 visits to Countdown" |
| **Cliff Hanger** | Envelope that got closest to $0 | "Groceries hit $8.50" |
| **Ghost Town** | Envelope with zero transactions | "Clothing: untouched" |
| **High Traffic** | Most transactions in one envelope | "47 transactions in Groceries" |
| **Whale** | Highest total spend category | "$620 total on Groceries" |
| **One and Done** | Envelope used exactly once | "Personal Care: 1 transaction" |
| **Penny Pincher** | Smallest average transaction | "Avg $4.20 at dairies" |

### UI Elements
- Icon + title + value display for each card
- Color-coded by achievement type (green for positive, amber for neutral, red for warnings)
- "Let's Budget" button to proceed

### Design Notes
```
┌─────────────────────────────────────┐
│           [Wallet Icon]             │
│                                     │
│        Time to Budget!              │
│        Jan 1 - Jan 31               │
│                                     │
│   ┌─────────────────────────────┐   │
│   │ [Icon] Big Spender    $342  │   │
│   │ Largest purchase at Noel    │   │
│   │ Leeming                     │   │
│   └─────────────────────────────┘   │
│                                     │
│   ┌─────────────────────────────┐   │
│   │ [Icon] High Traffic    47   │   │
│   │ 47 transactions in Groceries│   │
│   └─────────────────────────────┘   │
│                                     │
│   ┌─────────────────────────────┐   │
│   │ [Icon] Ghost Town      $0   │   │
│   │ No activity in Clothing     │   │
│   └─────────────────────────────┘   │
│                                     │
│         [ Let's Budget → ]          │
│                                     │
└─────────────────────────────────────┘
```

---

## Step 2: Leftovers

### Purpose
Decide what to do with surplus money remaining in **spending envelopes** from the previous period. Saving envelopes are excluded - their accumulated balance is intentional.

### What Happens
1. Shows total leftover amount across all spending envelopes
2. Displays grid of spending envelopes with positive balances
3. User chooses one of three options:
   - **Keep in Envelopes**: Surplus rolls over (envelope starts with previous balance + new allocation)
   - **Move to Savings**: Sweep selected surplus to savings envelope (with coin animation)
   - **Return to Income**: Return to income envelope (increases available allocation)

### Example for camnealie
```
┌─────────────────────────────────────┐
│           [Confetti Icon]           │
│                                     │
│        You have leftovers!          │
│             $156.70                 │
│                                     │
│   Drag envelopes to savings, or     │
│   choose an option below            │
│                                     │
│   ┌─────────────────────────────┐   │
│   │ [PiggyBank] Savings         │   │
│   │ Drag envelopes here         │   │
│   └─────────────────────────────┘   │
│                                     │
│   ┌────────┐ ┌────────┐ ┌────────┐  │
│   │Groceries│ │Eating  │ │Trans-  │  │
│   │ $45.20 │ │ Out    │ │ port   │  │
│   │        │ │ $23.00 │ │ $38.50 │  │
│   └────────┘ └────────┘ └────────┘  │
│                                     │
│   ┌────────┐ ┌────────┐             │
│   │Entert- │ │Personal│             │
│   │ainment │ │ Care   │             │
│   │ $35.00 │ │ $15.00 │             │
│   └────────┘ └────────┘             │
│                                     │
│   ┌─────────────────────────────┐   │
│   │ [Wallet] Keep in Envelopes  │   │
│   │ Leave leftovers for next    │   │
│   └─────────────────────────────┘   │
│                                     │
│   ┌─────────────────────────────┐   │
│   │ [Tray] Return to Income     │   │
│   │ Add $156.70 to allocate     │   │
│   └─────────────────────────────┘   │
│                                     │
│      [ Move $0 to Savings ]         │
│                                     │
└─────────────────────────────────────┘
```

### Interaction Options

**Drag & Drop**
- Drag envelope tiles to the savings drop zone
- Coin animation plays when dropped
- Envelope becomes semi-transparent after moving

**Tap to Select**
- Tap envelopes to select multiple
- Selection summary shows count and total
- "Select All" / "Clear" chips available
- Continue button changes to reflect selection

**Quick Actions**
- "Keep in Envelopes" - one tap, all leftovers roll over
- "Return to Income" - one tap, all leftovers added to allocation pool

### Empty State
If no spending envelopes have positive balances:
```
┌─────────────────────────────────────┐
│           [Target Icon]             │
│                                     │
│         No Leftovers!               │
│                                     │
│   You used all your budget last     │
│   period.                           │
│                                     │
│          [ Continue ]               │
│                                     │
└─────────────────────────────────────┘
```

---

## Step 3: Allocation

### Purpose
Distribute money from the Income envelope to each spending envelope for the upcoming period. This is the core budgeting action.

### What Happens
1. Income envelope shown at top with available balance and live "remaining" counter
2. Grid of spending envelope tiles with sliders
3. Each tile shows:
   - Envelope icon and name
   - Current balance (after leftover decision)
   - Slider to set allocation amount
   - Suggested amount based on history
4. Savings backup shown if user has savings (can dip into savings for over-budget)

### Example for camnealie

**Income Available:** $2,400.00 (from paychecks this period)

| Envelope | Current Balance | Suggested | Actual Allocation |
|----------|-----------------|-----------|-------------------|
| Groceries | $45.20 (kept) | $600 | $550 |
| Eating Out | $0 (sent to savings) | $200 | $200 |
| Transport | $38.50 (kept) | $150 | $120 |
| Entertainment | $35.00 (kept) | $100 | $100 |
| Subscriptions | $0 | $80 | $80 |
| Personal Care | $0 (sent to savings) | $60 | $60 |
| Household | $0 | $50 | $50 |
| Clothing | $0 | $100 | $50 |

**Total Allocated:** $1,210
**Remaining:** $1,190 (stays in Income for next period or manual transfers)

### UI Layout
```
┌─────────────────────────────────────┐
│  ┌───────────────────────────────┐  │
│  │ [Dollar] Income               │  │
│  │ $2,400.00 available           │  │
│  │                      $1,190   │  │
│  │                     remaining │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ [PiggyBank] Savings backup    │  │
│  │                      $1,250   │  │
│  └───────────────────────────────┘  │
│                                     │
│  ████████████████░░░░░░ (progress)  │
│                                     │
│  [Auto-fill]  [Clear]               │
│                                     │
│  ┌─────────────┐ ┌─────────────┐    │
│  │ [Cart]      │ │ [Fork]      │    │
│  │ Groceries   │ │ Eating Out  │    │
│  │ Bal: $45.20 │ │ Bal: $0     │    │
│  │ [-]===○===[+]│ │ [-]==○====[+]│   │
│  │ $550        │ │ $200        │    │
│  │ Sugg: $600  │ │ Sugg: $200  │    │
│  └─────────────┘ └─────────────┘    │
│                                     │
│  ┌─────────────┐ ┌─────────────┐    │
│  │ [Car]       │ │ [Film]      │    │
│  │ Transport   │ │ Entertain-  │    │
│  │ Bal: $38.50 │ │ ment        │    │
│  │ [-]===○===[+]│ │ Bal: $35   │    │
│  │ $120        │ │ [-]==○====[+]│   │
│  │ Sugg: $150  │ │ $100        │    │
│  └─────────────┘ │ Sugg: $100  │    │
│                  └─────────────┘    │
│  ... more tiles ...                 │
│                                     │
│  ┌───────────────────────────────┐  │
│  │   Complete Budget ($1,210)    │  │
│  └───────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

### Features

**Quick Actions**
- **Auto-fill**: Fills all envelopes to their suggested amounts (scaled if income insufficient)
- **Clear**: Resets all allocations to $0

**Slider Controls**
- Drag slider or use +/- buttons (44px touch targets)
- $5 increments for precise control
- Max based on remaining income + savings backup

**Over-Budget Handling**
- If total allocations exceed income, shows warning
- Can dip into Savings envelope if available
- Alert shows how much will come from savings
- Cannot complete if over-budget exceeds savings balance

**Coin Animation**
On completion:
1. Coins animate from Income envelope to each allocated envelope
2. If using savings, coins animate from Savings → Income first
3. Floating badge shows total allocated

---

## Step 4: Complete

### Purpose
Confirm the budget is set and transition back to normal app usage.

### What Happens
1. Success message with checkmark
2. Summary of total allocated
3. Days remaining in period
4. Date of next Reload
5. "Start Spending" button returns to dashboard

### UI Layout
```
┌─────────────────────────────────────┐
│                                     │
│           [Checkmark]               │
│                                     │
│       Budget Complete!              │
│                                     │
│   You allocated $1,210 across       │
│   8 envelopes                       │
│                                     │
│   ┌───────────────────────────────┐ │
│   │ 28 days remaining             │ │
│   │ Next budget: Feb 1            │ │
│   └───────────────────────────────┘ │
│                                     │
│        [ Start Spending ]           │
│                                     │
└─────────────────────────────────────┘
```

### Post-Completion Behavior
- User mode changes from "budget" to "spend"
- Income envelope becomes **locked** (visible but cannot transfer from)
- Dashboard shows normal transaction view
- Next Reload triggers automatically on next period start date

---

## Data Flow

### API Endpoints

| Endpoint | Purpose |
|----------|---------|
| `GET /budget/status` | Check if Reload is pending, get period dates |
| `GET /budget/debrief` | Get achievement cards for step 1 |
| `GET /budget/leftovers` | Get spending envelopes with positive balances |
| `GET /budget/allocations` | Get envelope suggestions and income available |
| `POST /budget/complete` | Submit ceremony results |

### Complete Request Payload
```json
{
  "leftoverDecision": "savings",
  "selectedLeftoverEnvelopeIds": [4, 8],
  "allocations": [
    { "envelopeId": 3, "amount": 55000 },
    { "envelopeId": 4, "amount": 20000 },
    { "envelopeId": 5, "amount": 12000 }
  ],
  "debriefCardsShown": ["big_spender", "high_traffic", "ghost_town"]
}
```
Note: Amounts are in cents (55000 = $550.00)

### Database Effects
1. Creates `budgetRound` record with period dates and ceremony metadata
2. Creates `envelopeAllocation` records for each envelope
3. Creates `imaginaryTransaction` records for:
   - Leftover transfers (if moving to savings or income)
   - Allocation transfers (income → each envelope)
4. Updates `userConfig.budgetMode` to 'spend'
5. Updates `userConfig.lastBudgetCompletedAt`

---

## Trigger Conditions

### When Reload Activates
- First app open on or after the user's configured budget period start day
- User has not completed Reload for the current period

### Blocking Behavior
- Reload is a **guided flow** - users must complete it before accessing normal app functionality
- Modal appears immediately on app open
- Cannot dismiss without completing (no skip option)

### Period Configuration
- User sets their budget period start day (1-28) in Settings
- Default is 1st of month
- Period runs from start day to day before next start day

---

## Animation Specifications

### Coin Stream
- Used when: Moving leftovers to savings, allocating from income
- Behavior: 5-12 coins arc from source to destination
- Duration: 800ms per stream
- Easing: Ease-out for natural physics feel

### Floating Badge
- Used when: Completing leftover move, completing budget
- Behavior: Appears, floats up, fades out
- Content: Amount text (e.g., "+$156.70 saved!")
- Duration: 1200ms

### Tile Transitions
- Selected state: scale(1.02), enhanced border, checkmark badge
- Dragging: scale(1.05), elevated shadow, reduced opacity on source
- Moved: opacity(0.4), pointer-events: none

---

## Accessibility

- All interactive elements have 44px minimum touch targets
- +/- buttons on sliders for non-drag interaction
- WCAG contrast ratios on all text
- Screen reader labels on all controls
- Step progress indicator shows "Step X of 4"

---

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| First-time user (no history) | Skip debrief cards, show "Fresh Start!" message |
| No Income available | Show warning, allow proceeding with $0 allocations |
| No spending envelopes | Skip leftovers step |
| No saving envelopes | Hide savings drop zone in leftovers |
| Missed Reload window | Continue showing on every app open until complete |
| Mid-period signup | First Reload at next period start |
