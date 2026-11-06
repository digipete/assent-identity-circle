import { identityProvider, type MockSimulation } from "@/identity/provider";
import { withEvent } from "@/research/events";
import { buildScenario } from "@/research/scenarios";
import { newCaseReference, newId, newInvitationToken } from "@/services/ids";
import { statusForRoute } from "./logic";
import { getState, setState } from "./store";
import type {
  CheckRequired,
  EventType,
  JourneyMode,
  Participant,
  PropertyAddress,
  PrototypeState,
  Role,
  VerificationRoute,
  VerificationStatus,
} from "./types";

const now = () => new Date().toISOString();

export function track(type: EventType, participantId: string | null = null, metadata: Record<string, string | number | boolean | null> = {}) {
  setState((s) => withEvent(s, type, participantId, metadata));
}

export function setFlash(message: string | null) {
  setState((s) => ({ ...s, flash: message }));
}

export function createCase(input: { address: PropertyAddress; titleNumber: string; deceasedOwnerName: string; role: Role }) {
  setState((s) => {
    const existing = s.case;
    const c = {
      id: existing?.id ?? newId(),
      reference: existing?.reference ?? newCaseReference(),
      propertyAddress: input.address,
      titleNumber: input.titleNumber,
      deceasedOwnerName: input.deceasedOwnerName,
      coordinatorRole: input.role,
      coordinatorParticipantId: existing?.coordinatorParticipantId ?? null,
      createdAt: existing?.createdAt ?? now(),
      updatedAt: now(),
      status: "open" as const,
    };
    const base: PrototypeState = existing
      ? { ...s, case: c }
      : { ...s, case: c, participants: [], invitations: [], identityChecks: [], scenarioId: s.scenarioId === "blank" ? "new" : s.scenarioId };
    return withEvent(base, "transaction_details_submitted", null, { coordinatorRole: input.role });
  });
}

export interface PersonInput {
  firstName: string;
  lastName: string;
  email: string;
  roles: Role[];
  isCoordinator: boolean;
  identityCheckRequired: CheckRequired;
  verificationRoute: VerificationRoute;
}

export function addParticipant(input: PersonInput): string {
  const id = newId();
  setState((s) => {
    if (!s.case) return s;
    const p: Participant = {
      id,
      caseId: s.case.id,
      ...input,
      email: input.email.trim(),
      verificationStatus: statusForRoute(input.verificationRoute, "not_started"),
      verificationOutcome: "none",
      verifiedAt: null,
      evidenceDocumentType: null,
      assuranceOutcome: "not_assessed",
      additionalChecksRequired: false,
      createdAt: now(),
      updatedAt: now(),
    };
    let participants = [...s.participants, p];
    if (input.isCoordinator) participants = participants.map((x) => (x.id === id ? x : { ...x, isCoordinator: false }));
    let next: PrototypeState = {
      ...s,
      participants,
      case: input.isCoordinator ? { ...s.case, coordinatorParticipantId: id } : s.case,
    };
    next = withEvent(next, "person_added", id, { roles: input.roles.join("|"), isCoordinator: input.isCoordinator, checkRequired: input.identityCheckRequired });
    next = withEvent(next, "verification_route_chosen", id, { verificationRoute: input.verificationRoute });
    return next;
  });
  return id;
}

