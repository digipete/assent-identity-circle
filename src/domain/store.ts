import { useSyncExternalStore } from "react";
import type { PrototypeState } from "./types";

const KEY = "hmlr-assent-identity-prototype-v1";

export function emptyState(): PrototypeState {
  return {
    scenarioId: "blank",
    journeyMode: "A",
    case: null,
    participants: [],
    invitations: [],
    identityChecks: [],
    events: [],
    flash: null,
  };
}

const SERVER_SNAPSHOT = emptyState();
let state: PrototypeState | null = null;
const listeners = new Set<() => void>();

function load(): PrototypeState {
  if (state) return state;
  if (typeof window === "undefined") return SERVER_SNAPSHOT;
  try {
    const raw = window.localStorage.getItem(KEY);
    state = raw ? { ...emptyState(), ...(JSON.parse(raw) as PrototypeState) } : emptyState();
  } catch {
    state = emptyState();
  }
  return state;
}

export function getState() {
  return load();
}

export function setState(update: (s: PrototypeState) => PrototypeState) {
  state = update(load());
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable: keep in memory */
  }
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function usePrototype() {
  return useSyncExternalStore(subscribe, load, () => SERVER_SNAPSHOT);
}
