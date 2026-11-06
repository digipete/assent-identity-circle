import { Link, type LinkProps } from "@tanstack/react-router";
import { useEffect, useRef, type ReactNode } from "react";
import { STATUS_DISPLAY } from "@/domain/logic";
import type { VerificationStatus } from "@/domain/types";

export interface FieldError {
  field: string;
  message: string;
}

export function errorFor(errors: FieldError[], field: string) {
  return errors.find((e) => e.field === field)?.message;
}

export function ErrorSummary({ errors }: { errors: FieldError[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (errors.length) ref.current?.focus();
  }, [errors]);
  if (!errors.length) return null;
  return (
    <div className="govuk-error-summary" data-module="govuk-error-summary" ref={ref} tabIndex={-1} role="alert">
      <div role="alert">
        <h2 className="govuk-error-summary__title">There is a problem</h2>
        <div className="govuk-error-summary__body">
          <ul className="govuk-list govuk-error-summary__list">
            {errors.map((e) => (
              <li key={e.field + e.message}>
                <a
                  href={`#${e.field}`}
                  onClick={(ev) => {
                    ev.preventDefault();
                    const el = document.getElementById(e.field);
                    el?.focus();
                    el?.scrollIntoView({ block: "center" });
                  }}
                >
                  {e.message}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function ErrorMessage({ id, message }: { id: string; message?: string | undefined }) {
  if (!message) return null;
  return (
    <p id={`${id}-error`} className="govuk-error-message">
      <span className="govuk-visually-hidden">Error:</span> {message}
    </p>
  );
}

export function TextInput(props: {
  id: string;
  label: string;
  hint?: string | undefined;
  value: string;
  onChange: (v: string) => void;
  error?: string | undefined;
  widthClass?: string | undefined;
  type?: string | undefined;
  autoComplete?: string | undefined;
  spellCheck?: boolean | undefined;
}) {
  const { id, label, hint, value, onChange, error, widthClass, type = "text", autoComplete, spellCheck } = props;
  const describedBy = [hint ? `${id}-hint` : "", error ? `${id}-error` : ""].filter(Boolean).join(" ") || undefined;
  return (
    <div className={`govuk-form-group${error ? " govuk-form-group--error" : ""}`}>
      <label className="govuk-label" htmlFor={id}>
        {label}
      </label>
      {hint && (
        <div id={`${id}-hint`} className="govuk-hint">
          {hint}
        </div>
      )}
      <ErrorMessage id={id} message={error} />
      <input
        className={`govuk-input${widthClass ? ` ${widthClass}` : ""}${error ? " govuk-input--error" : ""}`}
        id={id}
        name={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        spellCheck={spellCheck}
        aria-describedby={describedBy}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export interface Option {
  value: string;
  label: string;
  hint?: string | undefined;
}

export function Radios(props: {
  name: string;
  legend: ReactNode;
  legendClass?: string | undefined;
  isPageHeading?: boolean | undefined;
  hint?: ReactNode | undefined;
  options: Option[];
  value: string;
  onChange: (v: string) => void;
  error?: string | undefined;
  inline?: boolean | undefined;
  children?: ReactNode | undefined;
}) {
  const { name, legend, legendClass = "govuk-fieldset__legend--m", isPageHeading, hint, options, value, onChange, error, inline, children } = props;
  const describedBy = [hint ? `${name}-hint` : "", error ? `${name}-error` : ""].filter(Boolean).join(" ") || undefined;
  return (
    <div className={`govuk-form-group${error ? " govuk-form-group--error" : ""}`}>
      <fieldset className="govuk-fieldset" aria-describedby={describedBy}>
        <legend className={`govuk-fieldset__legend ${legendClass}`}>
          {isPageHeading ? <h1 className="govuk-fieldset__heading">{legend}</h1> : legend}
        </legend>
        {hint && (
          <div id={`${name}-hint`} className="govuk-hint">
            {hint}
          </div>
        )}
        {children}
        <ErrorMessage id={name} message={error} />
        <div className={`govuk-radios${inline ? " govuk-radios--inline" : ""}`}>
          {options.map((o, i) => {
            const id = i === 0 ? name : `${name}-${i + 1}`;
            return (
              <div className="govuk-radios__item" key={o.value}>
                <input
                  className="govuk-radios__input"
                  id={id}
                  name={name}
                  type="radio"
                  value={o.value}
                  checked={value === o.value}
                  onChange={() => onChange(o.value)}
                  aria-describedby={o.hint ? `${id}-item-hint` : undefined}
                />
                <label className="govuk-label govuk-radios__label" htmlFor={id}>
                  {o.label}
                </label>
                {o.hint && (
                  <div id={`${id}-item-hint`} className="govuk-hint govuk-radios__hint">
                    {o.hint}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}

export function Checkboxes(props: {
  name: string;
  legend: ReactNode;
  hint?: ReactNode | undefined;
  options: Option[];
  values: string[];
  onChange: (v: string[]) => void;
  error?: string | undefined;
}) {
  const { name, legend, hint, options, values, onChange, error } = props;
  const describedBy = [hint ? `${name}-hint` : "", error ? `${name}-error` : ""].filter(Boolean).join(" ") || undefined;
  return (
    <div className={`govuk-form-group${error ? " govuk-form-group--error" : ""}`}>
      <fieldset className="govuk-fieldset" aria-describedby={describedBy}>
        <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">{legend}</legend>
        {hint && (
          <div id={`${name}-hint`} className="govuk-hint">
            {hint}
          </div>
        )}
        <ErrorMessage id={name} message={error} />
        <div className="govuk-checkboxes" data-module="govuk-checkboxes">
          {options.map((o, i) => {
            const id = i === 0 ? name : `${name}-${i + 1}`;
            const checked = values.includes(o.value);
            return (
              <div className="govuk-checkboxes__item" key={o.value}>
                <input
                  className="govuk-checkboxes__input"
                  id={id}
                  name={name}
                  type="checkbox"
                  value={o.value}
                  checked={checked}
                  onChange={() => onChange(checked ? values.filter((v) => v !== o.value) : [...values, o.value])}
                />
                <label className="govuk-label govuk-checkboxes__label" htmlFor={id}>
                  {o.label}
                </label>
                {o.hint && <div className="govuk-hint govuk-checkboxes__hint">{o.hint}</div>}
              </div>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}

export function StatusTag({ status }: { status: VerificationStatus }) {
  const s = STATUS_DISPLAY[status];
  return <strong className={`govuk-tag ${s.tagClass}`}>{s.label}</strong>;
}

export interface SummaryRow {
  key: string;
  value: ReactNode;
  action?: ReactNode | undefined;
}

export function SummaryList({ rows, noBorder }: { rows: SummaryRow[]; noBorder?: boolean | undefined }) {
  return (
    <dl className={`govuk-summary-list${noBorder ? " govuk-summary-list--no-border" : ""}`}>
      {rows.map((r) => (
        <div className={`govuk-summary-list__row${r.action ? "" : " govuk-summary-list__row--no-actions"}`} key={r.key}>
          <dt className="govuk-summary-list__key">{r.key}</dt>
          <dd className="govuk-summary-list__value">{r.value}</dd>
          {r.action && <dd className="govuk-summary-list__actions">{r.action}</dd>}
        </div>
      ))}
    </dl>
  );
}

export function NotificationBanner({ success, title, children }: { success?: boolean | undefined; title?: string | undefined; children: ReactNode }) {
  return (
    <div
      className={`govuk-notification-banner${success ? " govuk-notification-banner--success" : ""}`}
      role={success ? "alert" : "region"}
      aria-labelledby="govuk-notification-banner-title"
    >
      <div className="govuk-notification-banner__header">
        <h2 className="govuk-notification-banner__title" id="govuk-notification-banner-title">
          {title ?? (success ? "Success" : "Important")}
        </h2>
      </div>
      <div className="govuk-notification-banner__content">{children}</div>
    </div>
  );
}

export function WarningText({ children }: { children: ReactNode }) {
  return (
    <div className="govuk-warning-text">
      <span className="govuk-warning-text__icon" aria-hidden="true">
        !
      </span>
      <strong className="govuk-warning-text__text">
        <span className="govuk-visually-hidden">Warning</span>
        {children}
      </strong>
    </div>
  );
}

export function Details({ summary, children }: { summary: string; children: ReactNode }) {
  return (
    <details className="govuk-details">
      <summary className="govuk-details__summary">
        <span className="govuk-details__summary-text">{summary}</span>
      </summary>
      <div className="govuk-details__text">{children}</div>
    </details>
  );
}

export function BackLink(props: { to: LinkProps["to"]; params?: Record<string, string> | undefined; children?: ReactNode | undefined }) {
  return (
    <Link to={props.to} params={props.params as never} className="govuk-back-link">
      {props.children ?? "Back"}
    </Link>
  );
}

/** Wraps a page's main content in the standard GOV.UK grid. */
export function Main({ children, back, wide }: { children: ReactNode; back?: ReactNode | undefined; wide?: boolean | undefined }) {
  return (
    <>
      {back}
      <main className="govuk-main-wrapper" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className={wide ? "govuk-grid-column-full" : "govuk-grid-column-two-thirds"}>{children}</div>
        </div>
      </main>
    </>
  );
}

/** Shows a flash message once, after a redirect. */
export function useFlash(flash: string | null, clear: () => void) {
  const shown = useRef<string | null>(null);
  if (flash && shown.current === null) shown.current = flash;
  useEffect(() => {
    if (flash) clear();
  }, [flash, clear]);
  return shown.current;
}
