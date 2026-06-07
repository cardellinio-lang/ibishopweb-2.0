#!/usr/bin/env python3
"""
Generate A4 planches for speech therapy cards — ready for printing.
Each A4 sheet (210×297mm / 2480×3508px @300dpi) contains 9 cards (3×3)
with crop marks.
"""

import os, sys, json, time, urllib.request, urllib.parse
from PIL import Image, ImageDraw, ImageFont
import arabic_reshaper
from bidi.algorithm import get_display

OUTPUT_DIR = os.path.expanduser("~/Desktop/cartes_orthophonie")
FONT_PATH = "/Users/traddax/Library/Fonts/Hacen-Tunisia-Bold.ttf"
CACHE_DIR = os.path.join(OUTPUT_DIR, "_cache")
os.makedirs(CACHE_DIR, exist_ok=True)

PEXELS_KEY = "Sv9bIAOkmJ4dzDx3ZjwddRr7AcdNvrRevIBkgxrgUYqkTnwwfWq6JxYQ"

# A4 at 300 DPI
A4_W, A4_H = 2480, 3508
# Card size (≈69.5×98.3mm at 300dpi) — fits 3×3 with 10px gaps
CARD_W, CARD_H = 820, 1160
GAP = 10

PLANCHES = [
    # ===== Planche 1: المشاعر والانفعالات (Émotions) =====
    [
        ("طفل يضحك فرحاً", "child laughing joyfully portrait outdoor"),
        ("طفل يبكي بحرقة", "child crying tears sad portrait"),
        ("طفل خائف من الظلام", "scared child dark hiding face"),
        ("طفل غاضب يصرخ", "angry child shouting screaming tantrum"),
        ("طفل متفاجئ ومذهول", "surprised amazed child expression"),
        ("طفل فرحان بهدية", "happy child receiving gift birthday"),
        ("طفل حزين وحيد", "lonely sad child sitting alone"),
        ("طفل فخور بإنجازه", "proud child achievement winning trophy"),
        ("طفل متعب نعسان", "tired sleepy child yawning bed"),
    ],
    # ===== Planche 2: الأفعال اليومية (Actions quotidiennes) =====
    [
        ("طفل يقرأ قصة", "child reading storybook cozy"),
        ("طفل يرسم لوحة", "child painting colorful art canvas"),
        ("طفل يطبخ مع أمه", "child cooking with mother kitchen"),
        ("طفل يرتب سريره", "child making bed tidy room"),
        ("طفل يسقي النباتات", "child watering plants garden"),
        ("طفل يكتب واجباته", "child doing homework writing desk"),
        ("طفل يجهز طعامه", "child preparing sandwich lunch"),
        ("طفل يلعب بالدمى", "child playing with toys dolls"),
        ("طفل ينظف الغرفة", "child cleaning room vacuuming"),
    ],
    # ===== Planche 3: في الطبيعة (Dans la nature) =====
    [
        ("شمس مشرقة في الصباح", "sunrise morning sun rays landscape"),
        ("غروب الشمس على البحر", "sunset over sea ocean horizon"),
        ("شلال جميل في الجبال", "beautiful waterfall mountain forest"),
        ("غابة خضراء كثيفة", "dense green forest trees sunlight"),
        ("أزهار ملونة في الحقل", "colorful wildflowers field meadow"),
        ("جبال مغطاة بالثلوج", "snow covered mountain peak landscape"),
        ("نهر يتدفق بين الصخور", "river stream flowing rocks forest"),
        ("سماء مرصعة بالنجوم", "starry night sky milky way"),
        ("بحر هادئ وأمواج", "calm sea gentle waves beach sand"),
    ],
    # ===== Planche 4: في المجتمع (Dans la société) =====
    [
        ("أطفال يلعبون معاً", "children playing together park happily"),
        ("عائلة تتناول الطعام", "family eating meal together dining"),
        ("طفل يساعد جاره", "child helping elderly neighbor"),
        ("أطفال ينتظرون الحافلة", "children waiting school bus morning"),
        ("طفل يتسوق مع أمه", "child shopping supermarket mother cart"),
        ("أطفال في حفلة عيد", "children birthday party celebration"),
        ("طفل يصافح صديقه", "child shaking hands friend greeting"),
        ("جدة تحتضن أحفادها", "grandmother hugging grandchildren love"),
        ("طفل يتبرع بالطعام", "child donating food charity helping"),
    ],
    # ===== Planche 5: في المدرسة (À l'école) =====
    [
        ("فصل دراسي منظم", "organized classroom desks chairs bright"),
        ("معلمة تشرح الدرس", "female teacher explaining lesson board"),
        ("طلاب يرفعون أيديهم", "students raising hands in class"),
        ("طفل يقرأ بصوت عال", "child reading aloud book class"),
        ("أطفال في المكتبة", "children library reading books shelves"),
        ("طفل يكتب على السبورة", "child writing on blackboard school"),
        ("أطفال يلعبون في الفسحة", "children playing recess schoolyard"),
        ("حصة الرسم", "art class children painting creative"),
        ("طفل يحصل على جائزة", "child receiving award certificate school"),
    ],
    # ===== Planche 6: في المنزل (À la maison) =====
    [
        ("غرفة جلوس مريحة", "cozy living room family sitting sofa"),
        ("مطبخ نظيف ومرتب", "clean organized modern kitchen"),
        ("غرفة نوم دافئة", "warm cozy bedroom soft bed"),
        ("حمام مشرق ونظيف", "bright clean bathroom mirror sink"),
        ("طاولة طعام مرتبة", "set dinner table plates glasses"),
        ("شرفة مع نباتات", "balcony garden plants flowers view"),
        ("غرفة لعب منظمة", "organized playroom toys shelves"),
        ("زاوية قراءة هادئة", "cozy reading corner bookshelf lamp"),
        ("غرفة دراسة هادئة", "quiet study room desk computer"),
    ],
    # ===== Planche 7: الترفيه والسفر (Loisirs et voyages) =====
    [
        ("نزهة عائلية في الحديقة", "family picnic grass outdoor summer"),
        ("رحلة إلى الشاطئ", "beach vacation family summer holiday"),
        ("ركوب الدراجات", "children cycling biking nature trail"),
        ("السباحة في المسبح", "child swimming pool splashing water"),
        ("رحلة تزلج على الثلج", "child skiing snow winter sport"),
        ("زيارة حديقة الحيوان", "zoo visit children animals giraffe"),
        ("ركوب الخيل", "horseback riding child pony horse"),
        ("اللعب في الملعب", "children playground slide swing park"),
        ("التخييم في الطبيعة", "family camping tent forest nature"),
    ],
    # ===== Planche 8: الحيوانات في بيئتها (Animaux) =====
    [
        ("قطة تلعب بصندوق", "cat playing box curious pet"),
        ("كلب يجري في الحقل", "golden retriever running field happy"),
        ("حصان يركض بحرية", "horse galloping freedom field"),
        ("فيل في المحمية", "elephant reserve nature drinking water"),
        ("دولفين يقفز في البحر", "dolphin jumping ocean wave"),
        ("أرنب في الحديقة", "rabbit garden eating grass cute"),
        ("بومة على الشجرة", "owl perched tree branch night"),
        ("فراشة على زهرة", "butterfly colorful flower pollen"),
        ("بطريق ظريف", "penguin group snow antarctica"),
    ],
    # ===== Planche 9: الصحة والرياضة (Santé et sport) =====
    [
        ("طفل يجري في الصباح", "child running morning jogging track"),
        ("طفل يأكل سلطة خضراء", "child eating fresh salad healthy"),
        ("طفل يشرب عصيراً", "child drinking fresh juice healthy"),
        ("طفل يغسل يديه", "child washing hands soap water"),
        ("طفل ينظف أسنانه", "child brushing teeth bathroom mirror"),
        ("طفل يمارس اليوغا", "child doing yoga stretching exercise"),
        ("طفل يأكل فاكهة", "child eating fresh fruit bowl"),
        ("طفل نائم بهدوء", "child sleeping peacefully bed angel"),
        ("طفل يلعب كرة القدم", "child playing football soccer sport"),
    ],
    # ===== Planche 10: مشاهد من الحياة (Scènes de la vie) =====
    [
        ("طفل عند الطبيب", "child doctor checkup stethoscope smile"),
        ("سوق الخضار الطازجة", "fresh vegetable market colorful"),
        ("مكتبة عامة كبيرة", "public library grand books interior"),
        ("مقهى في الهواء الطلق", "outdoor cafe terrace people"),
        ("جسر قديم على النهر", "old stone bridge river landscape"),
        ("قرية جميلة في الجبال", "beautiful mountain village houses"),
        ("ساعة الحائط القديمة", "vintage wall clock antique time"),
        ("مزرعة دواجن", "farm chickens hens feeding"),
        ("بائع الزهور في السوق", "flower market vendor bouquets colorful"),
    ],
]

