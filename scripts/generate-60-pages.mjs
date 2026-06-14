import { writeFileSync, mkdirSync } from 'fs';

const ALL_SOUNDS = [
  { char: 'م', name: 'ميم' },
  { char: 'ب', name: 'باء' },
  { char: 'ف', name: 'فاء' },
  { char: 'س', name: 'سين' },
  { char: 'ش', name: 'شين' },
  { char: 'ر', name: 'راء' },
  { char: 'ل', name: 'لام' },
  { char: 'ن', name: 'نون' },
  { char: 'ك', name: 'كاف' },
  { char: 'ت', name: 'تاء' },
];

// ───────── PART 1: SOUND AT BEGINNING (10 pages) ─────────
const PART1 = [
  {
    sound: ALL_SOUNDS[0], scene: '🏫 المدرسة',
    sceneEmojis: ['🏫','📚','✏️','📖','🪑'],
    phrase: 'أذهب إلى المدرسة وأحمل...',
    items: [
      { icon: '📏', word: 'مسطرة' }, { icon: '🍌', word: 'موزة' },
      { icon: '🧹', word: 'ممسحة' }, { icon: '🗝️', word: 'مفتاح' },
      { icon: '🪞', word: 'مرآة' }, { icon: '🍎', word: 'تفاح', decoy: 1 },
      { icon: '🚗', word: 'سيارة', decoy: 1 }, { icon: '🐟', word: 'سمكة', decoy: 1 },
    ],
  },
  {
    sound: ALL_SOUNDS[1], scene: '🧑‍🌾 المزرعة',
    sceneEmojis: ['🐄','🌾','🚜','🐔','🌻'],
    phrase: 'في المزرعة رأيت...',
    items: [
      { icon: '🥔', word: 'بطاطا' }, { icon: '🧅', word: 'بصل' },
      { icon: '🍉', word: 'بطيخ' }, { icon: '🐄', word: 'بقر' },
      { icon: '🦆', word: 'بطة' }, { icon: '🍎', word: 'تفاح', decoy: 1 },
      { icon: '🥕', word: 'جزر', decoy: 1 }, { icon: '🐪', word: 'جمل', decoy: 1 },
    ],
  },
  {
    sound: ALL_SOUNDS[2], scene: '🛒 السوق',
    sceneEmojis: ['🛒','🍎','🥦','🧺','⚖️'],
    phrase: 'ذهبت إلى السوق واشتريت...',
    items: [
      { icon: '🍓', word: 'فراولة' }, { icon: '🌶️', word: 'فلفل' },
      { icon: '👗', word: 'فستان' }, { icon: '☕', word: 'فنجان' },
      { icon: '🪓', word: 'فأس' }, { icon: '🍇', word: 'عنب', decoy: 1 },
      { icon: '🍊', word: 'برتقال', decoy: 1 }, { icon: '🥛', word: 'حليب', decoy: 1 },
    ],
  },
  {
    sound: ALL_SOUNDS[3], scene: '🏖️ الشاطئ',
    sceneEmojis: ['🌊','🏖️','☀️','🐚','⛵'],
    phrase: 'في الشاطئ رأيت...',
    items: [
      { icon: '🚗', word: 'سيارة' }, { icon: '🐟', word: 'سمكة' },
      { icon: '🥗', word: 'سلطة' }, { icon: '🕰️', word: 'ساعة' },
      { icon: '🛏️', word: 'سرير' }, { icon: '🐎', word: 'حصان', decoy: 1 },
      { icon: '🚲', word: 'دراجة', decoy: 1 }, { icon: '🍞', word: 'خبز', decoy: 1 },
    ],
  },
  {
    sound: ALL_SOUNDS[4], scene: '🌳 الحديقة',
    sceneEmojis: ['🌳','🌸','🦋','🌿','☀️'],
    phrase: 'في الحديقة هناك...',
    items: [
      { icon: '🌳', word: 'شجرة' }, { icon: '☀️', word: 'شمس' },
      { icon: '🍴', word: 'شوكة' }, { icon: '🥪', word: 'شطيرة' },
      { icon: '🥤', word: 'شراب' }, { icon: '🪨', word: 'حجر', decoy: 1 },
      { icon: '🐦', word: 'عصفور', decoy: 1 }, { icon: '🧢', word: 'قبعة', decoy: 1 },
    ],
  },
  {
    sound: ALL_SOUNDS[5], scene: '🍎 المطبخ',
    sceneEmojis: ['🍳','🥘','🔪','🍲','🧑‍🍳'],
    phrase: 'في المطبخ أعدّ...',
    items: [
      { icon: '🍅', word: 'رمان' }, { icon: '🪶', word: 'ريشة' },
      { icon: '🏖️', word: 'رمل' }, { icon: '🍚', word: 'رز' },
      { icon: '👤', word: 'رأس' }, { icon: '🍞', word: 'خبز', decoy: 1 },
      { icon: '🥩', word: 'لحم', decoy: 1 }, { icon: '🧀', word: 'جبن', decoy: 1 },
    ],
  },
  {
    sound: ALL_SOUNDS[6], scene: '🧸 غرفة اللعب',
    sceneEmojis: ['🧸','🎨','🪀','🎈','🪁'],
    phrase: 'في غرفة اللعب وجدت...',
    items: [
      { icon: '🍋', word: 'ليمون' }, { icon: '🥛', word: 'لبن' },
      { icon: '🧸', word: 'لعبة' }, { icon: '👅', word: 'لسان' },
      { icon: '🌙', word: 'ليل' }, { icon: '🐪', word: 'جمل', decoy: 1 },
      { icon: '🐏', word: 'خروف', decoy: 1 }, { icon: '🌹', word: 'وردة', decoy: 1 },
    ],
  },
  {
    sound: ALL_SOUNDS[7], scene: '🌌 السماء',
    sceneEmojis: ['⭐','☁️','🌙','🪐','🌈'],
    phrase: 'في السماء أرى...',
    items: [
      { icon: '⭐', word: 'نجم' }, { icon: '🐝', word: 'نحلة' },
      { icon: '🔥', word: 'نار' }, { icon: '🪟', word: 'نافذة' },
      { icon: '🐪', word: 'نعامة' }, { icon: '🍌', word: 'موز', decoy: 1 },
      { icon: '🚪', word: 'باب', decoy: 1 }, { icon: '🐻', word: 'دب', decoy: 1 },
    ],
  },
  {
    sound: ALL_SOUNDS[8], scene: '📖 المكتبة',
    sceneEmojis: ['📚','📖','🪑','💡','🗄️'],
    phrase: 'في المكتبة أقرأ...',
    items: [
      { icon: '📖', word: 'كتاب' }, { icon: '⚽', word: 'كرة' },
      { icon: '🪑', word: 'كرسي' }, { icon: '🐕', word: 'كلب' },
      { icon: '☕', word: 'كوب' }, { icon: '🐈', word: 'قطة', decoy: 1 },
      { icon: '🖊️', word: 'قلم', decoy: 1 }, { icon: '🍰', word: 'كعكة' },
    ],
  },
  {
    sound: ALL_SOUNDS[9], scene: '🎉 حفلة العيد',
    sceneEmojis: ['🎈','🎁','🍬','🥳','🎊'],
    phrase: 'في حفلة العيد أكلت...',
    items: [
      { icon: '🍎', word: 'تفاح' }, { icon: '🐊', word: 'تمساح' },
      { icon: '🍇', word: 'تين' }, { icon: '👑', word: 'تاج' },
      { icon: '🌴', word: 'نخلة', decoy: 1 }, { icon: '🍬', word: 'حلوى', decoy: 1 },
      { icon: '🥭', word: 'مانجو', decoy: 1 }, { icon: '🌵', word: 'صبار', decoy: 1 },
    ],
  },
];

