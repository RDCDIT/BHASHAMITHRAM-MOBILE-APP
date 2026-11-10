from PIL import Image, ImageDraw, ImageFont
import os

ARTIFACT_DIR = '/home/c-dit/.gemini/antigravity/brain/b37a10f6-50b4-4228-8e93-ee7f96a440bd'

font_title = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 32)
font_sub = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 18)
font_sec = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 22)
font_lbl_ml = ImageFont.truetype('/usr/share/fonts/truetype/noto/NotoSansMalayalam-Bold.ttf', 18)
font_lbl_en = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 13)

# ====================================================================
# 1. Simple Badge Logos Showcase
# ====================================================================
w, h = 1500, 1150
img = Image.new('RGB', (w, h), '#F9F6F1')
d = ImageDraw.Draw(img)

# Header
d.rectangle([0, 0, w, 115], fill='#2B2C51')
d.text((40, 22), 'BHASHAMITHRAM II — Simple Logo Concepts', fill='#FFFFFF', font=font_title)
d.text((40, 72), 'Ultra-Clean, Minimalist Vector Logos • Zero Clutter • Pure Bhashamithram Palette', fill='#43AC98', font=font_sub)

styles_def = [
    ('col_1_open_book', 'CONCEPT 1: Pure Open-Book Logo (Classic Bhashamithram Bilingual Motif)'),
    ('col_2_circular_seal', 'CONCEPT 2: Modern Circular Seal Logo (Minimalist App Badges)'),
    ('col_3_floating_glyph', 'CONCEPT 3: Minimalist Floating Lettermark Logo (Clean Vector Glyphs)'),
]

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
icon_sz = 170

for s_key, s_name in styles_def:
    d.rounded_rectangle([40, row_y, w - 40, row_y + 42], radius=10, fill='#ECE8E1')
    d.text((56, row_y + 10), s_name, fill='#2B2C51', font=font_sec)
    
    iy = row_y + 54
    for c_idx, (ml_lbl, en_lbl, fn) in enumerate(cols):
        cx = start_x + c_idx * (col_w + pad_x)
        
        # White card backing
        d.rounded_rectangle([cx - 12, iy, cx + icon_sz + 12, iy + icon_sz + 60], radius=18, fill='#FFFFFF', outline='#DFDCD9', width=2)
        
        p = f'scratch/simple_logos/{s_key}/{fn}.png'
        if os.path.exists(p):
            ico = Image.open(p).convert('RGBA')
            ico_res = ico.resize((icon_sz, icon_sz), Image.Resampling.LANCZOS)
            img.paste(ico_res, (cx, iy + 6), ico_res)
            
        d.text((cx, iy + icon_sz + 12), ml_lbl[:18], fill='#252425', font=font_lbl_ml)
        d.text((cx, iy + icon_sz + 36), en_lbl[:24], fill='#5F585F', font=font_lbl_en)
        
    row_y += icon_sz + 135

out_comp = f'{ARTIFACT_DIR}/simple_badge_logos_comparison.png'
img.save(out_comp)
print('Saved badge logos comparison to', out_comp)


# ====================================================================
# 2. Simple App Icon Logo Showcase (Squircle vs Circle)
# ====================================================================
ai_w, ai_h = 1000, 600
ai_img = Image.new('RGB', (ai_w, ai_h), '#F9F6F1')
aid = ImageDraw.Draw(ai_img)

aid.rectangle([0, 0, ai_w, 100], fill='#2B2C51')
aid.text((40, 20), 'BHASHAMITHRAM II — Simplified App Icon Logos', fill='#FFFFFF', font=font_title)
aid.text((40, 65), 'Cleaned for Android & iOS Launchers (No clipping, crisp vectors)', fill='#43AC98', font=font_sub)

# Squircle
l1 = Image.open('scratch/simple_app_logo_squircle.png').resize((360, 360), Image.Resampling.LANCZOS)
ai_img.paste(l1, (100, 140), l1)
font_label = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 20)
aid.text((120, 525), 'Option 1: Modern Squircle', fill='#2B2C51', font=font_label)

# Circle
l2 = Image.open('scratch/simple_app_logo_circle.png').resize((360, 360), Image.Resampling.LANCZOS)
ai_img.paste(l2, (540, 140), l2)
aid.text((570, 525), 'Option 2: Circular Seal', fill='#2B2C51', font=font_label)

out_ai = f'{ARTIFACT_DIR}/simple_app_icon_logo_options.png'
ai_img.save(out_ai)
print('Saved app icon options to', out_ai)


# ====================================================================
# 3. Mobile Mockup with Concept 1 (Open Book) & Concept 2 (Circular Seal)
# ====================================================================
mock_w, mock_h = 1060, 1000
duo_screen = Image.new('RGB', (mock_w, mock_h), '#EAE6DF')
dp = ImageDraw.Draw(duo_screen)
font_phone_label = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 17)

