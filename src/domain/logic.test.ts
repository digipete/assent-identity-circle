import { describe, expect, it } from "vitest";
import { computeProgress, findDuplicate, progressSentence } from "./logic";
import type { Participant } from "./types";

const base = (o: Partial<Participant>): Participant => ({
  id: Math.random().toString(), caseId: "c", firstName: "A", lastName: "B", email: "a@example.com", roles: ["executor"],
  isCoordinator: false, identityCheckRequired: "yes", verificationRoute: "one_login", verificationStatus: "not_started",
  verificationOutcome: "none", verifiedAt: null, evidenceDocumentType: null, assuranceOutcome: "not_assessed",
  additionalChecksRequired: false, createdAt: "", updatedAt: "", ...o,
});

describe("progress", () => {
  it("counts verified out of required, treating 'not sure' as required and 'no' as excluded", () => {
    const p = computeProgress([
      base({ verificationStatus: "verified" }),
      base({ identityCheckRequired: "not_sure" }),
      base({ identityCheckRequired: "no" }),
    ]);
    expect(p.required).toBe(2);
    expect(progressSentence(p)).toBe("1 of 2 required identity checks are complete.");
    expect(p.allRequestedComplete).toBe(false);
  });
  it("all requested complete still reports further assurance separately", () => {
    const p = computeProgress([base({ verificationStatus: "verified" }), base({ verificationStatus: "verified", additionalChecksRequired: true })]);
    expect(p.allRequestedComplete).toBe(true);
    expect(p.furtherAssurance).toBe(1);
  });
  it("needs attention is not complete", () => {
    expect(computeProgress([base({ verificationStatus: "needs_attention" })]).allRequestedComplete).toBe(false);
  });
});

describe("duplicates", () => {
  it("matches same email ignoring case", () => {
    expect(findDuplicate([base({ email: "x@example.com" })], { firstName: "Z", lastName: "Y", email: "X@Example.com" })).toBeTruthy();
  });
});
