import { createFileRoute, Link } from "@tanstack/react-router";
import { BackLink, Main } from "@/components/govuk";
import { pageHead } from "@/lib/meta";

export const Route = createFileRoute("/other-ways")({
  head: () => pageHead("Other ways to prove your identity", "Ways to prove your identity for an Assent application without GOV.UK One Login."),
  component: OtherWays,
});

function OtherWays() {
  return (
    <Main back={<BackLink to="/" />}>
      <h1 className="govuk-heading-l">Other ways to prove your identity</h1>
      <p className="govuk-body">
        You do not have to use GOV.UK One Login. Using another way is a normal choice and will not delay the
        application because you chose it.
      </p>
      <p className="govuk-body">You can usually have your identity confirmed by:</p>
      <ul className="govuk-list govuk-list--bullet">
        <li>a conveyancer or solicitor acting on the transfer</li>
        <li>a qualified professional who completes the relevant identity form</li>
      </ul>
      <p className="govuk-body">
        The person preparing the Assent application should send this evidence with the paper application in the usual
        way.
      </p>
      <div className="govuk-inset-text">
        In this prototype, a person using another way is shown as ‘Using another route’. The service does not check
        that evidence.
      </div>
      <p className="govuk-body">
        <Link to="/" className="govuk-link">
          Return to the start page
        </Link>
      </p>
    </Main>
  );
}
