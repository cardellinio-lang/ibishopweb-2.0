#!/usr/bin/env python3
"""
Generate English phonics flashcards.
Card: 133mm × 74mm @300dpi = 1571×874px
A4 landscape: 3508×2480px, 6 cards per sheet (4 vertical + 2 horizontal).
"""

from PIL import Image, ImageDraw, ImageFont
import os, sys, time, math, json, urllib.parse, urllib.request

CARD_W, CARD_H = 874, 1571
HORIZ_W, HORIZ_H = 1571, 874
A4_W, A4_H = 3508, 2480
DPI = 300
MM = DPI / 25.4

CARD_ROUND = 30
PHOTO_ROUND = 20
BIG_LETTER_SIZE = 180
MAIN_FONT_SIZE = 99
SMALL_FONT_SIZE = 35
SMALL_PHOTO_SIZE = 300
PHOTO_AREA_RATIO = 0.35
CROP_LEN = int(3 * MM + 0.5)

WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
RED = (220, 30, 30)
GRAY = (180, 180, 180)
TRANSPARENT = (0, 0, 0, 0)

BASE = os.path.join(os.path.expanduser("~"), "Desktop", "cartes_orthophonie")
CACHE_DIR = os.path.join(BASE, "english_cache")
CARDS_DIR = os.path.join(BASE, "english_cards")
PLANCHES_DIR = os.path.join(BASE, "english_planches")
FONTS_DIR = os.path.join(BASE, "fonts")

for d in [CACHE_DIR, CARDS_DIR, PLANCHES_DIR, FONTS_DIR]:
    os.makedirs(d, exist_ok=True)

PEXELS_KEY = "Sv9bIAOkmJ4dzDx3ZjwddRr7AcdNvrRevIBkgxrgUYqkTnwwfWq6JxYQ"
PEXELS_URL = "https://api.pexels.com/v1/search"

EMOJI_FONT = "/System/Library/Fonts/Apple Color Emoji.ttc"

EMOJI_MAP = {
    "apple": "🍎", "cat": "🐱", "panda": "🐼",
    "banana": "🍌", "rabbit": "🐰", "crab": "🦀",
    "carrot": "🥕", "ocean": "🌊", "picnic": "🧺",
    "dog": "🐶", "spider": "🕷️", "bird": "🐦",
    "elephant": "🐘", "bread": "🍞", "shoe": "👟",
    "fox": "🦊", "giraffe": "🦒", "wolf": "🐺",
    "grapes": "🍇", "penguin": "🐧", "egg": "🥚",
    "horse": "🐴", "fish": "🐟",
    "iguana": "🦎", "pizza": "🍕", "kiwi": "🥝",
    "jaguar": "🐆", "juice": "🧃", "orange": "🍊",
    "kangaroo": "🦘", "monkey": "🐵", "duck": "🦆",
    "lemon": "🍋", "seal": "🦭",
    "scream": "😱",
    "nurse": "👩‍⚕️", "ant": "🐜", "lion": "🦁",
    "octopus": "🐙", "robot": "🤖", "potato": "🥔",
    "queen": "👑", "squirrel": "🐿️", "cheque": "💵",
    "star": "⭐",
    "snake": "🐍", "basket": "🧺", "bus": "🚌",
    "tiger": "🐯", "butterfly": "🦋",
    "umbrella": "☂️", "cactus": "🌵", "menu": "📋",
    "vegetable": "🥗", "diver": "🤿", "dove": "🕊️",
    "whale": "🐋", "sandwich": "🥪", "cow": "🐄",
    "xray": "🩻", "boxer": "🐕",  # boxer dog
    "yak": "🦬", "cry": "😭", "baby": "👶",
    "zebra": "🦓", "sneeze": "🤧", "quiz": "❓",
    "bear": "🐻", "cabbage": "🥬",
    "music": "🎵", "doctor": "👨‍⚕️",
    "frog": "🐸", "goat": "🐐",
    "hippo": "🦛", "jellyfish": "🪼",
    "koala": "🐨", "mango": "🥭", "tomato": "🍅",
    "cream": "🍦",
    "nest": "🪺", "coconut": "🥥",
    "pig": "🐷", "lamp": "💡",
    "parrot": "🦜", "pineapple": "🍍",
    "cheap": "🏷️",
    "sun": "☀️", "strawberry": "🍓",
    "watermelon": "🍉", "puppy": "🐶",
    "bunny": "🐰", "kitten": "🐱",
    "piano": "🎹", "clown": "🤡",
    "butter": "🧈",
}

