#!/usr/bin/env python3
"""
الكلام الذكي — التذكير والتأنيث (صفات - ألوان)
63 cartes PRO (7 planches × 9) — couleurs avec forme masculin/féminin
"""
import os, sys, json, time, urllib.request, urllib.parse, urllib.error
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import arabic_reshaper
from bidi.algorithm import get_display

BASE_DIR = os.path.expanduser("~/Desktop/cartes_orthophonie/الكلام الذكي")
THEME = "التذكير_والتأنيث_الصفات_والالوان"
OUTPUT_DIR = os.path.join(BASE_DIR, THEME)
os.makedirs(OUTPUT_DIR, exist_ok=True)

CACHE_DIR = os.path.expanduser("~/Desktop/cartes_orthophonie/_cache")
os.makedirs(CACHE_DIR, exist_ok=True)

FONT_PATH = "/Users/traddax/Library/Fonts/Hacen-Tunisia-Bold.ttf"
PEXELS_KEY = "Sv9bIAOkmJ4dzDx3ZjwddRr7AcdNvrRevIBkgxrgUYqkTnwwfWq6JxYQ"

A4_W, A4_H = 2480, 3508
CARD_W, CARD_H = 820, 1160
GAP = 10

CATEGORY_COLORS = [
    (220, 50, 50),    # 0 Rouge — أحمر/حمراء
    (76, 175, 80),    # 1 Vert — أخضر/خضراء
    (33, 150, 243),   # 2 Bleu — أزرق/زرقاء
    (255, 193, 7),    # 3 Jaune — أصفر/صفراء
    (240, 240, 240),  # 4 Blanc — أبيض/بيضاء (accent foncé)
    (50, 50, 50),     # 5 Noir — أسود/سوداء (accent clair)
    (255, 152, 0),    # 6 Orange/Brun/Rose — متنوع
]

CATEGORY_NAMES = [
    "أحمر - حمراء",
    "أخضر - خضراء",
    "أزرق - زرقاء",
    "أصفر - صفراء",
    "أبيض - بيضاء",
    "أسود - سوداء",
    "برتقالي - بني - وردي",
]

