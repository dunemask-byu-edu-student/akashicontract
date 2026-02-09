import { defaultConfig } from "@chakra-ui/react/preset";
import { createSystem } from "@chakra-ui/react/styled-system";

const branding = {
  bg: "#373737",
  darkMode: true,
  color: "#EEEEEE",
  highlight: "#00add4",
};

function hexToHsl(hex: string): [number, number, number] {
  hex = hex.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h = 0,
    s = 0,
    l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h *= 60;
  }

  return [h, s, l];
}

function hslToHex(h: number, s: number, l: number): string {
  l = Math.max(0, Math.min(1, l));
  s = Math.max(0, Math.min(1, s));
  h = h % 360;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let [r, g, b] = [0, 0, 0];

  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];

  const toHex = (n: number) =>
    Math.round((n + m) * 255)
      .toString(16)
      .padStart(2, "0");

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Get a surface color (like Flutter's surface color) by adjusting lightness.
 * @param baseHexColor The base hex color string (e.g. "#6200ee")
 * @param surfaceFactor A value from -1 to 1. Positive = lighter surface, negative = darker.
 * @returns A hex color string representing the surface color.
 */
function getSurfaceColor(baseHexColor: string, surfaceFactor: number = 0.1): string {
  let [h, s, l] = hexToHsl(baseHexColor);
  l = Math.max(0, Math.min(1, l + surfaceFactor));
  return hslToHex(h, s, l);
}

function getContrastingColor(hex: string): string {
  // Remove the hash at the start if it's there
  hex = hex.replace(/^#/, "");

  // Parse r, g, b values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Calculate the luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return black or white based on luminance
  return luminance > 0.5 ? "black" : "white";
}

function darkenHexColor(hexColor: string, factor: number = 0.7): string {
  hexColor = hexColor.replace("#", "");
  let [r, g, b] = [
    parseInt(hexColor.substring(0, 2), 16),
    parseInt(hexColor.substring(2, 4), 16),
    parseInt(hexColor.substring(4, 6), 16),
  ];
  r = Math.max(0, Math.min(255, Math.floor(r * factor)));
  g = Math.max(0, Math.min(255, Math.floor(g * factor)));
  b = Math.max(0, Math.min(255, Math.floor(b * factor)));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

function lightenHexColor(hexColor: string, factor: number = 0.7): string {
  hexColor = hexColor.replace("#", "");
  let [r, g, b] = [
    parseInt(hexColor.substring(0, 2), 16),
    parseInt(hexColor.substring(2, 4), 16),
    parseInt(hexColor.substring(4, 6), 16),
  ];
  r = Math.max(0, Math.min(255, Math.floor(r * (2 - factor))));
  g = Math.max(0, Math.min(255, Math.floor(g * (2 - factor))));
  b = Math.max(0, Math.min(255, Math.floor(b * (2 - factor))));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

const surfaceColor = getSurfaceColor(branding.bg, (branding.darkMode ? -1 : 1) * 0.03);

const customTheme: Partial<typeof defaultConfig> = {
  globalCss: {
    // html: {
    //   colorPalette: "blue", // Example global styling
    // },
  },

  theme: {
    tokens: {
      colors: {
        brand: {
          100: { value: "#093367" },
          200: { value: "#093367" },
          300: { value: "#093367" },
          400: { value: "#093367" },
          500: { value: "#093367" },
          600: { value: "#093367" },
          700: { value: "#093367" },
          800: { value: "#093367" },
          900: { value: "#093367" },
          950: { value: "#7ab99b" },
        },
        neutral: {
          100: { value: "#FFF" },
          200: { value: "#F8FAFB" },
          300: { value: "#F2F4F6" },
          400: { value: "#E6EAEF" },
          500: { value: "#BCC5D1" },
          600: { value: "#788698" },
          700: { value: "#505F73" },
          800: { value: "#030B16" },
          900: { value: "#000" },
        },
        primary: {
          300: { value: "#5b90f5" },
          500: { value: "#2B6FF2" },
          700: { value: "#0e54dc" },
        },
        success: {
          500: { value: "#009E49" },
          700: { value: "#0ED27D" },
        },
        warning: {
          300: { value: "#E34747" },
          500: { value: "#F7A01F" },
        },
        text: {
          body: { value: "#030B16" },
          light: { value: "#657488" },
          lightest: { value: "#AEB8C6" },
          information: { value: "#2B6FF2" },
          success: { value: "#34A853" },
          warning: { value: "#F7A01F" },
          error: { value: "#F43A4D" },
        },
        bg: {
          main: { value: "#FFFFFF" },
          dialogBody: { value: "#FEFEFE" },
        },
      },
    },

    semanticTokens: {
      colors: {
        brand: {
          bg: { value: branding.bg },
          bgContrast: { value: getContrastingColor(branding.bg) },
          bgLighter: { value: lightenHexColor(branding.bg) },
          bgDarker: { value: darkenHexColor(branding.bg) },
          bgDarkest: { value: darkenHexColor(branding.bg, 0.7) },
          color: { value: branding.color },
          colorContrast: { value: getContrastingColor(branding.color) },
          highlight: { value: branding.highlight },
          highlightText: { value: getContrastingColor(branding.highlight) },
          surface: { value: surfaceColor },
          surfaceDarker: { value: darkenHexColor(surfaceColor) },
          surfaceLighter: { value: lightenHexColor(surfaceColor) },
          surfaceText: { value: getContrastingColor(surfaceColor) },
        },
      },
    },
  },
};

export const CHAKRA_SYSTEM = createSystem(defaultConfig, customTheme);
