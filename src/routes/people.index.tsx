import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useCallback } from "react";
import { BackLink, Main, NotificationBanner, StatusTag, SummaryList, useFlash, WarningText } from "@/components/govuk";
import { setFlash } from "@/domain/actions";
import { computeProgress, DOCUMENT_LABELS, formatDate, fullName, isRequired, progressSentence, rolesText, ROUTE_LABELS } from "@/domain/logic";
import { usePrototype } from "@/domain/store";
import type { Participant } from "@/domain/types";
import { pageHead } from "@/lib/meta";

export const Route = createFileRoute("/people/")({
  head: () => pageHead("People involved in this property transfer", "See who is involved in the property transfer and the progress of their identity checks."),
  component: PeoplePage,
});

function evidence(p: Participant) {
  return p.verificationStatus === "verified" && p.evidenceDocumentType ? DOCUMENT_LABELS[p.evidenceDocumentType] : "Not provided";
}

function routeText(p: Participant) {
  return isRequired(p) ? ROUTE_LABELS[p.verificationRoute] : "No check needed";
}

function nameCell(p: Participant) {
  return (
    <>
      {fullName(p)}
      {p.isCoordinator && <span className="govuk-body-s govuk-!-display-block govuk-!-margin-0">(you)</span>}
    </>
  );
}

function canInvite(p: Participant) {
  return isRequired(p) && !p.isCoordinator && p.verificationRoute !== "existing" && p.verificationStatus !== "verified";
}

