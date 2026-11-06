import type {
  AssentIdentityCase,
  Invitation,
  Participant,
  PrototypeState,
} from "@/domain/types";
import { newCaseReference, newId, newInvitationToken } from "@/services/ids";

export interface ScenarioDefinition {
  id: string;
  name: string;
  description: string;
}

export const SCENARIOS: ScenarioDefinition[] = [
  { id: "blank", name: "Blank start", description: "No transfer set up. Start from the start page." },
  { id: "A", name: "Scenario A – Single participant", description: "One executor who is also the beneficiary. They have not yet proved their identity – use ‘Prove your identity’ on their page to complete it." },
  { id: "B", name: "Scenario B – Multiple parties", description: "Two executors and one beneficiary. One verified, one invited with no response, one not started." },
  { id: "C", name: "Scenario C – Mixed verification routes", description: "One verified with One Login, one using the existing route, one needing additional checks." },
  { id: "D", name: "Scenario D – Verification difficulty", description: "An invited person started One Login but could not finish. Open their invitation to choose another route." },
  { id: "E", name: "Scenario E – Duplicate roles", description: "One person is both executor and beneficiary and appears once with two roles." },
  { id: "F", name: "Scenario F – Assurance exception", description: "Everyone has verified, but one result needs further assurance before the application can rely on it." },
];

const daysAgo = (d: number, h = 0) => new Date(Date.now() - d * 86400000 - h * 3600000).toISOString();

function makeCase(address: AssentIdentityCase["propertyAddress"], deceased: string, title: string): AssentIdentityCase {
  return {
    id: newId(),
    reference: newCaseReference(),
    propertyAddress: address,
    titleNumber: title,
    deceasedOwnerName: deceased,
    coordinatorRole: "executor",
    coordinatorParticipantId: null,
    createdAt: daysAgo(5),
    updatedAt: daysAgo(1),
    status: "open",
  };
}

function person(caseId: string, p: Partial<Participant> & Pick<Participant, "firstName" | "lastName" | "email" | "roles">): Participant {
  return {
    id: newId(),
    caseId,
    isCoordinator: false,
    identityCheckRequired: "yes",
    verificationRoute: "one_login",
    verificationStatus: "not_started",
    verificationOutcome: "none",
    verifiedAt: null,
    evidenceDocumentType: null,
    assuranceOutcome: "not_assessed",
    additionalChecksRequired: false,
    createdAt: daysAgo(5),
    updatedAt: daysAgo(1),
    ...p,
  };
}

function verified(doc: Participant["evidenceDocumentType"], at: string, further = false): Partial<Participant> {
  return {
    verificationStatus: "verified",
    verificationOutcome: "verified",
    verifiedAt: at,
    evidenceDocumentType: doc,
    assuranceOutcome: further ? "further_assurance_needed" : "meets_prototype_threshold",
    additionalChecksRequired: further,
  };
}

function invite(caseId: string, p: Participant, sentAt: string, status: Invitation["status"] = "sent", openedAt: string | null = null, completedAt: string | null = null): Invitation {
  return { id: newId(), caseId, participantId: p.id, token: newInvitationToken(), status, selfService: false, sentAt, openedAt, completedAt };
}

const ADDRESSES = {
  oak: { line1: "14 Oakfield Road", line2: "", town: "Harrogate", postcode: "HG1 4PL" },
  mill: { line1: "3 Mill Lane Cottages", line2: "Little Bramford", town: "Ipswich", postcode: "IP8 2QT" },
};

