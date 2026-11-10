from PIL import Image, ImageDraw, ImageFont
import os

ARTIFACT_DIR = '/home/c-dit/.gemini/antigravity/brain/b37a10f6-50b4-4228-8e93-ee7f96a440bd'

font_title = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 36)
font_sub = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 20)
font_sec = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 24)
font_lbl_ml = ImageFont.truetype('/usr/share/fonts/truetype/noto/NotoSansMalayalam-Bold.ttf', 19)
font_lbl_en = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 14)

# ====================================================================
# 1. Master Style Comparison Sheet
# ====================================================================
w, h = 1500, 1180
img = Image.new('RGB', (w, h), '#F9F6F1')
d = ImageDraw.Draw(img)

# Header
d.rectangle([0, 0, w, 120], fill='#2B2C51')
d.text((40, 24), 'BHASHAMITHRAM II — New Non-Rotating Badge Icon Styles', fill='#FFFFFF', font=font_title)
d.text((40, 76), 'Format: Crisp Static PNG (512x512) • Themed to Indigo (#2B2C51) & Teal (#009778)', fill='#43AC98', font=font_sub)

styles_def = [
    ('style_1', 'STYLE 1: Modern Squircle Linguistic Badges (Clean Direction Flow & Cultural Glyphs)'),
    ('style_2', 'STYLE 2: Solid Premium App Tiles (Rich Indigo & Teal Squircles with Inverted Glyphs)'),
    ('style_3', 'STYLE 3: Open Book Cultural Emblem (Literary Dictionary Motif & Bookmark Ribbon)'),
]

cols = [
    ('ഇംഗ്ലീഷ് - മലയാളം', 'English - Malayalam', 'em'),
    ('മലയാളം - ഇംഗ്ലീഷ്', 'Malayalam - English', 'me'),
    ('മലയാള നാനാർത്ഥം', 'Synonyms (വാക്കറിവ്)', 'mt'),
    ('മലയാളം - മലയാളം', 'Malayalam - Malayalam', 'mm'),
    ('സമീപകാല തിരയലുകൾ', 'Recent Searches (ചരിത്രം)', 'recent'),
]

row_y = 150
col_w = 240
pad_x = 40
start_x = 60
icon_sz = 170

for s_key, s_name in styles_def:
    d.rounded_rectangle([40, row_y, w - 40, row_y + 44], radius=10, fill='#ECE8E1')
    d.text((56, row_y + 10), s_name, fill='#2B2C51', font=font_sec)
    
    iy = row_y + 56
    for c_idx, (ml_lbl, en_lbl, fn) in enumerate(cols):
        cx = start_x + c_idx * (col_w + pad_x)
        
        # Card container
        d.rounded_rectangle([cx - 12, iy, cx + icon_sz + 12, iy + icon_sz + 60], radius=18, fill='#FFFFFF', outline='#DFDCD9', width=2)
        
        # Icon
        p = f'scratch/perfect_styles/{s_key}/{fn}.png'
        if os.path.exists(p):
            ico = Image.open(p).convert('RGBA')
            ico_res = ico.resize((icon_sz, icon_sz), Image.Resampling.LANCZOS)
            img.paste(ico_res, (cx, iy + 6), ico_res)
            
        d.text((cx, iy + icon_sz + 12), ml_lbl[:18], fill='#252425', font=font_lbl_ml)
        d.text((cx, iy + icon_sz + 36), en_lbl[:22], fill='#5F585F', font=font_lbl_en)
        
    row_y += icon_sz + 140

img.save(f'{ARTIFACT_DIR}/new_icon_styles_presentation.png')
print('Saved presentation to', f'{ARTIFACT_DIR}/new_icon_styles_presentation.png')


