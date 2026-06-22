/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as auth from "../auth.js";
import type * as crons from "../crons.js";
import type * as eventSubscriptions from "../eventSubscriptions.js";
import type * as events from "../events.js";
import type * as follows from "../follows.js";
import type * as ingestion_adapters_binance from "../ingestion/adapters/binance.js";
import type * as ingestion_adapters_coinbase from "../ingestion/adapters/coinbase.js";
import type * as ingestion_adapters_kraken from "../ingestion/adapters/kraken.js";
import type * as ingestion_types from "../ingestion/types.js";
import type * as migrations_seed from "../migrations/seed.js";
import type * as queries_helpers from "../queries/helpers.js";
import type * as roles from "../roles.js";
import type * as subscriptions from "../subscriptions.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  auth: typeof auth;
  crons: typeof crons;
  eventSubscriptions: typeof eventSubscriptions;
  events: typeof events;
  follows: typeof follows;
  "ingestion/adapters/binance": typeof ingestion_adapters_binance;
  "ingestion/adapters/coinbase": typeof ingestion_adapters_coinbase;
  "ingestion/adapters/kraken": typeof ingestion_adapters_kraken;
  "ingestion/types": typeof ingestion_types;
  "migrations/seed": typeof migrations_seed;
  "queries/helpers": typeof queries_helpers;
  roles: typeof roles;
  subscriptions: typeof subscriptions;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};