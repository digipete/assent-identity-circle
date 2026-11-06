import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Main, NotificationBanner, Radios } from "@/components/govuk";
import { clearEvents, loadScenario, setJourneyMode } from "@/domain/actions";
import { fullName, STATUS_DISPLAY } from "@/domain/logic";
import { usePrototype } from "@/domain/store";
import { eventsToCsv, eventsToJson } from "@/research/events";
import { SCENARIOS } from "@/research/scenarios";
import { pageHead } from "@/lib/meta";
import { useState } from "react";

export const Route = createFileRoute("/research")({
  head: () => pageHead("Prototype research tools", "Load scenarios, switch journey order and export research events."),
  component: Research,
});

function download(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

function Research() {
  const s = usePrototype();
  const navigate = useNavigate();
  const [message, setMessage] = useState<string | null>(null);
  const links = s.invitations.filter((i) => i.status !== "cancelled");

  return (
    <Main wide>
      <h1 className="govuk-heading-l">Prototype research tools</h1>
      <p className="govuk-body">For researchers only. Participants should not see this page.</p>
      {message && (
        <NotificationBanner success>
          <p className="govuk-notification-banner__heading">{message}</p>
        </NotificationBanner>
      )}

      <h2 className="govuk-heading-m">Current state</h2>
      <p className="govuk-body">
        Scenario: <strong>{SCENARIOS.find((x) => x.id === s.scenarioId)?.name ?? "Researcher-created record"}</strong>. Journey{" "}
        {s.journeyMode}. {s.participants.length} people. {s.events.length} events recorded.
      </p>

      <h2 className="govuk-heading-m">Load or reset a scenario</h2>
      <p className="govuk-body">Loading a scenario replaces the current record. Recorded events are kept.</p>
      <table className="govuk-table">
        <tbody className="govuk-table__body">
          {SCENARIOS.map((sc) => (
            <tr className="govuk-table__row" key={sc.id}>
              <th scope="row" className="govuk-table__header">{sc.name}</th>
              <td className="govuk-table__cell">{sc.description}</td>
              <td className="govuk-table__cell">
                <button
                  type="button"
                  className="govuk-button govuk-button--secondary govuk-!-margin-bottom-0"
                  onClick={() => {
                    loadScenario(sc.id);
                    navigate({ to: sc.id === "blank" ? "/" : "/people" });
                  }}
                >
                  Load<span className="govuk-visually-hidden"> {sc.name}</span>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <Radios
            name="journey"
            legend="When should the coordinating person prove their identity?"
            value={s.journeyMode}
            onChange={(v) => {
              setJourneyMode(v as "A" | "B");
              setMessage(`Journey ${v} selected`);
            }}
            options={[
              { value: "A", label: "Journey A – Add people first", hint: "Default. The coordinator adds people, then proves their own identity." },
              { value: "B", label: "Journey B – Verify first", hint: "The coordinator must prove their identity before adding other people." },
            ]}
          />
        </div>
      </div>

      <h2 className="govuk-heading-m">Invitation links</h2>
      {links.length === 0 ? (
        <p className="govuk-body">No invitations yet.</p>
      ) : (
        <table className="govuk-table">
          <thead className="govuk-table__head">
            <tr className="govuk-table__row">
              <th scope="col" className="govuk-table__header">Person</th>
              <th scope="col" className="govuk-table__header">Status</th>
              <th scope="col" className="govuk-table__header">Link</th>
            </tr>
          </thead>
          <tbody className="govuk-table__body">
            {links.map((i) => {
              const p = s.participants.find((x) => x.id === i.participantId);
              return (
                <tr className="govuk-table__row" key={i.id}>
                  <td className="govuk-table__cell">{p ? fullName(p) : "Removed"}{i.selfService ? " (self)" : ""}</td>
                  <td className="govuk-table__cell">{p ? STATUS_DISPLAY[p.verificationStatus].label : ""}</td>
                  <td className="govuk-table__cell">
                    <Link to="/invite/$token" params={{ token: i.token }} className="govuk-link">
                      Open as {p?.firstName ?? "participant"}
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      <h2 className="govuk-heading-m">Research events</h2>
      <div className="govuk-button-group">
        <button type="button" className="govuk-button govuk-button--secondary" onClick={() => download("assent-research-events.json", eventsToJson(s.events), "application/json")}>
          Export as JSON
        </button>
        <button type="button" className="govuk-button govuk-button--secondary" onClick={() => download("assent-research-events.csv", eventsToCsv(s.events), "text/csv")}>
          Export as CSV
        </button>
        <button
          type="button"
          className="govuk-button govuk-button--warning"
          onClick={() => {
            clearEvents();
            setMessage("Event log cleared");
          }}
        >
          Clear event log
        </button>
      </div>
      {s.events.length === 0 ? (
        <p className="govuk-body">No events recorded.</p>
      ) : (
        <table className="govuk-table">
          <thead className="govuk-table__head">
            <tr className="govuk-table__row">
              <th scope="col" className="govuk-table__header">Time</th>
              <th scope="col" className="govuk-table__header">Event</th>
              <th scope="col" className="govuk-table__header">Details</th>
            </tr>
          </thead>
          <tbody className="govuk-table__body">
            {[...s.events].reverse().slice(0, 100).map((e) => (
              <tr className="govuk-table__row" key={e.id}>
                <td className="govuk-table__cell govuk-body-s">{new Date(e.timestamp).toLocaleString("en-GB")}</td>
                <td className="govuk-table__cell">{e.eventType.replace(/_/g, " ")}</td>
                <td className="govuk-table__cell app-code">
                  {Object.entries(e.metadata)
                    .filter(([k]) => !["selectedRoles", "lastStage"].includes(k))
                    .map(([k, v]) => `${k}=${Array.isArray(v) ? v.join("|") : v}`)
                    .join(" ")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {s.events.length > 100 && <p className="govuk-body-s">Showing the latest 100 events. Export to see all.</p>}
    </Main>
  );
}
