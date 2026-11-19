/**
 * Chart colors for light and dark mode.
 *
 * SVG chart libraries need real color values (they can't read our CSS
 * variables), so the brand palette is repeated here. Keep in sync with
 * app/globals.css.
 *
 * The yield curve uses ONE hue stepped from strong to faint (a
 * "sequential" palette), because its three lines are the same thing at
 * three points in time: today is the strongest, a year ago the faintest.
 * Lines also differ by dash pattern and carry direct labels, so readers
 * never have to rely on color alone.
 */
export const chartTheme = {
  light: {
    surface: "#ffffff",
    ink: "#1f2937",
    muted: "#6b7280",
    grid: "rgba(1, 33, 105, 0.08)",
    primary: "#012169",
    areaFill: "#012169",
    zero: "rgba(1, 33, 105, 0.35)",
    curve: { today: "#012169", monthAgo: "#3d6fb6", yearAgo: "#8db4db" },
    // Pick vs S&P: navy vs a deepened Emory gold (validated for color-blind separation)
    compare: { pick: "#012169", spx: "#b07d00" },
  },
  dark: {
    surface: "#0a2559",
    ink: "#e6edf7",
    muted: "#a9bce0",
    grid: "rgba(185, 217, 235, 0.10)",
    primary: "#b9d9eb",
    areaFill: "#b9d9eb",
    zero: "rgba(185, 217, 235, 0.4)",
    curve: { today: "#eef5fb", monthAgo: "#8db4db", yearAgo: "#4f72a8" },
    compare: { pick: "#b9d9eb", spx: "#f2a900" },
  },
} as const;

export type ChartPalette = (typeof chartTheme)["light" | "dark"];