PLANCHES = [
    # ===== Planche 1: أحمر / حمراء =====
    [
        ("قلم أحمر",
         "red pen on desk close up", "red color bright vivid", "child writing with red pen",
         "هذا قلم أحمر. أكتب بالقلم الأحمر",
         "هذا قلم لونه",
         "أحمر"),
        ("حذاء أحمر",
         "red shoes pair fashion", "red sneakers", "child wearing red shoes running",
         "هذا حذاء أحمر. الحذاء الأحمر جميل",
         "هذا حذاء لونه",
         "أحمر"),
        ("قميص أحمر",
         "red shirt on hanger", "red t shirt", "child wearing red shirt smiling",
         "هذا قميص أحمر. القميص الأحمر أنيق",
         "هذا قميص لونه",
         "أحمر"),
        ("كرسي أحمر",
         "red chair furniture", "red chair room", "child sitting on red chair",
         "هذا كرسي أحمر. الكرسي الأحمر صغير",
         "هذا كرسي لونه",
         "أحمر"),
        ("سيارة حمراء",
         "red car sport", "red car driving road", "red car parked street",
         "هذه سيارة حمراء. السيارة الحمراء سريعة",
         "هذه سيارة لونها",
         "حمراء"),
        ("وردة حمراء",
         "red rose flower", "red flowers bouquet", "child smelling red rose",
         "هذه وردة حمراء. الوردة الحمراء جميلة جداً",
         "هذه وردة لونها",
         "حمراء"),
        ("قبعة حمراء",
         "red hat accessory", "red hat fashion", "child wearing red hat outdoors",
         "هذه قبعة حمراء. القبعة الحمراء تحميني",
         "هذه قبعة لونها",
         "حمراء"),
        ("فراولة حمراء",
         "fresh red strawberries", "strawberries on plant", "child eating red strawberry",
         "هذه فراولة حمراء. الفراولة الحمراء لذيذة",
         "هذه فراولة لونها",
         "حمراء"),
        ("كرة حمراء",
         "red ball playground", "red ball close up", "child playing with red ball",
         "هذه كرة حمراء. الكرة الحمراء في الملعب",
         "هذه كرة لونها",
         "حمراء"),
    ],
    # ===== Planche 2: أخضر / خضراء =====
    [
        ("كرسي أخضر",
         "green chair furniture", "green chair room design", "child sitting on green chair",
         "هذا كرسي أخضر. الكرسي الأخضر مريح",
         "هذا كرسي لونه",
         "أخضر"),
        ("دفتر أخضر",
         "green notebook cover", "green notebook open", "child writing in green notebook",
         "هذا دفتر أخضر. أكتب في الدفتر الأخضر",
         "هذا دفتر لونه",
         "أخضر"),
        ("قلم أخضر",
         "green pen on desk", "green color nature", "child drawing with green pen",
         "هذا قلم أخضر. أرسم بالقلم الأخضر",
         "هذا قلم لونه",
         "أخضر"),
        ("فستان أخضر",
         "green dress hanging", "green dress girl", "girl wearing green dress",
         "هذا فستان أخضر. الفستان الأخضر رائع",
         "هذا فستان لونه",
         "أخضر"),
        ("شجرة خضراء",
         "green tree nature", "green leaves tree", "child under green tree shade",
         "هذه شجرة خضراء. الشجرة الخضراء كبيرة",
         "هذه شجرة لونها",
         "خضراء"),
        ("تفاحة خضراء",
         "green apple fresh", "green apple fruit", "child eating green apple",
         "هذه تفاحة خضراء. التفاحة الخضراء لذيذة",
         "هذه تفاحة لونها",
         "خضراء"),
        ("حقيبة خضراء",
         "green bag backpack", "green school bag", "child carrying green bag",
         "هذه حقيبة خضراء. الحقيبة الخضراء ثقيلة",
         "هذه حقيبة لونها",
         "خضراء"),
        ("سلطة خضراء",
         "green salad bowl", "fresh vegetables salad", "child eating green salad",
         "هذه سلطة خضراء. السلطة الخضراء صحية",
         "هذه سلطة لونها",
         "خضراء"),
        ("طاولة خضراء",
         "green table garden", "green table furniture", "child playing at green table",
         "هذه طاولة خضراء. الطاولة الخضراء مرتبة",
         "هذه طاولة لونها",
         "خضراء"),
    ],
    # ===== Planche 3: أزرق / زرقاء =====
    [
        ("قلم أزرق",
         "blue pen on desk", "blue ink pen writing", "child writing with blue pen",
         "هذا قلم أزرق. أكتب بالقلم الأزرق",
         "هذا قلم لونه",
         "أزرق"),
        ("قميص أزرق",
         "blue shirt on hanger", "blue t shirt fashion", "child wearing blue shirt",
         "هذا قميص أزرق. القميص الأزرق جميل",
         "هذا قميص لونه",
         "أزرق"),
        ("سرير أزرق",
         "blue bed frame", "blue bedroom cozy", "child sleeping in blue bed",
         "هذا سرير أزرق. السرير الأزرق دافئ",
         "هذا سرير لونه",
         "أزرق"),
        ("حذاء أزرق",
         "blue shoes sneakers", "blue shoes pair", "child wearing blue shoes",
         "هذا حذاء أزرق. الحذاء الأزرق جديد",
         "هذا حذاء لونه",
         "أزرق"),
        ("سيارة زرقاء",
         "blue car modern", "blue car driving", "blue car parked street",
         "هذه سيارة زرقاء. السيارة الزرقاء جميلة",
         "هذه سيارة لونها",
         "زرقاء"),
        ("سمكة زرقاء",
         "blue fish underwater", "blue fish ocean", "child looking at blue fish",
         "هذه سمكة زرقاء. السمكة الزرقاء تسبح",
         "هذه سمكة لونها",
         "زرقاء"),
        ("ساعة زرقاء",
         "blue watch wrist", "blue clock wall", "child wearing blue watch",
         "هذه ساعة زرقاء. الساعة الزرقاء أنيقة",
         "هذه ساعة لونها",
         "زرقاء"),
        ("حقيبة زرقاء",
         "blue bag backpack", "blue school bag", "child carrying blue bag",
         "هذه حقيبة زرقاء. الحقيبة الزرقاء كبيرة",
         "هذه حقيبة لونها",
         "زرقاء"),
        ("كرة زرقاء",
         "blue ball playground", "blue ball sport", "child playing with blue ball",
         "هذه كرة زرقاء. الكرة الزرقاء في الملعب",
         "هذه كرة لونها",
         "زرقاء"),
    ],
    # ===== Planche 4: أصفر / صفراء =====
    [
        ("قلم أصفر",
         "yellow pen on desk", "yellow color bright", "child drawing with yellow pen",
         "هذا قلم أصفر. أرسم بالقلم الأصفر",
         "هذا قلم لونه",
         "أصفر"),
        ("فستان أصفر",
         "yellow dress fashion", "yellow dress girl", "girl wearing yellow dress",
         "هذا فستان أصفر. الفستان الأصفر مشرق",
         "هذا فستان لونه",
         "أصفر"),
        ("كتاب أصفر",
         "yellow book cover", "yellow book pages", "child reading yellow book",
         "هذا كتاب أصفر. الكتاب الأصفر مفيد",
         "هذا كتاب لونه",
         "أصفر"),
        ("منزل أصفر",
         "yellow house exterior", "yellow painted house", "child in front of yellow house",
         "هذا منزل أصفر. المنزل الأصفر كبير",
         "هذا منزل لونه",
         "أصفر"),
        ("شمس صفراء",
         "yellow sun bright sky", "sun rays morning", "sun in blue sky",
         "هذه شمس صفراء. الشمس الصفراء مشرقة",
         "هذه شمس لونها",
         "صفراء"),
        ("زهرة صفراء",
         "yellow flower sunflower", "yellow flowers field", "child smelling yellow flower",
         "هذه زهرة صفراء. الزهرة الصفراء جميلة",
         "هذه زهرة لونها",
         "صفراء"),
        ("موزة صفراء",
         "yellow banana bunch", "yellow banana fruit", "child eating yellow banana",
         "هذه موزة صفراء. الموزة الصفراء لذيذة",
         "هذه موزة لونها",
         "صفراء"),
        ("فراشة صفراء",
         "yellow butterfly on flower", "yellow butterfly wings", "butterfly flying yellow",
         "هذه فراشة صفراء. الفراشة الصفراء تطير",
         "هذه فراشة لونها",
         "صفراء"),
        ("ليمونة صفراء",
         "yellow lemon fresh", "lemon on tree", "yellow lemon slices",
         "هذه ليمونة صفراء. الليمونة الصفراء حامضة",
         "هذه ليمونة لونها",
         "صفراء"),
    ],
    # ===== Planche 5: أبيض / بيضاء =====
    [
        ("قلم أبيض",
         "white pen on desk", "white colored pencil", "child drawing with white paper",
         "هذا قلم أبيض. القلم الأبيض للرسم",
         "هذا قلم لونه",
         "أبيض"),
        ("كرسي أبيض",
         "white chair modern", "white chair furniture", "child sitting on white chair",
         "هذا كرسي أبيض. الكرسي الأبيض نظيف",
         "هذا كرسي لونه",
         "أبيض"),
        ("ثوب أبيض",
         "white thobe traditional", "white clothes clean", "child wearing white clothes",
         "هذا ثوب أبيض. الثوب الأبيض نظيف",
         "هذا ثوب لونه",
         "أبيض"),
        ("أرنب أبيض",
         "white rabbit cute", "rabbit white fur", "child petting white rabbit",
         "هذا أرنب أبيض. الأرنب الأبيض ناعم",
         "هذا أرنب لونه",
         "أبيض"),
        ("سيارة بيضاء",
         "white car elegant", "white car driving", "white car parked",
         "هذه سيارة بيضاء. السيارة البيضاء جميلة",
         "هذه سيارة لونها",
         "بيضاء"),
        ("قطة بيضاء",
         "white cat fluffy", "white cat sleeping", "child playing with white cat",
         "هذه قطة بيضاء. القطة البيضاء لطيفة",
         "هذه قطة لونها",
         "بيضاء"),
        ("زهرة بيضاء",
         "white flower petal", "white flowers garden", "child holding white flower",
         "هذه زهرة بيضاء. الزهرة البيضاء جميلة",
         "هذه زهرة لونها",
         "بيضاء"),
        ("ملعقة بيضاء",
         "white spoon kitchen", "white plastic spoon", "child eating with white spoon",
         "هذه ملعقة بيضاء. الملعقة البيضاء صغيرة",
         "هذه ملعقة لونها",
         "بيضاء"),
        ("حمامة بيضاء",
         "white dove peace", "white pigeon flying", "child feeding white dove",
         "هذه حمامة بيضاء. الحمامة البيضاء تطير",
         "هذه حمامة لونها",
         "بيضاء"),
    ],
    # ===== Planche 6: أسود / سوداء =====
    [
        ("قلم أسود",
         "black pen on desk", "black ink pen", "child writing with black pen",
         "هذا قلم أسود. أكتب بالقلم الأسود",
         "هذا قلم لونه",
         "أسود"),
        ("حذاء أسود",
         "black shoes formal", "black sneakers", "child wearing black shoes",
         "هذا حذاء أسود. الحذاء الأسود أنيق",
         "هذا حذاء لونه",
         "أسود"),
        ("هاتف أسود",
         "black phone mobile", "black smartphone screen", "child using black phone",
         "هذا هاتف أسود. الهاتف الأسود حديث",
         "هذا هاتف لونه",
         "أسود"),
        ("قط أسود",
         "black cat sitting", "black cat eyes", "child with black cat",
         "هذا قط أسود. القط الأسود جميل",
         "هذا قط لونه",
         "أسود"),
        ("سيارة سوداء",
         "black car luxury", "black car driving", "black car parked",
         "هذه سيارة سوداء. السيارة السوداء فخمة",
         "هذه سيارة لونها",
         "سوداء"),
        ("حقيبة سوداء",
         "black bag handbag", "black school bag", "child carrying black bag",
         "هذه حقيبة سوداء. الحقيبة السوداء أنيقة",
         "هذه حقيبة لونها",
         "سوداء"),
        ("دراجة سوداء",
         "black bicycle bike", "black bike park", "child riding black bike",
         "هذه دراجة سوداء. الدراجة السوداء سريعة",
         "هذه دراجة لونها",
         "سوداء"),
        ("طاولة سوداء",
         "black table desk", "black table modern", "child studying at black table",
         "هذه طاولة سوداء. الطاولة السوداء كبيرة",
         "هذه طاولة لونها",
         "سوداء"),
        ("نظارة سوداء",
         "black sunglasses", "black glasses frames", "child wearing black glasses",
         "هذه نظارة سوداء. النظارة السوداء أنيقة",
         "هذه نظارة لونها",
         "سوداء"),
    ],
    # ===== Planche 7: برتقالي/برتقالية + بني/بنية + وردي/وردية + رمادي/رمادية =====
    [
        ("قلم برتقالي",
         "orange pen on desk", "orange color bright", "child drawing orange",
         "هذا قلم برتقالي. القلم البرتقالي جميل",
         "هذا قلم لونه",
         "برتقالي"),
        ("برتقالة برتقالية",
         "orange fruit fresh", "orange on tree", "child eating orange",
         "هذه برتقالة برتقالية. البرتقالة لذيذة",
         "هذه برتقالة لونها",
         "برتقالية"),
        ("وشاح بني",
         "brown scarf winter", "brown wool scarf", "child wearing brown scarf",
         "هذا وشاح بني. الوشاح البني دافئ",
         "هذا وشاح لونه",
         "بني"),
        ("حذاء وردي",
         "pink shoes girl", "pink sneakers", "girl wearing pink shoes",
         "هذا حذاء وردي. الحذاء الوردي جميل",
         "هذا حذاء لونه",
         "وردي"),
        ("فراشة برتقالية",
         "orange butterfly flower", "orange butterfly wings", "butterfly flying",
         "هذه فراشة برتقالية. الفراشة البرتقالية تطير",
         "هذه فراشة لونها",
         "برتقالية"),
        ("حقيبة بنية",
         "brown bag leather", "brown school bag", "child with brown bag",
         "هذه حقيبة بنية. الحقيبة البنية جميلة",
         "هذه حقيبة لونها",
         "بنية"),
        ("فستان وردي",
         "pink dress girl", "pink dress fashion", "girl wearing pink dress",
         "هذا فستان وردي. الفستان الوردي رائع",
         "هذا فستان لونه",
         "وردي"),
        ("سيارة رمادية",
         "gray car modern", "gray car driving", "gray car street",
         "هذه سيارة رمادية. السيارة الرمادية أنيقة",
         "هذه سيارة لونها",
         "رمادية"),
        ("قطة برتقالية",
         "orange cat ginger", "orange cat sitting", "child with orange cat",
         "هذه قطة برتقالية. القطة البرتقالية لطيفة",
         "هذه قطة لونها",
         "برتقالية"),
    ],
]


