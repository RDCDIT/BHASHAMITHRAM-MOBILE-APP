from PIL import Image, ImageDraw, ImageFont
import os

SIZE = 512

# Fonts
ML_EXTRABOLD = "/usr/share/fonts/truetype/noto/NotoSansMalayalam-ExtraBold.ttf"
ML_BOLD = "/usr/share/fonts/truetype/noto/NotoSansMalayalam-Bold.ttf"
EN_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

INDIGO = (43, 44, 81)        # #2B2C51
TEAL = (0, 151, 120)         # #009778
LIGHT_TEAL = (67, 172, 152)  # #43AC98
WHITE = (255, 255, 255)

def center_text(draw, text, font, bbox_rect, fill):
    tb = draw.textbbox((0, 0), text, font=font)
    tw = tb[2] - tb[0]
    th = tb[3] - tb[1]
    rx0, ry0, rx1, ry1 = bbox_rect
    rw = rx1 - rx0
    rh = ry1 - ry0
    x = rx0 + (rw - tw) / 2 - tb[0]
    y = ry0 + (rh - th) / 2 - tb[1]
    draw.text((x, y), text, fill=fill, font=font)

def draw_base_squircle():
    img = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 0))
    d = ImageDraw.Draw(img)
    # Outer Indigo Border
    d.rounded_rectangle([20, 20, SIZE-20, SIZE-20], radius=110, fill=WHITE, outline=INDIGO, width=16)
    # Inner Teal Border
    d.rounded_rectangle([42, 42, SIZE-42, SIZE-42], radius=90, outline=TEAL, width=8)
    return img, d

# 1. Malayalam -> English (ME) - Exactly matching user image!
def make_me():
    img, d = draw_base_squircle()
    
    # Book geometry:
    # Left page (Teal)
    d.polygon([(90, 130), (248, 90), (248, 410), (90, 450)], fill=TEAL)
    # Right page (Indigo)
    d.polygon([(264, 90), (422, 130), (422, 450), (264, 410)], fill=INDIGO)
    # Bottom spine triangle
    d.polygon([(248, 410), (256, 434), (264, 410)], fill=LIGHT_TEAL)
    
    # Left page: 'അ'
    font_ml = ImageFont.truetype(ML_EXTRABOLD, 185)
    center_text(d, "അ", font_ml, [90, 125, 248, 420], WHITE)
    
    # Right page: 'A'
    font_en = ImageFont.truetype(EN_BOLD, 210)
    center_text(d, "A", font_en, [264, 125, 422, 420], WHITE)
    return img

# 2. English -> Malayalam (EM)
def make_em():
    img, d = draw_base_squircle()
    
    # Left page (Teal): 'A'
    d.polygon([(90, 130), (248, 90), (248, 410), (90, 450)], fill=TEAL)
    # Right page (Indigo): 'അ'
    d.polygon([(264, 90), (422, 130), (422, 450), (264, 410)], fill=INDIGO)
    d.polygon([(248, 410), (256, 434), (264, 410)], fill=LIGHT_TEAL)
    
    font_en = ImageFont.truetype(EN_BOLD, 210)
    center_text(d, "A", font_en, [90, 125, 248, 420], WHITE)
    
    font_ml = ImageFont.truetype(ML_EXTRABOLD, 185)
    center_text(d, "അ", font_ml, [264, 125, 422, 420], WHITE)
    return img

# 3. Malayalam -> Malayalam (MM)
def make_mm():
    img, d = draw_base_squircle()
    
    # Left page (Teal): 'അ'
    d.polygon([(90, 130), (248, 90), (248, 410), (90, 450)], fill=TEAL)
    # Right page (Indigo): 'അ'
    d.polygon([(264, 90), (422, 130), (422, 450), (264, 410)], fill=INDIGO)
    d.polygon([(248, 410), (256, 434), (264, 410)], fill=LIGHT_TEAL)
    
    font_ml = ImageFont.truetype(ML_EXTRABOLD, 185)
    center_text(d, "അ", font_ml, [90, 125, 248, 420], WHITE)
    center_text(d, "അ", font_ml, [264, 125, 422, 420], WHITE)
    return img

