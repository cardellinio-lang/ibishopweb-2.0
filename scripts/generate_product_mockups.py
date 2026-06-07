#!/usr/bin/env python3
"""Generate professional product mockups for ibishop card sets."""
import os, glob
from PIL import Image, ImageDraw, ImageFilter

OUTPUT_DIR = os.path.expanduser("~/Desktop/cartes_orthophonie")
PUBLIC_DIR = os.path.expanduser("~/Desktop/ibishopweb-2.0/public/products")
FONT_PATH = "/Users/traddax/Library/Fonts/Hacen-Tunisia-Bold.ttf"
os.makedirs(PUBLIC_DIR, exist_ok=True)

from PIL import ImageFont
import arabic_reshaper
from bidi.algorithm import get_display

def ar(text):
    return get_display(arabic_reshaper.reshape(text))

def rounded_rect(draw, xy, radius, fill):
    x1, y1, x2, y2 = xy
    draw.rectangle((x1+radius, y1, x2-radius, y2), fill=fill)
    draw.rectangle((x1, y1+radius, x2, y2-radius), fill=fill)
    draw.pieslice((x1, y1, x1+2*radius, y1+2*radius), 180, 270, fill=fill)
    draw.pieslice((x2-2*radius, y1, x2, y1+2*radius), 270, 360, fill=fill)
    draw.pieslice((x1, y2-2*radius, x1+2*radius, y2), 90, 180, fill=fill)
    draw.pieslice((x2-2*radius, y2-2*radius, x2, y2), 0, 90, fill=fill)

def drop_shadow(img, offset=(10, 10), blur=30, opacity=80):
    """Add drop shadow to an image (RGBA)."""
    shadow = Image.new("RGBA", img.size, (0,0,0,0))
    draw = ImageDraw.Draw(shadow)
    draw.rectangle((offset[0], offset[1], img.width+offset[0], img.height+offset[1]), fill=(0,0,0,opacity))
    shadow = shadow.filter(ImageFilter.GaussianBlur(blur))
    result = Image.new("RGBA", img.size, (0,0,0,0))
    result.paste(shadow, (0, 0), shadow)
    result.paste(img, (0, 0), img)
    return result

def mockup_box(theme="التذكير والتأنيث", colors_count=7, price_dzd=1800, output_path=None):
    """Main product photo: box on elegant background."""
    W, H = 1400, 1400
    bg = Image.new("RGB", (W, H), (248, 246, 242))
    
    # Subtle radial gradient
    for y in range(H):
        for x in range(W):
            dx, dy = x - W//2, y - H//2
            dist = (dx*dx + dy*dy) ** 0.5
            if dist < 600:
                factor = 1 - dist/1200
                r = int(248 + (255-248)*factor)
                g = int(246 + (250-246)*factor)
                b = int(242 + (245-242)*factor)
                bg.putpixel((x, y), (r, g, b))
    
    draw = ImageDraw.Draw(bg)
    
    # Decorative circles
    draw.ellipse((W-200, -100, W+100, 200), fill=(230, 225, 215))
    draw.ellipse((-150, H-150, 50, H+50), fill=(225, 220, 210))
    
    # Load box template
    box_path = os.path.join(OUTPUT_DIR, "boite_emballage.jpg")
    box = Image.open(box_path).convert("RGBA")
    
    # Scale box to fit nicely
    box_w, box_h = box.size
    target_w = 780
    scale = target_w / box_w
    box = box.resize((int(box_w*scale), int(box_h*scale)), Image.LANCZOS)
    
    # Add shadow and paste
    bx, by = (W - box.width)//2, (H - box.height)//2 - 20
    shadow = Image.new("RGBA", box.size, (0,0,0,0))
    sdraw = ImageDraw.Draw(shadow)
    sdraw.rectangle((15, 15, box.width+15, box.height+15), fill=(0,0,0,50))
    shadow = shadow.filter(ImageFilter.GaussianBlur(20))
    bg.paste(shadow, (bx-5, by-5), shadow)
    bg.paste(box, (bx, by), box)
    
    # Title text above box
    font_large = ImageFont.truetype(FONT_PATH, 48)
    font_small = ImageFont.truetype(FONT_PATH, 28)
    
    title = ar("الكلــــام الذكـــي")
    subtitle = ar(f"بطاقات {theme} — {colors_count} ألوان")
    
    # Title shadow
    tw, th = draw.textbbox((0,0), title, font=font_large)[2:4]
    tx = (W - tw) // 2
    draw.text((tx+2, 42+2), title, fill=(0,0,0,30), font=font_large)
    draw.text((tx, 40), title, fill=(60, 55, 50), font=font_large)
    
    # Subtitle
    sw, sh = draw.textbbox((0,0), subtitle, font=font_small)[2:4]
    sx = (W - sw) // 2
    draw.text((sx, 100), subtitle, fill=(150, 140, 130), font=font_small)
    
    # Price badge
    font_price = ImageFont.truetype(FONT_PATH, 36)
    badge_text = ar(f"{price_dzd} د.ج")
    bw, bh = draw.textbbox((0,0), badge_text, font=font_price)[2:4]
    badge_x = (W - bw - 60) // 2
    badge_y = by + box.height + 30
    rounded_rect(draw, (badge_x, badge_y, badge_x+bw+60, badge_y+bh+30), 20, (220, 80, 65))
    draw.text((badge_x+30, badge_y+12), badge_text, fill=(255,255,255), font=font_price)
    
    if output_path:
        bg.save(output_path, quality=95)
    return bg

