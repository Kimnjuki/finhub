// crons.ts
// Comprehensive Convex cron jobs for data pipeline, alerts, and maintenance
// @ts-ignore - suppress missing type in stale generated env
import { cronJobs } from "convex/server";

const crons = cronJobs();

// @ts-ignore - type definitions for cronJobs are unavailable without codegen
(crons as any).interval(
  "heatmap refresh",
  { seconds: 10 },
  "convex/cronActions:heatmapRefreshAction"
);

// @ts-ignore
(crons as any).interval(
  "price aggregates",
  { seconds: 60 },
  "convex/cronActions:priceAggregatesAction"
);

// @ts-ignore
(crons as any).interval(
  "liquidation clusters",
  { seconds: 300 },
  "convex/cronActions:liquidationClustersAction"
);

// @ts-ignore
(crons as any).interval(
  "alert evaluator",
  { seconds: 30 },
  "convex/cronActions:alertEvaluatorAction"
);

// @ts-ignore
(crons as any).cron(
  "portfolio snapshots",
  // @ts-ignore
  { hourUTC: 0, minuteUTC: 5 } as any,
  "convex/cronActions:portfolioSnapshotAction"
);

// @ts-ignore
(crons as any).cron(
  "correlation matrix",
  // @ts-ignore
  { dayOfWeek: "sunday", hourUTC: 1, minuteUTC: 0 } as any,
  "convex/cronActions:correlationMatrixAction"
);

// @ts-ignore
(crons as any).interval(
  "stream health monitor",
  { seconds: 30 },
  "convex/cronActions:streamHealthMonitorAction"
);

export default crons;