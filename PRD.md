
# 📄 PRD — Split the Bill

**Version:** 1.0
**Stack:** Vanilla HTML + CSS + JS (single file) or React — developer's choice
**Cost:** $0 — no APIs, no backend, no accounts
**Core principle:** Math-first. OCR and cuteness are layers on top of a solid split engine.

---

## 1. Product Overview

A mobile-first web app that lets a group of people split a restaurant/any bill by snapping a receipt photo. The app OCRs the receipt, displays items on a cute digital card, lets users assign items to people, tracks who paid what, and outputs a minimal settle-up transaction list. Zero AI, zero cost, works entirely in the browser.

---

## 2. Tech Stack

| Concern | Solution |
|---|---|
| OCR | Tesseract.js (CDN, runs in-browser) |
| Math | Pure JS — no libraries |
| Confetti | canvas-confetti (CDN) |
| Share card | html2canvas (CDN) |
| Storage | localStorage (auto-save session) |
| Hosting | GitHub Pages / Vercel free tier |
| Fonts | Google Fonts — "Nunito" for body, "Caveat" for receipt card items |
| Icons/Emoji | Unicode emoji only, no icon library needed |

---

## 3. App Flow — 8 Screens

### Screen 1 — Landing / Snap Receipt
- Full-screen landing with app name and tagline
- Two large buttons: **"Enter items manually"** (skips to Screen 3 with empty list)  and **🖼 Upload Image**

### Screen 2 — OCR Parsing
- Show image preview the user just took/uploaded
- Tesseract.js runs in background — show animated progress bar with percentage
- Text: *"Reading your receipt…"* in Caveat font
- On complete → auto-advance to Screen 3
- If Tesseract fails or finds nothing → show friendly error: *"Hmm, couldn't read this one. Let's enter items manually!"* → redirect to Screen 3 with empty list

### Screen 3 — Edit Items (the "Digital Receipt Card")
- **The cartoonized receipt:** parsed items rendered as a pastel card with dashed border, drop shadow, Caveat handwritten font — not a photo filter, pure CSS
- Each line item shows: `[emoji] [item name] [price]` — all three editable inline
- Emoji is auto-assigned from a keyword→emoji JS map (see Section 7). User can tap emoji to change it
- Buttons per item: ✏️ edit, 🗑 delete
- **"+ Add item"** button at bottom of card — opens inline input row
- **Total** shown at bottom of card, auto-calculated
- **Tax / tip row** (optional toggle): user can add a tax % or flat tip amount — gets added to total and distributed proportionally across all items
- CTA button: **"Looks good →"** advances to Screen 4

### Screen 4 — Add People
- Title: *"Who's splitting?"*
- Input field: type name → press Enter or tap ✓ → person added as a colored bubble chip
- Each person auto-assigned a pastel color from a fixed palette (mint, peach, lavender, lemon, coral, sky, rose, sage) — cycling if more than 8 people
- Chips are removable (×) and reorderable (drag or up/down arrows)
- Minimum 2 people enforced — show friendly message if only 1
- Counter shown: *"6 people splitting PKR 3,200"*
- CTA: **"Assign items →"**

### Screen 5 — Assign Items
- Each item card shows: `[emoji] [name] [price]`
- Below each item: a row of avatar chips (colored circles with initials) for every person
- Tap a chip to toggle that person as "responsible" for the item
- If multiple people selected on one item → item price is split equally among them (shown as `price ÷ n`)
- **"Everyone"** shortcut button per item — assigns to all people at once
- **Floating bottom bar** — live running total per person: colored pill per person showing their current total. Updates instantly on every tap
- Unassigned items shown with a subtle warning indicator (orange dot) so user knows to assign them
- CTA: **"Who paid? →"** — disabled until all items are assigned

### Screen 6 — Who Paid + Settings
This screen has two parts:

**Part A — Payment entry**
- Per person: a toggle **"Paid"** + amount input field (only shown when toggled on)
- Progress bar at top: fills as entered payment amounts approach total bill
- Shows: *"PKR 3,200 total · PKR 3,200 entered ✓"* when complete
- Multiple people can have paid (partial or full)
- People who didn't pay: leave toggle off (amount = 0)

**Part B — Settings panel** (collapsible, shown below payment section)
- **Routing mode selector:** toggle between two modes
  - **Smart (Min transactions):** greedy algorithm — fewest possible payments to settle all debts
  - **Even (Proportional):** each debtor pays every creditor their proportional share — more payments but feels "fairer" to some people
  - Live preview of transaction count: *"Smart: 4 transactions · Even: 8 transactions"*

- CTA: **"Settle up →"**

### Screen 7 — Settle Up
- Title: *"Here's the plan ✨"*
- Per-person section showing their share of the bill
- Transaction list — each row: `[Person avatar] [name] → pays → [Person avatar] [name] : [amount]`
- Amounts displayed using chosen rounding and routing mode from Screen 6
- **"Paid ✓"** toggle per transaction — user can mark as settled. When marked, row gets a strikethrough + green checkmark
- When ALL transactions are marked paid → confetti burst (canvas-confetti) + text: *"All settled! 🎉"*
- **Share card button:** html2canvas screenshots the settle-up section → downloads as PNG or opens share sheet on mobile. Card styled like a cute pastel "dinner receipt" — shareable to group chats
- **"Start new split"** button → clears state, back to Screen 1

