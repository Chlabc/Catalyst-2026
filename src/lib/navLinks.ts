import { WIDGET_TABS } from "./tabManager";

export type NavLink = {
  href: string;
  label: string;
  /** When true, active only on exact pathname match (Home). */
  exact?: boolean;
};

export const NAV_LINKS: NavLink[] = [
  { href: "/", label: "Home", exact: true },
  ...WIDGET_TABS.map((tab) => ({ href: tab.href, label: tab.label })),
];

/** Homepage-only active for Home; prefix match for other routes. */
export function isNavLinkActive(pathname: string, link: NavLink): boolean {
  if (link.exact) {
    return pathname === link.href;
  }
  return pathname === link.href || pathname.startsWith(`${link.href}/`);
}
