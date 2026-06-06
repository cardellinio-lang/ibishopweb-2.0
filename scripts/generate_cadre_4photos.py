#!/usr/bin/env python3
"""Generate 4 product photos for cadre decor orthophoniste — Etsy-style."""
import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import arabic_reshaper
from bidi.algorithm import get_display

PUBLIC_DIR = os.path.expanduser("~/Desktop/ibishopweb-2.0/public/products")
FONT_PATH = "/Users/traddax/Library/Fonts/Hacen-Tunisia-Bold.ttf"
os.makedirs(PUBLIC_DIR, exist_ok=True)

def ar(text):
    return get_display(arabic_reshaper.reshape(text))

def drop_shadow(img, offset=(6, 6), blur=12, opacity=50):
    shadow = Image.new("RGBA", img.size, (0,0,0,0))
    sdraw = ImageDraw.Draw(shadow)
    sdraw.rectangle((offset[0], offset[1], img.width+offset[0], img.height+offset[1]), fill=(0,0,0,opacity))
    shadow = shadow.filter(ImageFilter.GaussianBlur(blur))
    result = Image.new("RGBA", img.size, (0,0,0,0))
    result.paste(shadow, (0, 0), shadow)
    result.paste(img, (0, 0), img)
    return result

def draw_poster_content(draw, x, y, w, h):
    """Draw BREF JE SUIS ORTHOPHONISTE poster with exact style."""
    bg_color = (255, 252, 245)
    
    # Rounded poster background
    draw.rounded_rectangle((x, y, x+w, y+h), radius=12, fill=bg_color)
    draw.rounded_rectangle((x, y, x+w, y+h), radius=12, outline=(220, 200, 180), width=2)
    
    # Top decorative band - warm coral
    band_h = int(h * 0.11)
    band_colors = [(235, 120, 100), (230, 105, 85), (225, 95, 75)]
    seg_w = w // 3
    for i, col in enumerate(band_colors):
        draw.rectangle((x + 20 + i*seg_w, y + 15, x + min(20 + (i+1)*seg_w, w - 20), y + 15 + band_h), fill=col)
    
    # "BREF" - main title
    font_word = ImageFont.truetype(FONT_PATH, int(w * 0.09))
    word = "BREF"
    wt, _ = draw.textbbox((0, 0), word, font=font_word)[2:4]
    draw.text((x + (w - wt)//2, y + band_h + int(h * 0.04)), word, fill=(200, 80, 65), font=font_word)
    
    # "JE SUIS"
    font_sub = ImageFont.truetype(FONT_PATH, int(w * 0.045))
    sub = "JE SUIS"
    st, _ = draw.textbbox((0, 0), sub, font=font_sub)[2:4]
    draw.text((x + (w - st)//2, y + band_h + int(h * 0.12)), sub, fill=(130, 120, 110), font=font_sub)
    
    # "ORTHOPHONISTE"
    font_main = ImageFont.truetype(FONT_PATH, int(w * 0.065))
    main_word = "ORTHOPHONISTE"
    mt, _ = draw.textbbox((0, 0), main_word, font=font_main)[2:4]
    draw.text((x + (w - mt)//2, y + band_h + int(h * 0.17)), main_word, fill=(70, 60, 50), font=font_main)
    
    # Decorative line
    line_y = y + band_h + int(h * 0.27)
    draw.line([(x + int(w * 0.18), line_y), (x + int(w * 0.82), line_y)], fill=(200, 190, 175), width=2)
    
    # Arabic
    font_ar = ImageFont.truetype(FONT_PATH, int(w * 0.05))
    arabic = ar("أنا أخصائي تخاطب")
    at, _ = draw.textbbox((0, 0), arabic, font=font_ar)[2:4]
    draw.text((x + (w - at)//2, line_y + int(h * 0.03)), arabic, fill=(120, 110, 100), font=font_ar)
    
    # Icons row
    icon_y = line_y + int(h * 0.09)
    icons = ["✦", "✿", "✦"]
    font_icon = ImageFont.truetype(FONT_PATH, int(w * 0.035))
    for i, icon in enumerate(icons):
        iw, _ = draw.textbbox((0, 0), icon, font=font_icon)[2:4]
        ix = x + int(w * (0.25 + i * 0.25))
        draw.text((ix - iw//2, icon_y), icon, fill=(200, 160, 140), font=font_icon)
    
    # Bottom tag
    tag_y = icon_y + int(h * 0.05)
    tag = ar("— عيادة التخاطب —")
    font_tag = ImageFont.truetype(FONT_PATH, int(w * 0.035))
    tw, _ = draw.textbbox((0, 0), tag, font=font_tag)[2:4]
    draw.text((x + (w - tw)//2, tag_y), tag, fill=(180, 170, 160), font=font_tag)
    
    # Bottom band
    bband_h = int(h * 0.06)
    for i in range(bband_h):
        t = i / bband_h
        r = int(225 + (235 - 225) * t)
        g = int(95 + (120 - 95) * t)
        b = int(75 + (100 - 75) * t)
        draw.line([(x + 20, y + h - 15 - bband_h + i), (x + w - 20, y + h - 15 - bband_h + i)], fill=(r, g, b))

def photo1_digital_poster():
    """Photo 1: The poster design itself (clean product shot)."""
    W, H = 1400, 1000
    bg = Image.new("RGB", (W, H), (248, 245, 240))
    draw = ImageDraw.Draw(bg)
    
    # Subtle background pattern
    for i in range(0, W, 60):
        draw.line([(i, 0), (i, H)], fill=(243, 240, 235), width=1)
    for i in range(0, H, 60):
        draw.line([(0, i), (W, i)], fill=(243, 240, 235), width=1)
    
    # Poster dimensions
    pw, ph = int(W * 0.55), int(H * 0.75)
    px, py = (W - pw)//2, (H - ph)//2
    
    # Shadow behind poster
    shadow = Image.new("RGBA", (pw+40, ph+40), (0,0,0,0))
    sdraw = ImageDraw.Draw(shadow)
    sdraw.rounded_rectangle((10, 10, pw+30, ph+30), radius=15, fill=(0,0,0,55))
    shadow = shadow.filter(ImageFilter.GaussianBlur(20))
    bg.paste(shadow, (px-20, py-20), shadow)
    
    # White backing
    draw.rounded_rectangle((px, py, px+pw, py+ph), radius=15, fill=(255, 255, 255))
    draw.rounded_rectangle((px, py, px+pw, py+ph), radius=15, outline=(220, 210, 195), width=3)
    
    # Poster content
    margin = 30
    draw_poster_content(draw, px+margin, py+margin, pw-2*margin, ph-2*margin)
    
    # Price tag / label
    font_price = ImageFont.truetype(FONT_PATH, 22)
    price_label = "6900 د.ج"
    pw2, _ = draw.textbbox((0, 0), price_label, font=font_price)[2:4]
    draw.text((px + (pw - pw2)//2, py + ph + 20), price_label, fill=(200, 80, 70), font=font_price)
    
    path = os.path.join(PUBLIC_DIR, "cadre_photo1_poster.jpg")
    bg.save(path, quality=95)
    print(f"1/4: {path}")

def photo2_framed_wall():
    """Photo 2: Poster in a gold frame on a wall."""
    W, H = 1400, 1050
    bg = Image.new("RGB", (W, H), (245, 242, 237))
    draw = ImageDraw.Draw(bg)
    
    # Wall texture
    for i in range(0, W, 45):
        draw.line([(i, 0), (i, H)], fill=(240, 237, 232), width=1)
    for i in range(0, H, 45):
        draw.line([(0, i), (W, i)], fill=(240, 237, 232), width=1)
    
    # Frame
    fw, fh = int(W * 0.55), int(H * 0.7)
    fx, fy = (W - fw)//2, (H - fh)//2 - 20
    
    # Shadow
    shadow = Image.new("RGBA", (fw+50, fh+50), (0,0,0,0))
    sdraw = ImageDraw.Draw(shadow)
    sdraw.rounded_rectangle((10, 10, fw+40, fh+40), radius=12, fill=(0,0,0,60))
    shadow = shadow.filter(ImageFilter.GaussianBlur(25))
    bg.paste(shadow, (fx-25, fy-25), shadow)
    
    # Gold frame layers
    draw.rounded_rectangle((fx, fy, fx+fw, fy+fh), radius=10, fill=(175, 145, 85))
    draw.rounded_rectangle((fx+4, fy+4, fx+fw-4, fy+fh-4), radius=8, fill=(145, 115, 65))
    
    # Mat
    border = int(fw * 0.06)
    mx, my = fx+border, fy+border
    mw, mh = fw-2*border, fh-2*border
    draw.rounded_rectangle((mx, my, mx+mw, my+mh), radius=6, fill=(255, 253, 248))
    
    # Poster inside
    pm = int(mw * 0.04)
    draw_poster_content(draw, mx+pm, my+pm, mw-2*pm, mh-2*pm)
    
    path = os.path.join(PUBLIC_DIR, "cadre_photo2_frame.jpg")
    bg.save(path, quality=95)
    print(f"2/4: {path}")

def photo3_office_decor():
    """Photo 3: Office/cabinet decor scene — poster on wall with desk."""
    W, H = 1400, 1050
    bg = Image.new("RGB", (W, H), (248, 245, 240))
    draw = ImageDraw.Draw(bg)
    
    # Wall (top 60%)
    wall_h = int(H * 0.62)
    for i in range(0, W, 50):
        draw.line([(i, 0), (i, wall_h)], fill=(243, 240, 235), width=1)
    for i in range(0, wall_h, 50):
        draw.line([(0, i), (W, i)], fill=(243, 240, 235), width=1)
    
    # Warm band at wall bottom
    draw.line([(0, wall_h), (W, wall_h)], fill=(220, 200, 180), width=4)
    
    # Desk (bottom part)
    desk_y = wall_h + 8
    draw.rectangle((0, desk_y, W, H), fill=(100, 85, 70))
    # Desk top surface
    draw.rectangle((0, desk_y, W, desk_y + 15), fill=(130, 110, 90))
    
    # Items on desk
    # Small plant
    plant_x, plant_y = int(W * 0.15), desk_y + 25
    draw.rectangle((plant_x, plant_y, plant_x+30, plant_y+50), fill=(90, 75, 55))
    draw.ellipse((plant_x-15, plant_y-20, plant_x+45, plant_y+5), fill=(80, 160, 80))
    draw.ellipse((plant_x-5, plant_y-35, plant_x+35, plant_y-5), fill=(60, 140, 60))
    
    # Book
    book_x, book_y = int(W * 0.78), desk_y + 10
    draw.rounded_rectangle((book_x, book_y, book_x+25, book_y+65), radius=3, fill=(60, 55, 120))
    draw.rounded_rectangle((book_x+3, book_y+10, book_x+22, book_y+20), radius=2, fill=(200, 180, 100))
    
    # Frame on wall
    fw, fh = int(W * 0.42), int(H * 0.5)
    fx, fy = (W - fw)//2, int(H * 0.06)
    
    shadow = Image.new("RGBA", (fw+40, fh+40), (0,0,0,0))
    sdraw = ImageDraw.Draw(shadow)
    sdraw.rounded_rectangle((10, 10, fw+30, fh+30), radius=10, fill=(0,0,0,50))
    shadow = shadow.filter(ImageFilter.GaussianBlur(20))
    bg.paste(shadow, (fx-20, fy-20), shadow)
    
    # Frame
    draw.rounded_rectangle((fx, fy, fx+fw, fy+fh), radius=8, fill=(175, 145, 85))
    draw.rounded_rectangle((fx+3, fy+3, fx+fw-3, fy+fh-3), radius=6, fill=(145, 115, 65))
    
    border2 = int(fw * 0.06)
    mx2, my2 = fx+border2, fy+border2
    mw2, mh2 = fw-2*border2, fh-2*border2
    draw.rounded_rectangle((mx2, my2, mx2+mw2, my2+mh2), radius=5, fill=(255, 253, 248))
    
    pm2 = int(mw2 * 0.03)
    draw_poster_content(draw, mx2+pm2, my2+pm2, mw2-2*pm2, mh2-2*pm2)
    
    path = os.path.join(PUBLIC_DIR, "cadre_photo3_office.jpg")
    bg.save(path, quality=95)
    print(f"3/4: {path}")

def photo4_detail_closeup():
    """Photo 4: Detail closeup of the poster design."""
    W, H = 1200, 900
    bg = Image.new("RGB", (W, H), (255, 253, 248))
    draw = ImageDraw.Draw(bg)
    
    # Corner decoration
    draw.ellipse((-50, -50, 150, 150), fill=(245, 240, 235))
    draw.ellipse((W-100, H-100, W+50, H+50), fill=(245, 240, 235))
    
    # Poster detail
    pw, ph = int(W * 0.7), int(H * 0.75)
    px, py = (W - pw)//2, (H - ph)//2
    
    shadow = Image.new("RGBA", (pw+30, ph+30), (0,0,0,0))
    sdraw = ImageDraw.Draw(shadow)
    sdraw.rounded_rectangle((10, 10, pw+20, ph+20), radius=12, fill=(0,0,0,45))
    shadow = shadow.filter(ImageFilter.GaussianBlur(15))
    bg.paste(shadow, (px-15, py-15), shadow)
    
    draw.rounded_rectangle((px, py, px+pw, py+ph), radius=12, fill=(255, 255, 255))
    draw.rounded_rectangle((px, py, px+pw, py+ph), radius=12, outline=(220, 210, 195), width=2)
    
    m = int(pw * 0.04)
    draw_poster_content(draw, px+m, py+m, pw-2*m, ph-2*m)
    
    # Corner label
    font_label = ImageFont.truetype(FONT_PATH, 18)
    quality = ar("جودة طباعة عالية")
    lw, _ = draw.textbbox((0, 0), quality, font=font_label)[2:4]
    draw.text((px + pw - lw - 15, py + ph + 15), quality, fill=(160, 150, 140), font=font_label)
    
    path = os.path.join(PUBLIC_DIR, "cadre_photo4_detail.jpg")
    bg.save(path, quality=95)
    print(f"4/4: {path}")

if __name__ == "__main__":
    photo1_digital_poster()
    photo2_framed_wall()
    photo3_office_decor()
    photo4_detail_closeup()
    print("All 4 photos generated!")