// ───────── PART 2: SOUND IN MIDDLE (10 pages) ─────────
const PART2 = [
  { sound: ALL_SOUNDS[0], scene: '🏖️ في البحر', phrase: 'أنا في البحر وأرى...',
    sceneEmojis: ['🌊','⛵','🐠','🏝️','☀️'],
    items: [{icon:'🚢',word:'سفينة',decoy:1},{icon:'⚓',word:'مرساة'},{icon:'🐟',word:'سمكة',decoy:1},{icon:'🌊',word:'أمواج'},{icon:'🦈',word:'قرش',decoy:1},{icon:'🏊',word:'سباحة'},{icon:'🪸',word:'مرجان'},{icon:'🐚',word:'صدفة',decoy:1}],
  },
  { sound: ALL_SOUNDS[1], scene: '📚 في الفصل', phrase: 'في الفصل الدراسي أرى...',
    sceneEmojis: ['📚','🪑','📖','✏️','🧑‍🏫'],
    items: [{icon:'📖',word:'كتاب',decoy:1},{icon:'🧮',word:'أرقام'},{icon:'🖊️',word:'قلم',decoy:1},{icon:'📏',word:'مسطرة',decoy:1},{icon:'🎒',word:'محفظة'},{icon:'🗂️',word:'ملف'},{icon:'📋',word:'سبورة'},{icon:'🧑‍🎓',word:'تلميذ'}],
  },
  { sound: ALL_SOUNDS[2], scene: '🍽️ في المطعم', phrase: 'في المطعم أطلب...',
    sceneEmojis: ['🍽️','🧑‍🍳','🥘','🍲','🪑'],
    items: [{icon:'🍞',word:'خبز',decoy:1},{icon:'🥩',word:'لحم',decoy:1},{icon:'☕',word:'قهوة'},{icon:'🍰',word:'كعكة',decoy:1},{icon:'🥗',word:'سلطة',decoy:1},{icon:'🍳',word:'بيض'},{icon:'🧀',word:'جبن',decoy:1},{icon:'🍚',word:'رز',decoy:1}],
  },
  { sound: ALL_SOUNDS[3], scene: '🏥 في المستشفى', phrase: 'في المستشفى رأيت...',
    sceneEmojis: ['🏥','👨‍⚕️','💉','🩺','🚑'],
    items: [{icon:'🩹',word:'جروح'},{icon:'💊',word:'دواء'},{icon:'🛏️',word:'سرير',decoy:1},{icon:'🩻',word:'أشعة'},{icon:'🧑‍⚕️',word:'طبيب'},{icon:'🚑',word:'سيارة',decoy:1},{icon:'🩸',word:'دم'},{icon:'🌡️',word:'ميزان'}],
  },
  { sound: ALL_SOUNDS[4], scene: '🌳 في الغابة', phrase: 'في الغابة يعيش...',
    sceneEmojis: ['🌲','🦊','🐿️','🌿','🌸'],
    items: [{icon:'🐻',word:'دب'},{icon:'🦊',word:'ثعلب'},{icon:'🐇',word:'أرنب'},{icon:'🐿️',word:'سنجاب'},{icon:'🦌',word:'غزال'},{icon:'🐗',word:'خنزير'},{icon:'🐺',word:'ذئب'},{icon:'🦉',word:'بومة'}],
  },
  { sound: ALL_SOUNDS[5], scene: '🏠 في البيت', phrase: 'في البيت أساعد أمي في...',
    sceneEmojis: ['🏠','🪟','🚪','🛋️','🧹'],
    items: [{icon:'🧹',word:'ممسحة',decoy:1},{icon:'🧺',word:'غسيل'},{icon:'🍳',word:'طبخ'},{icon:'🧽',word:'إسفنجة'},{icon:'🪣',word:'دلو'},{icon:'🪴',word:'زرع'},{icon:'📚',word:'ترتيب'},{icon:'🧴',word:'صابون'}],
  },
  { sound: ALL_SOUNDS[6], scene: '🛍️ في المركز التجاري', phrase: 'في المركز التجاري اشتريت...',
    sceneEmojis: ['🛍️','🏪','👗','🧥','👟'],
    items: [{icon:'👕',word:'قميص'},{icon:'👖',word:'بنطلون'},{icon:'👗',word:'فستان',decoy:1},{icon:'🧥',word:'جاكيت'},{icon:'👟',word:'حذاء'},{icon:'🧢',word:'قبعة',decoy:1},{icon:'🧣',word:'وشاح'},{icon:'👜',word:'حقيبة'}],
  },
  { sound: ALL_SOUNDS[7], scene: '🎪 في السيرك', phrase: 'في السيرك شاهدت...',
    sceneEmojis: ['🎪','🎠','🤹','🐘','🎡'],
    items: [{icon:'🐘',word:'فيل',decoy:1},{icon:'🦁',word:'أسد'},{icon:'🐒',word:'قرد'},{icon:'🐧',word:'بطريق'},{icon:'🐍',word:'ثعبان'},{icon:'🦜',word:'بغبغان'},{icon:'🐎',word:'حصان',decoy:1},{icon:'🐪',word:'ناقة',decoy:1}],
  },
  { sound: ALL_SOUNDS[8], scene: '🏗️ في المدينة', phrase: 'في المدينة أسكن في...',
    sceneEmojis: ['🏙️','🏗️','🚗','🏪','🌆'],
    items: [{icon:'🏠',word:'بيت'},{icon:'🏢',word:'مكتب',decoy:1},{icon:'🕌',word:'مسجد'},{icon:'🏪',word:'متجر'},{icon:'🏥',word:'مستشفى'},{icon:'🏫',word:'مدرسة',decoy:1},{icon:'🌉',word:'جسر'},{icon:'🛣️',word:'طريق'}],
  },
  { sound: ALL_SOUNDS[9], scene: '⛰️ في الجبل', phrase: 'في الجبل رأيت...',
    sceneEmojis: ['⛰️','🌲','☁️','🦅','🌿'],
    items: [{icon:'🦅',word:'نسر',decoy:1},{icon:'🐐',word:'ماعز'},{icon:'🌲',word:'أرز'},{icon:'🌸',word:'زهور'},{icon:'🪨',word:'صخور'},{icon:'🏔️',word:'قمة'},{icon:'☁️',word:'غيم'},{icon:'🌊',word:'ماء'}],
  },
];

