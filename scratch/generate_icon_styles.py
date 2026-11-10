import os
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

SIZE = 512

# Fonts
ML_EXTRABOLD = "/usr/share/fonts/truetype/noto/NotoSansMalayalam-ExtraBold.ttf"
ML_BOLD = "/usr/share/fonts/truetype/noto/NotoSansMalayalam-Bold.ttf"
EN_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
EN_EXTRABOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

# Colors from Palette
COLOR_INDIGO = (43, 44, 81)       # #2B2C51
COLOR_TEAL = (0, 151, 120)        # #009778
COLOR_TEAL_LIGHT = (67, 172, 152) # #43AC98
COLOR_TEAL_BG = (235, 248, 245)   # soft teal
COLOR_INDIGO_BG = (238, 238, 246) # soft indigo
COLOR_BG = (249, 246, 241)        # #F9F6F1
COLOR_WHITE = (255, 255, 255)
COLOR_BORDER = (223, 220, 217)    # #DFDCD9
COLOR_GRAY = (152, 158, 162)      # #989EA2

# -------------------------------------------------------------
# HELPER: Draw rounded rectangle
# -------------------------------------------------------------
def draw_rounded_rect(draw, bbox, radius, fill=None, outline=None, width=1):
    draw.rounded_rectangle(bbox, radius=radius, fill=fill, outline=outline, width=width)

# =============================================================
# STYLE 1: "Clean Modern Tile" (Static Crisp Squircle with Direction & Glyphs)
# =============================================================
def make_style_1_em():
    # English -> Malayalam
    img = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 0))
    d = ImageDraw.Draw(img)
    # Background squircle
    draw_rounded_rect(d, [24, 24, SIZE-24, SIZE-24], radius=110, fill=COLOR_WHITE, outline=COLOR_TEAL, width=18)
    # Subtle accent corner / header bar
    draw_rounded_rect(d, [60, 60, SIZE-60, SIZE-60], radius=80, fill=COLOR_TEAL_BG)
    
    font_l = ImageFont.truetype(EN_BOLD, 150)
    font_r = ImageFont.truetype(ML_EXTRABOLD, 140)
    font_arrow = ImageFont.truetype(EN_BOLD, 80)
    
    # Left 'A' (English) in Indigo
    d.text((120, 160), "A", fill=COLOR_INDIGO, font=font_l)
    # Arrow '➔' in Teal
    # Draw a clean geometric arrow
    arrow_y = 256
    d.line([(225, arrow_y), (285, arrow_y)], fill=COLOR_TEAL, width=14)
    d.polygon([(275, arrow_y - 20), (305, arrow_y), (275, arrow_y + 20)], fill=COLOR_TEAL)
    
    # Right 'അ' in Teal
    d.text((310, 160), "അ", fill=COLOR_TEAL, font=font_r)
    
    # Clean pill tag at bottom: EN ➔ ML
    draw_rounded_rect(d, [156, 380, 356, 430], radius=25, fill=COLOR_INDIGO)
    font_tag = ImageFont.truetype(EN_BOLD, 28)
    d.text((182, 389), "EN ➔ ML", fill=COLOR_WHITE, font=font_tag)
    return img

def make_style_1_me():
    # Malayalam -> English
    img = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 0))
    d = ImageDraw.Draw(img)
    draw_rounded_rect(d, [24, 24, SIZE-24, SIZE-24], radius=110, fill=COLOR_WHITE, outline=COLOR_TEAL, width=18)
    draw_rounded_rect(d, [60, 60, SIZE-60, SIZE-60], radius=80, fill=COLOR_TEAL_BG)
    
    font_l = ImageFont.truetype(ML_EXTRABOLD, 140)
    font_r = ImageFont.truetype(EN_BOLD, 150)
    
    # Left 'അ' in Teal
    d.text((105, 160), "അ", fill=COLOR_TEAL, font=font_l)
    # Arrow
    arrow_y = 256
    d.line([(225, arrow_y), (285, arrow_y)], fill=COLOR_INDIGO, width=14)
    d.polygon([(275, arrow_y - 20), (305, arrow_y), (275, arrow_y + 20)], fill=COLOR_INDIGO)
    
    # Right 'A' in Indigo
    d.text((320, 160), "A", fill=COLOR_INDIGO, font=font_r)
    
    # Tag
    draw_rounded_rect(d, [156, 380, 356, 430], radius=25, fill=COLOR_TEAL)
    font_tag = ImageFont.truetype(EN_BOLD, 28)
    d.text((182, 389), "ML ➔ EN", fill=COLOR_WHITE, font=font_tag)
    return img

