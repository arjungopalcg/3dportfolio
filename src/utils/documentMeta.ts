const DEFAULT_TITLE = "Arjun Gopal C G — Interactive Portfolio";
const DEFAULT_DESCRIPTION =
  "Arjun Gopal C G — product manager and AI-assisted builder. Explore an interactive 3D portfolio covering roles, projects, and skills, or use the accessible list view.";

export function setDocumentMeta(title?: string, description?: string) {
  document.title = title ? `${title} — Arjun Gopal C G` : DEFAULT_TITLE;
  const tag = document.querySelector('meta[name="description"]');
  if (tag) tag.setAttribute("content", description ?? DEFAULT_DESCRIPTION);
}

export function resetDocumentMeta() {
  setDocumentMeta();
}
