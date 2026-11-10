import os
from PIL import Image, ImageDraw, ImageFont

SIZE = 512

# Fonts
ML_EXTRABOLD = "/usr/share/fonts/truetype/noto/NotoSansMalayalam-ExtraBold.ttf"
ML_BOLD = "/usr/share/fonts/truetype/noto/NotoSansMalayalam-Bold.ttf"
EN_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

# Colors from Palette
COLOR_INDIGO = (43, 44, 81)       # #2B2C51
COLOR_TEAL = (0, 151, 120)        # #009778
COLOR_TEAL_LIGHT = (67, 172, 152) # #43AC98
COLOR_TEAL_BG = (238, 250, 247)   # soft pastel teal
COLOR_INDIGO_BG = (240, 240, 248) # soft pastel indigo
COLOR_WHITE = (255, 255, 255)
COLOR_BORDER = (223, 220, 217)    # #DFDCD9
COLOR_CARD_BG = (254, 254, 254)

def center_text(draw, text, font, bbox_rect, fill):
    """Accurately center text inside bbox_rect [x0, y0, x1, y1]"""
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
# STYLE 1: "Modern Squircle Tiles" (Crisp White Tile with Teal Border & Balanced Glyphs)
# ====================================================================
def s1_em():
    img = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 0))
    d = ImageDraw.Draw(img)
    # Squircle background
    d.rounded_rectangle([20, 20, SIZE-20, SIZE-20], radius=115, fill=COLOR_WHITE, outline=COLOR_TEAL, width=16)
    # Inner soft tint container
    d.rounded_rectangle([48, 48, SIZE-48, SIZE-48], radius=90, fill=COLOR_TEAL_BG)
    
    # Left pill for 'A'
    d.rounded_rectangle([75, 110, 215, 330], radius=50, fill=COLOR_INDIGO)
    font_a = ImageFont.truetype(EN_BOLD, 125)
    center_text(d, "A", font_a, [75, 110, 215, 330], COLOR_WHITE)
    
    # Right pill for 'അ'
    d.rounded_rectangle([297, 110, 437, 330], radius=50, fill=COLOR_TEAL)
    font_mal = ImageFont.truetype(ML_EXTRABOLD, 110)
    center_text(d, "അ", font_mal, [297, 110, 437, 330], COLOR_WHITE)
    
    # Center Arrow badge
    cx = 256
    cy = 220
    d.rounded_rectangle([cx-26, cy-26, cx+26, cy+26], radius=14, fill=COLOR_WHITE, outline=COLOR_BORDER, width=3)
    # Arrow icon
    d.line([(cx-12, cy), (cx+8, cy)], fill=COLOR_INDIGO, width=6)
    d.polygon([(cx+6, cy-9), (cx+16, cy), (cx+6, cy+9)], fill=COLOR_INDIGO)
    
    # Bottom Direction Pill
    d.rounded_rectangle([150, 375, 362, 430], radius=24, fill=COLOR_INDIGO)
    font_tag = ImageFont.truetype(EN_BOLD, 26)
    center_text(d, "EN ➔ ML", font_tag, [150, 375, 362, 430], COLOR_WHITE)
    return img

def s1_me():
    img = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([20, 20, SIZE-20, SIZE-20], radius=115, fill=COLOR_WHITE, outline=COLOR_TEAL, width=16)
    d.rounded_rectangle([48, 48, SIZE-48, SIZE-48], radius=90, fill=COLOR_TEAL_BG)
    
    # Left pill for 'അ'
    d.rounded_rectangle([75, 110, 215, 330], radius=50, fill=COLOR_TEAL)
    font_mal = ImageFont.truetype(ML_EXTRABOLD, 110)
    center_text(d, "അ", font_mal, [75, 110, 215, 330], COLOR_WHITE)
    
    # Right pill for 'A'
    d.rounded_rectangle([297, 110, 437, 330], radius=50, fill=COLOR_INDIGO)
    font_a = ImageFont.truetype(EN_BOLD, 125)
    center_text(d, "A", font_a, [297, 110, 437, 330], COLOR_WHITE)
    
    # Center Arrow badge
    cx = 256
    cy = 220
    d.rounded_rectangle([cx-26, cy-26, cx+26, cy+26], radius=14, fill=COLOR_WHITE, outline=COLOR_BORDER, width=3)
    d.line([(cx-12, cy), (cx+8, cy)], fill=COLOR_TEAL, width=6)
    d.polygon([(cx+6, cy-9), (cx+16, cy), (cx+6, cy+9)], fill=COLOR_TEAL)
    
    # Bottom Direction Pill
    d.rounded_rectangle([150, 375, 362, 430], radius=24, fill=COLOR_TEAL)
    font_tag = ImageFont.truetype(EN_BOLD, 26)
    center_text(d, "ML ➔ EN", font_tag, [150, 375, 362, 430], COLOR_WHITE)
    return img