def make_style_1_mt():
    # Malayalam Synonyms / Nanartham
    img = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 0))
    d = ImageDraw.Draw(img)
    draw_rounded_rect(d, [24, 24, SIZE-24, SIZE-24], radius=110, fill=COLOR_WHITE, outline=COLOR_TEAL, width=18)
    draw_rounded_rect(d, [60, 60, SIZE-60, SIZE-60], radius=80, fill=COLOR_TEAL_BG)
    
    # Central 'വാ' glyph (Word / Vakkarivu)
    font_center = ImageFont.truetype(ML_EXTRABOLD, 170)
    d.text((165, 130), "വാ", fill=COLOR_INDIGO, font=font_center)
    
    # Three stacked definition dots / lines on left & right
    for y in [190, 235, 280]:
        d.ellipse([100, y, 116, y+16], fill=COLOR_TEAL)
        d.line([(126, y+8), (145, y+8)], fill=COLOR_TEAL, width=8)
        
        d.ellipse([396, y, 412, y+16], fill=COLOR_TEAL)
        d.line([(367, y+8), (386, y+8)], fill=COLOR_TEAL, width=8)
        
    # Tag
    draw_rounded_rect(d, [140, 380, 372, 430], radius=25, fill=COLOR_INDIGO)
    font_tag = ImageFont.truetype(ML_BOLD, 26)
    d.text((160, 388), "നാനാർത്ഥം", fill=COLOR_WHITE, font=font_tag)
    return img