def draw_single_phone(start_x_offset, style_key, label_title):
    mw, mh = 480, 920
    px0, py0 = start_x_offset, 55
    px1, py1 = px0 + mw, py0 + mh
    
    dp.rounded_rectangle([px0, py0, px1, py1], radius=32, fill='#F9F6F1', outline='#2B2C51', width=3)
    dp.text((px0 + 10, 20), label_title, fill='#2B2C51', font=font_phone_label)
    
    top_h = 130
    dp.rounded_rectangle([px0, py0, px1, py0 + top_h], radius=30, fill='#2B2C51')
    dp.rectangle([px0, py0 + 30, px1, py0 + top_h], fill='#2B2C51')
    
    # Hamburger
    dp.line([(px0 + 24, py0 + 50), (px0 + 48, py0 + 50)], fill='#FFFFFF', width=3)
    dp.line([(px0 + 24, py0 + 58), (px0 + 48, py0 + 58)], fill='#FFFFFF', width=3)
    dp.line([(px0 + 24, py0 + 66), (px0 + 48, py0 + 66)], fill='#FFFFFF', width=3)
    
    font_ht = ImageFont.truetype('/usr/share/fonts/truetype/noto/NotoSansMalayalam-ExtraBold.ttf', 24)
    font_ht_en = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 22)
    font_cdit = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 12)
    
    dp.text((px0 + 140, py0 + 44), 'ഭാഷാമിത്രം', fill='#43AC98', font=font_ht)
    dp.text((px0 + 285, py0 + 46), 'II', fill='#43AC98', font=font_ht_en)
    
    cdit_txt = 'Centre for Development of Imaging Technology (C-DIT)'
    cb = dp.textbbox((0, 0), cdit_txt, font=font_cdit)
    dp.text((px0 + (mw - (cb[2]-cb[0])) // 2, py0 + 88), cdit_txt, fill='#FFFFFF', font=font_cdit)
    
    dp.ellipse([px1 - 48, py0 + 48, px1 - 24, py0 + 72], outline='#FFFFFF', width=2)
    
    card_items = [
        ('ഇംഗ്ലീഷ് - മലയാളം', 'പദസേതു', 'em'),
        ('മലയാളം - ഇംഗ്ലീഷ്', 'ഭാഷാസേതു', 'me'),
        ('മലയാള നാനാർത്ഥം', 'വാക്കറിവ്', 'mt'),
        ('മലയാളം - മലയാളം', 'പദമിത്രം', 'mm'),
        ('സമീപകാല തിരയലുകൾ', '', 'recent'),
    ]
    
    font_c_title = ImageFont.truetype('/usr/share/fonts/truetype/noto/NotoSansMalayalam-Bold.ttf', 18)
    font_c_sub = ImageFont.truetype('/usr/share/fonts/truetype/noto/NotoSansMalayalam-Bold.ttf', 14)
    font_chev = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 18)
    
    cy = py0 + top_h + 18
    card_h = 100
    card_margin = 18
    
    for ml_title, ml_sub, fn in card_items:
        card_x0 = px0 + card_margin
        card_x1 = px1 - card_margin
        card_y0 = cy
        card_y1 = cy + card_h
        
        dp.rounded_rectangle([card_x0, card_y0, card_x1, card_y1], radius=20, fill='#FEFEFE', outline='#DFDCD9', width=2)
        
        # Badge Container (56x56)
        bx = card_x0 + 16
        by = card_y0 + (card_h - 56) // 2
        dp.rounded_rectangle([bx, by, bx + 56, by + 56], radius=16, fill='#F7F7F9', outline='#E6E4E2', width=1)
        
        p = f'scratch/simple_logos/{style_key}/{fn}.png'
        b_img = Image.open(p).convert('RGBA')
        b_res = b_img.resize((50, 50), Image.Resampling.LANCZOS)
        duo_screen.paste(b_res, (bx + 3, by + 3), b_res)
            
        tx = bx + 74
        if ml_sub:
            dp.text((tx, card_y0 + 24), ml_title, fill='#252425', font=font_c_title)
            dp.text((tx, card_y0 + 54), ml_sub, fill='#4B5563', font=font_c_sub)
        else:
            dp.text((tx, card_y0 + 38), ml_title, fill='#252425', font=font_c_title)
            
        chx = card_x1 - 46
        chy = card_y0 + (card_h - 36) // 2
        dp.rounded_rectangle([chx, chy, chx + 36, chy + 36], radius=18, fill='#E6F5F2')
        dp.text((chx + 12, chy + 6), '>', fill='#009778', font=font_chev)
        
        cy += card_h + 15

draw_single_phone(30, 'col_1_open_book', 'CONCEPT 1: Pure Open-Book Logo Badges')
draw_single_phone(550, 'col_2_circular_seal', 'CONCEPT 2: Modern Circular Seal Badges')

out_duo = f'{ARTIFACT_DIR}/homescreen_simple_logos_comparison.png'
duo_screen.save(out_duo)
print('Saved simple logos duo screen comparison to', out_duo)