def s1_mt():
    img = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([20, 20, SIZE-20, SIZE-20], radius=115, fill=COLOR_WHITE, outline=COLOR_TEAL, width=16)
    d.rounded_rectangle([48, 48, SIZE-48, SIZE-48], radius=90, fill=COLOR_TEAL_BG)
    
    # Central container card
    d.rounded_rectangle([130, 95, 382, 345], radius=55, fill=COLOR_INDIGO)
    
    # Center glyph 'വാ'
    font_mal = ImageFont.truetype(ML_EXTRABOLD, 140)
    center_text(d, "വാ", font_mal, [130, 95, 382, 345], COLOR_WHITE)
    
    # Layered cards icon effect behind/around
    d.rounded_rectangle([92, 135, 120, 305], radius=10, fill=COLOR_TEAL)
    d.rounded_rectangle([392, 135, 420, 305], radius=10, fill=COLOR_TEAL)
    
    # Bottom tag
    d.rounded_rectangle([135, 375, 377, 430], radius=24, fill=COLOR_INDIGO)
    font_tag = ImageFont.truetype(ML_BOLD, 26)
    center_text(d, "നാനാർത്ഥം", font_tag, [135, 375, 377, 430], COLOR_WHITE)
    return img

def s1_mm():
    img = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([20, 20, SIZE-20, SIZE-20], radius=115, fill=COLOR_WHITE, outline=COLOR_TEAL, width=16)
    d.rounded_rectangle([48, 48, SIZE-48, SIZE-48], radius=90, fill=COLOR_TEAL_BG)
    
    # Central prominent card with 'അ'
    d.rounded_rectangle([130, 95, 382, 345], radius=55, fill=COLOR_TEAL)
    font_mal = ImageFont.truetype(ML_EXTRABOLD, 160)
    center_text(d, "അ", font_mal, [130, 95, 382, 345], COLOR_WHITE)
    
    # Elegant book accents on sides
    d.rounded_rectangle([92, 135, 120, 305], radius=10, fill=COLOR_INDIGO)
    d.rounded_rectangle([392, 135, 420, 305], radius=10, fill=COLOR_INDIGO)
    
    # Bottom tag
    d.rounded_rectangle([150, 375, 362, 430], radius=24, fill=COLOR_INDIGO)
    font_tag = ImageFont.truetype(EN_BOLD, 26)
    center_text(d, "ML ➔ ML", font_tag, [150, 375, 362, 430], COLOR_WHITE)
    return img

def s1_recent():
    img = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([20, 20, SIZE-20, SIZE-20], radius=115, fill=COLOR_WHITE, outline=COLOR_TEAL, width=16)
    d.rounded_rectangle([48, 48, SIZE-48, SIZE-48], radius=90, fill=COLOR_TEAL_BG)
    
    # Static Clean Clock Dial
    cx, cy, r = 240, 220, 100
    d.ellipse([cx-r, cy-r, cx+r, cy+r], fill=COLOR_WHITE, outline=COLOR_INDIGO, width=14)
    d.ellipse([cx-9, cy-9, cx+9, cy+9], fill=COLOR_INDIGO)
    
    # Static clock hands (at 10:10)
    d.line([(cx, cy), (cx - 42, cy - 42)], fill=COLOR_INDIGO, width=14)
    d.line([(cx, cy), (cx + 55, cy - 30)], fill=COLOR_TEAL, width=12)
    
    # Tick marks
    d.line([(cx, cy-r+8), (cx, cy-r+24)], fill=COLOR_INDIGO, width=8)
    d.line([(cx+r-24, cy), (cx+r-8, cy)], fill=COLOR_INDIGO, width=8)
    d.line([(cx, cy+r-24), (cx, cy+r-8)], fill=COLOR_INDIGO, width=8)
    d.line([(cx-r+8, cy), (cx-r+24, cy)], fill=COLOR_INDIGO, width=8)
    
    # Magnifier at bottom right
    mx, my, mr = 345, 305, 46
    d.ellipse([mx-mr, my-mr, mx+mr, my+mr], fill=COLOR_WHITE, outline=COLOR_TEAL, width=12)
    d.line([(mx+32, my+32), (mx+62, my+62)], fill=COLOR_TEAL, width=16)
    
    # Bottom tag
    d.rounded_rectangle([150, 375, 362, 430], radius=24, fill=COLOR_INDIGO)
    font_tag = ImageFont.truetype(ML_BOLD, 26)
    center_text(d, "ചരിത്രം", font_tag, [150, 375, 362, 430], COLOR_WHITE)
    return img

