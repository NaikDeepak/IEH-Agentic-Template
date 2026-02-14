# Firebase Quick Reference

Quick reference guide for common Firebase operations and deployment commands.

---

## Deployment Commands

### Full Deployment
```bash
# Deploy everything (hosting + functions + firestore rules)
firebase deploy

# Deploy with confirmation prompts
firebase deploy --interactive
```

### Partial Deployment
```bash
# Deploy only frontend (static files)
firebase deploy --only hosting

# Deploy only backend (Cloud Functions)
firebase deploy --only functions

# Deploy only Firestore rules and indexes
firebase deploy --only firestore

# Deploy specific function
firebase deploy --only functions:api
```

### Preview Deployment
```bash
# Deploy to preview channel (doesn't affect production)
firebase hosting:channel:deploy preview

# View preview URL
# Output: https://project-id--preview-abc123.web.app
```

---

## Local Development

### Start Development Servers
```bash
# Start both frontend and backend
npm run dev:full

# Or start separately:
npm run dev          # Frontend only (Vite on :5173)
npm run server       # Backend only (Express on :3001)
```

### Firebase Emulators (Optional)
```bash
# Start all emulators
firebase emulators:start

# Start specific emulators
firebase emulators:start --only firestore,auth
```

---

## Project Management

### Initialize Firebase
```bash
# Initialize Firebase in current directory
firebase init

# Select services:
# [ ] Hosting
# [ ] Functions
# [ ] Firestore
```

### Switch Projects
```bash
# List available projects
firebase projects:list

# Use specific project
firebase use project-id

# Add project alias
firebase use --add
```

---

## Functions Management

### Function Configuration
```bash
# Set environment variable
firebase functions:config:set gemini.api_key="your-key"

# Get environment variables
firebase functions:config:get

# Unset environment variable
firebase functions:config:unset gemini.api_key
```

### Function Logs
```bash
# View function logs (last 20 lines)
firebase functions:log

# Stream logs in real-time
firebase functions:log --only api

# View logs for specific function
firebase functions:log --only api --lines 50
```

### Function Shells
```bash
# Interactive function testing
firebase functions:shell

# In shell:
> api({ url: '/test', method: 'GET' })
```

---

## Firestore Operations

### Security Rules
```bash
# Deploy rules only
firebase deploy --only firestore:rules

# Validate rules syntax
firebase firestore:rules:validate
```

### Indexes
```bash
# Deploy indexes
firebase deploy --only firestore:indexes

# List indexes
firebase firestore:indexes
```

### Data Management
```bash
# Export all Firestore data
gcloud firestore export gs://bucket-name/export-folder

# Import Firestore data
gcloud firestore import gs://bucket-name/export-folder
```

---

## Hosting Management

### Cache Control
```bash
# Clear hosting cache
firebase hosting:cache:clear
```

### Custom Domain
```bash
# Add custom domain
firebase hosting:sites:create custom-domain

# View hosting sites
firebase hosting:sites:list
```

---

## Monitoring & Debugging

### View Logs
```bash
# View all logs
gcloud logging read "resource.type=cloud_function" --limit=50

# View error logs only
gcloud logging read "resource.type=cloud_function AND severity>=ERROR" --limit=20
```

### Performance Monitoring
- Visit: `console.firebase.google.com/project/PROJECT_ID/performance`
- Metrics: Page load times, network requests, function execution

### Error Tracking (Sentry)
- Frontend errors: Automatically captured
- Backend errors: Logged in Cloud Functions console
- Dashboard: `sentry.io`

---

## Cost Management

### View Usage
```bash
# View current billing
firebase projects:usage

# Set budget alerts in Firebase Console:
# Project Settings → Usage and billing → Budget alerts
```

### Optimize Costs
```bash
# Check function execution times
firebase functions:log --only api | grep "execution took"

# Review Firestore usage
# Console → Firestore → Usage tab
```

---

## Common Workflows

### Deploy New Feature
```bash
# 1. Test locally
npm run dev:full

# 2. Run tests
npm test

# 3. Build production
npm run build

# 4. Deploy to preview
firebase hosting:channel:deploy feature-name

# 5. Test preview
# Visit preview URL

# 6. Deploy to production
firebase deploy
```

### Rollback Deployment
```bash
# 1. Check git history
git log --oneline

# 2. Checkout previous version
git checkout <commit-hash>

# 3. Redeploy
firebase deploy

# 4. Return to latest
git checkout main
```

### Debug Production Issue
```bash
# 1. Check function logs
firebase functions:log --only api --lines 100

# 2. Check Sentry for errors
# Visit sentry.io dashboard

# 3. Check Firestore rules
firebase firestore:rules:validate

# 4. Test with emulators
firebase emulators:start
```

---

## Environment Variables

### Frontend (.env)
```bash
# Local development
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_APP_ID=your-app-id

# Never commit secrets!
# Add to .gitignore: .env
```

### Backend (Functions)
```bash
# Set via Firebase CLI
firebase functions:config:set service.api_key="secret-key"

# Access in code:
const apiKey = functions.config().service.api_key;
```

---

## Performance Optimization Checklist

### Frontend
- [ ] Code splitting enabled (React.lazy)
- [ ] Images optimized (WebP, compression)
- [ ] Lazy loading implemented
- [ ] Bundle size analyzed (`npm run build`)
- [ ] Service worker configured (optional)

### Backend
- [ ] Function execution time <3s
- [ ] Cold starts minimized (minInstances)
- [ ] Database queries indexed
- [ ] Batch operations used
- [ ] Connection pooling implemented

### Database
- [ ] Composite indexes created
- [ ] Security rules optimized
- [ ] Caching enabled (offline persistence)
- [ ] Pagination implemented
- [ ] No hot document contention

---

## Security Checklist

### Pre-Deployment
- [ ] Firestore rules validated
- [ ] No API keys in frontend code (for production)
- [ ] Environment variables secured
- [ ] CORS configured properly
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints

### Post-Deployment
- [ ] Monitor error rates (Sentry)
- [ ] Review authentication logs
- [ ] Check for unusual usage patterns
- [ ] Update dependencies (`npm audit`)

---

## Troubleshooting

### Build Fails
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Function Not Updating
```bash
# Force redeploy
firebase deploy --only functions:api --force
```

### Firestore Rules Error
```bash
# Validate rules
firebase firestore:rules:validate

# Test rules with emulators
firebase emulators:start --only firestore
```

### CORS Issue
```javascript
// functions/index.js
const cors = require('cors')({ origin: true });
app.use(cors);
```

---

## Useful Links

- **Firebase Console**: `console.firebase.google.com`
- **Firebase Documentation**: `firebase.google.com/docs`
- **Cloud Functions Pricing**: `cloud.google.com/functions/pricing`
- **Firestore Pricing**: `firebase.google.com/docs/firestore/quotas`
- **Status Page**: `status.firebase.google.com`

---

## Emergency Contacts

### Firebase Support
- **Free Plan**: Community support (Stack Overflow, Discord)
- **Paid Plans**: Email support, SLA-backed response times
- **Critical Issues**: Firebase Console → Support tab

### Internal Team
- **DevOps Lead**: [Contact info]
- **Backend Team**: [Contact info]
- **On-Call Rotation**: [Link to schedule]

---

For detailed information, see:
- [Firebase Deployment Architecture](./firebase-deployment.md)
- [Firebase Scaling Guide](./firebase-scaling.md)
