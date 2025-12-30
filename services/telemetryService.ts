import { convexClient, getUserId } from "./convexClient";

export type TelemetryType =
  | "upload_summary"
  | "upload_error"
  | "analysis_request"
  | "analysis_success"
  | "analysis_error"
  | "queue_item_failed";

export const logTelemetryEvent = async (
  type: TelemetryType,
  payload: Record<string, unknown>
) => {
  if (!convexClient) return;
  const client = convexClient as any;
  try {
    await client.mutation("telemetry:log", {
      userId: getUserId(),
      type,
      payload,
    });
  } catch (err) {
    // Avoid breaking UX if telemetry fails.
    console.warn("Telemetry log failed", err);
  }
};
