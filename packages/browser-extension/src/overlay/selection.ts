import { inspectElement } from "@ai-ui-runtime/ui-runtime";
import type { SelectedComponent } from "./state";

const TEXT_LIKE_TAGS = new Set(["H1", "H2", "H3", "H4", "H5", "H6", "P", "SPAN", "STRONG", "EM", "SMALL"]);
const SELF_STABLE_TAGS = new Set(["BUTTON", "A", "INPUT", "TEXTAREA", "SELECT", "LABEL", "IMG", "VIDEO", "CANVAS"]);
const LANDMARK_TAGS = new Set(["HEADER", "MAIN", "NAV", "ASIDE", "SECTION", "ARTICLE", "FOOTER", "FORM", "DIALOG"]);
const TEST_ATTRIBUTE_NAMES = [
  "data-testid",
  "data-test",
  "data-qa",
  "data-cy",
  "data-slot",
  "data-state",
  "data-variant",
  "data-component",
  "name",
  "aria-controls",
  "aria-labelledby"
] as const;

function toHTMLElement(target: EventTarget | null): HTMLElement | null {
  if (target instanceof HTMLElement) {
    return target;
  }

  if (target instanceof Element) {
    let current: Element | null = target;
    while (current && !(current instanceof HTMLElement)) {
      current = current.parentElement;
    }

    return current;
  }

  return null;
}

function escapeSelectorFragment(value: string): string {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
    return CSS.escape(value);
  }

  return value.replace(/[^a-zA-Z0-9_-]/g, "\\$&");
}

function buildClassSignature(element: HTMLElement): string {
  const classNames = Array.from(element.classList).filter(Boolean).slice(0, 2);
  return classNames.length > 0 ? `.${classNames.map(escapeSelectorFragment).join(".")}` : "";
}

function buildNthOfTypeSelector(element: HTMLElement): string {
  const parent = element.parentElement;
  if (!parent) {
    return "";
  }

  const siblings = Array.from(parent.children).filter((child) => child.tagName === element.tagName);
  if (siblings.length <= 1) {
    return "";
  }

  const index = siblings.indexOf(element) + 1;
  return index > 0 ? `:nth-of-type(${index})` : "";
}

function buildSelectorSegment(element: HTMLElement): string {
  const tag = element.tagName.toLowerCase();
  if (element.id) {
    return `${tag}#${escapeSelectorFragment(element.id)}`;
  }

  const classSignature = buildClassSignature(element);
  if (classSignature) {
    return `${tag}${classSignature}`;
  }

  return `${tag}${buildNthOfTypeSelector(element)}`;
}

function buildDomPath(element: HTMLElement, depth = 5): string {
  const segments: string[] = [];
  let current: HTMLElement | null = element;

  while (current && segments.length < depth) {
    if (current.tagName === "BODY" || current.tagName === "HTML") {
      break;
    }

    segments.unshift(buildSelectorSegment(current));
    current = current.parentElement;
  }

  return segments.join(" > ");
}

function buildAncestorTrail(element: HTMLElement, depth = 4): string[] {
  const segments: string[] = [];
  let current = element.parentElement;

  while (current && segments.length < depth) {
    if (current.tagName === "BODY" || current.tagName === "HTML") {
      break;
    }

    segments.push(buildSelectorSegment(current));
    current = current.parentElement;
  }

  return segments;
}

function isLandmarkElement(element: HTMLElement): boolean {
  if (LANDMARK_TAGS.has(element.tagName)) {
    return true;
  }

  return element.hasAttribute("role");
}

function buildSemanticPath(element: HTMLElement, depth = 5): string | undefined {
  const landmarks: string[] = [];
  let current: HTMLElement | null = element;

  while (current && landmarks.length < depth) {
    if (current.tagName === "BODY" || current.tagName === "HTML") {
      break;
    }

    if (isLandmarkElement(current)) {
      landmarks.unshift(buildSelectorSegment(current));
    }

    current = current.parentElement;
  }

  return landmarks.length > 0 ? landmarks.join(" > ") : undefined;
}

function getClosestHeading(element: HTMLElement): string | undefined {
  const root = element.closest("section, article, main, aside, nav, header, form") ?? element.parentElement ?? document.body;
  const heading = root.querySelector("h1, h2, h3, h4, h5, h6");
  if (!(heading instanceof HTMLElement)) {
    return undefined;
  }

  return getTextPreview(heading);
}

function getLandmarkHint(element: HTMLElement): string | undefined {
  const landmark = element.closest("main, section, article, aside, nav, header, footer, form, [role]");
  if (!(landmark instanceof HTMLElement)) {
    return undefined;
  }

  const tag = landmark.tagName.toLowerCase();
  const idPart = landmark.id ? `#${landmark.id}` : "";
  const role = getAttributePreview(landmark, "role");
  const label = getAttributePreview(landmark, "aria-label");

  return [tag + idPart, role ? `role=${role}` : null, label ? `label=${label}` : null].filter(Boolean).join(" | ");
}

function getSiblingStats(element: HTMLElement): { siblingIndex: number; siblingCount: number } {
  const parent = element.parentElement;
  if (!parent) {
    return {
      siblingIndex: 1,
      siblingCount: 1
    };
  }

  const siblings = Array.from(parent.children).filter((child): child is HTMLElement => child instanceof HTMLElement);
  const siblingIndex = siblings.indexOf(element) + 1;

  return {
    siblingIndex: siblingIndex > 0 ? siblingIndex : 1,
    siblingCount: siblings.length || 1
  };
}