function PeoplePage() {
  const s = usePrototype();
  const clear = useCallback(() => setFlash(null), []);
  const flash = useFlash(s.flash, clear);
  if (!s.case) return <Navigate to="/transfer" />;
  const c = s.case;
  const progress = computeProgress(s.participants);
  const coordinator = s.participants.find((p) => p.id === c.coordinatorParticipantId);
  const coordinatorDone = coordinator && (coordinator.verificationStatus === "verified" || coordinator.verificationStatus === "another_route");
  const gated = s.journeyMode === "B" && !coordinatorDone;

  return (
    <Main wide back={<BackLink to="/transfer">Change property details</BackLink>}>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          {flash && (
            <NotificationBanner success>
              <p className="govuk-notification-banner__heading">{flash}</p>
            </NotificationBanner>
          )}
          {progress.allRequestedComplete && (
            <NotificationBanner title="Important">
              <h3 className="govuk-notification-banner__heading">All requested identity checks are complete</h3>
              <p className="govuk-body">
                HM Land Registry will still consider these results against its identity evidence requirements when it
                receives the Assent application. This does not mean the application has been approved.
              </p>
              {progress.furtherAssurance > 0 && (
                <p className="govuk-body">
                  {progress.furtherAssurance === 1 ? "1 person" : `${progress.furtherAssurance} people`} may need to
                  provide further evidence.
                </p>
              )}
              <p className="govuk-body">
                <Link to="/summary" className="govuk-notification-banner__link">
                  View identity-check summary
                </Link>
              </p>
            </NotificationBanner>
          )}
          <span className="govuk-caption-l">
            {c.propertyAddress.line1}, {c.propertyAddress.postcode} · Reference {c.reference}
          </span>
          <h1 className="govuk-heading-l">People involved in this property transfer</h1>
          <p className="govuk-body">
            Add the people involved in the transfer. You can then invite anyone who needs to prove their identity.
          </p>
          <p className="govuk-body">Each person will complete their own identity check.</p>
        </div>
      </div>

      {gated && (
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <WarningText>You need to prove your own identity before you can add other people.</WarningText>
            {coordinator ? (
              <Link to="/people/$id" params={{ id: coordinator.id }} className="govuk-button">
                Prove your identity
              </Link>
            ) : (
              <Link to="/your-details" className="govuk-button">
                Prove your identity
              </Link>
            )}
          </div>
        </div>
      )}

      {s.participants.length === 0 && !gated && (
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <p className="govuk-body">You have not added anyone yet.</p>
            <p className="govuk-body">Start with yourself if you need to prove your identity, then add:</p>
            <ul className="govuk-list govuk-list--bullet">
              <li>the other executors or administrators</li>
              <li>the beneficiaries receiving the property</li>
              <li>any attorneys acting for someone involved</li>
            </ul>
            <Link to="/people/add" className="govuk-button">
              Add a person
            </Link>
          </div>
        </div>
      )}

      {s.participants.length > 0 && (
        <>
          <p className="govuk-body govuk-!-font-weight-bold" aria-live="polite">
            {progressSentence(progress)}
            {progress.anotherRoute > 0 &&
              ` ${progress.anotherRoute} ${progress.anotherRoute === 1 ? "person is" : "people are"} proving their identity another way.`}
          </p>
          {!coordinator && s.journeyMode === "A" && (
            <div className="govuk-inset-text">
              You have not added yourself. If you need to prove your identity, add yourself and select ‘This is me’.
            </div>
          )}

          <div className="app-desktop-only">
            <table className="govuk-table">
              <caption className="govuk-table__caption govuk-table__caption--m">People and identity checks</caption>
              <thead className="govuk-table__head">
                <tr className="govuk-table__row">
                  <th scope="col" className="govuk-table__header">Name</th>
                  <th scope="col" className="govuk-table__header">Role</th>
                  <th scope="col" className="govuk-table__header">How they will prove their identity</th>
                  <th scope="col" className="govuk-table__header">Identity checked</th>
                  <th scope="col" className="govuk-table__header">Evidence</th>
                  <th scope="col" className="govuk-table__header">Status</th>
                  <th scope="col" className="govuk-table__header"><span className="govuk-visually-hidden">Actions</span></th>
                </tr>
              </thead>
              <tbody className="govuk-table__body">
                {s.participants.map((p) => (
                  <tr className="govuk-table__row" key={p.id}>
                    <th scope="row" className="govuk-table__header">{nameCell(p)}</th>
                    <td className="govuk-table__cell">{rolesText(p.roles)}</td>
                    <td className="govuk-table__cell">{routeText(p)}</td>
                    <td className="govuk-table__cell">{p.verifiedAt ? formatDate(p.verifiedAt) : "Not yet"}</td>
                    <td className="govuk-table__cell">{evidence(p)}</td>
                    <td className="govuk-table__cell">
                      {isRequired(p) ? <StatusTag status={p.verificationStatus} /> : <strong className="govuk-tag govuk-tag--grey">No check needed</strong>}
                      {p.additionalChecksRequired && <span className="govuk-body-s govuk-!-display-block govuk-!-margin-top-1 govuk-!-margin-bottom-0">Further checks may be needed</span>}
                    </td>
                    <td className="govuk-table__cell">
                      <Actions p={p} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="app-mobile-only">
            {s.participants.map((p) => (
              <div className="govuk-summary-card" key={p.id}>
                <div className="govuk-summary-card__title-wrapper">
                  <h2 className="govuk-summary-card__title">{fullName(p)}{p.isCoordinator ? " (you)" : ""}</h2>
                  <ul className="govuk-summary-card__actions">
                    <li className="govuk-summary-card__action">
                      <Link to="/people/$id" params={{ id: p.id }} className="govuk-link">
                        View<span className="govuk-visually-hidden"> {fullName(p)}</span>
                      </Link>
                    </li>
                  </ul>
                </div>
                <div className="govuk-summary-card__content">
                  <SummaryList
                    rows={[
                      { key: "Role", value: rolesText(p.roles) },
                      { key: "How they will prove their identity", value: routeText(p) },
                      { key: "Identity checked", value: p.verifiedAt ? formatDate(p.verifiedAt) : "Not yet" },
                      { key: "Evidence", value: evidence(p) },
                      { key: "Status", value: isRequired(p) ? <StatusTag status={p.verificationStatus} /> : "No check needed" },
                    ]}
                  />
                  <Actions p={p} />
                </div>
              </div>
            ))}
          </div>

          {!gated && (
            <div className="govuk-button-group">
              <Link to="/people/add" className="govuk-button govuk-button--secondary">
                Add another person
              </Link>
              <Link to="/summary" className="govuk-link">
                Review identity checks
              </Link>
            </div>
          )}
        </>
      )}
    </Main>
  );
}

function Actions({ p }: { p: Participant }) {
  const invited = p.verificationStatus === "invitation_sent" || p.verificationStatus === "in_progress" || p.verificationStatus === "needs_attention" || p.verificationStatus === "unable_to_verify";
  return (
    <ul className="govuk-list govuk-!-margin-bottom-0">
      <li>
        <Link to="/people/$id" params={{ id: p.id }} className="govuk-link">
          View<span className="govuk-visually-hidden"> {fullName(p)}</span>
        </Link>
      </li>
      <li>
        <Link to="/people/$id/edit" params={{ id: p.id }} className="govuk-link">
          Change details<span className="govuk-visually-hidden"> for {fullName(p)}</span>
        </Link>
      </li>
      {canInvite(p) && (
        <li>
          <Link to="/people/$id/invite" params={{ id: p.id }} className="govuk-link">
            {invited ? "Resend invitation" : "Send invitation"}
            <span className="govuk-visually-hidden"> to {fullName(p)}</span>
          </Link>
        </li>
      )}
    </ul>
  );
}