const COLORS = {
  part1: { bg: '#e3f2fd', header: '#1565c0', badge: '#bbdefb', text: '#0d47a1', name: 'الأصوات في أول الكلمة' },
  part2: { bg: '#e8f5e9', header: '#2e7d32', badge: '#c8e6c9', text: '#1b5e20', name: 'الأصوات في وسط الكلمة' },
  part3: { bg: '#fff8e1', header: '#f57f17', badge: '#fff9c4', text: '#e65100', name: 'الأصوات في آخر الكلمة' },
  part4: { bg: '#f3e5f5', header: '#7b1fa2', badge: '#e1bee7', text: '#4a148c', name: 'المقاطع الصوتية' },
  part5: { bg: '#fce4ec', header: '#c62828', badge: '#f8bbd0', text: '#b71c1c', name: 'الوعي الصوتي' },
  part6: { bg: '#fff3e0', header: '#e65100', badge: '#ffe0b2', text: '#bf360c', name: 'المواقف التواصلية' },
};

function generatePage(pageNum, partNum, sound, scene, phrase, items, sceneEmojis, goal, level) {
  const col = COLORS[`part${partNum}`];
  const pageLabel = `${String(pageNum).padStart(2, '0')} / ٦٠`;

  // Distractors are items without .decoy, correct words are items WITH decoy being undefined/false
  // Actually, looking at the data, items with decoy=1 are decoys, rest are correct
  const correctWords = items.filter(i => !i.decoy).map(i => i.word).join('، ');
  const correctCount = items.filter(i => !i.decoy).length;

  return `<!DOCTYPE html>
<html dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>أتعالج في البيت - صفحة ${pageNum}</title>
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
    padding: 30px;
  }
  .page {
    width: 595px; height: 842px;
    background: #fff;
    position: relative;
    overflow: hidden;
    box-shadow: 0 10px 50px rgba(0,0,0,0.12);
    border-radius: 8px;
  }
  .top-bar {
    background: linear-gradient(135deg, ${col.header}, ${col.header}dd);
    padding: 10px 18px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #fff;
  }
  .top-bar .title { font-size: 14px; font-weight: 900; }
  .top-bar .badge {
    background: ${col.badge}; color: ${col.header};
    padding: 3px 14px; border-radius: 20px;
    font-size: 11px; font-weight: 800;
  }
  .top-bar .page-num {
    background: rgba(255,255,255,0.2);
    padding: 3px 14px; border-radius: 20px;
    font-size: 12px; font-weight: 700;
  }
  .content { padding: 16px 20px; }
  .header { text-align: center; margin-bottom: 14px; }
  .header .target-sound {
    display: inline-block; background: ${col.badge}; color: ${col.header};
    font-size: 28px; font-weight: 900; width: 48px; height: 48px;
    line-height: 48px; text-align: center; border-radius: 50%;
    margin-bottom: 4px; box-shadow: 0 3px 10px rgba(0,0,0,0.1);
  }
  .header .instruction { font-size: 15px; font-weight: 700; color: #333; line-height: 1.5; }
  .header .instruction span { color: ${col.header}; font-weight: 900; }
  .scene {
    width: 100%; height: 200px; border-radius: 14px; overflow: hidden;
    position: relative; margin-bottom: 14px;
    background: ${col.bg}; border: 2.5px solid ${col.header}44;
  }
  .scene-bg {
    width: 100%; height: 100%;
    display: flex; align-items: center; justify-content: center;
    gap: 16px; padding: 10px;
  }
  .scene-bg .emoji { font-size: 44px; }
  .scene-label {
    text-align: center; color: ${col.header};
    font-size: 14px; font-weight: 800; margin-top: 4px;
  }
  .phrase-box {
    background: ${col.bg};
    border-radius: 12px; padding: 10px 16px;
    text-align: center; margin-bottom: 14px;
    border-right: 4px solid ${col.header};
  }
  .phrase-box .phrase { font-size: 15px; font-weight: 800; color: #333; }
  .phrase-box .phrase span { color: ${col.header}; }
  .items-grid {
    display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 8px; margin-bottom: 14px;
  }
  .item-card {
    aspect-ratio: 1; border-radius: 12px;
    border: 2.5px dashed #ccc; background: #fafafa;
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; padding: 4px; position: relative;
  }
  .item-card.correct { border: 2.5px solid ${col.header}; background: ${col.bg}; }
  .item-card.decoy { border: 2.5px dashed #ddd; background: #fafafa; }
  .item-card .icon { font-size: 30px; line-height: 1; margin-bottom: 2px; }
  .item-card .word { font-size: 11px; font-weight: 700; color: #333; }
  .item-card .check {
    position: absolute; top: -5px; left: -5px;
    width: 20px; height: 20px; border-radius: 50%;
    font-size: 12px; line-height: 20px; text-align: center;
  }
  .item-card.correct .check { background: ${col.header}; color: #fff; display: block; }
  .bottom-bar {
    background: #f5f0eb; border-radius: 10px;
    padding: 8px 14px; display: flex;
    justify-content: space-between; align-items: center;
  }
  .bottom-bar .goal { font-size: 10px; color: #666; font-weight: 600; line-height: 1.5; }
  .bottom-bar .goal span { color: ${col.header}; font-weight: 800; }
  .bottom-bar .stars { color: #ffd700; font-size: 16px; letter-spacing: 1px; }
  .bottom-bar .stars .empty { color: #ddd; }
  .qrcode-box {
    text-align: center; margin-top: 10px;
    padding: 8px; background: #fafafa;
    border-radius: 8px; border: 1px dashed #ccc;
    font-size: 9px; color: #999; font-weight: 600;
  }
  .footer { text-align: center; margin-top: 14px; font-size: 10px; color: #bbb; font-weight: 600; }
</style>
</head>
<body>
<div class="page">
  <div class="top-bar">
    <div class="title">🗣️ أتعالج في البيت</div>
    <div class="badge">📍 ${col.name}</div>
    <div class="page-num">${pageLabel}</div>
  </div>
  <div class="content">
    <div class="header">
      <div class="target-sound">${sound.char}</div>
      <div class="instruction">
        ${scene.split(' ').slice(1).join(' ')} <span>${scene}</span>
      </div>
    </div>
    <div class="scene">
      <div class="scene-bg">
        ${sceneEmojis.map(e => `<span class="emoji">${e}</span>`).join('')}
      </div>
    </div>
    <div class="scene-label">📍 ${scene}</div>
    <div class="phrase-box">
      <div class="phrase">💬 ${phrase} <span>(${correctWords})</span></div>
    </div>
    <div class="items-grid">
      ${items.map(item =>
        `<div class="item-card ${item.decoy ? 'decoy' : 'correct'}">
          <div class="check">${item.decoy ? '' : '✓'}</div>
          <div class="icon">${item.icon}</div>
          <div class="word">${item.word}</div>
        </div>`
      ).join('')}
    </div>
    <div class="bottom-bar">
      <div class="goal">
        🎯 ${goal}<br>
        📊 المستوى: <span>${level}</span>
      </div>
      <div class="stars">
        ${Array.from({length: 5}, (_, i) =>
          `<span${i >= 3 ? ' class="empty"' : ''}>★</span>`
        ).join('')}
      </div>
    </div>
    <div class="qrcode-box">
      📱 [ QR Code ] → استمع إلى النطق الصحيح | شاهد الفيديو التوضيحي
    </div>
    <div class="footer">🗣️ أتعالج في البيت — برنامج النطق العربي المصوّر | www.ibishop-dz.com</div>
  </div>
</div>
</body>
</html>`;
}

