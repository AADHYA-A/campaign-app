# Vercel Environment Variables Setup Guide

This document lists **all environment variables** that must be configured in the
Vercel dashboard for the campaign app to work correctly in production.

---

## Step 1 — Open Your Vercel Project Settings

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click your project (`campaign-bycorncha-aadhya-as-projects`)
3. Go to **Settings → Environment Variables**

---

## Step 2 — Add Each Variable Below

### 🔑 Required Variables

| Variable | Value | Notes |
|---|---|---|
| `GEMINI_API_KEY` | `your_key_here` | Get free key → step 3 below |
| `GEMINI_MODEL` | `gemini-1.5-flash` | Free & fast model |
| `SECRET_KEY` | `<random 32-byte hex>` | Run: `openssl rand -hex 32` |

### 🗄️ Database (Vercel Postgres — Free Tier)

Vercel automatically injects `POSTGRES_URL` when you add the Postgres add-on.
The backend `config.py` already handles this automatically.

| Variable | Value | Notes |
|---|---|---|
| `POSTGRES_URL` | *Auto-injected by Vercel* | Add the Postgres add-on (see step 4) |

### 🔐 Auth

| Variable | Value | Notes |
|---|---|---|
| `ALGORITHM` | `HS256` | Default, can leave as-is |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` | Default, can leave as-is |

---

## Step 3 — Get a Free Gemini API Key

1. Visit [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Sign in with a Google account
3. Click **"Create API key"**
4. Copy the key and paste it as the value of `GEMINI_API_KEY` in Vercel

> Free tier gives **60 requests/minute** with `gemini-1.5-flash` — more than enough for this app.

---

## Step 4 — Set Up Vercel Postgres (Free Database)

1. In your Vercel project, go to **Storage** tab
2. Click **"Create Database"** → choose **Postgres**
3. Select the free **Hobby** plan
4. Click **Connect to Project** — Vercel will automatically inject `POSTGRES_URL`

The backend already reads `POSTGRES_URL` and configures itself automatically
(see [`config.py`](./backend/app/core/config.py)).

---

## Step 5 — Redeploy

After adding all environment variables:
1. Go to **Deployments** tab in your Vercel project
2. Click the 3-dot menu on the latest deployment → **Redeploy**
3. Or push any commit to trigger a new automatic deployment

---

## Verification

Once deployed, test these URLs (replace with your actual domain):

```
# Backend health check
https://your-app.vercel.app/api/backend/health
→ Should return: {"status": "ok"}

# Test campaign generation (requires login first)
https://your-app.vercel.app/dashboard
→ Enter a topic like "diwali" and click Generate
```

---

## Local Development (No Changes Needed)

For local development, add these to `backend/.env`:

```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash
DATABASE_URL=postgresql+asyncpg://admin:adminpassword@localhost:5432/campaign_db
SECRET_KEY=any_secret_key_for_local_dev
```
