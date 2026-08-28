import sharp from 'sharp';

const sizes = [96, 180, 192, 512];

for (const s of sizes) {
  await sharp('public/favicon.svg')
    .resize(s, s)
    .png()
    .toFile(`public/favicon-${s}x${s}.png`);
  console.log(`generated favicon-${s}x${s}.png`);
}
