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

# 1. Malayalam -> English (ME)
def make_me():
    img, d = draw_base_squircle()
    
    # Book geometry (Spine at 256):
    left_page = [(85, 135), (248, 95), (248, 405), (85, 445)]
    d.polygon(left_page, fill=TEAL)
    
    right_page = [(264, 95), (427, 135), (427, 445), (264, 405)]
    d.polygon(right_page, fill=INDIGO)
    
    d.polygon([(248, 405), (256, 428), (264, 405)], fill=LIGHT_TEAL)
    
    # Left page: 'അ' (fitted inside page)
    font_ml = ImageFont.truetype(ML_EXTRABOLD, 140)
    center_text(d, "അ", font_ml, [90, 130, 246, 410], WHITE)
    
    # Right page: 'A'
    font_en = ImageFont.truetype(EN_BOLD, 155)
    center_text(d, "A", font_en, [266, 130, 422, 410], WHITE)
    return img

# 2. English -> Malayalam (EM)
def make_em():
    img, d = draw_base_squircle()
    
    left_page = [(85, 135), (248, 95), (248, 405), (85, 445)]
    d.polygon(left_page, fill=TEAL)
    
    right_page = [(264, 95), (427, 135), (427, 445), (264, 405)]
    d.polygon(right_page, fill=INDIGO)
    
    d.polygon([(248, 405), (256, 428), (264, 405)], fill=LIGHT_TEAL)
    
    font_en = ImageFont.truetype(EN_BOLD, 155)
    center_text(d, "A", font_en, [90, 130, 246, 410], WHITE)
    
    font_ml = ImageFont.truetype(ML_EXTRABOLD, 140)
    center_text(d, "അ", font_ml, [266, 130, 422, 410], WHITE)
    return img

# 3. Malayalam -> Malayalam (MM)
def make_mm():
    img, d = draw_base_squircle()
    
    left_page = [(85, 135), (248, 95), (248, 405), (85, 445)]
    d.polygon(left_page, fill=TEAL)
    
    right_page = [(264, 95), (427, 135), (427, 445), (264, 405)]
    d.polygon(right_page, fill=INDIGO)
    
    d.polygon([(248, 405), (256, 428), (264, 405)], fill=LIGHT_TEAL)
    
    font_ml = ImageFont.truetype(ML_EXTRABOLD, 140)
    center_text(d, "അ", font_ml, [90, 130, 246, 410], WHITE)
    center_text(d, "അ", font_ml, [266, 130, 422, 410], WHITE)
    return img

# 4. Malayalam Synonym (MT / Nanartham / Vakkarivu)
def make_mt():
    img, d = draw_base_squircle()
    
    left_page = [(85, 135), (248, 95), (248, 405), (85, 445)]
    d.polygon(left_page, fill=TEAL)
    
    right_page = [(264, 95), (427, 135), (427, 445), (264, 405)]
    d.polygon(right_page, fill=INDIGO)
    
    d.polygon([(248, 405), (256, 428), (264, 405)], fill=LIGHT_TEAL)
    
    font_ml = ImageFont.truetype(ML_EXTRABOLD, 135)
    center_text(d, "വാ", font_ml, [90, 130, 246, 410], WHITE)
    
    # 3 layered definition lines on right page
    for y in [185, 250, 315]:
        d.rounded_rectangle([295, y, 395, y + 24], radius=10, fill=WHITE)
    return img

# 5. Recent Searches / History
def make_recent():
    img, d = draw_base_squircle()
    
    cx, cy, r = 256, 256, 130
    d.ellipse([cx-r, cy-r, cx+r, cy+r], fill=WHITE, outline=TEAL, width=18)
    d.ellipse([cx-14, cy-14, cx+14, cy+14], fill=INDIGO)
    
    # Hands at 10:10
    d.line([(cx, cy), (cx - 52, cy - 52)], fill=INDIGO, width=18)
    d.line([(cx, cy), (cx + 68, cy - 34)], fill=LIGHT_TEAL, width=16)
    
    d.line([(cx, cy-r+10), (cx, cy-r+28)], fill=INDIGO, width=10)
    d.line([(cx+r-28, cy), (cx+r-10, cy)], fill=INDIGO, width=10)
    d.line([(cx, cy+r-28), (cx, cy+r-10)], fill=INDIGO, width=10)
    d.line([(cx-r+10, cy), (cx-r+28, cy)], fill=INDIGO, width=10)
    return img

os.makedirs("scratch/exact_badges_refined", exist_ok=True)
make_me().save("scratch/exact_badges_refined/me.png")
make_em().save("scratch/exact_badges_refined/em.png")
make_mm().save("scratch/exact_badges_refined/mm.png")
make_mt().save("scratch/exact_badges_refined/mt.png")
make_recent().save("scratch/exact_badges_refined/recent.png")

print("Generated refined exact badges.")
