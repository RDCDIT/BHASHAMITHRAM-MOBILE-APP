import os
import math
from PIL import Image, ImageDraw, ImageFont

SIZE = 512

# Fonts
ML_EXTRABOLD = "/usr/share/fonts/truetype/noto/NotoSansMalayalam-ExtraBold.ttf"
ML_BOLD = "/usr/share/fonts/truetype/noto/NotoSansMalayalam-Bold.ttf"
EN_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

# Palette
INDIGO = (43, 44, 81)        # #2B2C51
TEAL = (0, 151, 120)         # #009778
LIGHT_TEAL = (67, 172, 152)  # #43AC98
WHITE = (255, 255, 255)
CREAM = (249, 246, 241)

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

# ====================================================================
# COLLECTION 1: "Clean Open Book Logo" (Inspired by Bhashamithram Logo)
# Simple, pure vector open-book silhouette with zero outer frame clutter
# ====================================================================
def book_logo_em():
    img = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 0))
    d = ImageDraw.Draw(img)
    
    # Left page (Teal): curved open book page
    # Spine center at x=256, y_top=130, y_bottom=410
    left_page = [(50, 155), (248, 105), (248, 385), (50, 435)]
    d.polygon(left_page, fill=TEAL)
    
    # Right page (Indigo)
    right_page = [(264, 105), (462, 155), (462, 435), (264, 385)]
    d.polygon(right_page, fill=INDIGO)
    
    # Spine bottom accent
    d.polygon([(248, 385), (256, 400), (264, 385)], fill=LIGHT_TEAL)
    
    # Left page text: 'A' (English)
    font_en = ImageFont.truetype(EN_BOLD, 175)
    center_text(d, "A", font_en, [50, 140, 248, 395], WHITE)
    
    # Right page text: 'അ' (Malayalam)
    font_ml = ImageFont.truetype(ML_EXTRABOLD, 155)
    center_text(d, "അ", font_ml, [264, 140, 462, 395], WHITE)
    return img

def book_logo_me():
    img = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 0))
    d = ImageDraw.Draw(img)
    
    # Left page (Indigo): 'അ'
    left_page = [(50, 155), (248, 105), (248, 385), (50, 435)]
    d.polygon(left_page, fill=INDIGO)
    
    # Right page (Teal): 'A'
    right_page = [(264, 105), (462, 155), (462, 435), (264, 385)]
    d.polygon(right_page, fill=TEAL)
    
    d.polygon([(248, 385), (256, 400), (264, 385)], fill=LIGHT_TEAL)
    
    font_ml = ImageFont.truetype(ML_EXTRABOLD, 155)
    center_text(d, "അ", font_ml, [50, 140, 248, 395], WHITE)
    
    font_en = ImageFont.truetype(EN_BOLD, 175)
    center_text(d, "A", font_en, [264, 140, 462, 395], WHITE)
    return img

def book_logo_mt():
    # Malayalam Synonym: Open book with 'വാ' and bookmark ribbon
    img = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 0))
    d = ImageDraw.Draw(img)
    
    # Both pages in Indigo
    left_page = [(50, 155), (248, 105), (248, 385), (50, 435)]
    d.polygon(left_page, fill=INDIGO)
    right_page = [(264, 105), (462, 155), (462, 435), (264, 385)]
    d.polygon(right_page, fill=INDIGO)
    
    # Teal bookmark ribbon hanging down center
    d.polygon([(246, 105), (266, 105), (266, 320), (256, 295), (246, 320)], fill=LIGHT_TEAL)
    d.polygon([(248, 385), (256, 400), (264, 385)], fill=LIGHT_TEAL)
    
    # Left page: 'വാ'
    font_ml = ImageFont.truetype(ML_EXTRABOLD, 145)
    center_text(d, "വാ", font_ml, [50, 140, 248, 395], WHITE)
    
    # Right page: 3 layered definition cards / lines
    for y in [185, 245, 305]:
        d.rounded_rectangle([295, y, 425, y + 26], radius=12, fill=TEAL)
    return img

def book_logo_mm():
    # Malayalam - Malayalam: Open book with 'അ' on both pages or centered
    img = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 0))
    d = ImageDraw.Draw(img)
    
    left_page = [(50, 155), (248, 105), (248, 385), (50, 435)]
    d.polygon(left_page, fill=TEAL)
    right_page = [(264, 105), (462, 155), (462, 435), (264, 385)]
    d.polygon(right_page, fill=TEAL)
    
    # Bookmark ribbon in Indigo
    d.polygon([(246, 105), (266, 105), (266, 320), (256, 295), (246, 320)], fill=INDIGO)
    d.polygon([(248, 385), (256, 400), (264, 385)], fill=INDIGO)
    
    font_ml = ImageFont.truetype(ML_EXTRABOLD, 155)
    center_text(d, "അ", font_ml, [50, 140, 248, 395], WHITE)
    center_text(d, "അ", font_ml, [264, 140, 462, 395], WHITE)
    return img

