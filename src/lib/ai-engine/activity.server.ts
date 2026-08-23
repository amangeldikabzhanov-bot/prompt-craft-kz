// Activity Logger — in-memory structured event trail for a single plan run.
// Future Agent Mode can persist these events; nothing is written to the DB yet.
import type { AiActivityEvent, AiEventType } from "./types";

export class ActivityLog {
  private events: AiActivityEvent[] = [];

  add(
    type: AiEventType,
    message: string,
    data?: Record<string, string | number | boolean | null>,
  ): void {
    this.events.push({
      type,
      message,
      at: new Date().toISOString(),
      ...(data ? { data } : {}),
    });
  }

  all(): AiActivityEvent[] {
    return [...this.events];
  }
}
