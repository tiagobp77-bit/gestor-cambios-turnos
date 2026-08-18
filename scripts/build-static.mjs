import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectDirectory = path.resolve(scriptDirectory, "..");
const babelDirectory = process.argv[2];

if (!babelDirectory) {
  throw new Error("Uso: node scripts/build-static.mjs <directorio-node_modules-con-babel>");
}

const requireFromBabel = createRequire(path.join(path.resolve(babelDirectory), "package.json"));
const babel = requireFromBabel("@babel/core");
const presetReact = requireFromBabel("@babel/preset-react");
const indexPath = path.join(projectDirectory, "index.html");
const sourceDirectory = path.join(projectDirectory, "src");
const sourcePath = path.join(sourceDirectory, "app.jsx");
const outputPath = path.join(projectDirectory, "app.js");
let html = fs.readFileSync(indexPath, "utf8");

fs.mkdirSync(sourceDirectory, { recursive: true });
const openingTag = '<script type="text/babel">';
const openingIndex = html.indexOf(openingTag);
if (openingIndex >= 0) {
  const closingIndex = html.indexOf("</script>", openingIndex);
  if (closingIndex < 0) throw new Error("No se encontro el cierre del bloque JSX.");
  const source = html.slice(openingIndex + openingTag.length, closingIndex).trim() + "\n";
  fs.writeFileSync(sourcePath, source, "utf8");
  html = html.slice(0, openingIndex) + '<script src="./app.js" defer></script>' + html.slice(closingIndex + 9);
}

if (!fs.existsSync(sourcePath)) throw new Error("No existe src/app.jsx.");
const source = fs.readFileSync(sourcePath, "utf8");
const compiled = babel.transformSync(source, {
  filename: "src/app.jsx",
  presets: [[presetReact, { runtime: "classic" }]],
  comments: false,
  compact: true,
  sourceMaps: false
});
fs.writeFileSync(outputPath, compiled.code + "\n", "utf8");

html = html
  .replace(/\s*<script src="https:\/\/cdn\.tailwindcss\.com"><\/script>\s*<script>[\s\S]*?tailwind\.config\s*=\s*\{[\s\S]*?<\/script>/, "")
  .replace(/\s*<script src="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/babel-standalone\/[^"]+"><\/script>/, "")
  .replace('<meta name="viewport" content="width=device-width, initial-scale=1.0">', '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <link rel="stylesheet" href="./styles.css">')
  .replace('<script crossorigin src="https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js"></script>', '<script defer crossorigin src="https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js"></script>')
  .replace('<script crossorigin src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js"></script>', '<script defer crossorigin src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js"></script>');

fs.writeFileSync(indexPath, html, "utf8");
console.log(JSON.stringify({ sourceBytes: Buffer.byteLength(source), outputBytes: Buffer.byteLength(compiled.code) }));
