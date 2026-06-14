import { writeFileSync, mkdirSync } from 'fs';

const PAGES = [
  { sound: 'م', scene: '🏫 المدرسة', sceneEmojis: ['🏫','📚','✏️','📖','🪑'], items: [
    { icon: '📏', word: 'مسطرة', correct: true }, { icon: '🍌', word: 'موزة', correct: true },
    { icon: '🧹', word: 'ممسحة', correct: true }, { icon: '🚗', word: 'سيارة', correct: false },
    { icon: '🗝️', word: 'مفتاح', correct: true }, { icon: '🪣', word: 'دلو', correct: false },
    { icon: '🪞', word: 'مرآة', correct: true }, { icon: '🐟', word: 'سمكة', correct: false },
  ]},
  { sound: 'ب', scene: '🧑‍🌾 المزرعة', sceneEmojis: ['🐄','🌾','🚜','🐔','🌻'], items: [
    { icon: '🥔', word: 'بطاطا', correct: true }, { icon: '🧅', word: 'بصل', correct: true },
    { icon: '🍉', word: 'بطيخ', correct: true }, { icon: '🍎', word: 'تفاح', correct: false },
    { icon: '🐄', word: 'بقر', correct: true }, { icon: '🦆', word: 'بطة', correct: true },
    { icon: '🍞', word: 'خبز', correct: false }, { icon: '🥕', word: 'جزر', correct: false },
  ]},
  { sound: 'ف', scene: '🛒 السوق', sceneEmojis: ['🛒','🍎','🥦','🧺','⚖️'], items: [
    { icon: '🍓', word: 'فراولة', correct: true }, { icon: '🌶️', word: 'فلفل', correct: true },
    { icon: '👗', word: 'فستان', correct: true }, { icon: '🍇', word: 'عنب', correct: false },
    { icon: '☕', word: 'فنجان', correct: true }, { icon: '🪓', word: 'فأس', correct: true },
    { icon: '🍊', word: 'برتقال', correct: false }, { icon: '🥛', word: 'حليب', correct: false },
  ]},
  { sound: 'س', scene: '🏖️ الشاطئ', sceneEmojis: ['🌊','🏖️','☀️','🐚','⛵'], items: [
    { icon: '🚗', word: 'سيارة', correct: true }, { icon: '🐟', word: 'سمكة', correct: true },
    { icon: '🥗', word: 'سلطة', correct: true }, { icon: '🍞', word: 'خبز', correct: false },
    { icon: '🕰️', word: 'ساعة', correct: true }, { icon: '🛏️', word: 'سرير', correct: true },
    { icon: '🐎', word: 'حصان', correct: false }, { icon: '🚲', word: 'دراجة', correct: false },
  ]},
  { sound: 'ش', scene: '🌳 الحديقة', sceneEmojis: ['🌳','🌸','🦋','🌿','☀️'], items: [
    { icon: '🌳', word: 'شجرة', correct: true }, { icon: '☀️', word: 'شمس', correct: true },
    { icon: '🍴', word: 'شوكة', correct: true }, { icon: '🥪', word: 'شطيرة', correct: true },
    { icon: '🥤', word: 'شراب', correct: true }, { icon: '🪨', word: 'حجر', correct: false },
    { icon: '🐦', word: 'عصفور', correct: false }, { icon: '🧢', word: 'قبعة', correct: false },
  ]},
  { sound: 'ر', scene: '🍎 المطبخ', sceneEmojis: ['🍳','🥘','🔪','🍲','🧑‍🍳'], items: [
    { icon: '🍅', word: 'رمان', correct: true }, { icon: '🪶', word: 'ريشة', correct: true },
    { icon: '🏖️', word: 'رمل', correct: true }, { icon: '🍚', word: 'رز', correct: true },
    { icon: '👤', word: 'رأس', correct: true }, { icon: '🍞', word: 'خبز', correct: false },
    { icon: '🧈', word: 'زبدة', correct: false }, { icon: '🥩', word: 'لحم', correct: false },
  ]},
  { sound: 'ل', scene: '🧸 غرفة اللعب', sceneEmojis: ['🧸','🎨','🪀','🎈','🪁'], items: [
    { icon: '🍋', word: 'ليمون', correct: true }, { icon: '🥛', word: 'لبن', correct: true },
    { icon: '🧸', word: 'لعبة', correct: true }, { icon: '👅', word: 'لسان', correct: true },
    { icon: '🌙', word: 'ليل', correct: true }, { icon: '🐪', word: 'جمل', correct: false },
    { icon: '🐏', word: 'خروف', correct: false }, { icon: '🌹', word: 'وردة', correct: false },
  ]},
  { sound: 'ن', scene: '🌌 السماء', sceneEmojis: ['⭐','☁️','🌙','🪐','🌈'], items: [
    { icon: '⭐', word: 'نجم', correct: true }, { icon: '🐝', word: 'نحلة', correct: true },
    { icon: '🔥', word: 'نار', correct: true }, { icon: '🪟', word: 'نافذة', correct: true },
    { icon: '🐪', word: 'نعامة', correct: true }, { icon: '🍌', word: 'موز', correct: false },
    { icon: '🚪', word: 'باب', correct: false }, { icon: '🐻', word: 'دب', correct: false },
  ]},
  { sound: 'ك', scene: '📖 المَكتبة', sceneEmojis: ['📚','📖','🪑','💡','🗄️'], items: [
    { icon: '📖', word: 'كتاب', correct: true }, { icon: '⚽', word: 'كرة', correct: true },
    { icon: '🪑', word: 'كرسي', correct: true }, { icon: '🐕', word: 'كلب', correct: true },
    { icon: '☕', word: 'كوب', correct: true }, { icon: '🐈', word: 'قطة', correct: false },
    { icon: '🖊️', word: 'قلم', correct: false }, { icon: '🍰', word: 'كعكة', correct: true },
  ]},
  { sound: 'ت', scene: '🎉 حفلة العيد', sceneEmojis: ['🎈','🎁','🍬','🥳','🎊'], items: [
    { icon: '🍎', word: 'تفاح', correct: true }, { icon: '🐊', word: 'تمساح', correct: true },
    { icon: '🍇', word: 'تين', correct: true }, { icon: '👑', word: 'تاج', correct: true },
    { icon: '🌴', word: 'نخلة', correct: false }, { icon: '🍬', word: 'حلوى', correct: false },
    { icon: '🥭', word: 'مانجو', correct: false }, { icon: '🌵', word: 'صبار', correct: false },
  ]},
];