def make_style_1_mm():
    # Malayalam -> Malayalam
    img = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 0))
    d = ImageDraw.Draw(img)
    draw_rounded_rect(d, [24, 24, SIZE-24, SIZE-24], radius=110, fill=COLOR_WHITE, outline=COLOR_TEAL, width=18)
    draw_rounded_rect(d, [60, 60, SIZE-60, SIZE-60], radius=80, fill=COLOR_TEAL_BG)
    
    # Large prominent 'അ'
    font_main = ImageFont.truetype(ML_EXTRABOLD, 200)
    d.text((160, 110), "അ", fill=COLOR_INDIGO, font=font_main)
    
    # Open book accent at bottom-center
    book_w = 120
    bx = (SIZE - book_w) // 2
    by = 330
    # Left page
    d.polygon([(bx, by+10), (bx+book_w//2 - 5, by), (bx+book_w//2 - 5, by+30), (bx, by+40)], fill=COLOR_TEAL)
    # Right page
    d.polygon([(bx+book_w//2 + 5, by), (bx+book_w, by+10), (bx+book_w, by+40), (bx+book_w//2 + 5, by+30)], fill=COLOR_TEAL)
    
    # Tag
    draw_rounded_rect(d, [156, 380, 356, 430], radius=25, fill=COLOR_INDIGO)
    font_tag = ImageFont.truetype(EN_BOLD, 28)
    d.text((182, 389), "ML ➔ ML", fill=COLOR_WHITE, font=font_tag)
    return img

def make_style_1_recent():
    # Recent Searches (Clock + Magnifier - STATIC)
    img = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 0))
    d = ImageDraw.Draw(img)
    draw_rounded_rect(d, [24, 24, SIZE-24, SIZE-24], radius=110, fill=COLOR_WHITE, outline=COLOR_TEAL, width=18)
    draw_rounded_rect(d, [60, 60, SIZE-60, SIZE-60], radius=80, fill=COLOR_TEAL_BG)
    
    # Elegant Clock Face
    cx, cy, r = 240, 230, 95
    d.ellipse([cx-r, cy-r, cx+r, cy+r], outline=COLOR_INDIGO, width=16)
    # Center dot
    d.ellipse([cx-10, cy-10, cx+10, cy+10], fill=COLOR_INDIGO)
    # Clock hands (at 10:10)
    # Hour hand (pointing to 10)
    d.line([(cx, cy), (cx - 45, cy - 45)], fill=COLOR_INDIGO, width=14)
    # Minute hand (pointing to 2)
    d.line([(cx, cy), (cx + 55, cy - 35)], fill=COLOR_TEAL, width=12)
    # Tick marks at 12, 3, 6, 9
    d.line([(cx, cy-r+8), (cx, cy-r+22)], fill=COLOR_INDIGO, width=8)
    d.line([(cx+r-22, cy), (cx+r-8, cy)], fill=COLOR_INDIGO, width=8)
    d.line([(cx, cy+r-22), (cx, cy+r-8)], fill=COLOR_INDIGO, width=8)
    d.line([(cx-r+8, cy), (cx-r+22, cy)], fill=COLOR_INDIGO, width=8)
    
    # Magnifying Glass overlapping bottom-right
    mx, my, mr = 330, 310, 48
    d.ellipse([mx-mr, my-mr, mx+mr, my+mr], fill=COLOR_WHITE, outline=COLOR_TEAL, width=12)
    # Handle
    d.line([(mx+34, my+34), (mx+65, my+65)], fill=COLOR_TEAL, width=16)
    
    # Tag
    draw_rounded_rect(d, [156, 380, 356, 430], radius=25, fill=COLOR_INDIGO)
    font_tag = ImageFont.truetype(ML_BOLD, 26)
    d.text((195, 388), "ചരിത്രം", fill=COLOR_WHITE, font=font_tag)
    return img

# =============================================================
# STYLE 2: "Dual-Pill Minimalist" (Teal + Indigo Modern Capsules)
# =============================================================
def make_style_2_em():
    img = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 0))
    d = ImageDraw.Draw(img)
    # Two overlapping or side-by-side soft pill cards
    # Left pill (Indigo) with 'A'
    draw_rounded_rect(d, [50, 100, 240, 380], radius=70, fill=COLOR_INDIGO)
    font_l = ImageFont.truetype(EN_BOLD, 150)
    d.text((95, 150), "A", fill=COLOR_WHITE, font=font_l)
    
    # Right pill (Teal) with 'അ'
    draw_rounded_rect(d, [272, 100, 462, 380], radius=70, fill=COLOR_TEAL)
    font_r = ImageFont.truetype(ML_EXTRABOLD, 140)
    d.text((305, 150), "അ", fill=COLOR_WHITE, font=font_r)
    
    # Connecting badge in center
    draw_rounded_rect(d, [220, 220, 292, 260], radius=20, fill=COLOR_WHITE, outline=COLOR_BORDER, width=4)
    d.polygon([(242, 232), (270, 240), (242, 248)], fill=COLOR_INDIGO)
    
    # Subtitle label below
    font_sub = ImageFont.truetype(EN_BOLD, 30)
    d.text((170, 410), "ENGLISH ➔ ML", fill=COLOR_INDIGO, font=font_sub)
    return img

def make_style_2_me():
    img = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 0))
    d = ImageDraw.Draw(img)
    # Left pill (Teal) with 'അ'
    draw_rounded_rect(d, [50, 100, 240, 380], radius=70, fill=COLOR_TEAL)
    font_l = ImageFont.truetype(ML_EXTRABOLD, 140)
    d.text((82, 150), "അ", fill=COLOR_WHITE, font=font_l)
    
    # Right pill (Indigo) with 'A'
    draw_rounded_rect(d, [272, 100, 462, 380], radius=70, fill=COLOR_INDIGO)
    font_r = ImageFont.truetype(EN_BOLD, 150)
    d.text((315, 150), "A", fill=COLOR_WHITE, font=font_r)
    
    # Connecting badge in center
    draw_rounded_rect(d, [220, 220, 292, 260], radius=20, fill=COLOR_WHITE, outline=COLOR_BORDER, width=4)
    d.polygon([(242, 232), (270, 240), (242, 248)], fill=COLOR_TEAL)
    
    font_sub = ImageFont.truetype(EN_BOLD, 30)
    d.text((170, 410), "ML ➔ ENGLISH", fill=COLOR_TEAL, font=font_sub)
    return img

