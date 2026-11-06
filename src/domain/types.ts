// Prototype data model. Transaction, participants, invitations, identity checks
// and activity events are kept separate so a real service could replace storage.

export type Role =
  | "executor"
  | "administrator"
  | "beneficiary"
  | "attorney"
  | "submitter"
  | "other";

export type CheckRequired = "yes" | "no" | "not_sure";

export type VerificationRoute = "one_login" | "existing" | "undecided";

export type VerificationStatus =
  | "not_started"
  | "invitation_sent"
  | "in_progress"
  | "verified"
  | "needs_attention"
  | "unable_to_verify"
  | "another_route";

export type VerificationOutcome =
  | "none"
  | "verified"
  | "incomplete"
  | "unsuccessful"
  | "declined"
  | "additional_verification_needed";

export type DocumentType = "passport" | "driving_licence" | "other" | "not_provided";

export type AssuranceOutcome = "not_assessed" | "meets_prototype_threshold" | "further_assurance_needed";

export interface PropertyAddress {
  line1: string;
  line2: string;
  town: string;
  postcode: string;
}

export interface AssentIdentityCase {
  id: string;
  reference: string;
  propertyAddress: PropertyAddress;
  titleNumber: string;
  deceasedOwnerName: string;
  coordinatorRole: Role;
  coordinatorParticipantId: string | null;
  createdAt: string;
  updatedAt: string;
  status: "open" | "checks_complete";
}

export interface Participant {
  id: string;
  caseId: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: Role[];
  isCoordinator: boolean;
  identityCheckRequired: CheckRequired;
  verificationRoute: VerificationRoute;
  verificationStatus: VerificationStatus;
  verificationOutcome: VerificationOutcome;
  verifiedAt: string | null;
  evidenceDocumentType: DocumentType | null;
  assuranceOutcome: AssuranceOutcome;
  additionalChecksRequired: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Invitation {
  id: string;
  caseId: string;
  participantId: string;
  token: string;
  status: "sent" | "opened" | "completed" | "cancelled";
  selfService: boolean;
  sentAt: string;
  openedAt: string | null;
  completedAt: string | null;
}

export interface IdentityCheck {
  id: string;
  participantId: string;
  provider: string;
  providerSubjectReference: string | null;
  requestedConfidenceLevel: string;
  returnedConfidenceLevel: string | null;
  outcome: VerificationOutcome;
  checkedAt: string;
  evidenceCategory: DocumentType | null;
  requiresManualReview: boolean;
}

export type EventType =
  | "start_page_viewed"
  | "service_started"
  | "transaction_details_submitted"
  | "person_added"
  | "person_edited"
  | "person_removed"
  | "verification_route_chosen"
  | "invitation_sent"
  | "invitation_opened"
  | "invitation_resent"
  | "identity_verification_started"
  | "identity_verification_completed"
  | "identity_verification_failed"
  | "alternative_route_selected"
  | "returned_to_coordinator_view"
  | "summary_viewed"
  | "scenario_loaded"
  | "journey_mode_changed";

export interface ActivityEvent {
  id: string;
  caseId: string | null;
  participantId: string | null;
  eventType: EventType;
  timestamp: string;
  metadata: Record<string, string | number | boolean | null | string[]>;
}

export type JourneyMode = "A" | "B";

export interface PrototypeState {
  scenarioId: string;
  journeyMode: JourneyMode;
  case: AssentIdentityCase | null;
  participants: Participant[];
  invitations: Invitation[];
  identityChecks: IdentityCheck[];
  events: ActivityEvent[];
  flash: string | null;
}
