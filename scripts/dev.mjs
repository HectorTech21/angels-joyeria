import { serve } from './static-server.mjs';
const preview = process.argv.includes('--preview');
serve({ preview });