CATEGORY_NAMES = [
    "المشاعر والانفعالات",
    "الأفعال اليومية",
    "في الطبيعة",
    "في المجتمع",
    "في المدرسة",
    "في المنزل",
    "الترفيه والسفر",
    "الحيوانات",
    "الصحة والرياضة",
    "مشاهد من الحياة",
]


def reshape_arabic(text):
    reshaped = arabic_reshaper.reshape(text)
    return get_display(reshaped)


def search_pexels(query):
    params = urllib.parse.urlencode({"query": query, "per_page": 5, "orientation": "landscape"})
    url = f"https://api.pexels.com/v1/search?{params}"
    req = urllib.request.Request(url, headers={"Authorization": PEXELS_KEY, "User-Agent": "Mozilla/5.0"})
    try:
        resp = urllib.request.urlopen(req, timeout=20)
        data = json.loads(resp.read())
        return [photo["src"]["large"] for photo in data.get("photos", [])]
    except Exception as e:
        print(f"  Pexels error: {e}")
        return []


def download_image(url, save_path):
    tmp = save_path + ".tmp"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        resp = urllib.request.urlopen(req, timeout=20)
        data = resp.read()
        if data[:2] == b'\xff\xd8' and len(data) > 5000:
            with open(tmp, "wb") as f:
                f.write(data)
            os.rename(tmp, save_path)
            return True
    except Exception:
        pass
    finally:
        if os.path.exists(tmp):
            os.unlink(tmp)
    return False


