import os
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
TEAL_BG = (235, 248, 245)    # #EBF8F5
INDIGO_BG = (238, 238, 248)  # #EEEEF8
WHITE = (255, 255, 255)
BORDER_GRAY = (223, 220, 217)

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
# SET A: "Bold Linguistic Duo" (Focused on Glyphs, No Clutter, High Legibility)
# ====================================================================
def set_a_em():
    # English -> Malayalam
    img = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 0))
    d = ImageDraw.Draw(img)
    # Squircle
    d.rounded_rectangle([20, 20, SIZE-20, SIZE-20], radius=110, fill=WHITE, outline=TEAL, width=18)
    d.rounded_rectangle([46, 46, SIZE-46, SIZE-46], radius=88, fill=TEAL_BG)
    
    # Left pill (Indigo) with 'A'
    d.rounded_rectangle([68, 120, 224, 392], radius=55, fill=INDIGO)
    font_a = ImageFont.truetype(EN_BOLD, 170)
    center_text(d, "A", font_a, [68, 120, 224, 392], WHITE)
    
    # Right pill (Teal) with 'അ'
    d.rounded_rectangle([288, 120, 444, 392], radius=55, fill=TEAL)
    font_mal = ImageFont.truetype(ML_EXTRABOLD, 150)
    center_text(d, "അ", font_mal, [288, 120, 444, 392], WHITE)
    
    # Sleek central translation bridge
    cy = 256
    d.rounded_rectangle([220, cy-28, 292, cy+28], radius=16, fill=WHITE, outline=BORDER_GRAY, width=4)
    # Arrow icon
    d.line([(236, cy), (266, cy)], fill=INDIGO, width=7)
    d.polygon([(264, cy-10), (278, cy), (264, cy+10)], fill=INDIGO)
    return img

def set_a_me():
    # Malayalam -> English
    img = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([20, 20, SIZE-20, SIZE-20], radius=110, fill=WHITE, outline=TEAL, width=18)
    d.rounded_rectangle([46, 46, SIZE-46, SIZE-46], radius=88, fill=TEAL_BG)
    
    # Left pill (Teal) with 'അ'
    d.rounded_rectangle([68, 120, 224, 392], radius=55, fill=TEAL)
    font_mal = ImageFont.truetype(ML_EXTRABOLD, 150)
    center_text(d, "അ", font_mal, [68, 120, 224, 392], WHITE)
    
    # Right pill (Indigo) with 'A'
    d.rounded_rectangle([288, 120, 444, 392], radius=55, fill=INDIGO)
    font_a = ImageFont.truetype(EN_BOLD, 170)
    center_text(d, "A", font_a, [288, 120, 444, 392], WHITE)
    
    # Central translation bridge
    cy = 256
    d.rounded_rectangle([220, cy-28, 292, cy+28], radius=16, fill=WHITE, outline=BORDER_GRAY, width=4)
    d.line([(236, cy), (266, cy)], fill=TEAL, width=7)
    d.polygon([(264, cy-10), (278, cy), (264, cy+10)], fill=TEAL)
    return img

def set_a_mt():
    # Malayalam Synonym (വാക്കറിവ്)
    img = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([20, 20, SIZE-20, SIZE-20], radius=110, fill=WHITE, outline=TEAL, width=18)
    d.rounded_rectangle([46, 46, SIZE-46, SIZE-46], radius=88, fill=TEAL_BG)
    
    # Central card container
    d.rounded_rectangle([106, 110, 406, 402], radius=65, fill=INDIGO)
    
    # Central bold glyph 'വാ'
    font_mal = ImageFont.truetype(ML_EXTRABOLD, 190)
    center_text(d, "വാ", font_mal, [106, 105, 406, 375], WHITE)
    
    # Multiple meanings indicator: 3 dots at bottom of card
    for x in [206, 256, 306]:
        d.ellipse([x-10, 345, x+10, 365], fill=LIGHT_TEAL)
        
    # Layered tabs behind container
    d.rounded_rectangle([72, 160, 106, 350], radius=12, fill=TEAL)
    d.rounded_rectangle([406, 160, 440, 350], radius=12, fill=TEAL)
    return img

