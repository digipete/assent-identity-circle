import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  ClientOnly,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <main className="govuk-main-wrapper" id="main-content">
      <h1 className="govuk-heading-l">Page not found</h1>
      <p className="govuk-body">If you typed the web address, check it is correct.</p>
      <p className="govuk-body">
        <Link to="/" className="govuk-link">
          Go to the start page
        </Link>
      </p>
    </main>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <main className="govuk-main-wrapper" id="main-content">
      <h1 className="govuk-heading-l">Sorry, there is a problem with the service</h1>
      <p className="govuk-body">Try again, or go back to the start page.</p>
      <div className="govuk-button-group">
        <button
          className="govuk-button"
          onClick={() => {
            router.invalidate();
            reset();
          }}
        >
          Try again
        </button>
        <a href="/" className="govuk-link">
          Go to the start page
        </a>
      </div>
    </main>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#0b0c0c" },
      { name: "robots", content: "noindex" },
    ],
    links: [
      { rel: "stylesheet", href: "/govuk/govuk-frontend.min.css" },
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="govuk-template">
      <head>
        <HeadContent />
      </head>
      <body className="govuk-template__body govuk-frontend-supported">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isInvitee = pathname.startsWith("/invite/");
  const isResearch = pathname.startsWith("/research");

  return (
    <QueryClientProvider client={queryClient}>
      <a href="#main-content" className="govuk-skip-link">
        Skip to main content
      </a>
      <header className="govuk-header" role="banner">
        <div className="govuk-header__container govuk-width-container">
          <div className="govuk-header__logo">
            <span className="govuk-header__link govuk-header__link--homepage app-header-org">HM Land Registry</span>
          </div>
        </div>
      </header>
      <section className="govuk-service-navigation" aria-label="Service information">
        <div className="govuk-width-container">
          <div className="govuk-service-navigation__container">
            <span className="govuk-service-navigation__service-name">
              {isInvitee ? (
                <span className="govuk-service-navigation__text">Check identities for an Assent application</span>
              ) : (
                <Link to="/" className="govuk-service-navigation__link">
                  Check identities for an Assent application
                </Link>
              )}
            </span>
          </div>
        </div>
      </section>
      <div className="govuk-width-container">
        <div className="govuk-phase-banner">
          <p className="govuk-phase-banner__content">
            <strong className="govuk-tag govuk-phase-banner__content__tag">Beta</strong>
            <span className="govuk-phase-banner__text">
              This is a research prototype. Identity checks are simulated and no real emails are sent.
            </span>
          </p>
        </div>
        {isResearch && (
          <p className="govuk-body-s govuk-!-margin-top-2">
            <strong>Prototype research tools</strong> – not part of the citizen journey.
          </p>
        )}
        <ClientOnly fallback={<main className="govuk-main-wrapper" id="main-content"><p className="govuk-body">Loading…</p></main>}>
          <Outlet />
        </ClientOnly>
      </div>
      <footer className="govuk-footer" role="contentinfo">
        <div className="govuk-width-container">
          <div className="govuk-footer__meta">
            <div className="govuk-footer__meta-item govuk-footer__meta-item--grow">
              <h2 className="govuk-visually-hidden">Support links</h2>
              <ul className="govuk-footer__inline-list">
                <li className="govuk-footer__inline-list-item">
                  <Link to="/research" className="govuk-footer__link">
                    Prototype research tools
                  </Link>
                </li>
                <li className="govuk-footer__inline-list-item">
                  <Link to="/other-ways" className="govuk-footer__link">
                    Other ways to prove your identity
                  </Link>
                </li>
              </ul>
              <span className="govuk-footer__licence-description">
                Research prototype for HM Land Registry. All names, addresses and results are fictional.
              </span>
            </div>
          </div>
        </div>
      </footer>
    </QueryClientProvider>
  );
}