# ====================================================================
# STYLE 2: "Solid Premium App Tiles" (Solid Indigo & Teal Rounded Squircles)
# ====================================================================
def s2_em():
    img = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([20, 20, SIZE-20, SIZE-20], radius=115, fill=COLOR_INDIGO)
    d.rounded_rectangle([36, 36, SIZE-36, SIZE-36], radius=100, outline=COLOR_TEAL_LIGHT, width=5)
    
    # White card tile for 'A'
    d.rounded_rectangle([75, 110, 215, 330], radius=45, fill=COLOR_WHITE)
    font_a = ImageFont.truetype(EN_BOLD, 125)
    center_text(d, "A", font_a, [75, 110, 215, 330], COLOR_INDIGO)
    
    # Teal card tile for 'അ'
    d.rounded_rectangle([297, 110, 437, 330], radius=45, fill=COLOR_TEAL)
    font_mal = ImageFont.truetype(ML_EXTRABOLD, 110)
    center_text(d, "അ", font_mal, [297, 110, 437, 330], COLOR_WHITE)
    
    # Center Arrow
    cx = 256
    cy = 220
    d.line([(cx-18, cy), (cx+10, cy)], fill=COLOR_TEAL_LIGHT, width=8)
    d.polygon([(cx+8, cy-12), (cx+22, cy), (cx+8, cy+12)], fill=COLOR_TEAL_LIGHT)
    
    # Bottom Tag
    font_tag = ImageFont.truetype(EN_BOLD, 30)
    center_text(d, "ENGLISH ➔ ML", font_tag, [50, 370, SIZE-50, 430], COLOR_WHITE)
    return img

def s2_me():
    img = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([20, 20, SIZE-20, SIZE-20], radius=115, fill=COLOR_TEAL)
    d.rounded_rectangle([36, 36, SIZE-36, SIZE-36], radius=100, outline=COLOR_WHITE, width=5)
    
    # White tile for 'അ'
    d.rounded_rectangle([75, 110, 215, 330], radius=45, fill=COLOR_WHITE)
    font_mal = ImageFont.truetype(ML_EXTRABOLD, 110)
    center_text(d, "അ", font_mal, [75, 110, 215, 330], COLOR_TEAL)
    
    # Indigo tile for 'A'
    d.rounded_rectangle([297, 110, 437, 330], radius=45, fill=COLOR_INDIGO)
    font_a = ImageFont.truetype(EN_BOLD, 125)
    center_text(d, "A", font_a, [297, 110, 437, 330], COLOR_WHITE)
    
    # Center Arrow
    cx = 256
    cy = 220
    d.line([(cx-18, cy), (cx+10, cy)], fill=COLOR_WHITE, width=8)
    d.polygon([(cx+8, cy-12), (cx+22, cy), (cx+8, cy+12)], fill=COLOR_WHITE)
    
    font_tag = ImageFont.truetype(EN_BOLD, 30)
    center_text(d, "ML ➔ ENGLISH", font_tag, [50, 370, SIZE-50, 430], COLOR_WHITE)
    return img