def set_a_mm():
    # Malayalam -> Malayalam (പദമിത്രം)
    img = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([20, 20, SIZE-20, SIZE-20], radius=110, fill=WHITE, outline=TEAL, width=18)
    d.rounded_rectangle([46, 46, SIZE-46, SIZE-46], radius=88, fill=TEAL_BG)
    
    # Central card
    d.rounded_rectangle([106, 110, 406, 402], radius=65, fill=TEAL)
    
    # Large prominent 'അ'
    font_mal = ImageFont.truetype(ML_EXTRABOLD, 220)
    center_text(d, "അ", font_mal, [106, 95, 406, 385], WHITE)
    
    # Accent side bookmarks
    d.rounded_rectangle([72, 160, 106, 350], radius=12, fill=INDIGO)
    d.rounded_rectangle([406, 160, 440, 350], radius=12, fill=INDIGO)
    return img

def set_a_recent():
    # Recent Searches (ചരിത്രം) - Completely static bold clock & magnifier
    img = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([20, 20, SIZE-20, SIZE-20], radius=110, fill=WHITE, outline=TEAL, width=18)
    d.rounded_rectangle([46, 46, SIZE-46, SIZE-46], radius=88, fill=TEAL_BG)
    
    cx, cy, r = 240, 240, 120
    # Bold clock dial
    d.ellipse([cx-r, cy-r, cx+r, cy+r], fill=WHITE, outline=INDIGO, width=18)
    d.ellipse([cx-12, cy-12, cx+12, cy+12], fill=INDIGO)
    
    # Clock hands (static at 10:10)
    d.line([(cx, cy), (cx - 50, cy - 50)], fill=INDIGO, width=18)
    d.line([(cx, cy), (cx + 65, cy - 35)], fill=TEAL, width=16)
    
    # Cardinal ticks
    d.line([(cx, cy-r+10), (cx, cy-r+28)], fill=INDIGO, width=10)
    d.line([(cx+r-28, cy), (cx+r-10, cy)], fill=INDIGO, width=10)
    d.line([(cx, cy+r-28), (cx, cy+r-10)], fill=INDIGO, width=10)
    d.line([(cx-r+10, cy), (cx-r+28, cy)], fill=INDIGO, width=10)
    
    # Overlapping search magnifier
    mx, my, mr = 360, 350, 56
    d.ellipse([mx-mr, my-mr, mx+mr, my+mr], fill=WHITE, outline=TEAL, width=16)
    d.line([(mx+38, my+38), (mx+78, my+78)], fill=TEAL, width=22)
    return img

# ====================================================================
# SET B: "Solid Vibrant App Tiles" (Full Color Fill, Bold Inverted Glyphs)
# ====================================================================
def set_b_em():
    img = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 0))
    d = ImageDraw.Draw(img)
    # Solid Indigo squircle
    d.rounded_rectangle([20, 20, SIZE-20, SIZE-20], radius=110, fill=INDIGO)
    d.rounded_rectangle([38, 38, SIZE-38, SIZE-38], radius=95, outline=LIGHT_TEAL, width=6)
    
    # White card tile for 'A'
    d.rounded_rectangle([68, 120, 224, 392], radius=55, fill=WHITE)
    font_a = ImageFont.truetype(EN_BOLD, 170)
    center_text(d, "A", font_a, [68, 120, 224, 392], INDIGO)
    
    # Teal card tile for 'അ'
    d.rounded_rectangle([288, 120, 444, 392], radius=55, fill=TEAL)
    font_mal = ImageFont.truetype(ML_EXTRABOLD, 150)
    center_text(d, "അ", font_mal, [288, 120, 444, 392], WHITE)
    
    # Center Arrow
    cy = 256
    d.line([(232, cy), (268, cy)], fill=LIGHT_TEAL, width=10)
    d.polygon([(264, cy-12), (280, cy), (264, cy+12)], fill=LIGHT_TEAL)
    return img

