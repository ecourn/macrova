/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as account from "../account.js";
import type * as auth from "../auth.js";
import type * as calculatorMeasurements from "../calculatorMeasurements.js";
import type * as catalogue from "../catalogue.js";
import type * as catalogueState from "../catalogueState.js";
import type * as contracts_access from "../contracts/access.js";
import type * as contracts_catalogue from "../contracts/catalogue.js";
import type * as contracts_commands from "../contracts/commands.js";
import type * as contracts_events from "../contracts/events.js";
import type * as contracts_food from "../contracts/food.js";
import type * as crons from "../crons.js";
import type * as http from "../http.js";
import type * as lib_access from "../lib/access.js";
import type * as nutrition from "../nutrition.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  account: typeof account;
  auth: typeof auth;
  calculatorMeasurements: typeof calculatorMeasurements;
  catalogue: typeof catalogue;
  catalogueState: typeof catalogueState;
  "contracts/access": typeof contracts_access;
  "contracts/catalogue": typeof contracts_catalogue;
  "contracts/commands": typeof contracts_commands;
  "contracts/events": typeof contracts_events;
  "contracts/food": typeof contracts_food;
  crons: typeof crons;
  http: typeof http;
  "lib/access": typeof lib_access;
  nutrition: typeof nutrition;
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

export declare const components: {
  betterAuth: import("@convex-dev/better-auth/_generated/component.js").ComponentApi<"betterAuth">;
  rateLimiter: import("@convex-dev/rate-limiter/_generated/component.js").ComponentApi<"rateLimiter">;
};
