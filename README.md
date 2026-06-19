## 1. SPLIT THE BILL

A web app that lets people split any bill by uploading a receipt photo. The app OCRs the receipt, displays items on a digital card, lets users assign items to people, tracks who paid what, and outputs a minimal settle-up transaction list.

---

## 2. Tech Stack

| Concern | Solution |
|---|---|
| OCR | Tesseract.js (CDN, runs in-browser) |
| Math | JavaScript |
| Share card | html2canvas (CDN) |

---

## 3. App Flow — 8 Screens

### Screen 1 — Landing / Snap Receipt
- Full-screen landing with app name and tagline
- Two large buttons: **"Enter items manually"** (skips to Screen 3 with empty list)  and **🖼 Upload Image**

### Screen 2 — OCR Parsing
- Tesseract.js runs in background — show animated progress bar with percentage
- Text: *"Reading your receipt…"* in Caveat font
- On complete → auto-advance to Screen 3
- If Tesseract fails or finds nothing → show error: *"Hmm, couldn't read this one. Let's enter items manually!"* → redirect to Screen 3 with empty list

### Screen 3 — Edit Items (the "Digital Receipt Card")
- **The cartoonized receipt:** parsed items rendered as a pastel receipt
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
- Chips are removable (×) and reorderable (drag or up/down arrows)
- Minimum 2 people enforced — show message if only 1
- Counter shown: *"6 people splitting PKR 3,200"*
- CTA: **"Assign items →"**

### Screen 5 — Assign Items
- Each item card shows: `[emoji] [name] [price]`
- Below each item: a row of avatar chips (colored circles with initials) for every person
- Tap a chip to toggle that person as "responsible" for the item
- If multiple people selected on one item → item price is split equally among them (shown as `price ÷ n`)
- **"Everyone"** shortcut button per item — assigns to all people at once
- **Floating bottom bar** — live running total per person: colored pill per person showing their current total. Updates instantly on every tap
- Unassigned items shown with a subtle warning indicator so user knows to assign them
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
- Per-person section showing their share of the bill
- Transaction list — each row: `[name] → pays → [name] : [amount]`
- Amounts displayed using chosen rounding and routing mode from Screen 6
- **Share card button:** html2canvas screenshots the settle-up section → downloads as PNG or opens share sheet on mobile.
- **"Start new split"** button → clears state, back to Screen 1

---

## 4. Math Engine 


## How the Splitting Works

### 1. Greedy Algorithm (`greedyRoute`)

The greedy algorithm minimizes the **number of transactions** needed to settle the bill.

**How it works:**
1. Separate everyone into two groups: **debtors** (owe money) and **creditors** (are owed money).
2. Sort both groups by amount (largest first).
3. Match the biggest debtor with the biggest creditor, and have the debtor pay as much as possible in one transaction.
4. Repeat until all debts are settled.

**Best for:** Keeping things simple with the fewest money transfers.

---

### 2. Even Algorithm (`evenRoute`)

The even algorithm spreads payments **proportionally across all creditors**.

**How it works:**
1. Separate everyone into debtors and creditors, same as above.
2. Each debtor pays every creditor a proportional share of what they owe.
3. Instead of one big payment to one person, debts are distributed evenly.

**Best for:** When you want everyone to receive money from multiple people (e.g., multiple people paid with their cards).

---

### How Balances Are Calculated First

Before either algorithm runs, each person's **balance** is calculated:

```
balance = amount_paid - amount_owed
```

- **Negative balance** = you owe money (debtor)
- **Positive balance** = you're owed money (creditor)
- **Zero** = you're all set

The amount owed includes each person's share of items assigned to them, plus their portion of tax and tip (split proportionally based on their item total).