def set_b_me():
    img = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 0))
    d = ImageDraw.Draw(img)
    # Solid Teal squircle
    d.rounded_rectangle([20, 20, SIZE-20, SIZE-20], radius=110, fill=TEAL)
    d.rounded_rectangle([38, 38, SIZE-38, SIZE-38], radius=95, outline=WHITE, width=6)
    
    # White tile for 'അ'
    d.rounded_rectangle([68, 120, 224, 392], radius=55, fill=WHITE)
    font_mal = ImageFont.truetype(ML_EXTRABOLD, 150)
    center_text(d, "അ", font_mal, [68, 120, 224, 392], TEAL)
    
    # Indigo tile for 'A'
    d.rounded_rectangle([288, 120, 444, 392], radius=55, fill=INDIGO)
    font_a = ImageFont.truetype(EN_BOLD, 170)
    center_text(d, "A", font_a, [288, 120, 444, 392], WHITE)
    
    # Center Arrow
    cy = 256
    d.line([(232, cy), (268, cy)], fill=WHITE, width=10)
    d.polygon([(264, cy-12), (280, cy), (264, cy+12)], fill=WHITE)
    return img

def set_b_mt():
    img = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([20, 20, SIZE-20, SIZE-20], radius=110, fill=INDIGO)
    d.rounded_rectangle([38, 38, SIZE-38, SIZE-38], radius=95, outline=LIGHT_TEAL, width=6)
    
    # Central white rounded squircle
    d.rounded_rectangle([106, 110, 406, 402], radius=65, fill=WHITE)
    font_mal = ImageFont.truetype(ML_EXTRABOLD, 200)
    center_text(d, "വാ", font_mal, [106, 105, 406, 375], INDIGO)
    
    # Meaning dots
    for x in [206, 256, 306]:
        d.ellipse([x-10, 345, x+10, 365], fill=TEAL)
    return img

def set_b_mm():
    img = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([20, 20, SIZE-20, SIZE-20], radius=110, fill=TEAL)
    d.rounded_rectangle([38, 38, SIZE-38, SIZE-38], radius=95, outline=WHITE, width=6)
    
    # Central white rounded squircle
    d.rounded_rectangle([106, 110, 406, 402], radius=65, fill=WHITE)
    font_mal = ImageFont.truetype(ML_EXTRABOLD, 230)
    center_text(d, "അ", font_mal, [106, 95, 406, 385], TEAL)
    return img

def set_b_recent():
    img = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([20, 20, SIZE-20, SIZE-20], radius=110, fill=INDIGO)
    d.rounded_rectangle([38, 38, SIZE-38, SIZE-38], radius=95, outline=LIGHT_TEAL, width=6)
    
    cx, cy, r = 256, 256, 130
    d.ellipse([cx-r, cy-r, cx+r, cy+r], fill=WHITE, outline=LIGHT_TEAL, width=14)
    d.ellipse([cx-12, cy-12, cx+12, cy+12], fill=INDIGO)
    
    d.line([(cx, cy), (cx - 52, cy - 52)], fill=INDIGO, width=18)
    d.line([(cx, cy), (cx + 68, cy - 36)], fill=TEAL, width=16)
    
    d.line([(cx, cy-r+10), (cx, cy-r+28)], fill=INDIGO, width=10)
    d.line([(cx+r-28, cy), (cx+r-10, cy)], fill=INDIGO, width=10)
    d.line([(cx, cy+r-28), (cx, cy+r-10)], fill=INDIGO, width=10)
    d.line([(cx-r+10, cy), (cx-r+28, cy)], fill=INDIGO, width=10)
    return img

# ====================================================================
# SET C: "Open Book & Grantha Emblem" (Cultural Literature Silhouette)
# ====================================================================
def set_c_em():
    img = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([20, 20, SIZE-20, SIZE-20], radius=110, fill=WHITE, outline=BORDER_GRAY, width=6)
    
    # Left page (Indigo)
    d.polygon([(70, 150), (250, 110), (250, 380), (70, 420)], fill=INDIGO)
    # Right page (Teal)
    d.polygon([(262, 110), (442, 150), (442, 420), (262, 380)], fill=TEAL)
    
    font_a = ImageFont.truetype(EN_BOLD, 150)
    center_text(d, "A", font_a, [70, 140, 250, 390], WHITE)
    
    font_mal = ImageFont.truetype(ML_EXTRABOLD, 130)
    center_text(d, "അ", font_mal, [262, 140, 442, 390], WHITE)
    return img

