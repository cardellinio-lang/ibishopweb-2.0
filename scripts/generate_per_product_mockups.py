#!/usr/bin/env python3
"""Generate unique product mockups per card theme."""
import os, glob
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import arabic_reshaper
from bidi.algorithm import get_display

OUTPUT_DIR = os.path.expanduser("~/Desktop/cartes_orthophonie")
PUBLIC_DIR = os.path.expanduser("~/Desktop/ibishopweb-2.0/public/products")
FONT_PATH = "/Users/traddax/Library/Fonts/Hacen-Tunisia-Bold.ttf"
os.makedirs(PUBLIC_DIR, exist_ok=True)

def ar(text):
    return get_display(arabic_reshaper.reshape(text))

def drop_shadow(img, offset=(10, 10), blur=30, opacity=80):
    shadow = Image.new("RGBA", img.size, (0,0,0,0))
    draw = ImageDraw.Draw(shadow)
    draw.rectangle((offset[0], offset[1], img.width+offset[0], img.height+offset[1]), fill=(0,0,0,opacity))
    shadow = shadow.filter(ImageFilter.GaussianBlur(blur))
    result = Image.new("RGBA", img.size, (0,0,0,0))
    result.paste(shadow, (0, 0), shadow)
    result.paste(img, (0, 0), img)
    return result