def make_style_2_mt():
    img = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 0))
    d = ImageDraw.Draw(img)
    # Pill with multi-branch or layered meanings
    draw_rounded_rect(d, [70, 100, 442, 380], radius=70, fill=COLOR_INDIGO)
    
    # Inner layered card
    draw_rounded_rect(d, [95, 125, 417, 355], radius=50, fill=COLOR_TEAL)
    
    font_m = ImageFont.truetype(ML_EXTRABOLD, 170)
    d.text((180, 135), "വാ", fill=COLOR_WHITE, font=font_m)
    
    font_sub = ImageFont.truetype(ML_BOLD, 30)
    d.text((170, 410), "നാനാർത്ഥങ്ങൾ", fill=COLOR_INDIGO, font=font_sub)
    return img

def make_style_2_mm():
    img = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 0))
    d = ImageDraw.Draw(img)
    # Large rounded squircle with dual 'അ'
    draw_rounded_rect(d, [50, 100, 240, 380], radius=70, fill=COLOR_INDIGO)
    font_l = ImageFont.truetype(ML_EXTRABOLD, 140)
    d.text((82, 150), "അ", fill=COLOR_WHITE, font=font_l)
    
    draw_rounded_rect(d, [272, 100, 462, 380], radius=70, fill=COLOR_INDIGO)
    font_r = ImageFont.truetype(ML_EXTRABOLD, 140)
    d.text((305, 150), "അ", fill=COLOR_WHITE, font=font_r)
    
    # Center hyphen / book icon
    draw_rounded_rect(d, [225, 225, 287, 255], radius=15, fill=COLOR_TEAL)
    
    font_sub = ImageFont.truetype(ML_BOLD, 30)
    d.text((140, 410), "മലയാളം നിഘണ്ടു", fill=COLOR_INDIGO, font=font_sub)
    return img

def make_style_2_recent():
    img = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 0))
    d = ImageDraw.Draw(img)
    # Solid teal rounded pill with crisp white clock
    draw_rounded_rect(d, [90, 80, 422, 390], radius=80, fill=COLOR_TEAL)
    
    cx, cy, r = 256, 235, 100
    d.ellipse([cx-r, cy-r, cx+r, cy+r], outline=COLOR_WHITE, width=16)
    d.ellipse([cx-10, cy-10, cx+10, cy+10], fill=COLOR_WHITE)
    # Clock hands
    d.line([(cx, cy), (cx - 45, cy - 45)], fill=COLOR_WHITE, width=16)
    d.line([(cx, cy), (cx + 55, cy - 25)], fill=COLOR_WHITE, width=14)
    
    font_sub = ImageFont.truetype(ML_BOLD, 30)
    d.text((170, 415), "സമീപകാല തിരയൽ", fill=COLOR_INDIGO, font=font_sub)
    return img

# =============================================================
# STYLE 3: "Solid App Tile" (Rich Solid Teal/Indigo Squircle with Inverted Glyphs)
# =============================================================
def make_style_3_em():
    img = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 0))
    d = ImageDraw.Draw(img)
    # Solid Indigo squircle with crisp inner border
    draw_rounded_rect(d, [28, 28, SIZE-28, SIZE-28], radius=110, fill=COLOR_INDIGO)
    draw_rounded_rect(d, [44, 44, SIZE-44, SIZE-44], radius=96, outline=COLOR_TEAL_LIGHT, width=6)
    
    # Large 'A' in white, 'അ' in vibrant teal
    font_l = ImageFont.truetype(EN_BOLD, 170)
    font_r = ImageFont.truetype(ML_EXTRABOLD, 160)
    d.text((95, 120), "A", fill=COLOR_WHITE, font=font_l)
    
    # Arrow
    arrow_y = 250
    d.line([(220, arrow_y), (275, arrow_y)], fill=COLOR_TEAL_LIGHT, width=14)
    d.polygon([(265, arrow_y - 18), (295, arrow_y), (265, arrow_y + 18)], fill=COLOR_TEAL_LIGHT)
    
    d.text((295, 120), "അ", fill=COLOR_TEAL_LIGHT, font=font_r)
    
    # White divider line
    d.line([(100, 360), (SIZE-100, 360)], fill=COLOR_TEAL_LIGHT, width=4)
    
    font_sub = ImageFont.truetype(EN_BOLD, 30)
    d.text((150, 385), "ENGLISH ➔ ML", fill=COLOR_WHITE, font=font_sub)
    return img

