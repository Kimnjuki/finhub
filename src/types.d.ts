// Type declarations for Convex runtime to augment missing members
declare module "convex" {
  const defineAction: any;
  const defineQuery: any;
  const query: any;
  const mutation: any;
  const action: any;
  const defineMutation: any;
  // Add other members if needed
}

// Type declarations for Convex server module
declare module "convex/server" {
  const defineAction: any;
  const action: any;
  const defineQuery: any;
  const query: any;
  const defineMutation: any;
  const mutation: any;
  const defineSchema: any;
  const defineTable: any;
  // Add other members if needed
}
