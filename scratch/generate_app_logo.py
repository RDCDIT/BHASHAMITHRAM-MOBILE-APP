from PIL import Image, ImageDraw, ImageFont

SIZE = 1024

# Fonts
ML_EXTRABOLD = "/usr/share/fonts/truetype/noto/NotoSansMalayalam-ExtraBold.ttf"
ML_BOLD = "/usr/share/fonts/truetype/noto/NotoSansMalayalam-Bold.ttf"
EN_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

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

# -------------------------------------------------------------
# APP LOGO 1: Modern Minimalist Squircle App Icon (1024x1024)
# Clean open book with 'അ' & 'A'
# -------------------------------------------------------------
def make_simple_app_logo_squircle():
    img = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 0))
    d = ImageDraw.Draw(img)
    
    # Rounded Squircle base
    d.rounded_rectangle([48, 48, SIZE-48, SIZE-48], radius=230, fill=WHITE, outline=INDIGO, width=24)
    # Subtle inner border
    d.rounded_rectangle([80, 80, SIZE-80, SIZE-80], radius=200, outline=TEAL, width=8)
    
    # Open Book
    # Left page (Teal)
    d.polygon([(170, 240), (490, 180), (490, 680), (170, 750)], fill=TEAL)
    # Right page (Indigo)
    d.polygon([(525, 180), (845, 240), (845, 750), (525, 680)], fill=INDIGO)
    
    # Center ribbon
    d.polygon([(490, 680), (507, 720), (525, 680)], fill=LIGHT_TEAL)
    
    # Letter 'അ' on left page
    font_ml = ImageFont.truetype(ML_EXTRABOLD, 270)
    center_text(d, "അ", font_ml, [170, 230, 490, 700], WHITE)
    
    # Letter 'A' on right page
    font_en = ImageFont.truetype(EN_BOLD, 300)
    center_text(d, "A", font_en, [525, 230, 845, 700], WHITE)
    
    # Bottom Label: ഭാഷാമിത്രം II
    font_lbl = ImageFont.truetype(ML_BOLD, 64)
    font_lbl_en = ImageFont.truetype(EN_BOLD, 58)
    
    lbl_ml = "ഭാഷാമിത്രം"
    lbl_en = "II"
    
    tb = d.textbbox((0, 0), lbl_ml, font=font_lbl)
    eb = d.textbbox((0, 0), lbl_en, font=font_lbl_en)
    total_w = (tb[2]-tb[0]) + 16 + (eb[2]-eb[0])
    
    sx = (SIZE - total_w) // 2
    d.text((sx, 830), lbl_ml, fill=INDIGO, font=font_lbl)
    d.text((sx + (tb[2]-tb[0]) + 16, 835), lbl_en, fill=TEAL, font=font_lbl_en)
    return img

# -------------------------------------------------------------
# APP LOGO 2: Modern Circular Seal App Icon (1024x1024)
# -------------------------------------------------------------
def make_simple_app_logo_circle():
    img = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 0))
    d = ImageDraw.Draw(img)
    
    cx, cy, r = 512, 512, 470
    # Outer circle in white with double ring
    d.ellipse([cx-r, cy-r, cx+r, cy+r], fill=WHITE, outline=INDIGO, width=28)
    d.ellipse([cx-r+32, cy-r+32, cx+r-32, cy+r-32], outline=TEAL, width=12)
    
    # Open book
    d.polygon([(180, 260), (490, 200), (490, 660), (180, 730)], fill=TEAL)
    d.polygon([(525, 200), (835, 260), (835, 730), (525, 660)], fill=INDIGO)
    d.polygon([(490, 660), (507, 700), (525, 660)], fill=LIGHT_TEAL)
    
    font_ml = ImageFont.truetype(ML_EXTRABOLD, 260)
    center_text(d, "അ", font_ml, [180, 240, 490, 680], WHITE)
    
    font_en = ImageFont.truetype(EN_BOLD, 290)
    center_text(d, "A", font_en, [525, 240, 835, 680], WHITE)
    
    font_lbl = ImageFont.truetype(ML_BOLD, 64)
    font_lbl_en = ImageFont.truetype(EN_BOLD, 58)
    lbl_ml = "ഭാഷാമിത്രം"
    lbl_en = "II"
    tb = d.textbbox((0, 0), lbl_ml, font=font_lbl)
    eb = d.textbbox((0, 0), lbl_en, font=font_lbl_en)
    total_w = (tb[2]-tb[0]) + 16 + (eb[2]-eb[0])
    sx = (SIZE - total_w) // 2
    d.text((sx, 810), lbl_ml, fill=INDIGO, font=font_lbl)
    d.text((sx + (tb[2]-tb[0]) + 16, 815), lbl_en, fill=TEAL, font=font_lbl_en)
    return img

l1 = make_simple_app_logo_squircle()
l1.save("scratch/simple_app_logo_squircle.png")
l2 = make_simple_app_logo_circle()
l2.save("scratch/simple_app_logo_circle.png")
print("Saved simple app logos.")
