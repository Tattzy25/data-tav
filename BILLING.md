# Billing & Monetization Options for Brigit AI

Since you asked for quick advice on billing, here are some options to consider:

## Free Tier + Premium Model

### Option 1: Freemium with Limits
- **Free Tier**: 100 AI generations/month, 5,000 manual rows
- **Pro Tier** ($9-19/month): Unlimited generations, priority support
- **Business Tier** ($49-99/month): API access, team features, white-label

### Option 2: Pay-Per-Use
- Free for URL import and manual generation
- $0.01 - $0.05 per AI generation
- Bulk packages: $5 for 500 generations, $20 for 2,500, etc.

### Option 3: Credit System
- Free users: 50 credits/month (1 credit = 1 AI generation)
- Buy credits: $5 for 100 credits, $20 for 500 credits
- Credits never expire

## Quick Implementation with Stripe

For the easiest setup, use:
1. **Stripe Checkout** for one-time payments
2. **Stripe Billing** for subscriptions
3. **Lemon Squeezy** (alternative, easier than Stripe for indie hackers)

## Recommended Approach for Solo Dev

Since you're building for yourself but want to make some money:

1. **Start Free** - Get users and feedback first
2. **Add Simple Limits** - Free: 10 AI gens/day, Pro: unlimited
3. **Use Lemon Squeezy** - Easiest to set up, handles taxes/VAT
4. **Simple Pricing**: $9/month for unlimited

### Implementation Steps
```bash
npm install @lemonsqueezy/lemonsqueezy.js
```

Add a simple paywall:
- Check user's subscription status
- If free tier limit reached, show upgrade modal
- Redirect to Lemon Squeezy checkout
- Webhook to activate subscription

## Alternative: API Key Model

Sell API access instead:
- Free tier: 100 requests/month
- Pro API key: $20/month for 10,000 requests
- Enterprise: Custom pricing

This is easier than managing user accounts - just generate and validate API keys.

## My Recommendation

**For YOU right now:**
1. Launch it **free first**
2. Get 100+ users
3. Add a simple $9/month Pro plan with Lemon Squeezy
4. Offer: Unlimited AI generations + priority support
5. Keep it simple - one paid tier

Don't overcomplicate billing early. Focus on making it epic first! 🚀

---

**Quick Links:**
- [Lemon Squeezy](https://www.lemonsqueezy.com/) - Easiest for indie hackers
- [Stripe](https://stripe.com/) - Industry standard
- [Paddle](https://www.paddle.com/) - All-in-one merchant of record
