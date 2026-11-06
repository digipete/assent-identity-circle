const SERVICE = "Check identities for an Assent application";

export function pageHead(title: string, description: string) {
  const full = `${title} – ${SERVICE} – HM Land Registry (prototype)`;
  return {
    meta: [
      { title: full },
      { name: "description", content: description },
      { property: "og:title", content: full },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  };
}
