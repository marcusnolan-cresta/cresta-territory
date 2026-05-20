# Cresta EMEA Territory Intelligence
### Marcus Nolan · Live Account Dashboard

A React web app that renders your full territory intelligence — 21 accounts, Gong history, tech stack, Cresta positioning — from a single JSON file. Update the JSON weekly and the live site refreshes automatically via GitHub Actions.

---

## One-time Setup (~15 minutes)

### Step 1 — Create the GitHub repo

1. Go to [github.com/new](https://github.com/new)
2. Name it exactly: `cresta-territory`
3. Set to **Private**
4. **Do not** initialise with README (you already have one)
5. Click **Create repository**

### Step 2 — Enable GitHub Pages

1. In your new repo → **Settings** → **Pages** (left sidebar)
2. Under **Source**, select **GitHub Actions**
3. Save

### Step 3 — Push the code

Open your terminal and run:

```bash
# Navigate to this project folder (wherever you saved it)
cd path/to/cresta-territory

# Initialise git
git init
git add .
git commit -m "Initial territory dashboard"

# Connect to your GitHub repo (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/cresta-territory.git
git branch -M main
git push -u origin main
```

### Step 4 — Wait ~2 minutes

GitHub Actions will automatically build and deploy your site. You'll see it at:

```
https://YOUR_USERNAME.github.io/cresta-territory/
```

Check progress at: `github.com/YOUR_USERNAME/cresta-territory/actions`

---

## Adding Password Protection (Recommended)

GitHub Pages is public by default. For a private sales territory doc, use Vercel (free):

1. Go to [vercel.com](https://vercel.com) → Import your GitHub repo
2. Vercel auto-detects Vite — just click Deploy
3. In Vercel project settings → **Environment Variables** → add:
   - `VITE_PASSWORD` = `your-chosen-password`
4. Add this to `src/main.jsx` at the top:

```js
const pwd = import.meta.env.VITE_PASSWORD;
if (pwd && sessionStorage.getItem('auth') !== pwd) {
  const entered = prompt('Enter access password:');
  if (entered !== pwd) { document.body.innerHTML = 'Access denied'; throw new Error(); }
  sessionStorage.setItem('auth', pwd);
}
```

Your live URL from Vercel will be password-protected.

---

## Weekly Update Workflow

**Every Monday morning, open a Claude conversation and say:**

> "Run territory update — pull new Gong calls since last Monday for all 21 accounts, check ZoomInfo for new scoops, search Glean for new internal decks, update last_activity dates and gong_history arrays in accounts.json, regenerate the file."

Claude will:
1. Search Gong for new calls on each account
2. Pull ZoomInfo scoops for trigger events
3. Search Glean for new engagement signals
4. Update `accounts.json` with changes
5. Give you the updated file to replace `src/accounts.json`

Then push to GitHub:

```bash
# Replace the data file, then:
git add src/accounts.json
git commit -m "Territory update $(date +%Y-%m-%d)"
git push
```

Site updates in ~2 minutes automatically. ✅

---

## What each file does

```
cresta-territory/
├── src/
│   ├── accounts.json          ← THE ONLY FILE YOU UPDATE WEEKLY
│   ├── App.jsx                ← Main layout, filters, sort
│   ├── index.css              ← All styling
│   ├── main.jsx               ← React entry point
│   └── components/
│       ├── AccountCard.jsx    ← Sidebar list item
│       ├── AccountDetail.jsx  ← Right panel deep-dive
│       └── SummaryBar.jsx     ← A/B/C counts at top
├── .github/workflows/
│   └── deploy.yml             ← Auto-deploys on every push
├── index.html
├── vite.config.js             ← Set base to '/cresta-territory/'
└── package.json
```

---

## Adding a New Account

Open `accounts.json` and add a new object to the `accounts` array following the same structure. The app renders everything dynamically from the JSON — no code changes needed.

---

## Updating the Priority Counts

After adding/changing account priorities, update the `meta.priority_counts` object at the top of `accounts.json`:

```json
"meta": {
  "last_updated": "2026-05-25",
  "total_accounts": 22,
  "priority_counts": { "A": 6, "B": 11, "C": 5 }
}
```
