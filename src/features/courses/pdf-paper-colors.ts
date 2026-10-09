/** Remap neutral paper/ink only. Never mutate PDF bytes or cached source rasters. */
const tables = new Map<string, Uint8ClampedArray>();
function rgb(hex: string) {
  if (!/^#[\da-f]{6}$/i.test(hex)) throw new Error("Invalid PDF paper color");
  return [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16));
}
export function recolorPdfPaper(
  pixels: Uint8ClampedArray,
  paper: string,
  ink: string,
) {
  const key = paper + ink;
  let table = tables.get(key);
  if (!table) {
    const background = rgb(paper),
      foreground = rgb(ink);
    table = new Uint8ClampedArray(256 * 3);
    for (let luminance = 0; luminance < 256; luminance++) {
      const fraction = luminance / 255;
      for (let channel = 0; channel < 3; channel++)
        table[luminance * 3 + channel] = Math.round(
          foreground[channel] * (1 - fraction) + background[channel] * fraction,
        );
    }
    if (tables.size >= 12) tables.delete(tables.keys().next().value!);
    tables.set(key, table);
  }
  for (let offset = 0; offset < pixels.length; offset += 4) {
    if (!pixels[offset + 3]) continue;
    const red = pixels[offset],
      green = pixels[offset + 1],
      blue = pixels[offset + 2];
    // Strongly colored diagrams stay byte-for-byte unchanged. Image detail can
    // still contain neutral pixels: Original colors remains a reader option.
    if (Math.max(red, green, blue) - Math.min(red, green, blue) > 24) continue;
    const luminance = (54 * red + 183 * green + 19 * blue) >> 8;
    pixels[offset] = table[luminance * 3];
    pixels[offset + 1] = table[luminance * 3 + 1];
    pixels[offset + 2] = table[luminance * 3 + 2];
  }
}