# 4. Malayalam Synonym (MT / Nanartham / Vakkarivu)
def make_mt():
    img, d = draw_base_squircle()
    
    # Left page (Teal): 'വാ'
    d.polygon([(90, 130), (248, 90), (248, 410), (90, 450)], fill=TEAL)
    # Right page (Indigo): Layered definitions
    d.polygon([(264, 90), (422, 130), (422, 450), (264, 410)], fill=INDIGO)
    d.polygon([(248, 410), (256, 434), (264, 410)], fill=LIGHT_TEAL)
    
    font_ml = ImageFont.truetype(ML_EXTRABOLD, 175)
    center_text(d, "വാ", font_ml, [90, 125, 248, 420], WHITE)
    
    # 3 clean layered definition lines on right page
    for y in [180, 248, 316]:
        d.rounded_rectangle([292, y, 396, y + 26], radius=12, fill=WHITE)
    return img

# 5. Recent Searches / History
def make_recent():
    img, d = draw_base_squircle()
    
    # Clock dial inside squircle
    cx, cy, r = 256, 256, 135
    d.ellipse([cx-r, cy-r, cx+r, cy+r], fill=WHITE, outline=TEAL, width=18)
    d.ellipse([cx-14, cy-14, cx+14, cy+14], fill=INDIGO)
    
    # Hands at 10:10
    d.line([(cx, cy), (cx - 55, cy - 55)], fill=INDIGO, width=18)
    d.line([(cx, cy), (cx + 72, cy - 36)], fill=LIGHT_TEAL, width=16)
    
    # Tick marks
    d.line([(cx, cy-r+10), (cx, cy-r+28)], fill=INDIGO, width=10)
    d.line([(cx+r-28, cy), (cx+r-10, cy)], fill=INDIGO, width=10)
    d.line([(cx, cy+r-28), (cx, cy+r-10)], fill=INDIGO, width=10)
    d.line([(cx-r+10, cy), (cx-r+28, cy)], fill=INDIGO, width=10)
    return img

# Alternate 5b: Open book with Clock in right page
def make_recent_book():
    img, d = draw_base_squircle()
    
    d.polygon([(90, 130), (248, 90), (248, 410), (90, 450)], fill=TEAL)
    d.polygon([(264, 90), (422, 130), (422, 450), (264, 410)], fill=INDIGO)
    d.polygon([(248, 410), (256, 434), (264, 410)], fill=LIGHT_TEAL)
    
    # Left page: Search Glass
    mx, my, mr = 169, 270, 52
    d.ellipse([mx-mr, my-mr, mx+mr, my+mr], fill=TEAL, outline=WHITE, width=12)
    d.line([(mx+35, my+35), (mx+65, my+65)], fill=WHITE, width=16)
    
    # Right page: Clock
    cx, cy, r = 343, 270, 58
    d.ellipse([cx-r, cy-r, cx+r, cy+r], fill=INDIGO, outline=WHITE, width=12)
    d.ellipse([cx-8, cy-8, cx+8, cy+8], fill=WHITE)
    d.line([(cx, cy), (cx-24, cy-24)], fill=WHITE, width=10)
    d.line([(cx, cy), (cx+30, cy-14)], fill=LIGHT_TEAL, width=9)
    return img

os.makedirs("scratch/exact_badges", exist_ok=True)
im_me = make_me()
im_me.save("scratch/exact_badges/me.png")

im_em = make_em()
im_em.save("scratch/exact_badges/em.png")

im_mm = make_mm()
im_mm.save("scratch/exact_badges/mm.png")

im_mt = make_mt()
im_mt.save("scratch/exact_badges/mt.png")

im_recent = make_recent()
im_recent.save("scratch/exact_badges/recent.png")

im_recent_book = make_recent_book()
im_recent_book.save("scratch/exact_badges/recent_book.png")

print("Generated all exact badge images.")
