
# TaxPilot AI — AI Co-Pilot for Indian CAs & CA Students

## The Wedge
A focused AI assistant that knows **Indian tax law cold** (Income Tax Act, GST Act, Companies Act, ICAI standards, recent circulars & case law) and helps CAs + CA students do their daily grunt work 5x faster.

## Why this wins for YOU specifically
- **Distribution = your campus** → recruit CA-aspirant friends as first 50 free users → they share in ICAI WhatsApp/Telegram groups (these go viral, 50k+ members each)
- **₹0 budget friendly** → Lovable Cloud free tier + Lovable AI Gateway free credits cover MVP
- **Solo-founder friendly** → one product, one persona, clear pricing, no sales team needed
- **Charge Day 1** → 7-day free trial → ₹299/mo (student) or ₹1,999/mo (professional)

## MVP Features (what we'll build)

### 1. Landing Page
- Hero: "The AI Co-Pilot Built for Indian Chartered Accountants"
- Show 3 demo use cases (animated)
- Pricing (Student / Professional / Firm tiers)
- "Start 7-day free trial" CTA
- Social proof section (testimonials placeholder for now)

### 2. Auth & Onboarding
- Email signup (Lovable Cloud)
- Pick role: CA Student / Practicing CA / CA Firm
- Free 7-day trial auto-starts

### 3. The Core App — 4 AI Tools in One Dashboard
**a) Tax Q&A Chat** — ask anything about Income Tax Act, GST, Companies Act. Answers cite the actual section number + sub-section. (This is the killer feature — no hallucinated sections.)

**b) Notice Reply Drafter** — paste/upload any IT or GST notice → AI drafts a professional reply with correct legal language and citations.

**c) Client Email Generator** — describe situation in 1 line → AI writes a polished client email in CA-appropriate tone.

**d) Case Law Summarizer** — paste a judgment or case name → get a 5-bullet summary + ratio decidendi.

All four powered by one chat interface with mode selector + system prompts tuned per task. Streaming responses, markdown rendering, copy/export buttons.

### 4. Usage Limits & Paywall
- Free trial: 25 queries
- After trial: blocked screen with pricing
- Track usage per user in DB

### 5. Payments
- Razorpay or Stripe (built-in Stripe — works for India, supports INR & UPI subscriptions)
- ₹299 / ₹1,999 / ₹4,999 monthly plans

### 6. Founder Dashboard (you only)
- Daily signups, active users, conversion rate, MRR
- Most-used features
- So you make data-driven decisions, not vibes

## Tech (auto-handled by Lovable)
- Lovable Cloud → auth, database, edge functions
- Lovable AI Gateway → Gemini 2.5 Pro for tax Q&A (best reasoning), Gemini 2.5 Flash for cheaper tools
- System prompts loaded with Indian tax act context + few-shot examples per tool
- Stripe for INR subscriptions

## Design Direction
Clean, professional, trustworthy (CAs are conservative). Navy + white + a single accent. No childish gradients. Think Zerodha/Razorpay aesthetic, not consumer app. Fully mobile responsive (most CA students will use this on phone first).

## What Happens After MVP Ships (your roadmap, not in this build)
- Week 1–2: Get 50 free users from your campus + CA WhatsApp groups
- Week 3–4: Convert 10% to paid → first ₹15k MRR
- Month 2: Add GST return filing helper, ITR helper
- Month 3: Add team/firm seats, sell to CA firms (10x ARPU)
- Month 6: 500 paid users → ₹10L MRR → you can quit/skip placements with proof
- Month 12: ₹50L–1Cr ARR → raise seed round OR keep bootstrapping

## Honest reality check (one last time)
Billionaire by 23 from this app: ~0.001% odds. Nobody can promise that and be honest.
₹50L–5Cr ARR solo business by 24: very achievable if you execute weekly and talk to users daily.
That's the actual path. Build → ship → talk to 5 users every day → iterate. Click "Implement plan" and let's start.
