# Molly The Monday Reporter — Setup Guide

## What You Need
- Node.js 18+ installed
- A GitHub account (to deploy via Vercel)
- 15 minutes

---

## Step 1: Install Dependencies

```bash
cd molly
npm install
```

---

## Step 2: Create a Supabase Project (Free)

1. Go to **https://supabase.com** and click **Start your project** (free tier is fine)
2. Sign up / log in
3. Click **New Project**
   - Name: `molly` (or anything you like)
   - Database password: choose a strong password and **save it**
   - Region: pick the closest to your users (US East is good)
4. Wait ~2 minutes for the project to provision

---

## Step 3: Set Up the Database

1. In your Supabase dashboard, click **SQL Editor** in the left sidebar
2. Click **New query**
3. Copy the entire contents of `supabase/schema.sql` and paste it in
4. Click **Run** — you should see "Success. No rows returned."
5. Click **Table Editor** in the left sidebar and confirm `tetris_scores` appears

---

## Step 4: Get Your Supabase API Keys

1. In the Supabase dashboard, click **Project Settings** (gear icon) → **API**
2. You need two values:
   - **Project URL**: looks like `https://abcdefghij.supabase.co`
   - **anon public key**: a long JWT string starting with `eyJ...`

---

## Step 5: Configure Environment Variables

1. In the `molly/` folder, copy the example file:
   ```bash
   cp .env.example .env.local
   ```
2. Open `.env.local` in a text editor and fill in your values:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...your-anon-key...
   ```

---

## Step 6: Run Locally

```bash
npm run dev
```

Open **http://localhost:3000** in your browser. You should see Molly's home page.

Test each tab:
- **Weather** — should show 5 US regions with temperature/snowfall data
- **Illness** — should show flu ILI% and COVID admission charts
- **Competitor Ads** — should show Wayback Machine snapshots (some retailers may show fallback links)
- **Tetris** — play a game! High scores should save to Supabase.

---

## Step 7: Deploy to Vercel (Free)

### 7a. Push to GitHub first
```bash
git init
git add .
git commit -m "Initial Molly deployment"
# Create a repo at github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/molly.git
git push -u origin main
```

### 7b. Deploy on Vercel
1. Go to **https://vercel.com** and sign up with your GitHub account
2. Click **Add New Project**
3. Find your `molly` GitHub repo and click **Import**
4. In the **Environment Variables** section, add:
   | Key | Value |
   |-----|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGci...` |
5. Click **Deploy**
6. In ~2 minutes, your app will be live at `https://your-project.vercel.app`

### 7c. (Optional) Connect Supabase integration
1. In Vercel dashboard → **Integrations** → **Browse Marketplace**
2. Search **Supabase** and install it
3. Authorizes Vercel to auto-sync your Supabase env vars on future changes

---

## API Keys Reference

| Service | API Key Required? | Notes |
|---------|-------------------|-------|
| Open-Meteo (Weather) | **No** | Free public API |
| Delphi Epidata (Flu) | **No** | Free public API |
| CDC data.cdc.gov (COVID) | **No** | Free public API |
| Wayback Machine (Competitor Ads) | **No** | Free public API |
| Supabase (Tetris scores) | **Yes** | Your anon key (in .env.local) |

---

## Troubleshooting

### Weather data not loading
- Open your browser DevTools → Network tab → look for `/api/weather`
- Check the response for errors. Open-Meteo is free and doesn't require auth.
- If all temps show 0°, the archive API might be temporarily down — try again in a few minutes.

### Flu/COVID data shows "Data Unavailable"
- CDC and Delphi APIs occasionally have downtime. The page degrades gracefully.
- CDC data typically lags 1–2 weeks behind real-time.

### Competitor ad iframes show blank
- This is normal — many retailers block iframe embedding via security headers.
- Click **"Current Ad"** button to open the retailer's live weekly ad in a new tab.
- Some retailers (Costco, Kroger) archive better than others.

### Tetris scores not saving
- Confirm your `.env.local` has the correct Supabase URL and anon key.
- Go to Supabase dashboard → **Logs** → **API** to see incoming requests.
- Make sure you ran the full `supabase/schema.sql` in the SQL editor.

### Build errors on Vercel
- Go to Vercel → your project → **Deployments** → click the failed deploy → **View build logs**
- If it says "Missing env variable", make sure both Supabase vars are set in Vercel's environment settings.

---

## Customization Tips

- **Change default city for weather**: Edit `src/lib/utils/regions.ts` to add/change regions.
- **Adjust flu severity thresholds**: Edit the `getFluLevel()` function in `src/app/api/illness/route.ts`.
- **Add more Tetris products**: Edit `src/lib/tetris/pieces.ts` and add a new SVG to `public/tetris/`.
- **Change brand colors**: Edit the `molly` color palette in `tailwind.config.ts`.
