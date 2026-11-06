import { Main } from "@/components/govuk";

export function InvalidInvitation() {
  return (
    <Main>
      <h1 className="govuk-heading-l">This invitation link is not valid</h1>
      <p className="govuk-body">The link may have expired, been replaced by a newer invitation, or been typed incorrectly.</p>
      <p className="govuk-body">Ask the person who invited you to send a new invitation.</p>
    </Main>
  );
}