export function buildScenario(id: string, base: PrototypeState): PrototypeState {
  const keep = { events: base.events, journeyMode: base.journeyMode, flash: null };
  if (id === "blank") return { scenarioId: "blank", case: null, participants: [], invitations: [], identityChecks: [], ...keep };

  const c = makeCase(id === "E" ? ADDRESSES.mill : ADDRESSES.oak, id === "E" ? "Edward Hughes" : "Margaret Thompson", id === "E" ? "SK482913" : "NYK305718");
  const coordName = id === "E" ? { firstName: "Helen", lastName: "Hughes", email: "helen.hughes@example.com" } : { firstName: "Sarah", lastName: "Thompson", email: "sarah.thompson@example.com" };

  let participants: Participant[] = [];
  let invitations: Invitation[] = [];

  if (id === "A") {
    participants = [person(c.id, { ...coordName, roles: ["executor", "beneficiary"], isCoordinator: true })];
  }
  if (id === "B") {
    const sarah = person(c.id, { ...coordName, roles: ["executor"], isCoordinator: true, ...verified("passport", daysAgo(3)) });
    const james = person(c.id, { firstName: "James", lastName: "Mitchell", email: "james.mitchell@example.com", roles: ["executor"], verificationStatus: "invitation_sent" });
    const priya = person(c.id, { firstName: "Priya", lastName: "Shah", email: "priya.shah@example.com", roles: ["beneficiary"] });
    participants = [sarah, james, priya];
    invitations = [invite(c.id, james, daysAgo(2))];
  }
  if (id === "C") {
    const sarah = person(c.id, { ...coordName, roles: ["executor"], isCoordinator: true, ...verified("driving_licence", daysAgo(2)) });
    const robert = person(c.id, { firstName: "Robert", lastName: "Evans", email: "robert.evans@example.com", roles: ["executor"], verificationRoute: "existing", verificationStatus: "another_route" });
    const aisha = person(c.id, { firstName: "Aisha", lastName: "Khan", email: "aisha.khan@example.com", roles: ["beneficiary"], verificationStatus: "needs_attention", verificationOutcome: "additional_verification_needed", additionalChecksRequired: true, assuranceOutcome: "further_assurance_needed" });
    participants = [sarah, robert, aisha];
    invitations = [invite(c.id, aisha, daysAgo(3), "opened", daysAgo(2))];
  }
  if (id === "D") {
    const sarah = person(c.id, { ...coordName, roles: ["executor"], isCoordinator: true, ...verified("passport", daysAgo(4)) });
    const daniel = person(c.id, { firstName: "Daniel", lastName: "Price", email: "daniel.price@example.com", roles: ["beneficiary"], verificationStatus: "in_progress", verificationOutcome: "incomplete" });
    participants = [sarah, daniel];
    invitations = [invite(c.id, daniel, daysAgo(2), "opened", daysAgo(1))];
  }
  if (id === "E") {
    const helen = person(c.id, { ...coordName, roles: ["executor", "beneficiary"], isCoordinator: true });
    const tom = person(c.id, { firstName: "Tom", lastName: "Hughes", email: "tom.hughes@example.com", roles: ["executor"], verificationStatus: "invitation_sent" });
    participants = [helen, tom];
    invitations = [invite(c.id, tom, daysAgo(1))];
  }
  if (id === "F") {
    const sarah = person(c.id, { ...coordName, roles: ["executor"], isCoordinator: true, ...verified("passport", daysAgo(4)) });
    const james = person(c.id, { firstName: "James", lastName: "Mitchell", email: "james.mitchell@example.com", roles: ["executor"], ...verified("driving_licence", daysAgo(2)) });
    const priya = person(c.id, { firstName: "Priya", lastName: "Shah", email: "priya.shah@example.com", roles: ["beneficiary"], ...verified("other", daysAgo(1), true) });
    participants = [sarah, james, priya];
    invitations = [invite(c.id, james, daysAgo(3), "completed", daysAgo(3), daysAgo(2)), invite(c.id, priya, daysAgo(3), "completed", daysAgo(2), daysAgo(1))];
  }

  const coordinator = participants.find((p) => p.isCoordinator);
  return {
    ...keep,
    scenarioId: id,
    case: { ...c, coordinatorParticipantId: coordinator?.id ?? null },
    participants,
    invitations,
    identityChecks: [],
  };
}
