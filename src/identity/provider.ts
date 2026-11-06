import type { DocumentType, VerificationOutcome } from "@/domain/types";

/**
 * Abstraction over an identity provider. One Login authenticates ONE person and
 * returns that person's identity result to the requesting service. A real
 * implementation would replace MockOneLoginProvider without touching the UI.
 */
export interface VerificationRequest {
  participantId: string;
  requestedConfidenceLevel: string;
}

export interface VerificationResult {
  authenticated: boolean;
  identityVerified: boolean;
  outcome: VerificationOutcome;
  providerSubjectReference: string | null;
  returnedConfidenceLevel: string | null;
  evidenceCategory: DocumentType | null;
  requiresManualReview: boolean;
}

export interface IdentityVerificationProvider {
  readonly name: string;
  verify(request: VerificationRequest, simulation: MockSimulation): Promise<VerificationResult>;
}

export type MockScenarioOutcome = "success" | "incomplete" | "unsuccessful" | "declined" | "additional_needed";

export interface MockSimulation {
  outcome: MockScenarioOutcome;
  documentType: DocumentType;
  flagForAssuranceReview: boolean;
}

function mockSubject() {
  return `mock-sub-${crypto.randomUUID().slice(0, 8)}`;
}

export class MockOneLoginProvider implements IdentityVerificationProvider {
  readonly name = "GOV.UK One Login (simulated)";

  async verify(_req: VerificationRequest, sim: MockSimulation): Promise<VerificationResult> {
    switch (sim.outcome) {
      case "success":
        return {
          authenticated: true,
          identityVerified: true,
          outcome: "verified",
          providerSubjectReference: mockSubject(),
          returnedConfidenceLevel: "P2",
          evidenceCategory: sim.documentType === "not_provided" ? null : sim.documentType,
          requiresManualReview: sim.flagForAssuranceReview,
        };
      case "incomplete":
        // Signed in, but the identity part was not finished.
        return {
          authenticated: true,
          identityVerified: false,
          outcome: "incomplete",
          providerSubjectReference: mockSubject(),
          returnedConfidenceLevel: null,
          evidenceCategory: null,
          requiresManualReview: false,
        };
      case "unsuccessful":
        return {
          authenticated: true,
          identityVerified: false,
          outcome: "unsuccessful",
          providerSubjectReference: mockSubject(),
          returnedConfidenceLevel: "P0",
          evidenceCategory: null,
          requiresManualReview: false,
        };
      case "declined":
        return {
          authenticated: false,
          identityVerified: false,
          outcome: "declined",
          providerSubjectReference: null,
          returnedConfidenceLevel: null,
          evidenceCategory: null,
          requiresManualReview: false,
        };
      case "additional_needed":
        return {
          authenticated: true,
          identityVerified: false,
          outcome: "additional_verification_needed",
          providerSubjectReference: mockSubject(),
          returnedConfidenceLevel: "P1",
          evidenceCategory: null,
          requiresManualReview: true,
        };
    }
  }
}

export const identityProvider: IdentityVerificationProvider = new MockOneLoginProvider();
