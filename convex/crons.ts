import { cronJobs } from "convex/server";

const crons = cronJobs();

// Runs nightly in UTC.
crons.cron("delete old photos (14d)", "0 3 * * *", "cleanup:deleteOldPhotos", {});

export default crons;

