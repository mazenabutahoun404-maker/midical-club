type ThemeColors = {
  backgroundColor: string;
  color: string;
  borderColor: string;
};
export interface ThemeColorSnapshot {
  element: HTMLElement;
  colors: ThemeColors;
}
function colors(element: HTMLElement): ThemeColors {
  const style = getComputedStyle(element);
  return {
    backgroundColor: style.backgroundColor,
    color: style.color,
    borderColor: style.borderColor,
  };
}
export function captureThemeColors(root: HTMLElement): ThemeColorSnapshot[] {
  return [
    ...root.querySelectorAll<HTMLElement>(
      "body, .app-shell, .app-content, .desktop-navigation, .scroll-header, .phone-navigation, .medclub-native-modal, .appearance-palette-option, .theme-preview, .theme-preview-idle, .profile-portal, .control-room-portal, .navigation-item, .navigation-preferences, .workspace-icon, .language-button, .admin-live-chip, .shell-location",
    ),
  ].map((element) => ({ element, colors: colors(element) }));
}
/** Animate colors only: no screen overlay, opacity flash or replacement of transform motion. */
export function fadeThemeColors(
  snapshots: readonly ThemeColorSnapshot[],
): Animation[] {
  const animations: Animation[] = [];
  // The neutral final frame resolves to the new CSS theme in the browser.
  // No computed-style read follows the theme writes or any animation write.
  for (const snapshot of snapshots) {
    if (
      !snapshot.element.isConnected ||
      typeof snapshot.element.animate !== "function"
    )
      continue;
    try {
      animations.push(
        snapshot.element.animate([snapshot.colors, {}], {
          duration: 180,
          easing: "ease-out",
        }),
      );
    } catch {
      /* The selected theme is already applied if animation is unavailable. */
    }
  }
  return animations;
}