def book_logo_recent():
    # Recent Searches: Open book with a clean Clock Dial
    img = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 0))
    d = ImageDraw.Draw(img)
    
    # Simple, iconic Clock logo
    cx, cy, r = 256, 256, 175
    # Outer circle
    d.ellipse([cx-r, cy-r, cx+r, cy+r], fill=WHITE, outline=TEAL, width=28)
    
    # Inner clock ticks
    d.ellipse([cx-16, cy-16, cx+16, cy+16], fill=INDIGO)
    # Clock hands at 10:10
    d.line([(cx, cy), (cx - 70, cy - 70)], fill=INDIGO, width=24)
    d.line([(cx, cy), (cx + 90, cy - 45)], fill=LIGHT_TEAL, width=20)
    
    # Clean tick marks at 12, 3, 6, 9
    d.line([(cx, cy-r+14), (cx, cy-r+40)], fill=INDIGO, width=14)
    d.line([(cx+r-40, cy), (cx+r-14, cy)], fill=INDIGO, width=14)
    d.line([(cx, cy+r-40), (cx, cy+r-14)], fill=INDIGO, width=14)
    d.line([(cx-r+14, cy), (cx-r+40, cy)], fill=INDIGO, width=14)
    return img


# ====================================================================
# COLLECTION 2: "Minimalist Modern Lettermark Logos" (Pure Glyph / Symbol Logos)
# Ultra-simple, like Google / Apple design system
# ====================================================================
def lettermark_logo_em():
    # Modern circular emblem with 'A' and 'അ'
    img = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 0))
    d = ImageDraw.Draw(img)
    
    # Circle split in two colors or clean solid circle
    cx, cy, r = 256, 256, 210
    d.ellipse([cx-r, cy-r, cx+r, cy+r], fill=INDIGO)
    
    # Left 'A' in white, Right 'അ' in vibrant Light Teal
    font_a = ImageFont.truetype(EN_BOLD, 190)
    center_text(d, "A", font_a, [70, 100, 240, 412], WHITE)
    
    # Divider dot / bullet
    d.ellipse([244, 244, 268, 268], fill=LIGHT_TEAL)
    
    font_ml = ImageFont.truetype(ML_EXTRABOLD, 170)
    center_text(d, "അ", font_ml, [272, 100, 442, 412], LIGHT_TEAL)
    return img

def lettermark_logo_me():
    img = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 0))
    d = ImageDraw.Draw(img)
    
    cx, cy, r = 256, 256, 210
    d.ellipse([cx-r, cy-r, cx+r, cy+r], fill=TEAL)
    
    font_ml = ImageFont.truetype(ML_EXTRABOLD, 170)
    center_text(d, "അ", font_ml, [70, 100, 240, 412], WHITE)
    
    d.ellipse([244, 244, 268, 268], fill=WHITE)
    
    font_a = ImageFont.truetype(EN_BOLD, 190)
    center_text(d, "A", font_a, [272, 100, 442, 412], WHITE)
    return img

def lettermark_logo_mt():
    img = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 0))
    d = ImageDraw.Draw(img)
    
    cx, cy, r = 256, 256, 210
    d.ellipse([cx-r, cy-r, cx+r, cy+r], fill=INDIGO)
    
    font_ml = ImageFont.truetype(ML_EXTRABOLD, 220)
    center_text(d, "വാ", font_ml, [50, 70, SIZE-50, 390], WHITE)
    
    # 3 dots below for multiple meanings
    for x in [206, 256, 306]:
        d.ellipse([x-12, 385, x+12, 409], fill=LIGHT_TEAL)
    return img

def lettermark_logo_mm():
    img = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 0))
    d = ImageDraw.Draw(img)
    
    cx, cy, r = 256, 256, 210
    d.ellipse([cx-r, cy-r, cx+r, cy+r], fill=TEAL)
    
    font_ml = ImageFont.truetype(ML_EXTRABOLD, 260)
    center_text(d, "അ", font_ml, [50, 60, SIZE-50, 430], WHITE)
    return img

