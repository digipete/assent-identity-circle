import type {
  DocumentType,
  Participant,
  Role,
  VerificationOutcome,
  VerificationRoute,
  VerificationStatus,
} from "./types";

export const ROLE_LABELS: Record<Role, string> = {
  executor: "Executor",
  administrator: "Administrator",
  beneficiary: "Beneficiary",
  attorney: "Attorney",
  submitter: "Person submitting the application",
  other: "Other",
};

export const ROUTE_LABELS: Record<VerificationRoute, string> = {
  one_login: "GOV.UK One Login",
  existing: "Existing identity verification process",
  undecided: "Not decided yet",
};

export const STATUS_DISPLAY: Record<VerificationStatus, { label: string; tagClass: string }> = {
  not_started: { label: "Not started", tagClass: "govuk-tag--grey" },
  invitation_sent: { label: "Invitation sent", tagClass: "govuk-tag--blue" },
  in_progress: { label: "In progress", tagClass: "govuk-tag--light-blue" },
  verified: { label: "Verified", tagClass: "govuk-tag--green" },
  needs_attention: { label: "Needs attention", tagClass: "govuk-tag--yellow" },
  unable_to_verify: { label: "Unable to verify", tagClass: "govuk-tag--red" },
  another_route: { label: "Using another route", tagClass: "govuk-tag--grey" },
};

export const OUTCOME_LABELS: Record<VerificationOutcome, string> = {
  none: "No result yet",
  verified: "Identity check completed",
  incomplete: "Started but not completed",
  unsuccessful: "Identity could not be confirmed",
  declined: "Chose not to continue",
  additional_verification_needed: "More information needed to confirm identity",
};

export const DOCUMENT_LABELS: Record<DocumentType, string> = {
  passport: "Passport",
  driving_licence: "Driving licence",
  other: "Other supported evidence",
  not_provided: "Not provided",
};

export function fullName(p: Pick<Participant, "firstName" | "lastName">) {
  return `${p.firstName} ${p.lastName}`.trim();
}

export function rolesText(roles: Role[]) {
  return roles.map((r) => ROLE_LABELS[r]).join(", ");
}

/** "Not sure" is treated as requiring a check until HM Land Registry decides otherwise. */
export function isRequired(p: Participant) {
  return p.identityCheckRequired !== "no";
}

export function statusForRoute(route: VerificationRoute, current: VerificationStatus): VerificationStatus {
  if (current === "verified") return current;
  if (route === "existing") return "another_route";
  if (current === "another_route") return "not_started";
  return current;
}

export interface Progress {
  required: number;
  verified: number;
  anotherRoute: number;
  outstanding: number;
  allRequestedComplete: boolean;
  furtherAssurance: number;
}

export function computeProgress(participants: Participant[]): Progress {
  const req = participants.filter(isRequired);
  const verified = req.filter((p) => p.verificationStatus === "verified").length;
  const anotherRoute = req.filter((p) => p.verificationStatus === "another_route").length;
  const outstanding = req.length - verified - anotherRoute;
  return {
    required: req.length,
    verified,
    anotherRoute,
    outstanding,
    allRequestedComplete: req.length > 0 && outstanding === 0,
    furtherAssurance: req.filter((p) => p.additionalChecksRequired).length,
  };
}

export function progressSentence(p: Progress) {
  if (p.required === 0) return "No one has been marked as needing to prove their identity yet.";
  const noun = p.required === 1 ? "required identity check" : "required identity checks";
  const verb = p.required === 1 ? "is" : "are";
  return `${p.verified} of ${p.required} ${noun} ${verb} complete.`;
}

export function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export function formatDateTime(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  return `${formatDate(iso)} at ${d.toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit" })}`;
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

export function findDuplicate(
  participants: Participant[],
  candidate: { firstName: string; lastName: string; email: string },
  excludeId?: string,
) {
  const name = `${candidate.firstName} ${candidate.lastName}`.trim().toLowerCase();
  const email = candidate.email.trim().toLowerCase();
  return participants.find(
    (p) =>
      p.id !== excludeId &&
      ((email && p.email.toLowerCase() === email) || fullName(p).toLowerCase() === name),
  );
}
