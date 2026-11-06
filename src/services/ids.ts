const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function chunk(n: number) {
  const bytes = crypto.getRandomValues(new Uint8Array(n));
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
}

export function newId() {
  return crypto.randomUUID();
}

export function newCaseReference() {
  return `ASN-${chunk(4)}-${chunk(4)}`;
}

/** Simulated invitation token. Not a security credential. */
export function newInvitationToken() {
  return `inv-${chunk(6).toLowerCase()}${chunk(6).toLowerCase()}`;
}