def make_style_3_me():
    img = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 0))
    d = ImageDraw.Draw(img)
    # Solid Teal squircle
    draw_rounded_rect(d, [28, 28, SIZE-28, SIZE-28], radius=110, fill=COLOR_TEAL)
    draw_rounded_rect(d, [44, 44, SIZE-44, SIZE-44], radius=96, outline=COLOR_WHITE, width=4)
    
    font_l = ImageFont.truetype(ML_EXTRABOLD, 160)
    font_r = ImageFont.truetype(EN_BOLD, 170)
    d.text((85, 120), "അ", fill=COLOR_WHITE, font=font_l)
    
    arrow_y = 250
    d.line([(225, arrow_y), (280, arrow_y)], fill=COLOR_WHITE, width=14)
    d.polygon([(270, arrow_y - 18), (300, arrow_y), (270, arrow_y + 18)], fill=COLOR_WHITE)
    
    d.text((310, 120), "A", fill=COLOR_WHITE, font=font_r)
    
    d.line([(100, 360), (SIZE-100, 360)], fill=COLOR_WHITE, width=4)
    
    font_sub = ImageFont.truetype(EN_BOLD, 30)
    d.text((150, 385), "ML ➔ ENGLISH", fill=COLOR_WHITE, font=font_sub)
    return img

def make_style_3_mt():
    img = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 0))
    d = ImageDraw.Draw(img)
    draw_rounded_rect(d, [28, 28, SIZE-28, SIZE-28], radius=110, fill=COLOR_INDIGO)
    draw_rounded_rect(d, [44, 44, SIZE-44, SIZE-44], radius=96, outline=COLOR_TEAL_LIGHT, width=6)
    
    font_m = ImageFont.truetype(ML_EXTRABOLD, 190)
    d.text((155, 100), "വാ", fill=COLOR_WHITE, font=font_m)
    
    # 3 bullets
    for i, x in enumerate([180, 256, 332]):
        d.ellipse([x-12, 310, x+12, 334], fill=COLOR_TEAL_LIGHT)
        
    d.line([(100, 360), (SIZE-100, 360)], fill=COLOR_TEAL_LIGHT, width=4)
    
    font_sub = ImageFont.truetype(ML_BOLD, 30)
    d.text((165, 385), "നാനാർത്ഥം", fill=COLOR_WHITE, font=font_sub)
    return img

def make_style_3_mm():
    img = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 0))
    d = ImageDraw.Draw(img)
    draw_rounded_rect(d, [28, 28, SIZE-28, SIZE-28], radius=110, fill=COLOR_TEAL)
    draw_rounded_rect(d, [44, 44, SIZE-44, SIZE-44], radius=96, outline=COLOR_WHITE, width=4)
    
    font_m = ImageFont.truetype(ML_EXTRABOLD, 220)
    d.text((155, 80), "അ", fill=COLOR_WHITE, font=font_m)
    
    d.line([(100, 360), (SIZE-100, 360)], fill=COLOR_WHITE, width=4)
    
    font_sub = ImageFont.truetype(ML_BOLD, 30)
    d.text((170, 385), "പദമിത്രം", fill=COLOR_WHITE, font=font_sub)
    return img

def make_style_3_recent():
    img = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 0))
    d = ImageDraw.Draw(img)
    draw_rounded_rect(d, [28, 28, SIZE-28, SIZE-28], radius=110, fill=COLOR_INDIGO)
    draw_rounded_rect(d, [44, 44, SIZE-44, SIZE-44], radius=96, outline=COLOR_TEAL_LIGHT, width=6)
    
    cx, cy, r = 256, 210, 95
    d.ellipse([cx-r, cy-r, cx+r, cy+r], outline=COLOR_WHITE, width=16)
    d.ellipse([cx-10, cy-10, cx+10, cy+10], fill=COLOR_WHITE)
    # Clock hands
    d.line([(cx, cy), (cx - 45, cy - 45)], fill=COLOR_WHITE, width=16)
    d.line([(cx, cy), (cx + 55, cy - 25)], fill=COLOR_TEAL_LIGHT, width=14)
    
    d.line([(100, 360), (SIZE-100, 360)], fill=COLOR_TEAL_LIGHT, width=4)
    font_sub = ImageFont.truetype(ML_BOLD, 30)
    d.text((190, 385), "ചരിത്രം", fill=COLOR_WHITE, font=font_sub)
    return img

