import { ConvexReactClient } from 'convex/react';
import * as convexNamespace from 'convex';

const client = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

export { convexNamespace as convex };
export default client;
