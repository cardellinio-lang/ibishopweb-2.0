#!/usr/bin/env -S /Users/traddax/.nvm/versions/node/v20.20.2/bin/node
import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient();

const IMGBB_KEY = 'a8d77f4c5562a973f9c8ded591c2f637';
const PUBLIC = join(__dirname, '..', 'public', 'products');

async function upload(filePath) {
  const b64 = readFileSync(filePath).toString('base64');
  const body = new URLSearchParams({ key: IMGBB_KEY, image: b64 });
  const res = await fetch('https://api.imgbb.com/1/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const data = await res.json();
  if (!data.success) throw new Error(`imgbb: ${JSON.stringify(data)}`);
  return data.data.url;
}

async function main() {
  console.log('Uploading theme-specific mockups...\n');
  
  // 1. Masculin/Feminin — purple
  const mf1 = await upload(join(PUBLIC, 'mockup_theme_purple.jpg'));
  const mf2 = await upload(join(PUBLIC, 'spread_theme_purple.jpg'));
  const mf3 = await upload(join(PUBLIC, 'card_closeup.jpg'));
  console.log('Purple theme uploaded');
  
  // 2. Association — teal
  const as1 = await upload(join(PUBLIC, 'mockup_assoc_teal.jpg'));
  const as2 = await upload(join(PUBLIC, 'spread_assoc_teal.jpg'));
  console.log('Teal theme uploaded');
  
  // 3. Challenge — orange
  const ch1 = await upload(join(PUBLIC, 'mockup_challenge_orange.jpg'));
  const ch2 = await upload(join(PUBLIC, 'spread_challenge_orange.jpg'));
  console.log('Orange theme uploaded');
  
  // Update products
  await prisma.product.update({
    where: { slug: 'cartes-masculin-feminin-couleurs' },
    data: { images: JSON.stringify([mf1, mf2, mf3]) },
  });
  console.log('✓ cartes-masculin-feminin-couleurs updated');
  
  await prisma.product.update({
    where: { slug: 'cartes-association' },
    data: { images: JSON.stringify([as1, as2, mf3]) },
  });
  console.log('✓ cartes-association updated');
  
  await prisma.product.update({
    where: { slug: 'cartes-defi' },
    data: { images: JSON.stringify([ch1, ch2, mf3]) },
  });
  console.log('✓ cartes-defi updated');
  
  console.log('\nAll products have unique images!');
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