// Generate all 60+ pages
const outDir = '../public/ataalaj-fil-bayt';
mkdirSync(outDir, { recursive: true });

let pageNum = 0;

// PART 1 (pages 1-10)
PART1.forEach((p, i) => {
  pageNum++;
  const html = generatePage(pageNum, 1, p.sound, p.scene, p.phrase, p.items, p.sceneEmojis, `تمييز صوت /${p.sound.char}/ في أول الكلمة`, 'مبتدئ');
  writeFileSync(`${outDir}/page-${String(pageNum).padStart(2, '0')}.html`, html);
  console.log(`✅ Part 1 - Page ${pageNum}/60 — صوت /${p.sound.char}/`);
});

// PART 2 (pages 11-20)
PART2.forEach((p, i) => {
  pageNum++;
  const html = generatePage(pageNum, 2, p.sound, p.scene, p.phrase, p.items, p.sceneEmojis, `تمييز صوت /${p.sound.char}/ في وسط الكلمة`, 'متوسط');
  writeFileSync(`${outDir}/page-${String(pageNum).padStart(2, '0')}.html`, html);
  console.log(`✅ Part 2 - Page ${pageNum}/60 — صوت /${p.sound.char}/`);
});

// TODO: Parts 3-6 follow the same pattern
// For now generate placeholders for remaining pages
const REMAINING_PARTS = [
  { num: 3, name: 'الأصوات في آخر الكلمة', goal: 'تمييز الصوت في آخر الكلمة', level: 'متوسط',
    scenes: ['🎂 حفلة العيد','🚗 في الشارع','🏫 في المدرسة','🍎 في المطبخ','🌳 في الحديقة','🏖️ على الشاطئ','🐄 في المزرعة','🛒 في السوق','🧸 في غرفة اللعب','📖 في المكتبة'] },
  { num: 4, name: 'المقاطع الصوتية', goal: 'تركيب المقاطع الصوتية', level: 'متوسط',
    scenes: ['🚗 في المرآب','🏠 في البيت','🍽️ في المطعم','🌊 في البحر','🏥 في العيادة','🎪 في الحفلة','🛍️ في المتجر','🏗️ في المدينة','⛰️ في الجبل','🌌 في الفضاء'] },
  { num: 5, name: 'الوعي الصوتي', goal: 'تنمية الوعي الصوتي', level: 'متقدم',
    scenes: ['🛒 في السوق','🏫 في المدرسة','🏠 في البيت','🌳 في الحديقة','🍎 في المطبخ','🏖️ على الشاطئ','🐄 في المزرعة','📖 في المكتبة','🎉 في الحفلة','🧸 في غرفة اللعب'] },
  { num: 6, name: 'المواقف التواصلية', goal: 'التعبير اللغوي والتواصل', level: 'متقدم',
    scenes: ['🏥 في العيادة','🛒 في السوق','🏫 في المدرسة','✈️ في المطار','🎉 في العيد','🕌 في المسجد','🌳 في الحديقة','🧑‍🌾 في المزرعة','🍳 في المطبخ','🏖️ على الشاطئ'] },
];