def get_image(cache_key, query):
    cache_path = os.path.join(CACHE_DIR, f"{cache_key}.jpg")
    if os.path.exists(cache_path) and os.path.getsize(cache_path) > 5000:
        return cache_path
    urls = search_pexels(query)
    for url in urls:
        if download_image(url, cache_path):
            sz = os.path.getsize(cache_path) // 1024
            print(f"    {cache_key} ({sz}KB)")
            return cache_path
    # fallback blank
    img = Image.new("RGB", (400, 300), (245, 245, 245))
    draw = ImageDraw.Draw(img)
    try:
        font = ImageFont.truetype(FONT_PATH, 30)
    except Exception:
        font = ImageFont.load_default()
    draw.text((10, 130), f"[{cache_key}]", fill=(200, 200, 200), font=font)
    img.save(cache_path, "JPEG", quality=80)
    print(f"  fallback {cache_key}")
    return cache_path


def fit_and_crop(img, target_w, target_h):
    iw, ih = img.size
    ratio = max(target_w / iw, target_h / ih)
    nw, nh = int(iw * ratio), int(ih * ratio)
    img = img.resize((nw, nh), Image.LANCZOS)
    l = (nw - target_w) // 2
    t = (nh - target_h) // 2
    return img.crop((l, t, l + target_w, t + target_h))