CARDS = [
    ("A", "Apple", "Cat", "Panda", "Fruits", "single red apple fruit isolated white background", "gray cat face closeup", "black and white panda bear sitting"),
    ("B", "Banana", "Rabbit", "Crab", "Fruits", "single yellow banana fruit isolated", "white rabbit bunny sitting", "red crab animal isolated"),
    ("C", "Carrot", "Ocean", "Picnic", "Vegetables", "single orange carrot vegetable isolated white", "blue ocean sea water", "picnic basket food grass"),
    ("D", "Dog", "Spider", "Bird", "Animals", "brown dog puppy sitting", "spider on web closeup", "blue bird perched branch"),
    ("E", "Elephant", "Bread", "Shoe", "Animals", "gray elephant animal standing whole body", "fresh loaf bread isolated", "single shoe sneaker isolated"),
    ("F", "Fox", "Giraffe", "Wolf", "Animals", "red fox animal sitting wildlife", "giraffe standing savanna", "gray wolf animal standing"),
    ("G", "Grapes", "Penguin", "Egg", "Fruits", "bunch purple grapes fruit isolated white", "black white penguin standing", "single egg white shell isolated"),
    ("H", "Horse", "Elephant", "Fish", "Animals", "brown horse standing pasture", "gray elephant animal", "orange goldfish swimming"),
    ("I", "Iguana", "Pizza", "Kiwi", "Animals", "green iguana reptile sitting", "slice pizza cheese isolated", "green kiwi fruit slice"),
    ("J", "Jaguar", "Juice", "Orange", "Animals", "jaguar animal spotted fur", "glass orange juice isolated white", "single whole orange fruit round"),
    ("K", "Kangaroo", "Monkey", "Duck", "Animals", "kangaroo standing australia", "brown monkey animal sitting", "duck bird standing pond"),
    ("L", "Lemon", "Elephant", "Seal", "Fruits", "single yellow lemon fruit isolated", "elephant standing zoo", "gray seal animal ocean"),
    ("M", "Monkey", "Lemon", "Scream", "Animals", "brown monkey face closeup", "yellow lemon fruit isolated", "child boy screaming"),
    ("N", "Nurse", "Ant", "Lion", "Jobs", "nurse white uniform stethoscope", "black ant insect walking", "lion animal face mane"),
    ("O", "Octopus", "Robot", "Potato", "Animals", "octopus underwater ocean animal", "white robot toy standing isolated", "single potato vegetable isolated"),
    ("P", "Penguin", "Apple", "Lamp", "Animals", "penguin bird standing ice", "single red apple fruit isolated", "desk lamp table isolated"),
    ("Q", "Queen", "Squirrel", "Cheque", "Jobs", "queen crown jewel", "brown squirrel animal nut", "cheque money payment isolated"),
    ("R", "Rabbit", "Carrot", "Star", "Animals", "white rabbit bunny ears sitting", "single carrot vegetable isolated", "star night sky moon"),
    ("S", "Snake", "Basket", "Bus", "Animals", "green snake reptile slithering", "wicker picnic basket isolated", "yellow school bus vehicle"),
    ("T", "Tiger", "Butterfly", "Cat", "Animals", "tiger animal face front", "orange butterfly insect flower", "gray cat face closeup"),
    ("U", "Umbrella", "Cactus", "Menu", "Weather", "open color umbrella rain isolated", "saguaro cactus plant isolated", "menu board restaurant food"),
    ("V", "Vegetable", "Diver", "Dove", "Vegetables", "assorted fresh vegetables isolated", "scuba diver ocean underwater", "white dove bird flying"),
    ("W", "Whale", "Sandwich", "Cow", "Animals", "humpback whale ocean tail", "sandwich bread lettuce ham", "black white cow pasture"),
    ("X", "Xray", "Boxer", "Fox", "Jobs", "xray human chest bones", "brown boxer dog standing", "red fox animal wildlife"),
    ("Y", "Yak", "Cry", "Baby", "Animals", "furry yak animal mountain", "baby crying tears face", "baby infant smiling portrait"),
    ("Z", "Zebra", "Sneeze", "Quiz", "Animals", "zebra animal black white stripes", "person sneezing tissue", "question mark quiz game"),
    ("A2", "Ant", "Cat", "Panda", "Animals", "black ant insect grass", "gray cat lying", "panda bear eating bamboo"),
    ("B2", "Bear", "Cabbage", "Crab", "Animals", "brown bear standing forest", "green cabbage head vegetable", "red crab animal isolated"),
    ("C2", "Cat", "Ocean", "Music", "Animals", "orange tabby cat sitting", "ocean sea waves sunset", "music notes symbols isolated"),
    ("D2", "Doctor", "Spider", "Bird", "Jobs", "doctor white coat stethoscope", "spider web dew morning", "yellow bird perched branch"),
    ("F2", "Frog", "Giraffe", "Wolf", "Animals", "green frog sitting leaf", "giraffe standing long neck", "gray wolf standing forest"),
    ("G2", "Goat", "Tiger", "Egg", "Animals", "white goat animal standing", "tiger animal snarling", "single egg white shell isolated"),
    ("H2", "Hippo", "Elephant", "Fish", "Animals", "hippopotamus animal water river", "elephant animal standing", "goldfish swimming bowl"),
    ("J2", "Jellyfish", "Juice", "Orange", "Animals", "jellyfish ocean transparent", "glass apple juice fresh", "single orange fruit isolated"),
    ("K2", "Koala", "Monkey", "Duck", "Animals", "koala bear eucalyptus tree", "cute monkey funny face", "duck bird pond water"),
    ("L2", "Lion", "Elephant", "Seal", "Animals", "lion animal mane roaring", "elephant animal standing", "seal animal balancing ball"),
    ("M2", "Mango", "Tomato", "Cream", "Fruits", "ripe yellow mango fruit whole", "red tomato vegetable isolated", "whipped cream dessert bowl"),
    ("N2", "Nest", "Ant", "Lion", "Animals", "bird nest with eggs tree", "red ant insect macro", "lion animal cub"),
    ("O2", "Orange", "Coconut", "Potato", "Fruits", "whole orange fruit round isolated", "brown coconut fruit isolated", "potato vegetable isolated white"),
    ("P2", "Pig", "Apple", "Lamp", "Animals", "pink pig animal standing", "red apple fruit isolated", "desk lamp isolated white"),
    ("P3", "Parrot", "Apple", "Lamp", "Animals", "colorful parrot bird sitting perch", "red apple fruit isolated", "lamp table isolated white"),
    ("P4", "Pineapple", "Apple", "Lamp", "Fruits", "whole pineapple fruit isolated", "red apple fruit isolated", "desk lamp isolated white"),
    ("P5", "Panda", "Apple", "Cheap", "Animals", "panda bear sitting bamboo", "red apple fruit isolated", "sale price tag discount"),
    ("R2", "Robot", "Carrot", "Star", "Jobs", "robot machine technology toy", "carrot vegetable whole isolated", "stars night sky space"),
    ("S2", "Sun", "Basket", "Bus", "Nature", "bright yellow sun sky isolated", "wicker basket picnic isolated", "yellow school bus isolated"),
    ("S3", "Strawberry", "Basket", "Bus", "Fruits", "ripe red strawberry fruit isolated", "wicker basket isolated white", "school bus yellow isolated"),
    ("T2", "Tomato", "Butterfly", "Cat", "Vegetables", "red tomato fruit vegetable whole", "colorful butterfly insect flower", "gray cat face portrait"),
    ("W2", "Watermelon", "Sandwich", "Cow", "Fruits", "watermelon fruit slice isolated", "sandwich bread ham cheese", "cow animal black white pasture"),
]