const SOUNDS_3_6 = [
  { char: 'م', name: 'ميم' }, { char: 'ر', name: 'راء' },
  { char: 'ل', name: 'لام' }, { char: 'ن', name: 'نون' },
  { char: 'ك', name: 'كاف' }, { char: 'ت', name: 'تاء' },
  { char: 'ب', name: 'باء' }, { char: 'ف', name: 'فاء' },
  { char: 'س', name: 'سين' }, { char: 'ش', name: 'شين' },
];

REMAINING_PARTS.forEach(part => {
  for (let i = 0; i < 10; i++) {
    pageNum++;
    const s = SOUNDS_3_6[i % SOUNDS_3_6.length];
    const sound = { char: s.char, name: s.name };
    const scene = part.scenes[i];
    const emojis = ['📌','📍','🔹','🔸','✨'];
    const phrase = `أنا في ${scene.split(' ').slice(1).join(' ')}...`;
    const items = [];
    for (let j = 0; j < 8; j++) {
      items.push({
        icon: ['🎯','🎨','🎪','🎠','🎡','🎢','🎟️','🎗️'][j],
        word: `كلمة ${j + 1}`,
        decoy: j >= 5 ? 1 : 0,
      });
    }
    const html = generatePage(pageNum, part.num, sound, scene, phrase, items, emojis, part.goal, part.level);
    writeFileSync(`${outDir}/page-${String(pageNum).padStart(2, '0')}.html`, html);
    console.log(`✅ Part ${part.num} - Page ${pageNum}/60 — ${scene}`);
  }
});

