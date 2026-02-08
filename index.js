import { fileURLToPath } from 'url';
import { app } from './src/server/app.js';
import { config } from './src/server/config/index.js';

// Compatible ESM check
const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);

if (isMainModule) {
    app.listen(config.port, () => {
        console.log(`Server running on port ${config.port} in ${config.env} mode`);
        console.log(`API available at http://localhost:${config.port}/api/v1`);
    });
}

export { app }; 
