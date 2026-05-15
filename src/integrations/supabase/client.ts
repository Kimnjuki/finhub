import { createClient } from 'convex';

const convex = createClient(process.env.CONVEX_DEPLOY_KEY, { url: process.env.VITE_CONVEX_URL });
export { convex };