_font_cache = {}

def _find_font(names):
    dirs = [
        "/System/Library/Fonts",
        "/System/Library/Fonts/Supplemental",
        "/Library/Fonts",
        os.path.expanduser("~/Library/Fonts"),
        FONTS_DIR,
    ]
    for d in dirs:
        if not os.path.isdir(d):
            continue
        for f in os.listdir(d):
            f_low = f.lower()
            for name in names:
                if name.lower() in f_low and f_low.endswith((".ttf", ".otf")):
                    return os.path.join(d, f)
    return None

def get_font(family, size, italic=False):
    key = (family, size, italic)
    if key in _font_cache:
        return _font_cache[key]

    path = None
    if family == "comic":
        path = _find_font(["Comic Sans MS", "Comic Sans"])
        if not path:
            path = _find_font(["ComicNeue", "Comic Neue"])
        if not path:
            return get_font("arial", size)
    elif family == "arial":
        if italic:
            path = _find_font(["Arial Italic", "Arial-Italic"])
        else:
            path = _find_font(["Arial", "arial"])
    elif family == "bold":
        path = _find_font(["Arial Bold", "Arial-Bold", "Helvetica Bold", "Helvetica-Bold"])
    elif family == "cursive":
        path = _find_font(["Apple Chancery", "Chancery"])
        if not path:
            ds = os.path.join(FONTS_DIR, "DancingScript-VariableFont_wght.ttf")
            if not os.path.exists(ds):
                try:
                    url = "https://raw.githubusercontent.com/google/fonts/main/ofl/dancingscript/DancingScript-VariableFont_wght.ttf"
                    urllib.request.urlretrieve(url, ds)
                except:
                    pass
            if os.path.exists(ds):
                path = ds
        if not path:
            return get_font("comic", size)

    if path and os.path.exists(path):
        try:
            font = ImageFont.truetype(path, size)
            _font_cache[key] = font
            return font
        except:
            pass

    font = ImageFont.load_default()
    _font_cache[key] = font
    return font

