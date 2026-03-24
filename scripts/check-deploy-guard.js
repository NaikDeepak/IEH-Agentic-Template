#!/usr/bin/env node
/**
 * Predeploy guard — runs automatically via firebase.json predeploy hook.
 * Blocks bare `firebase deploy` commands that bypass the validated npm scripts.
 *
 * The DEPLOY_GUARD env var is set exclusively by:
 *   npm run deploy:staging
 *   npm run deploy:prod
 *
 * If it is not set, the deploy is rejected.
 */

if (process.env.DEPLOY_GUARD !== 'true') {
    console.error('');
    console.error('🚫  Direct firebase deploy is blocked.');
    console.error('');
    console.error('    Use the npm scripts instead — they build, validate, then deploy:');
    console.error('');
    console.error('      npm run deploy:staging   →  india-emp-hub-dev');
    console.error('      npm run deploy:prod       →  india-emp-hub');
    console.error('');
    console.error('    These scripts ensure the correct build (staging vs prod) is');
    console.error('    deployed and that no emulator config is baked into the dist.');
    console.error('');
    process.exit(1);
}
