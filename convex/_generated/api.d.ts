/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ai from "../ai.js";
import type * as chat from "../chat.js";
import type * as cleanup from "../cleanup.js";
import type * as crons from "../crons.js";
import type * as files from "../files.js";
import type * as game from "../game.js";
import type * as goals from "../goals.js";
import type * as logs from "../logs.js";
import type * as queue from "../queue.js";
import type * as telemetry from "../telemetry.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  ai: typeof ai;
  chat: typeof chat;
  cleanup: typeof cleanup;
  crons: typeof crons;
  files: typeof files;
  game: typeof game;
  goals: typeof goals;
  logs: typeof logs;
  queue: typeof queue;
  telemetry: typeof telemetry;
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