function getTextPreview(element: HTMLElement): string | undefined {
  const text = element.textContent?.replace(/\s+/g, " ").trim();
  if (!text) {
    return undefined;
  }

  return text.slice(0, 80);
}

function getAttributePreview(element: HTMLElement, name: string): string | undefined {
  const value = element.getAttribute(name)?.replace(/\s+/g, " ").trim();
  return value ? value.slice(0, 80) : undefined;
}

function getParentSignature(element: HTMLElement): string | undefined {
  const parent = element.parentElement;
  if (!parent || parent.tagName === "BODY" || parent.tagName === "HTML") {
    return undefined;
  }

  return buildSelectorSegment(parent);
}

function getTestAttributeHints(element: HTMLElement): string[] {
  const hints: string[] = [];

  if (element.id) {
    hints.push(`id=${element.id}`);
  }

  for (const name of TEST_ATTRIBUTE_NAMES) {
    const value = getAttributePreview(element, name);
    if (value) {
      hints.push(`${name}=${value}`);
    }
  }

  return hints.slice(0, 5);
}

function isTextLikeElement(element: HTMLElement): boolean {
  return TEXT_LIKE_TAGS.has(element.tagName);
}

function isStableStandaloneElement(element: HTMLElement): boolean {
  return SELF_STABLE_TAGS.has(element.tagName);
}

function shouldPromoteSelection(element: HTMLElement): boolean {
  if (isStableStandaloneElement(element)) {
    return false;
  }

  const style = window.getComputedStyle(element);
  const rect = element.getBoundingClientRect();
  const area = rect.width * rect.height;

  return (
    isTextLikeElement(element) ||
    style.display === "inline" ||
    (element.childElementCount === 0 && area < 6400) ||
    rect.height < 28
  );
}

function isReasonablePromotionTarget(current: HTMLElement, candidate: HTMLElement): boolean {
  if (candidate.tagName === "BODY" || candidate.tagName === "HTML") {
    return false;
  }

  const currentRect = current.getBoundingClientRect();
  const candidateRect = candidate.getBoundingClientRect();
  const currentArea = Math.max(1, currentRect.width * currentRect.height);
  const candidateArea = candidateRect.width * candidateRect.height;

  if (candidateArea > window.innerWidth * window.innerHeight * 0.72) {
    return false;
  }

  if (candidateArea > currentArea * 30) {
    return false;
  }

  const style = window.getComputedStyle(candidate);
  const isLayoutContainer =
    style.display === "block" ||
    style.display === "flex" ||
    style.display === "grid" ||
    style.display === "inline-flex" ||
    style.display === "inline-grid";

  return isLayoutContainer || candidate.classList.length > 0 || candidate.childElementCount > 1 || candidate.hasAttribute("role");
}

function resolvePreferredSelectionTarget(element: HTMLElement): HTMLElement {
  if (!shouldPromoteSelection(element)) {
    return element;
  }

  let current = element;
  let best = element;
  let depth = 0;

  while (current.parentElement && depth < 4) {
    const parent = current.parentElement;
    const parentComponent = inspectElement(parent);
    if (!parentComponent) {
      break;
    }

    if (isReasonablePromotionTarget(current, parent)) {
      best = parent;
      break;
    }

    current = parent;
    depth += 1;
  }

  return best;
}

export function isOverlayEvent(event: Event, overlayHost: HTMLElement): boolean {
  return event.composedPath().includes(overlayHost);
}

export function resolveSelectableElement(target: EventTarget | null): HTMLElement | null {
  let candidate = toHTMLElement(target);

  while (candidate) {
    if (candidate.dataset.aiUiRuntimeIgnore === "true") {
      return null;
    }

    const component = inspectElement(candidate);
    if (component) {
      return resolvePreferredSelectionTarget(candidate);
    }

    candidate = candidate.parentElement;
  }

  return null;
}

export function createSelectedComponent(element: HTMLElement | null): SelectedComponent {
  if (!element) {
    return null;
  }

  const component = inspectElement(element);
  if (!component) {
    return null;
  }

  const siblingStats = getSiblingStats(element);

  return {
    ...component,
    text: component.text ?? getTextPreview(element),
    selector: buildSelectorSegment(element),
    domPath: buildDomPath(element),
    parentSignature: getParentSignature(element),
    ancestorTrail: buildAncestorTrail(element),
    semanticPath: buildSemanticPath(element),
    closestHeading: getClosestHeading(element),
    landmarkHint: getLandmarkHint(element),
    siblingIndex: siblingStats.siblingIndex,
    siblingCount: siblingStats.siblingCount,
    childCount: element.childElementCount,
    testAttributes: getTestAttributeHints(element),
    role: getAttributePreview(element, "role"),
    ariaLabel: getAttributePreview(element, "aria-label"),
    element
  };
}

export function formatElementLabel(element: HTMLElement): string {
  const tag = element.tagName.toLowerCase();
  const classNames = Array.from(element.classList).filter(Boolean).slice(0, 2);

  if (classNames.length === 0) {
    return tag;
  }

  return `${tag}.${classNames.join(".")}`;
}