def mockup_cards_spread(theme_dir, output_path=None):
    """Cards spread out on surface — shows card content."""
    W, H = 1400, 1000
    bg = Image.new("RGB", (W, H), (245, 240, 235))
    
    # Find card images
    card_files = sorted(glob.glob(os.path.join(theme_dir, "carte_*.jpg"))) + sorted(glob.glob(os.path.join(OUTPUT_DIR, "carte_pro_*.jpg")))
    if not card_files:
        card_files = sorted(glob.glob(os.path.join(theme_dir, "*.jpg")))
    # Filter to actual cards only (exclude planches)
    card_files = [f for f in card_files if "planche" not in os.path.basename(f) and "dos" not in os.path.basename(f)]
    
    if not card_files:
        # Fallback: use planche image
        planche_files = sorted(glob.glob(os.path.join(theme_dir, "planche_01.jpg")))
        if planche_files:
            img = Image.open(planche_files[0]).convert("RGBA")
            scale = min(W*0.8/img.width, H*0.8/img.height)
            img = img.resize((int(img.width*scale), int(img.height*scale)), Image.LANCZOS)
            img = drop_shadow(img, offset=(8,8), blur=15, opacity=60)
            bg.paste(img, ((W-img.width)//2, (H-img.height)//2), img)
            if output_path:
                bg.save(output_path, quality=92)
            return bg
        # Last resort blank
        draw = ImageDraw.Draw(bg)
        draw.text((W//2, H//2), "No cards available", fill=(150,150,150))
        if output_path:
            bg.save(output_path, quality=92)
        return bg
    
    # Take up to 12 cards and arrange them
    cards = card_files[:12]
    loaded = []
    for f in cards:
        try:
            c = Image.open(f).convert("RGBA")
            # Scale to small size
            cw = 280
            scale = cw / c.width
            c = c.resize((cw, int(c.height*scale)), Image.LANCZOS)
            loaded.append(c)
        except:
            continue
    
    if not loaded:
        if output_path:
            bg.save(output_path, quality=92)
        return bg
    
    # Arrange cards in a fan/spread pattern
    cx, cy = W//2, H//2 + 60
    base_angle = -30
    angle_step = 60 // max(len(loaded), 1)
    
    for i, card in enumerate(loaded):
        angle = base_angle + i * angle_step
        rot = card.rotate(angle, expand=True, fillcolor=(245,240,235))
        # Add shadow to rotated card
        rot = drop_shadow(rot, offset=(4,6), blur=10, opacity=50)
        rx = cx - rot.width//2 + int((i - len(loaded)/2) * 15)
        ry = cy - rot.height//2 + int(abs(i - len(loaded)/2) * 5)
        bg.paste(rot, (rx, ry), rot)
    
    if output_path:
        bg.save(output_path, quality=92)
    return bg

def mockup_card_closeup(theme_dir, output_path=None):
    """Close-up of a single PRO card."""
    W, H = 900, 1200
    bg = Image.new("RGB", (W, H), (250, 248, 244))
    
    # Find a card
    card_files = sorted(glob.glob(os.path.join(theme_dir, "carte_*.jpg")))
    card_files = [f for f in card_files if "planche" not in os.path.basename(f) and "dos" not in os.path.basename(f)]
    
    if not card_files:
        # Try main dir
        card_files = sorted(glob.glob(os.path.join(OUTPUT_DIR, "carte_pro_*.jpg")))
    
    if card_files:
        card = Image.open(card_files[0]).convert("RGBA")
        # Scale to fill most of the canvas
        scale = min(W*0.85/card.width, H*0.85/card.height)
        card = card.resize((int(card.width*scale), int(card.height*scale)), Image.LANCZOS)
        card = drop_shadow(card, offset=(8,8), blur=20, opacity=70)
        bg.paste(card, ((W-card.width)//2, (H-card.height)//2), card)
    else:
        draw = ImageDraw.Draw(bg)
        draw.text((W//2, H//2), "No card image", fill=(150,150,150))
    
    if output_path:
        bg.save(output_path, quality=95)
    return bg

if __name__ == "__main__":
    # Generate mockups for theme التذكير والتأنيث
    theme_dir = os.path.join(OUTPUT_DIR, "الكلام الذكي", "التذكير_والتأنيث_الصفات_والالوان")
    
    print("Generating box mockup...")
    mockup_box(output_path=os.path.join(PUBLIC_DIR, "box_mockup_main.jpg"))
    
    print("Generating cards spread mockup...")
    mockup_cards_spread(theme_dir, os.path.join(PUBLIC_DIR, "cards_spread.jpg"))
    
    print("Generating card closeup mockup...")
    mockup_card_closeup(theme_dir, os.path.join(PUBLIC_DIR, "card_closeup.jpg"))
    
    print("Done! Mockups saved to", PUBLIC_DIR)