def product_mockup(planche_path, color, title, price_str, card_count, output_path):
    """Create a product mockup using actual planche image as centerpiece."""
    W, H = 1200, 1200
    bg = Image.new("RGB", (W, H), (250, 248, 244))
    
    # Color accent strip at top
    draw = ImageDraw.Draw(bg)
    r, g, b = color
    draw.rectangle((0, 0, W, 180), fill=(r, g, b))
    
    # Decorative circle
    draw.ellipse((W-180, -100, W+80, 200), fill=(min(r+30,255), min(g+30,255), min(b+30,255)))
    
    # Title
    font_title = ImageFont.truetype(FONT_PATH, 44)
    font_sub = ImageFont.truetype(FONT_PATH, 26)
    font_price = ImageFont.truetype(FONT_PATH, 34)
    
    title_text = ar("الكلــــام الذكـــي")
    tw, th = draw.textbbox((0,0), title_text, font=font_title)[2:4]
    draw.text(((W - tw)//2, 40), title_text, fill=(255,255,255), font=font_title)
    
    subtitle = ar(f"{card_count} بطاقة")
    sw, sh = draw.textbbox((0,0), subtitle, font=font_sub)[2:4]
    draw.text(((W - sw)//2, 100), subtitle, fill=(255,255,255,200), font=font_sub)
    
    # Load planche image or single card
    img = None
    if os.path.exists(planche_path):
        img = Image.open(planche_path).convert("RGBA")
        # Scale planche to fit nicely
        target_w = 620
        scale = target_w / img.width
        img = img.resize((target_w, int(img.height * scale)), Image.LANCZOS)
    else:
        # Fallback: try to find a planche
        planches = sorted(glob.glob(os.path.join(OUTPUT_DIR, "planche_pro_01.jpg")))
        if planches:
            img = Image.open(planches[0]).convert("RGBA")
            target_w = 620
            scale = target_w / img.width
            img = img.resize((target_w, int(img.height * scale)), Image.LANCZOS)
    
    if img:
        img = drop_shadow(img, offset=(6, 8), blur=15, opacity=60)
        ix = (W - img.width) // 2
        iy = 210
        bg.paste(img, (ix, iy), img)
    
    # Price badge at bottom
    badge_text = ar(f"{price_str} د.ج")
    bw, bh = draw.textbbox((0,0), badge_text, font=font_price)[2:4]
    badge_w = bw + 60
    badge_h = bh + 30
    bx = (W - badge_w) // 2
    draw.rounded_rectangle((bx, 900, bx+badge_w, 900+badge_h), radius=25, fill=(r, g, b))
    draw.text((bx+30, 900+12), badge_text, fill=(255,255,255), font=font_price)
    
    # Category tag
    cat_text = ar("بطاقات علاج النطق")
    ct_size = 22
    font_cat = ImageFont.truetype(FONT_PATH, ct_size)
    cw, ch = draw.textbbox((0,0), cat_text, font=font_cat)[2:4]
    draw.text(((W - cw)//2, 970), cat_text, fill=(140, 135, 130), font=font_cat)
    
    bg.save(output_path, quality=95)
    return bg

def cards_arrangement(planche_path, color, output_path):
    """Cards spread out — secondary product image."""
    W, H = 1400, 1000
    bg = Image.new("RGB", (W, H), (245, 240, 235))
    draw = ImageDraw.Draw(bg)
    
    # Color gradient
    r, g, b = color
    draw.rectangle((0, 0, W, 8), fill=(r, g, b))
    
    if os.path.exists(planche_path):
        img = Image.open(planche_path).convert("RGBA")
        # Fit nicely
        scale = min(W*0.75/img.width, H*0.75/img.height)
        img = img.resize((int(img.width*scale), int(img.height*scale)), Image.LANCZOS)
        img = drop_shadow(img, offset=(8, 8), blur=20, opacity=70)
        bg.paste(img, ((W-img.width)//2, (H-img.height)//2), img)
    else:
        # Fallback: use box image
        box_path = os.path.join(OUTPUT_DIR, "boite_emballage.jpg")
        if os.path.exists(box_path):
            img = Image.open(box_path).convert("RGBA")
            scale = min(W*0.6/img.width, H*0.6/img.height)
            img = img.resize((int(img.width*scale), int(img.height*scale)), Image.LANCZOS)
            img = drop_shadow(img, offset=(6, 8), blur=15, opacity=60)
            bg.paste(img, ((W-img.width)//2, (H-img.height)//2), img)
    
    bg.save(output_path, quality=92)

if __name__ == "__main__":
    theme_dir = os.path.join(OUTPUT_DIR, "الكلام الذكي", "التذكير_والتأنيث_الصفات_والالوان")
    
    # 1. التذكير والتأنيث — purple
    planche = os.path.join(theme_dir, "planche_01.jpg")
    product_mockup(planche, (123, 31, 162), "التذكير والتأنيث", "1800", "63", 
                   os.path.join(PUBLIC_DIR, "mockup_theme_purple.jpg"))
    cards_arrangement(planche, (123, 31, 162), 
                      os.path.join(PUBLIC_DIR, "spread_theme_purple.jpg"))
    
    # 2. Association cards — teal
    planche = os.path.join(OUTPUT_DIR, "planche_pro_01.jpg")
    product_mockup(planche, (0, 105, 92), "الجمع والربط", "2200", "90",
                   os.path.join(PUBLIC_DIR, "mockup_assoc_teal.jpg"))
    cards_arrangement(planche, (0, 105, 92),
                      os.path.join(PUBLIC_DIR, "spread_assoc_teal.jpg"))
    
    # 3. Challenge cards — orange (use box)
    planche = os.path.join(OUTPUT_DIR, "boite_emballage.jpg")
    # For challenge cards, use a different layout
    W, H = 900, 900
    bg = Image.new("RGB", (W, H), (255, 248, 240))
    draw = ImageDraw.Draw(bg)
    draw.rectangle((0, 0, W, 140), fill=(230, 81, 0))
    draw.ellipse((-100, -100, 200, 200), fill=(255, 152, 0, 100))
    
    font_lg = ImageFont.truetype(FONT_PATH, 42)
    font_sm = ImageFont.truetype(FONT_PATH, 24)
    font_pr = ImageFont.truetype(FONT_PATH, 32)
    
    title = ar("بطاقات التحدي")
    tw, th = draw.textbbox((0,0), title, font=font_lg)[2:4]
    draw.text(((W-tw)//2, 35), title, fill=(255,255,255), font=font_lg)
    
    sub = ar("50 بطاقة — أسئلة وألغاز")
    sw, sh = draw.textbbox((0,0), sub, font=font_sm)[2:4]
    draw.text(((W-sw)//2, 90), sub, fill=(255,220,200), font=font_sm)
    
    # Simple decorative card shapes
    for i in range(3):
        y = 180 + i * 210
        x = 150 + i * 40
        card_w, card_h = 500, 350
        card = Image.new("RGBA", (card_w, card_h), (255, 255, 255))
        cdraw = ImageDraw.Draw(card)
        cdraw.rounded_rectangle((3, 3, card_w-3, card_h-3), radius=16, fill=(255,255,255), outline=(230, 225, 215), width=2)
        cdraw.rounded_rectangle((15, 15, card_w-15, card_h-15), radius=12, fill=(255, 243, 224))
        # Question mark symbol
        q_font = ImageFont.truetype(FONT_PATH, 80)
        qm = ar("?")
        qw, qh = draw.textbbox((0,0), qm, font=q_font)[2:4]
        draw.text((x + (card_w - qw)//2, y + 80), qm, fill=(230, 81, 0, 60), font=q_font)
        # Card shadow
        card = drop_shadow(card, offset=(4, 6), blur=10, opacity=40)
        bg.paste(card, (x, y), card)
    
    badge = ar("1200 د.ج")
    bw, bh = draw.textbbox((0,0), badge, font=font_pr)[2:4]
    bx = (W - bw - 60) // 2
    draw.rounded_rectangle((bx, 780, bx+bw+60, 780+bh+30), radius=25, fill=(230, 81, 0))
    draw.text((bx+30, 780+12), badge, fill=(255,255,255), font=font_pr)
    
    bg.save(os.path.join(PUBLIC_DIR, "mockup_challenge_orange.jpg"), quality=95)
    
    # Card spread for challenge
    cards_arrangement(planche, (230, 81, 0), os.path.join(PUBLIC_DIR, "spread_challenge_orange.jpg"))
    
    print("Product-specific mockups generated!")