def pexels_search(queries, orientation="square"):
    if isinstance(queries, str):
        queries = [queries]
    for query in queries:
        url = f"{PEXELS_URL}?query={urllib.parse.quote(query)}&per_page=3&orientation={orientation}"
        req = urllib.request.Request(url, headers={
            "Authorization": PEXELS_KEY,
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        })
        try:
            with urllib.request.urlopen(req, timeout=15) as resp:
                data = json.loads(resp.read().decode())
            if data.get("photos"):
                return data["photos"][0]["src"]
        except:
            pass
    return None

def create_placeholder(text, w, h):
    bg = Image.new("RGB", (w, h), (235, 235, 245))
    draw = ImageDraw.Draw(bg)
    for i in range(0, w, 30):
        draw.line([(i, 0), (i, h)], fill=(215, 215, 235), width=1)
    for i in range(0, h, 30):
        draw.line([(0, i), (w, i)], fill=(215, 215, 235), width=1)
    draw.rectangle([0, 0, w-1, h-1], outline=(180, 180, 200), width=2)
    font = get_font("arial", max(14, min(w, h) // 10))
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    draw.text(((w-tw)//2, (h-th)//2), text, font=font, fill=(120, 120, 150))
    return bg.convert("RGBA")

def _download_with_ua(url, path):
    req = urllib.request.Request(url, headers={
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    })
    try:
        with urllib.request.urlopen(req, timeout=15) as src:
            with open(path, "wb") as dst:
                dst.write(src.read())
        return True
    except:
        return False

def fetch_image(queries, cache_key, orientation="square", size="medium"):
    if isinstance(queries, str):
        queries = [queries]
    cache_path = os.path.join(CACHE_DIR, f"{cache_key}.jpg")
    if os.path.exists(cache_path):
        try:
            return Image.open(cache_path).convert("RGBA")
        except:
            os.remove(cache_path)

    src = pexels_search(queries, orientation)
    img = None
    if src:
        url = src.get(size) or src.get("large") or src.get("medium")
        if url:
            try:
                if _download_with_ua(url, cache_path):
                    img = Image.open(cache_path).convert("RGBA")
            except:
                pass

    if img is None:
        # Use main photo area dimensions for placeholder
        ph_w = CARD_W - 40
        ph_h = int(CARD_H * PHOTO_AREA_RATIO)
        label = queries[0] if queries else "image"
        if size in ("tiny", "small"):
            img = create_placeholder(label, SMALL_PHOTO_SIZE, SMALL_PHOTO_SIZE)
        else:
            img = create_placeholder(label, ph_w, ph_h)

    return img

def cover_fit(image, target_w, target_h):
    iw, ih = image.size
    scale = max(target_w / iw, target_h / ih)
    nw = int(iw * scale)
    nh = int(ih * scale)
    if nw < 1: nw = 1
    if nh < 1: nh = 1
    resized = image.resize((nw, nh), Image.LANCZOS)
    left = (nw - target_w) // 2
    top = (nh - target_h) // 2
    return resized.crop((left, top, left + target_w, top + target_h))

def round_corners(image, radius):
    mask = Image.new("L", image.size, 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle((0, 0, image.width-1, image.height-1), radius=radius, fill=255)
    result = image.copy()
    result.putalpha(mask)
    return result

def circle_crop(image, size):
    image = image.resize((size, size), Image.LANCZOS)
    mask = Image.new("L", (size, size), 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((0, 0, size, size), fill=255)
    result = Image.new("RGBA", (size, size), TRANSPARENT)
    result.paste(image, mask=mask)
    return result

def draw_highlighted(draw, word, letter, font, cx, y, highlight_color, normal_color=BLACK):
    letter_low = letter.lower()
    idx = -1
    for i, ch in enumerate(word):
        if ch.lower() == letter_low:
            idx = i
            break

    if idx < 0:
        bbox = draw.textbbox((0, 0), word, font=font)
        tw = bbox[2] - bbox[0]
        draw.text((cx - tw//2, y), word, font=font, fill=normal_color)
        return

    before = word[:idx]
    target = word[idx]
    after = word[idx+1:]

    def tw(s):
        if not s:
            return 0
        b = draw.textbbox((0, 0), s, font=font)
        return b[2] - b[0]

    bw, tw_, aw = tw(before), tw(target), tw(after)
    total_w = bw + tw_ + aw
    sx = cx - total_w // 2

    if before:
        draw.text((sx, y), before, font=font, fill=normal_color)
    draw.text((sx + bw, y), target, font=font, fill=highlight_color)
    if after:
        draw.text((sx + bw + tw_, y), after, font=font, fill=normal_color)

def create_card(card_id, letter, main_word, word_middle, word_end, query_main, query_mid, query_end):
    card = Image.new("RGBA", (CARD_W, CARD_H), TRANSPARENT)

    mask = Image.new("L", (CARD_W, CARD_H), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, CARD_W-1, CARD_H-1), radius=CARD_ROUND, fill=255)
    bg = Image.new("RGBA", (CARD_W, CARD_H), WHITE)
    bg.putalpha(mask)
    card.paste(bg, (0, 0), bg)

    draw = ImageDraw.Draw(card)

    comic_font = get_font("comic", BIG_LETTER_SIZE)
    main_comic_font = get_font("comic", MAIN_FONT_SIZE)
    small_comic_font = get_font("comic", SMALL_FONT_SIZE)

    # Big letter (top right, fully visible)
    draw.text((CARD_W - 35, 145), letter.upper(), font=comic_font, fill=BLACK, anchor="rs")

    # Main photo area (further reduced)
    ph_w = CARD_W - 2 * 20
    ph_h = int(CARD_H * PHOTO_AREA_RATIO)
    ph_y = 185

    main_queries = [f"{query_main} isolated white background", query_main]
    main_img = fetch_image(main_queries, f"{card_id}_main", "square", "large")
    if main_img:
        main_img = cover_fit(main_img, ph_w, ph_h)
        main_img = round_corners(main_img, PHOTO_ROUND)
        card.paste(main_img, (20, ph_y), main_img)
    photo_bottom = ph_y + ph_h

    # Main word (Comic Sans)
    word_y = photo_bottom + 30
    draw_highlighted(draw, main_word, letter, main_comic_font, CARD_W // 2, word_y, RED)

    # Example section
    ex_top_y = word_y + MAIN_FONT_SIZE + 50
    ex_photo_y = ex_top_y + 15

    for i, (word, query) in enumerate([(word_middle, query_mid), (word_end, query_end)]):
        cx = CARD_W // 4 * (2*i + 1)
        ex_queries = [f"{query} isolated white background", query]
        img = fetch_image(ex_queries, f"{card_id}_ex{i}", "square", "tiny")
        if img:
            img = circle_crop(img, SMALL_PHOTO_SIZE)
            card.paste(img, (cx - SMALL_PHOTO_SIZE//2, ex_photo_y), img)
        draw_highlighted(draw, word, letter, small_comic_font, cx, ex_photo_y + SMALL_PHOTO_SIZE + 8, RED)

    return card

def draw_crop_marks(draw, x, y, w, h):
    cl = CROP_LEN
    # Top-left
    draw.line([(x-cl, y), (x, y)], fill=BLACK, width=2)
    draw.line([(x, y-cl), (x, y)], fill=BLACK, width=2)
    # Top-right
    draw.line([(x+w, y), (x+w+cl, y)], fill=BLACK, width=2)
    draw.line([(x+w, y-cl), (x+w, y)], fill=BLACK, width=2)
    # Bottom-left
    draw.line([(x-cl, y+h), (x, y+h)], fill=BLACK, width=2)
    draw.line([(x, y+h), (x, y+h+cl)], fill=BLACK, width=2)
    # Bottom-right
    draw.line([(x+w, y+h), (x+w+cl, y+h)], fill=BLACK, width=2)
    draw.line([(x+w, y+h), (x+w, y+h+cl)], fill=BLACK, width=2)

def create_planche(card_images, planche_num):
    planche = Image.new("RGB", (A4_W, A4_H), WHITE)
    draw = ImageDraw.Draw(planche)

    margin_top = 15
    row1_y = margin_top

    # Row 1: 4 vertical cards
    n_vert = min(4, len(card_images))
    if n_vert > 0:
        gap = (A4_W - n_vert * CARD_W) // (n_vert + 1)
        for i in range(n_vert):
            x = gap + i * (CARD_W + gap)
            y = row1_y
            img = card_images[i]
            if img.mode == "RGBA":
                bg = Image.new("RGB", img.size, WHITE)
                bg.paste(img, mask=img.split()[3])
                planche.paste(bg, (x, y))
            else:
                planche.paste(img, (x, y))
            draw.rectangle([x, y, x+CARD_W-1, y+CARD_H-1], outline=GRAY, width=1)
            draw_crop_marks(draw, x, y, CARD_W, CARD_H)

    # Row 2: 2 horizontal cards (rotated 90°)
    horiz_cards = card_images[n_vert:]
    n_horiz = len(horiz_cards)
    if n_horiz > 0:
        row2_y = row1_y + CARD_H + 5
        gap = (A4_W - n_horiz * HORIZ_W) // (n_horiz + 1)
        for i in range(n_horiz):
            img = horiz_cards[i]
            img_rot = img.rotate(90, expand=True)
            x = gap + i * (HORIZ_W + gap)
            y = row2_y
            if img_rot.mode == "RGBA":
                bg = Image.new("RGB", img_rot.size, WHITE)
                bg.paste(img_rot, mask=img_rot.split()[3])
                planche.paste(bg, (x, y))
            else:
                planche.paste(img_rot, (x, y))
            draw.rectangle([x, y, x+HORIZ_W-1, y+HORIZ_H-1], outline=GRAY, width=1)
            draw_crop_marks(draw, x, y, HORIZ_W, HORIZ_H)

    # Save JPG
    jpg_path = os.path.join(PLANCHES_DIR, f"planche_{planche_num:02d}.jpg")
    planche.save(jpg_path, "JPEG", quality=95)

    # Save PDF
    pdf_path = os.path.join(PLANCHES_DIR, f"planche_{planche_num:02d}.pdf")
    planche.save(pdf_path, "PDF", resolution=DPI)

    return jpg_path, pdf_path

def main():
    t0 = time.time()
    os.makedirs(CARDS_DIR, exist_ok=True)
    os.makedirs(PLANCHES_DIR, exist_ok=True)

    total = len(CARDS)
    print(f"Generating {total} phonics cards...")

    card_images = []

    for idx, card_data in enumerate(CARDS):
        card_id, main_word, word_middle, word_end, theme, q_main, q_mid, q_end = card_data
        letter = card_id[0]
        out_path = os.path.join(CARDS_DIR, f"card_{card_id.lower()}.png")

        print(f"  [{idx+1}/{total}] Card {card_id} ({letter}): {main_word} / {word_middle} / {word_end}")

        card = create_card(card_id, letter, main_word, word_middle, word_end, q_main, q_mid, q_end)
        card.save(out_path, "PNG")
        card_images.append(card)

        if (idx + 1) % 6 == 0 or idx == total - 1:
            planche_num = (idx // 6) + 1
            start = (planche_num - 1) * 6
            batch = card_images[start:]
            jpg, pdf = create_planche(batch, planche_num)
            print(f"  → Planche {planche_num}: {jpg}")
            print(f"  → Planche {planche_num}: {pdf}")

    elapsed = time.time() - t0
    print(f"\n{'='*60}")
    print(f"Done! Generated {len(card_images)} cards.")
    print(f"Individual cards: {CARDS_DIR}/")
    print(f"Planches (PDF+JPG): {PLANCHES_DIR}/")
    print(f"Image cache: {CACHE_DIR}/")
    print(f"Time: {elapsed:.1f}s")

if __name__ == "__main__":
    main()