# =============================================================
# STYLE 4: "Heritage Kerala Grantha / Book Badge" (Cultural Literary Symbolism)
# =============================================================
def make_style_4_em():
    img = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 0))
    d = ImageDraw.Draw(img)
    # Soft cream squircle with double border
    draw_rounded_rect(d, [24, 24, SIZE-24, SIZE-24], radius=100, fill=(255, 255, 255), outline=COLOR_INDIGO, width=8)
    draw_rounded_rect(d, [40, 40, SIZE-40, SIZE-40], radius=85, outline=COLOR_TEAL, width=4)
    
    # Open book silhouette
    # Left page
    d.polygon([(90, 160), (250, 130), (250, 340), (90, 360)], fill=COLOR_INDIGO)
    # Right page
    d.polygon([(262, 130), (422, 160), (422, 360), (262, 340)], fill=COLOR_TEAL)
    
    font_l = ImageFont.truetype(EN_BOLD, 120)
    font_r = ImageFont.truetype(ML_EXTRABOLD, 110)
    d.text((135, 175), "A", fill=COLOR_WHITE, font=font_l)
    d.text((305, 180), "അ", fill=COLOR_WHITE, font=font_r)
    
    font_sub = ImageFont.truetype(ML_BOLD, 28)
    d.text((160, 400), "പദസേതു (EN-ML)", fill=COLOR_INDIGO, font=font_sub)
    return img

def make_style_4_me():
    img = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 0))
    d = ImageDraw.Draw(img)
    draw_rounded_rect(d, [24, 24, SIZE-24, SIZE-24], radius=100, fill=(255, 255, 255), outline=COLOR_INDIGO, width=8)
    draw_rounded_rect(d, [40, 40, SIZE-40, SIZE-40], radius=85, outline=COLOR_TEAL, width=4)
    
    d.polygon([(90, 160), (250, 130), (250, 340), (90, 360)], fill=COLOR_TEAL)
    d.polygon([(262, 130), (422, 160), (422, 360), (262, 340)], fill=COLOR_INDIGO)
    
    font_l = ImageFont.truetype(ML_EXTRABOLD, 110)
    font_r = ImageFont.truetype(EN_BOLD, 120)
    d.text((130, 180), "അ", fill=COLOR_WHITE, font=font_l)
    d.text((310, 175), "A", fill=COLOR_WHITE, font=font_r)
    
    font_sub = ImageFont.truetype(ML_BOLD, 28)
    d.text((150, 400), "ഭാഷാസേതു (ML-EN)", fill=COLOR_TEAL, font=font_sub)
    return img

def make_style_4_mt():
    img = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 0))
    d = ImageDraw.Draw(img)
    draw_rounded_rect(d, [24, 24, SIZE-24, SIZE-24], radius=100, fill=(255, 255, 255), outline=COLOR_INDIGO, width=8)
    draw_rounded_rect(d, [40, 40, SIZE-40, SIZE-40], radius=85, outline=COLOR_TEAL, width=4)
    
    # Layered book / grantha
    # Bottom page shadow
    d.polygon([(110, 190), (402, 190), (382, 350), (90, 350)], fill=(220, 220, 230))
    # Top grantha leaf
    d.polygon([(100, 150), (412, 150), (402, 320), (90, 320)], fill=COLOR_INDIGO)
    
    font_m = ImageFont.truetype(ML_EXTRABOLD, 130)
    d.text((200, 160), "വാ", fill=COLOR_WHITE, font=font_m)
    
    font_sub = ImageFont.truetype(ML_BOLD, 28)
    d.text((180, 400), "വാക്കറിവ്", fill=COLOR_INDIGO, font=font_sub)
    return img

