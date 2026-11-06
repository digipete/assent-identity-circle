import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { BackLink, Main, StatusTag } from "@/components/govuk";
import { track } from "@/domain/actions";
import { computeProgress, formatDate, fullName, isRequired, progressSentence, rolesText, ROUTE_LABELS } from "@/domain/logic";
import { usePrototype } from "@/domain/store";
import { pageHead } from "@/lib/meta";

export const Route = createFileRoute("/summary")({
  head: () => pageHead("Identity-check summary", "Printable summary of identity checks for this property transfer."),
  component: Summary,
});

function Summary() {
  const s = usePrototype();
  useEffect(() => {
    track("summary_viewed");
  }, []);
  if (!s.case) return <Navigate to="/transfer" />;
  const c = s.case;
  const progress = computeProgress(s.participants);
  const a = c.propertyAddress;

  return (
    <Main wide back={<BackLink to="/people">Back to people involved</BackLink>}>
      <h1 className="govuk-heading-l">Identity-check summary</h1>
      <div className="govuk-inset-text">
        This is a prototype identity-check summary. It is not proof of ownership, a completed Assent application or an
        official HM Land Registry identity certificate.
      </div>
      <dl className="govuk-summary-list">
        <div className="govuk-summary-list__row govuk-summary-list__row--no-actions">
          <dt className="govuk-summary-list__key">Identity-check reference</dt>
          <dd className="govuk-summary-list__value">{c.reference}</dd>
        </div>
        <div className="govuk-summary-list__row govuk-summary-list__row--no-actions">
          <dt className="govuk-summary-list__key">Property</dt>
          <dd className="govuk-summary-list__value">
            {[a.line1, a.line2, a.town, a.postcode].filter(Boolean).join(", ")}
            {c.titleNumber && <><br />Title number {c.titleNumber}</>}
          </dd>
        </div>
        <div className="govuk-summary-list__row govuk-summary-list__row--no-actions">
          <dt className="govuk-summary-list__key">Progress</dt>
          <dd className="govuk-summary-list__value">{progressSentence(progress)}</dd>
        </div>
      </dl>

      <table className="govuk-table">
        <caption className="govuk-table__caption govuk-table__caption--m">People involved</caption>
        <thead className="govuk-table__head">
          <tr className="govuk-table__row">
            <th scope="col" className="govuk-table__header">Name</th>
            <th scope="col" className="govuk-table__header">Role</th>
            <th scope="col" className="govuk-table__header">Route</th>
            <th scope="col" className="govuk-table__header">Status</th>
            <th scope="col" className="govuk-table__header">Date completed</th>
            <th scope="col" className="govuk-table__header">Further checks needed</th>
          </tr>
        </thead>
        <tbody className="govuk-table__body">
          {s.participants.map((p) => (
            <tr className="govuk-table__row" key={p.id}>
              <th scope="row" className="govuk-table__header">{fullName(p)}</th>
              <td className="govuk-table__cell">{rolesText(p.roles)}</td>
              <td className="govuk-table__cell">{isRequired(p) ? ROUTE_LABELS[p.verificationRoute] : "No check needed"}</td>
              <td className="govuk-table__cell">{isRequired(p) ? <StatusTag status={p.verificationStatus} /> : "No check needed"}</td>
              <td className="govuk-table__cell">{p.verifiedAt ? formatDate(p.verifiedAt) : "Not completed"}</td>
              <td className="govuk-table__cell">
                {p.additionalChecksRequired ? "Yes" : p.verificationRoute === "existing" && isRequired(p) ? "Evidence to be sent with the application" : "None indicated"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="govuk-heading-m">What happens next</h2>
      <ol className="govuk-list govuk-list--number">
        <li>Make sure everyone who needs to prove their identity has done so, or is using another way.</li>
        <li>Complete form AS1, and form AP1 where needed, as usual.</li>
        <li>Send the application to HM Land Registry with the identity-check reference {c.reference} and any other identity evidence.</li>
        <li>HM Land Registry will decide whether the identity evidence meets its requirements. It may ask for more.</li>
      </ol>

      <div className="govuk-button-group app-no-print">
        <button type="button" className="govuk-button" onClick={() => window.print()}>
          Print this summary
        </button>
        <Link to="/people" className="govuk-link" onClick={() => track("returned_to_coordinator_view")}>
          Return to people involved
        </Link>
      </div>
    </Main>
  );
}
