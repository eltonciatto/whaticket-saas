function getRGB(c) {
  return parseInt(c, 16) || c;
}

function getsRGB(c) {
  const rgb = getRGB(c) / 255;
  return rgb <= 0.03928 ? rgb / 12.92 : Math.pow((rgb + 0.055) / 1.055, 2.4);
}

function getLuminance(hexColor) {
  return (
    0.2126 * getsRGB(hexColor.slice(1, 3)) +  // Red
    0.7152 * getsRGB(hexColor.slice(3, 5)) +  // Green
    0.0722 * getsRGB(hexColor.slice(5, 7))    // Blue
  );
}

function getContrast(foreground, background) {
  const L1 = getLuminance(foreground);
  const L2 = getLuminance(background);
  return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
}

function getTextColor(bgColor) {
  const whiteContrast = getContrast(bgColor, "#ffffff");
  const blackContrast = getContrast(bgColor, "#000000");
  return whiteContrast > blackContrast ? "#ffffff" : "#000000";
}

const contrastColor = (color) => {
  if (!/^#([0-9A-F]{3}){1,2}$/i.test(color)) {
    throw new Error("Invalid hex color format");
  }
  return getTextColor(color);
}

export default contrastColor;