def lettermark_logo_recent():
    img = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 0))
    d = ImageDraw.Draw(img)
    
    cx, cy, r = 256, 256, 210
    d.ellipse([cx-r, cy-r, cx+r, cy+r], fill=INDIGO)
    
    # White clock inside
    cr = 120
    d.ellipse([cx-cr, cy-cr, cx+cr, cy+cr], outline=LIGHT_TEAL, width=18)
    d.ellipse([cx-14, cy-14, cx+14, cy+14], fill=WHITE)
    
    # Clock hands
    d.line([(cx, cy), (cx - 50, cy - 50)], fill=WHITE, width=18)
    d.line([(cx, cy), (cx + 65, cy - 35)], fill=LIGHT_TEAL, width=16)
    
    d.line([(cx, cy-cr+8), (cx, cy-cr+26)], fill=WHITE, width=10)
    d.line([(cx+cr-26, cy), (cx+cr-8, cy)], fill=WHITE, width=10)
    d.line([(cx, cy+cr-26), (cx, cy+cr-8)], fill=WHITE, width=10)
    d.line([(cx-cr+8, cy), (cx-cr+26, cy)], fill=WHITE, width=10)
    return img


# ====================================================================
# COLLECTION 3: "Minimalist Floating Icons" (Transparent, No Background Shape)
# Directly rendered on transparent background so the card background shines through!
# ====================================================================
def floating_logo_em():
    img = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 0))
    d = ImageDraw.Draw(img)
    
    font_a = ImageFont.truetype(EN_BOLD, 220)
    center_text(d, "A", font_a, [30, 80, 220, 420], INDIGO)
    
    # Translation arrow in Teal
    cy = 260
    d.line([(220, cy), (290, cy)], fill=TEAL, width=16)
    d.polygon([(280, cy-20), (315, cy), (280, cy+20)], fill=TEAL)
    
    font_ml = ImageFont.truetype(ML_EXTRABOLD, 200)
    center_text(d, "അ", font_ml, [300, 80, 490, 420], TEAL)
    return img

def floating_logo_me():
    img = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 0))
    d = ImageDraw.Draw(img)
    
    font_ml = ImageFont.truetype(ML_EXTRABOLD, 200)
    center_text(d, "അ", font_ml, [30, 80, 220, 420], TEAL)
    
    cy = 260
    d.line([(220, cy), (290, cy)], fill=INDIGO, width=16)
    d.polygon([(280, cy-20), (315, cy), (280, cy+20)], fill=INDIGO)
    
    font_a = ImageFont.truetype(EN_BOLD, 220)
    center_text(d, "A", font_a, [300, 80, 490, 420], INDIGO)
    return img

def floating_logo_mt():
    img = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 0))
    d = ImageDraw.Draw(img)
    
    font_ml = ImageFont.truetype(ML_EXTRABOLD, 260)
    center_text(d, "വാ", font_ml, [50, 60, SIZE-50, 400], INDIGO)
    
    # 3 meaning dots below in Teal
    for x in [186, 256, 326]:
        d.ellipse([x-16, 400, x+16, 432], fill=TEAL)
    return img

def floating_logo_mm():
    img = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 0))
    d = ImageDraw.Draw(img)
    
    # Pure, magnificent 'അ' in Teal
    font_ml = ImageFont.truetype(ML_EXTRABOLD, 340)
    center_text(d, "അ", font_ml, [30, 40, SIZE-30, 470], TEAL)
    return img

def floating_logo_recent():
    img = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 0))
    d = ImageDraw.Draw(img)
    
    cx, cy, r = 240, 240, 160
    d.ellipse([cx-r, cy-r, cx+r, cy+r], outline=INDIGO, width=28)
    d.ellipse([cx-18, cy-18, cx+18, cy+18], fill=INDIGO)
    
    d.line([(cx, cy), (cx - 65, cy - 65)], fill=INDIGO, width=24)
    d.line([(cx, cy), (cx + 85, cy - 40)], fill=TEAL, width=20)
    
    # Magnifying glass handle
    mx, my = cx + 90, cy + 90
    d.line([(mx, my), (mx + 85, my + 85)], fill=TEAL, width=32)
    return img


# ====================================================================
# SAVE ALL COLLECTIONS
# ====================================================================
base_dir = "scratch/simple_logos"
collections = [
    ("col_1_open_book", [book_logo_em, book_logo_me, book_logo_mt, book_logo_mm, book_logo_recent]),
    ("col_2_circular_seal", [lettermark_logo_em, lettermark_logo_me, lettermark_logo_mt, lettermark_logo_mm, lettermark_logo_recent]),
    ("col_3_floating_glyph", [floating_logo_em, floating_logo_me, floating_logo_mt, floating_logo_mm, floating_logo_recent]),
]

for c_key, funcs in collections:
    cdir = f"{base_dir}/{c_key}"
    os.makedirs(cdir, exist_ok=True)
    for fn, name in zip(funcs, ["em", "me", "mt", "mm", "recent"]):
        im = fn()
        im.save(f"{cdir}/{name}.png")

print("Generated all simple logos successfully.")