def create_card(arabic_label, img_path):
    card = Image.new("RGB", (CARD_W, CARD_H), (255, 255, 255))
    draw = ImageDraw.Draw(card)

    # Photo covers top ~78% of card
    photo_h = 910
    img = Image.open(img_path).convert("RGB")
    cropped = fit_and_crop(img, CARD_W, photo_h)
    card.paste(cropped, (0, 0))

    # Accent line below photo
    line_y = photo_h
    draw.rectangle([(0, line_y), (CARD_W, line_y + 4)], fill=(220, 80, 80))

    # White text area
    text_area_top = line_y + 4
    text_area_h = CARD_H - text_area_top

    # Arabic text
    font_size = 58
    font = ImageFont.truetype(FONT_PATH, font_size)
    rtxt = reshape_arabic(arabic_label)
    bb = draw.textbbox((0, 0), rtxt, font=font)
    tw, th = bb[2] - bb[0], bb[3] - bb[1]

    y_text = text_area_top + (text_area_h - th) // 2
    draw.text(((CARD_W - tw) // 2, y_text), rtxt, fill=(50, 50, 50), font=font)

    # Subtle card border
    draw.rectangle([(0, 0), (CARD_W - 1, CARD_H - 1)], outline=(220, 220, 220), width=1)

    return card


def draw_crop_marks(draw, card_x, card_y, card_w, card_h, mark_len=35, color=(0, 0, 0), width=2):
    corners = [
        (card_x, card_y, 'TL'),
        (card_x + card_w, card_y, 'TR'),
        (card_x, card_y + card_h, 'BL'),
        (card_x + card_w, card_y + card_h, 'BR'),
    ]
    for x, y, pos in corners:
        if pos in ('TL', 'TR'):
            draw.line([(x, y - mark_len), (x, y)], fill=color, width=width)
        if pos in ('BL', 'BR'):
            draw.line([(x, y), (x, y + mark_len)], fill=color, width=width)
        if pos in ('TL', 'BL'):
            draw.line([(x - mark_len, y), (x, y)], fill=color, width=width)
        if pos in ('TR', 'BR'):
            draw.line([(x, y), (x + mark_len, y)], fill=color, width=width)


def create_planche(planche_index, cards_data):
    planche = Image.new("RGB", (A4_W, A4_H), (255, 255, 255))
    draw = ImageDraw.Draw(planche)

    # Center the 3×3 grid vertically
    total_h = 3 * CARD_H + 2 * GAP
    y_start = (A4_H - total_h) // 2

    for i, (label, query) in enumerate(cards_data):
        col = i % 3
        row = i // 3
        x = col * (CARD_W + GAP)
        y = y_start + row * (CARD_H + GAP)

        print(f"    Card {i+1}/9: {label}")
        key = f"p{planche_index:02d}_{i+1:02d}"
        path = get_image(key, query)
        card_img = create_card(label, path)
        planche.paste(card_img, (x, y))

        # Crop marks at this card's corners
        draw_crop_marks(draw, x, y, CARD_W, CARD_H, color=(30, 30, 30))

    # Category label at top
    cat = CATEGORY_NAMES[planche_index - 1]
    try:
        font_small = ImageFont.truetype(FONT_PATH, 28)
        rcat = reshape_arabic(cat)
        bb = draw.textbbox((0, 0), rcat, font=font_small)
        tw = bb[2] - bb[0]
        draw.text(((A4_W - tw) // 2, 8), rcat, fill=(160, 160, 160), font=font_small)
    except Exception:
        pass

    return planche


def main():
    print("Génération de 10 planches A4 (90 cartes) — prêtes à imprimer")
    print(f"Output: {OUTPUT_DIR}")
    print()

    for p_idx, planche_cards in enumerate(PLANCHES, 1):
        cat = CATEGORY_NAMES[p_idx - 1]
        print(f"[Planche {p_idx}/10] {cat}")
        sheet = create_planche(p_idx, planche_cards)

        pdf_path = os.path.join(OUTPUT_DIR, f"planche_{p_idx:02d}.pdf")
        sheet.save(pdf_path, "PDF", resolution=300)
        print(f"  PDF: {pdf_path}")

        jpg_path = os.path.join(OUTPUT_DIR, f"planche_{p_idx:02d}.jpg")
        sheet.save(jpg_path, "JPEG", quality=95)
        print(f"  JPG: {jpg_path}")
        print()

        time.sleep(1.0)

    print("Terminé! 10 planches A4 generees avec 90 cartes pretes a imprimer.")


if __name__ == "__main__":
    main()
