export const NAV_TUTORIAL_KEY = "blossom_has_seen_nav_tutorial";
export const WELCOME_CHANGED_EVENT = "blossom-welcome-changed";

export type NavTutorialStep = {
  id: string;
  selector: string;
  title: string;
  body: string;
};

export const NAV_TUTORIAL_STEPS: NavTutorialStep[] = [
  {
    id: "nav",
    selector: '[data-testid="top-nav"]',
    title: "This is Bloom’s menu",
    body: "Home, Learn, Tracker, Find Help, FAQ, and Health report live up here. You can hop between them any time.",
  },
  {
    id: "flower",
    selector: "[data-canvas-centerpiece]",
    title: "Your bloom plant",
    body: "This flower sits on Home. It grows as you log days in Tracker — a quiet way to see you’re checking in.",
  },
  {
    id: "learning",
    selector: '[data-widget-id="learning"]',
    title: "Learn on Menstrome Island",
    body: "Tap the Learning widget to visit Bloom’s island towns. Each town is a short story, a few facts, and one decision.",
  },
  {
    id: "handle",
    selector: '[data-testid="widget-drag-handle-learning"]',
    title: "Drag with the dotted handle",
    body: "Grab the dotted bar to move a widget. Bloom keeps them on the canvas so they cannot slide off the page.",
  },
  {
    id: "edit",
    selector: '[data-testid="edit-widgets"]',
    title: "Edit widgets",
    body: "Show or hide extra cards here. Use Show tour next to this button whenever you want the Bloom walkthrough again.",
  },
];

export function persistNavTutorialSeen() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(NAV_TUTORIAL_KEY, "true");
  } catch {
    // Preference is best-effort; the tour can still close for this visit.
  }
}

export function hasSeenNavTutorial() {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem(NAV_TUTORIAL_KEY) === "true";
  } catch {
    return false;
  }
}
