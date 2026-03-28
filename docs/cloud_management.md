# Cloud Backend Management

> [!WARNING]
> **STALE — DO NOT USE FOR DEVELOPMENT**
> The deploy commands in this file (`firebase deploy --only functions`) contradict the
> project's deploy rules in `CLAUDE.md`, which require using `npm run deploy:staging` or
> `npm run deploy:prod` at all times. Using raw firebase CLI commands bypasses the
> build validation step and risks deploying the wrong project or emulator URLs.
> See `docs/firebase-deployment.md` for the correct procedure.

This guide explains how to manage the Firebase Cloud Functions backend to control costs.

## Status Check
Check if functions are running:
```bash
firebase functions:list
```

## Turn OFF (Delete Backend)
To stop incurring costs for the Cloud Run instance, delete the function:

```bash
# Delete the specific 'api' function
firebase functions:delete api --region us-central1 --force
```
*Note: The `--force` flag skips the confirmation prompt.*

## Turn ON (Deploy Backend)
To bring the backend back online:

```bash
# Deploy only the functions
firebase deploy --only functions
```

## Cost Savings
Deleting the function removes the Cloud Run service, stopping all compute costs. The database (Firestore) and Storage will remain active and may incur small storage costs if data is present.
