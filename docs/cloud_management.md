# Cloud Backend Management

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
