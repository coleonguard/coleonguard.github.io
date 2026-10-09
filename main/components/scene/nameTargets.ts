const NAME = ["COLE JOHNSON"];
const SAMPLE_STEP = 2;
const LINE_HEIGHT = 1.15;

function displayFamily(): string {
  const source = document.querySelector(".intro__name");
  return source ? getComputedStyle(source).fontFamily : "system-ui, sans-serif";
}

/** Resolves once the light display face is usable from canvas. */
export function loadNameFont(): Promise<unknown> {
  return document.fonts ? document.fonts.load(`300 100px ${displayFamily()}`, NAME[0]) : Promise.resolve();
}

/** Pixel positions covering the text lines, drawn in the page's display face and centered in the scene. */
export function sampleNameTargets(width: number, height: number, compact: boolean, lines: string[] = NAME): Float32Array {
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(width);
  canvas.height = Math.ceil(height);
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return new Float32Array(0);

  const family = displayFamily();
  const font = (size: number) => `300 ${size}px ${family}`;

  ctx.font = font(100);
  const measured = Math.max(...lines.map((line) => ctx.measureText(line).width), 1);
  const size = Math.min((100 * width * (compact ? 0.84 : 0.62)) / measured, (height * 0.28) / lines.length);
  ctx.font = font(size);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#fff";
  const center = height * (compact ? 0.5 : 0.48);
  lines.forEach((line, i) => {
    ctx.fillText(line, width / 2, center + (i - (lines.length - 1) / 2) * size * LINE_HEIGHT);
  });

  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const points: number[] = [];
  for (let y = 0; y < canvas.height; y += SAMPLE_STEP) {
    for (let x = 0; x < canvas.width; x += SAMPLE_STEP) {
      if (data[(y * canvas.width + x) * 4 + 3] > 128) points.push(x, y);
    }
  }
  return new Float32Array(points);
}