/** Returns true when an existing completed check was reset because identity details changed. */
export function updateParticipant(id: string, input: PersonInput): boolean {
  let reset = false;
  setState((s) => {
    const prev = s.participants.find((p) => p.id === id);
    if (!prev || !s.case) return s;
    const identityChanged =
      prev.firstName.trim().toLowerCase() !== input.firstName.trim().toLowerCase() ||
      prev.lastName.trim().toLowerCase() !== input.lastName.trim().toLowerCase() ||
      prev.email.trim().toLowerCase() !== input.email.trim().toLowerCase();
    const hadResult = prev.verificationStatus === "verified" || prev.verificationOutcome !== "none";
    reset = identityChanged && hadResult;
    let updated: Participant = { ...prev, ...input, email: input.email.trim(), updatedAt: now() };
    let invitations = s.invitations;
    if (reset || (identityChanged && prev.verificationStatus === "invitation_sent")) {
      // Never reassign a completed check to a different person.
      updated = {
        ...updated,
        verificationStatus: "not_started",
        verificationOutcome: "none",
        verifiedAt: null,
        evidenceDocumentType: null,
        assuranceOutcome: "not_assessed",
        additionalChecksRequired: false,
      };
      invitations = s.invitations.map((i) => (i.participantId === id && i.status !== "completed" ? { ...i, status: "cancelled" } : i));
    }
    updated.verificationStatus = statusForRoute(updated.verificationRoute, updated.verificationStatus);
    let participants = s.participants.map((p) => (p.id === id ? updated : p));
    if (input.isCoordinator) participants = participants.map((x) => (x.id === id ? x : { ...x, isCoordinator: false }));
    const wasCoordinator = s.case.coordinatorParticipantId === id;
    let next: PrototypeState = {
      ...s,
      participants,
      invitations,
      case: { ...s.case, coordinatorParticipantId: input.isCoordinator ? id : wasCoordinator ? null : s.case.coordinatorParticipantId },
    };
    next = withEvent(next, "person_edited", id, { identityDetailsChanged: identityChanged, checkReset: reset });
    if (prev.verificationRoute !== input.verificationRoute) {
      next = withEvent(next, "verification_route_chosen", id, { verificationRoute: input.verificationRoute });
      if (input.verificationRoute === "existing") next = withEvent(next, "alternative_route_selected", id, { from: "coordinator" });
    }
    return next;
  });
  return reset;
}

export function removeParticipant(id: string) {
  setState((s) => {
    const next: PrototypeState = {
      ...s,
      participants: s.participants.filter((p) => p.id !== id),
      invitations: s.invitations.filter((i) => i.participantId !== id),
      case: s.case && s.case.coordinatorParticipantId === id ? { ...s.case, coordinatorParticipantId: null } : s.case,
    };
    return withEvent(next, "person_removed", id);
  });
}

export function sendInvitation(participantId: string): string {
  const token = newInvitationToken();
  setState((s) => {
    if (!s.case) return s;
    const resend = s.invitations.some((i) => i.participantId === participantId && !i.selfService && i.status !== "cancelled");
    const invitations = s.invitations.map((i) =>
      i.participantId === participantId && i.status !== "completed" ? { ...i, status: "cancelled" as const } : i,
    );
    invitations.push({ id: newId(), caseId: s.case.id, participantId, token, status: "sent", selfService: false, sentAt: now(), openedAt: null, completedAt: null });
    const participants = s.participants.map((p) =>
      p.id === participantId && (p.verificationStatus === "not_started" || p.verificationStatus === "invitation_sent")
        ? { ...p, verificationStatus: "invitation_sent" as VerificationStatus, updatedAt: now() }
        : p,
    );
    return withEvent({ ...s, invitations, participants }, resend ? "invitation_resent" : "invitation_sent", participantId);
  });
  return token;
}

/** Coordinator proving their own identity: creates a self-service link, no email. */
export function startSelfCheck(participantId: string): string {
  const existing = getState().invitations.find((i) => i.participantId === participantId && i.selfService && i.status !== "cancelled" && i.status !== "completed");
  if (existing) return existing.token;
  const token = newInvitationToken();
  setState((s) => {
    if (!s.case) return s;
    return {
      ...s,
      invitations: [...s.invitations, { id: newId(), caseId: s.case.id, participantId, token, status: "opened", selfService: true, sentAt: now(), openedAt: now(), completedAt: null }],
    };
  });
  return token;
}

export function markInvitationOpened(token: string) {
  setState((s) => {
    const inv = s.invitations.find((i) => i.token === token);
    if (!inv || inv.openedAt) return s;
    const next = { ...s, invitations: s.invitations.map((i) => (i.token === token ? { ...i, status: "opened" as const, openedAt: now() } : i)) };
    return withEvent(next, "invitation_opened", inv.participantId, { selfService: inv.selfService });
  });
}

