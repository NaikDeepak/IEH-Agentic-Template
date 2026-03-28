#!/usr/bin/env node
/**
 * Predeploy guard — runs automatically via firebase.json predeploy hook.
 * Blocks bare `firebase deploy` commands that bypass the validated npm scripts.
 *
 * It checks that the command is executed via one of the approved npm scripts.
 */

const ALLOWED_LIFECYCLES = ['deploy:staging', 'deploy:prod'];
const lifecycleEvent = process.env.npm_lifecycle_event;

if (!ALLOWED_LIFECYCLES.includes(lifecycleEvent) || process.env.DEPLOY_GUARD !== 'true') {
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