# ====================================================================
# 2. Home Screen Mockup with Style 1 & Style 2
# ====================================================================
def render_homescreen_mockup(style_key, style_name, out_filename):
    mw, mh = 480, 960
    phone = Image.new('RGB', (mw, mh), '#F9F6F1')
    pd = ImageDraw.Draw(phone)
    
    # Top indigo bar
    top_h = 135
    pd.rectangle([0, 0, mw, top_h], fill='#2B2C51')
    
    # Hamburger icon
    pd.line([(24, 52), (48, 52)], fill='#FFFFFF', width=3)
    pd.line([(24, 60), (48, 60)], fill='#FFFFFF', width=3)
    pd.line([(24, 68), (48, 68)], fill='#FFFFFF', width=3)
    
    # Title
    font_ht = ImageFont.truetype('/usr/share/fonts/truetype/noto/NotoSansMalayalam-ExtraBold.ttf', 24)
    font_cdit = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 12)
    
    ht_txt = 'ഭാഷാമിത്രം II'
    tb = pd.textbbox((0, 0), ht_txt, font=font_ht)
    pd.text(((mw - (tb[2]-tb[0])) // 2, 45), ht_txt, fill='#43AC98', font=font_ht)
    
    cdit_txt = 'Centre for Development of Imaging Technology (C-DIT)'
    cb = pd.textbbox((0, 0), cdit_txt, font=font_cdit)
    pd.text(((mw - (cb[2]-cb[0])) // 2, 90), cdit_txt, fill='#FFFFFF', font=font_cdit)
    
    # Settings icon on right
    pd.ellipse([mw - 50, 48, mw - 26, 72], outline='#FFFFFF', width=2)
    
    # Cards
    font_c_title = ImageFont.truetype('/usr/share/fonts/truetype/noto/NotoSansMalayalam-Bold.ttf', 18)
    font_c_sub = ImageFont.truetype('/usr/share/fonts/truetype/noto/NotoSansMalayalam-Bold.ttf', 14)
    font_chev = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 18)
    
    card_items = [
        ('ഇംഗ്ലീഷ് - മലയാളം', 'പദസേതു', 'em'),
        ('മലയാളം - ഇംഗ്ലീഷ്', 'ഭാഷാസേതു', 'me'),
        ('മലയാള നാനാർത്ഥം', 'വാക്കറിവ്', 'mt'),
        ('മലയാളം - മലയാളം', 'പദമിത്രം', 'mm'),
        ('സമീപകാല തിരയലുകൾ', '', 'recent'),
    ]
    
    cy = top_h + 20
    card_h = 105
    card_margin = 18
    
    for ml_title, ml_sub, fn in card_items:
        # Card background
        pd.rounded_rectangle([card_margin, cy, mw - card_margin, cy + card_h], radius=20, fill='#FEFEFE', outline='#DFDCD9', width=2)
        
        # Badge Container (48x48)
        bx = card_margin + 16
        by = cy + (card_h - 58) // 2
        pd.rounded_rectangle([bx, by, bx + 58, by + 58], radius=16, fill='#F7F7F9', outline='#E6E4E2', width=1)
        
        # Load and paste badge icon
        p = f'scratch/perfect_styles/{style_key}/{fn}.png'
        if os.path.exists(p):
            b_img = Image.open(p).convert('RGBA')
            b_res = b_img.resize((50, 50), Image.Resampling.LANCZOS)
            phone.paste(b_res, (bx + 4, by + 4), b_res)
            
        # Text
        tx = bx + 76
        if ml_sub:
            pd.text((tx, cy + 26), ml_title, fill='#252425', font=font_c_title)
            pd.text((tx, cy + 56), ml_sub, fill='#4B5563', font=font_c_sub)
        else:
            pd.text((tx, cy + 40), ml_title, fill='#252425', font=font_c_title)
            
        # Chevron right
        chx = mw - card_margin - 48
        chy = cy + (card_h - 36) // 2
        pd.rounded_rectangle([chx, chy, chx + 36, chy + 36], radius=18, fill='#E6F5F2')
        pd.text((chx + 12, chy + 6), '>', fill='#009778', font=font_chev)
        
        cy += card_h + 16
        
    phone.save(f'{ARTIFACT_DIR}/{out_filename}')
    print('Saved mockup:', f'{ARTIFACT_DIR}/{out_filename}')

render_homescreen_mockup('style_1', 'Style 1: Modern Squircle', 'homescreen_preview_style1.png')
render_homescreen_mockup('style_2', 'Style 2: Solid App Tiles', 'homescreen_preview_style2.png')
