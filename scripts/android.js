// Past het door Capacitor gemaakte Android-project aan: icoon, kleuren, sleutel en rechten.
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const app = path.join(root, 'android', 'app');
const res = path.join(app, 'src', 'main', 'res');

// Standaard Capacitor-plaatjes weg, eigen bestanden erin.
for (const dir of fs.readdirSync(res)) {
  const full = path.join(res, dir);
  if (/^(mipmap|drawable)/.test(dir)) {
    for (const f of fs.readdirSync(full)) {
      if (/^(ic_launcher|splash)/.test(f)) fs.rmSync(path.join(full, f));
    }
  }
}
function copyDir(from, to) {
  for (const f of fs.readdirSync(from)) {
    const a = path.join(from, f), b = path.join(to, f);
    if (fs.statSync(a).isDirectory()) { fs.mkdirSync(b, { recursive: true }); copyDir(a, b); }
    else fs.copyFileSync(a, b);
  }
}
copyDir(path.join(root, 'android-res'), res);

// Vaste sleutel, zodat elke nieuwe versie over de vorige heen installeert.
const gradleFile = path.join(app, 'build.gradle');
let g = fs.readFileSync(gradleFile, 'utf8');
const run = parseInt(process.env.RUN_NUMBER || '1', 10);
g = g.replace(/versionCode \d+/, 'versionCode ' + run).replace(/versionName "[^"]*"/, 'versionName "1.' + run + '"');
g += `
android {
    signingConfigs {
        vast {
            storeFile file("../../huisritme.jks")
            storePassword "XzM6HFkkw3Z26hlPQWLn"
            keyAlias "huisritme"
            keyPassword "XzM6HFkkw3Z26hlPQWLn"
        }
    }
    buildTypes {
        debug { signingConfig signingConfigs.vast }
    }
}
`;
fs.writeFileSync(gradleFile, g);

// Rechten voor meldingen en trillen.
const mf = path.join(app, 'src', 'main', 'AndroidManifest.xml');
let m = fs.readFileSync(mf, 'utf8');
const perms = ['POST_NOTIFICATIONS', 'SCHEDULE_EXACT_ALARM', 'RECEIVE_BOOT_COMPLETED', 'VIBRATE', 'WAKE_LOCK'];
for (const p of perms) {
  const line = '<uses-permission android:name="android.permission.' + p + '" />';
  if (!m.includes('android.permission.' + p + '"')) m = m.replace('</manifest>', '    ' + line + '\n</manifest>');
}
fs.writeFileSync(mf, m);
console.log('Android-project aangepast (versie ' + run + ')');