export function markVerificationStarted(token: string) {
  setState((s) => {
    const inv = s.invitations.find((i) => i.token === token);
    if (!inv) return s;
    const participants = s.participants.map((p) =>
      p.id === inv.participantId && p.verificationStatus !== "verified"
        ? { ...p, verificationStatus: "in_progress" as VerificationStatus, verificationRoute: "one_login" as VerificationRoute }
        : p,
    );
    return withEvent({ ...s, participants }, "identity_verification_started", inv.participantId);
  });
}

export async function completeMockVerification(token: string, sim: MockSimulation) {
  const s0 = getState();
  const inv = s0.invitations.find((i) => i.token === token);
  if (!inv) return;
  const result = await identityProvider.verify({ participantId: inv.participantId, requestedConfidenceLevel: "P2" }, sim);
  setState((s) => {
    const t = now();
    const statusMap: Record<typeof result.outcome, VerificationStatus> = {
      verified: "verified",
      incomplete: "in_progress",
      unsuccessful: "unable_to_verify",
      declined: "needs_attention",
      additional_verification_needed: "needs_attention",
      none: "not_started",
    };
    const participants = s.participants.map((p) => {
      if (p.id !== inv.participantId) return p;
      const ok = result.identityVerified;
      return {
        ...p,
        verificationRoute: "one_login" as VerificationRoute,
        verificationStatus: statusMap[result.outcome],
        verificationOutcome: result.outcome,
        verifiedAt: ok ? t : null,
        evidenceDocumentType: ok ? (result.evidenceCategory ?? "not_provided") : null,
        assuranceOutcome: ok ? (result.requiresManualReview ? "further_assurance_needed" : "meets_prototype_threshold") : result.requiresManualReview ? "further_assurance_needed" : "not_assessed",
        additionalChecksRequired: result.requiresManualReview,
        updatedAt: t,
      } as Participant;
    });
    const invitations = s.invitations.map((i) => (i.token === token && result.identityVerified ? { ...i, status: "completed" as const, completedAt: t } : i));
    const identityChecks = [
      ...s.identityChecks,
      {
        id: newId(),
        participantId: inv.participantId,
        provider: identityProvider.name,
        providerSubjectReference: result.providerSubjectReference,
        requestedConfidenceLevel: "P2",
        returnedConfidenceLevel: result.returnedConfidenceLevel,
        outcome: result.outcome,
        checkedAt: t,
        evidenceCategory: result.evidenceCategory,
        requiresManualReview: result.requiresManualReview,
      },
    ];
    const minutes = Math.round((Date.now() - new Date(inv.sentAt).getTime()) / 60000);
    return withEvent(
      { ...s, participants, invitations, identityChecks },
      result.identityVerified ? "identity_verification_completed" : "identity_verification_failed",
      inv.participantId,
      { mockOutcome: sim.outcome, minutesSinceInvitation: minutes, verificationRoute: "one_login", selfService: inv.selfService },
    );
  });
}

export function chooseAlternativeRoute(participantId: string, from: "participant" | "coordinator") {
  setState((s) => {
    const participants = s.participants.map((p) =>
      p.id === participantId && p.verificationStatus !== "verified"
        ? { ...p, verificationRoute: "existing" as VerificationRoute, verificationStatus: "another_route" as VerificationStatus, updatedAt: now() }
        : p,
    );
    return withEvent({ ...s, participants }, "alternative_route_selected", participantId, { from });
  });
}

export function loadScenario(id: string) {
  setState((s) => withEvent(buildScenario(id, s), "scenario_loaded", null, { scenarioId: id }));
}

export function setJourneyMode(mode: JourneyMode) {
  setState((s) => withEvent({ ...s, journeyMode: mode }, "journey_mode_changed", null, { journeyMode: mode }));
}

export function clearEvents() {
  setState((s) => ({ ...s, events: [] }));
}