def set_c_me():
    img = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([20, 20, SIZE-20, SIZE-20], radius=110, fill=WHITE, outline=BORDER_GRAY, width=6)
    
    d.polygon([(70, 150), (250, 110), (250, 380), (70, 420)], fill=TEAL)
    d.polygon([(262, 110), (442, 150), (442, 420), (262, 380)], fill=INDIGO)
    
    font_mal = ImageFont.truetype(ML_EXTRABOLD, 130)
    center_text(d, "അ", font_mal, [70, 140, 250, 390], WHITE)
    
    font_a = ImageFont.truetype(EN_BOLD, 150)
    center_text(d, "A", font_a, [262, 140, 442, 390], WHITE)
    return img

def set_c_mt():
    img = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([20, 20, SIZE-20, SIZE-20], radius=110, fill=WHITE, outline=BORDER_GRAY, width=6)
    
    # Book silhouette
    d.polygon([(70, 150), (250, 110), (250, 380), (70, 420)], fill=INDIGO)
    d.polygon([(262, 110), (442, 150), (442, 420), (262, 380)], fill=INDIGO)
    
    # Bookmark ribbon
    d.polygon([(246, 110), (266, 110), (266, 310), (256, 290), (246, 310)], fill=TEAL)
    
    font_mal = ImageFont.truetype(ML_EXTRABOLD, 130)
    center_text(d, "വാ", font_mal, [70, 140, 250, 390], WHITE)
    center_text(d, "ക്", font_mal, [262, 140, 442, 390], WHITE)
    return img

def set_c_mm():
    img = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([20, 20, SIZE-20, SIZE-20], radius=110, fill=WHITE, outline=BORDER_GRAY, width=6)
    
    d.polygon([(70, 150), (250, 110), (250, 380), (70, 420)], fill=TEAL)
    d.polygon([(262, 110), (442, 150), (442, 420), (262, 380)], fill=TEAL)
    
    d.polygon([(246, 110), (266, 110), (266, 310), (256, 290), (246, 310)], fill=INDIGO)
    
    font_mal = ImageFont.truetype(ML_EXTRABOLD, 130)
    center_text(d, "അ", font_mal, [70, 140, 250, 390], WHITE)
    center_text(d, "അ", font_mal, [262, 140, 442, 390], WHITE)
    return img

def set_c_recent():
    img = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([20, 20, SIZE-20, SIZE-20], radius=110, fill=WHITE, outline=BORDER_GRAY, width=6)
    
    cx, cy, r = 240, 240, 115
    d.ellipse([cx-r, cy-r, cx+r, cy+r], fill=TEAL_BG, outline=TEAL, width=16)
    d.ellipse([cx-12, cy-12, cx+12, cy+12], fill=INDIGO)
    
    d.line([(cx, cy), (cx - 45, cy - 45)], fill=INDIGO, width=16)
    d.line([(cx, cy), (cx + 60, cy - 30)], fill=INDIGO, width=14)
    
    # Magnifier handle
    d.line([(cx+75, cy+75), (cx+140, cy+140)], fill=INDIGO, width=24)
    return img

# Save all
out_base = "scratch/bold_styles"
for key, funcs in [
    ("set_a", [set_a_em, set_a_me, set_a_mt, set_a_mm, set_a_recent]),
    ("set_b", [set_b_em, set_b_me, set_b_mt, set_b_mm, set_b_recent]),
    ("set_c", [set_c_em, set_c_me, set_c_mt, set_c_mm, set_c_recent])
]:
    p = f"{out_base}/{key}"
    os.makedirs(p, exist_ok=True)
    names = ["em", "me", "mt", "mm", "recent"]
    for fn, n in zip(funcs, names):
        im = fn()
        im.save(f"{p}/{n}.png")

print("Generated all bold styles.")