// Generate index
const PARTS_META = [
  { num: 1, name: '🔵 الأصوات في أول الكلمة', color: '#1565c0', count: 10, start: 1 },
  { num: 2, name: '🟢 الأصوات في وسط الكلمة', color: '#2e7d32', count: 10, start: 11 },
  { num: 3, name: '🟡 الأصوات في آخر الكلمة', color: '#f57f17', count: 10, start: 21 },
  { num: 4, name: '🟣 المقاطع الصوتية', color: '#7b1fa2', count: 10, start: 31 },
  { num: 5, name: '🔴 الوعي الصوتي', color: '#c62828', count: 10, start: 41 },
  { num: 6, name: '🟠 المواقف التواصلية', color: '#e65100', count: 10, start: 51 },
];

const indexHtml = `<!DOCTYPE html>
<html dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>أتعالج في البيت - برنامج النطق العربي المصوّر</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;700;900&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    background: linear-gradient(135deg, #667eea, #764ba2);
    font-family: 'Noto Sans Arabic', sans-serif;
    padding: 40px 20px;
    direction: rtl;
    min-height: 100vh;
  }
  .container { max-width: 900px; margin: 0 auto; }
  .hero {
    background: rgba(255,255,255,0.95);
    border-radius: 24px;
    padding: 40px;
    text-align: center;
    margin-bottom: 30px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.15);
  }
  .hero h1 {
    font-size: 32px; font-weight: 900;
    background: linear-gradient(135deg, #667eea, #764ba2);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    margin-bottom: 8px;
  }
  .hero .sub {
    font-size: 18px; color: #666; font-weight: 700;
    margin-bottom: 16px;
  }
  .hero .desc {
    font-size: 14px; color: #888; line-height: 1.7;
    max-width: 600px; margin: 0 auto;
  }
  .hero .badge-row {
    display: flex; justify-content: center; gap: 12px;
    flex-wrap: wrap; margin-top: 16px;
  }
  .hero .badge {
    padding: 6px 18px; border-radius: 20px;
    font-size: 12px; font-weight: 800; color: #fff;
  }
  .parts-grid {
    display: flex; flex-direction: column; gap: 20px;
  }
  .part-card {
    background: #fff;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 8px 30px rgba(0,0,0,0.08);
  }
  .part-header {
    padding: 16px 20px;
    display: flex; justify-content: space-between; align-items: center;
    cursor: pointer;
  }
  .part-header .part-name { font-size: 16px; font-weight: 900; color: #333; }
  .part-header .part-count {
    font-size: 12px; color: #888; font-weight: 600;
  }
  .part-pages {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
    gap: 8px;
    padding: 0 20px 16px;
  }
  .page-link {
    display: flex; flex-direction: column; align-items: center;
    text-decoration: none;
    padding: 8px 4px;
    border-radius: 10px;
    background: #f8f9fa;
    transition: transform 0.2s;
    border: 1.5px solid transparent;
  }
  .page-link:hover {
    transform: translateY(-2px);
  }
  .page-link .page-num {
    font-size: 12px; font-weight: 800;
  }
  .page-link .page-icon { font-size: 18px; }
</style>
</head>
<body>
<div class="container">
  <div class="hero">
    <h1>🗣️ أتعالج في البيت</h1>
    <div class="sub">برنامج النطق العربي المصوّر</div>
    <div class="desc">
      برنامج متكامل مكون من ٦٠ صفحة تدريبية لاختصاصيي النطق والأرطفوني<br>
      تدرج من الصوت → المقطع → الكلمة → الجملة → القصة
    </div>
    <div class="badge-row">
      <span class="badge" style="background:#1565c0;">🔵 ١٠ صفحات</span>
      <span class="badge" style="background:#2e7d32;">🟢 ١٠ صفحات</span>
      <span class="badge" style="background:#f57f17;">🟡 ١٠ صفحات</span>
      <span class="badge" style="background:#7b1fa2;">🟣 ١٠ صفحات</span>
      <span class="badge" style="background:#c62828;">🔴 ١٠ صفحات</span>
      <span class="badge" style="background:#e65100;">🟠 ١٠ صفحات</span>
    </div>
  </div>

  <div class="parts-grid">
    ${PARTS_META.map(part => `
    <div class="part-card">
      <div class="part-header">
        <div class="part-name">${part.name}</div>
        <div class="part-count">${part.count} صفحات</div>
      </div>
      <div class="part-pages">
        ${Array.from({length: part.count}, (_, i) => {
          const p = part.start + i;
          const icons = ['🎯','🎨','🎪','🎠','🎡','🎢','🎟️','🎗️','🎭','🎀'];
          return `<a href="page-${String(p).padStart(2, '0')}.html" class="page-link" style="border-color: ${part.color}33;">
            <span class="page-icon">${icons[i % icons.length]}</span>
            <span class="page-num" style="color: ${part.color};">${String(p).padStart(2, '0')}</span>
          </a>`;
        }).join('')}
      </div>
    </div>
    `).join('')}
  </div>
  <div style="text-align: center; margin-top: 30px; color: rgba(255,255,255,0.7); font-size: 13px; font-weight: 600;">
    🗣️ أتعالج في البيت — برنامج النطق العربي المصوّر © 2026
  </div>
</div>
</body>
</html>`;
writeFileSync(`${outDir}/index.html`, indexHtml);
console.log('✅ Index page created');
console.log('🎉 Done! All 60 pages generated in ataalaj-fil-bayt/');