function generatePage(p, idx) {
  const num = String(idx + 1).padStart(2, '0');
  const correctItems = p.items.filter(i => i.correct).map(i => i.word).join('، ');
  const page = `<!DOCTYPE html>
<html dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>رحلة الأصوات العربية - صفحة ${num}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;700;900&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    background: #f0ebe3;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    font-family: 'Noto Sans Arabic', sans-serif;
    padding: 40px;
  }
  .page {
    width: 595px; height: 842px;
    background: #fff;
    position: relative;
    overflow: hidden;
    box-shadow: 0 10px 50px rgba(0,0,0,0.15);
    border-radius: 8px;
  }
  .top-bar {
    background: linear-gradient(135deg, #2d8a4e, #1a6b3c);
    padding: 12px 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #fff;
  }
  .top-bar .title { font-size: 18px; font-weight: 900; letter-spacing: 1px; }
  .top-bar .page-num {
    background: rgba(255,255,255,0.2);
    padding: 4px 16px; border-radius: 20px;
    font-size: 14px; font-weight: 700;
  }
  .top-bar .sound-tag {
    background: #ffd700; color: #1a6b3c;
    padding: 4px 16px; border-radius: 20px;
    font-size: 14px; font-weight: 900;
  }
  .sidebar {
    position: absolute; right: 0; top: 56px; bottom: 0; width: 50px;
    background: linear-gradient(180deg, #2d8a4e, #1a6b3c);
    display: flex; flex-direction: column; align-items: center;
    padding-top: 20px; gap: 12px;
  }
  .sidebar .dot { width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,0.3); }
  .sidebar .dot.active { background: #ffd700; box-shadow: 0 0 8px rgba(255,215,0,0.6); }
  .content { margin-right: 50px; padding: 20px 24px 20px 20px; }
  .header { text-align: center; margin-bottom: 16px; }
  .header .target-sound {
    display: inline-block; background: #ffd700; color: #1a6b3c;
    font-size: 32px; font-weight: 900; width: 56px; height: 56px;
    line-height: 56px; text-align: center; border-radius: 50%;
    margin-bottom: 6px; box-shadow: 0 4px 12px rgba(255,215,0,0.4);
  }
  .header .instruction { font-size: 16px; font-weight: 700; color: #333; line-height: 1.5; }
  .header .instruction span { color: #2d8a4e; font-weight: 900; font-size: 18px; }
  .scene {
    width: 100%; height: 220px; border-radius: 16px; overflow: hidden;
    position: relative; margin-bottom: 16px;
    background: #e8f5e9; border: 3px solid #2d8a4e;
  }
  .scene-bg {
    width: 100%; height: 100%;
    display: flex; align-items: flex-end; justify-content: center;
    padding: 10px;
  }
  .scene-bg .emoji { font-size: 40px; opacity: 0.7; }
  .scene-label {
    position: absolute; bottom: 10px; right: 10px;
    background: rgba(26,107,60,0.9); color: #fff;
    padding: 6px 16px; border-radius: 10px;
    font-size: 14px; font-weight: 800; backdrop-filter: blur(4px);
  }
  .items-grid {
    display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 10px; margin-bottom: 12px;
  }
  .item-card {
    aspect-ratio: 1; border-radius: 14px;
    border: 2.5px dashed #ccc; background: #fafafa;
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; padding: 8px; position: relative;
  }
  .item-card.correct { border: 3px solid #2d8a4e; background: #e8f5e9; }
  .item-card.wrong { border: 2.5px dashed #ccc; background: #fafafa; }
  .item-card .icon { font-size: 36px; line-height: 1; margin-bottom: 4px; }
  .item-card .word { font-size: 13px; font-weight: 700; color: #333; }
  .item-card .check {
    position: absolute; top: -6px; left: -6px;
    width: 24px; height: 24px; border-radius: 50%;
    font-size: 14px; line-height: 24px; text-align: center;
  }
  .item-card.correct .check { background: #2d8a4e; color: #fff; display: block; }
  .bottom-bar {
    background: #f5f0eb; border-radius: 12px;
    padding: 10px 16px; display: flex;
    justify-content: space-between; align-items: center;
  }
  .bottom-bar .goal { font-size: 11px; color: #666; font-weight: 600; }
  .bottom-bar .goal span { color: #2d8a4e; font-weight: 800; }
  .bottom-bar .stars { color: #ffd700; font-size: 18px; letter-spacing: 2px; }
  .bottom-bar .stars .empty { color: #ddd; }
  .footer { text-align: center; margin-top: 20px; font-size: 11px; color: #aaa; font-weight: 600; }
</style>
</head>
<body>
<div class="page">
  <div class="top-bar">
    <div class="title">📘 رحلة الأصوات العربية</div>
    <div class="sound-tag">🎯 صوت /${p.sound}/</div>
    <div class="page-num">${num} / ٦٠</div>
  </div>
  <div class="sidebar">
    ${Array.from({length: 10}, (_, i) =>
      `<div class="dot${i === Math.floor(idx / 6) ? ' active' : ''}"></div>`
    ).join('')}
  </div>
  <div class="content">
    <div class="header">
      <div class="target-sound">${p.sound}</div>
      <div class="instruction">
        ${p.scene.split(' ')[0]} <span>${p.scene}</span> — اختر الكلمات التي تبدأ بصوت <span>${p.sound}</span>
      </div>
    </div>
    <div class="scene">
      <div class="scene-bg" style="background: linear-gradient(135deg, #c8e6c9, #a5d6a7);">
        ${p.sceneEmojis.map(e => `<span class="emoji">${e}</span>`).join('')}
      </div>
      <div class="scene-label">${p.scene}</div>
    </div>
    <div class="items-grid">
      ${p.items.map(item =>
        `<div class="item-card ${item.correct ? 'correct' : 'wrong'}">
          <div class="check">${item.correct ? '✓' : ''}</div>
          <div class="icon">${item.icon}</div>
          <div class="word">${item.word}</div>
        </div>`
      ).join('')}
    </div>
    <div class="bottom-bar">
      <div class="goal">
        🎯 الهدف: <span>تمييز صوت /${p.sound}/ في أول الكلمة</span><br>
        📊 المستوى: <span>مبتدئ</span>
      </div>
      <div class="stars">
        ${Array.from({length: 5}, (_, i) =>
          `<span${i >= 3 ? ' class="empty"' : ''}>★</span>`
        ).join('')}
      </div>
    </div>
    <div class="footer">⭐ أتعالج في البيت — برنامج النطق العربي المصوّر ⭐</div>
  </div>
</div>
</body>
</html>`;
  return page;
}

