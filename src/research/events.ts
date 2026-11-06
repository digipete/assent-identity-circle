import type { ActivityEvent, EventType, PrototypeState } from "@/domain/types";
import { newId } from "@/services/ids";

/** Build an event with standard research metadata. Only fictional prototype data is recorded. */
export function makeEvent(
  s: PrototypeState,
  eventType: EventType,
  participantId: string | null = null,
  metadata: ActivityEvent["metadata"] = {},
): ActivityEvent {
  return {
    id: newId(),
    caseId: s.case?.id ?? null,
    participantId,
    eventType,
    timestamp: new Date().toISOString(),
    metadata: {
      scenarioId: s.scenarioId,
      journeyMode: s.journeyMode,
      participantCount: s.participants.length,
      selectedRoles: Array.from(new Set(s.participants.flatMap((p) => p.roles))),
      lastStage: eventType,
      ...metadata,
    },
  };
}

export function withEvent(
  s: PrototypeState,
  eventType: EventType,
  participantId: string | null = null,
  metadata: ActivityEvent["metadata"] = {},
): PrototypeState {
  return { ...s, events: [...s.events, makeEvent(s, eventType, participantId, metadata)] };
}

export function eventsToJson(events: ActivityEvent[]) {
  return JSON.stringify(events, null, 2);
}

export function eventsToCsv(events: ActivityEvent[]) {
  const metaKeys = Array.from(new Set(events.flatMap((e) => Object.keys(e.metadata))));
  const header = ["id", "timestamp", "eventType", "caseId", "participantId", ...metaKeys];
  const esc = (v: unknown) => {
    const s = v === null || v === undefined ? "" : Array.isArray(v) ? v.join("|") : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const rows = events.map((e) =>
    [e.id, e.timestamp, e.eventType, e.caseId, e.participantId, ...metaKeys.map((k) => e.metadata[k])]
      .map(esc)
      .join(","),
  );
  return [header.join(","), ...rows].join("\n");
}