# ====== HELPERS ======

def reshape_arabic(text):
    reshaped = arabic_reshaper.reshape(text)
    return get_display(reshaped)


def search_pexels(query, retry=0):
    params = urllib.parse.urlencode({"query": query, "per_page": 5, "orientation": "landscape"})
    url = f"https://api.pexels.com/v1/search?{params}"
    req = urllib.request.Request(url, headers={"Authorization": PEXELS_KEY, "User-Agent": "Mozilla/5.0"})
    try:
        resp = urllib.request.urlopen(req, timeout=20)
        data = json.loads(resp.read())
        return [photo["src"]["large"] for photo in data.get("photos", [])]
    except urllib.error.HTTPError as e:
        if e.code == 429 and retry < 3:
            wait = 60 * (retry + 1)
            print(f"  Rate limited. Waiting {wait}s...")
            time.sleep(wait)
            return search_pexels(query, retry + 1)
        print(f"  Pexels error: {e}")
        return []
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
    # Check theme-specific cache first
    cache_path = os.path.join(CACHE_DIR, f"col_{cache_key}.jpg")
    if os.path.exists(cache_path) and os.path.getsize(cache_path) > 5000:
        return cache_path
    # Check old cache
    old = os.path.join(CACHE_DIR, f"{cache_key}.jpg")
    if os.path.exists(old) and os.path.getsize(old) > 5000:
        return old
    urls = search_pexels(query)
    for url in urls:
        if download_image(url, cache_path):
            sz = os.path.getsize(cache_path) // 1024
            print(f"    {cache_key} ({sz}KB)")
            return cache_path
    fallback = Image.new("RGB", (400, 300), (235, 235, 235))
    d = ImageDraw.Draw(fallback)
    try:
        f = ImageFont.truetype(FONT_PATH, 25)
    except Exception:
        f = ImageFont.load_default()
    d.text((10, 130), f"[{cache_key}]", fill=(180, 180, 180), font=f)
    fallback.save(cache_path, "JPEG", quality=80)
    return cache_path