---

## 4. Math Engine (implement exactly)

**I've made it. You don't need to make it**


## 5. State Model

Keep one global state object (JS object or React state):

```js
state = {
  theme: 'sakura'
  receiptImage: null,        // base64 or blob URL
  items: [
    { id, name, price, emoji, assignedTo: [personId, ...] }
  ],
  tax: 0,                    // flat amount added to total
  tip: 0,                    // flat amount added to total
  people: [
    { id, name, color, amountPaid }
  ],
  settings: {
    routingMode: 'smart'     // smart | even
  },
  transactions: [
    { from: personId, to: personId, amount, paid: false }
  ],
  currentScreen: 1
}
```

Auto-save full state to `localStorage` on every change. On app load, check localStorage — if session exists, show *"Resume your last split?"* prompt.

---

## 6. Color / Theme System

All colors defined as CSS variables on `:root`. `data-theme` on `<body>` switches theme.

```css
[data-theme="sakura"] {
  --bg: #FFF5F7; --surface: #FFEEF2; --accent: #E8829A;
  --text: #3D1C26; --border: #F5C5D0; --chip-shadow: #F9A8BE;
}
```

Person color palette (auto-assigned in order):
#FFB3BA (rose), #FFDFBA (peach), #FFFFBA (lemon), #d1f8d9 (mint), #BAE1FF (sky), #D4BAFF
(lavender), #FFBAF5 (pink), #8ff1dc (sage)

---

## 7. Emoji Keyword Map

```js
const emojiMap = {
  pizza: '🍕', burger: '🍔', fries: '🍟', pasta: '🍝', rice: '🍚',
  chicken: '🍗', fish: '🐟', sushi: '🍣', salad: '🥗', soup: '🍜',
  sandwich: '🥪', wrap: '🌯', steak: '🥩', egg: '🍳', waffle: '🧇',
  pancake: '🥞', bread: '🍞', cake: '🎂', icecream: '🍦', dessert: '🍮',
  cookie: '🍪', donut: '🍩', coffee: '☕', tea: '🍵', juice: '🧃',
  cola: '🥤', pepsi: '🥤', water: '💧', beer: '🍺', wine: '🍷',
  cocktail: '🍹', milkshake: '🥛', lemonade: '🍋', smoothie: '🥤',
  nachos: '🧀', wings: '🍗', ribs: '🍖', lobster: '🦞', shrimp: '🍤',
  default: '🍽️'
}

function getEmoji(itemName) {
  const lower = itemName.toLowerCase()
  for (const [key, emoji] of Object.entries(emojiMap)) {
    if (lower.includes(key)) return emoji
  }
  return emojiMap.default
}
```

---

## 8. OCR Implementation (Tesseract.js)

```js
import Tesseract from 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.esm.min.js'

async function parseReceipt(imageFile) {
  const { data: { text } } = await Tesseract.recognize(imageFile, 'eng', {
    logger: m => updateProgress(m.progress)
  })
  return extractItems(text)
}

function extractItems(rawText) {
  const lines = rawText.split('\n').filter(l => l.trim())
  const items = []
  // Regex: capture item name + price (handles formats like "Item Name 12.50" or "Item Name $12.50")
  const priceRegex = /^(.+?)\s+\$?([\d,]+\.?\d{0,2})\s*$/
  for (const line of lines) {
    const match = line.match(priceRegex)
    if (match) {
      const price = parseFloat(match[2].replace(',', ''))
      if (price > 0 && price < 100000) { // sanity check
        items.push({
          id: crypto.randomUUID(),
          name: match[1].trim(),
          price,
          emoji: getEmoji(match[1]),
          assignedTo: []
        })
      }
    }
  }
  return items
}
```

---

## 9. UX Details & Micro-interactions

- **All screen transitions:** slide left/right (CSS transform transition, 300ms ease)
- **Back button:** always visible top-left, slides right
- **Item assign tap:** color-pulse animation on the avatar chip (scale 1 → 1.15 → 1, 150ms)
- **Progress bar (Screen 6):** smooth CSS transition on width change
- **Confetti:** trigger `confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } })` from canvas-confetti CDN
- **Share card:** hide all buttons/navigation before html2canvas screenshot, restore after
- **Haptic feedback (mobile):** `navigator.vibrate(10)` on item assign taps if supported
- **Receipt card font:** Caveat (Google Fonts) for item names to feel handwritten
- **All monetary inputs:** `type="number"` with `inputmode="decimal"` for mobile number pad
- **Session restore prompt:** on load, if localStorage has data, show a bottom sheet: *"You have an unfinished split — resume or start fresh?"*

---

## 10. Edge Cases to Handle

| Case | Handling |
|---|---|
| Item assigned to 0 people | Block "Who paid?" CTA, highlight unassigned items in orange |
| More paid than total bill | Show warning: *"Total entered exceeds bill amount"* |
| Less paid than total bill | Show warning + remaining amount: *"PKR 400 still unaccounted"* |
| OCR finds no items | Skip to Screen 3 with empty list + tip to add manually |
| Negative price parsed by OCR | Filter out — likely a discount line; optionally show as "Discount" item with special treatment |

---
