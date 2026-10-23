// Zet huisritme.html klaar als www/index.html voor de app.
// De lettertypes komen uit de app zelf, zodat alles ook zonder internet werkt.
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const www = path.join(root, 'www');
const fonts = path.join(www, 'fonts');
fs.rmSync(www, { recursive: true, force: true });
fs.mkdirSync(fonts, { recursive: true });

const faces = [
  ['Young Serif', '@fontsource/young-serif', 'young-serif', [400]],
  ['Nunito Sans', '@fontsource/nunito-sans', 'nunito-sans', [400, 600, 700, 800]],
];
let css = '';
for (const [family, pkg, slug, weights] of faces) {
  for (const w of weights) {
    const file = `${slug}-latin-${w}-normal.woff2`;
    const src = path.join(root, 'node_modules', pkg, 'files', file);
    fs.copyFileSync(src, path.join(fonts, file));
    css += `@font-face{font-family:'${family}';font-style:normal;font-weight:${w};font-display:swap;src:url(${file}) format('woff2');}\n`;
  }
}
fs.writeFileSync(path.join(fonts, 'fonts.css'), css);

let html = fs.readFileSync(path.join(root, 'huisritme.html'), 'utf8');
const link = /<link[^>]+fonts\.googleapis\.com[^>]*>/;
if (!link.test(html)) throw new Error('Google Fonts-regel niet gevonden in huisritme.html');
html = html.replace(link, '<link rel="stylesheet" href="fonts/fonts.css">');
fs.writeFileSync(path.join(www, 'index.html'), html);
console.log('www/index.html klaar');