def make_style_4_mm():
    img = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 0))
    d = ImageDraw.Draw(img)
    draw_rounded_rect(d, [24, 24, SIZE-24, SIZE-24], radius=100, fill=(255, 255, 255), outline=COLOR_INDIGO, width=8)
    draw_rounded_rect(d, [40, 40, SIZE-40, SIZE-40], radius=85, outline=COLOR_TEAL, width=4)
    
    d.polygon([(90, 160), (250, 130), (250, 340), (90, 360)], fill=COLOR_INDIGO)
    d.polygon([(262, 130), (422, 160), (422, 360), (262, 340)], fill=COLOR_INDIGO)
    
    font_l = ImageFont.truetype(ML_EXTRABOLD, 110)
    font_r = ImageFont.truetype(ML_EXTRABOLD, 110)
    d.text((130, 180), "അ", fill=COLOR_WHITE, font=font_l)
    d.text((305, 180), "അ", fill=COLOR_WHITE, font=font_r)
    
    # Bookmark ribbon in center
    d.polygon([(250, 130), (262, 130), (262, 280), (256, 260), (250, 280)], fill=COLOR_TEAL)
    
    font_sub = ImageFont.truetype(ML_BOLD, 28)
    d.text((180, 400), "പദമിത്രം", fill=COLOR_INDIGO, font=font_sub)
    return img

def make_style_4_recent():
    img = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 0))
    d = ImageDraw.Draw(img)
    draw_rounded_rect(d, [24, 24, SIZE-24, SIZE-24], radius=100, fill=(255, 255, 255), outline=COLOR_INDIGO, width=8)
    draw_rounded_rect(d, [40, 40, SIZE-40, SIZE-40], radius=85, outline=COLOR_TEAL, width=4)
    
    # Modern magnifying glass with embedded clock hands
    cx, cy, r = 240, 220, 85
    d.ellipse([cx-r, cy-r, cx+r, cy+r], fill=COLOR_TEAL_BG, outline=COLOR_TEAL, width=16)
    # Clock hands inside
    d.line([(cx, cy), (cx - 35, cy - 35)], fill=COLOR_INDIGO, width=12)
    d.line([(cx, cy), (cx + 45, cy - 20)], fill=COLOR_INDIGO, width=10)
    d.ellipse([cx-8, cy-8, cx+8, cy+8], fill=COLOR_INDIGO)
    # Handle
    d.line([(cx+60, cy+60), (cx+115, cy+115)], fill=COLOR_INDIGO, width=22)
    
    font_sub = ImageFont.truetype(ML_BOLD, 28)
    d.text((185, 400), "ചരിത്രം", fill=COLOR_INDIGO, font=font_sub)
    return img

# Run generation
styles = {
    "style_1": {
        "name": "Style 1: Clean Modern Tiles (Crisp Squircle, Linguistic Glyphs & Badges)",
        "em": make_style_1_em(), "me": make_style_1_me(), "mt": make_style_1_mt(), "mm": make_style_1_mm(), "recent": make_style_1_recent()
    },
    "style_2": {
        "name": "Style 2: Dual-Pill Minimalist (Contrasting Indigo & Teal Capsules)",
        "em": make_style_2_em(), "me": make_style_2_me(), "mt": make_style_2_mt(), "mm": make_style_2_mm(), "recent": make_style_2_recent()
    },
    "style_3": {
        "name": "Style 3: Solid Premium App Tiles (Rich Solid Backgrounds with Inverted Glyphs)",
        "em": make_style_3_em(), "me": make_style_3_me(), "mt": make_style_3_mt(), "mm": make_style_3_mm(), "recent": make_style_3_recent()
    },
    "style_4": {
        "name": "Style 4: Kerala Heritage Book Motif (Bilingual Grantha Pages & Ribbon)",
        "em": make_style_4_em(), "me": make_style_4_me(), "mt": make_style_4_mt(), "mm": make_style_4_mm(), "recent": make_style_4_recent()
    }
}

os.makedirs("scratch/styles_preview", exist_ok=True)
for s_key, s_data in styles.items():
    s_dir = f"scratch/styles_preview/{s_key}"
    os.makedirs(s_dir, exist_ok=True)
    for k in ["em", "me", "mt", "mm", "recent"]:
        s_data[k].save(f"{s_dir}/{k}.png")

print("All style icons generated successfully.")
