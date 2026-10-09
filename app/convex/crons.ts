import { cronJobs } from "convex/server"
import { internal } from "./_generated/api"
const crons = cronJobs()
crons.interval(
  "purge calculator measurements",
  { hours: 1 },
  internal.calculatorMeasurements.purge,
  {}
)
export default crons