def s2_mt():
    img = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([20, 20, SIZE-20, SIZE-20], radius=115, fill=COLOR_INDIGO)
    d.rounded_rectangle([36, 36, SIZE-36, SIZE-36], radius=100, outline=COLOR_TEAL_LIGHT, width=5)
    
    # Central white squircle with 'വാ'
    d.rounded_rectangle([130, 95, 382, 345], radius=50, fill=COLOR_WHITE)
    font_mal = ImageFont.truetype(ML_EXTRABOLD, 140)
    center_text(d, "വാ", font_mal, [130, 95, 382, 345], COLOR_INDIGO)
    
    font_tag = ImageFont.truetype(ML_BOLD, 32)
    center_text(d, "നാനാർത്ഥം", font_tag, [50, 370, SIZE-50, 430], COLOR_WHITE)
    return img

def s2_mm():
    img = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([20, 20, SIZE-20, SIZE-20], radius=115, fill=COLOR_TEAL)
    d.rounded_rectangle([36, 36, SIZE-36, SIZE-36], radius=100, outline=COLOR_WHITE, width=5)
    
    # Central white squircle with 'അ'
    d.rounded_rectangle([130, 95, 382, 345], radius=50, fill=COLOR_WHITE)
    font_mal = ImageFont.truetype(ML_EXTRABOLD, 160)
    center_text(d, "അ", font_mal, [130, 95, 382, 345], COLOR_TEAL)
    
    font_tag = ImageFont.truetype(ML_BOLD, 32)
    center_text(d, "പദമിത്രം", font_tag, [50, 370, SIZE-50, 430], COLOR_WHITE)
    return img

def s2_recent():
    img = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([20, 20, SIZE-20, SIZE-20], radius=115, fill=COLOR_INDIGO)
    d.rounded_rectangle([36, 36, SIZE-36, SIZE-36], radius=100, outline=COLOR_TEAL_LIGHT, width=5)
    
    cx, cy, r = 256, 215, 105
    d.ellipse([cx-r, cy-r, cx+r, cy+r], fill=COLOR_WHITE, outline=COLOR_TEAL_LIGHT, width=8)
    d.ellipse([cx-9, cy-9, cx+9, cy+9], fill=COLOR_INDIGO)
    
    d.line([(cx, cy), (cx - 45, cy - 45)], fill=COLOR_INDIGO, width=14)
    d.line([(cx, cy), (cx + 58, cy - 30)], fill=COLOR_TEAL, width=12)
    
    font_tag = ImageFont.truetype(ML_BOLD, 32)
    center_text(d, "ചരിത്രം", font_tag, [50, 370, SIZE-50, 430], COLOR_WHITE)
    return img

# ====================================================================
# STYLE 3: "Open Book Emblem" (Cultural Dictionary Silhouette)
# ====================================================================
def s3_em():
    img = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([20, 20, SIZE-20, SIZE-20], radius=115, fill=COLOR_WHITE, outline=COLOR_BORDER, width=4)
    
    # Left book page (Indigo)
    d.polygon([(90, 150), (250, 115), (250, 345), (90, 380)], fill=COLOR_INDIGO)
    # Right book page (Teal)
    d.polygon([(262, 115), (422, 150), (422, 380), (262, 345)], fill=COLOR_TEAL)
    
    font_a = ImageFont.truetype(EN_BOLD, 120)
    center_text(d, "A", font_a, [90, 140, 250, 350], COLOR_WHITE)
    
    font_mal = ImageFont.truetype(ML_EXTRABOLD, 105)
    center_text(d, "അ", font_mal, [262, 140, 422, 350], COLOR_WHITE)
    
    font_tag = ImageFont.truetype(EN_BOLD, 26)
    center_text(d, "ENGLISH ➔ MALAYALAM", font_tag, [50, 410, SIZE-50, 460], COLOR_INDIGO)
    return img

def s3_me():
    img = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([20, 20, SIZE-20, SIZE-20], radius=115, fill=COLOR_WHITE, outline=COLOR_BORDER, width=4)
    
    d.polygon([(90, 150), (250, 115), (250, 345), (90, 380)], fill=COLOR_TEAL)
    d.polygon([(262, 115), (422, 150), (422, 380), (262, 345)], fill=COLOR_INDIGO)
    
    font_mal = ImageFont.truetype(ML_EXTRABOLD, 105)
    center_text(d, "അ", font_mal, [90, 140, 250, 350], COLOR_WHITE)
    
    font_a = ImageFont.truetype(EN_BOLD, 120)
    center_text(d, "A", font_a, [262, 140, 422, 350], COLOR_WHITE)
    
    font_tag = ImageFont.truetype(EN_BOLD, 26)
    center_text(d, "MALAYALAM ➔ ENGLISH", font_tag, [50, 410, SIZE-50, 460], COLOR_TEAL)
    return img

