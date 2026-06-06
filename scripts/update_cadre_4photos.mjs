#!/usr/bin/env node
import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient();

const IMGBB_KEY = 'a8d77f4c5562a973f9c8ded591c2f637';
const PUBLIC = join(__dirname, '..', 'public', 'products');

async function upload(filePath) {
  const buf = readFileSync(filePath);
  const b64 = buf.toString('base64');
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
  console.log('Uploading 4 photos...');
  const url1 = await upload(join(PUBLIC, 'cadre_photo1_poster.jpg'));
  console.log('1/4', url1);
  const url2 = await upload(join(PUBLIC, 'cadre_photo2_frame.jpg'));
  console.log('2/4', url2);
  const url3 = await upload(join(PUBLIC, 'cadre_photo3_office.jpg'));
  console.log('3/4', url3);
  const url4 = await upload(join(PUBLIC, 'cadre_photo4_detail.jpg'));
  console.log('4/4', url4);

  await prisma.product.update({
    where: { slug: 'cadre-decor-orthophoniste' },
    data: { images: JSON.stringify([url1, url2, url3, url4]) },
  });
  console.log('✓ Product updated with 4 images');
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