// Generate all pages
const outDir = '../public/pages-otolaryngology';
mkdirSync(outDir, { recursive: true });

PAGES.forEach((p, i) => {
  const num = String(i + 1).padStart(2, '0');
  const html = generatePage(p, i);
  writeFileSync(`${outDir}/page-${num}-sound-${p.sound}.html`, html);
  console.log(`✅ Page ${num}/10 — صوت /${p.sound}/`);
});

// Also generate an index page
const indexHtml = `<!DOCTYPE html>
<html dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>رحلة الأصوات العربية - فهرس</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;700;900&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    background: #f0ebe3;
    font-family: 'Noto Sans Arabic', sans-serif;
    padding: 40px;
    direction: rtl;
  }
  h1 { text-align: center; color: #1a6b3c; font-size: 28px; margin-bottom: 8px; }
  .sub { text-align: center; color: #666; margin-bottom: 30px; font-size: 16px; }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 16px;
    max-width: 900px;
    margin: 0 auto;
  }
  .card {
    background: #fff;
    border-radius: 16px;
    padding: 20px;
    text-align: center;
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    text-decoration: none;
    color: inherit;
    transition: transform 0.2s;
    border: 2px solid transparent;
  }
  .card:hover { transform: translateY(-4px); border-color: #2d8a4e; }
  .card .sound {
    display: inline-block;
    background: #ffd700;
    color: #1a6b3c;
    font-size: 28px;
    font-weight: 900;
    width: 50px; height: 50px;
    line-height: 50px;
    border-radius: 50%;
    margin-bottom: 8px;
  }
  .card .scene { color: #666; font-size: 14px; }
  .card .page-link {
    display: inline-block;
    margin-top: 10px;
    padding: 6px 20px;
    background: #2d8a4e;
    color: #fff;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 700;
  }
</style>
</head>
<body>
  <h1>📘 رحلة الأصوات العربية</h1>
  <div class="sub">الجزء 1 — تدريب الأصوات في أول الكلمة (10 صفحات)</div>
  <div class="grid">
    ${PAGES.map((p, i) => {
      const num = String(i + 1).padStart(2, '0');
      return `<a href="page-${num}-sound-${p.sound}.html" class="card">
        <div class="sound">${p.sound}</div>
        <div style="font-weight:800;font-size:18px;">صوت /${p.sound}/</div>
        <div class="scene">${p.scene}</div>
        <div class="page-link">عرض الصفحة ${num}</div>
      </a>`;
    }).join('')}
  </div>
</body>
</html>`;
writeFileSync(`${outDir}/index.html`, indexHtml);
console.log('✅ Index page created');
console.log('✅ Done! All pages generated in pages-otolaryngology/');