def s3_mt():
    img = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([20, 20, SIZE-20, SIZE-20], radius=115, fill=COLOR_WHITE, outline=COLOR_BORDER, width=4)
    
    d.polygon([(90, 150), (250, 115), (250, 345), (90, 380)], fill=COLOR_INDIGO)
    d.polygon([(262, 115), (422, 150), (422, 380), (262, 345)], fill=COLOR_INDIGO)
    
    # Bookmark ribbon in middle
    d.polygon([(248, 115), (264, 115), (264, 280), (256, 260), (248, 280)], fill=COLOR_TEAL)
    
    font_mal = ImageFont.truetype(ML_EXTRABOLD, 100)
    center_text(d, "വാ", font_mal, [90, 140, 250, 350], COLOR_WHITE)
    center_text(d, "ക്", font_mal, [262, 140, 422, 350], COLOR_WHITE)
    
    font_tag = ImageFont.truetype(ML_BOLD, 28)
    center_text(d, "വാക്കറിവ് / നാനാർത്ഥം", font_tag, [50, 410, SIZE-50, 460], COLOR_INDIGO)
    return img

def s3_mm():
    img = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([20, 20, SIZE-20, SIZE-20], radius=115, fill=COLOR_WHITE, outline=COLOR_BORDER, width=4)
    
    d.polygon([(90, 150), (250, 115), (250, 345), (90, 380)], fill=COLOR_TEAL)
    d.polygon([(262, 115), (422, 150), (422, 380), (262, 345)], fill=COLOR_TEAL)
    
    d.polygon([(248, 115), (264, 115), (264, 280), (256, 260), (248, 280)], fill=COLOR_INDIGO)
    
    font_mal = ImageFont.truetype(ML_EXTRABOLD, 105)
    center_text(d, "അ", font_mal, [90, 140, 250, 350], COLOR_WHITE)
    center_text(d, "അ", font_mal, [262, 140, 422, 350], COLOR_WHITE)
    
    font_tag = ImageFont.truetype(ML_BOLD, 28)
    center_text(d, "മലയാളം - മലയാളം", font_tag, [50, 410, SIZE-50, 460], COLOR_TEAL)
    return img

def s3_recent():
    img = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([20, 20, SIZE-20, SIZE-20], radius=115, fill=COLOR_WHITE, outline=COLOR_BORDER, width=4)
    
    cx, cy, r = 256, 230, 105
    d.ellipse([cx-r, cy-r, cx+r, cy+r], fill=COLOR_TEAL_BG, outline=COLOR_TEAL, width=14)
    d.ellipse([cx-9, cy-9, cx+9, cy+9], fill=COLOR_INDIGO)
    
    d.line([(cx, cy), (cx - 45, cy - 45)], fill=COLOR_INDIGO, width=14)
    d.line([(cx, cy), (cx + 58, cy - 30)], fill=COLOR_TEAL, width=12)
    
    # Magnifier handle
    d.line([(cx+70, cy+70), (cx+130, cy+130)], fill=COLOR_INDIGO, width=22)
    
    font_tag = ImageFont.truetype(ML_BOLD, 28)
    center_text(d, "സമീപകാല തിരയലുകൾ", font_tag, [50, 410, SIZE-50, 460], COLOR_INDIGO)
    return img

# Save all
out_dir = "scratch/perfect_styles"
for sk, funcs in [
    ("style_1", [s1_em, s1_me, s1_mt, s1_mm, s1_recent]),
    ("style_2", [s2_em, s2_me, s2_mt, s2_mm, s2_recent]),
    ("style_3", [s3_em, s3_me, s3_mt, s3_mm, s3_recent])
]:
    d_path = f"{out_dir}/{sk}"
    os.makedirs(d_path, exist_ok=True)
    names = ["em", "me", "mt", "mm", "recent"]
    for fn, name in zip(funcs, names):
        im = fn()
        im.save(f"{d_path}/{name}.png")

print("Saved all perfect styles.")
