#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs'
import { execSync } from 'child_process'

const prompt = process.argv[2]
const size = process.argv[3] || '1024x1024'
const outfile = process.argv[4] || `img_${Date.now()}.jpg`

if (!prompt) {
  console.log(`
Usage:  node scripts/img.mjs "prompt" [widthxheight] [output.jpg]
  --upload   auto-upload to imgbb

Examples:
  node scripts/img.mjs "jeu educatif en bois, photo studio, fond blanc"
  node scripts/img.mjs "العبة خشبية" 1024x1024 monimage.jpg --upload
`)
  process.exit(1)
}

import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const HF_TOKEN = process.env.HF_TOKEN
const IMGBB_KEY = process.env.IMGBB_API_KEY
const shouldUpload = process.argv.includes('--upload')
const [w, h] = size.split('x')

if (!HF_TOKEN) {
  console.log('❌ No HF_TOKEN in .env.local')
  process.exit(1)
}

const models = [
  'black-forest-labs/FLUX.1-schnell',
  'stabilityai/stable-diffusion-3.5-large-turbo',
  'black-forest-labs/FLUX.1-dev',
]

const inputs = JSON.stringify({ inputs: prompt, parameters: { width: Number(w), height: Number(h) } })

async function run() {
  console.log(`🎨 "${prompt}" (${size})`)
  for (const model of models) {
    const url = `https://router.huggingface.co/hf-inference/models/${model}`
    const cmd = `curl -s --max-time 180 -H "Authorization: Bearer ${HF_TOKEN}" -H "Content-Type: application/json" -d ${JSON.stringify(inputs)} -o ${JSON.stringify(outfile)} ${JSON.stringify(url)}`
    try {
      execSync(cmd, { stdio: 'pipe', timeout: 190000, shell: true })
      const type = execSync(`file -b ${JSON.stringify(outfile)}`, { encoding: 'utf8', timeout: 5000 }).trim()
      if (type.includes('JPEG') || type.includes('PNG')) {
        const kb = (readFileSync(outfile).length / 1024).toFixed(1)
        console.log(`   ✅ ${model.split('/')[1]} → ${outfile} (${kb} KB)`)
        if (shouldUpload && IMGBB_KEY) {
          const res = execSync(
            `curl -s -F "image=@${outfile}" "https://api.imgbb.com/1/upload?key=${IMGBB_KEY}"`,
            { encoding: 'utf8', timeout: 30000 }
          )
          const data = JSON.parse(res)
          if (data.success) console.log(`   🔗 ${data.data.image.url}`)
        }
        process.exit(0)
      }
    } catch {}
  }
  console.log('❌ All models failed')
}
run()
