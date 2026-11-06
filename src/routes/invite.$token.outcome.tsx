import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { BackLink, Main, SummaryList } from "@/components/govuk";
import { chooseAlternativeRoute, track } from "@/domain/actions";
import { formatDate } from "@/domain/logic";
import { usePrototype } from "@/domain/store";
import { pageHead } from "@/lib/meta";
import { InvalidInvitation } from "./invite.$token.index";

export const Route = createFileRoute("/invite/$token/outcome")({
  validateSearch: (search: Record<string, unknown>) => ({ alt: typeof search.alt === "string" ? search.alt : undefined }),
  head: () => pageHead("Your identity check", "The result of your identity check."),
  component: Outcome,
});

function Outcome() {
  const { token } = Route.useParams();
  const { alt } = Route.useSearch();
  const s = usePrototype();
  const navigate = useNavigate();
  const inv = s.invitations.find((i) => i.token === token && i.status !== "cancelled");
  const p = inv && s.participants.find((x) => x.id === inv.participantId);
  if (!inv || !p) return <InvalidInvitation />;
  const self = inv.selfService;

  const returnLink = self ? (
    <p className="govuk-body">
      <Link to="/people" className="govuk-link" onClick={() => track("returned_to_coordinator_view", p.id)}>
        Return to people involved
      </Link>
    </p>
  ) : null;

  if (p.verificationStatus === "another_route")
    return (
      <Main>
        <h1 className="govuk-heading-l">You've chosen to prove your identity another way</h1>
        <p className="govuk-body">That's fine. Many people prove their identity this way.</p>
        <p className="govuk-body">
          Your identity can be confirmed by a conveyancer, solicitor or other qualified professional. Their evidence is
          sent with the paper Assent application.
        </p>
        <p className="govuk-body">
          {self ? "This will be shown on your list of people involved." : "The person who invited you will see that you're using another way."}
        </p>
        {returnLink}
      </Main>
    );

  const offerAlternative = (
    <button
      type="button"
      className="govuk-button govuk-button--secondary"
      onClick={() => {
        chooseAlternativeRoute(p.id, "participant");
        navigate({ to: "/invite/$token/outcome", params: { token }, search: { alt: undefined } });
      }}
    >
      Prove my identity another way
    </button>
  );
  const tryAgain = (
    <Link to="/invite/$token/one-login" params={{ token }} className="govuk-button">
      Try GOV.UK One Login again
    </Link>
  );

  if (alt === "1")
    return (
      <Main back={<BackLink to="/invite/$token" params={{ token }} />}>
        <h1 className="govuk-heading-l">Prove your identity another way</h1>
        <p className="govuk-body">
          You can have your identity confirmed by a conveyancer, solicitor or other qualified professional instead of using
          GOV.UK One Login.
        </p>
        {offerAlternative}
      </Main>
    );

  if (p.verificationStatus === "verified")
    return (
      <Main>
        <div className="govuk-panel govuk-panel--confirmation">
          <h1 className="govuk-panel__title">Your identity check is complete</h1>
          <div className="govuk-panel__body">
            Reference
            <br />
            <strong>{s.case?.reference}</strong>
          </div>
        </div>
        <p className="govuk-body">You've completed your identity check.</p>
        <SummaryList
          rows={[
            { key: "Date", value: formatDate(p.verifiedAt) },
            { key: "How you proved your identity", value: "GOV.UK One Login" },
          ]}
        />
        <p className="govuk-body">
          The result has been added to the identity-check record for this property transfer.{" "}
          {self ? "" : "The person managing this property transfer can now see that your identity check is complete."}
        </p>
        <p className="govuk-body">You do not need to prove anyone else's identity.</p>
        <div className="govuk-inset-text">
          HM Land Registry will decide whether this meets its identity evidence requirements when it receives the Assent
          application.{p.additionalChecksRequired ? " You may be asked for further evidence." : ""}
        </div>
        {returnLink}
      </Main>
    );

  const messages: Record<string, { title: string; body: string }> = {
    incomplete: { title: "You have not finished proving your identity", body: "You started your identity check but did not finish it. You can try again at any time." },
    unsuccessful: { title: "We could not confirm your identity", body: "GOV.UK One Login could not confirm your identity. You can try again or prove your identity another way." },
    declined: { title: "You chose not to continue", body: "You have not proved your identity. You can come back to this invitation, or prove your identity another way." },
    additional_verification_needed: { title: "We need more information to confirm your identity", body: "GOV.UK One Login needs more information before it can confirm your identity. You can try again or prove your identity another way." },
  };
  const m = messages[p.verificationOutcome] ?? messages.incomplete;

  return (
    <Main>
      <h1 className="govuk-heading-l">{m.title}</h1>
      <p className="govuk-body">{m.body}</p>
      <p className="govuk-body">Choosing another way is a normal option and does not mean you have done anything wrong.</p>
      <div className="govuk-button-group">
        {tryAgain}
        {offerAlternative}
      </div>
      {returnLink}
    </Main>
  );
}
