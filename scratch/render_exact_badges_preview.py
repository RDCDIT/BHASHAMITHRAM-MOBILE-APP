from PIL import Image, ImageDraw, ImageFont
import os

ARTIFACT_DIR = '/home/c-dit/.gemini/antigravity/brain/b37a10f6-50b4-4228-8e93-ee7f96a440bd'

font_title = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 30)
font_sub = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 17)
font_sec = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 20)
font_lbl_ml = ImageFont.truetype('/usr/share/fonts/truetype/noto/NotoSansMalayalam-Bold.ttf', 18)
font_lbl_en = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 13)

# 1. Comparison of individual badge icons
w, h = 1500, 480
img = Image.new('RGB', (w, h), '#F9F6F1')
d = ImageDraw.Draw(img)

# Header
d.rectangle([0, 0, w, 110], fill='#2B2C51')
d.text((40, 20), 'BHASHAMITHRAM II — New Badge Icons Matching Selected Style', fill='#FFFFFF', font=font_title)
d.text((40, 68), 'Modern Squircle • Indigo/Teal Dual Border • Bilingual Open Book Motif • High-Res PNG (512x512)', fill='#43AC98', font=font_sub)

cols = [
    ('ഇംഗ്ലീഷ് - മലയാളം', 'English - Malayalam', 'em'),
    ('മലയാളം - ഇംഗ്ലീഷ്', 'Malayalam - English', 'me'),
    ('മലയാള നാനാർത്ഥം', 'Synonyms / Meanings', 'mt'),
    ('മലയാളം - മലയാളം', 'Malayalam - Malayalam', 'mm'),
    ('സമീപകാല തിരയലുകൾ', 'Recent Searches / History', 'recent'),
]

row_y = 145
col_w = 240
pad_x = 40
start_x = 60
icon_sz = 175

for c_idx, (ml_lbl, en_lbl, fn) in enumerate(cols):
    cx = start_x + c_idx * (col_w + pad_x)
    
    # White card container
    d.rounded_rectangle([cx - 12, row_y, cx + icon_sz + 12, row_y + icon_sz + 65], radius=18, fill='#FFFFFF', outline='#DFDCD9', width=2)
    
    p = f'scratch/exact_badges/{fn}.png'
    if os.path.exists(p):
        ico = Image.open(p).convert('RGBA')
        ico_res = ico.resize((icon_sz, icon_sz), Image.Resampling.LANCZOS)
        img.paste(ico_res, (cx, row_y + 8), ico_res)
        
    d.text((cx, row_y + icon_sz + 16), ml_lbl[:18], fill='#252425', font=font_lbl_ml)
    d.text((cx, row_y + icon_sz + 40), en_lbl[:24], fill='#5F585F', font=font_lbl_en)

img.save(f'{ARTIFACT_DIR}/selected_style_badges_preview.png')
print('Saved badge preview to', f'{ARTIFACT_DIR}/selected_style_badges_preview.png')

# 2. Render Full Mobile Home Screen Preview with these badges
mw, mh = 480, 930
phone = Image.new('RGB', (mw, mh), '#F9F6F1')
pd = ImageDraw.Draw(phone)

# Top Indigo navbar
top_h = 130
pd.rectangle([0, 0, mw, top_h], fill='#2B2C51')

# Hamburger
pd.line([(24, 50), (48, 50)], fill='#FFFFFF', width=3)
pd.line([(24, 58), (48, 58)], fill='#FFFFFF', width=3)
pd.line([(24, 66), (48, 66)], fill='#FFFFFF', width=3)

# Header Title
font_ht = ImageFont.truetype('/usr/share/fonts/truetype/noto/NotoSansMalayalam-ExtraBold.ttf', 24)
font_ht_en = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 22)
font_cdit = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 12)

pd.text((140, 44), 'ഭാഷാമിത്രം', fill='#43AC98', font=font_ht)
pd.text((285, 46), 'II', fill='#43AC98', font=font_ht_en)

cdit_txt = 'Centre for Development of Imaging Technology (C-DIT)'
cb = pd.textbbox((0, 0), cdit_txt, font=font_cdit)
pd.text(((mw - (cb[2]-cb[0])) // 2, 88), cdit_txt, fill='#FFFFFF', font=font_cdit)

pd.ellipse([mw - 48, 48, mw - 24, 72], outline='#FFFFFF', width=2)

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

cy = top_h + 18
card_h = 100
card_margin = 18

for ml_title, ml_sub, fn in card_items:
    card_x0 = card_margin
    card_x1 = mw - card_margin
    card_y0 = cy
    card_y1 = cy + card_h
    
    # White card
    pd.rounded_rectangle([card_x0, card_y0, card_x1, card_y1], radius=20, fill='#FEFEFE', outline='#DFDCD9', width=2)
    
    # Badge (52x52)
    bx = card_x0 + 16
    by = card_y0 + (card_h - 52) // 2
    
    p = f'scratch/exact_badges/{fn}.png'
    b_img = Image.open(p).convert('RGBA')
    b_res = b_img.resize((52, 52), Image.Resampling.LANCZOS)
    phone.paste(b_res, (bx, by), b_res)
        
    tx = bx + 70
    if ml_sub:
        pd.text((tx, card_y0 + 24), ml_title, fill='#252425', font=font_c_title)
        pd.text((tx, card_y0 + 54), ml_sub, fill='#4B5563', font=font_c_sub)
    else:
        pd.text((tx, card_y0 + 38), ml_title, fill='#252425', font=font_c_title)
        
    # Chevron right
    chx = card_x1 - 46
    chy = card_y0 + (card_h - 36) // 2
    pd.rounded_rectangle([chx, chy, chx + 36, chy + 36], radius=18, fill='#E6F5F2')
    pd.text((chx + 12, chy + 6), '>', fill='#009778', font=font_chev)
    
    cy += card_h + 15

phone.save(f'{ARTIFACT_DIR}/homescreen_selected_badges_preview.png')
print('Saved mobile home screen preview to', f'{ARTIFACT_DIR}/homescreen_selected_badges_preview.png')