def fit_and_crop(img, target_w, target_h):
    iw, ih = img.size
    ratio = max(target_w / iw, target_h / ih)
    nw, nh = int(iw * ratio), int(ih * ratio)
    img = img.resize((nw, nh), Image.LANCZOS)
    l = (nw - target_w) // 2
    t = (nh - target_h) // 2
    return img.crop((l, t, l + target_w, t + target_h))


def rounded_rect_image(img, radius):
    mask = Image.new("L", img.size, 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle([(0, 0), (img.width - 1, img.height - 1)], radius=radius, fill=255)
    result = img.copy()
    result.putalpha(mask)
    return result


def drop_shadow(img, offset=(0, 4), radius=6, opacity=60):
    shadow = Image.new("RGBA", img.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(shadow)
    draw.rounded_rectangle([(0, 0), (img.width - 1, img.height - 1)], radius=radius + 2, fill=(0, 0, 0, opacity))
    shadow = shadow.filter(ImageFilter.GaussianBlur(radius))
    result = Image.new("RGBA", (img.width + abs(offset[0]), img.height + abs(offset[1])), (0, 0, 0, 0))
    sx = max(offset[0], 0)
    sy = max(offset[1], 0)
    result.paste(shadow, (sx, sy), shadow)
    result.paste(img, (0, 0), img)
    return result


# ====== CARD CREATION ======

def create_card(card_data, card_index, cat_index):
    label, q1, q2, q3, statement, question, answer = card_data
    cat_color = CATEGORY_COLORS[cat_index]
    r, g, b = cat_color

    # For white/black categories, adjust accent visibility
    if cat_index == 4:
        r, g, b = 80, 80, 80
    elif cat_index == 5:
        r, g, b = 200, 200, 200

    imgs = []
    for suffix, query in [("a", q1), ("b", q2), ("c", q3)]:
        key = f"col_{card_index:03d}_{suffix}"
        path = get_image(key, query)
        imgs.append(Image.open(path).convert("RGB"))

    card = Image.new("RGB", (CARD_W, CARD_H), (255, 255, 255))
    draw = ImageDraw.Draw(card)

    # TOP ACCENT STRIP
    draw.rectangle([(0, 0), (CARD_W, 7)], fill=(r, g, b))

    # TOP TWO IMAGES
    iw, ih = 360, 172
    gap = 25
    total_w = 2 * iw + gap
    xs = (CARD_W - total_w) // 2
    y1 = 14
    radius = 10

    for i in range(2):
        cropped = fit_and_crop(imgs[i], iw, ih)
        cropped_rgba = cropped.convert("RGBA")
        rounded = rounded_rect_image(cropped_rgba, radius)
        shadowed = drop_shadow(rounded, offset=(0, 3), radius=5, opacity=50)
        x = xs + i * (iw + gap)
        card.paste(shadowed, (x, y1), shadowed)

    # STATEMENT IN PILL
    font_s = 23
    font = ImageFont.truetype(FONT_PATH, font_s)
    rtxt = reshape_arabic(statement)
    yt1 = y1 + ih + 10
    bb = draw.textbbox((0, 0), rtxt, font=font)
    tw, th = bb[2] - bb[0], bb[3] - bb[1]
    pill_pad = 16
    pill_w = tw + pill_pad * 2
    pill_h = th + 10
    pill_x = (CARD_W - pill_w) // 2
    pill_y = yt1
    text_color = (255, 255, 255) if cat_index != 4 else (255, 255, 255)
    draw.rounded_rectangle([(pill_x, pill_y), (pill_x + pill_w, pill_y + pill_h)],
                           radius=pill_h // 2, fill=(r, g, b))
    draw.text(((CARD_W - tw) // 2, pill_y + (pill_h - th) // 2 - 2), rtxt,
              fill=text_color, font=font)

    # BOTTOM IMAGE
    biw, bih = 760, 510
    xb = (CARD_W - biw) // 2
    yb = pill_y + pill_h + 12
    cropped = fit_and_crop(imgs[2], biw, bih)
    cropped_rgba = cropped.convert("RGBA")
    rounded = rounded_rect_image(cropped_rgba, radius)
    shadowed = drop_shadow(rounded, offset=(0, 4), radius=6, opacity=55)
    card.paste(shadowed, (xb, yb), shadowed)

    # ACCENT UNDERLINE
    underline_y = yb + bih + 6
    draw.rounded_rectangle([(xb + 80, underline_y), (xb + biw - 80, underline_y + 3)],
                           radius=2, fill=(r, g, b, 80))

    # QUESTION
    font_q = 26
    fq = ImageFont.truetype(FONT_PATH, font_q)
    qtxt = reshape_arabic(f"{question} ............")
    yq = underline_y + 10
    bq = draw.textbbox((0, 0), qtxt, font=fq)
    qw, qh = bq[2] - bq[0], bq[3] - bq[1]
    draw.text(((CARD_W - qw) // 2, yq), qtxt, fill=(40, 40, 40), font=fq)

    # ANSWER HINT
    fa = ImageFont.truetype(FONT_PATH, 16)
    atxt = reshape_arabic(f"({answer})")
    ba = draw.textbbox((0, 0), atxt, font=fa)
    aw = ba[2] - ba[0]
    draw.text(((CARD_W - aw) // 2, CARD_H - 22), atxt, fill=(180, 180, 180), font=fa)

    # CATEGORY BADGE
    cat_short = CATEGORY_NAMES[cat_index]
    font_cat = ImageFont.truetype(FONT_PATH, 11)
    cat_reshaped = reshape_arabic(cat_short)
    cb = draw.textbbox((0, 0), cat_reshaped, font=font_cat)
    cw, ch = cb[2] - cb[0], cb[3] - cb[1]
    cp_x = CARD_W - cw - 14
    cp_y = 10
    bg_cat = (r, g, b, 200) if cat_index != 4 else (100, 100, 100, 200)
    draw.rounded_rectangle([(cp_x - 6, cp_y - 3), (cp_x + cw + 6, cp_y + ch + 3)],
                           radius=8, fill=bg_cat)
    draw.text((cp_x, cp_y), cat_reshaped, fill=(255, 255, 255), font=font_cat)

    # CARD NUMBER
    font_num = ImageFont.truetype(FONT_PATH, 11)
    draw.text((CARD_W - 45, CARD_H - 16), f"#{card_index:02d}", fill=(190, 190, 190), font=font_num)

    return card


# ====== CROP MARKS ======

def draw_crop_marks(draw, card_x, card_y, card_w, card_h, mark_len=35, color=(0, 0, 0), width=2):
    corners = [
        (card_x, card_y, 'TL'), (card_x + card_w, card_y, 'TR'),
        (card_x, card_y + card_h, 'BL'), (card_x + card_w, card_y + card_h, 'BR'),
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


# ====== PLANCHES ======

def create_planche(planche_index, cards_data, cat_index):
    sheet = Image.new("RGB", (A4_W, A4_H), (255, 255, 255))
    draw = ImageDraw.Draw(sheet)
    total_h = 3 * CARD_H + 2 * GAP
    y_start = (A4_H - total_h) // 2
    card_number = (planche_index - 1) * 9

    for i, card_entry in enumerate(cards_data):
        col = i % 3
        row = i // 3
        x = col * (CARD_W + GAP)
        y = y_start + row * (CARD_H + GAP)
        card_number += 1
        print(f"    Card {i+1}/9: {card_entry[0]}")
        card_img = create_card(card_entry, card_number, cat_index)
        sheet.paste(card_img, (x, y))
        draw_crop_marks(draw, x, y, CARD_W, CARD_H, color=(30, 30, 30))

    cat = CATEGORY_NAMES[planche_index - 1]
    try:
        font_small = ImageFont.truetype(FONT_PATH, 26)
        rcat = reshape_arabic(cat)
        bb = draw.textbbox((0, 0), rcat, font=font_small)
        tw = bb[2] - bb[0]
        draw.text(((A4_W - tw) // 2, 8), rcat, fill=(160, 160, 160), font=font_small)
    except Exception:
        pass
    return sheet


# ====== CARD BACKS ======

def create_card_backs():
    sheet = Image.new("RGB", (A4_W, A4_H), (255, 255, 255))
    draw = ImageDraw.Draw(sheet)
    total_h = 3 * CARD_H + 2 * GAP
    y_start = (A4_H - total_h) // 2

    for px in range(0, A4_W, 40):
        for py in range(0, A4_H, 40):
            draw.ellipse([(px, py), (px + 3, py + 3)], fill=(235, 235, 235))

    for row in range(3):
        for col in range(3):
            x = col * (CARD_W + GAP)
            y = y_start + row * (CARD_H + GAP)
            idx = row * 3 + col
            r, g, b = CATEGORY_COLORS[idx % 7]

            draw.rounded_rectangle([(x, y), (x + CARD_W, y + CARD_H)],
                                   radius=12, fill=(r, g, b, 25))
            draw.rounded_rectangle([(x + 15, y + 15), (x + CARD_W - 15, y + CARD_H - 15)],
                                   radius=8, outline=(r, g, b, 60), width=2)

            cx, cy = x + CARD_W // 2, y + CARD_H // 2
            draw.ellipse([(cx - 80, cy - 80), (cx + 80, cy + 80)],
                         outline=(r, g, b, 50), width=3)
            draw.ellipse([(cx - 30, cy - 30), (cx + 30, cy + 30)],
                         fill=(r, g, b, 60))
            draw.ellipse([(cx - 45, cy - 35), (cx + 45, cy + 35)],
                         outline=(r, g, b, 80), width=2)

            try:
                font_back = ImageFont.truetype(FONT_PATH, 24)
                title = reshape_arabic("الكلام الذكي")
                bb = draw.textbbox((0, 0), title, font=font_back)
                tw, th = bb[2] - bb[0], bb[3] - bb[1]
                draw.text((x + (CARD_W - tw) // 2, y + CARD_H - 75), title,
                          fill=(r, g, b, 120), font=font_back)
                title2 = reshape_arabic("صفات - ألوان")
                bb2 = draw.textbbox((0, 0), title2, font=font_back)
                tw2 = bb2[2] - bb2[0]
                draw.text((x + (CARD_W - tw2) // 2, y + CARD_H - 48), title2,
                          fill=(r, g, b, 120), font=font_back)
            except Exception:
                pass

            draw_crop_marks(draw, x, y, CARD_W, CARD_H, color=(30, 30, 30))
    return sheet


# ====== MAIN ======

def main():
    print("=" * 60)
    print("  الكلام الذكي — التذكير والتأنيث (صفات - ألوان)")
    print("  63 cartes PRO — 7 planches × 9")
    print("=" * 60)
    print()

    for p_idx, planche_cards in enumerate(PLANCHES, 1):
        cat = CATEGORY_NAMES[p_idx - 1]
        print(f"[Planche {p_idx}/7] {cat}")
        sheet = create_planche(p_idx, planche_cards, p_idx - 1)

        pdf_path = os.path.join(OUTPUT_DIR, f"planche_{p_idx:02d}.pdf")
        sheet.save(pdf_path, "PDF", resolution=300)
        print(f"  PDF: {pdf_path}")

        jpg_path = os.path.join(OUTPUT_DIR, f"planche_{p_idx:02d}.jpg")
        sheet.save(jpg_path, "JPEG", quality=95)
        print(f"  JPG: {jpg_path}")
        print()
        time.sleep(1.0)

    # Card backs
    print("[Card Backs] Dos de cartes")
    backs = create_card_backs()
    backs_pdf = os.path.join(OUTPUT_DIR, "planche_dos_cartes.pdf")
    backs.save(backs_pdf, "PDF", resolution=300)
    backs_jpg = os.path.join(OUTPUT_DIR, "planche_dos_cartes.jpg")
    backs.save(backs_jpg, "JPEG", quality=95)
    print(f"  PDF: {backs_pdf}")
    print(f"  JPG: {backs_jpg}")
    print()

    print("=" * 60)
    print("  TERMINE !")
    print(f"  Dossier : {OUTPUT_DIR}")
    print("=" * 60)


if __name__ == "__main__":
    main()
